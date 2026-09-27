"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ActiveSpreadVideoProps = {
  src: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
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
  muted = true,
  loop = false,
  controls = true,
  style,
}: ActiveSpreadVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [activated, setActivated] = useState(false);
  const [visible, setVisible] = useState(false);

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
    const el = ref.current;
    if (!el || !activated || !autoplay) return;

    const syncPlayback = () => {
      if (visible && document.visibilityState === "visible") {
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [activated, autoplay, visible]);

  return (
    <video
      ref={ref}
      src={activated ? src : undefined}
      title={title}
      poster={poster}
      muted={muted}
      loop={loop}
      playsInline
      controls={controls}
      preload="none"
      style={style}
    />
  );
}
