// Ders sahnelerinde kullanılan çizimler. Her fonksiyon bir SVG parçası (metin) döndürür.
// Çizimler 800x450'lik bir "tahta" üzerine yerleştirilir ve sketch.js tarafından
// çizgi çizgi çiziliyormuş gibi canlandırılır. Metal parlaklığı, cam, ten gölgesi ve
// kurşun kalem taraması için gereken degrade/desenler index.html'deki <defs> içindedir.
import { fingeringOf, staffStep, parseNote } from './data/notes.js';

const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');

export const el = (tag, a = {}, inner = '') => `<${tag} ${attrs(a)}>${inner}</${tag}>`;
export const group = (inner, a = {}) => el('g', a, inner);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Not: CSS sınıfları stroke-width ve opacity özniteliklerini ezdiği için bunlar style ile verilir.
export const P = (d, cls = 'ink', { 'stroke-width': sw, opacity, style, ...extra } = {}) => {
  const css = (sw != null ? `stroke-width:${sw}px;` : '') + (opacity != null ? `opacity:${opacity};` : '') + (style || '');
  return el('path', { d, class: cls, ...extra, style: css || undefined });
};
export const C = (cx, cy, r, cls = 'ink', extra = {}) => el('circle', { cx, cy, r, class: cls, ...extra });
export const E = (cx, cy, rx, ry, cls = 'ink', extra = {}) => el('ellipse', { cx, cy, rx, ry, class: cls, ...extra });
/** Yerel koordinatlarda çizilmiş bir figürü konumlandırır */
export const place = (x, y, s, inner, flip = false) =>
  group(inner, { transform: `translate(${x} ${y}) scale(${flip ? -s : s} ${s})` });
/** Kalın, kenar çizgili uzuv (kol, bacak): önce mürekkep, üstüne renk */
export const limb = (d, w, fillCls) => P(d, 'limb-o', { 'stroke-width': w + 5 }) + P(d, `limb-i ${fillCls}`, { 'stroke-width': w });

export function text(str, x, y, { size = 28, anchor = 'middle', cls = 'ink-fill', weight } = {}) {
  return el('text', { x, y, 'font-size': size, 'text-anchor': anchor, class: `hand ${cls}`, 'font-weight': weight }, esc(str));
}

export function arrow(x1, y1, x2, y2, { bend = 0, cls = 'ink' } = {}) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h = 14;
  const a1 = ang + Math.PI - 0.45;
  const a2 = ang + Math.PI + 0.45;
  return group(
    P(`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`, cls, { fill: 'none' }) +
      P(`M${x2 + h * Math.cos(a1)} ${y2 + h * Math.sin(a1)} L${x2} ${y2} L${x2 + h * Math.cos(a2)} ${y2 + h * Math.sin(a2)}`, cls, { fill: 'none' }),
  );
}

/** Dalgalı hava akımı çizgileri */
export function air(x, y, len = 120, { lines = 3, gap = 12, cls = 'stroke-sky' } = {}) {
  let out = '';
  for (let i = 0; i < lines; i++) {
    const yy = y + (i - (lines - 1) / 2) * gap;
    const xx = x + (i % 2) * 10;
    let d = `M${xx} ${yy}`;
    const waves = Math.max(2, Math.round(len / 30));
    const step = (len - (i % 2) * 20) / waves;
    for (let k = 0; k < waves; k++) d += ` q${step / 4} ${k % 2 ? 6 : -6} ${step / 2} 0 t${step / 2} 0`;
    out += P(d, cls, { fill: 'none' });
  }
  return group(out);
}

export function underline(x, y, w, cls = 'stroke-coral') {
  return P(`M${x} ${y} q${w / 2} 8 ${w} -2 m${-w * 0.8} 7 q${w * 0.35} 4 ${w * 0.6} 0`, cls, { fill: 'none' });
}

export function circleMark(cx, cy, rx, ry = rx, cls = 'stroke-coral') {
  // Elle çizilmiş gibi tam kapanmayan bir halka
  const d = `M${cx - rx} ${cy} a${rx} ${ry} 0 1 1 ${rx * 0.2} ${ry * 0.95} q${-rx * 0.4} ${-ry * 0.2} ${-rx * 0.35} ${-ry * 1.1}`;
  return P(d, `${cls} thick`, { fill: 'none' });
}

// ---------------------------------------------------------------------------
// Flüt

/** Parmak anahtarlarının konumları (flüt genişliğine oranla) */
const KEY_POS = { l1: 0.4, l2: 0.46, l3: 0.52, r1: 0.63, r2: 0.69, r3: 0.75 };
/** Parmakla basılmayan, mekanizmanın parçası olan küçük kapaklar */
const SMALL_CUPS = [0.365, 0.43, 0.555, 0.585, 0.79, 0.88, 0.925, 0.965];

