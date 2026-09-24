"use client";

import { MagazinePageRenderer, type ComposerNode } from "@xpomag/magazine";
import { ArrowLeft, ArrowRight, LockKeyhole, Maximize2, Minimize2, Pause, Play, RotateCcw, X } from "lucide-react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DemoMagazineIssue } from "../lib/demo-magazine";
import { MagazineResourcePreloader } from "./magazine-resource-preloader";
import { SectionEngagementBar } from "./section-engagement";

type Direction = "next" | "previous";
type MotionKind = "flip" | "slide";
type MotionPhase = "dragging" | "animating";

type Spread = {
  id: string;
  pageIndexes: number[];
};

type Motion = {
  direction: Direction;
  targetIndex: number;
  kind: MotionKind;
  phase: MotionPhase;
};

const MOTION_MS = 560;
const TURN_THRESHOLD = 0.22;
const FLICK_DISTANCE = 44;
const FLICK_VELOCITY = 0.34;

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "[role=button]",
  "[role=link]",
  "[role=dialog]",
  "[contenteditable=true]",
  "[data-story-id]",
  ".xp-section-engagement",
  "[data-no-page-turn]",
  "[data-magazine-interactive]",
].join(",");

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function buildSpreads(pageCount: number, singlePage: boolean): Spread[] {
  if (singlePage) {
    return Array.from({ length: pageCount }, (_, index) => ({ id: `spread-${index}`, pageIndexes: [index] }));
  }

  const spreads: Spread[] = [{ id: "spread-cover", pageIndexes: [0] }];
  for (let index = 1; index < pageCount; index += 2) {
    spreads.push({ id: `spread-${index}`, pageIndexes: [index, index + 1].filter((i) => i < pageCount) });
  }
  return spreads;
}

function transitionKind(singlePage: boolean, from: number, to: number): MotionKind {
  if (!singlePage) return "flip";
  const boundary = Math.min(from, to);
  return boundary % 2 === 0 ? "flip" : "slide";
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}


type VideoStory = {
  videoId: string;
  kicker: string;
  title: string;
  caption: string;
  accent: string;
  placement?: "default" | "opening";
};

const VIDEO_STORIES: Record<string, VideoStory> = {
  "rosebank-0642": {
    videoId: "_1UeG71MOJM",
    kicker: "06:42 / ROSEBANK / JOHANNESBURG",
    title: "WATCH ROSEBANK WAKE UP",
    caption: "Street-level Rosebank: commuters, businesses and the city moving into the day.",
    accent: "#f3cf20",
    placement: "opening",
  },
  "sunday-market": {
    videoId: "_1UeG71MOJM",
    kicker: "WATCH / ROSEBANK",
    title: "A WALK THROUGH ROSEBANK",
    caption: "Street life, movement and the everyday city around the issue.",
    accent: "#ffd51e",
  },
  "rosebank-art-i": {
    videoId: "KbmTGjaCsXk",
    kicker: "WATCH / JOHANNESBURG",
    title: "THE CITY IN MOTION",
    caption: "A moving portrait of Johannesburg used as an editorial visual interlude.",
    accent: "#3157ff",
  },
  "sandton-scale": {
    videoId: "v2enwvSK9fE",
    kicker: "WATCH / SANDTON",
    title: "SANDTON AT STREET LEVEL",
    caption: "A walking view through the scale, buildings and movement of Sandton.",
    accent: "#d8ff52",
  },
};

function YouTubeStoryPanel({ story }: { story: VideoStory }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const send = useCallback((command: "playVideo" | "pauseVideo") => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "*");
  }, []);

  const play = useCallback(() => { setPlaying(true); send("playVideo"); }, [send]);
  const pause = useCallback(() => { setPlaying(false); send("pauseVideo"); }, [send]);
  const src = `https://www.youtube.com/embed/${story.videoId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <>
      <aside
        className={`xp-video-story${story.placement === "opening" ? " xp-video-story--opening" : ""}`}
        data-magazine-interactive
        data-no-page-turn
        style={{ "--xp-video-accent": story.accent } as CSSProperties}
        onPointerEnter={play}
        onPointerLeave={pause}
      >
        <iframe
          ref={frameRef}
          className="xp-video-story__frame"
          src={src}
          title={story.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <div className="xp-video-story__shade" />
        <div className="xp-video-story__copy">
          <span>{story.kicker}</span>
          <strong>{story.title}</strong>
          <small>{story.caption}</small>
        </div>
        <div className="xp-video-story__controls">
          <button type="button" onClick={playing ? pause : play} aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button type="button" onClick={() => { pause(); setModalOpen(true); }} aria-label="Open video fullscreen">
            <Maximize2 size={14} />
          </button>
        </div>
      </aside>
      {mounted && modalOpen ? createPortal(
        <div className="xp-video-modal" role="dialog" aria-modal="true" aria-label={story.title} data-magazine-interactive>
          <button className="xp-video-modal__close" type="button" onClick={() => setModalOpen(false)} aria-label="Close video">
            <X size={20} />
          </button>
          <div className="xp-video-modal__inner">
            <iframe
              src={`https://www.youtube.com/embed/${story.videoId}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0`}
              title={`${story.title} fullscreen`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
            <div className="xp-video-modal__caption"><span>{story.kicker}</span><strong>{story.title}</strong></div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

const CITY_TETRIS_COLS = 10;
const CITY_TETRIS_ROWS = 18;
const CITY_TETRIS_PIECES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
} as const;

