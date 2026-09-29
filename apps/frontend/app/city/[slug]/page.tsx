import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth,ensureAuthInfrastructure } from "../../../lib/auth-server";
import { PublicationFollowButton,type PublicPublication } from "../../../components/publication-follow-button";

export const dynamic="force-dynamic";
function apiOrigin(){return process.env.API_ORIGIN??process.env.NEXT_PUBLIC_API_ORIGIN??"http://localhost:4000"}
async function publication(slug:string,userId?:string){const h=new Headers({accept:"application/json"});if(userId){h.set("x-xpomag-user-id",userId);if(process.env.ENGAGEMENT_INTERNAL_SECRET)h.set("x-xpomag-internal-key",process.env.ENGAGEMENT_INTERNAL_SECRET)}const r=await fetch(new URL(`/v1/publications/${slug}`,apiOrigin()),{headers:h,cache:"no-store"});return r.ok?(await r.json()).publication as PublicPublication:null}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return {title:`XpoMag ${slug} | Every City Has a Story`}}
export default async function CityPublicationPage({params}:{params:Promise<{slug:string}>}){await ensureAuthInfrastructure();const session=await auth.api.getSession({headers:await headers()});const {slug}=await params;const p=await publication(slug,session?.user?.id);if(!p)notFound();const city=p.city??p.name.replace("XpoMag ","");const issueSlug=`demo-${city.toLowerCase().replace(/\\s+/g,"-")}-001`;const live=p.status==="ACTIVE";return <main className="xp-city">
 <section className="xp-city__hero"><div className="xp-city__kicker"><span>{p.country}</span><span>{live?"NOW PUBLISHING":"COMING SOON"}</span></div><p className="xp-city__brand">XPOMAG</p><h1>{city}</h1><p className="xp-city__tagline">{p.tagline??`Every city has a story. This is ${city}.`}</p><div className="xp-city__hero-actions"><PublicationFollowButton publication={p} authenticated={Boolean(session?.user)} className="xp-city__follow"/>{live?<a href={`/magazine/${issueSlug}/cover`}>Open November issue →</a>:null}</div></section>
 <section className="xp-city__latest"><div className="xp-city__section-head"><div><p>LATEST ISSUE</p><h2>{city} · November 2026</h2></div><span>ISSUE 001</span></div>{live?<a className="xp-city__issue" href={`/magazine/${issueSlug}/cover`}><div><span>NOVEMBER 2026</span><strong>Every City<br/>Has a Story.</strong><p>{p.description}</p></div><b>OPEN ISSUE ↗</b></a>:<div className="xp-city__empty">Follow {city} and we will let you know when the first issue opens.</div>}</section>
 <section className="xp-city__rail"><div><p>DISCOVER {city.toUpperCase()}</p><h2>People. Places.<br/>Businesses. Ideas.</h2></div><div className="xp-city__rail-grid">{["Stories","Places","People","Past issues"].map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong><small>{i===3?"The city archive grows with every issue.":"Curated from each XpoMag issue."}</small></div>)}</div></section>
 </main>}
