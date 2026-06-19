"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductMediaSliderProps {
  image: string | null;
  images: string[] | null;
  video: string | null;
  name: string;
}

export function ProductMediaSlider({ image, images, video, name }: ProductMediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine media into a single array
  const mediaList: { type: "video" | "image"; url: string }[] = [];

  if (video) {
    mediaList.push({ type: "video", url: video });
  }

  if (image) {
    mediaList.push({ type: "image", url: image });
  } else if (!image && mediaList.length === 0) {
    mediaList.push({ type: "image", url: "/images/placeholder.png" });
  }

  if (images && images.length > 0) {
    images.forEach((img) => mediaList.push({ type: "image", url: img }));
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  if (mediaList.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted shadow-inner group">
        {mediaList.map((media, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {media.type === "image" ? (
              <Image
                src={media.url}
                alt={`${name} - media ${idx + 1}`}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <video
                src={media.url}
                controls
                autoPlay={idx === currentIndex}
                muted
                className="w-full h-full object-cover bg-black"
              />
            )}
          </div>
        ))}

        {mediaList.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {mediaList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-hide">
          {mediaList.map((media, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all snap-center",
                idx === currentIndex ? "border-emerald-500 shadow-md" : "border-transparent hover:border-emerald-300 opacity-70 hover:opacity-100"
              )}
            >
              {media.type === "image" ? (
                <Image src={media.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <video src={media.url} className="w-full h-full object-cover opacity-50" />
                  <Play className="absolute w-6 h-6 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
