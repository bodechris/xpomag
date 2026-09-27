import {NextRequest} from "next/server";
function origin(){return process.env.API_ORIGIN??process.env.NEXT_PUBLIC_API_ORIGIN??"http://localhost:4000"}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;const r=await fetch(new URL(`/v1/admin/stories/${id}`,origin()),{method:"PATCH",headers:{"content-type":"application/json"},body:await request.text()});return new Response(await r.arrayBuffer(),{status:r.status,headers:{"content-type":r.headers.get("content-type")??"application/json"}})}
