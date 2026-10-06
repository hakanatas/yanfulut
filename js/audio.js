// Ses: flüte benzeyen basit bir sentezleyici ve mikrofondan perde (pitch) algılama.
import { freqOf, noteFromMidi } from './data/notes.js';
import { instrument } from './instrument.js';

let ctx = null;

export function audioContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const audioRunning = () => ctx?.state === 'running';

/**
 * Safari ve iOS ses motorunu yalnızca bir dokunma/tıklama anında açar. Bu yüzden
 * her kullanıcı etkileşiminde, olayın içinde eşzamanlı olarak motoru açıp sessiz
 * bir örnek çalıyoruz. Böylece sonradan (ses dosyası indikten sonra) başlayan
 * Google seslendirmesi de duyulur.
 */
function unlockAudio() {
  const ac = audioContext();
  if (ac.state === 'running') return;
  const silent = ac.createBufferSource();
  silent.buffer = ac.createBuffer(1, 1, 22050);
  silent.connect(ac.destination);
  silent.start(0);
}

if (typeof window !== 'undefined') {
  for (const type of ['pointerdown', 'touchend', 'click', 'keydown']) {
    window.addEventListener(type, unlockAudio, { capture: true, passive: true });
  }
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

let timbre = 'flute';
/** Örnek notaların tınısı: 'flute' ya da 'violin' */
export function setTimbre(name) {
  timbre = name;
}

/**
 * Bir notayı etkin enstrümanın tınısıyla çalar.
 * @returns {{stop: () => void, done: Promise<void>}}
 */
export function playNote(noteId, seconds = 1, opts = {}) {
  return timbre === 'violin' ? playViolinNote(noteId, seconds, opts) : playFluteNote(noteId, seconds, opts);
}

/** Keman benzeri tını: yay sürtünmesi, gövde rezonansı ve gecikmeli vibrato */
function playViolinNote(noteId, seconds = 1, { volume = 0.22, when = 0 } = {}) {
  const ac = audioContext();
  const freq = freqOf(noteId);
  const t0 = ac.currentTime + 0.02 + when;
  const t1 = t0 + seconds;
  const endAppSound = beginAppSound((when + seconds) * 1000);

  const out = ac.createGain();
  out.gain.setValueAtTime(0, t0);
  out.gain.linearRampToValueAtTime(volume, t0 + 0.09);
  out.gain.setTargetAtTime(volume * 0.8, t0 + 0.09, 0.3);
  out.gain.setValueAtTime(volume * 0.8, Math.max(t0 + 0.1, t1 - 0.12));
  out.gain.linearRampToValueAtTime(0, t1);

  // Gövde: kemanın tahta kutusunun rezonansları
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 170;
  const body = [
    [280, 4, 1.4],
    [1100, 3, 1.2],
    [2800, 5, 1.5],
  ].map(([f, gain, q]) => {
    const b = ac.createBiquadFilter();
    b.type = 'peaking';
    b.frequency.value = f;
    b.gain.value = gain;
    b.Q.value = q;
    return b;
  });
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 5500;
  let node = hp;
  for (const b of body) {
    node.connect(b);
    node = b;
  }
  node.connect(lp).connect(out).connect(ac.destination);

  const vib = ac.createOscillator();
  const vibGain = ac.createGain();
  vib.frequency.value = 5.6;
  vibGain.gain.setValueAtTime(0, t0);
  vibGain.gain.setValueAtTime(0, t0 + Math.min(0.35, seconds * 0.4));
  vibGain.gain.linearRampToValueAtTime(freq * 0.006, t0 + Math.min(0.8, seconds * 0.7));
  vib.connect(vibGain);

  const oscs = [-4, 4].map((cents) => {
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    o.detune.value = cents;
    vibGain.connect(o.frequency);
    const g = ac.createGain();
    g.gain.value = 0.5;
    o.connect(g).connect(hp);
    return o;
  });

  // Yayın tele sürtünme sesi
  const noise = breathNoise(ac);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = Math.min(4000, freq * 3);
  bp.Q.value = 0.8;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.05, t0);
  ng.gain.exponentialRampToValueAtTime(0.012, t0 + 0.2);
  noise.connect(bp).connect(ng).connect(hp);

  const sources = [...oscs, vib, noise];
  sources.forEach((src) => src.start(t0));
  sources.forEach((src) => src.stop(t1 + 0.05));
  let resolve;
  const done = new Promise((r) => (resolve = r));
  oscs[0].onended = () => resolve();
  return {
    done,
    stop() {
      endAppSound();
      const now = ac.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.06);
      sources.forEach((src) => {
        try {
          src.stop(now + 0.07);
        } catch {
          /* zaten durmuş */
        }
      });
    },
  };
}

