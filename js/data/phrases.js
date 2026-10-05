// Seslendirilen kısa cümleler. Hem uygulama hem de tools/tts.mjs bu fonksiyonları
// kullanır; böylece önceden üretilen ses dosyası ile ekrandaki metin hep aynı olur.
import { longName } from './notes.js';

export const PHRASES = {
  correct: 'Doğru!',
  great: 'Harika!',
  tryAgain: 'Hmm, tam değil. Bir daha dene!',
  songDone: 'Bravo! Resmi tamamladın.',
};

/** Bir durak açıldığında okunacak cümle */
export function checkpointPrompt(check) {
  switch (check.type) {
    case 'quiz':
      return check.q;
    case 'play':
      return `Şimdi sen çal: ${longName(check.note)}.`;
    case 'listen-any':
      return 'Şimdi sen dene: uzun ve sakin bir ses çıkar.';
    case 'breath':
      return `Nefes egzersizi: ${check.inhale || 4} say nefes al, ${check.exhale || 8} say üfle.`;
    default:
      return '';
  }
}

/** Ses dosyası adı için kararlı kısa özet (FNV-1a, 32 bit) */
export function ttsKey(text, voice) {
  let h = 0x811c9dc5;
  const s = `${voice}|${text}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
