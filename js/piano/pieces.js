// Piyano: parçalar. Kullanıcının gönderdiği notadan sağ el melodisi (üst ses), ritmiyle.
// Satır biçimi Egzersiz Yap ile aynı: 'A4:3 G4:.5 F4:.5 |' (süre dörtlük cinsinden), R sus, ~ bağ, ! korona,
// '5/4' gibi bir ölçü işareti sonraki notadan önce yazılır. Bağla uzayan nota yeniden çalınmaz; suslar sayılmaz.
// Akorlar ve iç sesler sadeleştirildi: her an yalnızca en üstteki melodi notası çalınır.

const ETERNAL_VOW_ROWS = [
  // Ölçü 1–8 (öncü vuruş Re ile başlar)
  'D4:1 | A4:3 G4:.5 F4:.5 | G4:3 G4:.5 D4:.5 |',
  'F4:1.5 C5:.5 E4:1.5 D4:.5 | C4:3 F4:.5 G4:.5 |',
  'A4:3 F4:.5 C5:.5 | G4:3 G4:.5 D4:.5 |',
  'F4:1 C5:1~ C5:.5 E5:1.5~ | E5:2 R:1 D4:1 ||',
  // Ölçü 9–16
  'A4:3 G4:.5 F4:.5 | G4:3 G4:.5 D4:.5 |',
  'F4:1.5 C5:.5 E4:1 C4:1 | C4:.5 D4:2.5 D5:.5 C5:.5 |',
  'A4:3 F4:.5 C5:.5 | G4:3 E4:.5 A3:.5 |',
  'C4:1.5 G4:.5 E4:1 D4:.5 C4:.5 | D4:3 D4:1 ||',
  // Ölçü 17–27
  'A4:3 G4:.5 F4:.5 | G4:3 G4:.5 D4:.5 |',
  'F4:1.5 C5:.5 E4:1 D4:1 | C4:3 F4:.5 G4:.5 |',
  'A4:3 F4:.5 C5:.5 | G4:3 G4:.5 D4:.5 |',
  'F4:1 C5:1~ C5:.5 E5:1.5~ | E5:2 F5:1 G5:1 |',
  'A5:2 G5:1 F5:1 | G5:3 G5:.5 D5:.5 |',
  '5/4 F5:1.5 C6:.5 E5:1! C5:1! R:1 ||',
  // Ölçü 28–40
  '4/4 R:.5 D4:.5 A4:.5 E5:.5 F5:2 | R:.5 Bb3:.5 A4:.5 E5:.5 F5:2 |',
  'R:.5 A3:.5 F4:.5 C5:.5~ C5:2 | R:.5 D4:.5 A4:.5 E5:.5 F5:2 |',
  'R:.5 D4:.5 A4:.5 E5:.5 F5:2 | R:.5 Bb3:.5 A4:.5 E5:.5 F5:2 |',
  'R:.5 A3:.5 E4:.5 G4:.5~ G4:2 | R:.5 D5:.5 A4:.5 E5:.5 F5:2 |',
  'R:.5 D4:.5 A4:.5 E5:.5 F5:2 | R:.5 Bb3:.5 A4:.5 E5:.5 F5:2 |',
  'R:.5 A3:.5 E4:.5 F4:.5 A4:2 | A4:2 D5:2 | A5:4! ||',
];

const VOW = {
  title: 'The Eternal Vow',
  credit: 'Tan Dun · Crouching Tiger, Hidden Dragon (Kaplan ve Ejderha) film müziği. Notası kullanıcının gönderdiği piyano düzenlemesinden; yalnızca sağ el melodisi.',
  tempo: '♩ = 120, serbest (Freely)',
};

const section = (id, short, from, to, rows, sig = '4/4') => ({
  id: `eternal-vow-${id}`,
  piece: 'eternal-vow',
  short,
  title: `${VOW.title} · ${short}`,
  focus: `Sağ el melodisi, ölçü ${from}–${to}. Notaları sırayla çal; bağlı nota (⌒) tekrar çalınmaz, suslarda bekle.`,
  mode: 'line',
  rhythm: true,
  sig,
  rows: rows.map((seq) => ({ clef: 'treble', seq })),
  metronome: true,
  bpm: 60,
});

export const PIECES = [
  { id: 'eternal-vow', ...VOW, parts: ['1', '2', '3', '4', 'tamami'].map((p) => `eternal-vow-${p}`) },
];

export const PIECE_EXERCISES = [
  section('1', '1. bölüm', 1, 8, ETERNAL_VOW_ROWS.slice(0, 4)),
  section('2', '2. bölüm', 9, 16, ETERNAL_VOW_ROWS.slice(4, 8)),
  section('3', '3. bölüm', 17, 27, ETERNAL_VOW_ROWS.slice(8, 14)),
  section('4', '4. bölüm', 28, 40, ETERNAL_VOW_ROWS.slice(14), null),
  { ...section('tamami', 'baştan sona', 1, 40, ETERNAL_VOW_ROWS), focus: 'Sağ el melodisi, bütün parça (40 ölçü). Bağlı nota (⌒) tekrar çalınmaz, suslarda bekle.' },
];
