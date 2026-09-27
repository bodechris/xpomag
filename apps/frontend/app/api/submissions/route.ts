import { NextRequest } from "next/server";
import { auth,ensureAuthInfrastructure } from "../../../lib/auth-server";
export const runtime="nodejs";export const dynamic="force-dynamic";
function origin(){return process.env.API_ORIGIN??process.env.NEXT_PUBLIC_API_ORIGIN??"http://localhost:4000"}
export async function POST(request:NextRequest){await ensureAuthInfrastructure();const session=await auth.api.getSession({headers:request.headers});const h=new Headers({"content-type":"application/json",accept:"application/json"});if(session?.user?.id){h.set("x-xpomag-user-id",session.user.id);if(process.env.ENGAGEMENT_INTERNAL_SECRET)h.set("x-xpomag-internal-key",process.env.ENGAGEMENT_INTERNAL_SECRET)}const response=await fetch(new URL("/v1/submissions",origin()),{method:"POST",headers:h,body:await request.text()});return new Response(await response.arrayBuffer(),{status:response.status,headers:{"content-type":response.headers.get("content-type")??"application/json"}})}
