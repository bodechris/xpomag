"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "../../../lib/auth-client"
import { accountFetch } from "../../../lib/account-api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (session === null) router.replace("/auth")
  }, [session, router])

  async function verify(event: FormEvent) {
    event.preventDefault()

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.")
      return
    }

    setBusy(true)
    setError("")

    try {
      await accountFetch("/verify-email-code", {
        method: "POST",
        body: JSON.stringify({ otp }),
      })
      router.replace("/onboarding")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The code is invalid or has expired.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setResending(true)
    setError("")

    try {
      await accountFetch("/send-verification-code", { method: "POST" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send a new code.")
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="flowShell">
      <section className="flowEditorial">
        <a href="/" className="flowBrand">
          XpoMag
          <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
        </a>

        <div className="flowHero">
          <p className="flowKicker">ACCOUNT VERIFICATION</p>
          <h1>One quick check.</h1>
          <p>
            Verify your email, then tell XPOMAG which cities and subjects should
            shape your experience.
          </p>
        </div>

        <div className="flowMeta">
          <span>Private account</span>
          <span>Local interests</span>
          <span>Personal editions</span>
        </div>
      </section>

      <section className="flowPanel">
        <div className="flowCard">
          <div className="flowStep">
            <span>Setup</span>
            <span>01 / 02</span>
          </div>

          <h2>Check your email.</h2>
          <p className="flowLead">
            We sent a 6-digit verification code
            {session?.user?.email ? ` to ${session.user.email}` : ""}.
            Enter it below to continue.
          </p>

          <form onSubmit={verify}>
            <div className="flowField">
              <label className="flowLabel" htmlFor="xp-otp">
                Verification code
              </label>
              <input
                id="xp-otp"
                className="flowInput flowOtp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                autoFocus
              />
            </div>

            {error ? <div className="flowError">{error}</div> : null}

            <button
              className="flowButton"
              disabled={busy || otp.length !== 6}
            >
              {busy ? "Verifying…" : "Verify email"}
            </button>
          </form>

          <button
            type="button"
            className="flowTextButton"
            disabled={resending}
            onClick={resend}
          >
            {resending ? "Sending a new code…" : "Send a new code"}
          </button>
        </div>
      </section>
    </main>
  )
}
