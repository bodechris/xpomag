"use client";

import {
  ComposerCanvas,
  createDemoCoverDocument,
  type ComposerDocument,
  type ComposerNode,
  type ComposerVersion,
  type ComposerViewport,
} from "@xpomag/magazine";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { COVER_COMPOSER_STYLES } from "./cover-composer-styles";

const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000";
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";
const ISSUE_SLUG = "demo-johannesburg-001";
const PAGE_SLUG = "cover";
const STORAGE_KEY = "xpomag:admin:cover-composer:v2";
const VERSION_KEY = "xpomag:admin:cover-composer:versions:v2";
const now = () => new Date().toISOString();

type Asset = { name: string; path: string; url: string; folder: string };
type DragState = { id: string; kind: "move" | "resize"; startX: number; startY: number; startPlacement: ComposerNode["placement"] };

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function initialDoc() { return createDemoCoverDocument({ city: "Johannesburg", portraitSrc: `${FRONTEND_ORIGIN}/resources/cover-subject-placeholder.svg` }); }

export function CoverComposer() {
  const [document, setDocument] = useState<ComposerDocument>(() => initialDoc());
  const [selectedId, setSelectedId] = useState("portrait");
  const [viewport, setViewport] = useState<ComposerViewport>("desktop");
  const [leftTab, setLeftTab] = useState<"layers" | "pages">("layers");
  const [rightTab, setRightTab] = useState<"design" | "background" | "history">("design");
  const [versions, setVersions] = useState<ComposerVersion[]>([]);
  const [undoStack, setUndoStack] = useState<ComposerDocument[]>([]);
  const [redoStack, setRedoStack] = useState<ComposerDocument[]>([]);
  const [savedLabel, setSavedLabel] = useState("All changes local");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetOpen, setAssetOpen] = useState(false);
  const [assetQuery, setAssetQuery] = useState("");
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const selected = useMemo(() => document.nodes.find((node) => node.id === selectedId) ?? null, [document.nodes, selectedId]);
  const filteredAssets = useMemo(() => assets.filter((a) => `${a.name} ${a.folder}`.toLowerCase().includes(assetQuery.toLowerCase())), [assets, assetQuery]);

  useEffect(() => {
    let cancelled = false;
    const raw = localStorage.getItem(STORAGE_KEY);
    const versionRaw = localStorage.getItem(VERSION_KEY);
    if (versionRaw) { try { setVersions(JSON.parse(versionRaw)); } catch {} }

    void (async () => {
      const [assetResult, compositionResult, revisionResult] = await Promise.allSettled([
        fetch(`${FRONTEND_ORIGIN}/api/resources/images`, { cache: "no-store" }).then((res) => res.ok ? res.json() : Promise.reject(new Error("Asset library unavailable"))),
        fetch(`${API_ORIGIN}/v1/composer/${ISSUE_SLUG}/${PAGE_SLUG}`, { cache: "no-store" }).then((res) => res.ok ? res.json() : Promise.reject(new Error("Composer API unavailable"))),
        fetch(`${API_ORIGIN}/v1/composer/${ISSUE_SLUG}/${PAGE_SLUG}/revisions`, { cache: "no-store" }).then((res) => res.ok ? res.json() : Promise.reject(new Error("Revision history unavailable"))),
      ]);
      if (cancelled) return;

      let firstAsset: Asset | undefined;
      if (assetResult.status === "fulfilled") {
        const list = ((assetResult.value as { images?: Asset[] }).images ?? []).sort((a, b) => {
          const score = (x: Asset) => (/images-with-alpha/.test(x.folder) ? -10 : 0) + (/cover|portrait|person|founder|subject/i.test(x.name) ? -5 : 0);
          return score(a) - score(b) || a.name.localeCompare(b.name);
        });
        setAssets(list);
        firstAsset = list[0];
      } else {
        setAssets([]);
      }

      const remoteDraft = compositionResult.status === "fulfilled"
        ? (compositionResult.value as { state?: { draft?: ComposerDocument | null } | null }).state?.draft
        : null;

      if (revisionResult.status === "fulfilled") {
        const remoteVersions = ((revisionResult.value as { revisions?: Array<{ id: string; label: string; createdAt: string; document: ComposerDocument }> }).revisions ?? [])
          .map((revision) => ({ id: revision.id, label: revision.label, createdAt: revision.createdAt, document: revision.document }));
        if (remoteVersions.length) setVersions(remoteVersions);
      }

      if (remoteDraft) {
        setDocument(remoteDraft);
        setSavedLabel("Draft synced");
        return;
      }
      if (raw) {
        try { setDocument(JSON.parse(raw)); return; } catch {}
      }
      if (firstAsset) setDocument(createDemoCoverDocument({ city: "Johannesburg", portraitSrc: firstAsset.url }));
    })();

    return () => { cancelled = true; };
  }, []);

  const commit = (mutator: (draft: ComposerDocument) => void) => {
    setDocument((current) => {
      setUndoStack((stack) => [...stack.slice(-39), clone(current)]);
      setRedoStack([]);
      const next = clone(current); mutator(next); next.updatedAt = now(); return next;
    });
  };
  const patchSelected = (patch: Partial<ComposerNode>) => selected && commit((draft) => { const n = draft.nodes.find((x) => x.id === selected.id); if (n) Object.assign(n, patch); });
  const patchPlacement = (patch: Partial<ComposerNode["placement"]>) => selected && commit((draft) => { const n = draft.nodes.find((x) => x.id === selected.id); if (n) n.placement = { ...n.placement, ...patch }; });
  const patchText = (patch: Record<string, unknown>) => selected && commit((draft) => { const n = draft.nodes.find((x) => x.id === selected.id); if (n) n.textStyle = { ...n.textStyle, ...patch }; });
  const patchImage = (patch: Record<string, unknown>) => selected && commit((draft) => { const n = draft.nodes.find((x) => x.id === selected.id); if (n) n.imageStyle = { ...n.imageStyle, ...patch }; });

  const persistDraft = async (createLocalVersion = true) => {
    setSavedLabel("Saving…");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
    try {
      const response = await fetch(`${API_ORIGIN}/v1/composer/${ISSUE_SLUG}/${PAGE_SLUG}/draft`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ document, createRevision: createLocalVersion }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Could not save draft");
      if (createLocalVersion) {
        const version: ComposerVersion = { id: crypto.randomUUID(), label: `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, createdAt: now(), document: clone(document) };
        const next = [version, ...versions].slice(0, 20);
        setVersions(next);
        localStorage.setItem(VERSION_KEY, JSON.stringify(next));
      }
      setSavedLabel("Saved to server");
      return true;
    } catch (error) {
      setSavedLabel(error instanceof Error ? error.message : "Save failed");
      return false;
    }
  };

  const saveDraft = () => { void persistDraft(true); };

  const previewDraft = async () => {
    const previewWindow = window.open("about:blank", "_blank");
    const saved = await persistDraft(false);
    if (!saved) { previewWindow?.close(); return; }
    const url = `${FRONTEND_ORIGIN}/magazine/${ISSUE_SLUG}/${PAGE_SLUG}?preview=draft&t=${Date.now()}`;
    if (previewWindow) previewWindow.location.href = url;
    else window.open(url, "_blank");
  };

  const publish = async () => {
    setSavedLabel("Publishing…");
    try {
      const response = await fetch(`${API_ORIGIN}/v1/composer/${ISSUE_SLUG}/${PAGE_SLUG}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ document }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Could not publish");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
      setSavedLabel("Published");
    } catch (error) {
      setSavedLabel(error instanceof Error ? error.message : "Publish failed");
    }
  };
  const undo = () => { const p = undoStack.at(-1); if (!p) return; setRedoStack((s) => [...s, clone(document)]); setUndoStack((s) => s.slice(0,-1)); setDocument(clone(p)); };
  const redo = () => { const n = redoStack.at(-1); if (!n) return; setUndoStack((s) => [...s, clone(document)]); setRedoStack((s) => s.slice(0,-1)); setDocument(clone(n)); };
  const reset = () => { setUndoStack((s) => [...s, clone(document)]); setDocument(initialDoc()); setSelectedId("portrait"); };
  const duplicateSelected = () => selected && commit((draft) => { const copy = clone(selected); copy.id = `${copy.id}-${Date.now()}`; copy.name += " copy"; copy.placement.x += 2; copy.placement.y += 2; copy.placement.zIndex += 1; draft.nodes.push(copy); setSelectedId(copy.id); });

  const beginDrag = (event: ReactPointerEvent<HTMLElement>, node: ComposerNode, kind: "move" | "resize" = "move") => {
    if (node.locked) return; event.preventDefault(); event.stopPropagation(); setSelectedId(node.id);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { id: node.id, kind, startX: event.clientX, startY: event.clientY, startPlacement: clone(node.placement) };
    setUndoStack((s) => [...s.slice(-39), clone(document)]); setRedoStack([]);
  };
  const onDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current, canvas = canvasRef.current; if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect(), dx = ((event.clientX-drag.startX)/rect.width)*100, dy = ((event.clientY-drag.startY)/rect.height)*100;
    setDocument((current) => { const next=clone(current), n=next.nodes.find((x)=>x.id===drag.id); if(!n)return current;
      if(drag.kind==="move"){n.placement.x=clamp(drag.startPlacement.x+dx,-20,120); n.placement.y=clamp(drag.startPlacement.y+dy,-20,120);} else {n.placement.width=clamp(drag.startPlacement.width+dx,2,140); n.placement.height=clamp(drag.startPlacement.height+dy,2,140);} next.updatedAt=now(); return next; });
  };

  const chooseAsset = (asset: Asset) => { patchSelected({ src: asset.url }); setAssetOpen(false); };
  const canvasWidthClass = viewport === "desktop" ? "is-desktop" : viewport === "tablet" ? "is-tablet" : "is-mobile";

  return <>
    <style dangerouslySetInnerHTML={{ __html: COVER_COMPOSER_STYLES + EXTRA_STYLES }} />
    <main className="xp-composer-shell">
      <header className="xp-composer-topbar">
        <div className="xp-composer-brand"><span className="xp-composer-brandmark">XpoMag</span><span>Admin</span></div>
        <div className="xp-composer-breadcrumb"><span>Issue 001</span><i>/</i><strong>Cover</strong><span className="xp-status-dot">Draft</span></div>
        <div className="xp-composer-actions"><button onClick={undo} disabled={!undoStack.length}>↶</button><button onClick={redo} disabled={!redoStack.length}>↷</button><span className="xp-save-status">{savedLabel}</span><button onClick={() => void previewDraft()}>Preview draft</button><button onClick={saveDraft}>Save draft</button><button className="is-primary" onClick={() => void publish()}>Publish</button></div>
      </header>

      <section className="xp-composer-workspace">
        <aside className="xp-composer-sidebar xp-composer-sidebar--left">
          <div className="xp-panel-tabs"><button className={leftTab==="layers"?"is-active":""} onClick={()=>setLeftTab("layers")}>Layers</button><button className={leftTab==="pages"?"is-active":""} onClick={()=>setLeftTab("pages")}>Pages</button></div>
          {leftTab==="layers" ? <div className="xp-layer-panel"><div className="xp-panel-heading"><span>Cover layers</span><button onClick={duplicateSelected}>＋</button></div>{[...document.nodes].sort((a,b)=>b.placement.zIndex-a.placement.zIndex).map((node)=><button key={node.id} className={`xp-layer-row ${selectedId===node.id?"is-selected":""}`} onClick={()=>setSelectedId(node.id)}><span className="xp-layer-icon">{node.kind==="image"?"▧":node.kind==="shape"?"■":node.kind==="brand"?"A":"T"}</span><span className="xp-layer-name">{node.name}</span><span className="xp-layer-z">{node.placement.zIndex}</span></button>)}</div> : <Pages/>}
        </aside>

        <section className="xp-composer-center">
          <div className="xp-composer-canvasbar"><Segmented value={viewport} options={["desktop","tablet","mobile"]} onChange={(v)=>setViewport(v as ComposerViewport)}/><div className="xp-canvas-tools"><button onClick={reset}>Reset template</button><span>1200 × 1600</span><span>100%</span></div></div>
          <div className="xp-canvas-scroll">
            <div className={`xp-cover-stage ${canvasWidthClass}`}>
              <ComposerCanvas document={document} selectedId={selectedId} canvasRef={canvasRef} className="xp-cover-canvas" onCanvasPointerMove={onDrag} onCanvasPointerUp={()=>{dragRef.current=null}} onNodePointerDown={(e,n)=>beginDrag(e,n)} renderNodeOverlay={(node)=> selectedId===node.id ? <><span className="xp-node-label">{node.name}</span>{!node.locked?<button className="xp-resize-handle" aria-label="Resize layer" onPointerDown={(e)=>beginDrag(e,node,"resize")}/>:null}</>:null}/>
              <div className="xp-safe-area" aria-hidden="true" />
            </div>
          </div>
        </section>

        <aside className="xp-composer-sidebar xp-composer-sidebar--right">
          <div className="xp-panel-tabs"><button className={rightTab==="design"?"is-active":""} onClick={()=>setRightTab("design")}>Design</button><button className={rightTab==="background"?"is-active":""} onClick={()=>setRightTab("background")}>Background</button><button className={rightTab==="history"?"is-active":""} onClick={()=>setRightTab("history")}>History</button></div>
          {rightTab==="design" ? selected ? <Inspector node={selected} patchPlacement={patchPlacement} patchText={patchText} patchImage={patchImage} patchSelected={patchSelected} duplicate={duplicateSelected} openAssets={()=>setAssetOpen(true)} /> : <div className="xp-empty-panel">Select a layer.</div> : null}
          {rightTab==="background" ? <BackgroundInspector document={document} commit={commit}/> : null}
          {rightTab==="history" ? <div className="xp-history-panel"><button className="xp-history-current"><span>Current</span><strong>{new Date(document.updatedAt).toLocaleString()}</strong></button>{versions.map((v)=><button key={v.id} onClick={()=>{setUndoStack((s)=>[...s,clone(document)]);setDocument(clone(v.document));}}><span>{v.label}</span><strong>{new Date(v.createdAt).toLocaleDateString()}</strong></button>)}</div>:null}
        </aside>
      </section>
    </main>
    {assetOpen ? <AssetPicker assets={filteredAssets} query={assetQuery} setQuery={setAssetQuery} onClose={()=>setAssetOpen(false)} onChoose={chooseAsset}/> : null}
  </>;
}

