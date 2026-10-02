// Ses: flüte benzeyen basit bir sentezleyici ve mikrofondan perde (pitch) algılama.
import { freqOf, noteFromMidi } from './data/notes.js';

let ctx = null;

export function audioContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

let noiseBuffer = null;
function breathNoise(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  return src;
}

/**
 * Bir notayı flüt benzeri bir tınıyla çalar.
 * @returns {{stop: () => void, done: Promise<void>}}
 */
export function playNote(noteId, seconds = 1, { volume = 0.25, when = 0 } = {}) {
  const ac = audioContext();
  const freq = freqOf(noteId);
  const t0 = ac.currentTime + 0.02 + when;
  const t1 = t0 + seconds;

  const out = ac.createGain();
  out.gain.setValueAtTime(0, t0);
  out.gain.linearRampToValueAtTime(volume, t0 + 0.06);
  out.gain.setTargetAtTime(volume * 0.85, t0 + 0.06, 0.2);
  out.gain.setValueAtTime(volume * 0.85, Math.max(t0 + 0.07, t1 - 0.08));
  out.gain.linearRampToValueAtTime(0, t1);
  out.connect(ac.destination);

  // Hafif gecikmeli vibrato
  const vib = ac.createOscillator();
  const vibGain = ac.createGain();
  vib.frequency.value = 5;
  vibGain.gain.setValueAtTime(0, t0);
  vibGain.gain.linearRampToValueAtTime(freq * 0.004, t0 + Math.min(0.6, seconds * 0.6));
  vib.connect(vibGain);

  const partials = [
    [1, 1],
    [2, 0.18],
    [3, 0.06],
  ];
  const oscs = partials.map(([mult, amp]) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq * mult;
    vibGain.connect(o.frequency);
    const g = ac.createGain();
    g.gain.value = amp;
    o.connect(g).connect(out);
    return o;
  });

  // Nefes sesi
  const noise = breathNoise(ac);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq * 2;
  bp.Q.value = 1.2;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.09, t0);
  ng.gain.exponentialRampToValueAtTime(0.025, t0 + 0.25);
  noise.connect(bp).connect(ng).connect(out);

  const sources = [...oscs, vib, noise];
  sources.forEach((s) => s.start(t0));
  sources.forEach((s) => s.stop(t1 + 0.05));

  let resolve;
  const done = new Promise((r) => (resolve = r));
  oscs[0].onended = () => resolve();
  return {
    done,
    stop() {
      const now = ac.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.05);
      sources.forEach((s) => {
        try {
          s.stop(now + 0.06);
        } catch {
          /* zaten durmuş */
        }
      });
    },
  };
}

/** Kısa bir başarı melodisi. */
export function playChime() {
  ['G5', 'B5', 'D6'].forEach((n, i) => playNote(n, 0.18, { volume: 0.12, when: i * 0.09 }));
}

/** Bir ezgiyi sırayla çalar; notes: [{note, beats}] */
export function playMelody(notes, { bpm = 100, onNote } = {}) {
  const beat = 60 / bpm;
  let cancelled = false;
  let current = null;
  const run = (async () => {
    for (let i = 0; i < notes.length; i++) {
      if (cancelled) return;
      const { note, beats = 1 } = notes[i];
      onNote?.(i);
      current = playNote(note, beats * beat * 0.92);
      await sleep(beats * beat * 1000);
    }
  })();
  return {
    done: run,
    stop() {
      cancelled = true;
      current?.stop();
    },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Perde algılama

/**
 * Otokorelasyon ile temel frekans tahmini. Sessizlikte veya belirsiz sinyalde -1 döner.
 */
export function detectPitch(buf, sampleRate) {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.01) return { freq: -1, rms };

  // Kenarlardaki sessiz kısımları kırp
  let r1 = 0;
  let r2 = n - 1;
  const thres = 0.2;
  for (let i = 0; i < n / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < n / 2; i++) if (Math.abs(buf[n - i]) < thres) { r2 = n - i; break; }
  const b = buf.subarray(r1, r2);
  const size = b.length;

  const minLag = Math.floor(sampleRate / 2400); // flütün üst sınırının biraz üstü
  const maxLag = Math.min(size - 1, Math.floor(sampleRate / 220));
  const c = new Float32Array(maxLag + 1);
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) sum += b[i] * b[i + lag];
    c[lag] = sum;
  }

  // İlk düşüşü geç, ardından en yüksek tepeyi bul
  let d = 0;
  while (d < maxLag && c[d] > c[d + 1]) d++;
  let best = -1;
  let bestVal = -Infinity;
  for (let lag = Math.max(d, minLag); lag <= maxLag; lag++) {
    if (c[lag] > bestVal) {
      bestVal = c[lag];
      best = lag;
    }
  }
  if (best <= 0 || bestVal / c[0] < 0.5) return { freq: -1, rms };

  // Oktav hatalarını azalt: yarı periyotta da güçlü bir tepe varsa onu tercih et
  const half = Math.round(best / 2);
  if (half >= minLag && c[half] > 0.9 * bestVal) best = half;

  // Parabolik ara değerleme
  const x1 = c[best - 1] ?? c[best];
  const x2 = c[best];
  const x3 = c[best + 1] ?? c[best];
  const a = (x1 + x3 - 2 * x2) / 2;
  const bb = (x3 - x1) / 2;
  const shift = a ? -bb / (2 * a) : 0;
  return { freq: sampleRate / (best + shift), rms };
}

