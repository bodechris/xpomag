import { Router, type Request, type Router as ExpressRouter } from "express"
import { auth, fromNodeHeaders } from "@xpomag/auth"
import { and, asc, createDb, eq, inArray } from "@xpomag/db"
import {
  categories,
  cities,
  userCategoryInterests,
  userCityInterests,
  userProfiles,
} from "@xpomag/db/schema/onboarding"
import { detectLocation } from "../lib/location"

export const accountRouter: ExpressRouter = Router()

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://xpomag:xpomag@localhost:5434/xpomag"

const { db } = createDb(connectionString)

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

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function getSession(req: Request) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
}

async function ensureCategories() {
  await db
    .insert(categories)
    .values(defaultCategories.map(([name, slug]) => ({ name, slug })))
    .onConflictDoNothing()
}

async function ensureProfile(userId: string, req?: Request) {
  const [existing] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  if (existing) return existing

  const location = req ? detectLocation(req) : null

  const [created] = await db
    .insert(userProfiles)
    .values({
      userId,
      detectedCity: location?.city ?? null,
      detectedRegion: location?.region ?? null,
      detectedCountryCode: location?.countryCode ?? null,
      locationSource: location?.source ?? null,
    })
    .returning()

  if (!created) {
    throw new Error("Failed to create user profile.")
  }

  return created
}

accountRouter.get("/status", async (req, res) => {
  try {
    const session = await getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "No authenticated XPOMAG session was found.",
      })
    }

    const profile = await ensureProfile(session.user.id, req)

    return res.json({
      user: session.user,
      verified: Boolean(profile?.emailVerifiedAt),
      onboardingCompleted: Boolean(profile?.onboardingCompletedAt),
    })
  } catch (error) {
    console.error("[XPOMAG] account status", error)
    return res.status(500).json({
      error: "ACCOUNT_STATUS_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Unable to read account status.",
    })
  }
})

accountRouter.post("/send-verification-code", async (req, res) => {
  try {
    const session = await getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Sign in before requesting a verification code.",
      })
    }

    const profile = await ensureProfile(session.user.id, req)

    if (profile?.emailVerifiedAt) {
      return res.json({ ok: true, alreadyVerified: true })
    }

    await auth.api.sendVerificationOTP({
      body: {
        email: session.user.email,
        type: "email-verification",
      },
    })

    return res.json({
      ok: true,
      email: session.user.email,
    })
  } catch (error) {
    console.error("[XPOMAG] send verification code", error)
    return res.status(500).json({
      error: "VERIFICATION_CODE_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Unable to send verification code.",
    })
  }
})

accountRouter.post("/verify-email-code", async (req, res) => {
  try {
    const session = await getSession(req)

    if (!session?.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Sign in before verifying your email.",
      })
    }

    const otp = String(req.body?.otp ?? "").trim()
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "INVALID_CODE_FORMAT",
        message: "Enter the 6-digit verification code.",
      })
    }

    await auth.api.checkVerificationOTP({
      body: {
        email: session.user.email,
        otp,
        type: "email-verification",
      },
    })

    await db
      .insert(userProfiles)
      .values({
        userId: session.user.id,
        emailVerifiedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          emailVerifiedAt: new Date(),
        },
      })

    return res.json({ ok: true })
  } catch (error) {
    console.error("[XPOMAG] verify email code", error)
    return res.status(400).json({
      error: "INVALID_OR_EXPIRED_CODE",
      message:
        error instanceof Error
          ? error.message
          : "The verification code is invalid or expired.",
    })
  }
})

accountRouter.get("/onboarding", async (req, res) => {
  try {
    const session = await getSession(req)
    if (!session?.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Sign in to continue onboarding.",
      })
    }

    await ensureCategories()
    const profile = await ensureProfile(session.user.id, req)

    if (!profile.emailVerifiedAt) {
      return res.status(403).json({
        error: "EMAIL_VERIFICATION_REQUIRED",
        message: "Verify your email before onboarding.",
      })
    }

    const availableCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(eq(categories.active, true))
      .orderBy(asc(categories.name))

    const selectedCities = await db
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

    const selectedCategoryRows = await db
      .select({ id: userCategoryInterests.categoryId })
      .from(userCategoryInterests)
      .where(eq(userCategoryInterests.userId, session.user.id))

    return res.json({
      detectedLocation: {
        city: profile.detectedCity,
        region: profile.detectedRegion,
        countryCode: profile.detectedCountryCode,
        source: profile.locationSource,
      },
      selectedCities,
      selectedCategoryIds: selectedCategoryRows.map((row: { id: string }) => row.id),
      categories: availableCategories,
    })
  } catch (error) {
    console.error("[XPOMAG] onboarding load", error)
    return res.status(500).json({
      error: "ONBOARDING_LOAD_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Unable to load onboarding.",
    })
  }
})

accountRouter.post("/onboarding", async (req, res) => {
  try {
    const session = await getSession(req)
    if (!session?.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Sign in to continue onboarding.",
      })
    }

    const profile = await ensureProfile(session.user.id, req)
    if (!profile.emailVerifiedAt) {
      return res.status(403).json({
        error: "EMAIL_VERIFICATION_REQUIRED",
        message: "Verify your email before onboarding.",
      })
    }

    await ensureCategories()

    const cityInputs = Array.isArray(req.body?.cities)
      ? req.body.cities.slice(0, 10)
      : []

    const categoryIds = Array.isArray(req.body?.categoryIds)
      ? req.body.categoryIds.map(String).slice(0, 12)
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
      return res.status(400).json({
        error: "SELECT_AT_LEAST_ONE_CITY",
        message: "Choose at least one city.",
      })
    }

    if (!categoryIds.length) {
      return res.status(400).json({
        error: "SELECT_AT_LEAST_ONE_CATEGORY",
        message: "Choose at least one category.",
      })
    }

    const validCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.active, true),
          inArray(categories.id, categoryIds),
        ),
      )

    if (!validCategories.length) {
      return res.status(400).json({
        error: "INVALID_CATEGORIES",
        message: "Choose at least one valid category.",
      })
    }

    await db.transaction(async (tx: any) => {
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
          [city.name, city.region, city.countryCode].filter(Boolean).join("-"),
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
        validCategories.map((category: { id: string }) => ({
          userId: session.user.id,
          categoryId: category.id,
        })),
      )

      await tx
        .update(userProfiles)
        .set({ onboardingCompletedAt: new Date() })
        .where(eq(userProfiles.userId, session.user.id))
    })

    return res.json({ ok: true })
  } catch (error) {
    console.error("[XPOMAG] onboarding save", error)
    return res.status(500).json({
      error: "ONBOARDING_SAVE_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Unable to save onboarding.",
    })
  }
})
