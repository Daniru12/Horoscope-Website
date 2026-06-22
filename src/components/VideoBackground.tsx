"use client";

import { useState, useEffect, useRef } from "react";

export default function VideoBackground() {
  const [isMobile, setIsMobile] = useState(true); // default to mobile (SSR-safe)
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect mobile on mount — avoids loading video on small/slow devices
  useEffect(() => {
    const mobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  // On desktop: use IntersectionObserver to lazily start loading the video
  useEffect(() => {
    if (isMobile || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.src = videoRef.current.dataset.src || "";
          videoRef.current.load();
          observer.disconnect();
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const posterUrl =
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=60&w=800&auto=format&fit=crop";
  const webmUrl =
    "https://res.cloudinary.com/dypb7kqho/video/upload/q_auto,f_webm/v1781789946/horoscope/zodiac-bg.webm";
  const mp4Url =
    "https://res.cloudinary.com/dypb7kqho/video/upload/q_auto,f_mp4/v1781789946/horoscope/zodiac-bg.mp4";

  return (
    <>
      {/* Static poster — always shown immediately, no network cost */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${posterUrl}')` }}
      />

      {/* Video — only rendered on desktop, loaded lazily via IntersectionObserver */}
      {!isMobile && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"           // don't preload until intersection
          poster={posterUrl}
          onPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          data-src={webmUrl}       // lazy src — set by IntersectionObserver
        >
          <source data-src={webmUrl} type="video/webm" />
          <source data-src={mp4Url} type="video/mp4" />
        </video>
      )}
    </>
  );
}
