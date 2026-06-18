"use client";

import { useState } from "react";

export default function VideoBackground() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Optimized poster image (using smaller width and quality parameters)
  const posterUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop&q=60";
  
  // Cloudinary optimized formats (WebM is faster and smaller, MP4 serves as fallback)
  const webmUrl = "https://res.cloudinary.com/dypb7kqho/video/upload/q_auto,f_webm/v1781789946/horoscope/zodiac-bg.webm";
  const mp4Url = "https://res.cloudinary.com/dypb7kqho/video/upload/q_auto,f_mp4/v1781789946/horoscope/zodiac-bg.mp4";

  return (
    <>
      {/* Background Poster Image - visible immediately, placed behind the video */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url('${posterUrl}')` }}
      />
      
      {/* Optimized Video Element - starts hidden (opacity-0) and fades in smoothly when ready */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={posterUrl}
        onPlay={() => setIsLoaded(true)}
        onLoadedData={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={webmUrl} type="video/webm" />
        <source src={mp4Url} type="video/mp4" />
      </video>
    </>
  );
}
