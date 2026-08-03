// Autor: Antônio Costa Leite
// Sintetizador e Mixer de Áudio Web Audio API (O Santuário)

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    
    // Nós de ganho para o mixer de canais
    this.masterGain = null;
    this.rainGain = null;
    this.whiteNoiseGain = null;
    this.pianoGain = null;

    // Nós de fonte de áudio
    this.rainNode = null;
    this.whiteNoiseNode = null;
    
    // Estado de reprodução
    this.pianoInterval = null;
    this.activeOscillators = [];
    this.isPianoPlaying = false;
    
    // Níveis de volume padrão
    this.levels = {
      master: 0.8,
      rain: 0.3,
      whiteNoise: 0.1,
      piano: 0.4
    };

    // Escalas de acorde gerativas
    this.scales = [
      // Faixa 1: Tons Quentes de Pôr do Sol
      [
        [174.61, 261.63, 329.63, 392.00], // F3, C4, E4, G4 (Fmaj7)
        [261.63, 329.63, 392.00, 493.88], // C4, E4, G4, B4 (Cmaj7)
        [196.00, 246.94, 293.66, 392.00]  // G3, B3, D4, G4 (G)
      ],
      // Faixa 2: Tons Noturnos Zen
      [
        [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4 (Am7)
        [146.83, 220.00, 261.63, 349.23], // D3, A3, C4, F4 (Dm7)
        [164.81, 246.94, 293.66, 392.00]  // E3, B3, D4, G4 (Em7)
      ]
    ];
    this.currentTrackIndex = 0;
  }

  // Inicializa o contexto de áudio
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Configura o nó Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.levels.master, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Configura os canais individuais
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.levels.rain, this.ctx.currentTime);
    this.rainGain.connect(this.masterGain);

    this.whiteNoiseGain = this.ctx.createGain();
    this.whiteNoiseGain.gain.setValueAtTime(this.levels.whiteNoise, this.ctx.currentTime);
    this.whiteNoiseGain.connect(this.masterGain);

    this.pianoGain = this.ctx.createGain();
    this.pianoGain.gain.setValueAtTime(this.levels.piano, this.ctx.currentTime);
    this.pianoGain.connect(this.masterGain);
  }

  setVolume(channel, value) {
    this.init();
    const vol = Math.max(0, Math.min(1, parseFloat(value)));
    this.levels[channel] = vol;

    if (this.ctx) {
      if (channel === 'master' && this.masterGain) {
        this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      } else if (channel === 'rain' && this.rainGain) {
        this.rainGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      } else if (channel === 'whiteNoise' && this.whiteNoiseGain) {
        this.whiteNoiseGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      } else if (channel === 'piano' && this.pianoGain) {
        this.pianoGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      }
    }
  }

  // Gerador de Som de Chuva (Ruído Browniano com Filtro Passa-Baixa)
  startRain() {
    this.init();
    if (this.rainNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    source.connect(filter);
    filter.connect(this.rainGain);
    source.start(0);

    this.rainNode = source;
  }

  stopRain() {
    if (this.rainNode) {
      try {
        this.rainNode.stop();
        this.rainNode.disconnect();
      } catch (e) {}
      this.rainNode = null;
    }
  }

  // Gerador de Ruído Branco
  startWhiteNoise() {
    this.init();
    if (this.whiteNoiseNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.4;

    source.connect(filter);
    filter.connect(this.whiteNoiseGain);
    source.start(0);

    this.whiteNoiseNode = source;
  }

  stopWhiteNoise() {
    if (this.whiteNoiseNode) {
      try {
        this.whiteNoiseNode.stop();
        this.whiteNoiseNode.disconnect();
      } catch (e) {}
      this.whiteNoiseNode = null;
    }
  }

  // Tocador de Acordes Gerativos de Piano
  playPianoNote(frequency, delay = 0, duration = 6) {
    if (!this.ctx || !this.pianoGain) return;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + delay);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime + delay);

    const localGain = this.ctx.createGain();
    localGain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    
    const attack = 1.5;
    localGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + delay + attack);
    localGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

    osc.connect(filter);
    filter.connect(localGain);
    localGain.connect(this.pianoGain);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
    
    this.activeOscillators.push(osc);
    setTimeout(() => {
      this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
    }, (delay + duration + 1) * 1000);
  }

  playChord(chordNotes) {
    chordNotes.forEach((freq, idx) => {
      const arpeggio = idx * 0.3;
      this.playPianoNote(freq, arpeggio, 7);
    });
  }

  startPiano() {
    this.init();
    if (this.isPianoPlaying) return;
    this.isPianoPlaying = true;

    const chords = this.scales[this.currentTrackIndex];
    let index = 0;

    const trigger = () => {
      if (!this.isPianoPlaying) return;
      this.playChord(chords[index]);
      index = (index + 1) % chords.length;
    };

    trigger();
    this.pianoInterval = setInterval(trigger, 8000);
  }

  stopPiano() {
    this.isPianoPlaying = false;
    if (this.pianoInterval) {
      clearInterval(this.pianoInterval);
      this.pianoInterval = null;
    }
  }

  changeTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.scales.length;
    if (this.isPianoPlaying) {
      this.stopPiano();
      this.startPiano();
    }
  }

  // Sinal Sonoro Zen
  playChime() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const freqs = [523.25, 783.99, 1046.50];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + (idx * 0.1));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime + (idx * 0.1));
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05 + (idx * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + (idx * 0.1));
      osc.stop(this.ctx.currentTime + 3.5);
    });
  }

  // Alerta Sonoro do Temporizador
  playAlarmSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.18));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime + (idx * 0.18));
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + (idx * 0.18) + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (idx * 0.18) + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + (idx * 0.18));
      osc.stop(this.ctx.currentTime + (idx * 0.18) + 0.9);
    });
  }

  // Ativa ambiente sonoro completo
  startAmbientMix() {
    this.startRain();
    this.startWhiteNoise();
    this.startPiano();
  }

  stopAll() {
    this.stopRain();
    this.stopWhiteNoise();
    this.stopPiano();
  }
}

export const audioSynth = new AudioSynthEngine();
