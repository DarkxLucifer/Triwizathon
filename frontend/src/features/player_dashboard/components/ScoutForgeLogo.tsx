"use client";

import React from "react";

interface ScoutForgeLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ScoutForgeLogo: React.FC<ScoutForgeLogoProps> = ({
  className = "",
  iconOnly = false,
  size = "md",
}) => {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-2 select-none px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm ${className}`}>
      {/* Target Shield Icon matching user's exact logo */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#bef226] drop-shadow-[0_0_6px_rgba(190,242,38,0.4)]"
        >
          {/* Outer Shield with tactical notches */}
          <path
            d="M20 3L6 8V19C6 27.5 12 34.5 20 37C28 34.5 34 27.5 34 19V8L20 3Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Internal Crosshair Circle */}
          <circle
            cx="20"
            cy="20"
            r="8"
            stroke="currentColor"
            strokeWidth="3"
          />

          {/* Center Target Dot */}
          <circle
            cx="20"
            cy="20"
            r="2.5"
            fill="currentColor"
          />

          {/* Reticle Diagonal Pointer Line */}
          <line
            x1="25.5"
            y1="14.5"
            x2="33"
            y2="7"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text: Scout (White) + Forge (Slanted Lime) */}
      {!iconOnly && (
        <div className={`font-black tracking-tight leading-none ${textSizes[size]}`}>
          <span className="text-white font-sans font-extrabold">Scout</span>
          <span className="text-[#bef226] italic ml-0.5 font-sans font-black">Forge</span>
        </div>
      )}
    </div>
  );
};
