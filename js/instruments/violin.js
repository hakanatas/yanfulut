// Keman paketi: dersler, şarkılar, parmak yeri şeması ve seslendirme.
import { LESSONS } from '../violin/lessons.js';
import { SONGS } from '../violin/songs.js';
import { DRILLS } from '../violin/drills.js';
import { VIOLIN_NOTES, violinFingering, violinTip, fingerText, violinRegister } from '../violin/notes.js';
import { fingerboard } from '../violin/art.js';
import { longName, setRegisterNaming } from '../data/notes.js';
import { setPitchRange, setTimbre } from '../audio.js';
import { TTS } from '../violin/tts/manifest.js';
import { UNITS, SOURCE } from '../violin/worksheet.js';

export default {
  id: 'violin',
  name: 'Keman',
  restartNote: 'A4', // egzersiz bitince bu nota uzun çalınırsa baştan başlar
  nextNote: 'D4', // alıştırma bitince bu nota uzun çalınırsa sonrakine geçer
  playWith: 'Kemanla', // "… çal" düğmeleri için
  appTitle: 'Nokta Nokta Keman',
  liveLabel: 'hakanatas.github.io/yanfulut/keman',
  storageKey: 'keman.progress.v1',
  heroTitle: 'Nokta nokta keman',
  heroText: 'Çizimli video dersleri izle, Nota ile birlikte keman çal. Her doğru nota bir noktayı birleştirir!',
  chartTitle: 'Parmak Yerleri',
  tunerHint: 'Akort için kemanın burgularını ya da kuyruktaki ince akort vidalarını çok az çevir: sıkınca ses tizleşir, gevşetince pesleşir. Boş teller Sol, Re, La ve Mi olmalı.',
  // Boş telde akort vidası, basılı notada parmak yeri düzeltilir
  sharpAdvice: (note) =>
    violinFingering(note).finger === 0
      ? 'tel biraz gergin: kuyruktaki ince akort vidasını hafifçe gevşet'
      : 'parmağını burgulara doğru çok az geri kaydır',
  flatAdvice: (note) =>
    violinFingering(note).finger === 0
      ? 'tel biraz gevşek: kuyruktaki ince akort vidasını hafifçe sık'
      : 'parmağını eşiğe doğru çok az ileri kaydır',
  // Akort aletinde boş tel düğmeleri; otomatik modda yakın çalınan boş tele göre akort edilir
  tunerRefs: [
    { note: 'G3', label: 'Sol teli', auto: true },
    { note: 'D4', label: 'Re teli', auto: true },
    { note: 'A4', label: 'La teli', auto: true },
    { note: 'E5', label: 'Mi teli', auto: true },
  ],
  restrikeHint: 'yayı yeniden başlat (yay yönünü değiştir)', // aynı nota art arda gelince
  worksheetIntro: 'Kemana özel egzersizler satır satır: boş tellerden başlayıp dört telin parmaklarına.',
  pictureName: 'parmak yeri şemasını',
  worksheets: UNITS,
  worksheetSource: SOURCE,
  other: { name: 'Yan Flüt', href: '../', live: 'https://hakanatas.github.io/yanfulut/' },
  lessons: LESSONS,
  songs: SONGS,
  drills: DRILLS,
  course: [
    { type: 'lesson', id: 'tanisma' },
    { type: 'lesson', id: 'tutus' },
    { type: 'lesson', id: 'yay' },
    { type: 'lesson', id: 'bos-teller' },
    { type: 'lesson', id: 'ritim' },
    { type: 'drill', id: 'bos-sureler' },
    { type: 'song', id: 'bos-tel-treni' },
    { type: 'drill', id: 'tel-gecisleri' },
    { type: 'lesson', id: 'la-teli' },
    { type: 'drill', id: 'la-teli-dortlukler' },
    { type: 'song', id: 'salincak' },
    { type: 'song', id: 'merdiven' },
    { type: 'drill', id: 'uzun-yaylar' },
    { type: 'song', id: 'corekler' },
    { type: 'song', id: 'tembel' },
    { type: 'song', id: 'kuzu' },
    { type: 'lesson', id: 're-teli' },
    { type: 'drill', id: 're-majorm' },
    { type: 'drill', id: 'sekizlikler' },
    { type: 'song', id: 'nese' },
    { type: 'lesson', id: 'mi-teli' },
    { type: 'drill', id: 'mi-teli' },
    { type: 'song', id: 'yildiz' },
  ],
  notes: VIOLIN_NOTES,
  defaultNote: 'A4',
  ttsDir: 'js/violin/tts/',
  tts: { manifest: TTS, load: (key) => import(`../violin/tts/clips/${key}.js`) },

  activate() {
    setRegisterNaming(violinRegister);
    setPitchRange(180, 2400);
    setTimbre('violin');
  },

  fingeringSvg(note) {
    return `<svg class="mini-fingerboard" viewBox="30 0 220 400" role="img" aria-label="${longName(note)} parmak yeri">
      <g filter="url(#sketchy-sm)">${fingerboard(60, 30, 1, { note })}</g></svg>`;
  },

  chartDetail(note) {
    const f = violinFingering(note);
    return {
      tip: violinTip(note),
      items: [`Tel: ${f.stringName} teli`, `Parmak: ${fingerText(f)}`],
    };
  },
};
