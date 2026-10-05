// Seslendirme: tools/tts.mjs ile Google Cloud Text-to-Speech'ten (tr-TR Chirp3-HD)
// önceden üretilmiş sesler. Sesler JS modüllerinin içinde gelir (js/tts/clips/),
// böylece dosya indirmeyi kısıtlayan gömülü görünümlerde de çalışır.
// Tarayıcının robotik sesi kullanılmaz: sesi olmayan bir cümle yalnızca altyazıyla gösterilir.
import { ttsKey } from './data/phrases.js';
import { audioContext, audioRunning, beginAppSound } from './audio.js';
import { TTS } from './tts/manifest.js';

export { audioRunning };

const buffers = new Map();

function loadClip(key) {
  if (!buffers.has(key)) {
    const p = import(`./tts/clips/${key}.js`)
      .then(({ default: b64 }) => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return audioContext().decodeAudioData(bytes.buffer);
      });
    p.catch(() => buffers.delete(key));
    buffers.set(key, p);
  }
  return buffers.get(key);
}

function recordingKey(text) {
  if (!text) return null;
  const key = ttsKey(text, TTS.voice);
  return TTS.files[key] ? key : null;
}

/** Bu cümlenin Google sesi var mı? */
export const hasVoice = (text) => !!recordingKey(text);

/** Sonraki cümleleri arka planda hazırla (sahne geçişleri beklemesiz olsun) */
export function preload(texts) {
  texts.forEach((t) => {
    const k = recordingKey(t);
    if (k) loadClip(k).catch(() => {});
  });
}

export const canSpeak = () => 'AudioContext' in window || 'webkitAudioContext' in window;

/** Okuma süresi tahmini (sessiz durumda altyazının ekranda kalma süresi) */
export function estimateMs(text, rate = 1) {
  return (700 + text.length * 62) / rate;
}

let current = null;

/**
 * Bir cümleyi Google sesiyle okur.
 * @returns {{done: Promise<boolean>, pause(): void, resume(): void, stop(): void}}
 *   done: sonuna kadar okununca true; ses yoksa, çalınamazsa ya da durdurulursa false.
 */
export function narrate(text, { rate = 1 } = {}) {
  current?.stop();
  const key = recordingKey(text);
  const handle = key ? clipHandle(key, rate) : silentHandle();
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

function silentHandle() {
  const { done, finish } = settle();
  finish(false);
  return { done, pause() {}, resume() {}, stop() {} };
}

/** Ses kaydı: gerçekten duraklatılıp kaldığı yerden sürer */
function clipHandle(key, rate) {
  const { done, finish } = settle();
  const ac = audioContext();
  let buf = null;
  let src = null;
  let offset = 0;
  let startedAt = 0;
  let paused = false;
  let stopped = false;
  let watchdog = null;
  let endAppSound = null;

  const halt = () => {
    clearTimeout(watchdog);
    endAppSound?.();
    const s = src;
    src = null;
    try {
      s?.stop();
    } catch {
      /* zaten durmuş */
    }
  };
  // Ses motoru kilitli kaldıysa ya da "bitti" olayı hiç gelmezse ders donmasın
  const arm = () => {
    clearTimeout(watchdog);
    const remaining = ((buf.duration - offset) / rate) * 1000;
    watchdog = setTimeout(
      () => {
        if (paused || stopped) return;
        if (ac.state !== 'running') {
          halt();
          finish(false);
        } else {
          arm();
        }
      },
      ac.state === 'running' ? remaining + 1500 : 1500,
    );
  };
  const play = () => {
    if (ac.state !== 'running') ac.resume().catch(() => {});
    const s = ac.createBufferSource();
    s.buffer = buf;
    s.playbackRate.value = rate;
    s.connect(ac.destination);
    s.onended = () => {
      if (src === s) {
        clearTimeout(watchdog);
        finish(true);
      }
    };
    src = s;
    startedAt = ac.currentTime;
    s.start(0, offset);
    endAppSound = beginAppSound(((buf.duration - offset) / rate) * 1000);
    arm();
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
        offset = Math.min(buf.duration, offset + (ac.currentTime - startedAt) * rate);
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