function Inspector({node,patchPlacement,patchText,patchImage,patchSelected,duplicate,openAssets}:{node:ComposerNode;patchPlacement:(p:Partial<ComposerNode["placement"]>)=>void;patchText:(p:Record<string,unknown>)=>void;patchImage:(p:Record<string,unknown>)=>void;patchSelected:(p:Partial<ComposerNode>)=>void;duplicate:()=>void;openAssets:()=>void}){
  return <div className="xp-properties"><div className="xp-property-title"><div><small>{node.kind}</small><strong>{node.name}</strong></div><button onClick={duplicate}>Duplicate</button></div>
    <PropertyGroup title="Geometry"><SliderNumber label="X" value={node.placement.x} min={-20} max={100} onChange={(v)=>patchPlacement({x:v})}/><SliderNumber label="Y" value={node.placement.y} min={-20} max={100} onChange={(v)=>patchPlacement({y:v})}/><SliderNumber label="Width" value={node.placement.width} min={2} max={120} onChange={(v)=>patchPlacement({width:v})}/><SliderNumber label="Height" value={node.placement.height} min={2} max={120} onChange={(v)=>patchPlacement({height:v})}/><NumberBox label="Layer" value={node.placement.zIndex} onChange={(v)=>patchPlacement({zIndex:Math.round(v)})}/><NumberBox label="Rotate" value={node.placement.rotate??0} onChange={(v)=>patchPlacement({rotate:v})}/></PropertyGroup>
    {(node.kind==="text"||node.kind==="brand") && node.textStyle ? <><PropertyGroup title="Typography"><label className="xp-control"><span>Typeface</span><select value={node.textStyle.fontFamily??""} onChange={(e)=>patchText({fontFamily:e.target.value})}><option value="var(--font-geist-sans, Arial, sans-serif)">Geist / Helvetica</option><option value="Georgia, 'Times New Roman', serif">Editorial Serif</option><option value="Arial, sans-serif">Arial</option></select></label><label className="xp-control"><span>Weight</span><select value={node.textStyle.fontWeight??500} onChange={(e)=>patchText({fontWeight:Number(e.target.value)})}>{[300,400,500,600,700,800,900].map(w=><option key={w}>{w}</option>)}</select></label><SliderNumber label="Size" value={node.textStyle.fontSize??24} min={8} max={180} step={1} onChange={(v)=>patchText({fontSize:v})}/><SliderNumber label="Line" value={node.textStyle.lineHeight??1} min={0.65} max={2} step={0.01} onChange={(v)=>patchText({lineHeight:v})}/><SliderNumber label="Tracking" value={node.textStyle.letterSpacing??0} min={-12} max={20} step={0.1} onChange={(v)=>patchText({letterSpacing:v})}/><div className="xp-control"><span>Align</span><Segmented value={node.textStyle.textAlign??"left"} options={["left","center","right"]} onChange={(v)=>patchText({textAlign:v})}/></div></PropertyGroup><label className="xp-field xp-field--stack"><span>Content</span><textarea value={node.content??""} onChange={(e)=>patchSelected({content:e.target.value})}/></label><ColorControl value={node.textStyle.color??"#111111"} onChange={(v)=>patchText({color:v})}/></> : null}
    {node.kind==="image" ? <><div className="xp-image-card"><div className="xp-image-thumb"><img src={node.src} alt=""/></div><div><strong>{node.src?.split("/").pop()}</strong><button onClick={openAssets}>Change image</button></div></div><PropertyGroup title="Image"><div className="xp-control xp-control--wide"><span>Fit</span><Segmented value={node.imageStyle?.objectFit??"contain"} options={["contain","cover"]} onChange={(v)=>patchImage({objectFit:v})}/></div><div className="xp-control xp-control--wide"><span>Focal point</span><ObjectPositionGrid value={node.imageStyle?.objectPosition??"50% 50%"} onChange={(v)=>patchImage({objectPosition:v})}/></div><SliderNumber label="Opacity" value={(node.imageStyle?.opacity??1)*100} min={0} max={100} onChange={(v)=>patchImage({opacity:v/100})}/><label className="xp-control"><span>Blend</span><select value={node.imageStyle?.mixBlendMode??"normal"} onChange={(e)=>patchImage({mixBlendMode:e.target.value})}>{["normal","multiply","screen","overlay","soft-light","darken","lighten"].map(x=><option key={x}>{x}</option>)}</select></label></PropertyGroup></>:null}
    <PropertyGroup title="Story link & engagement">
      <ToggleRow label="Links to magazine story" checked={Boolean(node.story)} onChange={(v)=>patchSelected({story:v ? {id:node.id,targetPageSlug:"editorial",targetSectionSlug:"rosebank-nine-yards",engagementAnchor:true,engagementAppearance:"dark"} : undefined})}/>
      {node.story ? <>
        <label className="xp-control"><span>Destination page</span><input value={node.story.targetPageSlug} onChange={(e)=>patchSelected({story:{...node.story!,targetPageSlug:e.target.value}})}/></label>
        <label className="xp-control"><span>Section anchor</span><input value={node.story.targetSectionSlug} onChange={(e)=>patchSelected({story:{...node.story!,targetSectionSlug:e.target.value}})}/></label>
        <ToggleRow label="Show engagement under this layer" checked={Boolean(node.story.engagementAnchor)} onChange={(v)=>patchSelected({story:{...node.story!,engagementAnchor:v}})}/>
        <label className="xp-control"><span>Engagement tone</span><select value={node.story.engagementAppearance??"auto"} onChange={(e)=>patchSelected({story:{...node.story!,engagementAppearance:e.target.value as "auto"|"light"|"dark"}})}><option value="auto">Auto</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
      </> : null}
    </PropertyGroup>
    <ToggleRow label="Lock layer" checked={Boolean(node.locked)} onChange={(v)=>patchSelected({locked:v})}/><ToggleRow label="Hide layer" checked={Boolean(node.hidden)} onChange={(v)=>patchSelected({hidden:v})}/>
  </div>;
}

