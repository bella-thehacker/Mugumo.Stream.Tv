import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';
import { soundscape } from '../services/soundscape';

interface RitualIntroProps {
  onComplete: () => void;
}

export const RitualIntro: React.FC<RitualIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Stage timings:
    // Stage 1 (Roots): 0ms -> 1800ms
    // Stage 2 (Stem): 1800ms -> 3400ms
    // Stage 3 (Awakening): 3400ms -> 5000ms
    // Stage 4 (Signal): 5000ms -> 6600ms
    // Stage 5 (Title): 6600ms -> 8200ms
    // Stage 6 (Complete): 8200ms
    const t1 = setTimeout(() => setStage(2), 1800);
    const t2 = setTimeout(() => setStage(3), 3400);
    const t3 = setTimeout(() => {
      setStage(4);
      soundscape.playStaticBurst(200);
    }, 5000);
    const t4 = setTimeout(() => setStage(5), 6500);
    const t5 = setTimeout(() => {
      onComplete();
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const handleToggleSound = () => {
    const active = soundscape.toggleMute();
    setSoundEnabled(active);
  };

  const handleSkip = () => {
    soundscape.playTuningClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020705] flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      {/* Background Layers that evolve per stage */}
      
      {/* Fog mist */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          stage >= 2 ? 'opacity-35' : 'opacity-10'
        } bg-gradient-to-t from-[#061D16]/90 via-[#030E0B]/50 to-transparent pointer-events-none`} 
      />

      {/* Stage Visuals Graphic */}
      <div className="relative w-full max-w-4xl h-[480px] flex items-center justify-center">
        {/* Stage 1 & 2: Emergence of Roots and Stem */}
        <svg 
          className="w-full h-full object-contain filter drop-shadow-2xl"
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="ritualMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#020806" stopOpacity="0" />
            </radialGradient>
            <filter id="glowPink" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing Mist Center */}
          <circle 
            cx="400" 
            cy="360" 
            r="280" 
            fill="url(#ritualMist)" 
            className={`transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-20'}`}
          />

          {/* Colossal Tree Trunk and Buttress Roots */}
          <g className={`transition-all duration-1000 ease-out ${
            stage === 1 ? 'opacity-40 translate-y-12 scale-95' :
            stage === 2 ? 'opacity-80 translate-y-6 scale-98' :
            'opacity-100 translate-y-0 scale-100'
          }`}>
            {/* Trunk */}
            <path
              d="M 360,180 C 375,250 365,340 330,440 C 310,490 260,540 180,590 L 620,590 C 550,540 500,490 480,440 C 450,340 435,250 450,180 Z"
              fill="#061E16"
            />
            {/* Left Primary Buttress Root */}
            <path
              d="M 330,440 C 270,480 180,510 60,550 L 60,590 L 260,590 C 320,530 330,470 330,440 Z"
              fill="#092B20"
            />
            {/* Right Primary Buttress Root */}
            <path
              d="M 480,440 C 540,480 630,510 740,550 L 740,590 L 540,590 C 480,530 470,470 480,440 Z"
              fill="#092B20"
            />
            {/* Fine Creeping Root Tendrils */}
            <path
              d="M 230,520 Q 140,550 40,580"
              stroke="#133E30"
              strokeWidth="4"
              fill="none"
              strokeDasharray="400"
              strokeDashoffset={stage >= 1 ? '0' : '400'}
              className="transition-all duration-1000"
            />
            <path
              d="M 570,520 Q 660,550 760,580"
              stroke="#133E30"
              strokeWidth="4"
              fill="none"
              strokeDasharray="400"
              strokeDashoffset={stage >= 1 ? '0' : '400'}
              className="transition-all duration-1000"
            />
          </g>

          {/* Stage 3: Canopy Awakening Branches */}
          {stage >= 3 && (
            <g className="transition-opacity duration-1000 opacity-90">
              <path
                d="M 360,200 C 280,140 180,100 40,70 L 40,30 L 760,30 L 760,70 C 620,100 520,140 450,200 Z"
                fill="#03100B"
              />
              {/* Lianas */}
              <path d="M 380,210 Q 370,320 375,450" stroke="#0C3426" strokeWidth="5" fill="none" />
              <path d="M 430,220 Q 440,330 435,460" stroke="#0B3023" strokeWidth="4" fill="none" />
            </g>
          )}

          {/* Stage 3+: Bioluminescent Pink Flowers blooming on roots */}
          {stage >= 3 && (
            <g filter="url(#glowPink)" className="transition-all duration-700">
              <circle cx="210" cy="515" r="4.5" fill="#EC4899" className="animate-bio-pulse" />
              <circle cx="225" cy="508" r="3" fill="#F472B6" />
              <circle cx="195" cy="528" r="3" fill="#EC4899" />
              <circle cx="585" cy="518" r="4" fill="#EC4899" className="animate-bio-pulse" />
              <circle cx="602" cy="510" r="3" fill="#F472B6" />
              <circle cx="410" cy="280" r="3.5" fill="#EC4899" />
            </g>
          )}

          {/* Stage 4+: The Abandoned 1980s CRT TV glowing in the roots */}
          {stage >= 4 && (
            <g className="transition-all duration-700">
              {/* TV Cabinet */}
              <rect x="490" y="420" width="130" height="100" rx="6" fill="#3D261A" stroke="#1D120B" strokeWidth="3" />
              {/* CRT Glass Bezel */}
              <rect x="502" y="430" width="86" height="66" rx="10" fill="#061A13" stroke="#0B2B20" strokeWidth="2" />
              {/* CRT Glowing Screen */}
              <rect 
                x="505" 
                y="433" 
                width="80" 
                height="60" 
                rx="8" 
                fill="#A7F3D0" 
                fillOpacity="0.85" 
                className="animate-phosphor-flicker"
              />
              {/* Scanlines inside screen */}
              <line x1="505" y1="450" x2="585" y2="450" stroke="#061E16" strokeWidth="1" opacity="0.6" />
              <line x1="505" y1="465" x2="585" y2="465" stroke="#061E16" strokeWidth="1" opacity="0.6" />
              {/* Rotary Knobs & LED */}
              <circle cx="604" cy="442" r="5" fill="#1C100B" stroke="#634532" strokeWidth="1" />
              <circle cx="604" cy="460" r="5" fill="#1C100B" stroke="#634532" strokeWidth="1" />
              <circle cx="604" cy="482" r="2.5" fill="#F59E0B" /> {/* Amber Pilot LED */}
              {/* Creeping Vine over Cabinet */}
              <path d="M 480,480 Q 510,430 530,420" stroke="#164332" strokeWidth="3" fill="none" />
            </g>
          )}
        </svg>
      </div>

      {/* Stage Indicators (Subtle ritual status) */}
      <div className="flex items-center gap-6 text-xs text-[#A7F3D0]/60 font-mono tracking-widest mt-2 uppercase">
        <span className={stage === 1 ? 'text-[#EC4899] font-bold' : ''}>1. Roots</span>
        <span>·</span>
        <span className={stage === 2 ? 'text-[#EC4899] font-bold' : ''}>2. Stem</span>
        <span>·</span>
        <span className={stage === 3 ? 'text-[#EC4899] font-bold' : ''}>3. Awakening</span>
        <span>·</span>
        <span className={stage === 4 ? 'text-[#A7F3D0] font-bold' : ''}>4. The Signal</span>
      </div>

      {/* Stage 5: Title Reveal */}
      <div className={`mt-8 text-center transition-all duration-700 px-4 ${
        stage >= 5 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#061D16]/60 border border-[#A7F3D0]/20 rounded-full text-xs text-[#A7F3D0] font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
          <span>SANCTUARY NODE 001 // FREQ: 142.05 MHz</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-editorial font-light tracking-wide text-[#A7F3D0] crt-glow">
          MŨGUMO.STREAM.TV
        </h1>
        <p className="text-sm md:text-base font-editorial italic text-[#D8C9A5]/80 mt-2 max-w-md mx-auto">
          A little cinema at the edge of the world.
        </p>
      </div>

      {/* Bottom Controls: Sound & Skip */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex items-center justify-between text-xs text-[#D8C9A5]/70">
        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#061D16]/70 border border-[#14352B] hover:border-[#A7F3D0]/50 hover:text-[#A7F3D0] transition-colors"
          title="Toggle ambient forest soundscape"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-[#A7F3D0]" />
              <span className="font-mono">FOREST AUDIO: ACTIVE</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#D8C9A5]/50" />
              <span className="font-mono">FOREST AUDIO: MUTED</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#061D16]/70 border border-[#14352B] hover:border-[#EC4899]/50 hover:text-[#EC4899] transition-all font-mono group"
        >
          <span>ENTER CLEARING</span>
          <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
