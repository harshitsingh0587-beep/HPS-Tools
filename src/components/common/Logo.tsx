import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const dimensions = {
    sm: { w: 32, h: 32, text: 'text-base', sub: 'text-[9px]' },
    md: { w: 40, h: 40, text: 'text-xl', sub: 'text-[11px]' },
    lg: { w: 56, h: 56, text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm"
        style={{ width: dimensions.w, height: dimensions.h }}
      >
        <svg viewBox="0 0 128 128" width="100%" height="100%">
          <defs>
            <linearGradient id="logoNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--hps-primary, #142B50)" />
              <stop offset="100%" stopColor="#0A1830" />
            </linearGradient>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="var(--hps-accent, #D4AF37)" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="116" height="116" rx="26" fill="url(#logoNavy)" stroke="url(#logoGold)" strokeWidth="4" />
          <circle cx="64" cy="64" r="42" fill="none" stroke="url(#logoGold)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          
          {/* Mini precision utility emblem */}
          <path d="M58 26 L70 26 L68 30 L72 34 L68 38 L70 42 L58 42 L60 38 L56 34 L60 30 Z" fill="url(#logoGold)" />
          <circle cx="64" cy="34" r="2.5" fill="#142B50" />

          {/* HPS Text */}
          <text 
            x="64" 
            y="76" 
            fontFamily="system-ui, sans-serif" 
            fontSize="36" 
            fontWeight="900" 
            letterSpacing="2" 
            textAnchor="middle" 
            fill="url(#logoGold)"
          >
            HPS
          </text>
          {/* TOOLS */}
          <text 
            x="64" 
            y="96" 
            fontFamily="system-ui, sans-serif" 
            fontSize="12" 
            fontWeight="700" 
            letterSpacing="4" 
            textAnchor="middle" 
            fill="#FFFFFF"
          >
            TOOLS
          </text>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold tracking-tight text-hps-text text-xl">HPS</span>
          <span className="font-semibold text-hps-accent text-xl">Tools</span>
        </div>
        {showTagline && (
          <span className="text-xs text-hps-muted font-medium mt-0.5 tracking-wide">
            Simple Tools. One Place.
          </span>
        )}
      </div>
    </div>
  );
};
