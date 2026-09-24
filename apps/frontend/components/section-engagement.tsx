"use client";

import {
  Bookmark,
  Check,
  ChevronRight,
  Copy,
  FolderPlus,
  Heart,
  Lightbulb,
  Link2,
  MessageCircle,
  PartyPopper,
  Send,
  Share2,
  ThumbsUp,
  X,
} from "lucide-react";
import type { MagazineEngagementConfig } from "@xpomag/magazine";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { authClient } from "../lib/auth-client";

type Reaction = "like" | "love" | "insightful" | "celebrate";
type EngagementSummary = {
  reactions: Record<Reaction, number>;
  totalReactions: number;
  comments: number;
  shares: number;
  saves: number;
  viewerReaction: Reaction | null;
  viewerSaved: boolean;
};
type CommentItem = { id: string; userId: string; userName?: string | null; body: string; parentId: string | null; createdAt: string };
type SaveCollection = { id: string; name: string; itemCount: number; createdAt: string };
type FloatingPopoverPosition = { left: number; top: number; width: number; maxHeight: number };

type Props = {
  issueSlug: string;
  pageSlug: string;
  sectionId: string;
  sectionSlug: string;
  authenticated?: boolean;
  config?: MagazineEngagementConfig;
  variant?: "inline" | "panel";
  appearance?: "auto" | "light" | "dark";
};

const EMPTY_SUMMARY: EngagementSummary = {
  reactions: { like: 0, love: 0, insightful: 0, celebrate: 0 },
  totalReactions: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  viewerReaction: null,
  viewerSaved: false,
};

const reactionMeta: Record<Reaction, { label: string; icon: typeof ThumbsUp }> = {
  like: { label: "Like", icon: ThumbsUp },
  love: { label: "Love", icon: Heart },
  insightful: { label: "Insightful", icon: Lightbulb },
  celebrate: { label: "Celebrate", icon: PartyPopper },
};

