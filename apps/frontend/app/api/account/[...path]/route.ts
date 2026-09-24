import { NextRequest } from "next/server"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import {
  auth,
  authDb,
  ensureAuthInfrastructure,
} from "../../../../lib/auth-server"
import {
  categories,
  cities,
  userCategoryInterests,
  userCityInterests,
  userProfiles,
} from "../../../../lib/auth-schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const defaultCategories = [
  ["Business & Entrepreneurship", "business-entrepreneurship"],
  ["Technology & AI", "technology-ai"],
  ["Design & Creativity", "design-creativity"],
  ["Food & Dining", "food-dining"],
  ["Property & Real Estate", "property-real-estate"],
  ["Health & Wellness", "health-wellness"],
  ["Fashion & Beauty", "fashion-beauty"],
  ["Culture & Entertainment", "culture-entertainment"],
  ["Travel & Hospitality", "travel-hospitality"],
  ["Finance & Investing", "finance-investing"],
  ["Careers & Work", "careers-work"],
  ["Community & Events", "community-events"],
] as const

function json(data: unknown, status = 200) {
  return Response.json(data, { status })
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function decode(value: string | null) {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function detectLocation(request: NextRequest) {
  const city =
    decode(request.headers.get("x-vercel-ip-city")) ??
    decode(request.headers.get("cf-ipcity")) ??
    decode(request.headers.get("x-geo-city"))

  const region =
    decode(request.headers.get("x-vercel-ip-country-region")) ??
    decode(request.headers.get("cf-region")) ??
    decode(request.headers.get("x-geo-region"))

  const countryCode =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-geo-country")

  return {
    city,
    region,
    countryCode: countryCode?.toUpperCase() ?? null,
    source: request.headers.get("x-vercel-ip-country")
      ? "vercel"
      : request.headers.get("cf-ipcountry")
        ? "cloudflare"
        : city || region || countryCode
          ? "proxy"
          : null,
  }
}

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  })
}

async function ensureCategories() {
  await authDb
    .insert(categories)
    .values(defaultCategories.map(([name, slug]) => ({ name, slug })))
    .onConflictDoNothing()
}

async function ensureProfile(userId: string, request: NextRequest) {
  const [existing] = await authDb
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  if (existing) return existing

  const location = detectLocation(request)
  const [created] = await authDb
    .insert(userProfiles)
    .values({
      userId,
      detectedCity: location.city,
      detectedRegion: location.region,
      detectedCountryCode: location.countryCode,
      locationSource: location.source,
    })
    .returning()

  return created
}

function endpoint(request: NextRequest) {
  return request.nextUrl.pathname
    .replace(/^\/api\/account\/?/, "")
    .replace(/\/+$/, "")
}

