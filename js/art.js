// Ders sahnelerinde kullanılan çizimler. Her fonksiyon bir SVG parçası (metin) döndürür.
// Çizimler 800x450'lik bir "tahta" üzerine yerleştirilir ve sketch.js tarafından
// çizgi çizgi çiziliyormuş gibi canlandırılır.
import { fingeringOf, staffStep, parseNote } from './data/notes.js';

const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');

export const el = (tag, a = {}, inner = '') => `<${tag} ${attrs(a)}>${inner}</${tag}>`;
export const group = (inner, a = {}) => el('g', a, inner);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

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
    el('path', { d: `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`, class: cls, fill: 'none' }) +
      el('path', {
        d: `M${x2 + h * Math.cos(a1)} ${y2 + h * Math.sin(a1)} L${x2} ${y2} L${x2 + h * Math.cos(a2)} ${y2 + h * Math.sin(a2)}`,
        class: cls,
        fill: 'none',
      }),
  );
}

/** Dalgalı hava akımı çizgileri */
export function air(x, y, len = 120, { lines = 3, gap = 12, cls = 'stroke-sky' } = {}) {
  let out = '';
  for (let i = 0; i < lines; i++) {
    const yy = y + (i - (lines - 1) / 2) * gap;
    let d = `M${x} ${yy}`;
    const waves = Math.max(2, Math.round(len / 30));
    const step = len / waves;
    for (let k = 0; k < waves; k++) d += ` q${step / 4} ${k % 2 ? 6 : -6} ${step / 2} 0 t${step / 2} 0`;
    out += el('path', { d, class: cls, fill: 'none' });
  }
  return group(out);
}

export function underline(x, y, w, cls = 'stroke-coral') {
  return el('path', { d: `M${x} ${y} q${w / 2} 8 ${w} -2`, class: cls, fill: 'none' });
}

export function circleMark(cx, cy, rx, ry = rx, cls = 'stroke-coral') {
  // Elle çizilmiş gibi tam kapanmayan bir halka
  const d = `M${cx - rx} ${cy} a${rx} ${ry} 0 1 1 ${rx * 0.2} ${ry * 0.95} q${-rx * 0.4} ${-ry * 0.2} ${-rx * 0.35} ${-ry * 1.1}`;
  return el('path', { d, class: `${cls} thick`, fill: 'none' });
}

// ---------------------------------------------------------------------------
// Flüt

/** Flüt üzerindeki anahtarların konumları (flüt genişliğine oranla) */
const KEY_POS = {
  l1: 0.4,
  l2: 0.46,
  l3: 0.52,
  r1: 0.63,
  r2: 0.69,
  r3: 0.75,
};

/**
 * Yatay bir yan flüt çizer.
 * @param {object} o
 * @param {string} [o.note] Parmak pozisyonu gösterilecek nota
 * @param {string[]} [o.highlight] Vurgulanacak anahtarlar ya da 'head','body','foot','hole'
 * @param {boolean} [o.labels] Parmak numaralarını yaz
 */
