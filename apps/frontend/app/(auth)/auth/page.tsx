"use client"

import { FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "../../../lib/auth-client"
import { accountFetch } from "../../../lib/account-api"

type Mode = "signin" | "signup"

function getAuthError(error: any, fallback: string) {
  if (!error) return fallback
  return (
    error.message ||
    error.code ||
    error.statusText ||
    fallback
  )
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin"

  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [error, setError] = useState("")

  async function continueWithGoogle() {
    setError("")
    setGoogleBusy(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/post-login`,
      })

      if (result?.error) {
                setError(getAuthError(result.error, "Unable to continue with Google."))
        setGoogleBusy(false)
      }
    } catch (err) {
            setError(getAuthError(err, "Unable to continue with Google."))
      setGoogleBusy(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")

    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        })

        if (result.error) {
                    throw new Error(
            getAuthError(result.error, "Unable to create account."),
          )
        }

        await accountFetch("/send-verification-code", {
          method: "POST",
        })

        router.push("/verify-email")
        return
      }

      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (result.error) {
                throw new Error(
          getAuthError(result.error, "Incorrect email or password."),
        )
      }

      router.push("/post-login")
    } catch (err) {
            setError(
        err instanceof TypeError && err.message.toLowerCase().includes("fetch")
          ? "Authentication service could not be reached. Refresh and try again."
          : getAuthError(err, "Unable to complete authentication."),
      )
    } finally {
      setBusy(false)
    }
  }

  function changeMode(next: Mode) {
    setMode(next)
    setError("")
    window.history.replaceState(
      null,
      "",
      next === "signup" ? "/auth?mode=signup" : "/auth",
    )
  }

  return (
    <main className="xp-auth">
      <section className="xp-auth__left">
        <a className="xp-brand" href="/">
          XpoMag
          <span className="xp-brand__city">ROSEBANK + SANDTON</span>
        </a>

        <div className="xp-auth__hero">
          <p className="xp-eyebrow">YOUR CITY, CURATED</p>
          <h1>Your city. Better edited.</h1>
          <p>
            A sharper way to discover the people, places, businesses and ideas
            shaping the cities you care about.
          </p>
        </div>

        <div className="xp-auth__meta">
          <span>Local stories</span>
          <span>City discovery</span>
          <span>Curated magazines</span>
        </div>
      </section>

      <section className="xp-auth__right">
        <div className="xp-auth__card">
          <div className="xp-auth__switch">
            <button
              type="button"
              data-active={mode === "signin"}
              onClick={() => changeMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              data-active={mode === "signup"}
              onClick={() => changeMode("signup")}
            >
              Create account
            </button>
          </div>

          <h2>{mode === "signin" ? "Welcome back." : "Join XPOMAG."}</h2>
          <p className="xp-auth__sub">
            {mode === "signin"
              ? "Sign in to continue to your cities and interests."
              : "Create an account and choose what you want XPOMAG to curate for you."}
          </p>

          <button
            type="button"
            className="xp-google"
            onClick={continueWithGoogle}
            disabled={googleBusy || busy}
          >
            {googleBusy ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="xp-divider">or</div>

          <form className="xp-form" onSubmit={submit}>
            {mode === "signup" && (
              <div className="xp-field">
                <label htmlFor="xp-name">Name</label>
                <input
                  id="xp-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="xp-field">
              <label htmlFor="xp-email">Email</label>
              <input
                id="xp-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="xp-field">
              <div className="xp-password-row">
                <label htmlFor="xp-password">Password</label>
                {mode === "signin" && (
                  <a className="xp-link" href="/forgot-password">
                    Forgot password?
                  </a>
                )}
              </div>
              <input
                id="xp-password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signup"
                    ? "At least 8 characters"
                    : "Your password"
                }
              />
            </div>

            {error && <div className="xp-error">{error}</div>}

            <button
              className="xp-submit"
              type="submit"
              disabled={busy || googleBusy}
            >
              {busy
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="xp-note">
            By continuing, you agree to XPOMAG’s terms and privacy policy.
          </p>
        </div>
      </section>
    </main>
  )
}