export async function GET(request: NextRequest) {
  try {
    await ensureAuthInfrastructure()

    if (endpoint(request) === "health") {
      await authDb.execute(sql`select 1`)
      return json({ ok: true, service: "xpomag-auth", origin: request.nextUrl.origin })
    }

    const session = await getSession(request)
    if (!session?.user) {
      return json(
        {
          error: "UNAUTHENTICATED",
          message: "No authenticated XPOMAG session was found.",
        },
        401,
      )
    }

    const profile = await ensureProfile(session.user.id, request)

    if (endpoint(request) === "status") {
      return json({
        user: session.user,
        verified: Boolean(profile.emailVerifiedAt),
        onboardingCompleted: Boolean(profile.onboardingCompletedAt),
      })
    }

    if (endpoint(request) === "onboarding") {
      if (!profile.emailVerifiedAt) {
        return json(
          {
            error: "EMAIL_VERIFICATION_REQUIRED",
            message: "Verify your email before onboarding.",
          },
          403,
        )
      }

      await ensureCategories()

      const availableCategories = await authDb
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(eq(categories.active, true))
        .orderBy(asc(categories.name))

      const selectedCities = await authDb
        .select({
          id: cities.id,
          name: cities.name,
          region: cities.region,
          countryCode: cities.countryCode,
          isPrimary: userCityInterests.isPrimary,
        })
        .from(userCityInterests)
        .innerJoin(cities, eq(userCityInterests.cityId, cities.id))
        .where(eq(userCityInterests.userId, session.user.id))

      const selectedCategories = await authDb
        .select({ id: userCategoryInterests.categoryId })
        .from(userCategoryInterests)
        .where(eq(userCategoryInterests.userId, session.user.id))

      return json({
        detectedLocation: {
          city: profile.detectedCity,
          region: profile.detectedRegion,
          countryCode: profile.detectedCountryCode,
          source: profile.locationSource,
        },
        selectedCities,
        selectedCategoryIds: selectedCategories.map((item) => item.id),
        categories: availableCategories,
      })
    }

    return json({ error: "NOT_FOUND", message: "Unknown account endpoint." }, 404)
  } catch (error) {
    console.error("[XPOMAG account] GET failed", error)
    return json(
      {
        error: "ACCOUNT_API_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "The account service could not complete the request.",
      },
      500,
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAuthInfrastructure()

    const session = await getSession(request)
    if (!session?.user) {
      return json(
        {
          error: "UNAUTHENTICATED",
          message: "Sign in before continuing.",
        },
        401,
      )
    }

    const path = endpoint(request)

    if (path === "send-verification-code") {
      const profile = await ensureProfile(session.user.id, request)

      if (profile.emailVerifiedAt) {
        return json({ ok: true, alreadyVerified: true })
      }

      await auth.api.sendVerificationOTP({
        body: {
          email: session.user.email,
          type: "email-verification",
        },
      })

      return json({ ok: true, email: session.user.email })
    }

    if (path === "verify-email-code") {
      const body = await request.json().catch(() => ({}))
      const otp = String(body?.otp ?? "").trim()

      if (!/^\d{6}$/.test(otp)) {
        return json(
          {
            error: "INVALID_CODE_FORMAT",
            message: "Enter the 6-digit verification code.",
          },
          400,
        )
      }

      await auth.api.verifyEmailOTP({
        body: {
          email: session.user.email,
          otp,
        },
      })

      await authDb
        .insert(userProfiles)
        .values({
          userId: session.user.id,
          emailVerifiedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: { emailVerifiedAt: new Date() },
        })

      return json({ ok: true })
    }

    if (path === "onboarding") {
      const profile = await ensureProfile(session.user.id, request)
      if (!profile.emailVerifiedAt) {
        return json(
          {
            error: "EMAIL_VERIFICATION_REQUIRED",
            message: "Verify your email before onboarding.",
          },
          403,
        )
      }

      await ensureCategories()
      const body = await request.json().catch(() => ({}))

      const cityInputs = Array.isArray(body?.cities) ? body.cities.slice(0, 10) : []
      const categoryIds = Array.isArray(body?.categoryIds)
        ? body.categoryIds.map(String).slice(0, 12)
        : []

      const normalizedCities = cityInputs
        .map((item: any) => ({
          name: String(item?.name ?? "").trim().slice(0, 120),
          region: item?.region
            ? String(item.region).trim().slice(0, 120)
            : null,
          countryCode: item?.countryCode
            ? String(item.countryCode).trim().slice(0, 8).toUpperCase()
            : null,
          isPrimary: Boolean(item?.isPrimary),
          source: item?.source === "detected" ? "detected" : "selected",
        }))
        .filter((item: any) => item.name.length >= 2)

      if (!normalizedCities.length) {
        return json(
          {
            error: "SELECT_AT_LEAST_ONE_CITY",
            message: "Choose at least one city.",
          },
          400,
        )
      }

      if (!categoryIds.length) {
        return json(
          {
            error: "SELECT_AT_LEAST_ONE_CATEGORY",
            message: "Choose at least one category.",
          },
          400,
        )
      }

      const validCategories = await authDb
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(
            eq(categories.active, true),
            inArray(categories.id, categoryIds),
          ),
        )

      if (!validCategories.length) {
        return json(
          { error: "INVALID_CATEGORIES", message: "Choose valid interests." },
          400,
        )
      }

      await authDb.transaction(async (tx) => {
        await tx
          .delete(userCityInterests)
          .where(eq(userCityInterests.userId, session.user.id))

        await tx
          .delete(userCategoryInterests)
          .where(eq(userCategoryInterests.userId, session.user.id))

        let primaryIndex = normalizedCities.findIndex((city: any) => city.isPrimary)
        if (primaryIndex < 0) primaryIndex = 0

        for (let index = 0; index < normalizedCities.length; index++) {
          const city = normalizedCities[index]
          const slug = slugify(
            [city.name, city.region, city.countryCode]
              .filter(Boolean)
              .join("-"),
          )

          const [stored] = await tx
            .insert(cities)
            .values({
              name: city.name,
              region: city.region,
              countryCode: city.countryCode,
              slug,
            })
            .onConflictDoUpdate({
              target: cities.slug,
              set: {
                name: city.name,
                region: city.region,
                countryCode: city.countryCode,
                active: true,
              },
            })
            .returning()

          await tx.insert(userCityInterests).values({
            userId: session.user.id,
            cityId: stored.id,
            source: city.source,
            isPrimary: index === primaryIndex,
          })
        }

        await tx.insert(userCategoryInterests).values(
          validCategories.map((category) => ({
            userId: session.user.id,
            categoryId: category.id,
          })),
        )

        await tx
          .update(userProfiles)
          .set({ onboardingCompletedAt: new Date() })
          .where(eq(userProfiles.userId, session.user.id))
      })

      return json({ ok: true })
    }

    return json({ error: "NOT_FOUND", message: "Unknown account endpoint." }, 404)
  } catch (error) {
    console.error("[XPOMAG account] POST failed", error)
    return json(
      {
        error: "ACCOUNT_API_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "The account service could not complete the request.",
      },
      500,
    )
  }
}
