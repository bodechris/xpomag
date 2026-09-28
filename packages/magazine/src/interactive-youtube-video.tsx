"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type InteractiveYouTubeVideoProps = {
  src: string;
  title: string;
  autoplay?: boolean;
  muted?: boolean;
  style?: CSSProperties;
};

function withParams(src: string, params: Record<string, string>) {
  try {
    const url = new URL(src);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  } catch {
    const separator = src.includes("?") ? "&" : "?";
    return src + separator + new URLSearchParams(params).toString();
  }
}

function youtubeId(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] ?? "";
    const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch?.[1]) return embedMatch[1];
    return url.searchParams.get("v") ?? "";
  } catch {
    const match = src.match(/(?:embed\/|youtu\.be\/|v=)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ?? "";
  }
}

export function InteractiveYouTubeVideo({
  src,
  title,
  autoplay = false,
  muted = true,
  style,
}: InteractiveYouTubeVideoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCurrentAndVisible, setIsCurrentAndVisible] = useState(false);

  const videoId = useMemo(() => youtubeId(src), [src]);
  const thumbnailSrc = useMemo(
    () => videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "",
    [videoId],
  );

  const modalSrc = useMemo(
    () => withParams(src, {
      autoplay: "1",
      mute: "0",
      controls: "1",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
    }),
    [src],
  );

  const inlineSrc = useMemo(
    () => withParams(src, {
      autoplay: "1",
      mute: muted ? "1" : "0",
      controls: "0",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      loop: "1",
      playlist: videoId,
    }),
    [muted, src, videoId],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const spreadLayer = frame.closest(".xp-magazine__spread-layer");
    const turnSheet = frame.closest(".xp-magazine__turn-sheet");
    const stage = frame.closest(".xp-magazine__stage");
    let intersectsViewport = false;

    const evaluate = () => {
      if (turnSheet) {
        setIsCurrentAndVisible(false);
        return;
      }

      const layerIsCurrent = !spreadLayer || (
        spreadLayer.classList.contains("xp-magazine__spread-layer--current") &&
        spreadLayer.getAttribute("aria-hidden") !== "true"
      );
      const tabIsVisible = document.visibilityState === "visible";
      const readerIsTurning = Boolean(stage?.getAttribute("data-phase"));
      setIsCurrentAndVisible(layerIsCurrent && intersectsViewport && tabIsVisible && !readerIsTurning);
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        intersectsViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.06);
        evaluate();
      },
      { threshold: [0, 0.06, 0.2] },
    );
    intersection.observe(frame);

    const mutation = spreadLayer ? new MutationObserver(evaluate) : null;
    mutation?.observe(spreadLayer!, { attributes: true, attributeFilter: ["class", "aria-hidden"] });
    const stageMutation = stage ? new MutationObserver(evaluate) : null;
    stageMutation?.observe(stage!, { attributes: true, attributeFilter: ["data-phase"] });
    document.addEventListener("visibilitychange", evaluate);

    return () => {
      intersection.disconnect();
      mutation?.disconnect();
      stageMutation?.disconnect();
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) dialog.showModal();
    if (!modalOpen && dialog.open) dialog.close();
  }, [modalOpen]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const frameStyle = style ?? {};

  return (
    <>
      <div
        ref={frameRef}
        data-design-element="video"
        data-video-fit="cover"
        data-magazine-interactive
        data-no-page-turn
        className="xp-youtube-video"
        role="button"
        tabIndex={0}
        aria-label={"Play " + title}
        onClick={openModal}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openModal();
          }
        }}
        style={{
          position: "relative",
          overflow: "hidden",
          containerType: "size",
          background: "#000",
          cursor: "pointer",
          ...frameStyle,
        }}
      >
        {autoplay && isCurrentAndVisible && !modalOpen ? (
          <iframe
            src={inlineSrc}
            title={title + " autoplay preview"}
            tabIndex={-1}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "max(100cqw, 177.7778cqh)",
              height: "max(100cqh, 56.25cqw)",
              maxWidth: "none",
              border: 0,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              maxWidth: "none",
              objectFit: "cover",
              objectPosition: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        ) : null}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.12))",
            pointerEvents: "none",
          }}
        />
      </div>

      <dialog
        ref={dialogRef}
        className="xp-youtube-dialog"
        aria-label={title}
        onClose={() => {
          if (modalOpen) closeModal();
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        style={{
          width: "100dvw",
          maxWidth: "none",
          height: "100dvh",
          maxHeight: "none",
          margin: 0,
          padding: 0,
          border: 0,
          background: "rgba(8,8,9,.96)",
          color: "#fff",
        }}
      >
        {modalOpen ? (
          <div
            data-magazine-interactive
            data-no-page-turn
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              padding: "clamp(1rem,3vw,2rem)",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close video"
              style={{
                position: "fixed",
                right: "clamp(1rem,2vw,1.5rem)",
                top: "clamp(1rem,2vw,1.5rem)",
                zIndex: 4,
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,.22)",
                background: "rgba(255,255,255,.10)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "22px",
                lineHeight: 1,
                backdropFilter: "blur(14px)",
              }}
            >
              ×
            </button>

            <div
              style={{
                width: "min(1180px, 94vw)",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  borderRadius: "18px",
                  background: "#000",
                  boxShadow: "0 28px 80px rgba(0,0,0,.48)",
                }}
              >
                <iframe
                  src={modalSrc}
                  title={title + " fullscreen"}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
              <strong
                style={{
                  fontFamily: "var(--xp-font-sans)",
                  fontSize: "clamp(.85rem,1.5vw,1rem)",
                  fontWeight: 650,
                  letterSpacing: "-.02em",
                  opacity: .9,
                }}
              >
                {title}
              </strong>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