/**
 * Yatay bir yan flüt çizer (Boehm sistemi: kapaklar, miller, kollar).
 * @param {object} o
 * @param {string} [o.note] Parmak pozisyonu gösterilecek nota (basılı anahtarlar mercan rengi)
 * @param {string[]} [o.highlight] Vurgulanacak anahtarlar ya da 'head','body','foot','hole'
 * @param {boolean} [o.labels] Parmak numaralarını yaz
 * @param {boolean} [o.parts] Baş / gövde / ayak parçalarını göster
 */
export function flute({ x = 80, y = 220, w = 640, note, highlight = [], labels = false, parts = false, shadow = true } = {}) {
  const s = w / 640;
  const h = 26 * s;
  const top = y - h / 2;
  const bot = y + h / 2;
  const pressed = note ? fingeringOf(note) : new Set();
  const X = (r) => x + r * w;
  const hl = new Set(highlight);
  const rodY = top - 5 * s;
  let out = '';

  if (shadow) out += E(X(0.5), bot + 34 * s, w * 0.47, 6 * s, 'shade');

  // Mil ve dikmeler (kapakların arkasında)
  out += el('rect', { x: X(0.34), y: rodY - 2 * s, width: X(0.83) - X(0.34), height: 4 * s, rx: 2 * s, class: 'ink thin metal-g' });
  for (const r of [0.345, 0.495, 0.6, 0.715, 0.825]) {
    out += el('rect', { x: X(r) - 2 * s, y: rodY - 3 * s, width: 4 * s, height: 9 * s, rx: 1 * s, class: 'ink thin metal-g' });
  }

  // Gövde parçaları
  const tube = (a, b, glow) =>
    el('rect', { x: X(a), y: top, width: X(b) - X(a), height: h, rx: 4 * s, class: `ink ${glow ? 'glow' : 'metal-g'}` }) +
    P(`M${X(a) + 6 * s} ${top + h * 0.3} H${X(b) - 6 * s}`, 'shine') +
    el('rect', { x: X(a) + 2 * s, y: top + h * 0.72, width: X(b) - X(a) - 4 * s, height: h * 0.22, class: 'hatch' });
  out += tube(0.025, 0.3, hl.has('head'));
  out += tube(0.3, 0.84, hl.has('body'));
  out += tube(0.84, 1, hl.has('foot'));

  // Taç (kapak) ve halkalar
  out += el('rect', { x, y: top - 3 * s, width: 18 * s, height: h + 6 * s, rx: 6 * s, class: 'ink metal-g' });
  out += P(`M${x + 6 * s} ${top - 2 * s} V${bot + 2 * s} M${x + 12 * s} ${top - 2 * s} V${bot + 2 * s}`, 'ink thin', { fill: 'none' });
  for (const r of [0.3, 0.84]) {
    out += el('rect', { x: X(r) - 4 * s, y: top - 3 * s, width: 8 * s, height: h + 6 * s, rx: 2 * s, class: 'ink metal-g' });
    out += P(`M${X(r)} ${top - 2 * s} V${bot + 2 * s}`, 'ink thin');
  }
  // Baş kısmındaki süs halkaları
  for (const r of [0.06, 0.07, 0.2, 0.21]) out += P(`M${X(r)} ${top + 1 * s} V${bot - 1 * s}`, 'ink thin');

  // Dudaklık (kanatlı plaka) ve üfleme deliği
  const hx = X(0.13);
  out += P(
    `M${hx - 34 * s} ${y} C${hx - 34 * s} ${top - 10 * s} ${hx - 14 * s} ${top - 6 * s} ${hx} ${top - 6 * s} C${hx + 14 * s} ${top - 6 * s} ${hx + 34 * s} ${top - 10 * s} ${hx + 34 * s} ${y} C${hx + 34 * s} ${bot + 10 * s} ${hx + 14 * s} ${bot + 6 * s} ${hx} ${bot + 6 * s} C${hx - 14 * s} ${bot + 6 * s} ${hx - 34 * s} ${bot + 10 * s} ${hx - 34 * s} ${y}Z`,
    `ink ${hl.has('hole') ? 'glow' : 'cup'}`,
  );
  out += E(hx + 2 * s, y, 14 * s, 8.5 * s, 'ink thin metal-g');
  out += E(hx + 2 * s, y, 10.5 * s, 6 * s, 'ink hole');
  out += P(`M${hx - 24 * s} ${top} q8 ${-5 * s} ${18 * s} ${-4 * s}`, 'shine');

  // Küçük mekanizma kapakları
  for (const r of SMALL_CUPS) {
    const cx = X(r);
    out += P(`M${cx} ${y - 7 * s} V${rodY}`, 'ink thin');
    out += C(cx, y, 7 * s, 'ink thin cup') + C(cx, y, 4 * s, 'ink thin', { fill: 'none' });
  }

  const key = (id, cx, cy, rx, ry = rx, lever = 0) => {
    const isDown = pressed.has(id);
    if (lever) out += P(`M${cx} ${cy - ry} L${cx + lever * 4 * s} ${bot - 1 * s}`, 'ink');
    out += E(cx, cy, rx, ry, `ink key ${isDown ? 'down' : 'up'}`, { 'data-key': id });
    if (isDown) {
      // Parmak izi: tuşa basan parmak
      for (const k of [0.3, 0.55, 0.8]) out += P(`M${cx - rx * k} ${cy + ry * 0.15} a${rx * k} ${ry * k} 0 0 1 ${2 * rx * k} 0`, 'print');
    } else {
      out += E(cx, cy, rx * 0.68, ry * 0.68, 'ink thin', { fill: 'none' });
      out += C(cx - rx * 0.3, cy - ry * 0.35, Math.min(rx, ry) * 0.18, 'shine-fill');
    }
    if (hl.has(id)) out += E(cx, cy, rx + 7 * s, ry + 7 * s, 'stroke-coral dashed');
  };

  // Parmak anahtarları (kollarıyla birlikte)
  for (const [id, r] of Object.entries(KEY_POS)) {
    out += P(`M${X(r)} ${y - 11 * s} V${rodY}`, 'ink');
    key(id, X(r), y, 11.5 * s);
  }
  // Başparmak anahtarı (flütün arkasında, alttan görünür)
  key('th', X(0.4) - 6 * s, bot + 13 * s, 12 * s, 7 * s, 1);
  // Sol serçe parmak: Sol diyez kolu
  key('gs', X(0.565), bot + 11 * s, 9 * s, 6 * s, -1);
  // Sağ serçe parmak: Mi bemol kolu
  key('eb', X(0.8), bot + 11 * s, 11 * s, 6 * s, -1);
  // Ayak: pes Do anahtarı ve yanındaki Do diyez makarası
  out += el('rect', { x: X(0.9) - 7 * s, y: bot + 5 * s, width: 14 * s, height: 8 * s, rx: 4 * s, class: 'ink thin cup' });
  key('c', X(0.95), bot + 11 * s, 11 * s, 6 * s, -1);

  if (labels) {
    const ly = rodY - 14 * s;
    out += text('Sol el', X(0.46), ly - 24 * s, { size: 22 * s, cls: 'muted-fill' });
    out += text('Sağ el', X(0.69), ly - 24 * s, { size: 22 * s, cls: 'muted-fill' });
    out += P(`M${X(0.39)} ${ly - 18 * s} q${X(0.07) - x} ${-6 * s} ${X(0.14) - x} 0`, 'ink thin', { fill: 'none' });
    out += P(`M${X(0.62)} ${ly - 18 * s} q${X(0.07) - x} ${-6 * s} ${X(0.14) - x} 0`, 'ink thin', { fill: 'none' });
    for (const [id, r] of Object.entries(KEY_POS)) out += text(id[1], X(r), ly, { size: 20 * s, cls: 'muted-fill' });
    out += text('başparmak', X(0.4) - 6 * s, bot + 42 * s, { size: 16 * s, cls: 'muted-fill' });
    out += text('serçe', X(0.8), bot + 36 * s, { size: 16 * s, cls: 'muted-fill' });
  }

  if (parts) {
    const py = bot + 70 * s;
    out += brace(X(0.025), X(0.3), py - 22 * s, s) + text('Baş', X(0.16), py + 8 * s, { size: 26 * s });
    out += brace(X(0.3), X(0.84), py - 22 * s, s) + text('Gövde', X(0.57), py + 8 * s, { size: 26 * s });
    out += brace(X(0.84), X(1), py - 22 * s, s) + text('Ayak', X(0.92), py + 8 * s, { size: 26 * s });
  }
  return group(out, { class: 'flute' });
}

