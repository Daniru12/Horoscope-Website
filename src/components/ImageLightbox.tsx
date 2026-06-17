"use client";

import { useState } from "react";
import { X, Download, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
}

export default function ImageLightbox({ images, startIndex = 0 }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `horoscope-result-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(images[currentIndex], "_blank");
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="relative group shrink-0 cursor-pointer"
          >
            <img
              src={img}
              alt={`Result ${idx + 1}`}
              className="h-32 w-auto rounded-lg border-2 border-space-700 group-hover:border-gold-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gold-500/20"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          {/* Content */}
          <div
            className="relative z-10 flex flex-col items-center gap-4 max-w-[90vw] max-h-[90vh] animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center gap-4 w-full justify-between px-2">
              <span className="text-gray-400 text-sm">
                {currentIndex + 1} / {images.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  බාගත කරන්න (Download)
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white bg-space-800 hover:bg-space-700 p-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative flex items-center justify-center">
              {images.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-2 z-20 bg-space-800/80 hover:bg-space-700 text-white p-3 rounded-full transition-colors text-lg cursor-pointer backdrop-blur-sm"
                >
                  ‹
                </button>
              )}

              <img
                src={images[currentIndex]}
                alt={`Result ${currentIndex + 1}`}
                className="max-w-[85vw] max-h-[75vh] rounded-2xl border-2 border-space-700 shadow-2xl object-contain"
              />

              {images.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 z-20 bg-space-800/80 hover:bg-space-700 text-white p-3 rounded-full transition-colors text-lg cursor-pointer backdrop-blur-sm"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-in {
          animation: fadeScaleIn 0.25s ease-out;
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
