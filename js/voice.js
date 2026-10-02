// Türkçe seslendirme (Web Speech API). Ses bulunamazsa sessizce süre tahminine geçer.
let voice = null;

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  voice = voices.find((v) => v.lang?.toLowerCase().startsWith('tr')) || null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => 'speechSynthesis' in window;
export const hasTurkishVoice = () => !!voice;

/** Metni okur; okuma bitince (ya da iptal edilince) çözülen bir Promise döner. */
export function speak(text, { rate = 1 } = {}) {
  if (!canSpeak()) return Promise.resolve(false);
  speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = 1.1;
    let settled = false;
    const done = (ok) => {
      if (!settled) {
        settled = true;
        resolve(ok);
      }
    };
    u.onend = () => done(true);
    u.onerror = () => done(false);
    // Bazı tarayıcılar onend olayını hiç göndermez; güvenlik için zaman aşımı.
    setTimeout(() => done(true), estimateMs(text, rate) * 2 + 3000);
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel();
}

/** Okuma süresi tahmini (seslendirme kapalıyken altyazının ekranda kalma süresi). */
export function estimateMs(text, rate = 1) {
  return (700 + text.length * 62) / rate;
}
