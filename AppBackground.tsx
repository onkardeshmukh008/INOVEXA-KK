import React from 'react';

export const AppBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Base Canvas */}
      <div className="absolute inset-0 bg-[#F9F7F3]" />

      {/* Atmospheric Radial Glow Gradients */}
      <div
        className="absolute inset-0 opacity-60 mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(222, 176, 89, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 90% 12%, rgba(25, 42, 77, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 85%, rgba(222, 176, 89, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 80% 90%, rgba(25, 42, 77, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 30% 65%, rgba(245, 215, 127, 0.10) 0%, transparent 35%)
          `,
        }}
      />

      {/* Isometric Dot Matrix Grid */}
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: `radial-gradient(rgba(30, 43, 77, 0.45) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* SVG High-Tech Engineering Blueprint & Neural Constellation Picture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="blueprintLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFB25B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8A6B34" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E2B4D" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="navyBeam" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E2B4D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#DFB25B" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id="nodeGlowGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2B8" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F5D77F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#DFB25B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Top-Right Neural Engineering Network */}
        <g stroke="url(#blueprintLine)" strokeWidth="1.2" fill="none">
          <line x1="1150" y1="60" x2="1320" y2="140" />
          <line x1="1320" y1="140" x2="1480" y2="90" />
          <line x1="1320" y1="140" x2="1390" y2="260" />
          <line x1="1390" y1="260" x2="1540" y2="300" />
          <line x1="1240" y1="220" x2="1390" y2="260" />
          <line x1="1150" y1="60" x2="1240" y2="220" />
          <line x1="1050" y1="160" x2="1240" y2="220" />
          <line x1="1050" y1="160" x2="1150" y2="60" />
          <line x1="1390" y1="260" x2="1330" y2="400" />
          <line x1="1240" y1="220" x2="1330" y2="400" />
        </g>

        {/* Neural Nodes with Glow Top-Right */}
        <circle cx="1150" cy="60" r="4.5" fill="#DFB25B" />
        <circle cx="1320" cy="140" r="5.5" fill="#DFB25B" />
        <circle cx="1480" cy="90" r="4" fill="#DFB25B" />
        <circle cx="1390" cy="260" r="5" fill="#DFB25B" />
        <circle cx="1240" cy="220" r="4.5" fill="#DFB25B" />
        <circle cx="1050" cy="160" r="4" fill="#DFB25B" />
        <circle cx="1540" cy="300" r="4.5" fill="#DFB25B" />
        <circle cx="1330" cy="400" r="4" fill="#DFB25B" />

        {/* Bottom-Left Constellation Matrix */}
        <g stroke="url(#blueprintLine)" strokeWidth="1.2" fill="none">
          <line x1="80" y1="740" x2="200" y2="670" />
          <line x1="200" y1="670" x2="330" y2="750" />
          <line x1="200" y1="670" x2="160" y2="830" />
          <line x1="330" y1="750" x2="460" y2="700" />
          <line x1="330" y1="750" x2="360" y2="870" />
          <line x1="160" y1="830" x2="360" y2="870" />
          <line x1="460" y1="700" x2="580" y2="790" />
          <line x1="460" y1="700" x2="520" y2="610" />
          <line x1="330" y1="750" x2="520" y2="610" />
        </g>

        {/* Nodes Bottom-Left */}
        <circle cx="80" cy="740" r="4" fill="#DFB25B" />
        <circle cx="200" cy="670" r="5" fill="#DFB25B" />
        <circle cx="330" cy="750" r="5.5" fill="#DFB25B" />
        <circle cx="160" cy="830" r="4" fill="#DFB25B" />
        <circle cx="460" cy="700" r="4.5" fill="#DFB25B" />
        <circle cx="360" cy="870" r="4" fill="#DFB25B" />
        <circle cx="580" cy="790" r="4" fill="#DFB25B" />
        <circle cx="520" cy="610" r="4" fill="#DFB25B" />

        {/* Geometric Hexagonal Blueprint Watermark in Center */}
        <g opacity="0.18" stroke="#1E2B4D" strokeWidth="1.2" fill="none">
          <polygon points="800,390 880,435 880,530 800,575 720,530 720,435" />
          <polygon points="800,340 930,415 930,560 800,635 670,560 670,415" />
          <line x1="800" y1="390" x2="800" y2="575" />
          <line x1="720" y1="435" x2="880" y2="530" />
          <line x1="720" y1="530" x2="880" y2="435" />
          <circle cx="800" cy="482" r="30" stroke="#DFB25B" strokeWidth="0.8" />
        </g>

        {/* Decorative Floating Code Glyphs */}
        <g fill="#1E2B4D" opacity="0.22" fontSize="13" fontFamily="monospace" fontWeight="bold">
          <text x="140" y="220">&lt;React.StrictMode /&gt;</text>
          <text x="1420" y="520">git commit -m &quot;feat&quot;</text>
          <text x="1180" y="780">prisma.schema</text>
          <text x="240" y="480">async () =&gt; &#123;...&#125;</text>
          <text x="1280" y="190">200 OK</text>
        </g>

        {/* Sparkle Four-Point Stars */}
        <g fill="#DFB25B" opacity="0.55">
          <path d="M 280,130 Q 280,142 268,142 Q 280,142 280,154 Q 280,142 292,142 Q 280,142 280,130 Z" />
          <path d="M 1410,670 Q 1410,682 1398,682 Q 1410,682 1410,694 Q 1410,682 1422,682 Q 1410,682 1410,670 Z" />
          <path d="M 920,110 Q 920,120 910,120 Q 920,120 920,130 Q 920,120 930,120 Q 920,120 920,110 Z" />
          <path d="M 680,880 Q 680,890 670,890 Q 680,890 680,900 Q 680,890 690,890 Q 680,890 680,880 Z" />
        </g>
      </svg>
    </div>
  );
};