type CityTetrisKind = keyof typeof CITY_TETRIS_PIECES;
type CityTetrisCell = CityTetrisKind | null;
type CityTetrisPiece = { kind: CityTetrisKind; shape: number[][]; x: number; y: number };

const CITY_TETRIS_KINDS = Object.keys(CITY_TETRIS_PIECES) as CityTetrisKind[];
const emptyCityBoard = (): CityTetrisCell[][] => Array.from({ length: CITY_TETRIS_ROWS }, () => Array<CityTetrisCell>(CITY_TETRIS_COLS).fill(null));
const cloneShape = (shape: readonly (readonly number[])[]) => shape.map((row) => [...row]);
const newCityPiece = (): CityTetrisPiece => {
  const kind = CITY_TETRIS_KINDS[Math.floor(Math.random() * CITY_TETRIS_KINDS.length)]!;
  const shape = cloneShape(CITY_TETRIS_PIECES[kind]);
  return { kind, shape, x: Math.floor((CITY_TETRIS_COLS - shape[0]!.length) / 2), y: -1 };
};
const rotateCityPiece = (shape: number[][]) => shape[0]!.map((_, index) => shape.map((row) => row[index]!).reverse());

function CityTetrisGame() {
  const [board, setBoard] = useState<CityTetrisCell[][]>(() => emptyCityBoard());
  const [piece, setPiece] = useState<CityTetrisPiece>(() => newCityPiece());
  const [nextKind, setNextKind] = useState<CityTetrisKind>(() => CITY_TETRIS_KINDS[Math.floor(Math.random() * CITY_TETRIS_KINDS.length)]!);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef<HTMLDivElement | null>(null);
  const level = Math.min(9, Math.floor(lines / 5) + 1);

  const collides = useCallback((candidate: CityTetrisPiece, source = board) => {
    return candidate.shape.some((row, dy) => row.some((filled, dx) => {
      if (!filled) return false;
      const x = candidate.x + dx;
      const y = candidate.y + dy;
      return x < 0 || x >= CITY_TETRIS_COLS || y >= CITY_TETRIS_ROWS || (y >= 0 && Boolean(source[y]?.[x]));
    }));
  }, [board]);

  const spawnFromNext = useCallback((source: CityTetrisCell[][]) => {
    const shape = cloneShape(CITY_TETRIS_PIECES[nextKind]);
    const incoming: CityTetrisPiece = { kind: nextKind, shape, x: Math.floor((CITY_TETRIS_COLS - shape[0]!.length) / 2), y: -1 };
    const following = CITY_TETRIS_KINDS[Math.floor(Math.random() * CITY_TETRIS_KINDS.length)]!;
    setNextKind(following);
    const blocked = incoming.shape.some((row, dy) => row.some((filled, dx) => filled && incoming.y + dy >= 0 && Boolean(source[incoming.y + dy]?.[incoming.x + dx])));
    if (blocked) {
      setRunning(false);
      setGameOver(true);
    } else {
      setPiece(incoming);
    }
  }, [nextKind]);

  const lockPiece = useCallback((current: CityTetrisPiece) => {
    const merged = board.map((row) => [...row]);
    current.shape.forEach((row, dy) => row.forEach((filled, dx) => {
      if (!filled) return;
      const y = current.y + dy;
      const x = current.x + dx;
      if (y >= 0 && y < CITY_TETRIS_ROWS && x >= 0 && x < CITY_TETRIS_COLS) merged[y]![x] = current.kind;
    }));
    const survivors = merged.filter((row) => row.some((cell) => cell === null));
    const cleared = CITY_TETRIS_ROWS - survivors.length;
    const nextBoard = [...Array.from({ length: cleared }, () => Array<CityTetrisCell>(CITY_TETRIS_COLS).fill(null)), ...survivors];
    setBoard(nextBoard);
    if (cleared > 0) {
      setLines((value) => value + cleared);
      setScore((value) => value + [0, 100, 300, 500, 800][cleared]! * level);
    } else {
      setScore((value) => value + 8);
    }
    spawnFromNext(nextBoard);
  }, [board, level, spawnFromNext]);

  const stepDown = useCallback(() => {
    if (!running) return;
    const candidate = { ...piece, y: piece.y + 1 };
    if (collides(candidate)) lockPiece(piece);
    else setPiece(candidate);
  }, [running, piece, collides, lockPiece]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(stepDown, Math.max(150, 720 - (level - 1) * 65));
    return () => window.clearInterval(id);
  }, [running, stepDown, level]);

  const move = (dx: number) => {
    if (!running) return;
    const candidate = { ...piece, x: piece.x + dx };
    if (!collides(candidate)) setPiece(candidate);
  };
  const rotate = () => {
    if (!running) return;
    const candidate = { ...piece, shape: rotateCityPiece(piece.shape) };
    if (!collides(candidate)) setPiece(candidate);
  };
  const hardDrop = () => {
    if (!running) return;
    let candidate = piece;
    let distance = 0;
    while (!collides({ ...candidate, y: candidate.y + 1 })) {
      candidate = { ...candidate, y: candidate.y + 1 };
      distance += 1;
    }
    setScore((value) => value + distance * 2);
    lockPiece(candidate);
  };
  const startGame = () => {
    const fresh = emptyCityBoard();
    const first = newCityPiece();
    setBoard(fresh);
    setPiece(first);
    setNextKind(CITY_TETRIS_KINDS[Math.floor(Math.random() * CITY_TETRIS_KINDS.length)]!);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setRunning(true);
    window.setTimeout(() => gameRef.current?.focus(), 0);
  };

  const visible = board.map((row) => [...row]);
  if (running) {
    piece.shape.forEach((row, dy) => row.forEach((filled, dx) => {
      if (!filled) return;
      const y = piece.y + dy;
      const x = piece.x + dx;
      if (y >= 0 && y < CITY_TETRIS_ROWS && x >= 0 && x < CITY_TETRIS_COLS) visible[y]![x] = piece.kind;
    }));
  }

  const districtForRow = (row: number) => row < 4 ? "SANDTON" : row < 9 ? "KEYES" : row < 14 ? "ROSEBANK" : "THE MARC";

  return (
    <div
      ref={gameRef}
      className="xp-play-page xp-play-page--game xp-city-tetris"
      data-magazine-interactive
      data-no-page-turn
      tabIndex={0}
      onKeyDown={(event) => {
        if (!running) return;
        if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "x", "X"].includes(event.key)) event.preventDefault();
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
        if (event.key === "ArrowDown") stepDown();
        if (event.key === "ArrowUp" || event.key === "x" || event.key === "X") rotate();
        if (event.key === " ") hardDrop();
      }}
    >
      <div className="xp-play-page__eyebrow">XPOMAG / PLAY / 56</div>
      <h1>CITY BLOCKS</h1>
      <p>Build the city upward. Complete streets to clear them, score points and keep the skyline alive.</p>
      <div className="xp-game-hud">
        <span><b>{score}</b> score</span>
        <span><b>{lines}</b> streets</span>
        <span><b>{level}</b> level</span>
      </div>

      <div className="xp-city-tetris-shell">
        <div className="xp-city-tetris-board" role="application" aria-label="City Blocks game board">
          {visible.flatMap((row, y) => row.map((cell, x) => (
            <span
              key={`${y}-${x}`}
              className="xp-city-tetris-cell"
              data-piece={cell ?? "empty"}
              data-district={districtForRow(y)}
              aria-hidden="true"
            />
          )))}
          <div className="xp-city-tetris-districts" aria-hidden="true">
            <span>SANDTON</span><span>KEYES</span><span>ROSEBANK</span><span>THE MARC</span>
          </div>
          {!running ? (
            <div className="xp-game-start">
              <div className="xp-city-tetris-skyline" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
              <strong>{gameOver ? `Skyline complete — ${score} pts` : "Build your city."}</strong>
              <small>← → move · ↑ rotate · ↓ drop · space hard drop</small>
              <button className="xp-play-primary" onClick={startGame}>{gameOver ? "Build again" : "Start building"}</button>
            </div>
          ) : null}
        </div>

        <aside className="xp-city-tetris-side">
          <div>
            <span>NEXT BLOCK</span>
            <div className="xp-city-tetris-next" data-piece={nextKind}>
              {cloneShape(CITY_TETRIS_PIECES[nextKind]).flatMap((row, y) => row.map((filled, x) => <i key={`${y}-${x}`} data-filled={filled ? "true" : "false"} />))}
            </div>
          </div>
          <div className="xp-city-tetris-legend">
            <span>THE CITY IS OPEN</span>
            <p>Every cleared line is a completed street. The faster the city grows, the faster new blocks fall.</p>
          </div>
        </aside>
      </div>

      <div className="xp-city-tetris-controls" aria-label="City Blocks controls">
        <button type="button" onClick={() => move(-1)} disabled={!running} aria-label="Move left">←</button>
        <button type="button" onClick={rotate} disabled={!running} aria-label="Rotate block">↻</button>
        <button type="button" onClick={() => move(1)} disabled={!running} aria-label="Move right">→</button>
        <button type="button" onClick={stepDown} disabled={!running} aria-label="Move down">↓</button>
        <button type="button" onClick={hardDrop} disabled={!running} aria-label="Hard drop">DROP</button>
      </div>
      <div className="xp-play-page__footer">ROSEBANK ↔ SANDTON / BUILD THE CITY</div>
    </div>
  );
}

