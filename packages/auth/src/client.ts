import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
})
