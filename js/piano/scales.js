// Piyano: Trinity Grade 3 gamları (kızının sınav kitabı, s. 5–8).
//  - Gamlar, iki oktav: Mi, Si, Si♭, Mi♭, La♭, Re♭ majör; Si, Sol, Do, Fa armonik ve melodik minör.
//    Eller ayrı ve birlikte, piano ve forte, ♩ = 96 (her vuruşa iki nota).
//  - Zıt yön gamları, iki oktav, iki el birlikte: Sol ve Re majör, La armonik minör.
// Parmak numaraları kitaptan alındı (kitapta yazılı olanlar ve aralarındaki sıra). Notalar doğru yazılır (Mi♯, La♭…).
// Her gam, kitaptaki gibi oktav oktav satırlara bölünür; sol elin üst oktavı sol anahtarında yazılır.

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const MAJOR = [2, 2, 1, 2, 2, 2, 1];
const HARMONIC = [2, 1, 2, 2, 1, 3, 1];
const MELODIC_UP = [2, 1, 2, 2, 2, 2, 1];
const NATURAL = [2, 1, 2, 2, 1, 2, 2];

export const EXAM_BPM = 96;

const midiOfName = (n) => {
  const m = /^([A-G])([#b]?)(\d)$/.exec(n);
  return 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};

/** Tonik ve aralıklardan doğru yazılmış nota dizisi (her harf bir kez). dir -1: aşağı doğru */
function spell(tonic, steps, octaves = 2, dir = 1) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(tonic);
  let [letter, oct] = [m[1], Number(m[3])];
  let midi = midiOfName(tonic);
  const out = [tonic];
  const seq = dir > 0 ? steps : [...steps].reverse();
  for (let k = 0; k < seq.length * octaves; k++) {
    midi += dir * seq[k % seq.length];
    let li = LETTERS.indexOf(letter) + dir;
    if (li === 7) (li = 0), oct++;
    if (li === -1) (li = 6), oct--;
    letter = LETTERS[li];
    const diff = midi - midiOfName(`${letter}${oct}`);
    out.push(`${letter}${diff === 1 ? '#' : diff === -1 ? 'b' : ''}${oct}`);
  }
  return out;
}

/** Sol el satırına uygun anahtar: ortalaması Re4'e yakın ya da üstündeyse sol anahtarı (kitaptaki gibi) */
const clefFor = (notes) => (notes.reduce((s, n) => s + midiOfName(n), 0) / notes.length >= 62 ? 'treble' : 'bass');
const shift = (n, d) => n.replace(/\d$/, (o) => String(Number(o) + d));

/**
 * İki oktav çıkış + iniş (29 nota) dört satıra: çıkış 1. oktav (8), çıkış 2. oktav (7), iniş (7), iniş (7).
 * up/down: 15'er nota (down tepeden aşağı); f: çıkış parmakları (iniş aynı parmaklarla geri gelir).
 * lhUp/lhDown/lf verilirse iki el: sol el notaları partner olarak alt portede.
 */
function rowsOf(up, down, f, lhUp, lhDown, lf, { leftHand = false } = {}) {
  const cuts = [
    [up, 0, 8, false],
    [up, 8, 15, false],
    [down, 1, 8, true],
    [down, 8, 15, true],
  ];
  return cuts.map(([src, a, b, isDown], k) => {
    const notes = src.slice(a, b);
    // İnişteki k. nota, çıkıştaki (14-k). notanın parmağıyla çalınır
    const idx = notes.map((_, j) => (isDown ? 14 - (a + j) : a + j));
    const row = { clef: leftHand ? clefFor(notes) : 'treble', notes: notes.join(' '), fingers: f && idx.map((i) => f[i]) };
    if (lhUp) {
      const lh = (isDown ? lhDown : lhUp).slice(a, b);
      Object.assign(row, { partner: lh.join(' '), partnerClef: clefFor(lh), partnerFingers: lf && idx.map((i) => lf[i]) });
    }
    return row;
  });
}

// Kitaptaki parmaklar (çıkış, 15 nota). Sol el: en alttan başlayarak.
const STD_RH = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_C = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const LH_B = [4, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1];
const LH_FLAT = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 2];

