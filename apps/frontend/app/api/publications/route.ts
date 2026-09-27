import { NextRequest } from "next/server";
import { auth, ensureAuthInfrastructure } from "../../../lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiOrigin() {
  return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";
}

async function viewerHeaders(request: NextRequest) {
  await ensureAuthInfrastructure();
  const session = await auth.api.getSession({ headers: request.headers });
  const headers = new Headers({ accept: "application/json" });
  if (request.headers.get("content-type")) headers.set("content-type", request.headers.get("content-type")!);
  if (session?.user?.id) {
    headers.set("x-xpomag-user-id", session.user.id);
    if (process.env.ENGAGEMENT_INTERNAL_SECRET) headers.set("x-xpomag-internal-key", process.env.ENGAGEMENT_INTERNAL_SECRET);
  }
  return headers;
}

export async function GET(request: NextRequest) {
  const response = await fetch(new URL("/v1/publications", apiOrigin()), { headers: await viewerHeaders(request), cache:"no-store" });
  return new Response(await response.arrayBuffer(), { status:response.status, headers:{ "content-type":response.headers.get("content-type") ?? "application/json" } });
}
