"use client"

import { useEffect, useState } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import { SectionEngagementBar } from "./section-engagement"
import { authClient } from "../lib/auth-client"

type Publication={slug:string;name:string;viewerFollowing:boolean;followerCount:number}

export function MagazineEngagementDock({issueSlug,publicationSlug,publicationName,authenticated=false}:{issueSlug:string;publicationSlug:string;publicationName:string;authenticated?:boolean}){
  const {data:session}=authClient.useSession()
  const signedIn=Boolean(session?.user)||authenticated
  const [publication,setPublication]=useState<Publication|null>(null)
  const [busy,setBusy]=useState(false)

  useEffect(()=>{let alive=true;fetch("/api/publications",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(!alive)return;const found=(data?.publications??[]).find((item:Publication)=>item.slug===publicationSlug);if(found)setPublication(found)}).catch(()=>{});return()=>{alive=false}},[publicationSlug])

  async function toggleFollow(){
    if(!signedIn){window.location.href=`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`;return}
    if(busy)return
    setBusy(true)
    const previous=publication
    const following=!(publication?.viewerFollowing??false)
    if(publication)setPublication({...publication,viewerFollowing:following,followerCount:Math.max(0,publication.followerCount+(following?1:-1))})
    try{
      const response=await fetch(`/api/publications/${encodeURIComponent(publicationSlug)}/follow`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({following})})
      if(!response.ok)throw new Error("Follow failed")
      const data=await response.json();if(data.publication)setPublication(data.publication)
    }catch{setPublication(previous)}
    finally{setBusy(false)}
  }

  const following=publication?.viewerFollowing??false
  return <div className="xp-magazine-engagement" data-magazine-interactive data-no-page-turn>
    <div className="xp-magazine-engagement__identity"><span>MAGAZINE</span><strong>{publication?.name??publicationName}</strong></div>
    <SectionEngagementBar issueSlug={issueSlug} pageSlug="__magazine__" sectionId="__magazine__" sectionSlug="__magazine__" authenticated={signedIn} variant="panel" appearance="dark"/>
    <button className="xp-magazine-engagement__follow" data-following={following} type="button" onClick={toggleFollow} disabled={busy} aria-pressed={following}>
      {following?<UserCheck size={14}/>:<UserPlus size={14}/>}<span>{following?"Following":"Follow"}</span>
    </button>
  </div>
}
