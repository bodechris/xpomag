import { NextRequest } from "next/server"
import { auth, ensureAuthInfrastructure } from "../../../../../../../lib/auth-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ issueSlug: string; pageSlug: string; sectionId: string; action?: string[] }>
}

function apiOrigin() {
  return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000"
}

async function proxy(request: NextRequest, context: RouteContext) {
  await ensureAuthInfrastructure()
  const { issueSlug, pageSlug, sectionId, action = [] } = await context.params
  const session = await auth.api.getSession({ headers: request.headers })
  const isMutation = request.method !== "GET" && request.method !== "HEAD"

  if (isMutation && !session?.user) {
    return Response.json({ ok: false, error: "Authentication required" }, { status: 401 })
  }

  const target = new URL(
    `/v1/engagement/${encodeURIComponent(issueSlug)}/${encodeURIComponent(pageSlug)}/${encodeURIComponent(sectionId)}${action.length ? `/${action.map(encodeURIComponent).join("/")}` : ""}`,
    apiOrigin(),
  )

  const headers = new Headers()
  headers.set("accept", "application/json")
  if (request.headers.get("content-type")) headers.set("content-type", request.headers.get("content-type")!)
  if (session?.user?.id) headers.set("x-xpomag-user-id", session.user.id)
  if (process.env.ENGAGEMENT_INTERNAL_SECRET) headers.set("x-xpomag-internal-key", process.env.ENGAGEMENT_INTERNAL_SECRET)

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()
  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  })

  const responseBody = await response.arrayBuffer()
  const responseHeaders = new Headers()
  responseHeaders.set("content-type", response.headers.get("content-type") ?? "application/json")
  return new Response(responseBody, { status: response.status, headers: responseHeaders })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const DELETE = proxy