export function freqToNote(freq) {
  const midiFloat = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(midiFloat);
  return { midi, note: noteFromMidi(midi), cents: Math.round((midiFloat - midi) * 100) };
}

/**
 * Mikrofonu dinler ve her karede algılanan notayı bildirir.
 * onFrame({note, midi, cents, freq, rms}) — ses yoksa note null olur.
 */
export class PitchListener {
  constructor(onFrame) {
    this.onFrame = onFrame;
    this.running = false;
  }

  async start() {
    if (this.running) return;
    const ac = audioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    this.source = ac.createMediaStreamSource(this.stream);
    this.analyser = ac.createAnalyser();
    this.analyser.fftSize = 2048;
    this.source.connect(this.analyser);
    this.buf = new Float32Array(this.analyser.fftSize);
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      this.analyser.getFloatTimeDomainData(this.buf);
      const { freq, rms } = detectPitch(this.buf, ac.sampleRate);
      if (freq > 0) this.onFrame({ ...freqToNote(freq), freq, rms });
      else this.onFrame({ note: null, rms });
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
  }
}

/**
 * Hedef notanın belirli bir süre boyunca tutulmasını bekleyen yardımcı.
 * Bir nota eşleştikten sonra, o nota bırakılana (ses kesilene, azalana ya da
 * başka bir notaya geçilene) kadar gelen kareler yok sayılır. Böylece uzatılan
 * nota sonraki hedef için hata sayılmaz ve tekrarlanan notalar (Sol Sol Sol)
 * her seferinde yeniden çalınmak zorunda kalır.
 */
export class NoteMatcher {
  constructor({ holdMs = 300, onProgress, onMatch, onWrong } = {}) {
    Object.assign(this, { holdMs, onProgress, onMatch, onWrong });
    this.target = null;
    this.since = 0;
    this.wrongSince = 0;
    this.lastWrong = null;
    this.reported = false;
    this.release = null;
  }

  setTarget(midi) {
    this.target = midi;
    this.since = 0;
    this.wrongSince = 0;
  }

  feed(frame, now = performance.now()) {
    if (this.release) {
      const { midi, rms } = this.release;
      if (frame.note && frame.midi === midi && frame.rms > rms * 0.5) return;
      this.release = null;
    }
    if (this.target == null) return;
    if (frame.note && frame.midi === this.target) {
      this.lastWrong = null;
      if (!this.since) this.since = now;
      const p = Math.min(1, (now - this.since) / this.holdMs);
      this.onProgress?.(p, frame);
      if (p >= 1) {
        const t = this.target;
        this.target = null;
        this.release = { midi: t, rms: frame.rms };
        this.onMatch?.(t, frame);
      }
      return;
    }
    this.since = 0;
    this.onProgress?.(0, frame);
    if (frame.note) {
      if (this.lastWrong !== frame.midi) {
        this.wrongSince = now;
        this.lastWrong = frame.midi;
        this.reported = false;
      } else if (!this.reported && now - this.wrongSince > 600) {
        this.reported = true; // aynı hatayı tekrar tekrar bildirme
        this.onWrong?.(frame);
      }
    } else {
      this.lastWrong = null;
    }
  }
}