const QUIZ_ITEMS = [
  { q: "Which transport link connects Rosebank and Sandton in this issue?", options: ["Gautrain", "MyCiTi", "Rea Vaya only", "Cable car"], answer: 0 },
  { q: "Where does the issue place Rosebank Sunday Market?", options: ["On a mall rooftop", "Inside a hotel lobby", "At Gautrain station", "Inside Sandton City"], answer: 0 },
  { q: "What is Issue 001's central theme?", options: ["The City Is Open", "The City Sleeps", "Work From Anywhere", "The New Suburb"], answer: 0 },
  { q: "Which district is repeatedly associated with scale and concentration?", options: ["Sandton", "Rosebank", "Melville", "Braamfontein"], answer: 0 },
  { q: "What does the magazine describe as part of the modern office?", options: ["Hospitality and public space", "Only the desk", "Only parking", "Only meeting rooms"], answer: 0 },
];

function IssueQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((total, [i, value]) => total + (QUIZ_ITEMS[Number(i)]?.answer === value ? 1 : 0), 0);
  return (
    <div className="xp-play-page xp-play-page--quiz" data-magazine-interactive data-no-page-turn>
      <div className="xp-play-page__eyebrow">XPOMAG / QUIZ / 57</div>
      <h1>HOW WELL DID YOU READ THE CITY?</h1>
      <p>Five quick questions from Issue 001. Answers lock as you choose them.</p>
      <div className="xp-quiz-grid">
        {QUIZ_ITEMS.map((item, index) => (
          <section className="xp-quiz-card" key={item.q}>
            <span>0{index + 1}</span>
            <strong>{item.q}</strong>
            <div>
              {item.options.map((option, optionIndex) => {
                const chosen = answers[index] === optionIndex;
                const locked = answers[index] != null;
                return <button key={option} disabled={locked} data-state={chosen ? (optionIndex === item.answer ? "right" : "wrong") : "idle"} onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}>{option}</button>;
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="xp-quiz-score"><div className="xp-quiz-meter" aria-label={`${answered} of ${QUIZ_ITEMS.length} questions answered`}><i style={{ width: `${(answered / QUIZ_ITEMS.length) * 100}%` }} /></div><b>{score}/{answered || 0}</b><span>{answered === QUIZ_ITEMS.length ? (score === QUIZ_ITEMS.length ? "Perfect. You read the city." : `Final score: ${score} / ${QUIZ_ITEMS.length}`) : `${QUIZ_ITEMS.length - answered} questions left`}</span><button onClick={() => setAnswers({})}><RotateCcw size={14}/> Reset</button></div>
    </div>
  );
}

const PUZZLE_WORDS = [
  { scrambled: "NODTASN", answer: "SANDTON", clue: "The district of scale" },
  { scrambled: "KNABSOER", answer: "ROSEBANK", clue: "The district of proximity" },
  { scrambled: "NIARTUGA", answer: "GAUTRAIN", clue: "The fast link between them" },
  { scrambled: "YEKES", answer: "KEYES", clue: "Art Mile" },
];

function CityWordPuzzle() {
  const [values, setValues] = useState(() => PUZZLE_WORDS.map(() => ""));
  const [checked, setChecked] = useState(false);
  const correct = values.filter((value, index) => value.trim().toUpperCase() === PUZZLE_WORDS[index]!.answer).length;
  return (
    <div className="xp-play-page xp-play-page--puzzle" data-magazine-interactive data-no-page-turn>
      <div className="xp-play-page__eyebrow">XPOMAG / PUZZLE / 58</div>
      <h1>UNSCRAMBLE THE CITY</h1>
      <p>Four names from this issue have been scrambled. Use the clue, type the word, then check the grid.</p>
      <div className="xp-puzzle-list">
        {PUZZLE_WORDS.map((item, index) => {
          const isRight = checked && values[index]!.trim().toUpperCase() === item.answer;
          return <label key={item.answer} data-state={checked ? (isRight ? "right" : "wrong") : "idle"}><span>0{index + 1}</span><b>{item.scrambled}</b><small>{item.clue}</small><input value={values[index]} onChange={(event) => { setChecked(false); setValues((current) => current.map((value, i) => i === index ? event.target.value : value)); }} placeholder="Type answer" /></label>;
        })}
      </div>
      <div className="xp-puzzle-actions"><button className="xp-play-primary" onClick={() => setChecked(true)}>Check puzzle</button><button onClick={() => { setValues(PUZZLE_WORDS.map(() => "")); setChecked(false); }}><RotateCcw size={14}/> Reset</button>{checked ? <strong>{correct === PUZZLE_WORDS.length ? "Perfect — 4/4" : `${correct}/4 correct`}</strong> : null}</div>
    </div>
  );
}

function InteractiveMagazinePage({ slug }: { slug: string }) {
  if (slug === "november-events") return <CityTetrisGame />;
  if (slug === "xpomag-12") return <IssueQuiz />;
  if (slug === "ad-thread") return <CityWordPuzzle />;
  return null;
}

export function MagazineReader({ issue, initialPageSlug, viewerAuthenticated = false }: { issue: DemoMagazineIssue; initialPageSlug?: string; viewerAuthenticated?: boolean }) {
  const [singlePageMode, setSinglePageMode] = useState(false);
  const spreads = useMemo(() => buildSpreads(issue.pages.length, singlePageMode), [issue.pages.length, singlePageMode]);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const initialPageIndex = Math.max(0, issue.pages.findIndex((page) => page.slug === initialPageSlug));
  const [motion, setMotion] = useState<Motion | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const pointerCurrentX = useRef<number | null>(null);
  const pointerStartTime = useRef(0);
  const gestureAxis = useRef<"horizontal" | "vertical" | null>(null);
  const suppressClick = useRef(false);
  const progressRef = useRef(0);
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterMotionRef = useRef<(() => void) | null>(null);
  const readerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointerGuideRef = useRef<HTMLDivElement | null>(null);

  // Responsive mode changes rebuild the spread array (desktop spreads <-> mobile pages).
  // React renders once before the effect below can clamp spreadIndex, so always
  // derive a safe index synchronously to avoid reading pageIndexes from undefined.
  const maxSpreadIndex = Math.max(0, spreads.length - 1);
  const safeSpreadIndex = Math.min(Math.max(0, spreadIndex), maxSpreadIndex);
  const spread = spreads[safeSpreadIndex];
  const targetSpread = motion
    ? spreads[Math.min(Math.max(0, motion.targetIndex), maxSpreadIndex)] ?? null
    : null;

  if (!spread) return null;

  const activePages = spread.pageIndexes.map((index) => ({ ...issue.pages[index]!, index }));
  const firstPage = activePages[0]!;
  const canGoBack = safeSpreadIndex > 0;
  const canGoForward = safeSpreadIndex < maxSpreadIndex;

  const setProgress = useCallback((value: number) => {
    const next = clamp01(value);
    progressRef.current = next;
    stageRef.current?.style.setProperty("--xp-turn-progress", String(next));
  }, []);

  const clearMotionTimer = useCallback(() => {
    if (motionTimer.current) {
      clearTimeout(motionTimer.current);
      motionTimer.current = null;
    }
  }, []);

  const completeMotion = useCallback((commit: boolean, targetIndex: number) => {
    clearMotionTimer();
    motionTimer.current = setTimeout(() => {
      if (commit) setSpreadIndex(targetIndex);
      setMotion(null);
      setProgress(0);
      motionTimer.current = null;
      const afterMotion = afterMotionRef.current;
      afterMotionRef.current = null;
      if (commit) afterMotion?.();
    }, MOTION_MS);
  }, [clearMotionTimer, setProgress]);

  const animateMotion = useCallback((current: Motion, commit: boolean) => {
    setMotion({ ...current, phase: "animating" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(commit ? 1 : 0));
    });
    completeMotion(commit, current.targetIndex);
  }, [completeMotion, setProgress]);

  const createMotion = useCallback((direction: Direction, phase: MotionPhase): Motion | null => {
    const currentIndex = Math.min(Math.max(0, spreadIndex), Math.max(0, spreads.length - 1));
    const targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= spreads.length) return null;
    return {
      direction,
      targetIndex,
      phase,
      kind: transitionKind(singlePageMode, currentIndex, targetIndex),
    };
  }, [singlePageMode, spreadIndex, spreads.length]);

  const animateToSpread = useCallback((targetIndex: number, afterMotion?: () => void) => {
    if (motion) return false;
    const currentIndex = Math.min(Math.max(0, spreadIndex), Math.max(0, spreads.length - 1));
    if (targetIndex < 0 || targetIndex >= spreads.length) return false;
    if (targetIndex === currentIndex) {
      afterMotion?.();
      return true;
    }

    const direction: Direction = targetIndex > currentIndex ? "next" : "previous";
    const nextMotion: Motion = {
      direction,
      targetIndex,
      phase: "animating",
      // Direct jumps still look like a book turn rather than a hard teleport.
      kind: "flip",
    };

    clearMotionTimer();
    afterMotionRef.current = afterMotion ?? null;
    setProgress(0);
    setMotion(nextMotion);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(1));
    });
    completeMotion(true, targetIndex);
    return true;
  }, [clearMotionTimer, completeMotion, motion, setProgress, spreadIndex, spreads.length]);

  const openStoryTarget = useCallback((node: ComposerNode) => {
    const story = node.story;
    if (!story) return;
    const pageIndex = issue.pages.findIndex((page) => page.slug === story.targetPageSlug);
    if (pageIndex < 0) return;
    const targetSpreadIndex = spreads.findIndex((item) => item.pageIndexes.includes(pageIndex));
    if (targetSpreadIndex < 0) return;

    const finishStoryNavigation = () => {
      const nextPath = `/magazine/${issue.slug}/${story.targetPageSlug}#${encodeURIComponent(story.targetSectionSlug)}`;
      window.history.pushState(window.history.state, "", nextPath);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById(story.targetSectionSlug)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }));
    };

    animateToSpread(targetSpreadIndex, finishStoryNavigation);
  }, [animateToSpread, issue.pages, issue.slug, spreads]);

  const navigate = useCallback((direction: Direction) => {
    if (motion) return;
    const nextMotion = createMotion(direction, "animating");
    if (!nextMotion) return;

    clearMotionTimer();
    setProgress(0);
    setMotion(nextMotion);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(1));
    });
    completeMotion(true, nextMotion.targetIndex);
  }, [clearMotionTimer, completeMotion, createMotion, motion, setProgress]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => setSinglePageMode(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const initialSpreadIndex = spreads.findIndex((item) => item.pageIndexes.includes(initialPageIndex));
    setSpreadIndex((current) => initialPageSlug && initialSpreadIndex >= 0 ? initialSpreadIndex : Math.min(current, spreads.length - 1));
    setMotion(null);
    setProgress(0);
  }, [initialPageIndex, initialPageSlug, setProgress, spreads]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, [role='dialog'], [contenteditable='true']")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") navigate("next");
      if (event.key === "ArrowLeft" || event.key === "PageUp") navigate("previous");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  useEffect(() => () => clearMotionTimer(), [clearMotionTimer]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!firstPage || motion) return;
    const hashValue = decodeURIComponent(window.location.hash.slice(1));
    const hashBelongsToActivePage = activePages.some((activePage) => activePage.sections.some((section) => section.slug === hashValue));
    const hash = hashBelongsToActivePage ? window.location.hash : "";
    const requestedPageIsVisible = initialPageSlug && activePages.some((activePage) => activePage.slug === initialPageSlug);
    const routePageSlug = requestedPageIsVisible ? initialPageSlug : firstPage.slug;
    const nextPath = `/magazine/${issue.slug}/${routePageSlug}${hash}`;
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) {
      window.history.replaceState(window.history.state, "", nextPath);
    }
  }, [activePages, firstPage, initialPageSlug, issue.slug, motion]);

  useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  }, [safeSpreadIndex]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    const placeEngagementRails = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sections = stage.querySelectorAll<HTMLElement>(".xp-magazine__spread-layer--current [data-magazine-section]");
        sections.forEach((sectionEl) => {
          const bar = sectionEl.querySelector<HTMLElement>(":scope > .xp-section-engagement--inline");
          if (!bar) return;

          const heading = sectionEl.querySelector<HTMLElement>("h1, h2, h3");
          if (!heading) {
            bar.removeAttribute("data-title-anchored");
            bar.style.removeProperty("--xp-engagement-top");
            bar.style.removeProperty("--xp-engagement-left");
            return;
          }

          const sectionRect = sectionEl.getBoundingClientRect();
          const headingRect = heading.getBoundingClientRect();
          const paragraphs = Array.from(sectionEl.querySelectorAll<HTMLElement>("p"))
            .filter((el) => !el.closest(".xp-section-engagement"))
            .map((el) => ({ el, rect: el.getBoundingClientRect() }))
            .filter(({ rect }) => rect.width > 0 && rect.height > 0);

          let anchorBottom = headingRect.bottom;
          const nearbyDeck = paragraphs
            .filter(({ rect }) => rect.top >= headingRect.bottom - 8 && rect.top <= headingRect.bottom + Math.max(180, sectionRect.height * 0.24))
            .sort((a, b) => a.rect.top - b.rect.top)[0];
          if (nearbyDeck) anchorBottom = Math.max(anchorBottom, nearbyDeck.rect.bottom);

          const barRect = bar.getBoundingClientRect();
          const safeInset = Math.max(10, Math.min(18, sectionRect.width * 0.025));
          const desiredTop = anchorBottom - sectionRect.top + 10;
          const maxTop = Math.max(safeInset, sectionRect.height - barRect.height - safeInset);
          let top = Math.min(Math.max(safeInset, desiredTop), maxTop);

          const candidates = Array.from(sectionEl.querySelectorAll<HTMLElement>("h1,h2,h3,p,[data-composer-node]"))
            .filter((el) => !el.closest(".xp-section-engagement") && el !== heading)
            .map((el) => el.getBoundingClientRect())
            .filter((rect) => rect.width > 0 && rect.height > 0);
          const barTopAbs = sectionRect.top + top;
          const barBottomAbs = barTopAbs + barRect.height;
          const collision = candidates.some((rect) => rect.top < barBottomAbs + 4 && rect.bottom > barTopAbs - 4 && rect.top >= anchorBottom - 2);
          if (collision) top = maxTop;

          const left = Math.min(
            Math.max(safeInset, headingRect.left - sectionRect.left),
            Math.max(safeInset, sectionRect.width - barRect.width - safeInset),
          );

          bar.style.setProperty("--xp-engagement-top", `${Math.round(top)}px`);
          bar.style.setProperty("--xp-engagement-left", `${Math.round(left)}px`);
          bar.setAttribute("data-title-anchored", "true");
        });
      });
    };

    placeEngagementRails();
    const resize = new ResizeObserver(placeEngagementRails);
    resize.observe(stage);
    window.addEventListener("resize", placeEngagementRails);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("resize", placeEngagementRails);
    };
  }, [safeSpreadIndex, singlePageMode, motion]);

  const issueThemeStyle = Object.fromEntries([
    ...Object.entries(issue.colors).map(([key, value]) => [`--mag-color-${key}`, value]),
    ...Object.entries(issue.fonts).map(([key, value]) => [`--mag-font-${key}`, value]),
    ...Object.entries(issue.styles).map(([key, value]) => [`--mag-style-${key}`, value]),
  ]) as CSSProperties;

  const toggleFullscreen = async () => {
    if (!readerRef.current) return;
    if (!document.fullscreenElement) await readerRef.current.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };

  const updatePointerGuide = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const guide = pointerGuideRef.current;
    const stage = stageRef.current;
    if (!guide || !stage) return;

    const book = stage.querySelector<HTMLElement>(".xp-magazine__book");
    const stageRect = stage.getBoundingClientRect();
    const bookRect = book?.getBoundingClientRect();
    const insideBook = Boolean(bookRect && event.clientX >= bookRect.left && event.clientX <= bookRect.right && event.clientY >= bookRect.top && event.clientY <= bookRect.bottom);

    guide.style.setProperty("--xp-pointer-x", `${event.clientX - stageRect.left}px`);
    guide.style.setProperty("--xp-pointer-y", `${event.clientY - stageRect.top}px`);

    if (!insideBook) {
      guide.dataset.visible = "false";
      return;
    }

    guide.dataset.visible = "true";
    if (isInteractiveTarget(event.target)) {
      guide.dataset.mode = "interactive";
      guide.dataset.label = "";
      return;
    }

    const direction: Direction = event.clientX >= (bookRect!.left + bookRect!.width / 2) ? "next" : "previous";
    const available = direction === "next" ? canGoForward : canGoBack;
    guide.dataset.mode = available ? direction : "interactive";
    guide.dataset.label = available ? (direction === "next" ? "Next" : "Previous") : "";
  }, [canGoBack, canGoForward]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointerGuide(event);
    if (motion?.phase === "animating" || isInteractiveTarget(event.target)) return;

    pointerStartX.current = event.clientX;
    pointerStartY.current = event.clientY;
    pointerCurrentX.current = event.clientX;
    pointerStartTime.current = performance.now();
    gestureAxis.current = null;
    suppressClick.current = false;
    setProgress(0);

    // Capturing on the stage means images and decorative page surfaces cannot
    // steal the drag gesture before it reaches the magazine reader.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointerGuide(event);
    if (pointerStartX.current == null || pointerStartY.current == null) return;

    pointerCurrentX.current = event.clientX;
    const deltaX = event.clientX - pointerStartX.current;
    const deltaY = event.clientY - pointerStartY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!gestureAxis.current && Math.max(absX, absY) >= 7) {
      gestureAxis.current = absY > absX * 1.15 ? "vertical" : "horizontal";
    }

    if (gestureAxis.current === "vertical") return;
    if (gestureAxis.current !== "horizontal" || absX < 7) return;

    suppressClick.current = true;
    const direction: Direction = deltaX < 0 ? "next" : "previous";
    const nextMotion = createMotion(direction, "dragging");
    if (!nextMotion) {
      setProgress(0);
      return;
    }

    if (!motion || motion.direction !== direction || motion.phase !== "dragging") {
      setMotion(nextMotion);
    }

    const stageWidth = Math.max(1, event.currentTarget.getBoundingClientRect().width);
    const distance = singlePageMode ? stageWidth * 0.48 : stageWidth * 0.3;
    setProgress(absX / distance);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointerGuide(event);
    if (pointerStartX.current == null) return;

    const startX = pointerStartX.current;
    const deltaX = event.clientX - startX;
    const elapsed = Math.max(1, performance.now() - pointerStartTime.current);
    const velocity = Math.abs(deltaX) / elapsed;

    pointerStartX.current = null;
    pointerStartY.current = null;
    pointerCurrentX.current = null;
    gestureAxis.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (!motion || motion.phase !== "dragging") {
      setMotion(null);
      setProgress(0);
      return;
    }

    const commit = progressRef.current >= TURN_THRESHOLD || (Math.abs(deltaX) >= FLICK_DISTANCE && velocity >= FLICK_VELOCITY);
    animateMotion(motion, commit);
  };

  const onStageClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (motion || isInteractiveTarget(event.target)) return;

    const stage = stageRef.current;
    const book = stage?.querySelector<HTMLElement>(".xp-magazine__book");
    if (!book) return;
    const rect = book.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;

    navigate(event.clientX >= rect.left + rect.width / 2 ? "next" : "previous");
  };

  const hidePointerGuide = () => {
    if (pointerGuideRef.current) pointerGuideRef.current.dataset.visible = "false";
  };

  const renderSpread = (
    spreadToRender: Spread,
    role: "current" | "target",
    hiddenPageIndex?: number,
  ) => {
    const isSingle = spreadToRender.pageIndexes.length === 1;
    return (
      <div
        className={`xp-magazine__spread-layer xp-magazine__spread-layer--${role} ${isSingle ? "is-single" : "is-spread"}`}
        aria-hidden={role === "target" ? true : undefined}
      >
        {spreadToRender.pageIndexes.map((pageIndex, slot) => {
          const page = issue.pages[pageIndex]!;
          const slotClass = isSingle ? "solo" : slot === 0 ? "left" : "right";
          const hidden = hiddenPageIndex === pageIndex;
          return (
            <article
              className={`xp-magazine__sheet xp-magazine__sheet--${slotClass}${hidden ? " is-turning-page" : ""}`}
              key={`${role}-${page.id}`}
              aria-label={role === "current" ? `${page.title}, page ${pageIndex + 1}` : undefined}
            >
              <div className="xp-magazine__paper">
                <MagazineResourcePreloader resources={page.resources} />
                {page.sections.map((section) => <MagazineResourcePreloader key={`resource-${section.id}`} resources={section.resources} />)}
                {new Set(["november-events", "xpomag-12", "ad-thread"]).has(page.slug) ? (
                  <InteractiveMagazinePage slug={page.slug} />
                ) : (
                  <MagazinePageRenderer
                    page={page}
                    globalElements={issue.designElements}
                    onComposerNodeActivate={openStoryTarget}
                    renderComposerNodeOverlay={(node) => node.story?.engagementAnchor ? (
                      <div className="xp-cover-story-engagement" data-story-engagement={node.story.id}>
                        <SectionEngagementBar
                          issueSlug={issue.slug}
                          pageSlug={node.story.targetPageSlug}
                          sectionId={node.story.targetSectionSlug}
                          sectionSlug={node.story.targetSectionSlug}
                          authenticated={viewerAuthenticated}
                          appearance={node.story.engagementAppearance ?? "auto"}
                        />
                      </div>
                    ) : null}
                    renderEngagement={(section) => page.kind === "cover" ? null : (
                      <SectionEngagementBar
                        issueSlug={issue.slug}
                        pageSlug={page.slug}
                        sectionId={section.id}
                        sectionSlug={section.slug}
                        authenticated={viewerAuthenticated}
                        config={section.engagement}
                        appearance={["feature", "advert", "closing"].includes(page.kind) ? "light" : "dark"}
                      />
                    )}
                  />
                )}
                {VIDEO_STORIES[page.slug] ? <YouTubeStoryPanel story={VIDEO_STORIES[page.slug]!} /> : null}
                <span className="xp-magazine__folio" aria-hidden="true">{String(pageIndex + 1).padStart(2, "0")}</span>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const currentTurnPageIndex = motion
    ? motion.direction === "next"
      ? spread.pageIndexes[spread.pageIndexes.length - 1]
      : spread.pageIndexes[0]
    : undefined;

  const backTurnPageIndex = motion && targetSpread
    ? motion.direction === "next"
      ? targetSpread.pageIndexes[0]
      : targetSpread.pageIndexes[targetSpread.pageIndexes.length - 1]
    : undefined;

  const currentTurnPage = currentTurnPageIndex == null ? null : issue.pages[currentTurnPageIndex];
  const backTurnPage = backTurnPageIndex == null ? null : issue.pages[backTurnPageIndex];

  const currentIsSingle = spread.pageIndexes.length === 1;
  const targetIsSingle = targetSpread?.pageIndexes.length === 1;
  const edgeTransition = motion
    ? currentIsSingle && !targetIsSingle
      ? "single-to-spread"
      : !currentIsSingle && targetIsSingle
        ? "spread-to-single"
        : "same-size"
    : "idle";

  const stageStyle = { "--xp-turn-progress": 0 } as CSSProperties;

  return (
    <section
      ref={readerRef}
      className="xp-magazine"
      style={issueThemeStyle}
      aria-label={`${issue.city} magazine, ${issue.issueLabel}`}
    >
      <MagazineResourcePreloader resources={issue.resources} />
      <div className="xp-magazine__toolbar">
        <div className="xp-magazine__meta">
          <span>{issue.city}</span>
          <span aria-hidden="true">/</span>
          <span>{issue.monthLabel}</span>
          <span aria-hidden="true">/</span>
          <span>{issue.issueLabel}</span>
        </div>

        <div className="xp-magazine__page-meta" aria-live="polite">
          {activePages.some((page) => page.access === "member") ? (
            <span className="xp-magazine__member"><LockKeyhole size={13} /> Member</span>
          ) : null}
          <span>{firstPage.title}</span>
          <span>{firstPage.index + 1} / {issue.pages.length}</span>
          <button className="xp-magazine__icon-button" type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}>
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="xp-magazine__stage"
        style={stageStyle}
        data-mode={singlePageMode ? "single" : "spread"}
        data-motion={motion?.kind ?? "idle"}
        data-direction={motion?.direction}
        data-phase={motion?.phase}
        data-edge={edgeTransition}
        onPointerDownCapture={onPointerDown}
        onPointerMoveCapture={onPointerMove}
        onPointerUpCapture={finishPointer}
        onPointerCancelCapture={finishPointer}
        onPointerLeave={hidePointerGuide}
        onClickCapture={onStageClick}
        onDragStartCapture={(event) => event.preventDefault()}
      >
        <div ref={pointerGuideRef} className="xp-magazine__pointer-guide" data-visible="false" data-mode="interactive" data-label="" aria-hidden="true">
          <span className="xp-magazine__pointer-guide-label" />
        </div>
        <div className="xp-magazine__book-shadow" aria-hidden="true" />
        <div className="xp-magazine__book">
          {motion && targetSpread
            ? renderSpread(
                targetSpread,
                "target",
                motion.kind === "flip" && edgeTransition !== "same-size" ? backTurnPageIndex : undefined,
              )
            : null}
          {renderSpread(spread, "current", motion?.kind === "flip" ? currentTurnPageIndex : undefined)}

          {motion?.kind === "flip" && currentTurnPage && backTurnPage ? (
            <div className={`xp-magazine__turn-sheet xp-magazine__turn-sheet--${motion.direction}`} aria-hidden="true">
              <div className="xp-magazine__turn-face xp-magazine__turn-face--front">
                <MagazinePageRenderer page={currentTurnPage} globalElements={issue.designElements} />
              </div>
              <div className="xp-magazine__turn-face xp-magazine__turn-face--back">
                <MagazinePageRenderer page={backTurnPage} globalElements={issue.designElements} />
              </div>
              <div className="xp-magazine__fold-shadow" />
              <div className="xp-magazine__fold-highlight" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="xp-magazine__footer">
        <div className="xp-magazine__progress" aria-label="Magazine progress">
          {spreads.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Open ${singlePageMode ? "page" : "spread"} ${index + 1}`}
              aria-current={index === safeSpreadIndex ? "page" : undefined}
              className="xp-magazine__dot"
              onClick={() => {
                animateToSpread(index);
              }}
            />
          ))}
        </div>

        <p className="xp-magazine__hint">Drag the page · or use ← →</p>

        <div className="xp-magazine__controls">
          <button type="button" className="xp-magazine__nav" onClick={() => navigate("previous")} disabled={!canGoBack || Boolean(motion)} aria-label="Previous spread">
            <ArrowLeft size={18} /><span>Previous</span>
          </button>
          <button type="button" className="xp-magazine__nav xp-magazine__nav--primary" onClick={() => navigate("next")} disabled={!canGoForward || Boolean(motion)} aria-label="Next spread">
            <span>Next</span><ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
