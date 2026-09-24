"use client"

import { FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      })
      if (result.error) throw new Error(result.error.message || "Unable to send reset code")
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset code")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-6 py-16">
        <a href="/" className="mb-16 text-[18px] font-black tracking-[-0.05em]">XpoMag</a>
        <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-neutral-400">Account recovery</p>
        <h1 className="text-[42px] font-medium leading-[0.98] tracking-[-0.055em]">Reset your password.</h1>
        <p className="mt-5 text-[15px] leading-6 text-neutral-500">
          Enter your email and we’ll send you a verification code.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-neutral-200 p-5 text-sm leading-6">
            Check <strong>{email}</strong> for your reset code.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button disabled={busy} className="h-12 w-full rounded-full bg-black px-5 font-medium text-white disabled:opacity-50">
              {busy ? "Sending…" : "Send reset code"}
            </button>
          </form>
        )}

        <a href="/sign-in" className="mt-8 text-sm font-medium underline underline-offset-4">Back to sign in</a>
      </div>
    </main>
  )
}
