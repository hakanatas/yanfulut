// Piyano paketi: şimdilik piyanoya geçmeden önceki Nota Okuma yolu (klavyeyi tanıma, sol ve fa anahtarı).
// Video dersler, şarkılar ve antrenmanlar sonraki adımda eklenecek.
import { READINGS } from '../piano/reading.js';
import { EXAM_PICKS, SCALE_EXERCISES, SCALE_GROUPS } from '../piano/scales.js';
import { keyboardSvg } from '../keyboard.js';
import { longName, midiOf, noteFromMidi, setRegisterNaming } from '../data/notes.js';
import { setPitchRange, setTimbre } from '../audio.js';

/** Piyanoda oktav adları: orta Do (Do4), ince (5. oktav), tiz (6+), pes (3. oktav), kalın (2 ve altı) */
function pianoRegister(id, octave) {
  if (id === 'C4') return 'orta ';
  if (octave === 4) return '';
  return octave >= 6 ? 'tiz ' : octave === 5 ? 'ince ' : octave === 3 ? 'pes ' : 'kalın ';
}

const NOTES = [];
for (let m = midiOf('C2'); m <= midiOf('C6'); m++) NOTES.push(noteFromMidi(m));

export default {
  id: 'piano',
  name: 'Piyano',
  playWith: 'Piyanoyla',
  appTitle: 'Nokta Nokta Piyano',
  liveLabel: 'hakanatas.github.io/yanfulut/piyano',
  storageKey: 'piyano.progress.v1',
  heroTitle: 'Nokta nokta piyano',
  heroText: 'Piyanoya başlamadan önce nota okumayı öğren: klavyede notaları bul, porteden oku ve tek tek doğru çal. Ekrandaki klavyeyle, kendi piyanonla ya da MIDI klavyeyle çalışabilirsin.',
  chartTitle: 'Klavye',
  tunerHint: 'Piyanonun akordunu bir akortçu yapar. Burada çaldığın notanın adını ve doğru perdede olup olmadığını görebilirsin.',
  sharpAdvice: 'piyanonun bu teli biraz tiz; akortçuya söyle',
  flatAdvice: 'piyanonun bu teli biraz pes; akortçuya söyle',
  other: { name: 'Yan Flüt', href: '../', live: 'https://hakanatas.github.io/yanfulut/' },
  lessons: [],
  songs: [],
  drills: [],
  readings: READINGS,
  // Sınav gamları (Gamlar sayfası): tonlar ve her tonun alıştırmaları
  scales: { title: 'Grade 3 Gamları (Trinity)', keys: SCALE_GROUPS, exercises: SCALE_EXERCISES, picks: EXAM_PICKS },
  course: READINGS.map((r) => ({ type: 'reading', id: r.id })),
  notes: NOTES,
  defaultNote: 'C4',
  tts: null,

  activate() {
    setRegisterNaming(pianoRegister);
    setPitchRange(80, 2000);
    setTimbre('piano');
  },

  /** Notanın klavyedeki yeri: bulunduğu oktav işaretli */
  fingeringSvg(note) {
    const lo = midiOf(note) - (midiOf(note) % 12);
    return `<div class="mini-keyboard">${keyboardSvg({ from: noteFromMidi(lo), to: noteFromMidi(lo + 11), marked: [note], cls: 'kb kb-mini' })}</div>`;
  },

  chartDetail(note) {
    const black = note.includes('#') || note.includes('b');
    return {
      tip: black ? 'Siyah tuş: beyaz tuşların arasında, ikili ya da üçlü grupta.' : 'Beyaz tuş. İkili siyah tuşların solundaki tuş Do\'dur; oradan sayarak bul.',
      items: [`Klavyede: ${longName(note)}`, note === 'C4' ? 'Orta Do: piyanonun ortasına yakın Do' : `Orta Do\'nun ${midiOf(note) > 60 ? 'sağında (daha ince)' : 'solunda (daha kalın)'}`],
    };
  },
};