export function flute({ x = 80, y = 220, w = 640, note, highlight = [], labels = false, parts = false } = {}) {
  const s = w / 640;
  const h = 26 * s;
  const top = y - h / 2;
  const pressed = note ? fingeringOf(note) : new Set();
  const X = (r) => x + r * w;
  const hl = new Set(highlight);
  let out = '';

  // Gövde parçaları
  const tube = (a, b, cls) => el('rect', { x: X(a), y: top, width: X(b) - X(a), height: h, rx: 4 * s, class: `ink metal ${cls || ''}` });
  out += el('rect', { x: x, y: top - 2 * s, width: 16 * s, height: h + 4 * s, rx: 5 * s, class: 'ink metal' }); // taç
  out += tube(0.025, 0.3, hl.has('head') ? 'glow' : '');
  out += tube(0.3, 0.84, hl.has('body') ? 'glow' : '');
  out += tube(0.84, 1, hl.has('foot') ? 'glow' : '');
  // Bağlantı halkaları
  for (const r of [0.3, 0.84]) out += el('rect', { x: X(r) - 3 * s, y: top - 3 * s, width: 6 * s, height: h + 6 * s, rx: 2 * s, class: 'ink metal' });
  // Dudaklık ve üfleme deliği
  out += el('ellipse', { cx: X(0.13), cy: y, rx: 30 * s, ry: h * 0.62, class: `ink metal ${hl.has('hole') ? 'glow' : ''}` });
  out += el('ellipse', { cx: X(0.13) + 2 * s, cy: y, rx: 10 * s, ry: 6 * s, class: 'ink hole' });

  // Anahtar milleri (dekoratif)
  out += el('line', { x1: X(0.36), y1: top + 3 * s, x2: X(0.95), y2: top + 3 * s, class: 'ink thin' });

  const key = (id, cx, cy, rx, ry = rx) => {
    const isDown = pressed.has(id);
    out += el('ellipse', {
      cx,
      cy,
      rx,
      ry,
      class: `ink key ${isDown ? 'down' : 'up'}`,
      'data-key': id,
    });
    if (hl.has(id)) out += el('ellipse', { cx, cy, rx: rx + 7 * s, ry: ry + 7 * s, class: 'stroke-coral dashed', fill: 'none' });
  };

  for (const [id, r] of Object.entries(KEY_POS)) key(id, X(r), y, 11 * s);
  // Başparmak anahtarı (flütün arkasında, alttan görünür)
  key('th', X(0.4) - 6 * s, y + h / 2 + 12 * s, 12 * s, 7 * s);
  // Sol serçe parmak: Sol diyez kolu
  key('gs', X(0.565), y + h / 2 + 10 * s, 9 * s, 6 * s);
  // Sağ serçe parmak: Mi bemol kolu
  key('eb', X(0.8), y + h / 2 + 10 * s, 11 * s, 6 * s);
  // Ayak: pes Do anahtarı
  key('c', X(0.93), y + h / 2 + 10 * s, 11 * s, 6 * s);

  if (labels) {
    const ly = top - 18 * s;
    out += text('Sol el', X(0.46), ly - 22 * s, { size: 22 * s, cls: 'muted-fill' });
    out += text('Sağ el', X(0.69), ly - 22 * s, { size: 22 * s, cls: 'muted-fill' });
    for (const [id, r] of Object.entries(KEY_POS)) out += text(id[1], X(r), ly, { size: 20 * s, cls: 'muted-fill' });
    out += text('başparmak', X(0.4) - 6 * s, y + h / 2 + 42 * s, { size: 16 * s, cls: 'muted-fill' });
    out += text('serçe', X(0.8), y + h / 2 + 36 * s, { size: 16 * s, cls: 'muted-fill' });
  }

  if (parts) {
    const py = y + h / 2 + 64 * s;
    out += brace(X(0.025), X(0.3), py - 22 * s, s) + text('Baş', X(0.16), py + 8 * s, { size: 26 * s });
    out += brace(X(0.3), X(0.84), py - 22 * s, s) + text('Gövde', X(0.57), py + 8 * s, { size: 26 * s });
    out += brace(X(0.84), X(1), py - 22 * s, s) + text('Ayak', X(0.92), py + 8 * s, { size: 26 * s });
  }
  return group(out, { class: 'flute' });
}

function brace(x1, x2, y, s = 1) {
  const m = (x1 + x2) / 2;
  const d = 8 * s;
  return el('path', { d: `M${x1} ${y - d} q0 ${d} ${d} ${d} L${m - d} ${y} q${d} 0 ${d} ${d} q0 ${-d} ${d} ${-d} L${x2 - d} ${y} q${d} 0 ${d} ${-d}`, class: 'ink thin', fill: 'none' });
}

// ---------------------------------------------------------------------------
// Porte (dizek)

export function staff({ x = 100, y = 120, w = 600, sp = 16, notes = [], clef = true, values } = {}) {
  let out = '';
  const bottom = y + sp * 4;
  for (let i = 0; i < 5; i++) out += el('line', { x1: x, y1: y + i * sp, x2: x + w, y2: y + i * sp, class: 'ink thin' });
  if (clef) out += el('text', { x: x + sp * 0.3, y: bottom + sp * 1.05, 'font-size': sp * 6.6, class: 'clef ink-fill' }, '𝄞');
  const startX = x + (clef ? sp * 6.5 : sp * 1.5);
  const gap = notes.length > 1 ? (x + w - sp * 2 - startX) / (notes.length - 1) : 0;
  notes.forEach((n, i) => {
    out += noteHead(n, startX + (notes.length > 1 ? gap * i : (x + w - startX) / 2 - sp), bottom, sp, values?.[i]);
  });
  return group(out, { class: 'staff' });
}