function BackgroundInspector({document,commit}:{document:ComposerDocument;commit:(m:(d:ComposerDocument)=>void)=>void}){return <div className="xp-properties"><div className="xp-property-title"><div><small>page</small><strong>Background stack</strong></div><button onClick={()=>commit(d=>d.background.push({id:crypto.randomUUID(),name:"New layer",kind:"solid",value:"#ffffff",opacity:1,blendMode:"normal"}))}>Add</button></div>{document.background.map((layer,index)=><div key={layer.id} className="xp-background-row"><div><span>{index+1}</span><strong>{layer.name}</strong><small>{layer.kind}</small></div>{layer.kind==="solid"?<ColorControl value={layer.value} onChange={(v)=>commit(d=>{const x=d.background.find(y=>y.id===layer.id);if(x)x.value=v})}/>:<label className="xp-field xp-field--stack"><span>{layer.kind==="gradient"?"Gradient CSS":"Image URL"}</span><textarea value={layer.value} onChange={(e)=>commit(d=>{const x=d.background.find(y=>y.id===layer.id);if(x)x.value=e.target.value})}/></label>}<SliderNumber label="Opacity" value={layer.opacity*100} min={0} max={100} onChange={(v)=>commit(d=>{const x=d.background.find(y=>y.id===layer.id);if(x)x.opacity=v/100})}/><label className="xp-control"><span>Blend</span><select value={layer.blendMode??"normal"} onChange={(e)=>commit(d=>{const x=d.background.find(y=>y.id===layer.id);if(x)x.blendMode=e.target.value})}>{["normal","multiply","screen","overlay","soft-light","hard-light","color-burn","color-dodge"].map(x=><option key={x}>{x}</option>)}</select></label></div>)}</div>}