function brace(x1, x2, y, s = 1) {
  const m = (x1 + x2) / 2;
  const d = 8 * s;
  return P(`M${x1} ${y - d} q0 ${d} ${d} ${d} L${m - d} ${y} q${d} 0 ${d} ${d} q0 ${-d} ${d} ${-d} L${x2 - d} ${y} q${d} 0 ${d} ${-d}`, 'ink thin', { fill: 'none' });
}

// ---------------------------------------------------------------------------
// Porte (dizek)

export function staff({ x = 100, y = 120, w = 600, sp = 16, notes = [], clef = true, values } = {}) {
  let out = '';
  const bottom = y + sp * 4;
  for (let i = 0; i < 5; i++) out += el('line', { x1: x, y1: y + i * sp, x2: x + w, y2: y + i * sp, class: 'ink thin' });
  out += P(`M${x + w - sp * 0.5} ${y} V${bottom}`, 'ink thin') + el('rect', { x: x + w - sp * 0.25, y, width: sp * 0.25, height: sp * 4, class: 'fill-ink' });
  if (clef) out += el('text', { x: x + sp * 0.3, y: bottom + sp * 1.05, 'font-size': sp * 6.6, class: 'clef ink-fill' }, '𝄞');
  const startX = x + (clef ? sp * 6.5 : sp * 1.5);
  const endX = x + w - sp * 2.5;
  const gap = notes.length > 1 ? (endX - startX) / (notes.length - 1) : 0;
  notes.forEach((n, i) => {
    out += noteHead(n, notes.length > 1 ? startX + gap * i : (startX + endX) / 2, bottom, sp, values?.[i]);
  });
  return group(out, { class: 'staff' });
}

