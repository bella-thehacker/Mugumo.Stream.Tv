import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { CRTTelevision } from '../components/CRTTelevision';
import { FILMS } from '../data/films';
import { ArrowLeft, Radio } from 'lucide-react';
import { soundscape } from '../services/soundscape';

export const Cinema: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentFilmIndex = FILMS.findIndex(f => f.id === id);
  const film = currentFilmIndex >= 0 ? FILMS[currentFilmIndex] : FILMS[0];

  useEffect(() => {
    // When cinema opens, play subtle static burst and log
    soundscape.playStaticBurst(200);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [film.id]);

  const handleNextFilm = () => {
    const nextIndex = (currentFilmIndex + 1) % FILMS.length;
    soundscape.playTuningClick();
    navigate(`/cinema/${FILMS[nextIndex].id}`);
  };

  const handlePrevFilm = () => {
    const prevIndex = (currentFilmIndex - 1 + FILMS.length) % FILMS.length;
    soundscape.playTuningClick();
    navigate(`/cinema/${FILMS[prevIndex].id}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col overflow-x-hidden">
      {/* 1. Deep Cinema Forest Canvas with dimmer lighting for viewing */}
      <ForestEnvironment intensity="cinema" showCRTAnchor={false} />

      {/* 2. Cinema Theatre Environment */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        
        {/* Navigation Breadcrumb / Station Frequency Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60 border-b border-[#14352B]/40 pb-3">
          <button
            onClick={() => navigate('/grove')}
            className="flex items-center gap-1.5 hover:text-[#A7F3D0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO THE GROVE</span>
          </button>

          <div className="flex items-center gap-2 text-[#A7F3D0]">
            <Radio className="w-3.5 h-3.5 text-[#EC4899] animate-pulse" />
            <span className="font-bold">TRANSMISSION FREQ: {film.signalFrequency}</span>
            <span className="text-[#D8C9A5]/40">· NODE 001</span>
          </div>
        </div>

        {/* The Wooden CRT Television Console */}
        <CRTTelevision
          film={film}
          onNextFilm={handleNextFilm}
          onPrevFilm={handlePrevFilm}
        />
      </main>
    </div>
  );
};
