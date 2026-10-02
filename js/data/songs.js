// Nota Noktaları şarkıları. Her nota resmin bir noktasıdır; doğru notayı çaldıkça
// noktalar birleşir ve şarkı bittiğinde resim ortaya çıkar.
//
// shape.outline: 0-100 koordinatlarında kapalı bir çokgen (noktalar bunun üzerine dağıtılır)
// shape.details: resim tamamlanınca çizilecek ek SVG yolları (göz, bacak vb.)

const seq = (str) =>
  str
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [note, beats] = tok.split(':');
      return { note, beats: beats ? Number(beats) : 1 };
    });

export const SONGS = [
  {
    id: 'corekler',
    title: 'Sıcak Çörekler',
    level: 'Si · La · Sol',
    requires: 'la-sol',
    bpm: 96,
    notes: seq('B4 A4 G4:2 B4 A4 G4:2 G4:.5 G4:.5 G4:.5 G4:.5 A4:.5 A4:.5 A4:.5 A4:.5 B4 A4 G4:2'),
    shape: {
      name: 'Sekizlik nota',
      color: 'var(--sky)',
      outline: [
        [30, 62], [42, 57], [50, 64], [50, 10], [57, 10], [62, 22], [76, 32], [80, 48],
        [76, 60], [70, 44], [56, 36], [56, 72], [44, 84], [30, 86], [24, 76],
      ],
      details: [],
    },
  },
  {
    id: 'kuzu',
    title: 'Küçük Kuzu',
    level: 'Sol · La · Si · Re',
    requires: 'do-re',
    bpm: 108,
    notes: seq('B4 A4 G4 A4 B4 B4 B4:2 A4 A4 A4:2 B4 D5 D5:2 B4 A4 G4 A4 B4 B4 B4 B4 A4 A4 B4 A4 G4:4'),
    shape: {
      name: 'Kuzu',
      color: 'var(--paper-2)',
      outline: [
        [24, 40], [30, 28], [36, 22], [44, 26], [50, 20], [58, 24], [64, 18], [72, 24], [80, 22],
        [86, 32], [89, 44], [84, 56], [76, 60], [74, 78], [68, 78], [66, 62], [44, 62], [42, 78], [36, 78], [34, 60], [26, 56],
        [16, 52], [10, 44], [12, 34], [20, 30],
      ],
      details: [
        'M14 38 a1.5 1.5 0 1 0 0.1 0',
        'M20 31 q-6 -8 -12 -4',
        'M88 40 q7 -2 7 6',
      ],
    },
  },
  {
    id: 'nese',
    title: 'Neşeye Övgü',
    level: 'Sol · La · Si · Do · Re',
    requires: 'do-re',
    bpm: 112,
    notes: seq('B4 B4 C5 D5 D5 C5 B4 A4 G4 G4 A4 B4 B4:1.5 A4:.5 A4:2 B4 B4 C5 D5 D5 C5 B4 A4 G4 G4 A4 B4 A4:1.5 G4:.5 G4:2'),
    shape: {
      name: 'Fil',
      color: 'var(--lilac)',
      outline: [
        [30, 22], [44, 16], [58, 20], [74, 20], [86, 28], [90, 44], [88, 60], [88, 82], [78, 82],
        [76, 66], [58, 66], [56, 82], [46, 82], [44, 62], [36, 56], [26, 58], [20, 68], [20, 82],
        [12, 82], [12, 62], [16, 46], [20, 32],
      ],
      details: [
        'M28 34 a1.8 1.8 0 1 0 0.1 0',
        'M40 26 q16 4 12 22 q-8 6 -14 0',
        'M90 44 q6 6 4 14',
      ],
    },
  },
  {
    id: 'yildiz',
    title: 'Daha Dün Annemizin',
    level: 'Sol · La · Si · Do · Re · Mi',
    requires: 'mi',
    bpm: 104,
    notes: seq(
      'G4 G4 D5 D5 E5 E5 D5:2 C5 C5 B4 B4 A4 A4 G4:2 ' +
        'D5 D5 C5 C5 B4 B4 A4:2 D5 D5 C5 C5 B4 B4 A4:2 ' +
        'G4 G4 D5 D5 E5 E5 D5:2 C5 C5 B4 B4 A4 A4 G4:2',
    ),
    shape: {
      name: 'Yıldız',
      color: 'var(--sun)',
      outline: starOutline(50, 52, 42, 18),
      details: [],
    },
  },
];

function starOutline(cx, cy, R, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([+(cx + rad * Math.cos(a)).toFixed(1), +(cy + rad * Math.sin(a)).toFixed(1)]);
  }
  return pts;
}

/**
 * Kapalı bir çokgenin üzerine n nokta yerleştirir. Köşeler her zaman nokta olur
 * (resim tanınır kalsın diye); kalan noktalar kenar uzunluklarına göre paylaştırılır.
 */
export function distributeDots(outline, n) {
  const V = outline.length;
  if (n < V) throw new Error(`Şarkıda en az ${V} nota olmalı`);
  const segs = outline.map((p, i) => {
    const q = outline[(i + 1) % V];
    return { p, q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  const total = segs.reduce((a, s) => a + s.len, 0);
  const extra = n - V;
  const exact = segs.map((s) => (s.len / total) * extra);
  const counts = exact.map(Math.floor);
  let left = extra - counts.reduce((a, b) => a + b, 0);
  exact
    .map((e, i) => [e - Math.floor(e), i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, left)
    .forEach(([, i]) => counts[i]++);
  const dots = [];
  segs.forEach((s, i) => {
    dots.push(s.p);
    for (let k = 1; k <= counts[i]; k++) {
      const t = k / (counts[i] + 1);
      dots.push([s.p[0] + (s.q[0] - s.p[0]) * t, s.p[1] + (s.q[1] - s.p[1]) * t]);
    }
  });
  return dots;
}

export const songById = (id) => SONGS.find((s) => s.id === id);
