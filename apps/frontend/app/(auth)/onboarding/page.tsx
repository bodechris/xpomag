"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { accountFetch } from "../../../lib/account-api"

type CityInput = {
  name: string
  region?: string | null
  countryCode?: string | null
  isPrimary?: boolean
  source?: "detected" | "selected"
}

type Category = {
  id: string
  name: string
  slug: string
}

type Bootstrap = {
  detectedLocation: {
    city: string | null
    region: string | null
    countryCode: string | null
    source: string | null
  }
  selectedCities: Array<CityInput & { id: string }>
  selectedCategoryIds: string[]
  categories: Category[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null)
  const [cities, setCities] = useState<CityInput[]>([])
  const [cityDraft, setCityDraft] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    accountFetch<Bootstrap>("/onboarding")
      .then((data) => {
        setBootstrap(data)
        setSelectedCategories(data.selectedCategoryIds)

        if (data.selectedCities.length) {
          setCities(data.selectedCities)
          return
        }

        if (data.detectedLocation.city) {
          setCities([
            {
              name: data.detectedLocation.city,
              region: data.detectedLocation.region,
              countryCode: data.detectedLocation.countryCode,
              isPrimary: true,
              source: "detected",
            },
          ])
        }
      })
      .catch((err: Error & { status?: number }) => {
        if (err.status === 401) {
          router.replace("/auth")
        } else if (err.status === 403) {
          router.replace("/verify-email")
        } else {
          setError(err.message || "Unable to load your setup.")
        }
      })
  }, [router])

  const detectedLabel = useMemo(() => {
    if (!bootstrap?.detectedLocation.city) return null

    return [
      bootstrap.detectedLocation.city,
      bootstrap.detectedLocation.region,
      bootstrap.detectedLocation.countryCode,
    ]
      .filter(Boolean)
      .join(", ")
  }, [bootstrap])

  function addCity() {
    const name = cityDraft.trim()
    if (name.length < 2) return

    if (
      cities.some(
        (city) => city.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setCityDraft("")
      return
    }

    setCities((current) => [
      ...current,
      {
        name,
        isPrimary: current.length === 0,
        source: "selected",
      },
    ])

    setCityDraft("")
  }

  function removeCity(index: number) {
    setCities((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index)

      if (next.length && !next.some((city) => city.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true }
      }

      return next
    })
  }

  function toggleCategory(id: string) {
    setSelectedCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 8
          ? current
          : [...current, id],
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")

    if (!cities.length) {
      setError("Add at least one city.")
      return
    }

    if (!selectedCategories.length) {
      setError("Choose at least one interest.")
      return
    }

    setBusy(true)

    try {
      await accountFetch("/onboarding", {
        method: "POST",
        body: JSON.stringify({
          cities,
          categoryIds: selectedCategories,
        }),
      })

      router.replace("/")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your preferences.",
      )
    } finally {
      setBusy(false)
    }
  }

  if (!bootstrap) {
    return (
      <main className="flowShell">
        <section className="flowEditorial">
          <a href="/" className="flowBrand">
            XpoMag
            <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
          </a>
          <div className="flowHero">
            <p className="flowKicker">PERSONALISING XPOMAG</p>
            <h1>Make the city yours.</h1>
          </div>
        </section>
        <section className="flowPanel">
          <div className="flowCard">
            <div className="flowStep">
              <span>Setup</span>
              <span>02 / 02</span>
            </div>
            <h2>Preparing your interests…</h2>
            {error ? <div className="flowError">{error}</div> : null}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flowShell">
      <section className="flowEditorial">
        <a href="/" className="flowBrand">
          XpoMag
          <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
        </a>

        <div className="flowHero">
          <p className="flowKicker">PERSONALISE YOUR EDITION</p>
          <h1>Make the city yours.</h1>
          <p>
            Tell XPOMAG where you care about and what you’re interested in.
            We’ll use it to make discovery more useful without turning the
            magazine into an endless feed.
          </p>
        </div>

        <div className="flowMeta">
          <span>Your cities</span>
          <span>Your interests</span>
          <span>Your edition</span>
        </div>
      </section>

      <section className="flowPanel">
        <form className="flowCard" onSubmit={submit}>
          <div className="flowStep">
            <span>Setup</span>
            <span>02 / 02</span>
          </div>

          <h2>What should XPOMAG follow for you?</h2>
          <p className="flowLead">
            Keep it light. Choose the places and subjects that should influence
            what XPOMAG surfaces first.
          </p>

          <section className="flowSection">
            <div className="flowSectionHeader">
              <div className="flowSectionNumber">01</div>
              <div>
                <h3>Your cities</h3>
                <p>
                  {detectedLabel
                    ? `We think you’re around ${detectedLabel}.`
                    : "We couldn’t confidently detect your city. Add one below."}
                </p>
              </div>
            </div>

            <div className="flowInline">
              <input
                className="flowInput"
                value={cityDraft}
                onChange={(event) => setCityDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    addCity()
                  }
                }}
                placeholder="Add a city"
              />
              <button
                className="flowAdd"
                type="button"
                onClick={addCity}
              >
                Add city
              </button>
            </div>

            {cities.length ? (
              <div className="flowPills">
                {cities.map((city, index) => (
                  <button
                    type="button"
                    key={`${city.name}-${index}`}
                    className="flowPill flowPillCity"
                    onClick={() => removeCity(index)}
                    title="Remove city"
                  >
                    {city.name}
                    {city.isPrimary ? " · Primary" : ""} ×
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="flowSection">
            <div className="flowSectionHeader">
              <div className="flowSectionNumber">02</div>
              <div>
                <h3>Your interests</h3>
                <p>
                  Pick up to eight. These categories can later become their own
                  curated XPOMAG editions.
                </p>
              </div>
            </div>

            <div className="flowPills">
              {bootstrap.categories.map((category) => {
                const active = selectedCategories.includes(category.id)

                return (
                  <button
                    key={category.id}
                    type="button"
                    className="flowPill"
                    data-active={active}
                    aria-pressed={active}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </section>

          {error ? <div className="flowError">{error}</div> : null}

          <button className="flowButton" disabled={busy}>
            {busy ? "Saving your setup…" : "Start exploring XPOMAG"}
          </button>

          <p className="flowFooterNote">
            You can change cities and interests later from your account.
          </p>
        </form>
      </section>
    </main>
  )
}
