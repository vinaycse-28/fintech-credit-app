import React from 'react';
import Badge from './Badge';

export default function ScoreGauge({ 
  score = 78, 
  max = 100, 
  riskCategory = "Relatively Stable", 
  riskLevel = "Moderate Risk",
  size = "md" 
}) {
  // Determine color theme based on score
  let strokeColor = "#3B82F6"; // blue
  let glowColor = "rgba(59, 130, 246, 0.25)";
  let badgeVariant = "info";

  if (score >= 80) {
    strokeColor = "#10B981"; // emerald
    glowColor = "rgba(16, 185, 129, 0.25)";
    badgeVariant = "good";
  } else if (score >= 65) {
    strokeColor = "#2563EB"; // blue
    glowColor = "rgba(37, 99, 235, 0.25)";
    badgeVariant = "info";
  } else if (score >= 50) {
    strokeColor = "#F59E0B"; // amber
    glowColor = "rgba(245, 158, 11, 0.25)";
    badgeVariant = "warning";
  } else {
    strokeColor = "#EF4444"; // rose
    glowColor = "rgba(239, 68, 68, 0.25)";
    badgeVariant = "danger";
  }

  // SVG Gauge calculations (Semi-circle arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // for 180 deg
  const fillPercentage = Math.min(100, Math.max(0, score)) / max;
  const strokeDashoffset = circumference * (1 - fillPercentage);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <svg 
          width="210" 
          height="125" 
          viewBox="0 0 200 120" 
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Score Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="url(#scoreGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute top-12 flex flex-col items-center">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">/{max}</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
            CreditBridge Signal
          </span>
        </div>
      </div>

      {/* Badges and Subtext */}
      <div className="mt-2 flex flex-col items-center text-center">
        <Badge variant={badgeVariant} size="md" className="font-semibold px-3 py-1">
          {riskCategory} &bull; {riskLevel}
        </Badge>
        <p className="text-[11px] text-slate-400 mt-2 max-w-[220px]">
          Explainable behavioral index based on multi-month ledger consistency
        </p>
      </div>
    </div>
  );
}
