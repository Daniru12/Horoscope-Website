"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Share2, Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface ZodiacSign {
  name: string;
  nameEn: string;
  date: string;
  icon: string;
  urlName: string;
  element: string;
  ruler: string;
  glowColor: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "මේෂ", nameEn: "Aries", date: "මාර්තු 21 - අප්‍රේල් 19", icon: "🐏", urlName: "aries", element: "තේජෝ (ගිනි)", ruler: "කුජ", glowColor: "from-red-500/10" },
  { name: "වෘෂභ", nameEn: "Taurus", date: "අප්‍රේල් 20 - මැයි 20", icon: "🐂", urlName: "taurus", element: "පඨවි (පොළොව)", ruler: "සිකුරු", glowColor: "from-amber-600/10" },
  { name: "මිථුන", nameEn: "Gemini", date: "මැයි 21 - ජූනි 20", icon: "👥", urlName: "gemini", element: "වායෝ (හුළඟ)", ruler: "බුධ", glowColor: "from-cyan-500/10" },
  { name: "කටක", nameEn: "Cancer", date: "ජූනි 21 - ජූලි 22", icon: "🦀", urlName: "cancer", element: "ආපෝ (ජලය)", ruler: "සඳු", glowColor: "from-blue-500/10" },
  { name: "සිංහ", nameEn: "Leo", date: "ජූලි 23 - අගෝස්තු 22", icon: "🦁", urlName: "leo", element: "තේජෝ (ගිනි)", ruler: "රවි", glowColor: "from-red-500/10" },
  { name: "කන්‍යා", nameEn: "Virgo", date: "අගෝස්තු 23 - සැප්තැම්බර් 22", icon: "👩", urlName: "virgo", element: "පඨවි (පොළොව)", ruler: "බුධ", glowColor: "from-amber-600/10" },
  { name: "තුලා", nameEn: "Libra", date: "සැප්තැම්බර් 23 - ඔක්තෝබර් 22", icon: "⚖️", urlName: "libra", element: "වායෝ (හුළඟ)", ruler: "සිකුරු", glowColor: "from-cyan-500/10" },
  { name: "වෘශ්චික", nameEn: "Scorpio", date: "ඔක්තෝබර් 23 - නොවැම්බර් 21", icon: "🦂", urlName: "scorpio", element: "ආපෝ (ජලය)", ruler: "කුජ/ප්ලූටෝ", glowColor: "from-blue-500/10" },
  { name: "ධනු", nameEn: "Sagittarius", date: "නොවැම්බර් 22 - දෙසැම්බර් 21", icon: "🏹", urlName: "sagittarius", element: "තේජෝ (ගිනි)", ruler: "ගුරු", glowColor: "from-red-500/10" },
  { name: "මකර", nameEn: "Capricorn", date: "දෙසැම්බර් 22 - ජනවාරි 19", icon: "🐐", urlName: "capricorn", element: "පඨවි (පොළොව)", ruler: "සෙනසුරු", glowColor: "from-amber-600/10" },
  { name: "කුම්භ", nameEn: "Aquarius", date: "ජනවාරි 20 - පෙබරවාරි 18", icon: "🏺", urlName: "aquarius", element: "වායෝ (හුළඟ)", ruler: "සෙනසුරු/යුරේනස්", glowColor: "from-cyan-500/10" },
  { name: "මීන", nameEn: "Pisces", date: "පෙබරවාරි 19 - මාර්තු 20", icon: "🐟", urlName: "pisces", element: "ආපෝ (ජලය)", ruler: "ගුරු/නෙප්චූන්", glowColor: "from-blue-500/10" },
];