export const KEYS = [
  { id: 'mi-majör', name: 'Mi majör', tonic: 'E4', type: 'major', rh: STD_RH, lh: LH_C, tip: 'Dört diyez: Fa♯, Do♯, Sol♯, Re♯. Parmaklar Do majörle aynı.' },
  { id: 'si-majör', name: 'Si majör', tonic: 'B3', type: 'major', rh: STD_RH, lh: LH_B, tip: 'Beş diyez: Fa♯, Do♯, Sol♯, Re♯, La♯. Sol el 4. parmakla başlar; başparmaklar Si ve Mi\'de.' },
  { id: 'sib-majör', name: 'Si bemol majör', tonic: 'Bb3', type: 'major', rh: [2, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4], lh: LH_FLAT, tip: 'İki bemol: Si♭, Mi♭. Sağ el 2. parmakla, sol el 3. parmakla başlar. Sağ el 4. parmak her zaman Si♭\'de.' },
  { id: 'mib-majör', name: 'Mi bemol majör', tonic: 'Eb4', type: 'major', rh: [2, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3], lh: LH_FLAT, tip: 'Üç bemol: Si♭, Mi♭, La♭. Sağ el 2. parmakla başlar; 4. parmak her zaman Si♭\'de. Sol el 3. parmakla başlar.' },
  { id: 'lab-majör', name: 'La bemol majör', tonic: 'Ab3', type: 'major', rh: [2, 3, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3], lh: LH_FLAT, tip: 'Dört bemol: Si♭, Mi♭, La♭, Re♭. Sağ el 2-3 ile başlar, başparmak Do ve Fa\'da; 4. parmak Si♭\'de.' },
  { id: 'reb-majör', name: 'Re bemol majör', tonic: 'Db4', type: 'major', rh: [2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2], lh: LH_FLAT, tip: 'Beş bemol: Si♭, Mi♭, La♭, Re♭, Sol♭. Başparmaklar yalnızca beyaz tuşlarda (Fa ve Do). Sağ el 4. parmak Si♭\'de, sol el 4. parmak Sol♭\'de.' },
  { id: 'si-minör', name: 'Si minör', tonic: 'B3', type: 'minor', rh: STD_RH, lh: LH_B, tip: 'İki diyez: Fa♯, Do♯. Armonikte 7. ses La♯; melodikte çıkarken Sol♯ ve La♯, inerken La ve Sol doğal. Sol el 4. parmakla başlar.' },
  { id: 'sol-minör', name: 'Sol minör', tonic: 'G3', type: 'minor', rh: STD_RH, lh: LH_C, tip: 'İki bemol: Si♭, Mi♭. Armonikte 7. ses Fa♯; melodikte çıkarken Mi doğal ve Fa♯, inerken Fa doğal ve Mi♭.' },
  { id: 'do-minör', name: 'Do minör', tonic: 'C4', type: 'minor', rh: STD_RH, lh: LH_C, tip: 'Üç bemol: Si♭, Mi♭, La♭. Armonikte 7. ses Si doğal; melodikte çıkarken La ve Si doğal, inerken Si♭ ve La♭.' },
  { id: 'fa-minör', name: 'Fa minör', tonic: 'F3', type: 'minor', rh: [1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4], lh: LH_C, tip: 'Dört bemol: Si♭, Mi♭, La♭, Re♭. Armonikte 7. ses Mi doğal; melodikte çıkarken Re ve Mi doğal, inerken Mi♭ ve Re♭. Sağ el 4. parmak Si♭\'de.' },
];

/** Zıt yön gamları: iki el aynı notadan başlar, sağ el çıkar, sol el iner (iki oktav) */
export const CONTRARY = [
  { id: 'sol-majör-zit', name: 'Sol majör', tonic: 'G4', steps: MAJOR },
  { id: 're-majör-zit', name: 'Re majör', tonic: 'D4', steps: MAJOR },
  { id: 'la-minör-zit', name: 'La armonik minör', tonic: 'A3', steps: HARMONIC },
];
// Zıt yönde iki el de aynı parmak sırasıyla gider (sağ el yukarı, sol el aşağı)

