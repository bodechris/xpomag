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
  controls = true,
  style,
}: ActiveSpreadVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activated, setActivated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playReady, setPlayReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.55);
        setVisible(nextVisible);
        if (nextVisible) setActivated(true);
      },
      { threshold: [0, 0.25, 0.55, 0.8] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    if (!visible || !autoplay) {
      setPlayReady(false);
      setHasStarted(false);
      const el = ref.current;
      if (el) {
        el.pause();
        try { el.currentTime = 0; } catch {}
      }
      return;
    }

    if (autoplayDelayMs <= 0) {
      setPlayReady(true);
      return;
    }

    delayTimerRef.current = setTimeout(() => {
      setPlayReady(true);
      delayTimerRef.current = null;
    }, autoplayDelayMs);

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [autoplay, autoplayDelayMs, visible]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !activated || !autoplay) return;

    const syncPlayback = () => {
      if (visible && playReady && document.visibilityState === "visible") {
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [activated, autoplay, playReady, visible]);

  const {
    objectFit,
    objectPosition,
    background,
    ...frameStyle
  } = style ?? {};

  return (
    <div
      data-design-element="active-spread-video"
      style={{
        ...frameStyle,
        overflow: "hidden",
        background: background ?? "#000",
      }}
    >
      <video
        ref={ref}
        src={activated ? src : undefined}
        title={title}
        muted={muted}
        loop={loop}
        playsInline
        controls={controls}
        preload={activated ? "metadata" : "none"}
        onPlaying={() => setHasStarted(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          objectFit: objectFit ?? "cover",
          objectPosition: objectPosition ?? "center",
          opacity: hasStarted ? 1 : 0,
        }}
      />
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
