// Seslendirme. Öncelik, tools/tts.mjs ile Google Cloud Text-to-Speech'ten önceden
// üretilmiş ses dosyalarındadır (audio/tts/). Dosyası olmayan cümleler için
// tarayıcının kendi Türkçe sesi (Web Speech API) kullanılır.
import { ttsKey } from './data/phrases.js';
import { audioContext } from './audio.js';

const BASE = 'audio/tts/';
let manifest = null;
export const voiceReady = fetch(`${BASE}manifest.json`)
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => (manifest = m))
  .catch(() => null);

const buffers = new Map();
function loadClip(key) {
  if (!buffers.has(key)) {
    const p = fetch(`${BASE}${key}.mp3`)
      .then((r) => {
        if (!r.ok) throw new Error(`Ses dosyası bulunamadı: ${key}`);
        return r.arrayBuffer();
      })
      .then((b) => audioContext().decodeAudioData(b));
    p.catch(() => buffers.delete(key));
    buffers.set(key, p);
  }
  return buffers.get(key);
}

function recordingKey(text) {
  if (!manifest?.files) return null;
  const key = ttsKey(text, manifest.voice);
  return manifest.files[key] ? key : null;
}

/** Sonraki cümleleri arka planda indir (sahne geçişleri beklemesiz olsun) */
export function preload(texts) {
  voiceReady.then(() => texts.forEach((t) => {
    const k = t && recordingKey(t);
    if (k) loadClip(k).catch(() => {});
  }));
}

// --------------------------------------------------------------------------- Web Speech
let webVoice = null;
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  webVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('tr')) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => 'speechSynthesis' in window || 'AudioContext' in window;

/** Okuma süresi tahmini (seslendirme kapalıyken altyazının ekranda kalma süresi) */
export function estimateMs(text, rate = 1) {
  return (700 + text.length * 62) / rate;
}

let current = null;

/**
 * Bir cümleyi okur.
 * @returns {{done: Promise<boolean>, pause(): void, resume(): void, stop(): void}}
 *   done: sonuna kadar okununca true; okunamazsa ya da durdurulursa false.
 */
export function narrate(text, { rate = 1 } = {}) {
  current?.stop();
  const key = recordingKey(text);
  const handle = key ? clipHandle(key, rate) : speechHandle(text, rate);
  current = handle;
  return handle;
}

export function stopSpeaking() {
  current?.stop();
  current = null;
}

/** Kısa bir cümleyi okur ve beklemez (duraklardaki sorular, "Doğru!" vb.) */
export function say(text, opts) {
  if (text) narrate(text, opts);
}

function settle() {
  let resolve;
  const done = new Promise((r) => (resolve = r));
  let settled = false;
  return { done, finish: (v) => !settled && ((settled = true), resolve(v)) };
}

/** Önceden üretilmiş ses dosyası: gerçekten duraklatılıp kaldığı yerden sürer */
function clipHandle(key, rate) {
  const { done, finish } = settle();
  const ac = audioContext();
  let buf = null;
  let src = null;
  let offset = 0;
  let startedAt = 0;
  let paused = false;
  let stopped = false;

  const play = () => {
    const s = ac.createBufferSource();
    s.buffer = buf;
    s.playbackRate.value = rate;
    s.connect(ac.destination);
    s.onended = () => {
      if (src === s) finish(true);
    };
    src = s;
    startedAt = ac.currentTime;
    s.start(0, offset);
  };
  const halt = () => {
    const s = src;
    src = null;
    try {
      s?.stop();
    } catch {
      /* zaten durmuş */
    }
  };

  loadClip(key).then(
    (b) => {
      buf = b;
      if (!stopped && !paused) play();
    },
    () => finish(false),
  );
  return {
    done,
    pause() {
      if (paused || stopped) return;
      paused = true;
      if (src) {
        offset += (ac.currentTime - startedAt) * rate;
        halt();
      }
    },
    resume() {
      if (!paused || stopped) return;
      paused = false;
      if (buf) play();
    },
    stop() {
      stopped = true;
      halt();
      finish(false);
    },
  };
}

/** Tarayıcı sesi: duraklatılınca cümle baştan okunur (tarayıcıların pause desteği güvenilmez) */
function speechHandle(text, rate) {
  const { done, finish } = settle();
  if (!('speechSynthesis' in window)) {
    finish(false);
    return { done, pause() {}, resume() {}, stop() {} };
  }
  let gen = 0;
  let stopped = false;
  const start = () => {
    const my = ++gen;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    if (webVoice) u.voice = webVoice;
    u.rate = rate;
    const t0 = performance.now();
    // Hiç ses yoksa bazı tarayıcılar anında "bitti" der: bunu başarısızlık say
    u.onend = () => my === gen && finish(performance.now() - t0 > 300);
    u.onerror = () => my === gen && finish(false);
    setTimeout(() => my === gen && finish(true), estimateMs(text, rate) * 2 + 3000);
    speechSynthesis.speak(u);
  };
  start();
  return {
    done,
    pause() {
      gen++;
      speechSynthesis.cancel();
    },
    resume() {
      if (!stopped) start();
    },
    stop() {
      stopped = true;
      gen++;
      speechSynthesis.cancel();
      finish(false);
    },
  };
}
