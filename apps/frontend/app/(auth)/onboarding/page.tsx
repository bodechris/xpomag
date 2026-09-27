"use client"

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { accountFetch } from "../../../lib/account-api"

type CityInput = {
  name: string
  region?: string | null
  countryCode?: string | null
  isPrimary?: boolean
  source?: "detected" | "selected"
}

type CitySuggestion = { id:string; name:string; region:string|null; country:string|null; countryCode:string|null; population:number }

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
  const [citySuggestions,setCitySuggestions]=useState<CitySuggestion[]>([])
  const [citySearching,setCitySearching]=useState(false)
  const [cityMenuOpen,setCityMenuOpen]=useState(false)
  const [cityActiveIndex,setCityActiveIndex]=useState(0)
  const citySearchRequest=useRef(0)
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

  useEffect(()=>{const query=cityDraft.trim();if(query.length<2){setCitySuggestions([]);setCityMenuOpen(false);return}const requestId=++citySearchRequest.current;const timer=window.setTimeout(async()=>{setCitySearching(true);try{const response=await fetch(`/api/cities?q=${encodeURIComponent(query)}`);const data=await response.json();if(requestId!==citySearchRequest.current)return;setCitySuggestions(data.results??[]);setCityActiveIndex(0);setCityMenuOpen(true)}catch{if(requestId===citySearchRequest.current)setCitySuggestions([])}finally{if(requestId===citySearchRequest.current)setCitySearching(false)}},220);return()=>window.clearTimeout(timer)},[cityDraft])

  function selectCity(city:CitySuggestion){const duplicate=cities.some(item=>item.name.toLowerCase()===city.name.toLowerCase()&&item.countryCode===city.countryCode);if(!duplicate)setCities(current=>[...current,{name:city.name,region:city.region,countryCode:city.countryCode,isPrimary:current.length===0,source:"selected"}]);setCityDraft("");setCitySuggestions([]);setCityMenuOpen(false)}

  function cityKeyDown(event:KeyboardEvent<HTMLInputElement>){if(!cityMenuOpen||!citySuggestions.length)return;if(event.key==="ArrowDown"){event.preventDefault();setCityActiveIndex(i=>(i+1)%citySuggestions.length)}else if(event.key==="ArrowUp"){event.preventDefault();setCityActiveIndex(i=>(i-1+citySuggestions.length)%citySuggestions.length)}else if(event.key==="Enter"){event.preventDefault();selectCity(citySuggestions[cityActiveIndex])}else if(event.key==="Escape")setCityMenuOpen(false)}

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

            <div className="flowCitySearch">
              <div className="flowCitySearch__input">
                <span aria-hidden="true">⌕</span>
                <input className="flowInput" value={cityDraft} onChange={event=>setCityDraft(event.target.value)} onFocus={()=>citySuggestions.length&&setCityMenuOpen(true)} onKeyDown={cityKeyDown} placeholder="Search any city worldwide…" role="combobox" aria-expanded={cityMenuOpen} aria-controls="city-suggestions" aria-autocomplete="list" />
                {citySearching?<small>Searching…</small>:cityDraft?<button type="button" onClick={()=>{setCityDraft("");setCityMenuOpen(false)}} aria-label="Clear city search">×</button>:null}
              </div>
              {cityMenuOpen?<div className="flowCityResults" id="city-suggestions" role="listbox">
                {citySuggestions.length?citySuggestions.map((city,index)=><button type="button" role="option" aria-selected={index===cityActiveIndex} data-active={index===cityActiveIndex} key={city.id} onMouseEnter={()=>setCityActiveIndex(index)} onClick={()=>selectCity(city)}><span><strong>{city.name}</strong><small>{[city.region,city.country].filter(Boolean).join(", ")}</small></span><b>{city.countryCode}</b></button>):<p>No matching cities found.</p>}
                <div className="flowCityResults__credit">Location data: Open-Meteo / GeoNames</div>
              </div>:null}
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
