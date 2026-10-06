// Kısa şarkılar için basit resimler (0–100 koordinatlarında kapalı çokgenler).
// Noktalar köşelere ve kenarlara dağıtılır; şarkıdaki nota sayısı köşe sayısından az olmamalı.

const face = (cx, cy, s = 1) => [
  { d: `M${cx - 7 * s} ${cy} a2.2 2.6 0 1 0 4.4 0 a2.2 2.6 0 1 0 -4.4 0Z M${cx + 2.6 * s} ${cy} a2.2 2.6 0 1 0 4.4 0 a2.2 2.6 0 1 0 -4.4 0Z`, cls: 'fill-ink' },
  { d: `M${cx - 5 * s} ${cy + 6 * s} q${5 * s} ${5 * s} ${10 * s} 0 q${-5 * s} ${2 * s} ${-10 * s} 0Z`, cls: 'fill-coral' },
  { d: `M${cx - 11 * s} ${cy + 5 * s} a2.4 1.5 0 1 0 0.1 0Z M${cx + 11 * s} ${cy + 5 * s} a2.4 1.5 0 1 0 0.1 0Z`, cls: 'fill-coral' },
];

export const HEART = {
  name: 'Kalp',
  color: 'var(--coral)',
  outline: [[50, 30], [62, 16], [78, 14], [90, 26], [88, 46], [50, 86], [12, 46], [10, 26], [22, 14], [38, 16]],
  details: [...face(50, 44), { d: 'M24 24 q6 -6 14 -4', cls: 'shine' }],
  scene: [
    { d: 'M10 76 l1.2 -3 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2Z M86 80 l1.2 -3 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2Z', cls: 'fill-sun' },
    { d: 'M86 8 l1.4 -3.6 l1.4 3.6 l3.6 1.4 l-3.6 1.4 l-1.4 3.6 l-1.4 -3.6 l-3.6 -1.4Z', cls: 'fill-sun' },
  ],
};

export const BALLOON = {
  name: 'Balon',
  color: 'var(--sky)',
  outline: [[50, 6], [70, 12], [78, 30], [76, 50], [64, 68], [54, 76], [46, 76], [36, 68], [24, 50], [22, 30], [30, 12]],
  details: [
    ...face(50, 38),
    { d: 'M46 76 L54 76 L52 80 L48 80Z', cls: 'fill-ink' },
    'M50 80 q-6 6 2 12 q6 4 -2 8',
    { d: 'M32 22 q4 -8 12 -10', cls: 'shine' },
  ],
  scene: [
    { d: 'M6 18 q4 -5 9 -2 q4 -4 8 0 q4 2 1 5 H8 q-4 0 -2 -3Z M76 84 q4 -5 9 -2 q4 -4 8 0 q4 2 1 5 H78 q-4 0 -2 -3Z', cls: 'fill-paper' },
  ],
};

export const HOUSE = {
  name: 'Ev',
  color: 'var(--sun)',
  outline: [[20, 90], [20, 50], [12, 50], [50, 14], [88, 50], [80, 50], [80, 90]],
  details: [
    { d: 'M44 90 V68 Q50 62 56 68 V90Z', cls: 'fill-coral' },
    { d: 'M28 58 H40 V70 H28Z M60 58 H72 V70 H60Z', cls: 'fill-paper' },
    'M34 58 V70 M28 64 H40 M66 58 V70 M60 64 H72',
    { d: 'M66 30 V18 H74 V38Z', cls: 'fill-coral' },
    'M70 14 q-4 -4 0 -7 q4 -3 0 -6',
  ],
  scene: [
    { d: 'M0 90 q12 -3 24 0 t24 0 t24 0 t28 0 V100 H0Z', cls: 'fill-leaf' },
    { d: 'M12 14 a7 7 0 1 0 0.1 0Z', cls: 'fill-sun' },
  ],
};

const sunOutline = () => {
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 6;
    pts.push([+(50 + 25 * Math.cos(a)).toFixed(1), +(50 + 25 * Math.sin(a)).toFixed(1)]);
  }
  return pts;
};
const rays = () => {
  let d = '';
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + Math.PI / 12 + (i * Math.PI) / 6;
    d += `M${(50 + 31 * Math.cos(a)).toFixed(1)} ${(50 + 31 * Math.sin(a)).toFixed(1)} L${(50 + 42 * Math.cos(a)).toFixed(1)} ${(50 + 42 * Math.sin(a)).toFixed(1)} `;
  }
  return d.trim();
};

export const SUN = {
  name: 'Güneş',
  color: 'var(--sun)',
  outline: sunOutline(),
  details: [{ d: rays(), cls: 'stroke-sun-thick' }, ...face(50, 48), { d: 'M36 38 q4 -6 10 -7', cls: 'shine' }],
  scene: [{ d: 'M4 88 q4 -5 9 -2 q4 -4 8 0 q4 2 1 5 H6 q-4 0 -2 -3Z M74 12 q4 -5 9 -2 q4 -4 8 0 q4 2 1 5 H76 q-4 0 -2 -3Z', cls: 'fill-paper' }],
};