function AssetPicker({assets,query,setQuery,onClose,onChoose}:{assets:Asset[];query:string;setQuery:(v:string)=>void;onClose:()=>void;onChoose:(a:Asset)=>void}){return <div className="xp-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="xp-asset-modal" role="dialog" aria-modal="true" aria-label="Choose image" onMouseDown={(e)=>e.stopPropagation()}><header><div><small>Frontend resources</small><h2>Choose image</h2></div><button onClick={onClose}>×</button></header><div className="xp-asset-search"><input autoFocus placeholder="Search images…" value={query} onChange={(e)=>setQuery(e.target.value)}/><span>{assets.length} images</span></div><div className="xp-asset-grid">{assets.map((a)=><button key={a.url} onClick={()=>onChoose(a)}><div><img src={a.url} alt={a.name}/></div><strong>{a.name}</strong><span>{a.folder}</span></button>)}{!assets.length?<p>No images found. Add files under apps/frontend/public/resources and keep the frontend app running.</p>:null}</div></section></div>}

function Pages(){return <div className="xp-page-panel">{["Cover","Contents","Rosebank in motion","Sandton goes vertical","Hospitality playbook","Movement","Local edit","Events","Directory","Founding partner","Closing page"].map((p,i)=><button key={p} className={i===0?"is-active":""}><span>{String(i+1).padStart(2,"0")}</span><strong>{p}</strong><em>{i===0?"In design":"Draft"}</em></button>)}</div>}
function PropertyGroup({title,children}:{title:string;children:ReactNode}){return <section className="xp-property-group"><h3>{title}</h3><div className="xp-semantic-grid">{children}</div></section>}
function NumberBox({label,value,onChange}:{label:string;value:number;onChange:(n:number)=>void}){return <label className="xp-control"><span>{label}</span><input type="number" value={Number(value.toFixed(2))} onChange={(e)=>onChange(Number(e.target.value))}/></label>}
function SliderNumber({label,value,min,max,step=.1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(n:number)=>void}){return <label className="xp-slider-control"><span>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(Number(e.target.value))}/><input type="number" min={min} max={max} step={step} value={Number(value.toFixed(2))} onChange={(e)=>onChange(Number(e.target.value))}/></label>}
function Segmented({value,options,onChange}:{value:string;options:string[];onChange:(v:string)=>void}){return <div className="xp-segmented" role="group">{options.map(o=><button type="button" key={o} className={value===o?"is-active":""} onClick={()=>onChange(o)}>{o}</button>)}</div>}
function ToggleRow({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <div className="xp-toggle-row"><span>{label}</span><button role="switch" aria-checked={checked} className={`xp-switch ${checked?"is-on":""}`} onClick={()=>onChange(!checked)}><i/></button></div>}
function ColorControl({value,onChange}:{value:string;onChange:(v:string)=>void}){const safe=/^#[0-9a-f]{6}$/i.test(value)?value:"#111111";return <label className="xp-color-control"><span>Color</span><div><input type="color" value={safe} onChange={(e)=>onChange(e.target.value)}/><input value={value} onChange={(e)=>onChange(e.target.value)}/></div></label>}
function ObjectPositionGrid({value,onChange}:{value:string;onChange:(v:string)=>void}){const pts=[["0% 0%","↖"],["50% 0%","↑"],["100% 0%","↗"],["0% 50%","←"],["50% 50%","•"],["100% 50%","→"],["0% 100%","↙"],["50% 100%","↓"],["100% 100%","↘"]];return <div className="xp-focal-grid">{pts.map(([v,l])=><button key={v} className={value===v?"is-active":""} onClick={()=>onChange(v)} title={v}>{l}</button>)}</div>}

const EXTRA_STYLES = `
.xp-semantic-grid{display:grid;gap:10px}.xp-control{display:grid;gap:5px;min-width:0}.xp-control>span,.xp-slider-control>span,.xp-color-control>span{color:#777;font-size:9px;font-weight:730}.xp-control select,.xp-control input{height:32px;width:100%;border:1px solid rgba(0,0,0,.1);border-radius:7px;background:#fff;padding:0 8px;font-size:10px}.xp-control--wide{grid-column:1/-1}.xp-slider-control{display:grid;grid-template-columns:58px 1fr 58px;align-items:center;gap:7px}.xp-slider-control input[type=range]{width:100%;accent-color:#2f55ff}.xp-slider-control input[type=number]{width:58px;height:30px;border:1px solid rgba(0,0,0,.1);border-radius:6px;padding:0 6px;background:#fff;font-size:10px}.xp-segmented{display:inline-flex;padding:3px;border:1px solid rgba(0,0,0,.1);border-radius:8px;background:#fff}.xp-segmented button{border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#777;font-size:9px;text-transform:capitalize}.xp-segmented button.is-active{background:#111;color:#fff}.xp-image-card{display:grid;grid-template-columns:64px 1fr;gap:10px;padding:12px 0;border-bottom:1px solid rgba(0,0,0,.08)}.xp-image-thumb{width:64px;height:64px;border-radius:8px;background:#e9e9e5;overflow:hidden}.xp-image-thumb img{width:100%;height:100%;object-fit:contain}.xp-image-card>div:last-child{display:flex;flex-direction:column;align-items:flex-start;gap:7px;min-width:0}.xp-image-card strong{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.xp-image-card button{border:1px solid rgba(0,0,0,.12);border-radius:7px;background:#fff;padding:6px 8px;font-size:9px;cursor:pointer}.xp-focal-grid{display:grid;grid-template-columns:repeat(3,28px);gap:3px}.xp-focal-grid button{width:28px;height:25px;border:1px solid rgba(0,0,0,.1);background:#fff;font-size:10px}.xp-focal-grid button.is-active{background:#111;color:#fff}.xp-switch{width:32px!important;height:19px!important;padding:2px!important;border:0!important;border-radius:99px!important;background:#d8d8d2!important}.xp-switch i{display:block;width:15px;height:15px;border-radius:50%;background:#fff;transition:transform .15s}.xp-switch.is-on{background:#111!important}.xp-switch.is-on i{transform:translateX(13px)}.xp-color-control{display:grid;gap:5px;margin-top:12px}.xp-color-control>div{display:grid;grid-template-columns:36px 1fr;gap:6px}.xp-color-control input{height:32px;border:1px solid rgba(0,0,0,.1);border-radius:7px;background:#fff;padding:3px 7px;font-size:10px}.xp-modal-backdrop{position:fixed;z-index:1000;inset:0;background:rgba(0,0,0,.38);backdrop-filter:blur(4px);display:grid;place-items:center;padding:24px}.xp-asset-modal{width:min(980px,92vw);height:min(760px,88vh);display:grid;grid-template-rows:auto auto 1fr;background:#f8f8f5;border-radius:16px;box-shadow:0 34px 120px rgba(0,0,0,.3);overflow:hidden}.xp-asset-modal header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(0,0,0,.09)}.xp-asset-modal h2{margin:2px 0 0;font-size:20px}.xp-asset-modal header small{color:#888;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.xp-asset-modal header button{width:32px;height:32px;border:0;border-radius:8px;background:#e9e9e5;font-size:20px}.xp-asset-search{display:flex;gap:12px;align-items:center;padding:12px 18px;border-bottom:1px solid rgba(0,0,0,.07)}.xp-asset-search input{flex:1;height:36px;border:1px solid rgba(0,0,0,.12);border-radius:9px;background:white;padding:0 12px}.xp-asset-search span{color:#888;font-size:10px}.xp-asset-grid{padding:16px;overflow:auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-content:start}.xp-asset-grid>button{min-width:0;padding:0 0 9px;border:1px solid rgba(0,0,0,.08);border-radius:10px;background:#fff;overflow:hidden;text-align:left;cursor:pointer}.xp-asset-grid>button>div{aspect-ratio:1.15;background:#ecece8;display:grid;place-items:center}.xp-asset-grid img{width:100%;height:100%;object-fit:contain}.xp-asset-grid strong,.xp-asset-grid span{display:block;padding:0 9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xp-asset-grid strong{margin-top:8px;font-size:10px}.xp-asset-grid span{margin-top:3px;color:#888;font-size:8px}.xp-cover-stage [data-composer-node]{cursor:move}.xp-cover-stage [data-selected=true]{outline:1.5px solid #2f55ff;outline-offset:1px}
`;
