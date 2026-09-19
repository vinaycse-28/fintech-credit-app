import React from 'react';

/**
 * ScoreCoinGauge
 * High-fidelity 3D metallic coin design corresponding to the creditworthiness score.
 * Features an integrated circular progress gauge, realistic specular reflections,
 * and embossed Indian Rupee symbol (₹).
 * 
 * Tiers:
 * - Score >= 80: Radiant Gold Coin (Emerald/Mint outer progress ring)
 * - Score 65–79: Lustrous Silver / Platinum Coin (Vibrant Blue outer progress ring)
 * - Score 40–64: Polished Bronze / Copper Coin (Warm Amber outer progress ring)
 * - Score < 40:  Burnished Gunmetal / Dark Steel Coin (Crimson outer progress ring)
 */
export default function ScoreCoinGauge({ 
  score = 78, 
  size = 175,
  className = "" 
}) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Determine metal tier & palette based on score
  let tier = 'gold';
  let ringColor = '#10B981'; // Emerald
  let coinFaceGradient = {
    stop1: '#FFFBEB',
    stop2: '#FDE68A',
    stop3: '#F59E0B',
    stop4: '#D97706',
    stop5: '#92400E',
  };
  let coinRimGrad = {
    start: '#FBBF24',
    mid: '#B45309',
    end: '#FDE68A'
  };
  let symbolColor = '#78350F';
  let symbolHighlight = '#FFFBEB';

  if (clampedScore >= 80) {
    // Gold Tier
    tier = 'gold';
    ringColor = '#10B981';
    coinFaceGradient = {
      stop1: '#FFFDE7',
      stop2: '#FDE047',
      stop3: '#EAB308',
      stop4: '#CA8A04',
      stop5: '#854D0E',
    };
    coinRimGrad = {
      start: '#FEF08A',
      mid: '#A16207',
      end: '#FACC15'
    };
    symbolColor = '#713F12';
    symbolHighlight = '#FEF9C3';
  } else if (clampedScore >= 65) {
    // Silver / Platinum Tier
    tier = 'silver';
    ringColor = '#2563EB';
    coinFaceGradient = {
      stop1: '#FFFFFF',
      stop2: '#F1F5F9',
      stop3: '#CBD5E1',
      stop4: '#94A3B8',
      stop5: '#475569',
    };
    coinRimGrad = {
      start: '#FFFFFF',
      mid: '#64748B',
      end: '#E2E8F0'
    };
    symbolColor = '#334155';
    symbolHighlight = '#FFFFFF';
  } else if (clampedScore >= 40) {
    // Bronze / Copper Tier
    tier = 'bronze';
    ringColor = '#F59E0B';
    coinFaceGradient = {
      stop1: '#FFF7ED',
      stop2: '#FFEDD5',
      stop3: '#FB923C',
      stop4: '#C2410C',
      stop5: '#7C2D12',
    };
    coinRimGrad = {
      start: '#FED7AA',
      mid: '#9A3412',
      end: '#F97316'
    };
    symbolColor = '#431407';
    symbolHighlight = '#FFEDD5';
  } else {
    // Gunmetal / Obsidian Tier
    tier = 'gunmetal';
    ringColor = '#EF4444';
    coinFaceGradient = {
      stop1: '#94A3B8',
      stop2: '#64748B',
      stop3: '#334155',
      stop4: '#1E293B',
      stop5: '#0F172A',
    };
    coinRimGrad = {
      start: '#CBD5E1',
      mid: '#1E293B',
      end: '#475569'
    };
    symbolColor = '#0F172A';
    symbolHighlight = '#E2E8F0';
  }

  // Circular gauge calculations (outer track radius = 86)
  const radius = 86;
  const circumference = 2 * Math.PI * radius; // ~540.35
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  // Generate unique IDs for SVG defs to avoid collisions
  const uid = `coin_${tier}`;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title={`Creditworthiness Coin (${tier.toUpperCase()}) - Score: ${clampedScore}/100`}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        className="overflow-visible filter drop-shadow-md"
      >
        <defs>
          {/* Outer Ring Glow Filter */}
          <filter id={`${uid}_ringGlow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={ringColor} floodOpacity="0.45" />
          </filter>

          {/* 3D Coin Drop Shadow */}
          <filter id={`${uid}_coinShadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.28" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.18" />
          </filter>

          {/* Rupee Symbol 3D Emboss Filter */}
          <filter id={`${uid}_emboss`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.4" />
            <feDropShadow dx="0" dy="-1" stdDeviation="0.5" floodColor={symbolHighlight} floodOpacity="0.75" />
          </filter>

          {/* Radial Gradient for Coin Face */}
          <radialGradient id={`${uid}_faceGrad`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor={coinFaceGradient.stop1} />
            <stop offset="25%" stopColor={coinFaceGradient.stop2} />
            <stop offset="60%" stopColor={coinFaceGradient.stop3} />
            <stop offset="85%" stopColor={coinFaceGradient.stop4} />
            <stop offset="100%" stopColor={coinFaceGradient.stop5} />
          </radialGradient>

          {/* Linear Gradient for Coin Outer Rim */}
          <linearGradient id={`${uid}_rimGrad`} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor={coinRimGrad.start} />
            <stop offset="50%" stopColor={coinRimGrad.mid} />
            <stop offset="100%" stopColor={coinRimGrad.end} />
          </linearGradient>

          {/* Specular Glare / Curved Glass Shine */}
          <linearGradient id={`${uid}_specular`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Progress Ring Gradient */}
          <linearGradient id={`${uid}_ringGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. Background Circular Gauge Track */}
        <circle 
          cx="100" 
          cy="100" 
          r={radius} 
          fill="none" 
          stroke="#E2E8F0" 
          strokeWidth="9"
        />

        {/* 2. Active Progress Arc (Rotated to start from 12 o'clock) */}
        <circle 
          cx="100" 
          cy="100" 
          r={radius} 
          fill="none" 
          stroke={`url(#${uid}_ringGrad)`}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          filter={`url(#${uid}_ringGlow)`}
          className="transition-all duration-1000 ease-out"
        />

        {/* 3. The 3D Coin Group */}
        <g filter={`url(#${uid}_coinShadow)`}>
          
          {/* A. Outer Beveled Rim of Coin */}
          <circle 
            cx="100" 
            cy="100" 
            r="67" 
            fill={`url(#${uid}_rimGrad)`} 
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1.5"
          />

          {/* B. Secondary Inset Rim (Creates 3D stepped border) */}
          <circle 
            cx="100" 
            cy="100" 
            r="63.5" 
            fill="none" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="1.2"
          />
          <circle 
            cx="100" 
            cy="100" 
            r="62" 
            fill="none" 
            stroke="rgba(0,0,0,0.25)" 
            strokeWidth="1"
          />

          {/* C. Coin Face (Rich Metallic Radial Gradient) */}
          <circle 
            cx="100" 
            cy="100" 
            r="61" 
            fill={`url(#${uid}_faceGrad)`} 
          />

          {/* D. Decorative Coin Inner Beaded / Milled Ring */}
          <circle 
            cx="100" 
            cy="100" 
            r="55" 
            fill="none" 
            stroke="rgba(0,0,0,0.18)" 
            strokeWidth="1.2"
            strokeDasharray="2.5 3.5"
          />

          {/* E. Embossed Indian Rupee Symbol (₹) */}
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="54"
            fill={symbolColor}
            filter={`url(#${uid}_emboss)`}
            className="select-none tracking-tighter"
          >
            ₹
          </text>

          {/* F. Specular Glare Curved Crescent (3D glass/light reflection) */}
          <path
            d="M 50 88 A 54 54 0 0 1 150 88 Q 100 112 50 88 Z"
            fill={`url(#${uid}_specular)`}
            pointerEvents="none"
          />

          {/* G. Bottom Rim Bounce-Light Highlight */}
          <path
            d="M 60 135 A 61 61 0 0 0 140 135 A 58 58 0 0 1 60 135 Z"
            fill="rgba(255,255,255,0.25)"
            pointerEvents="none"
          />
        </g>
      </svg>
    </div>
  );
}
