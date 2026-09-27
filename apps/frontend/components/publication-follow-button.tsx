"use client";

import { useState } from "react";

export type PublicPublication={id:string;name:string;slug:string;city:string|null;country:string|null;description:string|null;tagline:string|null;status:"ACTIVE"|"COMING_SOON"|"DRAFT"|"ARCHIVED";followerCount:number;viewerFollowing:boolean};

export function PublicationFollowButton({publication,authenticated,className=""}:{publication:PublicPublication;authenticated:boolean;className?:string}){
 const [item,setItem]=useState(publication);const [busy,setBusy]=useState(false);
 async function toggle(){if(!authenticated){window.location.href=`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`;return}if(busy)return;setBusy(true);try{const r=await fetch(`/api/publications/${encodeURIComponent(item.slug)}/follow`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({following:!item.viewerFollowing})});if(!r.ok)throw new Error("Unable to update follow");const data=await r.json();setItem(data.publication)}finally{setBusy(false)}}
 return <button className={className} type="button" disabled={busy} aria-pressed={item.viewerFollowing} onClick={toggle}>{item.viewerFollowing?"Following":"+ Follow"}{item.followerCount>0?<span>{item.followerCount.toLocaleString()}</span>:null}</button>
}
