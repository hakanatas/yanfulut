// Yan flüt paketi: dersler, şarkılar, parmak pozisyonu çizimi ve seslendirme.
import { LESSONS } from '../data/lessons.js';
import { SONGS } from '../data/songs.js';
import { ALL_NOTES, fingeringOf, tipOf, KEYS, KEY_NAMES, longName, setRegisterNaming } from '../data/notes.js';
import { flute } from '../art.js';
import { setPitchRange, setTimbre } from '../audio.js';
import { TTS } from '../tts/manifest.js';

export default {
  id: 'flute',
  name: 'Yan Flüt',
  appTitle: 'Nokta Nokta Flüt',
  liveLabel: 'hakanatas.github.io/yanfulut',
  storageKey: 'yanflut.progress.v1',
  heroTitle: 'Nokta nokta yan flüt',
  heroText: 'Çizimli video dersleri izle, Nota ile birlikte çal. Her doğru nota bir noktayı birleştirir!',
  chartTitle: 'Parmak Tablosu',
  tunerHint: 'Akort için flütünün baş kısmını gövdeden biraz dışarı çekersen ses pesleşir, içeri itersen tizleşir.',
  sharpAdvice: 'havayı biraz yumuşat ya da flütün baş kısmını hafifçe dışarı çek',
  flatAdvice: 'havayı biraz hızlandır ve dudak açıklığını küçült',
  other: { name: 'Keman', href: 'keman/', live: 'https://hakanatas.github.io/yanfulut/keman/' },
  lessons: LESSONS,
  songs: SONGS,
  course: [
    { type: 'lesson', id: 'tanisma' },
    { type: 'lesson', id: 'ilk-ses' },
    { type: 'lesson', id: 'nefes' },
    { type: 'lesson', id: 'si' },
    { type: 'lesson', id: 'la-sol' },
    { type: 'song', id: 'corekler' },
    { type: 'lesson', id: 'do-re' },
    { type: 'song', id: 'kuzu' },
    { type: 'song', id: 'nese' },
    { type: 'lesson', id: 'ritim' },
    { type: 'lesson', id: 'mi' },
    { type: 'song', id: 'yildiz' },
  ],
  notes: ALL_NOTES,
  defaultNote: 'B4',
  ttsDir: 'js/tts/',
  tts: { manifest: TTS, load: (key) => import(`../tts/clips/${key}.js`) },

  /** Enstrüman seçilince ortak modülleri ayarla */
  activate() {
    setRegisterNaming(undefined);
    setPitchRange(220, 2400);
    setTimbre('flute');
  },

  /** Küçük parmak pozisyonu çizimi (duraklarda ve şarkı ekranında) */
  fingeringSvg(note, { highlight = [] } = {}) {
    return `<svg class="mini-flute" viewBox="0 0 680 130" role="img" aria-label="${longName(note)} parmak pozisyonu">
      <g filter="url(#sketchy-sm)">${flute({ x: 20, y: 62, w: 640, note, highlight })}</g></svg>`;
  },

  /** Parmak tablosunda bir nota için açıklama */
  chartDetail(note) {
    const keys = fingeringOf(note);
    const items = KEYS.filter((k) => keys.has(k)).map((k) => KEY_NAMES[k]);
    return {
      tip: tipOf(note),
      items: items.length ? items : ['Hiçbir anahtar basılı değil (yalnızca flütü tut)'],
    };
  },
};
