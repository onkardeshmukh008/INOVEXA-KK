import React from 'react';

interface SkillTraceLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'badge-only' | 'horizontal' | 'icon';
  className?: string;
  showSparkles?: boolean;
}

export const SkillTraceLogo: React.FC<SkillTraceLogoProps> = ({
  size = 'md',
  variant = 'badge-only',
  className = '',
  showSparkles = false,
}) => {
  let badgePx = 48;
  if (typeof size === 'number') {
    badgePx = size;
  } else if (size === 'sm') {
    badgePx = 32;
  } else if (size === 'md') {
    badgePx = 52;
  } else if (size === 'lg') {
    badgePx = 80;
  } else if (size === 'xl') {
    badgePx = 130;
  }

  // The circular emblem with golden neural profile + upward arrow
  const emblem = (
    <div
      style={{ width: badgePx, height: badgePx }}
      className={`relative rounded-full flex items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#DFB25B" />
            <stop offset="100%" stopColor="#C9943B" />
          </linearGradient>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#223359" />
            <stop offset="100%" stopColor="#14203B" />
          </linearGradient>
          <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0D1629" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Circular Midnight Navy Background */}
        <circle cx="100" cy="100" r="92" fill="url(#navyGrad)" filter="url(#badgeShadow)" />
        <circle cx="100" cy="100" r="91" stroke="#DFB25B" strokeWidth="1.2" strokeOpacity="0.35" />

        {/* Golden Outline Head Profile facing Right */}
        <path
          d="M 82 158 
             L 82 142 
             C 88 138, 96 130, 99 122 
             C 106 122, 114 116, 116 109 
             L 126 109 
             C 127 106, 126 103, 123 102 
             C 125 100, 127 96, 125 94 
             L 120 94 
             C 121 90, 123 86, 126 84 
             C 124 81, 119 82, 116 84 
             C 114 74, 110 65, 102 59
             C 93 52, 78 52, 68 59
             C 57 66, 54 82, 57 95
             C 59 104, 65 111, 71 116
             C 74 125, 78 139, 82 158 Z"
          stroke="url(#goldGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Brain Contour */}
        <path
          d="M 69 68 
             C 74 61, 88 60, 95 66 
             C 101 71, 102 81, 99 87 
             C 96 93, 89 97, 83 99
             C 75 101, 68 96, 65 90
             C 63 82, 65 73, 69 68 Z"
          stroke="url(#goldGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="1.5 0.5"
          fill="none"
          opacity="0.9"
        />

        {/* Neural Brain Nodes and Interconnecting Lines */}
        {/* Lines */}
        <line x1="72" y1="76" x2="82" y2="70" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="82" y1="70" x2="93" y2="76" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="82" y1="70" x2="84" y2="84" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="72" y1="76" x2="71" y2="88" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="71" y1="88" x2="84" y2="84" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="84" y1="84" x2="92" y2="90" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="93" y1="76" x2="92" y2="90" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="84" y1="84" x2="103" y2="82" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="103" y1="82" x2="114" y2="86" stroke="url(#goldGrad)" strokeWidth="2" />
        
        {/* Nodes */}
        <circle cx="72" cy="76" r="3.2" fill="#F5D77F" />
        <circle cx="82" cy="70" r="3.6" fill="#F5D77F" />
        <circle cx="93" cy="76" r="3.2" fill="#F5D77F" />
        <circle cx="71" cy="88" r="3.2" fill="#F5D77F" />
        <circle cx="84" cy="84" r="4.2" fill="#F5D77F" />
        <circle cx="92" cy="90" r="3.2" fill="#F5D77F" />
        <circle cx="103" cy="82" r="3" fill="#F5D77F" />

        {/* Ear & Facial Inner Lines */}
        <path
          d="M 104 102 C 102 99, 103 93, 107 92 C 110 91, 112 95, 110 99"
          stroke="url(#goldGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Neck Neural Lattice */}
        <line x1="78" y1="126" x2="91" y2="120" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="91" y1="120" x2="96" y2="134" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="78" y1="126" x2="84" y2="140" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="84" y1="140" x2="96" y2="134" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="84" y1="140" x2="88" y2="154" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="96" y1="134" x2="108" y2="148" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="88" y1="154" x2="108" y2="148" stroke="url(#goldGrad)" strokeWidth="2" />

        <circle cx="78" cy="126" r="3" fill="#F5D77F" />
        <circle cx="91" cy="120" r="3.2" fill="#F5D77F" />
        <circle cx="96" cy="134" r="3.2" fill="#F5D77F" />
        <circle cx="84" cy="140" r="3" fill="#F5D77F" />
        <circle cx="88" cy="154" r="3" fill="#F5D77F" />
        <circle cx="108" cy="148" r="3" fill="#F5D77F" />

        {/* The Signature Upward Ascending Arrow emerging from the Forehead */}
        {/* Arrow shaft */}
        <line
          x1="112"
          y1="82"
          x2="138"
          y2="54"
          stroke="url(#goldGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        <polyline
          points="123,54 139,53 138,69"
          stroke="url(#goldGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );

  if (variant === 'badge-only' || variant === 'icon') {
    return emblem;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {emblem}
        <div className="flex flex-col">
          <span
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: '#885D32' }}
            className="text-xl font-bold tracking-tight leading-none"
          >
            SkillTrace.Ai
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">
            Career Readiness Platform
          </span>
        </div>
      </div>
    );
  }

  // 'full' variant: as depicted in the user's uploaded image (Emblem centered + Serif Typography beneath + optional sparkles)
  return (
    <div
      style={{ backgroundColor: '#FAF6EE' }}
      className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border border-amber-900/10 shadow-xs ${className}`}
    >
      {/* Subtle Corner Sparkles from the image */}
      {showSparkles && (
        <>
          <span className="absolute top-4 left-4 text-amber-300/80 text-xl font-serif">✦</span>
          <span className="absolute top-4 right-4 text-amber-300/80 text-lg font-serif">✦</span>
          <span className="absolute bottom-4 left-4 text-amber-300/80 text-lg font-serif">✦</span>
          <span className="absolute bottom-4 right-4 text-amber-300/80 text-xl font-serif">✦</span>
        </>
      )}

      {emblem}

      <div className="mt-5 text-center">
        <h1
          style={{
            fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            color: '#865A30',
          }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          SkillTrace.Ai
        </h1>
        <p className="text-xs text-amber-900/70 font-medium mt-1 tracking-wide">
          Know what your projects prove. Discover what to improve next.
        </p>
      </div>
    </div>
  );
};
