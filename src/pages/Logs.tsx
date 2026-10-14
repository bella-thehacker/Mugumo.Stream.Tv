import React, { useState, useEffect, useRef } from 'react';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { SanctuaryStorage } from '../services/storage';
import { SystemLogEvent } from '../types';
import { Terminal, Shield, Sparkles, Send, RefreshCw, Cpu, Activity } from 'lucide-react';
import { soundscape } from '../services/soundscape';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLogEvent[]>(() => SanctuaryStorage.getLogs());
  const [commandInput, setCommandInput] = useState('');
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SYSTEM' | 'PLAYBACK' | 'VAULT' | 'SEARCH'>('ALL');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const filteredLogs = selectedFilter === 'ALL'
    ? logs
    : logs.filter(l => l.category === selectedFilter);

  const refreshLogs = () => {
    soundscape.playTuningClick();
    setLogs(SanctuaryStorage.getLogs());
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    soundscape.playStaticBurst(150);

    if (cmd === 'ctrl' || cmd === 'sza') {
      setEasterEggMessage('Ctrl: "Somewhere between normal and 20 Something, the forest held all our unfinished dreams." [SZA Transmission Frequency Locked]');
      SanctuaryStorage.addLog('ANOMALY', 'SYSTEM', 'Easter Egg Discovered: SZA Ctrl Frequency 104.7 MHz');
    } else if (cmd === 'root' || cmd === 'kikuyu' || cmd === 'tree') {
      setEasterEggMessage('Kikuyu Sacred Lore: "Mũtĩ ũmwe ndũhingaga thome" — One tree does not make a gateway; the forest breathes together as one.');
      SanctuaryStorage.addLog('ANOMALY', 'SYSTEM', 'Easter Egg Discovered: Kikuyu Canopy Proverb Awakened');
    } else if (cmd === 'clear') {
      setEasterEggMessage(null);
    } else if (cmd === 'help') {
      setEasterEggMessage('Available commands: ctrl, root, kikuyu, tree, clear, status, ping');
    } else if (cmd === 'status') {
      setEasterEggMessage('MUGUMO_OS Kernel 1.06: All roots connected. 15.734 kHz oscillator nominal. Weather: 14°C night mist.');
    } else if (cmd === 'ping') {
      setEasterEggMessage('PONG: 0.4ms to Mt. Kenya root server.');
    } else {
      setEasterEggMessage(`Command not recognized: "${cmd}". Type "help" for sanctuary commands.`);
    }

    setCommandInput('');
    setLogs(SanctuaryStorage.getLogs());
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col overflow-x-hidden font-mono">
      {/* 1. Forest Atmosphere */}
      <ForestEnvironment intensity="subtle" showCRTAnchor={false} />

      {/* 2. Terminal Diagnostics Console */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#14352B]/60 pb-5 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#A7F3D0]">
              <Cpu className="w-4 h-4 text-[#EC4899]" />
              <span>MUGUMO_OS v1.06 // HARDWARE DIAGNOSTICS & SYSTEM EVENT FEED</span>
            </div>
            <h1 className="mt-2 font-editorial text-3xl sm:text-4xl font-light text-[#A7F3D0] crt-glow">
              System Logs
            </h1>
            <p className="mt-1 font-editorial italic text-sm text-[#D8C9A5]/70">
              Low-level event telemetry and real application state preserved in the roots.
            </p>
          </div>

          <button
            onClick={refreshLogs}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#061D16] border border-[#14352B] text-xs text-[#A7F3D0] hover:border-[#A7F3D0] transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>POLL SYSTEM</span>
          </button>
        </div>

        {/* Telemetry Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-[#04110D]/90 border border-[#14352B]">
            <span className="text-[10px] text-[#D8C9A5]/50 block">CRT HORIZONTAL OSC</span>
            <span className="text-lg text-[#A7F3D0] crt-glow font-bold">15,734 Hz</span>
            <span className="text-[10px] text-[#A7F3D0]/70 block mt-1">Flyback Stable</span>
          </div>

          <div className="p-4 rounded-xl bg-[#04110D]/90 border border-[#14352B]">
            <span className="text-[10px] text-[#D8C9A5]/50 block">LOGGED EVENTS</span>
            <span className="text-lg text-[#EC4899] font-bold">{logs.length}</span>
            <span className="text-[10px] text-[#D8C9A5]/70 block mt-1">In Browser Storage</span>
          </div>

          <div className="p-4 rounded-xl bg-[#04110D]/90 border border-[#14352B]">
            <span className="text-[10px] text-[#D8C9A5]/50 block">AUDIO SUBSYSTEM</span>
            <span className="text-lg text-[#A7F3D0] font-bold">Web Audio API</span>
            <span className="text-[10px] text-[#A7F3D0]/70 block mt-1">Procedural Synth</span>
          </div>

          <div className="p-4 rounded-xl bg-[#04110D]/90 border border-[#14352B]">
            <span className="text-[10px] text-[#D8C9A5]/50 block">NODE STATUS</span>
            <span className="text-lg text-[#A7F3D0] crt-glow font-bold">ONLINE</span>
            <span className="text-[10px] text-[#EC4899] block mt-1">Canopy Connected</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#04110D] rounded-lg border border-[#14352B] w-fit text-xs text-left">
          {(['ALL', 'SYSTEM', 'PLAYBACK', 'VAULT', 'SEARCH'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundscape.playTuningClick();
                setSelectedFilter(cat);
              }}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedFilter === cat
                  ? 'bg-[#0E2F23] text-[#A7F3D0]'
                  : 'text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phosphor Terminal Monitor Frame */}
        <div className="rounded-xl bg-[#020705] border-2 border-[#14352B] p-5 sm:p-7 shadow-2xl relative overflow-hidden text-left">
          {/* Scanlines overlay on terminal */}
          <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-40" />

          {/* Terminal Output Area */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            <div className="text-xs text-[#A7F3D0]/50 pb-2 border-b border-[#14352B]/40">
              --- MUGUMO_OS REAL-TIME AUDIT LOG FEED ---
            </div>

            {filteredLogs.map((log) => (
              <div key={log.id} className="text-xs space-y-0.5 leading-relaxed">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#D8C9A5]/40 text-[11px] shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1 rounded text-[10px] shrink-0 ${
                    log.level === 'ANOMALY' ? 'bg-[#EC4899]/30 text-[#EC4899] font-bold' :
                    log.level === 'SIGNAL' ? 'bg-[#A7F3D0]/20 text-[#A7F3D0]' :
                    log.level === 'ARCHIVE' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                    'text-[#A7F3D0]/70'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-[#D8C9A5]/50 text-[10px] shrink-0">
                    &lt;{log.category}&gt;
                  </span>
                  <span className="text-[#D8C9A5] break-words">
                    {log.message}
                  </span>
                </div>
              </div>
            ))}

            {/* Easter Egg / System Response Message if active */}
            {easterEggMessage && (
              <div className="p-3.5 my-3 rounded bg-[#092B1D] border border-[#A7F3D0] text-xs text-[#A7F3D0] crt-glow space-y-1">
                <div className="flex items-center gap-1.5 text-[#EC4899]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold">SYSTEM RESPONSE / SECRET REVEALED:</span>
                </div>
                <p className="font-editorial text-sm italic">{easterEggMessage}</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Interactive Terminal Command Prompt */}
          <form onSubmit={handleCommandSubmit} className="mt-5 pt-4 border-t border-[#14352B]/60 flex items-center gap-2">
            <span className="text-xs text-[#A7F3D0] font-bold">&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Try secret commands: 'ctrl', 'root', 'kikuyu', 'status', 'help'..."
              className="flex-1 bg-transparent text-xs text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none crt-glow"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs text-[#A7F3D0] rounded transition-colors flex items-center gap-1.5"
            >
              <span>SEND</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Kikuyu Sacred Memory Note */}
        <div className="p-4 rounded-xl bg-[#04110D]/70 border border-[#14352B]/80 text-xs text-[#D8C9A5]/70 flex items-center justify-between">
          <span>THE FOREST REMEMBERS EVERY FREQUENCY PLAYED BESIDE THE ROOTS.</span>
          <span className="text-[#A7F3D0] crt-glow">MŨGUMO_SYS_V1.06</span>
        </div>
      </main>
    </div>
  );
};
