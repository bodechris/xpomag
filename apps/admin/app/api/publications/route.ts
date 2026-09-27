import { NextRequest } from "next/server";
export const dynamic="force-dynamic";
function apiOrigin(){return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";}
async function proxy(request:NextRequest){
  const path=request.nextUrl.searchParams.get("admin")==="1"?"/v1/publications?admin=1":"/v1/admin/publications";
  const response=await fetch(new URL(path,apiOrigin()),{method:request.method,headers:{"content-type":"application/json","accept":"application/json"},body:request.method==="GET"?undefined:await request.text(),cache:"no-store"});
  return new Response(await response.arrayBuffer(),{status:response.status,headers:{"content-type":response.headers.get("content-type") ?? "application/json"}});
}
export const GET=proxy; export const POST=proxy;
