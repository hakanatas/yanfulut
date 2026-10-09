// "Egzersiz Yap": çalışma kağıdındaki (Ünite 1–5) egzersizler, satır satır.
// Nokta birleştirme yok; amaç notayı ve süresini doğru çalmak.
//
// Yazım: her satır bir dizgedir; "|" ölçü çizgisi, "||" çift çizgi.
//   B4:2   Si, 2 vuruş (4 birlik, 3 noktalı ikilik, 2 ikilik, 1 dörtlük)
//   R:2    2 vuruşluk sus (ölçünün tamamı kadar sus, tam ölçü susu olarak çizilir)
//   B4:2!  korona (𝄐): nota yazılandan uzun tutulur
//   A4~    bağ: sonraki aynı notaya bağlanır, dil vurmadan tek nota gibi çalınır
// Her ünite yeni notalarını "newNotes" ile tanıtır; egzersizler yalnızca o üniteye kadar tanıtılan
// notaları kullanır (tools/check-course.mjs denetler).

export const SOURCE = 'Learn As You Play Flute çalışma kağıdı, Ünite 1–5';

export const UNITS = [
  {
    id: 'unite-1',
    title: 'Ünite 1',
    subtitle: 'Sol, La, Si, ince Do · ikilik ve dörtlük',
    newNotes: ['G4', 'A4', 'B4', 'C5'],
    concepts: [
      { sym: '𝅗𝅥', title: 'İkilik nota', text: 'İçi boş, saplı nota: 2 vuruş tutulur. "Bir-iki" diye sayarken ses kesilmez.' },
      { sym: '♩', title: 'Dörtlük nota', text: 'İçi dolu, saplı nota: 1 vuruş. Her notayı "tu" diyerek dille ayrı başlat.' },
      { sym: '4/4', title: 'Dört dörtlük ölçü', text: 'Her ölçüde 4 vuruş var. Ölçü çizgileri vuruşları dörder dörder ayırır.' },
    ],
    exercises: [
      { id: 'u1-e1', title: 'Egzersiz 1', focus: 'Si ve La ikilikleri', time: 4, bpm: 72, rows: ['B4:2 B4:2 | A4:2 A4:2 | B4:2 B4:2 | A4:2 A4:2 | B4:2 B4:2'] },
      { id: 'u1-e2', title: 'Egzersiz 2', focus: 'Si ve ince Do ikilikleri', time: 4, bpm: 72, rows: ['B4:2 B4:2 | C5:2 C5:2 | B4:2 B4:2 | C5:2 C5:2 | B4:2 B4:2'] },
      {
        id: 'u1-e3',
        title: 'Egzersiz 3',
        focus: 'Dört nota, ikiliklerle',
        time: 4,
        bpm: 72,
        rows: ['B4:2 A4:2 | G4:2 A4:2 | B4:2 B4:2 || C5:2 B4:2 | A4:2 B4:2 | C5:2 C5:2', 'B4:2 A4:2 | G4:2 A4:2 | B4:2 C5:2 | B4:2 A4:2 | G4:2 G4:2'],
      },
      {
        id: 'u1-e4',
        title: 'Egzersiz 4',
        focus: 'Dörtlükler: her vuruşa bir nota',
        time: 4,
        bpm: 76,
        rows: ['B4 B4 A4 A4 | G4 G4 A4 A4 | B4 B4 C5 C5 | A4:2 A4:2', 'C5 C5 B4 B4 | A4 A4 B4 B4 | A4 A4 G4 G4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e5',
        title: 'Egzersiz 5',
        focus: 'İkilik ve dörtlük karışık',
        time: 4,
        bpm: 76,
        rows: ['G4:2 A4 B4 | A4:2 B4 C5 | B4:2 G4 B4 | A4:2 A4:2', 'C5:2 A4 C5 | B4:2 G4 B4 | A4:2 B4 A4 | G4:2 G4:2'],
      },
      {
        id: 'u1-ninni',
        title: 'Saint Margarita Ninnisi',
        focus: 'Geleneksel Fransız ezgisi · orta hızda',
        time: 4,
        bpm: 80,
        rows: ['B4:2 A4 G4 | B4:2 G4:2 | B4 C5 B4 A4 | B4:2 G4:2', 'B4 C5 B4 A4 | G4 B4 A4:2 | B4 C5 B4 A4 | G4:2 G4:2'],
      },
      {
        id: 'u1-gece',
        title: 'Gece Şarkısı',
        focus: 'Geleneksel Fransız ezgisi (Chanson de nuit) · oldukça yavaş',
        time: 4,
        bpm: 66,
        rows: ['B4:2 G4:2 | B4 B4 G4:2 | A4 B4 C5 B4 | A4 A4 B4 G4', 'B4:2 G4:2 | B4 B4 G4:2 | A4 B4 C5 B4 | A4 A4 G4:2'],
      },
    ],
  },
  {
    id: 'unite-2',
    title: 'Ünite 2',
    subtitle: 'Korona, sus işaretleri ve 3/4 ölçü',
    newNotes: [],
    concepts: [
      { sym: '𝄐', title: 'Korona (durak)', text: 'Notanın üstündeki yay ve nokta: vuruş durur, notayı yazılandan daha uzun tutarsın. Burada ilk notayı rahatça bulman için kullanılıyor.' },
      { sym: '𝄽', title: 'Dörtlük sus', text: '1 vuruş sessizlik. Susarken de saymaya devam et.' },
      { sym: '𝄼', title: 'İkilik sus', text: '2 vuruş sessizlik: üçüncü çizginin üstüne oturan küçük kutu.' },
      { sym: '3/4', title: 'Üç dörtlük ölçü', text: 'Her ölçüde 3 vuruş: "bir-iki-üç, bir-iki-üç".' },
    ],
    exercises: [
      {
        id: 'u2-e1',
        title: 'Egzersiz 1',
        focus: 'Dörtlük sus ile nefes al',
        time: 4,
        bpm: 76,
        rows: ['B4:2! R:2 || B4 A4 B4 R:1 | A4 B4 A4 R:1 | A4 B4 C5 R:1', 'B4:2 R:2 | C5 B4 A4 R:1 | B4 A4 G4 R:1 | A4 B4 A4 R:1 | G4:2 R:2'],
      },
      {
        id: 'u2-e2',
        title: 'Egzersiz 2',
        focus: '3/4 ölçü: üçer vuruş',
        time: 3,
        bpm: 80,
        rows: ['B4:2! R:1 || B4 A4 B4 | A4:2 R:1 | A4 B4 C5', 'B4:2 R:1 | B4 A4 G4 | A4:2 R:1 | A4 B4 A4 | G4:2 R:1'],
      },
      {
        id: 'u2-e3',
        title: 'Egzersiz 3',
        focus: 'İkilik sus: iki vuruş say',
        time: 4,
        bpm: 76,
        rows: ['B4:2! R:2 || B4 A4 B4 A4 | G4:2 R:2 | A4 B4 C5 B4', 'A4:2 R:2 | G4 A4 B4 C5 | B4:2 R:2 | B4 A4 B4 A4 | G4:2 R:2'],
      },
      {
        id: 'u2-ton',
        title: 'Uzun Ses Çalışması',
        focus: 'Her korona notasını dolgun ve eşit bir sesle tut',
        time: 4,
        bpm: 66,
        rows: ['B4:2! R:2 || A4:2! R:2 || C5:2! R:2 || A4:2! R:2', 'G4:2! R:2 || B4:2! R:2 || A4:2! R:2'],
      },
    ],
  },
  {
    id: 'unite-3',
    title: 'Ünite 3',
    subtitle: 'Fa ve pes Mi · noktalı ikilik',
    newNotes: ['F4', 'E4'],
    concepts: [
      { sym: '𝅗𝅥.', title: 'Noktalı ikilik', text: 'Notanın yanındaki nokta, süresine yarısını ekler: 2 + 1 = 3 vuruş.' },
      { sym: 'Fa', title: 'Fa', text: 'Sol el üç parmak kapalı, sağ el yalnızca işaret parmağı kapalı; sağ serçe Mi♭ anahtarında.' },
      { sym: 'Mi', title: 'Pes Mi', text: 'Fa\'ya ek olarak sağ orta parmağı da kapat. Havayı yavaş ve geniş üfle.' },
    ],
    exercises: [
      {
        id: 'u3-e1',
        title: 'Egzersiz 1',
        focus: 'Noktalı ikilik: 3 vuruş tut',
        time: 4,
        bpm: 76,
        rows: ['F4:2! R:2 || A4:3 R:1 | G4:3 R:1 | F4:3 R:1 | G4:3 R:1 | F4:3 R:1', 'G4:3 R:1 | A4:3 R:1 | C5:3 R:1 | G4:3 R:1 | A4:3 R:1 | F4:3 R:1'],
      },
      {
        id: 'u3-e2',
        title: 'Egzersiz 2',
        focus: 'Aynı notayı dille ayır',
        time: 4,
        bpm: 76,
        rows: ['F4:2! R:2 || A4 A4 A4 R:1 | G4 G4 G4 R:1 | F4 F4 F4 R:1', 'G4:3 R:1 | F4 F4 F4 R:1 | A4 A4 A4 R:1 | G4 G4 G4 R:1 | F4:4'],
      },
      {
        id: 'u3-e3',
        title: 'Egzersiz 3',
        focus: 'Pes Mi ile tanış',
        time: 4,
        bpm: 72,
        rows: ['E4:2! R:2 || F4:3 A4 | G4:3 C5 | A4 F4 E4 F4', 'G4:3 R:1 | G4:3 C5 | A4:3 F4 | E4 A4 G4 G4 | F4:4'],
      },
      {
        id: 'u3-e4',
        title: 'Egzersiz 4',
        focus: 'Beş nota dörtlüklerle',
        time: 4,
        bpm: 76,
        rows: ['E4:2! R:2 || A4 G4 F4 E4 | F4 G4 A4 F4 | G4 F4 E4 F4', 'G4:3 R:1 | F4 E4 F4 G4 | A4 C5 A4 F4 | E4 F4 G4 G4 | F4:4'],
      },
      {
        id: 'u3-koral',
        title: 'Koral Ezgisi',
        focus: '16. yüzyıl Alman ezgisi · koronalarda nefes al',
        time: 4,
        pickup: 1,
        bpm: 76,
        rows: ['C5 | B4 A4 B4 G4 | A4 B4 C5! C5 | C5 G4 G4 E4 | G4 F4 E4! E4', 'A4 A4 G4 B4 | C5 A4 G4! C5 | B4 A4 G4 C5 | C5 B4 C5!'],
      },
    ],
  },
  {
    id: 'unite-4',
    title: 'Ünite 4',
    subtitle: 'Tam ölçü sus, bağ ve 2/4 ölçü',
    newNotes: [],
    concepts: [
      { sym: '𝄻', title: 'Tam ölçü sus', text: 'Dördüncü çizgiden sarkan kutu: ölçünün tamamı kadar sus. 4/4\'te 4, 3/4\'te 3, 2/4\'te 2 vuruş say.' },
      { sym: '⁀', title: 'Bağ', text: 'Aynı yükseklikteki iki notayı birleştiren yay: ikinci notayı dille başlatma, tek ve uzun bir nota gibi çal.' },
      { sym: '2/4', title: 'İki dörtlük ölçü', text: 'Her ölçüde 2 vuruş: "bir-iki, bir-iki".' },
    ],
    exercises: [
      {
        id: 'u4-e1',
        title: 'Egzersiz 1',
        focus: '2/4 ölçü ve tam ölçü sus',
        time: 2,
        bpm: 80,
        rows: ['C5! R:1 || C5 B4 | A4 B4 | C5:2 | R:2 | A4 F4 | C5 A4 | G4:2', 'R:2 | F4 E4 | F4 G4 | A4:2 | R:2 | G4 C5 | C5 B4 | C5:2~ | C5 R:1'],
      },
      {
        id: 'u4-e2',
        title: 'Egzersiz 2',
        focus: '3/4 ölçüde bağlı notalar',
        time: 3,
        bpm: 80,
        rows: ['C5:2! R:1 || C5 A4 F4 | G4:2 A4~ | A4 G4 G4 | F4:3', 'R:3 | C5 A4 F4 | G4:2 A4~ | A4 C5 C5 | F4:3'],
      },
      {
        id: 'u4-e3',
        title: 'Egzersiz 3',
        focus: 'Bağ: ikinci notada dil vurma',
        time: 4,
        bpm: 80,
        rows: ['C5:2! R:2 || C5 C5 A4 F4 | E4 G4 E4 G4~ | G4 A4 G4 G4 | F4:2 R:2', 'R:4 | C5 C5 A4 F4 | E4 G4 E4 G4~ | G4 C5 C5 C5 | F4:4'],
      },
      {
        id: 'u4-ton',
        title: 'Uzun Ses Çalışması',
        focus: 'Üst dudak sabit, alt dudak gevşek; koronayı olabildiğince uzun tut',
        time: 4,
        bpm: 66,
        rows: ['B4:2 A4:2 | B4:2! R:2 || A4:2 G4:2 | A4:2! R:2', 'G4:2 F4:2 | G4:2! R:2 || F4:2 E4:2 | F4:2! R:2'],
      },
    ],
  },
  {
    id: 'unite-5',
    title: 'Ünite 5',
    subtitle: 'Si bemol ve ince Re',
    newNotes: ['Bb4', 'D5'],
    concepts: [
      { sym: '♭', title: 'Bemol', text: 'Bemol işareti notayı yarım ses pesleştirir. Si♭ için Si parmaklarına ek olarak sağ işaret parmağını da kapat.' },
      { sym: 'Re\'', title: 'İnce Re', text: 'Sol işaret parmağı açık; sol orta, yüzük ve sağ elin üç parmağı kapalı. Serçe parmak havada.' },
    ],
    exercises: [
      {
        id: 'u5-e1',
        title: 'Egzersiz 1',
        focus: 'Si bemol ikilikleri',
        time: 4,
        bpm: 72,
        rows: ['Bb4:2! R:2 || A4:2 R:2 | Bb4:2 R:2 | C5:2 R:2 | Bb4:2 R:2', 'C5:2 R:2 | A4:2 R:2 | Bb4:2 R:2 | G4:2 R:2 | F4:4'],
      },
      {
        id: 'u5-e2',
        title: 'Egzersiz 2',
        focus: 'Si bemol dörtlüklerde',
        time: 4,
        bpm: 76,
        rows: ['Bb4:2! R:2 || A4 Bb4 C5 A4 | C5 A4 F4 A4 | C5 A4 F4 A4', 'G4:2 R:2 | E4 G4 Bb4 G4 | Bb4 G4 E4 G4 | Bb4 G4 F4 E4 | F4:4'],
      },
      {
        id: 'u5-e3',
        title: 'Egzersiz 3',
        focus: 'İnce Re\'den aşağı atlamalar',
        time: 4,
        bpm: 72,
        rows: ['D5:2! R:2 || D5:2 C5 R:1! | D5:2 Bb4 R:1! | D5:2 A4 R:1!', 'D5:3 R:1! | D5:2 Bb4 R:1! | D5:2 A4 R:1! | D5:2 G4 R:1! | D5:4'],
      },
    ],
  },
];

/** Satır dizgesini öğelere çevirir: {rest, note, beats, fermata, tie, bar} — bar: öğeden sonra gelen çizgi */
export function parseRow(str) {
  const items = [];
  for (const tok of str.trim().split(/\s+/)) {
    if (tok === '|' || tok === '||') {
      if (items.length) items[items.length - 1].bar = tok === '||' ? 'double' : 'single';
      continue;
    }
    const m = /^([A-G][#b]?\d|R)(?::([\d.]+))?(!?)(~?)$/.exec(tok);
    if (!m) throw new Error(`Geçersiz egzersiz öğesi: ${tok}`);
    const [, name, beats, fermata, tie] = m;
    items.push({ rest: name === 'R', note: name === 'R' ? null : name, beats: beats ? Number(beats) : 1, fermata: !!fermata, tie: !!tie, bar: null });
  }
  return items;
}

/** Bir egzersizi satırlarıyla birlikte hazırlar */
export function prepareExercise(ex) {
  const rows = ex.rows.map(parseRow);
  rows[rows.length - 1].at(-1).bar = 'final';
  return { ...ex, parsed: rows };
}

export const EXERCISES = UNITS.flatMap((u) => u.exercises.map((e) => ({ ...e, unit: u.id })));
