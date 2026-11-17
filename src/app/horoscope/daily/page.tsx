"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, Share2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ZODIAC_SIGNS, type ZodiacData } from "@/lib/zodiacData";

type Reading = {
  horoscope: string;
  luckyColor: string;
  luckyNumber: number | string;
  mood: string;
};

/** Star positions (in a 300×220 box) and the lines that join them, per sign. */
const CONSTELLATIONS: Record<string, { points: [number, number][]; connections: [number, number][] }> = {
  aries: { points: [[90, 80], [150, 60], [210, 110], [230, 150]], connections: [[0, 1], [1, 2], [2, 3]] },
  taurus: { points: [[60, 50], [110, 110], [160, 130], [190, 170], [210, 110], [250, 70]], connections: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]] },
  gemini: { points: [[80, 50], [120, 40], [160, 50], [200, 60], [90, 150], [130, 140], [170, 150], [210, 160]], connections: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [3, 7]] },
  cancer: { points: [[150, 40], [150, 100], [90, 160], [210, 160]], connections: [[0, 1], [1, 2], [1, 3]] },
  leo: { points: [[220, 50], [180, 40], [140, 50], [130, 90], [160, 120], [200, 120], [220, 170], [160, 170]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 4]] },
  virgo: { points: [[100, 40], [150, 60], [200, 80], [230, 120], [180, 140], [130, 120], [160, 190]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [4, 6]] },
  libra: { points: [[150, 40], [90, 90], [210, 90], [150, 150], [110, 180], [190, 180]], connections: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5]] },
  scorpio: { points: [[70, 40], [120, 50], [150, 90], [170, 130], [150, 170], [110, 180], [90, 150], [80, 110]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
  sagittarius: { points: [[100, 90], [140, 60], [180, 80], [200, 120], [160, 140], [120, 130], [80, 110], [120, 50]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7]] },
  capricorn: { points: [[80, 70], [140, 40], [200, 70], [220, 120], [160, 160], [100, 130]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
  aquarius: { points: [[70, 60], [110, 50], [150, 70], [190, 60], [90, 130], [130, 120], [170, 140], [210, 130]], connections: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5], [2, 6]] },
  pisces: { points: [[50, 50], [80, 70], [110, 100], [150, 110], [190, 100], [220, 70], [250, 50], [130, 160]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [2, 7], [3, 7]] },
};

/** Swatch for the lucky colour — keyed on the English name the API puts in brackets. */
const COLOR_SWATCH: Record<string, string> = {
  Red: "#e0454b",
  "Dark Blue": "#1f3a93",
  Yellow: "#f4d03f",
  Green: "#2fa86a",
  White: "#f5f5f0",
  Purple: "#8e5bd6",
  Gold: "#d4af37",
  Orange: "#f0883e",
  Pink: "#ef7fb0",
  "Light Blue": "#7ec8f2",
};

const SI_DAYS = ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා"];
const SI_MONTHS = ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"];

/** Sinhala date that doesn't depend on the browser's locale support, e.g. "2026 නොවැම්බර් 17, අඟහරුවාදා". */
function sinhalaDate(d: Date) {
  return `${d.getFullYear()} ${SI_MONTHS[d.getMonth()]} ${d.getDate()}, ${SI_DAYS[d.getDay()]}`;
}

const STORAGE_KEY = "daily-horoscope-sign";
const STEP = 360 / 12;

/** Splits "රතු (Red)" into its Sinhala label and English key. */
function splitLabel(value: string) {
  const m = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { si: m[1], en: m[2] } : { si: value, en: "" };
}

