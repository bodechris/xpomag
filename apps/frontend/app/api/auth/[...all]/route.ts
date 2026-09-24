import { toNextJsHandler } from "better-auth/next-js"
import {
  auth,
  ensureAuthInfrastructure,
} from "../../../../lib/auth-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const handlers = toNextJsHandler(auth)

export async function GET(request: Request) {
  try {
    await ensureAuthInfrastructure()
    return handlers.GET(request)
  } catch (error) {
    console.error("[XPOMAG auth] GET failed", error)
    return Response.json(
      {
        error: "AUTH_SERVICE_UNAVAILABLE",
        message:
          error instanceof Error
            ? error.message
            : "Authentication service is unavailable.",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    await ensureAuthInfrastructure()
    return handlers.POST(request)
  } catch (error) {
    console.error("[XPOMAG auth] POST failed", error)
    return Response.json(
      {
        error: "AUTH_SERVICE_UNAVAILABLE",
        message:
          error instanceof Error
            ? error.message
            : "Authentication service is unavailable.",
      },
      { status: 500 },
    )
  }
}
