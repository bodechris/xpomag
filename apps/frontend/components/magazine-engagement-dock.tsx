"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Activity, UserCheck, UserPlus } from "lucide-react"
import { SectionEngagementBar } from "./section-engagement"
import { authClient } from "../lib/auth-client"

type Publication={slug:string;name:string;viewerFollowing:boolean;followerCount:number}
type Summary={totalReactions:number;comments:number;shares:number;saves:number;viewerReaction:string|null;reactions:Record<string,number>;viewerSaved:boolean}

function compact(value:number){return new Intl.NumberFormat(undefined,{notation:value>=1000?"compact":"standard",maximumFractionDigits:1}).format(value)}

export function MagazineEngagementDock({issueSlug,publicationSlug,publicationName,authenticated=false}:{issueSlug:string;publicationSlug:string;publicationName:string;authenticated?:boolean}){
  const {data:session}=authClient.useSession()
  const signedIn=Boolean(session?.user)||authenticated
  const [publication,setPublication]=useState<Publication|null>(null)
  const [busy,setBusy]=useState(false)
  const [open,setOpen]=useState(false)
  const [summary,setSummary]=useState<Summary|null>(null)
  const rootRef=useRef<HTMLDivElement|null>(null)

  useEffect(()=>{let alive=true;fetch("/api/publications",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(!alive)return;const found=(data?.publications??[]).find((item:Publication)=>item.slug===publicationSlug);if(found)setPublication(found)}).catch(()=>{});return()=>{alive=false}},[publicationSlug])
  useEffect(()=>{const close=(event:PointerEvent)=>{if(!rootRef.current?.contains(event.target as Node))setOpen(false)};window.addEventListener("pointerdown",close);return()=>window.removeEventListener("pointerdown",close)},[])

  async function toggleFollow(){
    if(!signedIn){window.location.href=`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`;return}
    if(busy)return
    setBusy(true)
    const previous=publication
    const following=!(publication?.viewerFollowing??false)
    if(publication)setPublication({...publication,viewerFollowing:following,followerCount:Math.max(0,publication.followerCount+(following?1:-1))})
    try{const response=await fetch(`/api/publications/${encodeURIComponent(publicationSlug)}/follow`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({following})});if(!response.ok)throw new Error("Follow failed");const data=await response.json();if(data.publication)setPublication(data.publication)}catch{setPublication(previous)}finally{setBusy(false)}
  }

  const receiveSummary=useCallback((next:Summary)=>setSummary(next),[])
  const following=publication?.viewerFollowing??false
  const total=(summary?.totalReactions??0)+(summary?.comments??0)+(summary?.shares??0)+(summary?.saves??0)

  return <div ref={rootRef} className="xp-magazine-engagement" data-magazine-interactive data-no-page-turn>
    <div className="xp-magazine-engagement__identity"><span>MAGAZINE</span><strong>{publication?.name??publicationName}</strong></div>
    <div className="xp-magazine-engagement__menu">
      <button className="xp-magazine-engagement__trigger" type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-label={`${total} magazine engagements`}>
        <Activity size={16}/><strong>{compact(total)}</strong>
      </button>
      <div className="xp-magazine-engagement__popover" data-open={open}>
        <div className="xp-magazine-engagement__popover-head"><strong>Engage with this issue</strong><span>{compact(total)} total</span></div>
        <SectionEngagementBar issueSlug={issueSlug} pageSlug="__magazine__" sectionId="__magazine__" sectionSlug="__magazine__" authenticated={signedIn} variant="dock" appearance="dark" onSummaryChange={receiveSummary}/>
      </div>
    </div>
    <button className="xp-magazine-engagement__follow" data-following={following} type="button" onClick={toggleFollow} disabled={busy} aria-pressed={following}>
      {following?<UserCheck size={14}/>:<UserPlus size={14}/>}<span>{following?"Following":"Follow"}</span>
    </button>
  </div>
}