/** Porte üzerinde tek bir nota (ek çizgiler, işaret ve sapıyla birlikte) */
export function noteHead(id, cx, bottomLineY, sp = 16, value = 'quarter', cls = '') {
  const step = staffStep(id);
  const cy = bottomLineY - (step * sp) / 2;
  let out = '';
  // Ek çizgiler
  for (let s = -2; s >= step; s -= 2) out += el('line', { x1: cx - sp, y1: bottomLineY - (s * sp) / 2, x2: cx + sp, y2: bottomLineY - (s * sp) / 2, class: 'ink thin' });
  for (let s = 10; s <= step; s += 2) out += el('line', { x1: cx - sp, y1: bottomLineY - (s * sp) / 2, x2: cx + sp, y2: bottomLineY - (s * sp) / 2, class: 'ink thin' });
  const { alter } = parseNote(id);
  if (alter) out += el('text', { x: cx - sp * 1.5, y: cy + sp * 0.5, 'font-size': sp * 2.6, 'text-anchor': 'middle', class: 'clef ink-fill' }, alter > 0 ? '♯' : '♭');
  out += noteSymbol(cx, cy, sp, value, step >= 4);
  return group(out, { class: cls, 'data-note': id });
}

/** Nota değeri sembolü. stemDown: sap aşağı */
export function noteSymbol(cx, cy, sp = 16, value = 'quarter', stemDown = false) {
  const open = value === 'whole' || value === 'half';
  const rx = sp * 0.68;
  const ry = sp * 0.48;
  let out = el('ellipse', { cx, cy, rx, ry, transform: `rotate(-20 ${cx} ${cy})`, class: `ink ${open ? 'paper' : 'solid'}` });
  if (value !== 'whole') {
    const sx = stemDown ? cx - rx + 1 : cx + rx - 1;
    const sy2 = stemDown ? cy + sp * 3.3 : cy - sp * 3.3;
    out += el('line', { x1: sx, y1: cy, x2: sx, y2: sy2, class: 'ink' });
    if (value === 'eighth') {
      const dir = stemDown ? -1 : 1;
      out += el('path', { d: `M${sx} ${sy2} q${sp * 0.2} ${dir * sp * 1.2} ${sp * 1.1} ${dir * sp * 1.6} q${sp * 0.4} ${dir * sp * 0.5} ${sp * 0.1} ${dir * sp * 1.5}`, class: 'ink', fill: 'none' });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Maskot: "Nota" — yüzü olan sekizlik nota

export function mascot({ x = 120, y = 300, s = 1, mood = 'happy', wave = false } = {}) {
  const S = (v) => v * s;
  let out = '';
  // Sap ve bayrak
  out += el('path', { d: `M${x + S(30)} ${y - S(8)} L${x + S(30)} ${y - S(118)}`, class: 'ink thick', fill: 'none' });
  out += el('path', { d: `M${x + S(30)} ${y - S(118)} q${S(6)} ${S(28)} ${S(34)} ${S(40)} q${S(18)} ${S(14)} ${S(4)} ${S(44)}`, class: 'ink thick', fill: 'none' });
  // Kollar
  if (wave) out += el('path', { d: `M${x - S(28)} ${y - S(10)} q${S(-30)} ${S(-20)} ${S(-26)} ${S(-52)}`, class: 'ink', fill: 'none' });
  else out += el('path', { d: `M${x - S(30)} ${y} q${S(-22)} ${S(10)} ${S(-28)} ${S(30)}`, class: 'ink', fill: 'none' });
  // Bacaklar
  out += el('path', { d: `M${x - S(10)} ${y + S(24)} l${S(-6)} ${S(26)} l${S(-12)} 0`, class: 'ink', fill: 'none' });
  out += el('path', { d: `M${x + S(12)} ${y + S(24)} l${S(4)} ${S(26)} l${S(12)} 0`, class: 'ink', fill: 'none' });
  // Kafa (nota başı)
  out += el('ellipse', { cx: x, cy: y, rx: S(38), ry: S(28), transform: `rotate(-18 ${x} ${y})`, class: 'ink solid' });
  // Yüz
  const eye = (ex) =>
    mood === 'wink' && ex > x
      ? el('path', { d: `M${ex - S(6)} ${y - S(6)} q${S(6)} ${S(-6)} ${S(12)} 0`, class: 'stroke-paper', fill: 'none' })
      : el('ellipse', { cx: ex, cy: y - S(6), rx: S(6.5), ry: S(8), class: 'fill-paper' }) +
        el('circle', { cx: ex + S(1.5), cy: y - S(4), r: S(3.2), class: 'ink-fill' });
  out += eye(x - S(13)) + eye(x + S(11));
  out += el('ellipse', { cx: x - S(24), cy: y + S(8), rx: S(6), ry: S(4), class: 'fill-coral' });
  out += el('ellipse', { cx: x + S(22), cy: y + S(4), rx: S(6), ry: S(4), class: 'fill-coral' });
  if (mood === 'wow') out += el('ellipse', { cx: x, cy: y + S(10), rx: S(6), ry: S(8), class: 'fill-paper' });
  else out += el('path', { d: `M${x - S(10)} ${y + S(8)} q${S(10)} ${S(12)} ${S(20)} ${S(-2)}`, class: 'stroke-paper', fill: 'none' });
  return group(out, { class: 'mascot' });
}

/** Konuşma balonu */
export function bubble(str, x, y, { w = 260, h = 70, size = 24, tail = 'left' } = {}) {
  const tx = tail === 'left' ? x + 30 : x + w - 30;
  const d = `M${x + 16} ${y} H${x + w - 16} Q${x + w} ${y} ${x + w} ${y + 16} V${y + h - 16} Q${x + w} ${y + h} ${x + w - 16} ${y + h} H${tx + 14} L${tx - (tail === 'left' ? 20 : -20)} ${y + h + 22} L${tx} ${y + h} H${x + 16} Q${x} ${y + h} ${x} ${y + h - 16} V${y + 16} Q${x} ${y} ${x + 16} ${y}Z`;
  return group(el('path', { d, class: 'ink paper' }) + text(str, x + w / 2, y + h / 2 + size * 0.35, { size }));
}

// ---------------------------------------------------------------------------
// Ders çizimleri

export function bottle(x, y, s = 1) {
  const S = (v) => v * s;
  const d = `M${x - S(14)} ${y} v${S(30)} q0 ${S(20)} ${S(-30)} ${S(40)} v${S(130)} q0 ${S(14)} ${S(14)} ${S(14)} h${S(60)} q${S(14)} 0 ${S(14)} ${S(-14)} v${S(-130)} q${S(-30)} ${S(-20)} ${S(-30)} ${S(-40)} v${S(-30)} z`;
  return group(
    el('path', { d, class: 'ink glass' }) +
      el('ellipse', { cx: x, cy: y, rx: S(14), ry: S(4), class: 'ink paper' }) +
      el('path', { d: `M${x - S(30)} ${y + S(90)} v${S(80)}`, class: 'stroke-paper thick', fill: 'none' }),
  );
}

/** Yandan görünüş: dudaklar ve flütün kesiti */
export function embouchure(x, y, s = 1) {
  const S = (v) => v * s;
  let out = '';
  // Flüt kesiti
  out += el('circle', { cx: x + S(150), cy: y + S(70), r: S(56), class: 'ink metal' });
  out += el('circle', { cx: x + S(150), cy: y + S(70), r: S(44), class: 'ink paper' });
  // Üfleme deliği (üstte bir boşluk)
  out += el('rect', { x: x + S(132), y: y + S(8), width: S(34), height: S(12), class: 'fill-paper' });
  // Dudaklar
  out += el('path', { d: `M${x - S(40)} ${y - S(30)} q${S(50)} ${S(-10)} ${S(78)} ${S(20)} q${S(8)} ${S(10)} 0 ${S(14)} q${S(-30)} ${S(4)} ${S(-78)} ${S(-4)}z`, class: 'ink fill-coral' });
  out += el('path', { d: `M${x - S(40)} ${y + S(40)} q${S(50)} ${S(10)} ${S(80)} ${S(-24)} q${S(4)} ${S(-8)} ${S(-6)} ${S(-10)} q${S(-30)} ${S(2)} ${S(-74)} ${S(8)}z`, class: 'ink fill-coral' });
  return group(out);
}

export function person(x, y, s = 1, { flute: withFlute = true } = {}) {
  const S = (v) => v * s;
  let out = '';
  out += el('circle', { cx: x, cy: y, r: S(40), class: 'ink skin' });
  out += el('path', { d: `M${x - S(40)} ${y - S(6)} q${S(4)} ${S(-44)} ${S(40)} ${S(-40)} q${S(36)} ${S(-2)} ${S(40)} ${S(36)} q${S(-30)} ${S(-20)} ${S(-80)} ${S(4)}z`, class: 'ink hair' });
  out += el('circle', { cx: x - S(14), cy: y + S(2), r: S(3.5), class: 'ink-fill' });
  out += el('circle', { cx: x + S(14), cy: y + S(2), r: S(3.5), class: 'ink-fill' });
  // Gövde
  out += el('path', { d: `M${x - S(46)} ${y + S(150)} q${S(-4)} ${S(-90)} ${S(46)} ${S(-100)} q${S(50)} ${S(10)} ${S(46)} ${S(100)}`, class: 'ink shirt' });
  if (withFlute) {
    // Flüt sağa doğru, ağız hizasında
    out += el('rect', { x: x - S(36), y: y + S(20), width: S(250), height: S(10), rx: S(4), class: 'ink metal' });
    // Kollar
    out += el('path', { d: `M${x - S(36)} ${y + S(70)} q${S(-26)} ${S(-20)} ${S(-6)} ${S(-44)}`, class: 'ink', fill: 'none' });
    out += el('path', { d: `M${x + S(36)} ${y + S(70)} q${S(60)} ${S(20)} ${S(110)} ${S(-40)}`, class: 'ink', fill: 'none' });
    out += el('circle', { cx: x + S(146), cy: y + S(28), r: S(9), class: 'ink skin' });
    out += el('circle', { cx: x - S(8), cy: y + S(29), r: S(9), class: 'ink skin' });
  } else {
    out += el('path', { d: `M${x - S(10)} ${y + S(20)} q${S(10)} ${S(6)} ${S(20)} 0`, class: 'ink', fill: 'none' });
  }
  return group(out);
}

/** Nefes egzersizi için gövde ve karın balonu */
export function belly(x, y, s = 1) {
  const S = (v) => v * s;
  let out = '';
  out += el('circle', { cx: x, cy: y, r: S(30), class: 'ink skin' });
  out += el('path', { d: `M${x - S(50)} ${y + S(200)} q${S(-10)} ${S(-150)} ${S(50)} ${S(-166)} q${S(60)} ${S(16)} ${S(50)} ${S(166)}`, class: 'ink shirt' });
  out += el('ellipse', { cx: x, cy: y + S(140), rx: S(36), ry: S(34), class: 'stroke-coral dashed fill-sun-soft' });
  return group(out);
}

export function sparkle(x, y, s = 1, cls = 'stroke-sun') {
  const S = (v) => v * s;
  return el('path', { d: `M${x} ${y - S(14)} v${S(28)} M${x - S(14)} ${y} h${S(28)} M${x - S(8)} ${y - S(8)} l${S(16)} ${S(16)} M${x + S(8)} ${y - S(8)} l${S(-16)} ${S(16)}`, class: `${cls} thick`, fill: 'none' });
}

export function musicNote(x, y, s = 1, cls = 'stroke-teal') {
  const S = (v) => v * s;
  return group(
    el('ellipse', { cx: x, cy: y, rx: S(9), ry: S(7), transform: `rotate(-20 ${x} ${y})`, class: cls.replace('stroke', 'fill') }) +
      el('path', { d: `M${x + S(8)} ${y} v${S(-34)} q${S(4)} ${S(12)} ${S(16)} ${S(16)}`, class: cls, fill: 'none' }),
  );
}

export function check(x, y, s = 1) {
  return el('path', { d: `M${x - 18 * s} ${y} l${14 * s} ${16 * s} l${26 * s} ${-34 * s}`, class: 'stroke-teal thick', fill: 'none' });
}

export function cross(x, y, s = 1) {
  return el('path', { d: `M${x - 14 * s} ${y - 14 * s} l${28 * s} ${28 * s} M${x + 14 * s} ${y - 14 * s} l${-28 * s} ${28 * s}`, class: 'stroke-coral thick', fill: 'none' });
}

/** Basit metronom çizimi */
export function metronome(x, y, s = 1) {
  const S = (v) => v * s;
  return group(
    el('path', { d: `M${x - S(40)} ${y + S(80)} L${x - S(16)} ${y - S(60)} h${S(32)} L${x + S(40)} ${y + S(80)}z`, class: 'ink wood' }) +
      el('line', { x1: x, y1: y + S(56), x2: x + S(26), y2: y - S(50), class: 'ink thick' }) +
      el('rect', { x: x + S(10), y: y - S(16), width: S(16), height: S(12), class: 'ink solid' }),
  );
}
