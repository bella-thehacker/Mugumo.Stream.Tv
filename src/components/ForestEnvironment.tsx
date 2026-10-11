import React, { useEffect, useRef } from 'react';

interface ForestEnvironmentProps {
  intensity?: 'full' | 'subtle' | 'cinema';
  showCRTAnchor?: boolean;
}

export const ForestEnvironment: React.FC<ForestEnvironmentProps> = ({
  intensity = 'full',
  showCRTAnchor = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Drifting bioluminescent spores & mist particles
    const particleCount = intensity === 'cinema' ? 18 : 38;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.45) * 0.35,
      speedY: (Math.random() - 0.5) * 0.25 - 0.15,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
      isOrchid: Math.random() > 0.4, // Pink blossom vs green phosphor spore
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw floating spores
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = Math.max(0.05, p.alpha + Math.sin(time + p.pulsePhase) * 0.25);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.isOrchid) {
          // Bioluminescent pink orchid spore
          ctx.fillStyle = `rgba(236, 72, 153, ${currentAlpha})`;
          ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
          ctx.shadowBlur = p.radius * 6;
        } else {
          // Phosphor sage forest spore
          ctx.fillStyle = `rgba(167, 243, 208, ${currentAlpha * 0.8})`;
          ctx.shadowColor = 'rgba(167, 243, 208, 0.7)';
          ctx.shadowBlur = p.radius * 5;
        }

        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Base Night Canopy Deep Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020907] via-[#04140F] to-[#010605]" />

      {/* 2. Moonlight filtering through the upper canopy */}
      <div 
        className="absolute -top-32 left-1/3 w-[640px] h-[640px] rounded-full opacity-20 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(167, 243, 208, 0.3) 0%, rgba(6, 29, 22, 0) 70%)',
        }}
      />

      {/* 3. Deep Architectural SVG of the Ancient Mũgumo Fig Tree */}
      <svg
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          intensity === 'cinema' ? 'opacity-30' : 'opacity-70'
        }`}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="barkGradient" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#1B382B" />
            <stop offset="40%" stopColor="#0E231B" />
            <stop offset="100%" stopColor="#040F0B" />
          </radialGradient>
          <radialGradient id="mossHighlight" cx="40%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#2E6B4F" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#163C2B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#040F0B" stopOpacity="0" />
          </radialGradient>
          <filter id="forestGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Distant trees silhouettes */}
        <g opacity="0.35" fill="#030C09">
          <path d="M-50,900 L0,480 Q100,520 200,420 L250,900 Z" />
          <path d="M1200,900 L1280,390 Q1350,440 1480,360 L1500,900 Z" />
          <path d="M80,900 L160,340 Q220,380 290,310 L340,900 Z" />
          <path d="M1100,900 L1150,460 Q1210,490 1260,430 L1320,900 Z" />
        </g>

        {/* Sprawling Cathedral Canopy of the Sacred Fig Tree */}
        <g opacity="0.85">
          {/* Main Upper Canopy Branches */}
          <path
            d="M 720,480 Q 560,320 280,240 Q 140,200 -40,160 L -40,0 L 1480,0 L 1480,180 Q 1280,210 1120,260 Q 880,340 720,480 Z"
            fill="#030E0B"
          />
          <path
            d="M 680,420 Q 520,260 340,190 Q 200,140 40,110 L 40,0 L 1400,0 L 1400,130 Q 1180,180 980,240 Q 760,340 680,420 Z"
            fill="#061B14"
            opacity="0.6"
          />
        </g>

        {/* Central Ancient Mũgumo Trunk and Fluted Buttress Roots */}
        <g>
          {/* Main Trunk Column */}
          <path
            d="M 640,380 C 660,470 650,560 610,660 C 580,730 520,810 400,900 L 980,900 C 890,820 840,740 820,660 C 790,560 780,460 780,380 Z"
            fill="url(#barkGradient)"
          />

          {/* Left Sprawling Buttress Root */}
          <path
            d="M 610,660 C 550,710 440,750 300,790 C 180,820 60,850 -20,880 L -20,920 L 480,920 C 560,860 600,780 610,660 Z"
            fill="#061A13"
          />
          {/* Left Root Moss Highlight */}
          <path
            d="M 600,680 C 540,730 430,765 310,800 C 200,830 90,860 -10,885"
            stroke="url(#mossHighlight)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Sprawling Buttress Root */}
          <path
            d="M 820,660 C 880,710 1000,760 1140,800 C 1260,830 1380,860 1480,890 L 1480,920 L 940,920 C 870,850 830,780 820,660 Z"
            fill="#061A13"
          />
          {/* Right Root Moss Highlight */}
          <path
            d="M 830,680 C 890,730 1010,770 1130,810 C 1240,840 1350,870 1460,895"
            stroke="url(#mossHighlight)"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />

          {/* Center Twisted Aerial Lianas & Hanging Vines */}
          <path
            d="M 660,390 Q 640,510 650,650 Q 660,770 670,900"
            stroke="#0A2218"
            strokeWidth="14"
            fill="none"
          />
          <path
            d="M 750,400 Q 770,530 755,670 Q 740,790 730,900"
            stroke="#081E15"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M 580,310 Q 560,450 570,590 Q 580,710 540,840"
            stroke="#071911"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M 840,320 Q 860,460 850,600 Q 840,720 890,850"
            stroke="#071911"
            strokeWidth="8"
            fill="none"
          />
        </g>

        {/* Bioluminescent Pink Orchids Clustered on Roots and Vines */}
        <g filter="url(#forestGlow)">
          {/* Cluster 1: Near left root base */}
          <circle cx="340" cy="780" r="4.5" fill="#EC4899" opacity="0.9" />
          <circle cx="355" cy="775" r="3" fill="#F472B6" opacity="0.95" />
          <circle cx="330" cy="790" r="3.5" fill="#EC4899" opacity="0.85" />
          <circle cx="348" cy="784" r="1.5" fill="#FFF" opacity="0.9" />

          {/* Cluster 2: Hanging vine left */}
          <circle cx="568" cy="520" r="4" fill="#EC4899" opacity="0.85" />
          <circle cx="572" cy="535" r="3" fill="#F472B6" opacity="0.8" />
          <circle cx="562" cy="505" r="2.5" fill="#EC4899" opacity="0.75" />

          {/* Cluster 3: Near right root base */}
          <circle cx="1060" cy="790" r="4" fill="#EC4899" opacity="0.9" />
          <circle cx="1075" cy="782" r="3" fill="#F472B6" opacity="0.85" />
          <circle cx="1045" cy="800" r="3.5" fill="#EC4899" opacity="0.75" />

          {/* Cluster 4: High canopy branch */}
          <circle cx="480" cy="270" r="3" fill="#EC4899" opacity="0.8" />
          <circle cx="940" cy="300" r="3.5" fill="#EC4899" opacity="0.8" />
          <circle cx="952" cy="292" r="2" fill="#F472B6" opacity="0.9" />
        </g>
      </svg>

      {/* 4. Ground Fog & Mist Layers drifting slowly */}
      <div 
        className="absolute bottom-0 left-[-20%] w-[140%] h-[320px] opacity-40 blur-[45px] pointer-events-none animate-fog-slow"
        style={{
          background: 'linear-gradient(to top, rgba(6, 29, 22, 0.95) 0%, rgba(20, 53, 43, 0.5) 45%, transparent 100%)',
        }}
      />
      <div 
        className="absolute bottom-[-40px] right-[-20%] w-[140%] h-[260px] opacity-35 blur-[35px] pointer-events-none animate-fog-reverse"
        style={{
          background: 'linear-gradient(to top, rgba(3, 14, 11, 0.9) 0%, rgba(14, 38, 29, 0.4) 50%, transparent 100%)',
        }}
      />

      {/* 5. Phosphor Green CRT Base Glow (representing the television nestled in roots) */}
      {showCRTAnchor && (
        <div 
          className="absolute bottom-12 right-16 md:right-32 w-80 h-64 rounded-full opacity-35 blur-[70px] pointer-events-none animate-phosphor-flicker"
          style={{
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.5) 0%, rgba(6, 29, 22, 0.2) 50%, transparent 80%)',
          }}
        />
      )}

      {/* 6. Canvas for drifting bioluminescent spores & fireflies */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 7. Subtle Vignette Border */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(1, 4, 3, 0.92), inset 0 0 40px rgba(0, 0, 0, 0.98)',
        }}
      />
    </div>
  );
};
