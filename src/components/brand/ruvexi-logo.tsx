"use client";

import React from "react";

interface RuvexiLogoProps {
  className?: string;
  variant?: "full" | "icon" | "horizontal" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

export function RuvexiLogo({
  className = "",
  variant = "full",
  size = "md",
  showSubtitle = true,
}: RuvexiLogoProps) {
  const sizeMap = {
    sm: { text: "text-base", sub: "text-[8px]", accentW: 5, accentH: 7 },
    md: { text: "text-xl", sub: "text-[10px]", accentW: 6, accentH: 9 },
    lg: { text: "text-2xl", sub: "text-xs", accentW: 7, accentH: 11 },
    xl: { text: "text-3xl", sub: "text-sm", accentW: 9, accentH: 14 },
  };

  const currentSize = sizeMap[size];

  // Icon-only variant: just the diamond star mark
  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {/* Diamond star — same as the small mark in the logo */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          <path
            d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
            fill="white"
          />
        </svg>
      </div>
    );
  }

  // Determine text colour based on variant
  const isLight = variant === "light" || variant === "full";
  const mainTextColor = isLight ? "text-white" : "text-slate-950";
  const subTextColor = isLight ? "text-white/70" : "text-slate-500";

  return (
    <div className={`flex flex-col items-start select-none leading-none ${className}`}>
      {/* RUVEXI — with green accent above the I */}
      <div className="relative flex items-baseline">
        <span
          className={`font-bold tracking-widest uppercase ${mainTextColor} ${currentSize.text}`}
          style={{ fontFamily: "inherit", letterSpacing: "0.18em" }}
        >
          RUVEX
        </span>
        {/* The "I" with the green accent mark above it */}
        <span className="relative inline-flex flex-col items-center">
          {/* Green accent / tick mark */}
          <svg
            width={currentSize.accentW}
            height={currentSize.accentH}
            viewBox="0 0 6 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -top-[0.6em] left-1/2 -translate-x-1/2"
          >
            {/* Acute accent shape pointing up-right */}
            <path
              d="M1 8 L5 1"
              stroke="#22c55e"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`font-bold tracking-widest uppercase ${mainTextColor} ${currentSize.text}`}
            style={{ letterSpacing: "0.18em" }}
          >
            I
          </span>
        </span>
      </div>

      {/* SOLUTIONS subtitle */}
      {showSubtitle && (
        <span
          className={`tracking-[0.35em] uppercase font-light ${subTextColor} ${currentSize.sub} mt-0.5`}
        >
          SOLUTIONS
        </span>
      )}
    </div>
  );
}
