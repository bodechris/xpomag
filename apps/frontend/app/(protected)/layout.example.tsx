"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { accountFetch } from "../../lib/account-api"

type AccountStatus = {
  verified: boolean
  onboardingCompleted: boolean
}

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    accountFetch<AccountStatus>("/status")
      .then((status) => {
        if (cancelled) return

        if (!status.verified) {
          router.replace("/verify-email")
          return
        }

        if (!status.onboardingCompleted) {
          router.replace("/onboarding")
          return
        }

        setReady(true)
      })
      .catch(() => {
        router.replace(`/auth?next=${encodeURIComponent(pathname)}`)
      })

    return () => {
      cancelled = true
    }
  }, [pathname, router])

  if (!ready) return null
  return children
}