/** Kızının sınav seçimi (kitaba elle yazılmış sıralama) */
export const EXAM_PICKS = [
  { id: 'sib-majör-sag', note: 'forte' },
  { id: 'reb-majör-sol', note: 'forte' },
  { id: 'sol-majör-zit', note: 'forte' },
  { id: 'si-minör-armonik-sol', note: 'forte' },
  { id: 'do-minör-melodik-sag', note: 'piano' },
  { id: 'fa-minör-armonik-iki-el', note: 'piano' },
];

const tempo = { metronome: true, bpm: 60, examBpm: EXAM_BPM };
const dyn = 'Bir kez piano (yumuşak), bir kez forte (güçlü) çal.';

function exercisesOf(key) {
  const minor = key.type === 'minor';
  const forms = minor
    ? [
        { id: '-armonik', label: 'armonik', up: HARMONIC, down: HARMONIC },
        { id: '-melodik', label: 'melodik', up: MELODIC_UP, down: NATURAL },
      ]
    : [{ id: '', label: '', up: MAJOR, down: MAJOR }];
  const out = [];
  for (const f of forms) {
    const name = `${key.name}${f.label ? ` (${f.label})` : ''}`;
    const pre = f.label ? `${f.label}, ` : '';
    const top = shift(key.tonic, 2);
    const rhUp = spell(key.tonic, f.up);
    const rhDown = spell(top, f.down, 2, -1);
    const lhUp = rhUp.map((n) => shift(n, -1));
    const lhDown = rhDown.map((n) => shift(n, -1));
    out.push({ id: `${key.id}${f.id}-sag`, short: `${pre}sağ el`, title: `${name} · sağ el`, focus: `İki oktav çık ve in. ${dyn}`, mode: 'line', rows: rowsOf(rhUp, rhDown, key.rh), ...tempo });
    out.push({ id: `${key.id}${f.id}-sol`, short: `${pre}sol el`, title: `${name} · sol el`, focus: `İki oktav çık ve in; üst oktav sol anahtarında. ${dyn}`, mode: 'line', rows: rowsOf(lhUp, lhDown, key.lh, null, null, null, { leftHand: true }), ...tempo });
    out.push({
      id: `${key.id}${f.id}-iki-el`,
      short: `${pre}iki el`,
      title: `${name} · iki el birlikte`,
      focus: `İki el aynı anda, bir oktav arayla. ${dyn}`,
      mode: 'line',
      together: true,
      rows: rowsOf(rhUp, rhDown, key.rh, lhUp, lhDown, key.lh),
      ...tempo,
    });
  }
  return out.map((e) => ({ ...e, key: key.id }));
}

function contraryOf(c) {
  const top = shift(c.tonic, 2);
  const bottom = shift(c.tonic, -2);
  const rhUp = spell(c.tonic, c.steps);
  const rhDown = spell(top, c.steps, 2, -1);
  const lhDown = spell(c.tonic, c.steps, 2, -1); // sol el aşağı
  const lhUp = spell(bottom, c.steps); // ve geri
  // Satırlar: sağ el çıkarken sol el iner (rhUp ↔ lhDown), sonra tersi
  const f = STD_RH; // iki elde de 1 2 3 1 2 3 4 1 2 3 1 2 3 4 5 (kitaptaki gibi)
  const rows = rowsOf(rhUp, rhDown, f, lhDown, lhUp, f);
  return {
    id: c.id,
    short: 'zıt yön, iki el',
    title: `${c.name} · zıt yön`,
    focus: `İki el aynı notadan başlar: sağ el çıkar, sol el iner, sonra geri gelir. ${dyn}`,
    mode: 'line',
    together: true,
    rows,
    ...tempo,
    key: 'zit-yon',
  };
}

export const SCALE_EXERCISES = [...KEYS.flatMap(exercisesOf), ...CONTRARY.map(contraryOf)];
export const SCALE_GROUPS = [
  ...KEYS.map((k) => ({ id: k.id, name: k.name, tip: k.tip })),
  { id: 'zit-yon', name: 'Zıt yön gamları', tip: 'Sol majör, Re majör ve La armonik minör; iki oktav, iki el birlikte. İki el aynı notadan (iki başparmak) başlar ve aynı parmak numaralarıyla birbirinden uzaklaşır.' },
];
export const keyName = (id) => SCALE_GROUPS.find((k) => k.id === id)?.name;