const CONSTELLATIONS: Record<string, { points: [number, number][]; connections: [number, number][] }> = {
  aries: {
    points: [[90, 80], [150, 60], [210, 110], [230, 150]],
    connections: [[0, 1], [1, 2], [2, 3]]
  },
  taurus: {
    points: [[60, 50], [110, 110], [160, 130], [190, 170], [210, 110], [250, 70]],
    connections: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]]
  },
  gemini: {
    points: [[80, 50], [120, 40], [160, 50], [200, 60], [90, 150], [130, 140], [170, 150], [210, 160]],
    connections: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [3, 7]]
  },
  cancer: {
    points: [[150, 40], [150, 100], [90, 160], [210, 160]],
    connections: [[0, 1], [1, 2], [1, 3]]
  },
  leo: {
    points: [[220, 50], [180, 40], [140, 50], [130, 90], [160, 120], [200, 120], [220, 170], [160, 170]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 4]]
  },
  virgo: {
    points: [[100, 40], [150, 60], [200, 80], [230, 120], [180, 140], [130, 120], [160, 190]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [4, 6]]
  },
  libra: {
    points: [[150, 40], [90, 90], [210, 90], [150, 150], [110, 180], [190, 180]],
    connections: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5]]
  },
  scorpio: {
    points: [[70, 40], [120, 50], [150, 90], [170, 130], [150, 170], [110, 180], [90, 150], [80, 110]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
  },
  sagittarius: {
    points: [[100, 90], [140, 60], [180, 80], [200, 120], [160, 140], [120, 130], [80, 110], [120, 50]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7]]
  },
  capricorn: {
    points: [[80, 70], [140, 40], [200, 70], [220, 120], [160, 160], [100, 130]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]
  },
  aquarius: {
    points: [[70, 60], [110, 50], [150, 70], [190, 60], [90, 130], [130, 120], [170, 140], [210, 130]],
    connections: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5], [2, 6]]
  },
  pisces: {
    points: [[50, 50], [80, 70], [110, 100], [150, 110], [190, 100], [220, 70], [250, 50], [130, 160]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [2, 7], [3, 7]]
  }
};