/** Porte üzerinde tek bir nota (ek çizgiler, işaret ve sapıyla birlikte) */
export function noteHead(id, cx, bottomLineY, sp = 16, value = 'quarter', cls = '') {
  const step = staffStep(id);
  const cy = bottomLineY - (step * sp) / 2;
  let out = '';
  const ledger = (s) => el('line', { x1: cx - sp * 1.05, y1: bottomLineY - (s * sp) / 2, x2: cx + sp * 1.05, y2: bottomLineY - (s * sp) / 2, class: 'ink thin' });
  for (let s = -2; s >= step; s -= 2) out += ledger(s);
  for (let s = 10; s <= step; s += 2) out += ledger(s);
  const { alter } = parseNote(id);
  if (alter) out += el('text', { x: cx - sp * 1.7, y: cy + sp * 0.7, 'font-size': sp * 2.6, 'text-anchor': 'middle', class: 'clef ink-fill' }, alter > 0 ? '♯' : '♭');
  out += noteSymbol(cx, cy, sp, value, step >= 4);
  return group(out, { class: cls, 'data-note': id });
}

/** Nota değeri sembolü. stemDown: sap aşağı */
export function noteSymbol(cx, cy, sp = 16, value = 'quarter', stemDown = false) {
  const open = value === 'whole' || value === 'half';
  const rx = sp * 0.68;
  const ry = sp * 0.48;
  let out = E(cx, cy, rx, ry, `ink ${open ? 'paper' : 'head-g'}`, { transform: `rotate(-20 ${cx} ${cy})` });
  if (!open) out += E(cx - rx * 0.3, cy - ry * 0.3, rx * 0.25, ry * 0.18, 'shine-fill', { transform: `rotate(-20 ${cx} ${cy})` });
  if (value !== 'whole') {
    const sx = stemDown ? cx - rx + 1 : cx + rx - 1;
    const sy2 = stemDown ? cy + sp * 3.3 : cy - sp * 3.3;
    out += el('line', { x1: sx, y1: cy, x2: sx, y2: sy2, class: 'ink' });
    if (value === 'eighth') {
      const dir = stemDown ? -1 : 1;
      out += P(`M${sx} ${sy2} q${sp * 0.2} ${dir * sp * 1.2} ${sp * 1.1} ${dir * sp * 1.6} q${sp * 0.4} ${dir * sp * 0.5} ${sp * 0.1} ${dir * sp * 1.5}`, 'ink', { fill: 'none' });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Maskot: "Nota" — yüzü olan sekizlik nota

export function mascot({ x = 120, y = 300, s = 1, mood = 'happy', wave = false } = {}) {
  let o = '';
  o += E(0, 60, 44, 7, 'shade');
  // Sap ve dolu bayrak
  o += P('M30 -6 V-120', 'ink thick');
  o += P('M30 -120 C33 -94 62 -86 67 -60 C70 -46 65 -36 58 -30 C60 -48 50 -62 30 -72Z', 'ink head-g');
  o += P('M36 -108 C40 -96 52 -90 58 -80', 'shine', { opacity: 0.4 });
  // Bacaklar ve ayakkabılar
  o += P('M-12 22 L-17 50', 'ink thick') + P('M12 22 L15 50', 'ink thick');
  o += P('M-30 56 q2 -10 14 -8 q8 2 6 10 z', 'ink fill-coral') + P('M10 56 q-2 -10 10 -8 q12 2 12 10 z', 'ink fill-coral');
  // Kollar ve eldivenler
  const glove = (gx, gy, rot) =>
    group(C(0, 0, 9, 'ink paper') + P('M-3 -8 v6 M2 -8 v6', 'ink thin') + P('M-9 2 q-5 -2 -4 -7', 'ink thin', { fill: 'none' }), { transform: `translate(${gx} ${gy}) rotate(${rot})` });
  if (wave) {
    o += P('M-30 -6 C-48 -16 -56 -34 -52 -52', 'ink thick');
    o += glove(-52, -60, -20) + P('M-66 -70 q-6 4 -6 10 M-62 -80 q-10 4 -12 14', 'ink thin', { fill: 'none' });
  } else {
    o += P('M-32 2 C-46 10 -52 22 -54 32', 'ink thick') + glove(-55, 38, 10);
  }
  o += P('M34 6 C46 14 50 24 50 34', 'ink thick') + glove(51, 40, -10);
  // Papyon
  o += P('M-12 24 L-1 30 L-12 36Z M10 24 L-1 30 L10 36Z', 'ink fill-coral') + C(-1, 30, 2.6, 'ink fill-coral');
  // Kafa (nota başı) ve parlaklık
  o += E(0, 0, 39, 29, 'ink head-g', { transform: 'rotate(-18)' });
  o += E(-17, -15, 11, 5, 'shine-fill', { transform: 'rotate(-30 -17 -15)' });
  // Yüz
  const eye = (ex) => {
    if (mood === 'wink' && ex > 0) return P(`M${ex - 7} -6 q7 -7 14 0`, 'stroke-paper', { fill: 'none' });
    return E(ex, -6, 7, 8.5, 'fill-paper') + C(ex + 1.5, -4, 3.8, 'ink-fill') + C(ex + 2.8, -6, 1.3, 'fill-paper');
  };
  o += eye(-13) + eye(11);
  o += P('M-20 -19 q6 -5 12 -2 M5 -22 q6 -3 12 1', 'stroke-paper thin', { fill: 'none' });
  o += E(-25, 8, 6, 4, 'fill-coral') + E(22, 3, 6, 4, 'fill-coral');
  if (mood === 'wow') o += E(0, 11, 6, 8, 'fill-paper');
  else if (mood === 'blow') o += C(4, 10, 4.5, 'stroke-paper', { fill: 'none' }) + P('M14 6 q6 -2 10 0 M14 12 q7 0 12 3', 'stroke-paper thin', { fill: 'none' });
  else o += P('M-11 7 Q0 22 11 4 Q0 11 -11 7Z', 'fill-coral stroke-paper', { 'stroke-width': 1.6 });
  return group(place(x, y, s, o), { class: 'mascot' });
}

/** Konuşma balonu */
export function bubble(str, x, y, { w = 260, h = 70, size = 24, tail = 'left' } = {}) {
  const tx = tail === 'left' ? x + 30 : x + w - 30;
  const d = `M${x + 16} ${y} H${x + w - 16} Q${x + w} ${y} ${x + w} ${y + 16} V${y + h - 16} Q${x + w} ${y + h} ${x + w - 16} ${y + h} H${tx + 14} L${tx - (tail === 'left' ? 20 : -20)} ${y + h + 22} L${tx} ${y + h} H${x + 16} Q${x} ${y + h} ${x} ${y + h - 16} V${y + 16} Q${x} ${y} ${x + 16} ${y}Z`;
  return group(
    P(d, 'shade', { transform: 'translate(5 6)' }) + P(d, 'ink paper') + text(str, x + w / 2, y + h / 2 + size * 0.35, { size }) + sparkle(x + w - 8, y + 4, 0.5),
  );
}

// ---------------------------------------------------------------------------
// Ders çizimleri

/** Cam şişe: yansımaları, etiketi ve gölgesiyle */
export function bottle(x, y, s = 1) {
  let o = '';
  o += E(0, 218, 58, 9, 'shade');
  const body = 'M-14 0 V34 C-14 54 -46 62 -46 96 V200 Q-46 216 -30 216 H30 Q46 216 46 200 V96 C46 62 14 54 14 34 V0Z';
  o += P(body, 'ink glass-g');
  o += E(0, 0, 14, 4.5, 'ink paper') + el('rect', { x: -16, y: 6, width: 32, height: 8, rx: 3, class: 'ink thin glass-g' });
  o += P('M-32 104 C-34 140 -34 170 -30 196', 'stroke-paper thick', { opacity: 0.8 });
  o += P('M-6 22 V40', 'stroke-paper', { opacity: 0.7 });
  o += P('M34 100 V196', 'hatch-line', { 'stroke-width': 4, opacity: 0.25 });
  // Etiket
  o += el('rect', { x: -34, y: 120, width: 68, height: 52, rx: 6, class: 'ink paper' });
  o += P('M-34 130 H34 M-34 162 H34', 'ink thin');
  o += musicNote(-4, 152, 0.6, 'stroke-coral');
  // Ses dalgaları
  o += P('M-26 -14 a30 30 0 0 1 52 0 M-38 -28 a46 46 0 0 1 76 0', 'stroke-teal', { fill: 'none' });
  return place(x, y, s, o);
}

/** Yandan görünüş: yüz profili, dudaklar ve flütün kesiti */
export function embouchure(x, y, s = 1) {
  let o = '';
  // Kafa ve yüz profili (sağa bakıyor) tek bir kapalı çizgi
  o += P('M96 262 L96 214 C60 200 36 170 34 120 C30 60 70 26 120 22 C170 18 208 40 214 70 C218 84 214 92 218 100 L232 128 C236 136 230 140 220 140 C216 144 218 148 214 152 C224 154 224 162 214 164 C224 168 222 178 210 180 C206 194 212 206 198 214 C186 222 176 222 168 226 L170 262Z', 'ink skin-g');
  o += P('M110 240 C130 236 150 232 168 226', 'hatch-line', { 'stroke-width': 6, opacity: 0.25, fill: 'none' });
  // Saç
  o += P('M32 118 C24 54 76 10 140 14 C182 16 208 40 214 70 C190 54 160 50 140 58 C112 66 92 90 90 120 C70 118 48 120 32 118Z', 'ink hair');
  o += P('M48 70 q20 -26 60 -36 M58 92 q24 -30 70 -40', 'stroke-paper thin', { fill: 'none', opacity: 0.5 });
  // Göz, kaş, kulak, yanak
  o += P('M178 90 q10 -6 20 0', 'ink', { fill: 'none' }) + P('M184 104 q7 -5 14 0 q-7 4 -14 0Z', 'ink paper') + C(193, 104, 2.4, 'ink-fill');
  o += E(110, 128, 14, 20, 'ink skin-g') + P('M106 118 q8 6 2 18', 'ink thin', { fill: 'none' });
  o += E(180, 150, 12, 7, 'fill-coral', { opacity: 0.4 });
  // Dudaklar: aralarında küçük bir açıklık
  o += P('M214 152 C226 152 228 160 216 162 C220 158 220 156 214 152Z', 'ink fill-coral');
  o += P('M214 164 C226 166 226 176 212 178 C216 172 216 168 214 164Z', 'ink fill-coral');
  // Flüt kesiti: dudaklık çeneye dayanır, delik alt dudağın hemen önünde
  o += C(252, 236, 34, 'ink metal-g') + C(252, 236, 25, 'ink paper');
  o += P('M196 200 C214 196 232 196 236 200', 'ink thick', { fill: 'none' });
  o += el('rect', { x: 230, y: 196, width: 20, height: 16, class: 'fill-paper' });
  o += P('M230 202 V212 M250 202 V212', 'ink');
  o += P('M258 214 a22 22 0 0 1 14 34', 'hatch-line', { 'stroke-width': 5, opacity: 0.3, fill: 'none' });
  return place(x, y, s, o);
}

/** Flüt çalan bir çocuk (önden görünüş: flüt kişinin sağına, yani bize göre sola uzanır) */
export function person(x, y, s = 1, { flute: withFlute = true } = {}) {
  let o = '';
  // Gövde ve gömlek
  o += P('M-70 210 C-74 130 -66 84 -34 72 L-14 66 Q0 74 14 66 L34 72 C66 84 74 130 70 210Z', 'ink shirt');
  o += P('M30 90 C50 110 56 160 54 206 L70 210 C74 130 66 84 34 72Z', 'hatch');
  o += P('M-14 66 L0 92 L14 66 M-14 66 L-24 84 L-6 82 M14 66 L24 84 L6 82', 'ink', { fill: 'none' });
  for (const by of [110, 140, 170]) o += C(0, by, 3, 'ink paper');
  o += P('M-40 150 q8 14 4 30 M38 120 q6 10 2 22', 'ink thin', { fill: 'none' });
  // Boyun
  o += el('rect', { x: -12, y: 30, width: 24, height: 40, rx: 8, class: 'ink skin-g' });
  o += P('M-12 52 q12 8 24 0', 'hatch-line', { 'stroke-width': 3 });
  if (withFlute) {
    // Kollar: sağ kol (bize göre solda) uzak uca, sol kol göğsün önünden geçer
    o += limb('M-56 90 C-110 130 -150 124 -170 84', 20, 'shirt') + limb('M-170 84 L-186 52', 16, 'skin-st');
    o += limb('M54 92 C40 150 -40 150 -96 84', 20, 'shirt') + limb('M-96 84 L-110 50', 16, 'skin-st');
  } else {
    o += limb('M-56 90 C-80 130 -84 170 -80 200', 20, 'shirt') + limb('M56 90 C80 130 84 170 80 200', 20, 'shirt');
  }
  // Kulaklar ve kafa
  o += E(-40, 6, 8, 12, 'ink skin-g') + E(40, 6, 8, 12, 'ink skin-g');
  o += C(0, 0, 40, 'ink skin-g');
  o += P('M-41 -2 C-46 -44 -16 -56 4 -54 C30 -52 48 -36 42 -2 C34 -18 26 -24 18 -20 C10 -30 -6 -32 -14 -22 C-22 -28 -34 -20 -41 -2Z', 'ink hair');
  o += P('M-28 -36 q10 -10 22 -12 M0 -44 q14 -2 26 8', 'stroke-paper thin', { fill: 'none', opacity: 0.5 });
  // Yüz: gözler flüte (bize göre sola) bakar
  o += P('M-24 -6 q8 -6 16 -2 M6 -8 q8 -4 16 0', 'ink', { fill: 'none' });
  o += E(-17, 4, 4, 5, 'ink-fill') + E(12, 4, 4, 5, 'ink-fill') + C(-18.5, 2.5, 1.3, 'fill-paper') + C(10.5, 2.5, 1.3, 'fill-paper');
  o += P('M-2 8 q-4 8 2 10', 'ink thin', { fill: 'none' });
  o += E(-26, 16, 7, 4, 'fill-coral', { opacity: 0.5 }) + E(26, 16, 7, 4, 'fill-coral', { opacity: 0.5 });
  if (withFlute) {
    o += E(-2, 23, 5, 3.5, 'ink fill-coral');
    // Flüt: baş kısmı ağızda, gövde bize göre sola
    o += group(flute({ x: 0, y: 0, w: 330, shadow: false }), { transform: 'translate(41 26) rotate(-4) scale(-1 1)' });
    // Eller (flütün üstünde, parmaklar anahtarlarda)
    const hand = (hx, hy) =>
      P(`M${hx - 20} ${hy + 6} C${hx - 22} ${hy - 12} ${hx - 14} ${hy - 16} ${hx - 9} ${hy - 6} C${hx - 7} ${hy - 18} ${hx + 1} ${hy - 18} ${hx + 3} ${hy - 6} C${hx + 5} ${hy - 18} ${hx + 13} ${hy - 18} ${hx + 14} ${hy - 4} C${hx + 22} ${hy - 6} ${hx + 24} ${hy + 8} ${hx + 16} ${hy + 14} C${hx + 4} ${hy + 22} ${hx - 14} ${hy + 20} ${hx - 20} ${hy + 6}Z`, 'ink skin-g');
    o += hand(-187, 42) + hand(-110, 36);
  } else {
    o += P('M-10 20 q10 8 20 0', 'ink', { fill: 'none' });
  }
  return place(x, y, s, o);
}

/** Nota sehpası ve üzerinde nota kâğıdı */
export function musicStand(x, y, s = 1) {
  let o = '';
  o += P('M0 70 V230 M0 230 L-40 262 M0 230 L40 262 M0 230 V264', 'ink thick', { fill: 'none' });
  o += P('M-70 -10 L70 -10 L76 76 L-76 76Z', 'ink metal-g');
  o += P('M-56 -2 L56 -2 L60 66 L-60 66Z', 'ink paper');
  for (let i = 0; i < 3; i++) for (let k = 0; k < 5; k++) o += P(`M-50 ${8 + i * 20 + k * 3} H50`, 'ink', { 'stroke-width': 0.6 });
  o += C(-30, 18, 2.6, 'fill-ink') + C(-6, 32, 2.6, 'fill-ink') + C(22, 40, 2.6, 'fill-ink') + C(36, 56, 2.6, 'fill-ink');
  o += P('M-76 76 H76', 'ink thick');
  return place(x, y, s, o);
}

/** Nefes: akciğerler, diyafram ve karın balonu */
export function belly(x, y, s = 1) {
  let o = '';
  o += P('M-76 220 C-82 120 -70 54 -36 42 L-14 36 Q0 44 14 36 L36 42 C70 54 82 120 76 220Z', 'ink shirt');
  o += el('rect', { x: -10, y: 16, width: 20, height: 26, rx: 6, class: 'ink skin-g' });
  // Akciğerler
  o += P('M-8 62 C-30 56 -56 74 -58 104 C-60 128 -50 140 -34 140 C-20 140 -10 130 -8 112Z', 'ink fill-coral', { 'fill-opacity': 0.45 });
  o += P('M8 62 C30 56 56 74 58 104 C60 128 50 140 34 140 C20 140 10 130 8 112Z', 'ink fill-coral', { 'fill-opacity': 0.45 });
  o += P('M0 40 V74 M0 74 L-14 88 L-26 100 M-14 88 L-14 104 M0 74 L14 88 L26 100 M14 88 L14 104', 'ink thin', { fill: 'none' });
  // Diyafram
  o += P('M-62 150 C-40 128 40 128 62 150', 'stroke-teal thick', { fill: 'none' });
  // Karın balonu
  o += E(0, 184, 40, 26, 'stroke-coral dashed fill-sun-soft');
  // Kollar yanlarda serbest
  o += limb('M-66 64 C-84 100 -90 150 -88 200', 18, 'shirt') + limb('M66 64 C84 100 90 150 88 200', 18, 'shirt');
  o += C(-88, 208, 9, 'ink skin-g') + C(88, 208, 9, 'ink skin-g');
  // Kafa: gözler kapalı, rahat
  o += C(0, -8, 30, 'ink skin-g');
  o += P('M-31 -10 C-34 -40 -10 -44 2 -42 C24 -40 34 -28 31 -10 C22 -24 4 -26 -6 -22 C-14 -26 -24 -22 -31 -10Z', 'ink hair');
  o += P('M-16 -4 q5 4 10 0 M6 -4 q5 4 10 0', 'ink', { fill: 'none' });
  o += P('M-6 10 q6 5 12 0', 'ink', { fill: 'none' }) + E(-18, 6, 5, 3, 'fill-coral', { opacity: 0.5 }) + E(18, 6, 5, 3, 'fill-coral', { opacity: 0.5 });
  return place(x, y, s, o);
}

export function sparkle(x, y, s = 1, cls = 'stroke-sun') {
  const S = (v) => v * s;
  return P(`M${x} ${y - S(14)} Q${x + S(2)} ${y - S(2)} ${x + S(14)} ${y} Q${x + S(2)} ${y + S(2)} ${x} ${y + S(14)} Q${x - S(2)} ${y + S(2)} ${x - S(14)} ${y} Q${x - S(2)} ${y - S(2)} ${x} ${y - S(14)}Z`, `${cls} fill-sun`);
}

export function musicNote(x, y, s = 1, cls = 'stroke-teal') {
  const S = (v) => v * s;
  return group(
    E(x, y, S(9), S(7), cls.replace('stroke', 'fill'), { transform: `rotate(-20 ${x} ${y})` }) +
      P(`M${x + S(8)} ${y} v${S(-34)} q${S(4)} ${S(12)} ${S(16)} ${S(16)}`, cls, { fill: 'none' }),
  );
}

export function check(x, y, s = 1) {
  return P(`M${x - 18 * s} ${y} l${14 * s} ${16 * s} l${26 * s} ${-34 * s}`, 'stroke-teal thick', { fill: 'none' });
}

export function cross(x, y, s = 1) {
  return P(`M${x - 14 * s} ${y - 14 * s} l${28 * s} ${28 * s} M${x + 14 * s} ${y - 14 * s} l${-28 * s} ${28 * s}`, 'stroke-coral thick', { fill: 'none' });
}

/** Ahşap metronom: ölçek, sarkaç ve ağırlık */
export function metronome(x, y, s = 1) {
  let o = '';
  o += E(0, 96, 70, 8, 'shade');
  o += P('M-50 90 L-18 -70 H18 L50 90Z', 'ink wood-g');
  o += P('M-30 70 L-10 -50 H10 L30 70Z', 'ink paper');
  for (let i = 0; i < 8; i++) {
    const yy = -40 + i * 14;
    o += P(`M-6 ${yy} H6`, 'ink thin');
  }
  o += text('60', 18, 64, { size: 11, cls: 'muted-fill' }) + text('120', 16, -24, { size: 11, cls: 'muted-fill' });
  o += P('M-36 40 l-6 30 M40 20 l6 40', 'hatch-line', { 'stroke-width': 2, opacity: 0.5 });
  o += el('rect', { x: -58, y: 88, width: 116, height: 12, rx: 3, class: 'ink wood-g' });
  o += P('M0 74 L26 -58', 'ink thick');
  o += el('rect', { x: 9, y: -20, width: 16, height: 12, rx: 2, class: 'ink metal-g', transform: 'rotate(12 17 -14)' });
  o += C(0, 74, 4, 'ink metal-g');
  o += P('M48 40 h10', 'ink') + E(64, 40, 5, 10, 'ink metal-g');
  o += text('tik', -64, -40, { size: 20, cls: 'coral-fill' }) + text('tak', 70, -40, { size: 20, cls: 'teal-fill' });
  o += P('M-6 -84 q-20 -4 -36 8 M44 -84 q-20 -10 -36 -2', 'ink thin dashed', { fill: 'none' });
  return place(x, y, s, o);
}

/** Tahtanın arka planı: soluk porte kurdelesi ve dağınık notalar (çizilmez, belirir) */
export function boardBackdrop() {
  let o = el('rect', { x: 0, y: 0, width: 800, height: 450, filter: 'url(#paper-grain)', opacity: 0.35 });
  for (let i = 0; i < 5; i++) o += P(`M-10 ${28 + i * 7} C200 ${-6 + i * 7} 420 ${70 + i * 7} 810 ${18 + i * 7}`, 'staff-deco');
  for (let i = 0; i < 5; i++) o += P(`M-10 ${424 + i * 6} C260 ${400 + i * 6} 520 ${446 + i * 6} 810 ${414 + i * 6}`, 'staff-deco');
  for (const [nx, ny] of [[120, 30], [300, 44], [520, 52], [700, 30]]) {
    o += E(nx, ny, 5, 3.6, 'deco', { transform: `rotate(-20 ${nx} ${ny})` }) + el('rect', { x: nx + 4, y: ny - 20, width: 1.4, height: 20, class: 'deco' });
  }
  return o;
}
