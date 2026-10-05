// Ders anlatımlarını Google Cloud Text-to-Speech ile MP3'e çevirir.
//
// Kullanım:
//   GOOGLE_TTS_API_KEY=... node tools/tts.mjs            # eksik sesleri üret
//   GOOGLE_TTS_API_KEY=... node tools/tts.mjs --force    # hepsini yeniden üret
//   TTS_VOICE=tr-TR-Chirp3-HD-Aoede node tools/tts.mjs   # başka bir ses
//
// Çıktı: js/tts/clips/<özet>.js (MP3, base64 olarak bir JS modülünün içinde) ve
// js/tts/manifest.js. Sesler JS modülü olarak paketlenir; böylece ses dosyası
// indirmeyi engelleyen gömülü görünümlerde (ör. Claude önizlemesi) de çalar.
// Bir proxy arkasındaysanız Node 22.21+ ile NODE_USE_ENV_PROXY=1 ekleyin.
import { mkdir, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { LESSONS } from '../js/data/lessons.js';
import { PHRASES, checkpointPrompt, ttsKey } from '../js/data/phrases.js';

const KEY = process.env.GOOGLE_TTS_API_KEY;
const VOICE = process.env.TTS_VOICE || 'tr-TR-Chirp3-HD-Leda';
const FORCE = process.argv.includes('--force');
const OUT = new URL('../js/tts/clips/', import.meta.url);
const MANIFEST = new URL('../js/tts/manifest.js', import.meta.url);

if (!KEY) {
  console.error('GOOGLE_TTS_API_KEY ortam değişkeni gerekli.');
  process.exit(1);
}

function collectTexts() {
  const texts = new Set(Object.values(PHRASES));
  for (const lesson of LESSONS) {
    const items = lesson.scenes || lesson.video?.cues || [];
    for (const item of items) {
      if (item.say) texts.add(item.say);
      if (item.check) texts.add(checkpointPrompt(item.check));
    }
  }
  texts.delete('');
  return [...texts];
}

async function synthesize(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'tr-TR', name: VOICE },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { audioContent } = await res.json();
  return Buffer.from(audioContent, 'base64');
}

await mkdir(OUT, { recursive: true });
const texts = collectTexts();
const files = {};
let made = 0;
for (const text of texts) {
  const key = ttsKey(text, VOICE);
  const file = new URL(`${key}.js`, OUT);
  if (FORCE || !existsSync(file)) {
    const mp3 = await synthesize(text);
    const body = `// ${text.replace(/\n/g, ' ')}\nexport default '${mp3.toString('base64')}';\n`;
    await writeFile(file, body);
    made++;
    process.stdout.write('.');
  }
  files[key] = text;
}

// Artık kullanılmayan eski dosyaları temizle
for (const name of await readdir(OUT)) {
  if (name.endsWith('.js') && !files[name.slice(0, -3)]) await unlink(new URL(name, OUT));
}

const next = `// tools/tts.mjs tarafından üretilir, elle düzenlemeyin.\nexport const TTS = ${JSON.stringify({ voice: VOICE, files }, null, 2)};\n`;
const prev = existsSync(MANIFEST) ? await readFile(MANIFEST, 'utf8') : '';
if (prev !== next) await writeFile(MANIFEST, next);
console.log(`\n${texts.length} cümle, ${made} yeni ses dosyası (${VOICE}).`);