/** Flüt benzeri tını */
function playFluteNote(noteId, seconds = 1, { volume = 0.25, when = 0 } = {}) {
  const ac = audioContext();
  const freq = freqOf(noteId);
  const t0 = ac.currentTime + 0.02 + when;
  const endAppSound = beginAppSound((when + seconds) * 1000);
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
      endAppSound();
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

/** Metronom tıkı (vurgulu: ölçünün ilk vuruşu) */
export function playClick(accent = false) {
  const ac = audioContext();
  const t0 = ac.currentTime + 0.005;
  beginAppSound(40);
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.frequency.value = accent ? 1600 : 1100;
  g.gain.setValueAtTime(0.25, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + 0.06);
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

// Enstrümanın ses aralığı (perde algılamada aranan frekanslar). Flüt: Do4–Do7,
// keman: Sol3–Mi6. setPitchRange ile enstrüman seçilirken ayarlanır.
let pitchRange = { minFreq: 220, maxFreq: 2400 };
export function setPitchRange(minFreq, maxFreq) {
  pitchRange = { minFreq, maxFreq };
}

/**
 * Otokorelasyon ile temel frekans tahmini. Sessizlikte veya belirsiz sinyalde -1 döner.
 */
export function detectPitch(buf, sampleRate, { minFreq, maxFreq } = pitchRange) {
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

  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.min(size - 1, Math.floor(sampleRate / minFreq));
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
  return { midi, midiFloat, note: noteFromMidi(midi), cents: Math.round((midiFloat - midi) * 100) };
}

/**
 * Hedef notaya göre sapma (yarım ses cinsinden). octaveOk: farklı oktav da sayılır.
 * Örn. +0.4 → hedeften 40 sent tiz.
 */
export function offsetFromTarget(frame, target, { octaveOk = false } = {}) {
  let d = (frame.midiFloat ?? frame.midi) - target;
  if (octaveOk) d -= 12 * Math.round(d / 12);
  return d;
}

/**
 * Bu kare hedef nota sayılır mı? Yeni başlayanlar sık sık 30–60 sent tiz ya da pes
 * çalar (ayrıca flütler çoğu zaman La=442–443'e akortludur). Notayı en yakın yarım
 * sese yuvarlamak bu durumda doğru notayı komşu nota sanar; bu yüzden hedefe
 * ±70 sent yakınlığı kabul ediyoruz. Tam bir yarım ses (100 sent) uzaktaki yanlış
 * parmak pozisyonu yine kabul edilmez.
 */
export const TOLERANCE = 0.7;
export function matchesTarget(frame, target, { tolerance = TOLERANCE, octaveOk = false } = {}) {
  if (!frame.note) return false;
  return Math.abs(offsetFromTarget(frame, target, { octaveOk })) <= tolerance;
}

// Uygulamanın kendi çaldığı sesler (örnek nota, Google anlatımı) hoparlörden
// mikrofona geri girer; bu sırada mikrofonu dinlemeyiz.
const appSounds = new Map();
let appSoundId = 0;
/** Bir sesin çalmaya başladığını bildirir; dönen fonksiyon ses erken kesilince çağrılır. */
export function beginAppSound(ms) {
  const id = ++appSoundId;
  appSounds.set(id, performance.now() + ms + 250);
  return () => appSounds.set(id, Math.min(appSounds.get(id) ?? 0, performance.now() + 250));
}
function appSoundActive(now) {
  for (const [id, until] of appSounds) {
    if (until < now) appSounds.delete(id);
    else return true;
  }
  return false;
}

/** Mikrofon açılamadığında kullanıcıya gösterilecek açıklama */
export function micErrorMessage(err) {
  const embedded = window.top !== window.self;
  const site = instrument().liveLabel;
  if (!navigator.mediaDevices?.getUserMedia) {
    return embedded || !window.isSecureContext
      ? `Bu görünümde mikrofon kullanılamıyor. Uygulamayı tarayıcıda ${site} adresinden aç.`
      : 'Bu tarayıcı mikrofonu desteklemiyor. Güncel Chrome, Safari ya da Firefox dene.';
  }
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return embedded
        ? `Bu görünüm mikrofona izin vermiyor. Uygulamayı tarayıcıda ${site} adresinden aç.`
        : 'Mikrofon izni verilmedi. Adres çubuğundaki kilit/mikrofon simgesine dokunup izin ver, sonra sayfayı yenile.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'Mikrofon bulunamadı. Bir mikrofon bağlı olduğundan emin ol.';
    case 'NotReadableError':
    case 'AbortError':
      return 'Mikrofon başka bir uygulama tarafından kullanılıyor olabilir. Diğer uygulamaları kapatıp tekrar dene.';
    default:
      return 'Mikrofona erişilemedi. Tarayıcı izinlerini kontrol et.';
  }
}

/**
 * Mikrofonu dinler ve her karede algılanan notayı bildirir.
 * onFrame({note, midi, midiFloat, cents, freq, rms}) — ses yoksa note null olur;
 * uygulama kendisi ses çalarken muted: true ile gelir.
 * onStatus('silent' | 'ok') — mikrofondan hiç veri gelmiyorsa 'silent'.
 */
export class PitchListener {
  constructor(onFrame, { onStatus } = {}) {
    this.onFrame = onFrame;
    this.onStatus = onStatus;
    this.running = false;
  }

  async start() {
    if (this.running) return;
    if (!navigator.mediaDevices?.getUserMedia) throw new DOMException('getUserMedia yok', 'NotSupportedError');
    const ac = audioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    // iPhone/Safari mikrofon izninden sonra ses motorunu askıya alabiliyor
    if (ac.state !== 'running') await ac.resume().catch(() => {});
    this.source = ac.createMediaStreamSource(this.stream);
    this.analyser = ac.createAnalyser();
    this.analyser.fftSize = 2048;
    // Safari, çıkışa bağlı olmayan düğümlere veri göndermez: sessiz bir kazançla bağla
    this.sink = ac.createGain();
    this.sink.gain.value = 0;
    this.source.connect(this.analyser);
    this.analyser.connect(this.sink).connect(ac.destination);
    this.buf = new Float32Array(this.analyser.fftSize);
    this.running = true;
    let frames = 0;
    let heardAnything = false;
    let reportedSilent = false;
    const tick = () => {
      if (!this.running) return;
      this.analyser.getFloatTimeDomainData(this.buf);
      if (!heardAnything) {
        for (let i = 0; i < this.buf.length; i += 16) {
          if (this.buf[i] !== 0) {
            heardAnything = true;
            if (reportedSilent) this.onStatus?.('ok');
            break;
          }
        }
        if (!heardAnything && ++frames === 90) {
          // ~1,5 sn boyunca tam sıfır: ses motoru durmuş ya da mikrofon veri vermiyor
          reportedSilent = true;
          ac.resume().catch(() => {});
          this.onStatus?.('silent');
        }
      }
      if (appSoundActive(performance.now())) {
        this.onFrame({ note: null, rms: 0, muted: true });
      } else {
        const { freq, rms } = detectPitch(this.buf, ac.sampleRate);
        if (freq > 0) this.onFrame({ ...freqToNote(freq), freq, rms });
        else this.onFrame({ note: null, rms });
      }
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.sink?.disconnect();
  }
}

export const SILENT_MIC_MESSAGE = 'Mikrofondan ses gelmiyor. Ekrana bir kez dokun; düzelmezse sayfayı yenileyip mikrofon iznini tekrar ver.';

/**
 * Hedef notanın belirli bir süre boyunca tutulmasını bekleyen yardımcı.
 * - Hedefe ±70 sent yakın sesler kabul edilir (bkz. matchesTarget).
 * - Nefes ya da titreşimden kaynaklanan kısa kopmalar (≤150 ms) sayacı sıfırlamaz.
 * - octaveOk: aynı notanın başka oktavı da kabul edilir (onMatch'te octave: true).
 * - Bir nota eşleştikten sonra, o nota bırakılana (ses kesilene, azalana ya da
 *   başka bir notaya geçilene) kadar gelen kareler yok sayılır. Böylece uzatılan
 *   nota sonraki hedef için hata sayılmaz ve tekrarlanan notalar (Sol Sol Sol)
 *   her seferinde yeniden çalınmak zorunda kalır.
 * - Yanlış nota ancak 600 ms boyunca aynı kalırsa bildirilir.
 */
export class NoteMatcher {
  constructor({ holdMs = 300, octaveOk = false, onProgress, onMatch, onWrong } = {}) {
    Object.assign(this, { holdMs, octaveOk, onProgress, onMatch, onWrong });
    this.target = null;
    this.since = 0;
    this.lastHit = 0;
    this.offsets = [];
    this.wrongSince = 0;
    this.lastWrong = null;
    this.reported = false;
    this.release = null;
  }

  setTarget(midi) {
    this.target = midi;
    this.since = 0;
    this.offsets = [];
    this.wrongSince = 0;
  }

  feed(frame, now = performance.now()) {
    if (frame.muted) return;
    if (this.release) {
      const { midi, rms } = this.release;
      if (matchesTarget(frame, midi, { octaveOk: this.octaveOk }) && frame.rms > rms * 0.5) return;
      this.release = null;
    }
    if (this.target == null) return;
    const opts = { octaveOk: this.octaveOk };
    if (matchesTarget(frame, this.target, opts)) {
      this.lastWrong = null;
      this.lastHit = now;
      if (!this.since) this.since = now;
      this.offsets.push(offsetFromTarget(frame, this.target, opts));
      const p = Math.min(1, (now - this.since) / this.holdMs);
      this.onProgress?.(p, frame);
      if (p >= 1) {
        const t = this.target;
        const sorted = [...this.offsets].sort((a, b) => a - b);
        const cents = Math.round(sorted[sorted.length >> 1] * 100);
        this.target = null;
        this.release = { midi: t, rms: frame.rms };
        this.onMatch?.(t, { ...frame, octave: frame.midi !== t && Math.abs(frame.midiFloat - t) > 6, tuning: cents });
      }
      return;
    }
    // Kısa kopmalar (nefes, titreşim) tutma süresini sıfırlamasın
    if (this.since && now - this.lastHit < 150) return;
    this.since = 0;
    this.offsets = [];
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