function Constellation({ sign }: { sign: ZodiacData }) {
  const reduce = useReducedMotion();
  const c = CONSTELLATIONS[sign.urlName];
  if (!c) return null;
  const lineDur = 0.5;
  return (
    <svg viewBox="0 0 300 220" className="w-full h-auto" role="img" aria-label={`${sign.name} තාරකා මණ්ඩලය`}>
      <defs>
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {c.connections.map(([a, b], i) => (
        <motion.line
          key={`${sign.urlName}-l${i}`}
          x1={c.points[a][0]}
          y1={c.points[a][1]}
          x2={c.points[b][0]}
          y2={c.points[b][1]}
          stroke="rgba(231,198,90,0.55)"
          strokeWidth={1.4}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.2 + i * lineDur * 0.6, duration: lineDur, ease: "easeInOut" }}
        />
      ))}
      {c.points.map(([x, y], i) => (
        <motion.circle
          key={`${sign.urlName}-p${i}`}
          cx={x}
          cy={y}
          r={3.6}
          fill="#fbf1d3"
          filter="url(#star-glow)"
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0.75, 1, 0.75] }}
          transition={{
            scale: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            opacity: { delay: 0.6, duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </svg>
  );
}

function ReadingSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      {[100, 96, 92, 98, 70].map((w, i) => (
        <div key={i} className="skeleton h-4 rounded-full" style={{ width: `${w}%` }} />
      ))}
      <div className="grid grid-cols-3 gap-3 pt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function DailyHoroscopePage() {
  const [activeSign, setActiveSign] = useState<ZodiacData>(ZODIAC_SIGNS[0]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Date is set after mount so server and browser HTML match (no hydration error).
  const [today, setToday] = useState<{ label: string; iso: string } | null>(null);
  useEffect(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setToday({ label: sinhalaDate(d), iso });
  }, []);

  // Wheel state
  const [rotationY, setRotationY] = useState(0);
  const [radius, setRadius] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const didDrag = useRef(false);

  const activeIndex = ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName);

  // Remember the visitor's sign between visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const found = ZODIAC_SIGNS.find((s) => s.urlName === saved);
      if (found) setActiveSign(found);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeSign.urlName);
    } catch {}
  }, [activeSign]);

  // Wheel radius follows viewport width.
  useEffect(() => {
    const onResize = () => setRadius(window.innerWidth < 640 ? 170 : window.innerWidth < 1024 ? 230 : 280);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Turn the wheel the short way round to the active sign.
  useEffect(() => {
    setRotationY((current) => {
      const target = -activeIndex * STEP;
      const diff = ((((target - current + 180) % 360) + 360) % 360) - 180;
      return current + diff;
    });
  }, [activeIndex]);

  // Fetch today's reading.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/horoscope/daily?sign=${activeSign.urlName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch horoscope data");
        return res.json();
      })
      .then((data) => {
        if (alive) setReading({ horoscope: data.horoscope, luckyColor: data.luckyColor, luckyNumber: data.luckyNumber, mood: data.mood });
      })
      .catch((err) => {
        console.error(err);
        if (alive) setError("දත්ත ලබා ගැනීමේදී ගැටලුවක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeSign, reloadKey]);

  const go = useCallback((delta: number) => {
    setActiveSign((cur) => {
      const i = ZODIAC_SIGNS.findIndex((s) => s.urlName === cur.urlName);
      return ZODIAC_SIGNS[(i + delta + 12) % 12];
    });
  }, []);

  // ← → keys turn the wheel (unless the visitor is typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Drag / swipe — pointer events cover mouse, touch and pen.
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotationY;
    didDrag.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 8 && !didDrag.current) {
      didDrag.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (didDrag.current) setRotationY(dragStartRotation.current + dx * 0.22);
  };
  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!didDrag.current) return;
    let idx = Math.round(-rotationY / STEP) % 12;
    if (idx < 0) idx += 12;
    if (idx === activeIndex) setRotationY(-Math.round(-rotationY / STEP) * STEP);
    else setActiveSign(ZODIAC_SIGNS[idx]);
  };

  const shareText = reading
    ? `${activeSign.name} ලග්න දෛනික පලාපල: ${reading.horoscope}\nශුභ වර්ණය: ${reading.luckyColor}\nශුභ අංකය: ${reading.luckyNumber}\nමනෝභාවය: ${reading.mood}`
    : "";

  const handleShare = async () => {
    if (!reading) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${activeSign.name} ලග්න දෛනික පලාපල`, text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("පලාපල විස්තරය පිටපත් කරන ලදී!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const color = reading ? splitLabel(reading.luckyColor) : null;
  const mood = reading ? splitLabel(reading.mood) : null;

  return (
    <div className="relative w-full">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-24">
        {/* Header */}
        <header className="text-center mb-6">
          <span className="eyebrow mb-5">තරුවල රහස් ශක්තිය</span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
            අද දවසේ <span className="text-gold-gradient">පලාපල</span>
          </h1>
          <p className="inline-flex items-center gap-2 text-gray-300 min-h-[1.5rem]">
            <Calendar className="w-4 h-4 text-gold-400" />
            {today && <time dateTime={today.iso}>{today.label}</time>}
          </p>
        </header>

        {/* Zodiac wheel */}
        <section aria-label="ලග්නය තෝරන්න" className="flex flex-col items-center overflow-x-clip -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            className="relative w-full h-[240px] sm:h-[300px] flex items-center justify-center select-none"
            style={{ perspective: "1100px", touchAction: "pan-y" }}
          >
            <div
              className="relative w-[104px] h-[124px] sm:w-[132px] sm:h-[156px] preserve-3d cursor-grab active:cursor-grabbing"
              style={{
                transform: `rotateY(${rotationY}deg)`,
                transition: isDragging ? "none" : "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {ZODIAC_SIGNS.map((sign, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={sign.urlName}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    aria-pressed={isActive}
                    aria-label={`${sign.name} ලග්නය`}
                    onClick={() => !didDrag.current && setActiveSign(sign)}
                    className={`absolute inset-0 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 border transition-[background,border-color,box-shadow,color] duration-500 ${
                      isActive
                        ? "border-gold-400/80 text-gold-100 bg-gradient-to-b from-gold-500/25 to-space-900/90 shadow-[0_0_40px_-6px_rgba(231,198,90,0.55)]"
                        : "border-[var(--hairline)] text-gray-400 bg-space-900/75 hover:text-white hover:border-gold-500/40"
                    }`}
                    style={{
                      transform: `rotateY(${idx * STEP}deg) translateZ(${radius}px)`,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <span className={`glyph text-4xl sm:text-5xl mb-1 ${isActive ? "text-gold-300" : "text-gold-400/60"}`} aria-hidden="true">
                      {sign.iconSymbol}&#xFE0E;
                    </span>
                    <span className="font-serif font-bold text-base sm:text-lg leading-none">{sign.name}</span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.15em] opacity-70">{sign.nameEn.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-5 mt-2">
            <button type="button" onClick={() => go(-1)} aria-label="පෙර ලග්නය" className="btn-ghost !p-3">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-serif text-gold-300 tabular-nums min-w-[4.5rem] text-center" aria-live="polite">
              {activeIndex + 1} <span className="text-gray-500">/ 12</span>
            </span>
            <button type="button" onClick={() => go(1)} aria-label="මීළඟ ලග්නය" className="btn-ghost !p-3">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">අදින්න, ක්ලික් කරන්න, හෝ ← → යතුරු භාවිතා කරන්න</p>
        </section>

        {/* Reading */}
        <section className="mt-14" aria-live="polite">
          <div className="glass rounded-[2rem] overflow-hidden grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Sign panel */}
            <div className="relative p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[var(--hairline)] bg-gradient-to-b from-gold-500/[0.06] to-transparent">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSign.urlName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="glyph text-6xl text-gold-300 drop-shadow-[0_0_18px_rgba(231,198,90,0.45)]" aria-hidden="true">
                      {activeSign.iconSymbol}&#xFE0E;
                    </span>
                    <div>
                      <h2 className="font-serif font-bold text-3xl sm:text-4xl leading-tight">{activeSign.name} ලග්නය</h2>
                      <p className="text-sm text-gold-300/90 tracking-[0.12em] mt-1">{activeSign.nameEn.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="max-w-[300px] mx-auto my-2">
                    <Constellation sign={activeSign} />
                  </div>

                  <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                      <dt className="text-gray-500 mb-1">මූලද්‍රව්‍යය</dt>
                      <dd className="text-gold-100">{activeSign.element}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">පාලක ග්‍රහයා</dt>
                      <dd className="text-gold-100">{activeSign.ruler}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-500 mb-1">කාල සීමාව</dt>
                      <dd className="text-gold-100">{activeSign.date}</dd>
                    </div>
                  </dl>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Reading panel */}
            <div className="p-8 sm:p-10 flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="font-serif text-xl text-gold-300">අද දින පලාපල</h3>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!reading || loading}
                  className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Share2 className="w-4 h-4" />
                  බෙදාගන්න
                </button>
              </div>

              {loading ? (
                <ReadingSkeleton />
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <p className="text-red-300 mb-6 max-w-sm">{error}</p>
                  <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn-ghost">
                    <RotateCw className="w-4 h-4" />
                    නැවත උත්සාහ කරන්න
                  </button>
                </div>
              ) : (
                reading && (
                  <motion.div
                    key={`${activeSign.urlName}-${reloadKey}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col"
                  >
                    <p className="text-base sm:text-lg leading-[1.85] text-gray-100">{reading.horoscope}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-auto pt-8 sm:pt-10">
                      <div className="rounded-2xl border border-[var(--hairline)] bg-space-900/40 px-4 py-3 sm:p-4 flex sm:block items-center justify-between gap-3">
                        <span className="block text-xs text-gray-400 sm:mb-2">ශුභ වර්ණය</span>
                        <span className="flex items-center gap-2 text-gold-100 font-semibold">
                          {color?.en && COLOR_SWATCH[color.en] && (
                            <span
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/30 flex-shrink-0"
                              style={{ background: COLOR_SWATCH[color.en] }}
                              aria-hidden="true"
                            />
                          )}
                          {color?.si}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-[var(--hairline)] bg-space-900/40 px-4 py-3 sm:p-4 flex sm:block items-center justify-between gap-3">
                        <span className="block text-xs text-gray-400 sm:mb-2">ශුභ අංකය</span>
                        <span className="font-serif text-3xl leading-none text-gold-gradient">{reading.luckyNumber}</span>
                      </div>
                      <div className="rounded-2xl border border-[var(--hairline)] bg-space-900/40 px-4 py-3 sm:p-4 flex sm:block items-center justify-between gap-3">
                        <span className="block text-xs text-gray-400 sm:mb-2">මනෝභාවය</span>
                        <span className="text-gold-100 font-semibold">{mood?.si}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href={`/zodiac/${activeSign.urlName}`} className="btn-ghost">
              {activeSign.name} ලග්නය ගැන වැඩිදුර
            </Link>
            <Link href="/services" className="btn-gold">
              පෞද්ගලික කේන්දර කියවීමක්
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
