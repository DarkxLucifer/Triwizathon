import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export function Logo({
  className = '',
  iconOnly = false,
  size = 'md',
  theme = 'dark',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-[17px]',
    md: 'text-[21px]',
    lg: 'text-[26px]',
  };

  const isLight = theme === 'light';

  // Electric lime accent matching the user's exact brand logo
  const limeColor = '#c6ff00';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem matching the exact ScoutForge logo */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Shield - Top Left Roof & Upper Left Wall */}
          <path
            d="M 47 11 L 18 26 L 16 57"
            stroke={limeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Shield - Bottom V Point Base */}
          <path
            d="M 22 71 L 50 89 L 78 71"
            stroke={limeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Shield - Right Side Wall */}
          <path
            d="M 84 57 L 84 35"
            stroke={limeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Shield - Top Right Roof Stub (opening for crosshair ray) */}
          <path
            d="M 55 11 L 67 17"
            stroke={limeColor}
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Inner Circular Target Ring (with top-right gap where pointer exits) */}
          <path
            d="M 68 34 A 22 22 0 1 0 52 72"
            stroke={limeColor}
            strokeWidth="7.5"
            strokeLinecap="round"
          />

          {/* Tactical Crosshair Pointer extending out through the top-right gap */}
          <line
            x1="50"
            y1="50"
            x2="78"
            y2="22"
            stroke={limeColor}
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Center Target Bullseye Ring */}
          <circle
            cx="50"
            cy="50"
            r="8.5"
            stroke={limeColor}
            strokeWidth="5"
            fill="none"
          />

          {/* Center Bullseye Dot */}
          <circle
            cx="50"
            cy="50"
            r="3.5"
            fill={limeColor}
          />
        </svg>
      </div>

      {!iconOnly && (
        <div
          className={`font-black italic tracking-[-0.04em] leading-none ${textSizes[size]}`}
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <span
            className={isLight ? 'text-slate-900' : 'text-white'}
            style={{ fontWeight: 900 }}
          >
            Scout
          </span>
          <span
            style={{
              color: limeColor,
              fontWeight: 900,
            }}
          >
            Forge
          </span>
        </div>
      )}
    </div>
  );
}
