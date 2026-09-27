"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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

export function InteractiveYouTubeVideo({
  src,
  title,
  autoplay = true,
  muted = true,
  style,
}: InteractiveYouTubeVideoProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restorePlaybackRef = useRef(false);
  const [playing, setPlaying] = useState(autoplay);
  const [modalOpen, setModalOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const inlineSrc = useMemo(
    () => withParams(src, {
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      controls: "0",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      enablejsapi: "1",
    }),
    [autoplay, muted, src],
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

  const send = useCallback((command: "playVideo" | "pauseVideo") => {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*",
    );
  }, []);

  const play = useCallback(() => {
    setPlaying(true);
    send("playVideo");
  }, [send]);

  const pause = useCallback(() => {
    setPlaying(false);
    send("pauseVideo");
  }, [send]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.45);
        setVisible(isVisible);
        if (!isVisible) send("pauseVideo");
        else if (playing && !modalOpen) send("playVideo");
      },
      { threshold: [0, 0.45, 0.75, 1] },
    );

    observer.observe(shell);
    return () => observer.disconnect();
  }, [modalOpen, playing, send]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") send("pauseVideo");
      else if (visible && playing && !modalOpen) send("playVideo");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [modalOpen, playing, send, visible]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) dialog.showModal();
    if (!modalOpen && dialog.open) dialog.close();
  }, [modalOpen]);

  const openModal = () => {
    restorePlaybackRef.current = playing;
    pause();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (restorePlaybackRef.current && visible) {
      window.setTimeout(play, 80);
    }
  };

  const frameStyle = style ?? {};

  return (
    <>
      <div
        ref={shellRef}
        data-design-element="video"
        data-video-fit="cover"
        data-magazine-interactive
        data-no-page-turn
        className="xp-youtube-video"
        style={{
          position: "relative",
          overflow: "hidden",
          containerType: "size",
          background: "#000",
          ...frameStyle,
        }}
      >
        <iframe
          ref={frameRef}
          src={inlineSrc}
          title={title}
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
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,transparent 48%,rgba(0,0,0,.34) 100%)",
            pointerEvents: "none",
          }}
        />

        <button
          type="button"
          className="xp-youtube-video__open-hero"
          onClick={openModal}
          aria-label={"Open " + title + " in video player"}
          title="Open video player"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            zIndex: 9,
            transform: "translate(-50%, -50%)",
            minWidth: "44px",
            minHeight: "44px",
            padding: "0 14px",
            border: "1px solid rgba(255,255,255,.52)",
            borderRadius: "999px",
            background: "rgba(8,8,8,.76)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,.32)",
            fontSize: "12px",
            fontWeight: 760,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: "14px" }}>▶</span>
          <span className="xp-youtube-video__hero-label">Watch video</span>
        </button>

        <div
          className="xp-youtube-video__controls"
          style={{
            position: "absolute",
            right: "8px",
            bottom: "8px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={playing ? pause : play}
            aria-label={playing ? "Pause video" : "Play video"}
            title={playing ? "Pause video" : "Play video"}
            style={{
              width: "34px",
              height: "34px",
              border: "1px solid rgba(255,255,255,.42)",
              borderRadius: "999px",
              background: "rgba(12,12,12,.8)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              boxShadow: "0 5px 16px rgba(0,0,0,.24)",
              fontSize: "13px",
              lineHeight: 1,
            }}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button
            type="button"
            onClick={openModal}
            aria-label="Open video player"
            title="Open video player"
            style={{
              minWidth: "34px",
              height: "34px",
              padding: "0 10px",
              border: "1px solid rgba(255,255,255,.42)",
              borderRadius: "999px",
              background: "rgba(12,12,12,.8)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              boxShadow: "0 5px 16px rgba(0,0,0,.24)",
              fontSize: "11px",
              fontWeight: 760,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden="true">⛶</span>
            <span className="xp-youtube-video__open-label">Expand</span>
          </button>
        </div>
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
