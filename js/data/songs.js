// Nota Noktaları şarkıları. Her nota resmin bir noktasıdır; doğru notayı çaldıkça
// noktalar birleşir ve şarkı bittiğinde resim ortaya çıkar.
//
// shape.outline: 0-100 koordinatlarında kapalı bir çokgen (noktalar bunun üzerine dağıtılır)
// shape.details: resim tamamlanınca çizilecek ek SVG yolları (göz, bacak vb.)

export const seq = (str) =>
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
      details: [
        { d: 'M28 70 a3 3.6 0 1 0 6 0 a3 3.6 0 1 0 -6 0Z', cls: 'fill-paper' },
        { d: 'M38 68 a3 3.6 0 1 0 6 0 a3 3.6 0 1 0 -6 0Z', cls: 'fill-paper' },
        { d: 'M31.6 71 a1.4 1.4 0 1 0 0.1 0Z M41.6 69 a1.4 1.4 0 1 0 0.1 0Z', cls: 'fill-ink' },
        { d: 'M31 77 q5 5 10 -1 q-5 2 -10 1Z', cls: 'fill-coral' },
        { d: 'M26 76 a2.4 1.6 0 1 0 0.1 0Z M45 73 a2.4 1.6 0 1 0 0.1 0Z', cls: 'fill-coral' },
        { d: 'M53 14 V44', cls: 'shine' },
        { d: 'M62 28 q8 4 12 12', cls: 'shine' },
      ],
      scene: [
        { d: 'M12 22 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z', cls: 'fill-sun' },
        { d: 'M84 74 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5Z', cls: 'fill-sun' },
        { d: 'M4 94 H96 M4 97 H96', cls: 'faint' },
      ],
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
        { d: 'M24 40 L30 46 L28 54 L18 54 L11 46 L12 36 L20 31Z', cls: 'fill-ink' },
        { d: 'M14 39 a2 2.4 0 1 0 4 0 a2 2.4 0 1 0 -4 0Z', cls: 'fill-paper' },
        { d: 'M16.4 39.6 a1 1 0 1 0 0.1 0Z', cls: 'fill-ink' },
        { d: 'M12 48 q3 2 6 0', cls: 'stroke-paper-thin' },
        { d: 'M20 31 q-4 -9 -12 -5 q4 6 10 7Z', cls: 'fill-ink' },
        'M38 32 a4 4 0 1 1 7 2 M50 28 a4 4 0 1 1 7 2 M62 30 a4 4 0 1 1 7 2 M74 34 a4 4 0 1 1 7 2',
        'M42 44 a4 4 0 1 1 7 2 M56 42 a4 4 0 1 1 7 2 M70 46 a4 4 0 1 1 7 2 M48 54 a4 4 0 1 1 7 2 M62 54 a4 4 0 1 1 7 2',
        { d: 'M36 74 H42 V78 H36Z M68 74 H74 V78 H68Z', cls: 'fill-ink' },
        'M88 40 q7 -2 7 6',
        { d: 'M23 50 a2 1.3 0 1 0 0.1 0Z', cls: 'fill-coral' },
      ],
      scene: [
        { d: 'M0 78 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t20 0 V100 H0Z', cls: 'fill-leaf' },
        { d: 'M14 88 a2 2 0 1 0 0.1 0Z M50 92 a2 2 0 1 0 0.1 0Z M86 86 a2 2 0 1 0 0.1 0Z', cls: 'fill-sun' },
        { d: 'M94 6 a6 6 0 1 0 0.1 0Z', cls: 'fill-sun' },
        { d: 'M6 16 q4 -5 9 -2 q4 -4 8 0 q4 2 1 5 H8 q-4 0 -2 -3Z', cls: 'fill-paper' },
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
        { d: 'M40 24 C56 22 62 36 56 50 C50 58 40 56 36 48 C34 40 34 30 40 24Z', cls: 'fill-lilac-dark' },
        'M42 30 C52 30 54 40 50 48',
        { d: 'M25 33 a2.4 2.8 0 1 0 4.8 0 a2.4 2.8 0 1 0 -4.8 0Z', cls: 'fill-paper' },
        { d: 'M28 34 a1.3 1.3 0 1 0 0.1 0Z', cls: 'fill-ink' },
        'M24 29 q3 -3 7 -1',
        { d: 'M24 54 q-4 6 2 10 q-1 -5 2 -9Z', cls: 'fill-paper' },
        'M13 66 h6 M13 71 h6 M13 76 h6',
        'M12 82 q4 -3 8 0 M46 82 q5 -3 10 0 M78 82 q5 -3 10 0',
        { d: 'M90 44 q6 6 4 14 l-2 4 l4 0Z', cls: 'fill-ink' },
        { d: 'M28 42 a2.6 1.6 0 1 0 0.1 0Z', cls: 'fill-coral' },
        { d: 'M44 16 L52 2 L58 18Z', cls: 'fill-coral' },
        { d: 'M52 2 a2 2 0 1 0 0.1 0Z', cls: 'fill-sun' },
      ],
      scene: [
        { d: 'M0 82 q12 -3 24 0 t24 0 t24 0 t28 0 V100 H0Z', cls: 'fill-leaf' },
        { d: 'M66 8 a2 2 0 0 1 4 0 q0 4 -4 6 q1 -3 0 -6Z M6 20 a1.6 1.6 0 0 1 3 0 q0 3 -3 5 q1 -3 0 -5Z', cls: 'fill-ink' },
        'M70 8 V-4 M9 20 V10',
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
      details: [
        { d: 'M41 50 a2.6 3.2 0 1 0 5.2 0 a2.6 3.2 0 1 0 -5.2 0Z M54 50 a2.6 3.2 0 1 0 5.2 0 a2.6 3.2 0 1 0 -5.2 0Z', cls: 'fill-ink' },
        { d: 'M44 49 a0.9 0.9 0 1 0 0.1 0Z M57 49 a0.9 0.9 0 1 0 0.1 0Z', cls: 'fill-paper' },
        { d: 'M44 58 q6 7 12 0 q-6 3 -12 0Z', cls: 'fill-coral' },
        { d: 'M38 57 a2.6 1.6 0 1 0 0.1 0Z M62 57 a2.6 1.6 0 1 0 0.1 0Z', cls: 'fill-coral' },
        { d: 'M50 16 L46 28', cls: 'shine' },
      ],
      scene: [
        { d: 'M-6 -6 H106 V106 H-6Z', cls: 'night' },
        { d: 'M10 12 a1 1 0 1 0 0.1 0Z M88 18 a1.2 1.2 0 1 0 0.1 0Z M16 84 a1 1 0 1 0 0.1 0Z M92 78 a1 1 0 1 0 0.1 0Z M76 96 a0.8 0.8 0 1 0 0.1 0Z M4 50 a0.8 0.8 0 1 0 0.1 0Z', cls: 'fill-sun' },
        { d: 'M86 4 a8 8 0 1 0 8 12 a6 6 0 1 1 -8 -12Z', cls: 'fill-sun' },
      ],
    },
  },
];

export function starOutline(cx, cy, R, r) {
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
