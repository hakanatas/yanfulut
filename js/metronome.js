// Metronom: Web Audio ile önceden zamanlanmış vuruş sesleri (setTimeout titremesi duyulmaz).
//  - Metronome: Metronom sayfasındaki bağımsız metronom (tempo, ölçü, ara vuruş).
//  - ClickTrack: Tempolu çalarken okuma çizgisiyle birlikte vuran metronom.
//  - tempoControl: egzersiz/antrenman temposunu elle değiştirme düğmeleri.
import { audioContext } from './audio.js';
import { instrument } from './instrument.js';

export const BPM_MIN = 30;
export const BPM_MAX = 200;
export const clampBpm = (v) => Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(Number(v) || 0)));

let noise = null;
function noiseBuffer(ac) {
  if (noise?.sampleRate === ac.sampleRate) return noise;
  noise = ac.createBuffer(1, Math.round(ac.sampleRate * 0.03), ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

/**
 * Bir vuruş sesi. when: AudioContext zamanı (saniye).
 * soft: çalarken kullanılan tahta tıkırtısı. Perdesiz (gürültü) olduğu için mikrofondaki nota algısını
 * şaşırtmaz; bu yüzden mikrofon bu seste susturulmaz.
 */
export function tick(when, { strong = false, sub = false, soft = false, volume = 1 } = {}) {
  const ac = audioContext();
  const t = Math.max(when, ac.currentTime);
  const g = ac.createGain();
  g.connect(ac.destination);
  if (soft) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer(ac);
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = strong ? 3200 : 4200;
    f.Q.value = 1.4;
    g.gain.setValueAtTime((strong ? 0.9 : 0.55) * volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    src.connect(f).connect(g);
    src.start(t);
    src.stop(t + 0.03);
    return;
  }
  const o = ac.createOscillator();
  o.frequency.value = strong ? 1600 : sub ? 800 : 1100;
  g.gain.setValueAtTime((sub ? 0.12 : 0.28) * volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.06);
}

/** Tempo adı (İtalyanca terim) */
export function tempoName(bpm) {
  if (bpm < 60) return 'Largo · çok yavaş';
  if (bpm < 76) return 'Adagio · yavaş';
  if (bpm < 108) return 'Andante · yürür gibi';
  if (bpm < 120) return 'Moderato · orta';
  if (bpm < 168) return 'Allegro · hızlı';
  return 'Presto · çok hızlı';
}

/** Bağımsız metronom. onBeat(beat): ses çıktığı anda çağrılır (0 = ölçünün ilk vuruşu) */
export class Metronome {
  constructor({ bpm = 80, beats = 4, sub = false, onBeat } = {}) {
    Object.assign(this, { bpm: clampBpm(bpm), beats, sub, onBeat });
    this.running = false;
    this.visuals = [];
  }

  start() {
    if (this.running) return;
    const ac = audioContext();
    this.running = true;
    this.beat = 0;
    this.next = ac.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  schedule() {
    const ac = audioContext();
    while (this.running && this.next < ac.currentTime + 0.12) {
      const b = this.beat % this.beats;
      const spb = 60 / this.bpm;
      tick(this.next, { strong: this.beats > 1 && b === 0 });
      if (this.sub) tick(this.next + spb / 2, { sub: true });
      const delay = (this.next - ac.currentTime) * 1000;
      this.visuals.push(setTimeout(() => this.running && this.onBeat?.(b), Math.max(0, delay)));
      if (this.visuals.length > 16) this.visuals.shift();
      this.next += spb;
      this.beat++;
    }
  }

  stop() {
    this.running = false;
    clearInterval(this.timer);
    this.visuals.forEach(clearTimeout);
    this.visuals = [];
  }

  /** Ölçü değişince sayım ölçü başından sürer */
  setBeats(beats) {
    this.beats = beats;
    this.beat = 0;
  }

  setBpm(bpm) {
    this.bpm = clampBpm(bpm);
  }

  destroy() {
    this.stop();
  }
}

/**
 * Notaların vuruş başları. events: [{at (ms), beats, stretch}] art arda;
 * startPos: ilk olayın ölçü içindeki vuruş konumu. stretch: korona gibi yazılandan uzun tutulan olay için çarpan.
 * @returns [{at, strong}]
 */
export function beatTicks(events, { beatMs, time = 4, startPos = 0 }) {
  const ticks = [];
  let pos = startPos;
  for (const e of events) {
    for (let b = Math.ceil(pos - 1e-6); b < pos + e.beats - 1e-6; b++) {
      ticks.push({ at: e.at + (b - pos) * beatMs * (e.stretch || 1), strong: time > 1 && ((b % time) + time) % time === 0 });
    }
    pos += e.beats;
  }
  return ticks;
}

/** Tempolu çalarken vuruşlar okuma çizgisine göre zamanlanır (öğrenci başlayınca başlar) */
export class ClickTrack {
  constructor(ticks) {
    this.ticks = ticks;
    this.k = 0;
  }

  /** heard: okuma zamanı (ms). Önümüzdeki 60 ms içindeki vuruşları zamanlar; kaçanı atlar */
  update(heard) {
    const ac = audioContext();
    while (this.k < this.ticks.length && this.ticks[this.k].at <= heard + 60) {
      const t = this.ticks[this.k++];
      if (t.at < heard - 40) continue;
      tick(ac.currentTime + Math.max(0, (t.at - heard) / 1000), { strong: t.strong, soft: true });
    }
  }
}

// ------------------------------------------------------------------ tercihler
const store = (suffix) => `${instrument().storageKey}.${suffix}`;
function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* saklanamazsa yalnızca bu oturumda geçerli */
  }
}

/** Alıştırmaya özel elle seçilmiş tempo (yoksa null) */
export function savedTempo(id) {
  const v = readJson(store('tempo'), {})[id];
  return v ? clampBpm(v) : null;
}
export function saveTempo(id, bpm, written) {
  const all = readJson(store('tempo'), {});
  if (bpm === written) delete all[id];
  else all[id] = bpm;
  writeJson(store('tempo'), all);
}

/** Tempolu çalarken metronom sesi (varsayılan açık) */
export const clicksOn = () => readJson(store('clicks'), true) !== false;
export const setClicksOn = (on) => writeJson(store('clicks'), !!on);

/** Metronom sayfasının son ayarları */
export const metronomeSettings = () => ({ bpm: 80, beats: 4, sub: false, ...readJson(store('metronome'), {}) });
export const saveMetronomeSettings = (s) => writeJson(store('metronome'), s);

/**
 * Tempo düğmeleri: [−] 72 [+] vuruş/dk, yazılı tempoya dönüş ve metronom sesi.
 * onChange(bpm) tempo değişince çağrılır. Dönüş: {el, set(bpm)}
 */
export function tempoControl({ bpm, written, onChange }) {
  const el = document.createElement('div');
  el.className = 'tempo-ctl';
  el.innerHTML = `
    <div class="seg-group" role="group" aria-label="Tempo">
      <button class="chip-btn" data-step="-4" aria-label="Yavaşlat" title="Yavaşlat">−</button>
      <label class="tempo-val" title="Tempo (vuruş/dakika)"><input type="number" inputmode="numeric" min="${BPM_MIN}" max="${BPM_MAX}" step="1" aria-label="Tempo, vuruş/dakika"><small>vuruş/dk</small></label>
      <button class="chip-btn" data-step="4" aria-label="Hızlandır" title="Hızlandır">+</button>
    </div>
    <button class="link tempo-reset" hidden></button>
    <button class="chip-btn standalone clicks-btn" aria-pressed="false" title="Tempolu çalarken her vuruşta tık sesi"></button>`;
  const input = el.querySelector('input');
  const reset = el.querySelector('.tempo-reset');
  const clicks = el.querySelector('.clicks-btn');
  let cur = bpm;
  const show = () => {
    input.value = cur;
    reset.hidden = cur === written;
    reset.textContent = `↺ Yazılı tempo (${written})`;
    const on = clicksOn();
    clicks.setAttribute('aria-pressed', on);
    clicks.classList.toggle('active', on);
    clicks.textContent = on ? '🥁 Metronom sesi açık' : '🔇 Metronom sesi kapalı';
  };
  const set = (v) => {
    v = clampBpm(v);
    if (v === cur) return show();
    cur = v;
    show();
    onChange(v);
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.step) set(cur + Number(b.dataset.step));
    else if (b === reset) set(written);
    else if (b === clicks) {
      setClicksOn(!clicksOn());
      show();
    }
  });
  input.addEventListener('change', () => set(input.value));
  input.addEventListener('keydown', (e) => e.key === 'Enter' && input.blur());
  show();
  return { el, set };
}

/** Sonuç kartı için: yazılıdan belirgin yavaş çalındıysa not; yıldız en çok 2 */
export function tempoNote(bpm, written) {
  if (bpm >= written * 0.9) return '';
  return `<p class="muted tempo-note">🐢 Yazılı tempodan yavaş çaldın (${bpm} / ${written} vuruş/dk). Üç yıldız için tempoyu adım adım yazılı tempoya (${written}) çıkar.</p>`;
}
export const starsAtTempo = (stars, bpm, written) => (bpm < written * 0.9 ? Math.min(stars, 2) : stars);
