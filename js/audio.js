/**
 * Horizontes Cívicos - Sintetizador de Áudio Procedural (Web Audio API)
 * Gera efeitos sonoros estilo retro arcade / 16-bit inteiramente em código,
 * sem carregar nenhum arquivo de áudio externo.
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('horizontes_civicos_audio_mute') === 'true'
      : false;
  }

  // Inicializa o AudioContext após o primeiro gesto do usuário (requisito dos navegadores)
  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Alterna o estado do som (mudo / ativado)
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('horizontes_civicos_audio_mute', String(this.isMuted));
    }
    if (!this.isMuted) {
      this.play('click');
    }
    return this.isMuted;
  }

  // Toca um efeito sonoro procedural
  play(soundType) {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (soundType) {
        case 'click':
          // Bipe rápido de interface (onda triangular curta)
          this.playTone(880, 'triangle', now, 0.04, 0.12, 1200);
          break;

        case 'advance':
          // Som harmônico de avanço de tempo (dois tons ascendentes)
          this.playTone(523.25, 'sine', now, 0.08, 0.15); // C5
          this.playTone(659.25, 'sine', now + 0.05, 0.12, 0.15); // E5
          break;

        case 'advanceYear':
          // Arpejo futurista rápido de passagem de ano
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            this.playTone(freq, 'triangle', now + i * 0.06, 0.15, 0.15);
          });
          break;

        case 'alert':
          // Alerta sonoro de crise ou tensão (acorde menor descendente staccato)
          this.playTone(440, 'sawtooth', now, 0.1, 0.2, 350);
          this.playTone(370, 'sawtooth', now + 0.08, 0.15, 0.2, 280);
          break;

        case 'coins':
          // Efeito de moedas / saldo (dois tons rápidos e brilhantes em onda quadrada suave)
          this.playTone(987.77, 'square', now, 0.06, 0.1, 1318.51);
          this.playTone(1318.51, 'square', now + 0.05, 0.15, 0.12);
          break;

        case 'migrate':
          // Som de teletransporte / viagem (glissando ascendente suave)
          this.playTone(330, 'sine', now, 0.25, 0.2, 880);
          break;

        case 'annual':
          // Fanfarra triunfante de fim de ano
          [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
            this.playTone(freq, 'triangle', now + i * 0.08, 0.2, 0.18);
          });
          break;

        case 'radar':
          // Pulso de sonar no mapa de cidades
          this.playTone(1200, 'sine', now, 0.12, 0.15, 400);
          break;

        case 'error':
          // Som de erro / fundos insuficientes
          this.playTone(220, 'sawtooth', now, 0.12, 0.2, 160);
          break;
      }
    } catch (e) {
      // Falhas de áudio não devem interromper o jogo
      console.warn('Efeito de áudio suprimido:', e);
    }
  }

  // Sintetizador genérico de tom com envelope ADSR simplificado e rampa de frequência
  playTone(startFreq, waveType, startTime, duration, maxVolume = 0.15, endFreq = null) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(startFreq, startTime);

    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 20), startTime + duration);
    }

    // Envelope de volume (Fade in rápido, Fade out suave)
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(maxVolume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const sfx = new SoundSynthesizer();
