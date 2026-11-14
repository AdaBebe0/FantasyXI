import React from "react";

export interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: "light" | "dark";
}

/**
 * FantasyXI Official Brand Logo
 * Geometric energetic 'F' monogram incorporating dynamic football crown and speed cuts.
 * Colors: Deep royal purple (#2e0854, #491088) with electric football neon green (#00ff87, #00d26a).
 */
export const FantasyXILogo: React.FC<LogoProps> = ({
  className = "",
  size = 40,
  showText = true,
  variant = "light",
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Monogram Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="fxi-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#431182" />
            <stop offset="100%" stopColor="#25074d" />
          </linearGradient>
          <linearGradient id="fxi-green-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e575" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="fxi-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00e575" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Dynamic Football Shield / Crown background */}
        <path
          d="M 50 4 L 78 18 L 88 44 C 88 72 50 94 50 94 C 50 94 12 72 12 44 L 22 18 Z"
          fill="url(#fxi-purple-grad)"
        />

        {/* Electric Green Crown spikes at top */}
        <path
          d="M 32 18 L 50 8 L 68 18 L 62 26 L 50 20 L 38 26 Z"
          fill="url(#fxi-green-grad)"
          filter="url(#fxi-glow)"
        />

        {/* Dynamic Forward-Leaning 'F' Monogram */}
        <path
          d="M 36 30 L 68 30 L 64 40 L 48 40 L 45 49 L 60 49 L 56 59 L 42 59 L 34 80 L 25 80 L 36 30 Z"
          fill="#FFFFFF"
        />

        {/* Football Slash / Speed Accent */}
        <path
          d="M 66 33 L 74 33 L 70 41 L 62 41 Z"
          fill="url(#fxi-green-grad)"
        />
        <circle cx="73" cy="55" r="4.5" fill="url(#fxi-green-grad)" />
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            <span
              className={`text-2xl font-black tracking-tight ${
                variant === "dark" ? "text-white" : "text-[#24084a]"
              }`}
            >
              Fantasy
            </span>
            <span className="text-2xl font-black tracking-tight text-[#00c853]">
              XI
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mt-0.5">
            Premier League
          </span>
        </div>
      )}
    </div>
  );
};

export default FantasyXILogo;
