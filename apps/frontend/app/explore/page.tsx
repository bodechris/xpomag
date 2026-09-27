import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../lib/auth-server";
import { ExplorePublications } from "../../components/explore-publications";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Explore cities | XpoMag",description:"Discover and follow XpoMag social magazines for cities around the world."};

function apiOrigin(){return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";}

export default async function ExplorePage(){
  await ensureAuthInfrastructure();
  const session=await auth.api.getSession({headers:await headers()});
  const requestHeaders=new Headers({accept:"application/json"});
  if(session?.user?.id){
    requestHeaders.set("x-xpomag-user-id",session.user.id);
    if(process.env.ENGAGEMENT_INTERNAL_SECRET) requestHeaders.set("x-xpomag-internal-key",process.env.ENGAGEMENT_INTERNAL_SECRET);
  }
  let publications:any[]=[];
  try{
    const response=await fetch(new URL("/v1/publications",apiOrigin()),{headers:requestHeaders,cache:"no-store"});
    if(response.ok) publications=(await response.json()).publications ?? [];
  }catch{}
  return <main><ExplorePublications initialPublications={publications} authenticated={Boolean(session?.user)}/></main>;
}
