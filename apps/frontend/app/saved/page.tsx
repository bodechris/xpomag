"use client";

import { Bookmark, ChevronRight, FolderHeart, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { authClient } from "../../lib/auth-client";

type Collection = { id: string; name: string; itemCount: number; createdAt: string };
type SavedItem = { issueSlug: string; pageSlug: string; sectionId: string; collectionId: string; collectionName: string; createdAt: string };

function readable(value: string) {
  return value.replace(/^demo-/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SavedPage() {
  const { data: session, isPending } = authClient.useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      window.location.href = `/login?returnTo=${encodeURIComponent("/saved")}`;
      return;
    }
    fetch("/api/engagement/me/saves", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load saved items");
        return response.json();
      })
      .then((payload) => {
        setCollections(payload?.collections ?? []);
        setItems(payload?.items ?? []);
        setActiveId(payload?.collections?.[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [isPending, session?.user]);

  const visibleItems = useMemo(() => activeId ? items.filter((item) => item.collectionId === activeId) : items, [activeId, items]);
  const activeCollection = collections.find((collection) => collection.id === activeId);

  return (
    <main className="xp-saved-page">
      <SiteHeader city="Your XpoMag" />
      <section className="xp-container xp-saved-shell">
        <header className="xp-saved-hero"><p className="xp-label">Your library</p><h1>Saved collections.</h1><p>Keep the stories, places and ideas you want to come back to.</p></header>
        {loading ? <div className="xp-saved-loading"><Loader2 size={20} className="xp-spin" /> Loading your saves…</div> : (
          <div className="xp-saved-layout">
            <aside className="xp-saved-collections" aria-label="Collections">
              {collections.map((collection) => <button key={collection.id} type="button" className={activeId === collection.id ? "is-active" : ""} onClick={() => setActiveId(collection.id)}><FolderHeart size={17} /><span><strong>{collection.name}</strong><small>{collection.itemCount} item{collection.itemCount === 1 ? "" : "s"}</small></span></button>)}
            </aside>
            <div className="xp-saved-content">
              <div className="xp-saved-content__head"><div><span>Collection</span><h2>{activeCollection?.name ?? "Saved"}</h2></div><strong>{visibleItems.length}</strong></div>
              {visibleItems.length ? <div className="xp-saved-grid">{visibleItems.map((item, index) => <a className="xp-saved-card" key={`${item.collectionId}-${item.issueSlug}-${item.pageSlug}-${item.sectionId}-${index}`} href={`/magazine/${encodeURIComponent(item.issueSlug)}/${encodeURIComponent(item.pageSlug)}`}><div className="xp-saved-card__mark"><Bookmark size={18} fill="currentColor" /></div><div><small>{readable(item.issueSlug)}</small><strong>{readable(item.pageSlug)}</strong><span>{readable(item.sectionId)}</span></div><ChevronRight size={17} /></a>)}</div> : <div className="xp-saved-empty"><Bookmark size={26} /><strong>Nothing saved here yet.</strong><span>Use the bookmark button inside the magazine to add a story or section.</span></div>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
