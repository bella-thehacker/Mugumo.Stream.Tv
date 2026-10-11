/**
 * Web Audio API procedural soundscape for MŨGUMO.STREAM.TV
 * Generates:
 * - Gentle canopy wind & forest night rustle (filtered noise)
 * - Distant nocturnal cicadas / night crickets (frequency-modulated gentle chirps)
 * - CRT television analog flyback hum & mild thermal static
 * - Channel tuning clicks & static bursts
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private cricketGain: GainNode | null = null;
  private crtGain: GainNode | null = null;

  private windSource: AudioBufferSourceNode | null = null;
  private cricketInterval: number | null = null;
  private crtOsc: OscillatorNode | null = null;
  private crtNoiseSource: AudioBufferSourceNode | null = null;

  public ambientVolume: number = 0.5;
  public crtHumVolume: number = 0.3;

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Wind Gain
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.ambientVolume * 0.4, this.ctx.currentTime);
    this.windGain.connect(this.masterGain);

    // Cricket Gain
    this.cricketGain = this.ctx.createGain();
    this.cricketGain.gain.setValueAtTime(this.ambientVolume * 0.15, this.ctx.currentTime);
    this.cricketGain.connect(this.masterGain);

    // CRT Gain
    this.crtGain = this.ctx.createGain();
    this.crtGain.gain.setValueAtTime(this.crtHumVolume * 0.2, this.ctx.currentTime);
    this.crtGain.connect(this.masterGain);

    this.startCanopyWind();
    this.startCrickets();
    this.startCrtHum();
  }

  private createNoiseBuffer(durationSeconds = 5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink/Brownian filter
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    return buffer;
  }

  private startCanopyWind() {
    if (!this.ctx || !this.windGain) return;
    const buffer = this.createNoiseBuffer(6);
    if (!buffer) return;

    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = buffer;
    this.windSource.loop = true;

    // Filter to simulate low wind blowing through a massive tree canopy
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Subtle LFO for wind gust swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12 second swell
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.windSource.connect(filter);
    filter.connect(this.windGain);
    this.windSource.start();
  }

  private startCrickets() {
    if (!this.ctx || !this.cricketGain) return;
    const chirp = () => {
      if (!this.ctx || this.isMuted || !this.cricketGain) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        // Forest crickets around 4.5kHz
        osc.frequency.setValueAtTime(4500 + (Math.random() * 400 - 200), now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.cricketGain);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch {
        // Safe catch
      }
    };

    // Staggered intervals
    this.cricketInterval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        chirp();
        setTimeout(chirp, 80);
        if (Math.random() > 0.6) setTimeout(chirp, 160);
      }
    }, 2800);
  }

  private startCrtHum() {
    if (!this.ctx || !this.crtGain) return;
    try {
      // 60Hz mains transformer hum with warm harmonics
      this.crtOsc = this.ctx.createOscillator();
      this.crtOsc.type = 'triangle';
      this.crtOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.crtOsc.connect(filter);
      filter.connect(humGain);
      humGain.connect(this.crtGain);
      this.crtOsc.start();

      // Soft thermal static
      const staticBuffer = this.createNoiseBuffer(4);
      if (staticBuffer) {
        this.crtNoiseSource = this.ctx.createBufferSource();
        this.crtNoiseSource.buffer = staticBuffer;
        this.crtNoiseSource.loop = true;

        const staticFilter = this.ctx.createBiquadFilter();
        staticFilter.type = 'bandpass';
        staticFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        staticFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        const staticGain = this.ctx.createGain();
        staticGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

        this.crtNoiseSource.connect(staticFilter);
        staticFilter.connect(staticGain);
        staticGain.connect(this.crtGain);
        this.crtNoiseSource.start();
      }
    } catch {
      // Audio fallback
    }
  }

  public enableAudio(): boolean {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isEnabled = true;
    this.isMuted = false;
    this.applyVolume();
    return true;
  }

  public toggleMute(): boolean {
    if (!this.isEnabled) {
      return this.enableAudio();
    }
    this.isMuted = !this.isMuted;
    this.applyVolume();
    return !this.isMuted;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.windGain && this.cricketGain) {
      const now = this.ctx.currentTime;
      this.windGain.gain.setTargetAtTime(this.ambientVolume * 0.4, now, 0.1);
      this.cricketGain.gain.setTargetAtTime(this.ambientVolume * 0.15, now, 0.1);
    }
  }

  public setCrtHumVolume(vol: number) {
    this.crtHumVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.crtGain) {
      const now = this.ctx.currentTime;
      this.crtGain.gain.setTargetAtTime(this.crtHumVolume * 0.2, now, 0.1);
    }
  }

  private applyVolume() {
    if (!this.ctx || !this.masterGain) return;
    const target = this.isMuted ? 0 : 1;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.15);
  }

  public playTuningClick() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Mechanical switch click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Safe catch
    }
  }

  public playStaticBurst(durationMs = 280) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const buffer = this.createNoiseBuffer(1);
      if (!buffer) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(now);
      source.stop(now + (durationMs / 1000));
    } catch {
      // Safe catch
    }
  }

  public getAudioStatus() {
    return {
      isEnabled: this.isEnabled,
      isMuted: this.isMuted,
      ambientVolume: this.ambientVolume,
      crtHumVolume: this.crtHumVolume
    };
  }
}

export const soundscape = new SoundscapeEngine();