export default function DailyHoroscopePage() {
  const [activeSign, setActiveSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [horoscopeData, setHoroscopeData] = useState<{
    horoscope: string;
    luckyColor: string;
    luckyNumber: number | string;
    mood: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3D Selector State
  const [rotationY, setRotationY] = useState(0);
  const [radius, setRadius] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartXRef = useRef(0);
  const isDragRef = useRef(false);

  // Dynamic radius based on viewport size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRadius(180);
      } else if (window.innerWidth < 1024) {
        setRadius(240);
      } else {
        setRadius(280);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync 3D rotation position when activeSign is changed
  useEffect(() => {
    const targetIdx = ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName);
    const currentAngle = rotationY;
    const targetAngle = -targetIdx * 30; // 360 / 12 = 30

    // Find the shortest route around the circle
    const diff = ((targetAngle - currentAngle + 180) % 360) - 180;
    const newAngle = currentAngle + diff;

    setRotationY(newAngle);
  }, [activeSign]);

  // Immersive Starry Space Canvas Background with animated constellations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Star data generator
    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.01 + 0.003,
      });
    }

    let constellationProgress = 0;
    const constellationSpeed = 0.025;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space radial glow
      const spaceGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      spaceGlow.addColorStop(0, "#08061e");
      spaceGlow.addColorStop(0.5, "#03020c");
      spaceGlow.addColorStop(1, "#010005");
      ctx.fillStyle = spaceGlow;
      ctx.fillRect(0, 0, width, height);

      // Render floating stars
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, Math.min(star.alpha, 0.95))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw active zodiac sign constellation
      const constellation = CONSTELLATIONS[activeSign.urlName];
      if (constellation) {
        if (constellationProgress < 1) {
          constellationProgress += constellationSpeed;
        }

        const isDesktop = window.innerWidth >= 1024;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const scale = isDesktop ? 1.3 : 1.0;

        // Map relative coordinates to screen coordinates
        const screenPoints = constellation.points.map(([px, py]) => {
          const ox = (px - 150) * scale + centerX;
          const oy = (py - 110) * scale + centerY;
          return [ox, oy];
        });

        // Set line style (glowing gold)
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(212, 175, 55, 0.75)";

        // Draw connections
        const totalLines = constellation.connections.length;
        const linesToDraw = Math.floor(totalLines * constellationProgress);
        const partialRatio = (totalLines * constellationProgress) % 1;

        for (let i = 0; i < linesToDraw; i++) {
          const [p1, p2] = constellation.connections[i];
          ctx.beginPath();
          ctx.moveTo(screenPoints[p1][0], screenPoints[p1][1]);
          ctx.lineTo(screenPoints[p2][0], screenPoints[p2][1]);
          ctx.stroke();
        }

        // Draw final animating line path
        if (linesToDraw < totalLines) {
          const [p1, p2] = constellation.connections[linesToDraw];
          const pt1 = screenPoints[p1];
          const pt2 = screenPoints[p2];
          ctx.beginPath();
          ctx.moveTo(pt1[0], pt1[1]);
          ctx.lineTo(
            pt1[0] + (pt2[0] - pt1[0]) * partialRatio,
            pt1[1] + (pt2[1] - pt1[1]) * partialRatio
          );
          ctx.stroke();
        }

        // Draw pulsing stars on constellation nodes
        screenPoints.forEach(([sx, sy], idx) => {
          const pulse = Math.sin(Date.now() * 0.0035 + idx) * 0.25 + 0.75;
          ctx.shadowBlur = 16;
          ctx.shadowColor = "rgba(255, 230, 120, 0.85)";
          ctx.fillStyle = `rgba(255, 240, 180, ${pulse})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    constellationProgress = 0;
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSign]);

  // Fetch horoscope data
  useEffect(() => {
    let isMounted = true;
    async function fetchHoroscope() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/horoscope/daily?sign=${activeSign.urlName}`);
        if (!res.ok) {
          throw new Error("Failed to fetch horoscope data");
        }
        const data = await res.json();
        if (isMounted) {
          setHoroscopeData({
            horoscope: data.horoscope,
            luckyColor: data.luckyColor,
            luckyNumber: data.luckyNumber,
            mood: data.mood,
          });
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setError("දත්ත ලබා ගැනීමේදී ගැටලුවක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHoroscope();

    return () => {
      isMounted = false;
    };
  }, [activeSign]);

  // Swipe/Drag Event Handlers for the 3D Selector
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    setCurrentRotation(rotationY);
    isDragRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 8) {
      isDragRef.current = true;
    }
    setRotationY(currentRotation + deltaX * 0.22); // scale drag multiplier
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (isDragRef.current) {
      snapToNearest();
    } else {
      snapToActiveSign();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.touches[0].clientX;
    setCurrentRotation(rotationY);
    isDragRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 8) {
      isDragRef.current = true;
    }
    setRotationY(currentRotation + deltaX * 0.22);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (isDragRef.current) {
      snapToNearest();
    } else {
      snapToActiveSign();
    }
  };

  const snapToActiveSign = () => {
    const currentIdx = ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName);
    const targetAngle = -currentIdx * 30;
    const diff = ((targetAngle - rotationY + 180) % 360) - 180;
    setRotationY((prev) => prev + diff);
  };

  const snapToNearest = () => {
    const anglePerSign = 30; // 360 / 12
    const rawIndex = -rotationY / anglePerSign;
    let snappedIndex = Math.round(rawIndex) % 12;
    if (snappedIndex < 0) snappedIndex += 12;

    const newSign = ZODIAC_SIGNS[snappedIndex];
    const targetAngle = -snappedIndex * 30;

    if (newSign.urlName === activeSign.urlName) {
      // Force snap back to the exact target angle if same sign
      const diff = ((targetAngle - rotationY + 180) % 360) - 180;
      setRotationY((prev) => prev + diff);
    } else {
      setActiveSign(newSign);
    }
  };

  const handleSignClick = (idx: number) => {
    if (isDragRef.current) return; // If dragged, don't trigger click selection
    setActiveSign(ZODIAC_SIGNS[idx]);
  };

  const rotatePrev = () => {
    const currentIdx = ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName);
    const prevIdx = (currentIdx - 1 + 12) % 12;
    setActiveSign(ZODIAC_SIGNS[prevIdx]);
  };

  const rotateNext = () => {
    const currentIdx = ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName);
    const nextIdx = (currentIdx + 1) % 12;
    setActiveSign(ZODIAC_SIGNS[nextIdx]);
  };

  const handleShare = async () => {
    if (!horoscopeData) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${activeSign.name} ලග්න දෛනික පලාපල`,
          text: `${activeSign.name} ලග්න දෛනික පලාපල: ${horoscopeData.horoscope}\nශුභ වර්ණය: ${horoscopeData.luckyColor}\nශුභ අංකය: ${horoscopeData.luckyNumber}\nමනෝභාවය: ${horoscopeData.mood}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          `${activeSign.name} ලග්න දෛනික පලාපල: ${horoscopeData.horoscope}\nශුභ වර්ණය: ${horoscopeData.luckyColor}\nශුභ අංකය: ${horoscopeData.luckyNumber}\nමනෝභාවය: ${horoscopeData.mood}`
        );
        toast.success("පලාපල විස්තරය පසුරු පුවරුවට (clipboard) පිටපත් කරන ලදී!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden text-white flex flex-col justify-between">
      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.45);
        }
      `}</style>

      {/* Galaxy Space Background (Canvas rendering) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Main Layout Container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10 flex-grow flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>තරු වල රහස්‍ය ශක්තිය</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-wide">
            අද දවසේ පලාපල (Today's Horoscope)
          </h1>
          <div className="flex items-center justify-center gap-2 text-gold-300">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold text-sm md:text-base">
              {new Date().toLocaleDateString("si-LK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stacked Layout: Wheel on Top, Details Below */}
        <div className="flex flex-col gap-6 items-center w-full">
          {/* Top: 3D Curve Wheel Selector */}
          <div className="flex flex-col items-center justify-center py-6 w-full max-w-2xl mx-auto">
            <h3 className="font-serif text-lg font-bold mb-4 text-gold-300/80 flex items-center gap-2">
              ලග්න චක්‍රය කරකවන්න
            </h3>

            {/* 3D Wheel viewport */}
            <div
              className="relative w-full h-[280px] sm:h-[350px] flex items-center justify-center overflow-visible select-none"
              style={{ perspective: "1000px" }}
            >
              {/* Draggable cylindrical container */}
              <div
                className="relative w-[110px] h-[90px] sm:w-[150px] sm:h-[120px] preserve-3d cursor-grab active:cursor-grabbing"
                style={{
                  transform: `rotateY(${rotationY}deg)`,
                  transition: isDragging ? "none" : "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {ZODIAC_SIGNS.map((sign, idx) => {
                  const angle = idx * 30; // 360 / 12
                  const isActive = activeSign.urlName === sign.urlName;
                  return (
                    <div
                      key={sign.urlName}
                      onClick={() => handleSignClick(idx)}
                      className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center border transition-all duration-500 backface-hidden select-none ${isActive
                          ? "bg-gradient-to-b from-gold-500/25 to-space-950/95 border-gold-400 shadow-[0_0_30px_rgba(212,175,55,0.4)] text-gold-200 scale-105"
                          : "bg-space-900/70 border-space-700/60 text-gray-400 hover:border-gold-500/40 hover:text-white"
                        }`}
                      style={{
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        cursor: "pointer",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <span className="text-3xl sm:text-5xl mb-1 sm:mb-2 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                        {sign.icon}
                      </span>
                      <span className="font-serif font-bold text-base sm:text-lg">{sign.name}</span>
                      <span className="text-[10px] sm:text-xs opacity-60 font-medium">{sign.nameEn}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selector Next/Prev Control Buttons */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={rotatePrev}
                className="p-3 bg-space-800/80 hover:bg-space-700 border border-space-700/60 text-gold-400 hover:text-gold-200 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                title="පෙර ලග්නය"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-serif text-sm tracking-wide text-gold-300 font-medium">
                {ZODIAC_SIGNS.findIndex((s) => s.urlName === activeSign.urlName) + 1} / 12
              </span>
              <button
                onClick={rotateNext}
                className="p-3 bg-space-800/80 hover:bg-space-700 border border-space-700/60 text-gold-400 hover:text-gold-200 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                title="මීළඟ ලග්නය"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom: Immersive Glassmorphic Horoscope Details */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-space-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-space-700/40 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden min-h-[420px] flex flex-col justify-between transition-all duration-500 hover:border-gold-500/20">

              {/* Dynamic light glow corresponding to zodiac sign elements (fire/earth/air/water) */}
              <div
                className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeSign.glowColor} to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000`}
              ></div>

              <div className="relative z-10 w-full">
                {/* Header details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl text-gold-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.45)]">
                      {activeSign.icon}
                    </span>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-0.5 tracking-wide">
                        {activeSign.name} ලග්නය
                      </h2>
                      <p className="text-gold-400/90 text-sm font-medium tracking-wide">
                        {activeSign.nameEn}
                      </p>
                    </div>
                  </div>
                  {horoscopeData && !loading && (
                    <button
                      onClick={handleShare}
                      className="p-3.5 bg-space-800/80 hover:bg-space-700/90 border border-space-700/60 rounded-full text-gold-300 hover:text-white transition-all hover:scale-105 duration-300"
                      title="පලාපල විස්තරය බෙදාගන්න"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Horoscope content rendering */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-gold-400" />
                    <p className="text-lg font-medium tracking-wide text-gold-200/80">
                      පලාපල විස්තරය තරු සිතියම් හරහා ගණනය කරමින් පවතී...
                    </p>
                  </div>
                ) : error ? (
                  <div className="py-20 text-center text-red-400">
                    <p className="text-lg mb-6">{error}</p>
                    <button
                      onClick={() => setActiveSign({ ...activeSign })}
                      className="px-6 py-2.5 bg-space-800 hover:bg-space-700 border border-space-600 rounded-xl text-white font-medium transition-all"
                    >
                      නැවත උත්සාහ කරන්න
                    </button>
                  </div>
                ) : (
                  horoscopeData && (
                    <>
                      {/* Detailed Horoscope Text */}
                      <div className="max-w-none mb-6">
                        <div className="text-base sm:text-lg leading-relaxed text-gray-200 bg-space-950/40 p-5 rounded-2xl border border-space-800/50 shadow-inner font-normal">
                          {horoscopeData.horoscope}
                        </div>
                      </div>

                      {/* Dynamic Horoscope Sub-details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-space-800">
                        <div className="bg-space-950/45 rounded-xl p-4 text-center border border-space-800/60 hover:border-gold-500/25 transition-all duration-300">
                          <span className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">
                            ශුභ වර්ණය
                          </span>
                          <span className="font-semibold text-gold-300 text-sm sm:text-base">
                            {horoscopeData.luckyColor}
                          </span>
                        </div>
                        <div className="bg-space-950/45 rounded-xl p-4 text-center border border-space-800/60 hover:border-gold-500/25 transition-all duration-300">
                          <span className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">
                            ශුභ අංකය
                          </span>
                          <span className="font-semibold text-gold-300 text-sm sm:text-base">
                            {horoscopeData.luckyNumber}
                          </span>
                        </div>
                        <div className="bg-space-950/45 rounded-xl p-4 text-center border border-space-800/60 hover:border-gold-500/25 transition-all duration-300">
                          <span className="block text-xs text-gray-400 mb-1 font-semibold tracking-wider uppercase">
                            මනෝභාවය
                          </span>
                          <span className="font-semibold text-gold-300 text-sm sm:text-base">
                            {horoscopeData.mood}
                          </span>
                        </div>
                      </div>

                      {/* Element and Ruler information badges */}
                      <div className="flex flex-wrap gap-3 mt-6 pt-4 justify-center sm:justify-start border-t border-space-800/30 text-xs text-gray-400 font-medium">
                        <span className="px-3.5 py-1.5 rounded-full bg-space-800/50 border border-space-700/60 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                          මූලද්‍රව්‍යය: <strong className="text-gold-200">{activeSign.element}</strong>
                        </span>
                        <span className="px-3.5 py-1.5 rounded-full bg-space-800/50 border border-space-700/60 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                          පාලක ග්‍රහයා: <strong className="text-gold-200">{activeSign.ruler}</strong>
                        </span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
