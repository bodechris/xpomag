"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { accountFetch } from "../../../lib/account-api"

type Status = {
  verified: boolean
  onboardingCompleted: boolean
}

export default function PostLoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Finishing sign in…")

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const status = await accountFetch<Status>("/status")

        if (cancelled) return

        if (!status.verified) {
          setMessage("Sending your verification code…")
          await accountFetch("/send-verification-code", { method: "POST" })
          router.replace("/verify-email")
          return
        }

        if (!status.onboardingCompleted) {
          router.replace("/onboarding")
          return
        }

        router.replace("/")
      } catch {
        router.replace("/auth")
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <p className="text-sm text-neutral-500">{message}</p>
    </main>
  )
}
