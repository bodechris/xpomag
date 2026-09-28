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
    const turnSheet = frame.closest(".xp-magazine__turn-sheet");
    const stage = frame.closest(".xp-magazine__stage");
    let intersectsViewport = false;

    const evaluate = () => {
      // Turn-sheet faces are duplicate renderings used only for the page-flip
      // illusion. They must never allocate a decoder or start network media.
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
        video.removeAttribute("src");
        try {
          video.load();
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
          preload="none"
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
          loading={isCurrentAndVisible ? "eager" : "lazy"}
          fetchPriority={isCurrentAndVisible ? "auto" : "low"}
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