function compactCount(value: number) {
  return new Intl.NumberFormat(undefined, { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function SectionEngagementBar({ issueSlug, pageSlug, sectionId, sectionSlug, authenticated = false, config, variant = "inline", appearance = "auto" }: Props) {
  const { data: session } = authClient.useSession();
  const viewerAuthenticated = Boolean(session?.user) || authenticated;
  const viewerId = session?.user?.id ?? null;
  const enabled = {
    reactions: config?.reactions !== false,
    comments: config?.comments !== false,
    share: config?.share !== false,
    save: config?.save !== false,
  };
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [reactionOpen, setReactionOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [collections, setCollections] = useState<SaveCollection[]>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [sharePopoverPosition, setSharePopoverPosition] = useState<FloatingPopoverPosition | null>(null);
  const [inlinePosition, setInlinePosition] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (variant !== "inline") return;
    const root = rootRef.current;
    if (!root) return;

    const place = () => {
      const coverOverlay = root.closest<HTMLElement>(".xp-cover-story-engagement");
      if (coverOverlay) {
        const storyNode = coverOverlay.closest<HTMLElement>("[data-composer-node][data-story-id]");
        if (!storyNode) return;
        const nodeRect = storyNode.getBoundingClientRect();
        const scaleX = nodeRect.width / Math.max(1, storyNode.offsetWidth || nodeRect.width);
        const scaleY = nodeRect.height / Math.max(1, storyNode.offsetHeight || nodeRect.height);
        const contentEls = Array.from(storyNode.querySelectorAll<HTMLElement>("h1,h2,h3,p,span"))
          .filter((el) => !el.closest(".xp-cover-story-engagement") && el.getClientRects().length > 0);
        if (!contentEls.length) return;
        const rects = contentEls.map((el) => el.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0);
        if (!rects.length) return;
        const left = Math.min(...rects.map((rect) => rect.left));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));
        const safe = 8;
        coverOverlay.style.left = `${Math.max(safe, (left - nodeRect.left) / Math.max(scaleX, .001))}px`;
        coverOverlay.style.top = `${Math.max(safe, (bottom - nodeRect.top) / Math.max(scaleY, .001) + 8)}px`;
        coverOverlay.style.maxWidth = `calc(100% - ${safe * 2}px)`;
        return;
      }

      const section = root.closest<HTMLElement>("[data-magazine-section]");
      if (!section) return;
      const sectionRect = section.getBoundingClientRect();
      const scaleX = sectionRect.width / Math.max(1, section.offsetWidth || sectionRect.width);
      const scaleY = sectionRect.height / Math.max(1, section.offsetHeight || sectionRect.height);
      const headings = Array.from(section.querySelectorAll<HTMLElement>("h1,h2,h3"))
        .filter((el) => !el.closest(".xp-section-engagement") && el.getClientRects().length > 0);
      const heading = headings[0];
      if (!heading) {
        setInlinePosition(undefined);
        return;
      }

      const headingRect = heading.getBoundingClientRect();
      const paragraphs = Array.from(section.querySelectorAll<HTMLElement>("p"))
        .filter((el) => !el.closest(".xp-section-engagement") && el.getClientRects().length > 0)
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.top >= headingRect.bottom - 2 && rect.top < headingRect.bottom + sectionRect.height * .28);
      const descriptionRect = paragraphs[0]?.rect;
      const anchorBottom = Math.max(headingRect.bottom, descriptionRect?.bottom ?? headingRect.bottom);
      const safe = 12;
      const rootWidth = root.getBoundingClientRect().width / Math.max(scaleX, .001);
      const sectionWidth = section.offsetWidth || sectionRect.width;
      const rawLeft = (headingRect.left - sectionRect.left) / Math.max(scaleX, .001);
      const left = Math.min(Math.max(safe, rawLeft), Math.max(safe, sectionWidth - rootWidth - safe));
      const rootHeight = root.getBoundingClientRect().height / Math.max(scaleY, .001);
      const sectionHeight = section.offsetHeight || sectionRect.height;
      const rawTop = (anchorBottom - sectionRect.top) / Math.max(scaleY, .001) + 10;
      const top = Math.min(Math.max(safe, rawTop), Math.max(safe, sectionHeight - rootHeight - safe));

      setInlinePosition({ position: "absolute", left, right: "auto", top, bottom: "auto", maxWidth: `calc(100% - ${safe * 2}px)` });
    };

    place();
    const section = root.closest<HTMLElement>("[data-magazine-section]");
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    if (section) observer?.observe(section);
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [variant]);

  const endpoint = useMemo(
    () => `/api/engagement/${encodeURIComponent(issueSlug)}/${encodeURIComponent(pageSlug)}/${encodeURIComponent(sectionId)}`,
    [issueSlug, pageSlug, sectionId],
  );

  const request = useCallback(async (path = "", init?: RequestInit) => {
    const response = await fetch(`${endpoint}${path}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
    if (response.status === 401) {
      setAuthOpen(true);
      throw new Error("Authentication required");
    }
    if (!response.ok) throw new Error(`Engagement request failed (${response.status})`);
    return response.json();
  }, [endpoint]);

  useEffect(() => {
    let alive = true;
    request().then((payload) => { if (alive && payload?.summary) setSummary(payload.summary); }).catch(() => undefined);
    return () => { alive = false; };
  }, [request]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setReactionOpen(false);
        setShareOpen(false);
        setSaveOpen(false);
      }
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (!commentOpen && !saveOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (saveOpen) setSaveOpen(false);
      if (commentOpen) setCommentOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commentOpen, saveOpen]);

  const requireAuth = () => {
    if (viewerAuthenticated) return true;
    setReactionOpen(false);
    setShareOpen(false);
    setSaveOpen(false);
    setAuthOpen(true);
    return false;
  };

  const chooseReaction = async (reaction: Reaction) => {
    if (!requireAuth() || busy) return;
    const previous = summary;
    const nextReaction = summary.viewerReaction === reaction ? null : reaction;
    setReactionOpen(false);
    setSummary((current) => {
      const reactions = { ...current.reactions };
      if (current.viewerReaction) reactions[current.viewerReaction] = Math.max(0, reactions[current.viewerReaction] - 1);
      if (nextReaction) reactions[nextReaction] += 1;
      return { ...current, reactions, totalReactions: Object.values(reactions).reduce<number>((a, b) => a + b, 0), viewerReaction: nextReaction };
    });
    try {
      setBusy(true);
      const payload = await request("/reaction", { method: "PUT", body: JSON.stringify({ reaction: nextReaction }) });
      if (payload?.summary) setSummary(payload.summary);
    } catch { setSummary(previous); } finally { setBusy(false); }
  };

  const openComments = async () => {
    if (!requireAuth()) return;
    setCommentOpen(true);
    try {
      const payload = await request("/comments");
      setComments(payload?.comments ?? []);
    } catch { /* modal stays usable if the API temporarily fails */ }
  };

  const postComment = async () => {
    const body = commentBody.trim();
    if (!body || busy || !requireAuth()) return;
    try {
      setBusy(true);
      const payload = await request("/comments", { method: "POST", body: JSON.stringify({ body }) });
      if (payload?.comment) {
        setComments((items) => [...items, payload.comment]);
        setSummary((current) => ({ ...current, comments: current.comments + 1 }));
        setCommentBody("");
      }
    } finally { setBusy(false); }
  };

  const deleteComment = async (commentId: string) => {
    if (!viewerAuthenticated || busy) return;
    try {
      setBusy(true);
      const payload = await request(`/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
      if (payload?.ok) {
        setComments((items) => items.filter((item) => item.id !== commentId));
        if (payload?.summary) setSummary(payload.summary);
        else setSummary((current) => ({ ...current, comments: Math.max(0, current.comments - 1) }));
      }
    } finally { setBusy(false); }
  };

  const recordShare = async (channel: string) => {
    if (!requireAuth()) return false;
    try {
      const payload = await request("/share", { method: "POST", body: JSON.stringify({ channel }) });
      if (payload?.summary) setSummary(payload.summary);
      return true;
    } catch { return false; }
  };

  const sectionUrl = () => `${window.location.origin}/magazine/${encodeURIComponent(issueSlug)}/${encodeURIComponent(pageSlug)}#${encodeURIComponent(sectionSlug)}`;

  const nativeShare = async () => {
    if (!requireAuth()) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "XpoMag", text: "Worth a look on XpoMag", url: sectionUrl() });
        await recordShare("native");
        setShareOpen(false);
        return;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  const copyLink = async () => {
    if (!(await recordShare("copy"))) return;
    await navigator.clipboard.writeText(sectionUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const shareTo = async (channel: "linkedin" | "facebook" | "x" | "whatsapp" | "email") => {
    if (!(await recordShare(channel))) return;
    const url = encodeURIComponent(sectionUrl());
    const text = encodeURIComponent("Worth a look on XpoMag");
    const targets = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://x.com/intent/post?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${encodeURIComponent("XpoMag")}&body=${text}%0A%0A${url}`,
    };
    window.open(targets[channel], "_blank", "noopener,noreferrer,width=720,height=620");
    setShareOpen(false);
  };

  const loadSaveCollections = async () => {
    if (!requireAuth()) return false;
    try {
      const payload = await request("/save/collections");
      setCollections(payload?.collections ?? []);
      setSavedCollectionIds(payload?.savedCollectionIds ?? []);
      return true;
    } catch {
      return false;
    }
  };

  const openSavePicker = async () => {
    if (!requireAuth() || busy) return;
    setShareOpen(false);
    setReactionOpen(false);
    const next = !saveOpen;
    setSaveOpen(next);
    if (next) await loadSaveCollections();
  };

  const updateSavedCollections = async (nextIds: string[]) => {
    if (busy) return;
    const previousIds = savedCollectionIds;
    const previousSummary = summary;
    setSavedCollectionIds(nextIds);
    setSummary((current) => ({
      ...current,
      viewerSaved: nextIds.length > 0,
      saves: Math.max(0, current.saves + (previousIds.length === 0 && nextIds.length > 0 ? 1 : previousIds.length > 0 && nextIds.length === 0 ? -1 : 0)),
    }));
    try {
      setBusy(true);
      const payload = await request("/save", { method: "PUT", body: JSON.stringify({ collectionIds: nextIds }) });
      if (payload?.summary) setSummary(payload.summary);
      if (payload?.collections) setCollections(payload.collections);
      if (payload?.savedCollectionIds) setSavedCollectionIds(payload.savedCollectionIds);
    } catch {
      setSavedCollectionIds(previousIds);
      setSummary(previousSummary);
    } finally {
      setBusy(false);
    }
  };

  const toggleCollection = async (collectionId: string) => {
    const nextIds = savedCollectionIds.includes(collectionId)
      ? savedCollectionIds.filter((id) => id !== collectionId)
      : [...savedCollectionIds, collectionId];
    await updateSavedCollections(nextIds);
  };

  const createSaveCollection = async () => {
    const name = newCollectionName.trim();
    if (!name || busy) return;
    try {
      setBusy(true);
      const response = await fetch("/api/engagement/collections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.status === 401) { setAuthOpen(true); return; }
      if (!response.ok) throw new Error(`Collection request failed (${response.status})`);
      const payload = await response.json();
      if (payload?.collection) {
        setCollections((items) => [payload.collection, ...items.filter((item) => item.id !== payload.collection.id)]);
        setNewCollectionName("");
        const nextIds = [...new Set([...savedCollectionIds, payload.collection.id])] as string[];
        setBusy(false);
        await updateSavedCollections(nextIds);
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  useLayoutEffect(() => {
    if (!shareOpen) {
      setSharePopoverPosition(null);
      return;
    }

    const placeSharePopover = () => {
      const button = shareButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const viewportPadding = 12;
      const width = Math.min(196, Math.max(164, window.innerWidth - viewportPadding * 2));
      const estimatedHeight = 252;
      const maxHeight = Math.max(160, window.innerHeight - viewportPadding * 2);
      const aboveTop = rect.top - estimatedHeight - 10;
      const belowTop = rect.bottom + 10;
      const top = aboveTop >= viewportPadding
        ? aboveTop
        : Math.min(belowTop, window.innerHeight - Math.min(estimatedHeight, maxHeight) - viewportPadding);
      const desiredLeft = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(viewportPadding, desiredLeft),
        Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
      );
      setSharePopoverPosition({ left, top: Math.max(viewportPadding, top), width, maxHeight });
    };

    placeSharePopover();
    window.addEventListener("resize", placeSharePopover);
    window.addEventListener("scroll", placeSharePopover, true);
    return () => {
      window.removeEventListener("resize", placeSharePopover);
      window.removeEventListener("scroll", placeSharePopover, true);
    };
  }, [shareOpen]);

  const selectedReaction = summary.viewerReaction ? reactionMeta[summary.viewerReaction] : reactionMeta.like;
  const SelectedReactionIcon = selectedReaction.icon;

  return (
    <div
      ref={rootRef}
      className={`xp-section-engagement xp-section-engagement--${variant}`}
      data-appearance={appearance}
      style={variant === "inline" ? inlinePosition : undefined}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {variant === "panel" ? (
        <>
          <div className="xp-engagement__summary" aria-live="polite">
            <div className="xp-engagement__reaction-summary">
              {summary.totalReactions > 0 ? <span className="xp-engagement__reaction-stack" aria-hidden="true"><span>👍</span><span>❤️</span><span>👏</span></span> : null}
              <span>{summary.totalReactions ? compactCount(summary.totalReactions) : "Be the first to react"}</span>
            </div>
            <div className="xp-engagement__summary-right">
              {summary.comments > 0 ? <span>{compactCount(summary.comments)} comment{summary.comments === 1 ? "" : "s"}</span> : null}
              {summary.shares > 0 ? <span>{compactCount(summary.shares)} share{summary.shares === 1 ? "" : "s"}</span> : null}
            </div>
          </div>
          <div className="xp-engagement__rule" />
        </>
      ) : null}

      <div className="xp-engagement__actions">
        {enabled.reactions ? (
          <div className="xp-engagement__reaction-wrap" onPointerEnter={() => setReactionOpen(true)} onPointerLeave={() => setReactionOpen(false)}>
            <button type="button" className={`xp-engagement__action ${summary.viewerReaction ? "is-active" : ""}`} onClick={() => chooseReaction(summary.viewerReaction ?? "like")} aria-label={summary.viewerReaction ? `Remove ${selectedReaction.label} reaction` : "React to this story"}>
              <SelectedReactionIcon size={variant === "inline" ? 12 : 17} />
              {variant === "inline" ? <span>{compactCount(summary.totalReactions)}</span> : <span>{summary.viewerReaction ? selectedReaction.label : "Like"}</span>}
            </button>
            <div className={`xp-engagement__reactions ${reactionOpen ? "is-open" : ""}`} role="menu" aria-hidden={!reactionOpen}>
              {(Object.keys(reactionMeta) as Reaction[]).map((reaction, index) => {
                const meta = reactionMeta[reaction];
                const Icon = meta.icon;
                return <button key={reaction} type="button" role="menuitem" className={`xp-engagement__reaction ${summary.viewerReaction === reaction ? "is-selected" : ""}`} style={{ "--reaction-index": index } as CSSProperties} onClick={() => chooseReaction(reaction)} title={meta.label}><Icon size={20} /><span>{meta.label}</span></button>;
              })}
            </div>
          </div>
        ) : null}

        {enabled.comments ? <button type="button" className="xp-engagement__action" onClick={openComments} aria-label={`${summary.comments} comments`}><MessageCircle size={variant === "inline" ? 12 : 17} /><span>{variant === "inline" ? compactCount(summary.comments) : "Comment"}</span></button> : null}

        {enabled.share ? (
          <div className="xp-engagement__popover-wrap">
            <button ref={shareButtonRef} type="button" className="xp-engagement__action" onClick={() => { if (requireAuth()) setShareOpen((value) => !value); }} aria-expanded={shareOpen} aria-label={`${summary.shares} shares`}><Share2 size={variant === "inline" ? 12 : 17} /><span>{variant === "inline" ? compactCount(summary.shares) : "Share"}</span></button>
            {typeof document !== "undefined" && shareOpen && sharePopoverPosition ? createPortal(
              <div
                className="xp-engagement__share-popover xp-engagement__share-popover--portal"
                role="menu"
                style={{ left: sharePopoverPosition.left, top: sharePopoverPosition.top, width: sharePopoverPosition.width, maxHeight: sharePopoverPosition.maxHeight }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                {typeof navigator !== "undefined" && typeof navigator.share === "function" ? <button type="button" onClick={nativeShare}><Share2 size={16} /><span>Share…</span></button> : null}
                <button type="button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />}<span>{copied ? "Copied" : "Copy link"}</span></button>
                <button type="button" onClick={() => shareTo("linkedin")}><span className="xp-engagement__network">in</span><span>LinkedIn</span></button>
                <button type="button" onClick={() => shareTo("facebook")}><span className="xp-engagement__network">f</span><span>Facebook</span></button>
                <button type="button" onClick={() => shareTo("x")}><span className="xp-engagement__network">𝕏</span><span>X</span></button>
                <button type="button" onClick={() => shareTo("whatsapp")}><span className="xp-engagement__network">W</span><span>WhatsApp</span></button>
                <button type="button" onClick={() => shareTo("email")}><Send size={16} /><span>Email</span></button>
              </div>,
              document.body,
            ) : null}
          </div>
        ) : null}

        {enabled.save ? (
          <div className="xp-engagement__popover-wrap">
            <button type="button" className={`xp-engagement__action ${summary.viewerSaved ? "is-active" : ""}`} onClick={openSavePicker} aria-expanded={saveOpen} aria-label={summary.viewerSaved ? `Saved by ${summary.saves}` : `${summary.saves} saves`}><Bookmark size={variant === "inline" ? 12 : 17} fill={summary.viewerSaved ? "currentColor" : "none"} /><span>{variant === "inline" ? compactCount(summary.saves) : summary.viewerSaved ? "Saved" : "Save"}</span></button>
          </div>
        ) : null}
      </div>


      {typeof document !== "undefined" && saveOpen ? createPortal(
        <div className="xp-engagement__save-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSaveOpen(false); }}>
          <section className="xp-engagement__save-drawer" role="dialog" aria-modal="true" aria-label="Save to collection">
            <header className="xp-engagement__save-drawer-head">
              <div>
                <span className="xp-engagement__eyebrow">Collections</span>
                <h2>Save to collection</h2>
                <p>{savedCollectionIds.length ? `${savedCollectionIds.length} selected` : "Choose one or more collections."}</p>
              </div>
              <button type="button" onClick={() => setSaveOpen(false)} aria-label="Close save panel"><X size={19} /></button>
            </header>

            <div className="xp-engagement__save-drawer-body">
              <div className="xp-engagement__collection-list">
                {collections.length ? collections.map((collection) => {
                  const selected = savedCollectionIds.includes(collection.id);
                  return <button key={collection.id} type="button" className={selected ? "is-selected" : ""} onClick={() => toggleCollection(collection.id)}><span className="xp-engagement__collection-check">{selected ? <Check size={13} /> : null}</span><span className="xp-engagement__collection-copy"><strong>{collection.name}</strong><small>{collection.itemCount} saved</small></span></button>;
                }) : <div className="xp-engagement__collection-empty"><Bookmark size={21} /><strong>No collections yet</strong><span>Create your first collection below.</span></div>}
              </div>
            </div>

            <footer className="xp-engagement__save-drawer-footer">
              <div className="xp-engagement__collection-create"><FolderPlus size={17} /><input value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createSaveCollection(); }} placeholder="Create a new collection" maxLength={80} /><button type="button" onClick={createSaveCollection} disabled={!newCollectionName.trim() || busy}>Create</button></div>
              <button className="xp-engagement__save-done" type="button" onClick={() => setSaveOpen(false)}>Done</button>
            </footer>
          </section>
        </div>,
        document.body,
      ) : null}

      {typeof document !== "undefined" && commentOpen ? createPortal(
        <div className="xp-engagement__modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommentOpen(false); }}>
          <section className="xp-engagement__comment-modal" role="dialog" aria-modal="true" aria-label="Comments">
            <header><div><strong>Comments</strong><span>{summary.comments ? `${summary.comments} responses` : "Start the conversation"}</span></div><button type="button" onClick={() => setCommentOpen(false)} aria-label="Close comments"><X size={19} /></button></header>
            <div className="xp-engagement__comment-list">
              {comments.length ? comments.map((comment) => <article key={comment.id} className="xp-engagement__comment"><div className="xp-engagement__avatar">{(comment.userName || "Member").slice(0, 1).toUpperCase()}</div><div><div className="xp-engagement__comment-meta"><strong>{comment.userName || "Member"}</strong><span><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString()}</time>{viewerId === comment.userId ? <button type="button" className="xp-engagement__comment-delete" onClick={() => deleteComment(comment.id)}>Delete</button> : null}</span></div><p>{comment.body}</p></div></article>) : <div className="xp-engagement__empty"><MessageCircle size={24} /><strong>No comments yet</strong><span>Be the first person to add something useful.</span></div>}
            </div>
            <footer className="xp-engagement__composer"><textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Write a comment…" maxLength={2000} rows={2} /><button type="button" onClick={postComment} disabled={!commentBody.trim() || busy} aria-label="Post comment"><Send size={17} /></button></footer>
          </section>
        </div>,
        document.body,
      ) : null}

      {typeof document !== "undefined" && authOpen ? createPortal(
        <div className="xp-engagement__modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
          <section className="xp-engagement__auth-modal" role="dialog" aria-modal="true" aria-label="Sign in required">
            <button className="xp-engagement__modal-close" type="button" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={18} /></button>
            <div className="xp-engagement__auth-icon"><Link2 size={21} /></div>
            <p className="xp-engagement__eyebrow">XpoMag membership</p>
            <h2>Join the conversation.</h2>
            <p>Sign in to react, comment, share stories and save sections to your collections.</p>
            <a className="xp-engagement__auth-primary" href={`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.hash)}`}>Sign in <ChevronRight size={17} /></a>
            <a className="xp-engagement__auth-secondary" href={`/signup?returnTo=${encodeURIComponent(window.location.pathname + window.location.hash)}`}>Create free account</a>
          </section>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
