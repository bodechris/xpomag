import type { Express } from "express"
import { auth, toNodeHandler } from "../../../packages/auth/src/index.ts"

export function mountBetterAuth(app: Express) {
  // Better Auth must be mounted BEFORE express.json().
  // XPOMAG currently uses Express 5.
  app.all("/api/auth/*splat", toNodeHandler(auth))

  app.get("/api/auth-health", async (_req, res) => {
    res.json({
      ok: true,
      service: "xpomag-auth",
      betterAuthURL:
        process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
      frontendOrigin:
        process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
      googleConfigured: Boolean(
        process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_SECRET,
      ),
      resendConfigured: Boolean(
        process.env.RESEND_API_KEY &&
          process.env.AUTH_EMAIL_FROM,
      ),
    })
  })
}
