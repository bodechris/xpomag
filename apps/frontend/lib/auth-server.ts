import { betterAuth } from "better-auth"
import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { emailOTP } from "better-auth/plugins"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./auth-schema"

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://xpomag:xpomag@localhost:5434/xpomag"

export const authPool = new Pool({ connectionString })
export const authDb = drizzle(authPool)

let infrastructurePromise: Promise<void> | null = null

export function ensureAuthInfrastructure() {
  if (infrastructurePromise) return infrastructurePromise

  infrastructurePromise = (async () => {
    await authPool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)

    await authPool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "email_verified" boolean DEFAULT false NOT NULL,
        "image" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "expires_at" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
      );
      CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("user_id");

      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY NOT NULL,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "password" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("user_id");

      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "verification_identifier_idx"
        ON "verification" ("identifier");

      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "user_id" text PRIMARY KEY NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "email_verified_at" timestamptz,
        "onboarding_completed_at" timestamptz,
        "detected_city" text,
        "detected_region" text,
        "detected_country_code" text,
        "location_source" text
      );

      CREATE TABLE IF NOT EXISTS "cities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "region" text,
        "country_code" text,
        "slug" text NOT NULL UNIQUE,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "description" text,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "user_city_interests" (
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "city_id" uuid NOT NULL REFERENCES "cities"("id") ON DELETE cascade,
        "source" text DEFAULT 'selected' NOT NULL,
        "is_primary" boolean DEFAULT false NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        PRIMARY KEY ("user_id", "city_id")
      );

      CREATE TABLE IF NOT EXISTS "user_category_interests" (
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
        "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE cascade,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        PRIMARY KEY ("user_id", "category_id")
      );
    `)
  })().catch((error) => {
    infrastructurePromise = null
    throw error
  })

  return infrastructurePromise
}

function authOrigin() {
  return (
    process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ??
    process.env.FRONTEND_ORIGIN ??
    "http://localhost:3000"
  )
}

function authSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET
  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production")
  }
  return "xpomag-local-development-secret-change-before-production"
}

async function sendOtp({
  email,
  otp,
  type,
}: {
  email: string
  otp: string
  type: "sign-in" | "email-verification" | "forget-password"
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_EMAIL_FROM

  if (!apiKey || !from) {
    console.log(`\n[XPOMAG AUTH OTP] ${email} -> ${otp} (${type})\n`)
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject:
        type === "forget-password"
          ? "Reset your XPOMAG password"
          : "Verify your XPOMAG email",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px">
          <div style="font-weight:900;font-size:20px;margin-bottom:30px">XpoMag</div>
          <p style="font-size:13px;letter-spacing:.12em;font-weight:700">YOUR VERIFICATION CODE</p>
          <div style="font-size:42px;font-weight:700;letter-spacing:.18em;margin:26px 0">${otp}</div>
          <p style="font-size:13px;color:#777">This code expires in 10 minutes.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error(`Unable to send verification email (${response.status})`)
  }
}

export const auth = betterAuth({
  appName: "XPOMAG",
  baseURL: authOrigin(),
  secret: authSecret(),

  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema,
  }),

  trustedOrigins: [
    authOrigin(),
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
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtp({ email, otp, type })
      },
    }),
  ],

  rateLimit: {
    enabled: true,
  },
})
