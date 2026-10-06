// Keman: teller ve 1. pozisyon parmak yerleri.
// Teller kalından inceye: Sol (G3), Re (D4), La (A4), Mi (E5) — aralarında tam beşli.
// Parmaklar: 0 = boş tel, 1 = işaret, 2 = orta, 3 = yüzük, 4 = serçe.
// "alçak 2" 1. parmağa yapışık, "yüksek 2" 3. parmağa yapışık durur (yarım ses farkı).
import { midiOf } from '../data/notes.js';

export const STRINGS = [
  { id: 'G', name: 'Sol', open: 'G3' },
  { id: 'D', name: 'Re', open: 'D4' },
  { id: 'A', name: 'La', open: 'A4' },
  { id: 'E', name: 'Mi', open: 'E5' },
];

// nota: [tel, parmak, boş telden yarım ses uzaklığı, 'low' | 'high' | undefined]
const FINGERINGS = {
  G3: ['G', 0, 0],
  Ab3: ['G', 1, 1, 'low'],
  A3: ['G', 1, 2],
  Bb3: ['G', 2, 3, 'low'],
  B3: ['G', 2, 4, 'high'],
  C4: ['G', 3, 5],
  D4: ['D', 0, 0],
  Eb4: ['D', 1, 1, 'low'],
  E4: ['D', 1, 2],
  F4: ['D', 2, 3, 'low'],
  'F#4': ['D', 2, 4, 'high'],
  G4: ['D', 3, 5],
  A4: ['A', 0, 0],
  Bb4: ['A', 1, 1, 'low'],
  B4: ['A', 1, 2],
  C5: ['A', 2, 3, 'low'],
  'C#5': ['A', 2, 4, 'high'],
  D5: ['A', 3, 5],
  E5: ['E', 0, 0],
  F5: ['E', 1, 1, 'low'],
  'F#5': ['E', 1, 2],
  G5: ['E', 2, 3, 'low'],
  'G#5': ['E', 2, 4, 'high'],
  A5: ['E', 3, 5],
  B5: ['E', 4, 7],
};

export const VIOLIN_NOTES = Object.keys(FINGERINGS).sort((a, b) => midiOf(a) - midiOf(b));

export function violinFingering(id) {
  const f = FINGERINGS[id];
  if (!f) throw new Error(`Keman parmak yeri yok: ${id}`);
  const [string, finger, semis, kind] = f;
  return { string, stringName: STRINGS.find((s) => s.id === string).name, finger, semis, kind };
}

const FINGER_NAMES = ['boş tel', '1. parmak (işaret)', '2. parmak (orta)', '3. parmak (yüzük)', '4. parmak (serçe)'];

export function fingerText({ finger, kind }) {
  if (finger === 2 && kind) return `${FINGER_NAMES[2]}, ${kind === 'low' ? 'alçak' : 'yüksek'}`;
  if (finger === 1 && kind === 'low') return `${FINGER_NAMES[1]}, alçak`;
  return FINGER_NAMES[finger];
}

export function violinTip(id) {
  const f = violinFingering(id);
  if (f.finger === 0) return `${f.stringName} telini boş çal: hiçbir parmak basmadan yayı düz çek.`;
  if (f.finger === 2 && f.kind === 'high') return 'Yüksek 2: orta parmağın 3. parmağa yapışık dursun.';
  if (f.finger === 2 && f.kind === 'low') return 'Alçak 2: orta parmağın 1. parmağa yapışık dursun.';
  if (f.finger === 1 && f.kind === 'low') return 'Alçak 1: işaret parmağın, burgulara doğru, üst eşiğe çok yakın bassın.';
  if (f.finger === 4) return `Serçe parmak, bir sonraki telin boş sesiyle aynı notayı verir.`;
  return `${f.stringName} telinde ${fingerText(f)}: parmak ucunla, teli tam bastır.`;
}

/** Keman için oktav adları: Sol3–Si3 "kalın", 4. oktav sade, 5. oktav "ince" */
export function violinRegister(id, octave) {
  return octave >= 6 ? 'tiz ' : octave === 5 ? 'ince ' : octave <= 3 ? 'kalın ' : '';
}
