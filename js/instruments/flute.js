// Yan flüt paketi: dersler, şarkılar, parmak pozisyonu çizimi ve seslendirme.
import { LESSONS } from '../data/lessons.js';
import { SONGS } from '../data/songs.js';
import { DRILLS } from '../data/drills.js';
import { UNITS, SOURCE } from '../data/worksheet.js';
import { ALL_NOTES, fingeringOf, tipOf, KEYS, KEY_NAMES, longName, midiOf, setRegisterNaming, titleName } from '../data/notes.js';

// "… kapat / kaldır" cümleleri için parmak adları
const KEY_ACC = {
  th: 'sol başparmağını',
  l1: 'sol işaret parmağını',
  l2: 'sol orta parmağını',
  l3: 'sol yüzük parmağını',
  gs: 'sol serçe parmağını (Sol♯ anahtarı)',
  r1: 'sağ işaret parmağını',
  r2: 'sağ orta parmağını',
  r3: 'sağ yüzük parmağını',
  eb: 'sağ serçe parmağını (Mi♭ anahtarı)',
  c: 'sağ serçe parmağını (pes Do anahtarı)',
};
const list = (keys) => keys.map((k) => KEY_ACC[k]).join(', ').replace(/, ([^,]*)$/, ' ve $1');
import { flute } from '../art.js';
import { setPitchRange, setTimbre } from '../audio.js';
import { TTS } from '../tts/manifest.js';

export default {
  id: 'flute',
  name: 'Yan Flüt',
  restartNote: 'B4', // egzersiz bitince bu nota uzun çalınırsa baştan başlar
  nextNote: 'A4', // alıştırma bitince bu nota uzun çalınırsa sonrakine geçer
  playWith: 'Flütle', // "… çal" düğmeleri için
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
  drills: DRILLS,
  worksheets: UNITS,
  worksheetSource: SOURCE,
  course: [
    { type: 'lesson', id: 'tanisma' },
    { type: 'lesson', id: 'ilk-ses' },
    { type: 'lesson', id: 'nefes' },
    { type: 'lesson', id: 'si' },
    { type: 'lesson', id: 'ritim' },
    { type: 'drill', id: 'si-sureler' },
    { type: 'song', id: 'si-treni' },
    { type: 'lesson', id: 'la-sol' },
    { type: 'drill', id: 'si-la-sol' },
    { type: 'song', id: 'salincak' },
    { type: 'song', id: 'merdiven' },
    { type: 'drill', id: 'uzun-notalar' },
    { type: 'song', id: 'corekler' },
    { type: 'lesson', id: 'do-re' },
    { type: 'drill', id: 'bes-nota' },
    { type: 'song', id: 'tembel' },
    { type: 'drill', id: 'sekizlikler' },
    { type: 'song', id: 'kuzu' },
    { type: 'song', id: 'nese' },
    { type: 'lesson', id: 'mi' },
    { type: 'drill', id: 'pes-notalar' },
    { type: 'drill', id: 'oktav' },
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

  /** Yanlış notada parmak farkı: hedef için hangi parmaklar kapanmalı / kalkmalı */
  fingerFix(heard, target) {
    let want;
    let got;
    try {
      want = fingeringOf(target);
      got = fingeringOf(heard);
    } catch {
      return '';
    }
    const up = midiOf(heard) - midiOf(target);
    const close = KEYS.filter((k) => want.has(k) && !got.has(k));
    const lift = KEYS.filter((k) => got.has(k) && !want.has(k));
    if (!close.length && !lift.length) {
      return `Parmakların doğru; ${up > 0 ? 'havayı yavaşlat, ses bir üst oktava kaçıyor' : 'havayı hızlandır, ses bir alt oktava düşüyor'}.`;
    }
    const parts = [];
    if (close.length) parts.push(`${list(close)} kapat`);
    if (lift.length) parts.push(`${list(lift)} kaldır`);
    // Bir-iki yarım ses tiz çıkıyorsa parmaklar doğru olup sert üflemek de sebep olabilir
    const blow = up > 0 && up <= 2 ? ' Parmakların zaten böyleyse çok sert üflüyorsun: havayı yumuşat.' : '';
    return `${titleName(target)} için ${parts.join(', ')}.${blow}`;
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
