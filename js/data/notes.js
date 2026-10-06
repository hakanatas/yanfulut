// Yan flüt notaları ve parmak pozisyonları (Boehm sistemi, standart parmaklar).
// Anahtarlar: th = sol başparmak, l1-l3 = sol el işaret/orta/yüzük,
// gs = sol serçe (Sol diyez), r1-r3 = sağ el işaret/orta/yüzük,
// eb = sağ serçe (Mi bemol), c = ayak kısmındaki pes Do anahtarı.

export const KEYS = ['th', 'l1', 'l2', 'l3', 'gs', 'r1', 'r2', 'r3', 'eb', 'c'];

export const KEY_NAMES = {
  th: 'Sol başparmak',
  l1: 'Sol işaret parmağı',
  l2: 'Sol orta parmak',
  l3: 'Sol yüzük parmağı',
  gs: 'Sol serçe parmak (Sol♯ anahtarı)',
  r1: 'Sağ işaret parmağı',
  r2: 'Sağ orta parmak',
  r3: 'Sağ yüzük parmağı',
  eb: 'Sağ serçe parmak (Mi♭ anahtarı)',
  c: 'Sağ serçe parmak (pes Do anahtarı)',
};

const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const STEP_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const f = (s) => new Set(s.split(' ').filter(Boolean));

// Kayıtlar (registerlar): ince oktav notaları pes oktavın parmaklarıyla,
// daha hızlı ve dar bir hava akımıyla (üfleyerek bir üst oktava çıkarak) çalınır.
const FINGERINGS = {
  C4: f('th l1 l2 l3 r1 r2 r3 c'),
  D4: f('th l1 l2 l3 r1 r2 r3'),
  Eb4: f('th l1 l2 l3 r1 r2 r3 eb'),
  E4: f('th l1 l2 l3 r1 r2 eb'),
  F4: f('th l1 l2 l3 r1 eb'),
  'F#4': f('th l1 l2 l3 r3 eb'),
  G4: f('th l1 l2 l3 eb'),
  'G#4': f('th l1 l2 l3 gs eb'),
  A4: f('th l1 l2 eb'),
  Bb4: f('th l1 r1 eb'),
  B4: f('th l1 eb'),
  C5: f('l1 eb'),
  'C#5': f('eb'),
  D5: f('th l2 l3 r1 r2 r3'),
  Eb5: f('th l2 l3 r1 r2 r3 eb'),
  E5: f('th l1 l2 l3 r1 r2 eb'),
  F5: f('th l1 l2 l3 r1 eb'),
  'F#5': f('th l1 l2 l3 r3 eb'),
  G5: f('th l1 l2 l3 eb'),
  'G#5': f('th l1 l2 l3 gs eb'),
  A5: f('th l1 l2 eb'),
  Bb5: f('th l1 r1 eb'),
  B5: f('th l1 eb'),
  C6: f('l1 eb'),
};

const TIPS = {
  D5: 'Pes Re ile aynı, yalnızca sol işaret parmağını kaldır.',
  E5: 'Pes Mi ile aynı parmaklar; havayı biraz daha hızlı ve dar üfle.',
  F5: 'Pes Fa ile aynı parmaklar; hava akımını hızlandır.',
  G5: 'Pes Sol ile aynı parmaklar; dudak açıklığını küçült.',
  A5: 'Pes La ile aynı parmaklar; hava akımını yukarı yönlendir.',
  B5: 'Si ile aynı parmaklar; hızlı ve ince bir hava akımı.',
  C6: 'İnce Do ile aynı parmaklar; bir oktav yukarı üfle.',
  C4: 'Flütün en pes notası: tüm delikler kapalı, serçe parmak ayaktaki Do anahtarında.',
  D4: 'Bütün delikleri kapat, sağ serçe parmak havada kalsın.',
};

export function parseNote(id) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(id);
  if (!m) throw new Error(`Geçersiz nota: ${id}`);
  const [, letter, acc, oct] = m;
  const octave = Number(oct);
  const alter = acc === '#' ? 1 : acc === 'b' ? -1 : 0;
  return { letter, alter, octave };
}

export function midiOf(id) {
  const { letter, alter, octave } = parseNote(id);
  return 12 * (octave + 1) + SEMITONE[letter] + alter;
}

export function freqOf(id) {
  return 440 * Math.pow(2, (midiOf(id) - 69) / 12);
}

// Porte üzerindeki diyatonik konum (Mi4 = alt çizgi = 0).
export function staffStep(id) {
  const { letter, octave } = parseNote(id);
  return (octave - 4) * 7 + STEP_INDEX[letter] - STEP_INDEX.E;
}

/** "Si", "Fa♯", "Do'" gibi kısa ad. İnce oktav (Do5 ve üstü) kesme işaretiyle, kalın oktav (Do3–Si3) virgülle gösterilir. */
export function shortName(id) {
  const { letter, alter, octave } = parseNote(id);
  const acc = alter === 1 ? '♯' : alter === -1 ? '♭' : '';
  const marks = octave >= 6 ? "''" : octave === 5 ? "'" : octave <= 3 ? ',' : '';
  return SOLFEGE[letter] + acc + marks;
}

/** Flüt için oktav adları: "pes Re", "ince Re"; orta bölge (Sol4–Si4) sade */
function fluteRegister(id, octave) {
  if (['G4', 'G#4', 'A4', 'Bb4', 'B4'].includes(id)) return '';
  return octave >= 6 ? 'tiz ' : octave === 5 ? 'ince ' : 'pes ';
}
let registerName = fluteRegister;

/** Enstrüman, oktav adlandırmasını değiştirebilir (ör. keman: "kalın Sol", "Sol", "ince Mi"). */
export function setRegisterNaming(fn) {
  registerName = fn || fluteRegister;
}

/** "ince Re", "pes Re", "Si" gibi okunabilir ad. */
export function longName(id) {
  const { letter, alter, octave } = parseNote(id);
  const acc = alter === 1 ? ' diyez' : alter === -1 ? ' bemol' : '';
  return registerName(id, octave) + SOLFEGE[letter] + acc;
}

/** Başlıklar için büyük harfle başlayan ad: "İnce Re" */
export function titleName(id) {
  const n = longName(id);
  return n.charAt(0).toLocaleUpperCase('tr') + n.slice(1);
}

export function fingeringOf(id) {
  const keys = FINGERINGS[id];
  if (!keys) throw new Error(`Parmak pozisyonu yok: ${id}`);
  return keys;
}

export function tipOf(id) {
  return TIPS[id] || '';
}

export const ALL_NOTES = Object.keys(FINGERINGS).sort((a, b) => midiOf(a) - midiOf(b));

/** MIDI numarasından nota kimliği (diyez yazımla). */
export function noteFromMidi(midi) {
  const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  return names[((midi % 12) + 12) % 12] + octave;
}
