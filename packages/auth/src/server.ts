import { betterAuth } from "better-auth"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { emailOTP } from "better-auth/plugins"
import { createDb } from "@xpomag/db"
import * as authSchema from "@xpomag/db/schema/auth"
import * as onboardingSchema from "@xpomag/db/schema/onboarding"
import { sendOtpEmail } from "./send-otp-email.js"

const frontendOrigin =
  process.env.FRONTEND_ORIGIN ??
  process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ??
  "http://localhost:3000"

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:4000"

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://xpomag:xpomag@localhost:5434/xpomag"

const { db } = createDb(connectionString)

function getSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET
  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production")
  }
  // Local-development fallback only. Production never uses this value.
  return "xpomag-local-development-secret-change-before-production"
}

export const auth = betterAuth({
  appName: "XPOMAG",
  baseURL,
  secret: getSecret(),

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
      ...onboardingSchema,
    },
  }),

  trustedOrigins: [
    frontendOrigin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({
          email,
          otp,
          purpose:
            type === "forget-password"
              ? "password-reset"
              : type === "sign-in"
                ? "sign-in"
                : "email-verification",
        })
      },
    }),
  ],

  rateLimit: {
    enabled: true,
  },
})

export type Auth = typeof auth
