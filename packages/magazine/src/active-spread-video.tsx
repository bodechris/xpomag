"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ActiveSpreadVideoProps = {
  src: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  muted?: boolean;
  loop?: boolean;
  maxLoops?: number;
  controls?: boolean;
  style?: CSSProperties;
};

export function ActiveSpreadVideo({
  src,
  title,
  poster,
  autoplay = false,
  autoplayDelayMs = 0,
  muted = true,
  loop = false,
  maxLoops,
  controls = true,
  style,
}: ActiveSpreadVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopCountRef = useRef(0);

  const [isCurrentAndVisible, setIsCurrentAndVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const spreadLayer = frame.closest(".xp-magazine__spread-layer");
    if (!spreadLayer) return;

    const evaluate = () => {
      const isCurrent = spreadLayer.classList.contains("xp-magazine__spread-layer--current");
      const isHidden = spreadLayer.getAttribute("aria-hidden") === "true";
      const rect = frame.getBoundingClientRect();
      const viewportW = window.innerWidth || document.documentElement.clientWidth;
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const visibleW = Math.max(0, Math.min(rect.right, viewportW) - Math.max(rect.left, 0));
      const visibleH = Math.max(0, Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0));
      const visibleArea = visibleW * visibleH;
      const area = Math.max(1, rect.width * rect.height);
      setIsCurrentAndVisible(isCurrent && !isHidden && visibleArea / area >= 0.55);
    };

    const observer = new IntersectionObserver(evaluate, { threshold: [0, 0.25, 0.55, 0.8, 1] });
    observer.observe(frame);

    const mutation = new MutationObserver(evaluate);
    mutation.observe(spreadLayer, { attributes: true, attributeFilter: ["class", "aria-hidden"] });

    evaluate();
    window.addEventListener("resize", evaluate);

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  useEffect(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    const video = videoRef.current;

    if (!isCurrentAndVisible || !autoplay) {
      setVideoReady(false);
      setHasStarted(false);
      loopCountRef.current = 0;
      if (video) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {}
      }
      return;
    }

    setVideoReady(false);
    setHasStarted(false);
    loopCountRef.current = 0;

    if (autoplayDelayMs <= 0) {
      setVideoReady(true);
      return;
    }

    delayTimerRef.current = setTimeout(() => {
      setVideoReady(true);
      delayTimerRef.current = null;
    }, autoplayDelayMs);

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [autoplay, autoplayDelayMs, isCurrentAndVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady || !autoplay || !isCurrentAndVisible) return;

    const syncPlayback = () => {
      if (document.visibilityState === "visible" && isCurrentAndVisible) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [autoplay, isCurrentAndVisible, videoReady]);

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video || !loop || !isCurrentAndVisible) return;

    loopCountRef.current += 1;
    if (typeof maxLoops === "number" && maxLoops > 0 && loopCountRef.current >= maxLoops) {
      video.pause();
      setHasStarted(false);
      return;
    }

    try {
      video.currentTime = 0;
    } catch {}
    void video.play().catch(() => undefined);
  };

  const { objectFit, objectPosition, background, ...frameStyle } = style ?? {};

  return (
    <div
      ref={frameRef}
      data-design-element="active-spread-video"
      style={{
        ...frameStyle,
        overflow: "hidden",
        background: background ?? "#000",
      }}
    >
      {videoReady ? (
        <video
          ref={videoRef}
          src={src}
          title={title}
          muted={muted}
          playsInline
          controls={controls}
          preload="metadata"
          onPlaying={() => setHasStarted(true)}
          onEnded={handleEnded}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            maxWidth: "none",
            objectFit: objectFit ?? "cover",
            objectPosition: objectPosition ?? "center",
            opacity: hasStarted ? 1 : 0,
            transition: "opacity 520ms ease",
          }}
        />
      ) : null}

      {poster ? (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            maxWidth: "none",
            objectFit: objectFit ?? "cover",
            objectPosition: objectPosition ?? "center",
            opacity: hasStarted ? 0 : 1,
            transition: "opacity 420ms ease",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
