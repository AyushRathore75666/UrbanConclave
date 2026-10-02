"use client";

import { useEffect, useState } from "react";

export function PhotoCrossfade({ images, className = "" }: { images: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || images.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [images.length, reduceMotion]);

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      {images.map((src, imageIndex) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${
            imageIndex === index ? "opacity-100" : "opacity-0"
          } ${reduceMotion ? "" : "transition-opacity duration-1000"} ${
            imageIndex === index && !reduceMotion ? "scene-drift" : ""
          }`}
        />
      ))}
    </div>
  );
}
