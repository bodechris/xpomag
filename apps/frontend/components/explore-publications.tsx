"use client";

import { useState } from "react";

type Publication = {
  id:string; name:string; slug:string; city:string|null; country:string|null; description:string|null; tagline:string|null;
  status:"ACTIVE"|"COMING_SOON"|"DRAFT"|"ARCHIVED"; followerCount:number; viewerFollowing:boolean;
};

export function ExplorePublications({ initialPublications, authenticated }: { initialPublications:Publication[]; authenticated:boolean }) {
  const [items,setItems]=useState(initialPublications);
  const [busy,setBusy]=useState<string|null>(null);
  async function toggle(publication:Publication) {
    if(!authenticated){ window.location.href=`/auth?mode=signup&next=${encodeURIComponent("/explore")}`; return; }
    setBusy(publication.slug);
    try {
      const response=await fetch(`/api/publications/${encodeURIComponent(publication.slug)}/follow`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({following:!publication.viewerFollowing})});
      if(!response.ok) throw new Error("Unable to update follow");
      const payload=await response.json();
      setItems(current=>current.map(item=>item.slug===publication.slug?payload.publication:item));
    } finally { setBusy(null); }
  }
  const active=items.filter(item=>item.status==="ACTIVE");
  const coming=items.filter(item=>item.status==="COMING_SOON");
  return <div className="xp-explore">
    <section className="xp-explore__hero">
      <a className="xp-explore__brand" href="/">XpoMag</a>
      <p className="xp-explore__eyebrow">EXPLORE XPOMAG</p>
      <h1>Every City<br/>Has a Story.</h1>
      <p className="xp-explore__intro">Find and follow the social magazines for the cities you care about. New issues, people, places and discoveries will live here.</p>
    </section>
    <section className="xp-explore__section">
      <div className="xp-explore__heading"><div><p>NOW PUBLISHING</p><h2>Start with a city.</h2></div><span>{active.length} live</span></div>
      <div className="xp-publication-grid">{active.map((p,index)=><article className={`xp-publication-card xp-publication-card--${index%2?"dark":"light"}`} key={p.id}>
        <div className="xp-publication-card__top"><span>{p.country}</span><span>LIVE</span></div>
        <div><p className="xp-publication-card__label">XPOMAG</p><h3>{p.city ?? p.name.replace("XpoMag ","")}</h3><p>{p.tagline ?? p.description}</p></div>
        <div className="xp-publication-card__actions"><button disabled={busy===p.slug} onClick={()=>toggle(p)}>{p.viewerFollowing?"✓ Following":"+ Follow"}</button><a href={`/magazine/demo-${(p.city ?? p.slug).toLowerCase().replace(/\s+/g,"-")}-001/cover`}>Open issue →</a></div>
        <small>{p.followerCount ? `${p.followerCount.toLocaleString()} follower${p.followerCount===1?"":"s"}` : "Be among the first to follow"}</small>
      </article>)}</div>
    </section>
    {coming.length?<section className="xp-explore__section xp-explore__coming">
      <div className="xp-explore__heading"><div><p>COMING TO XPOMAG</p><h2>Follow before launch.</h2></div></div>
      <div className="xp-coming-grid">{coming.map(p=><article key={p.id}><div><strong>{p.city ?? p.name}</strong><span>{p.country}</span></div><button disabled={busy===p.slug} onClick={()=>toggle(p)}>{p.viewerFollowing?"✓ Following":"+ Follow"}</button></article>)}</div>
    </section>:null}
  </div>;
}
