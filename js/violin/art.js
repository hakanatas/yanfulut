// Keman çizimleri: keman, yay, parmak yeri şeması (klavye), keman çalan çocuk,
// yay tutuşu, yayın tele değdiği yer ve yay yönü işaretleri.
import { el, group, P, C, E, place, limb, text, arrow } from '../art.js';
import { STRINGS, violinFingering } from './notes.js';

/** Üst yarısı verilen simetrik kapalı eğri (x ekseni etrafında aynalanır) */
function mirrored(start, segs) {
  let d = `M${start[0]} ${start[1]}`;
  for (const [c1, c2, e] of segs) d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`;
  const pts = [start, ...segs.map((s) => s[2])];
  for (let i = segs.length - 1; i >= 0; i--) {
    const [c1, c2] = segs[i];
    const to = pts[i];
    d += ` C${c2[0]} ${-c2[1]} ${c1[0]} ${-c1[1]} ${to[0]} ${-to[1]}`;
  }
  return d + 'Z';
}

// Gövdenin üst yarısı (yatay keman: kıvrım solda, çenelik sağda)
const BODY = mirrored(
  [250, -24],
  [
    [[254, -60], [272, -86], [300, -88]],
    [[326, -90], [344, -84], [352, -74]],
    [[356, -66], [352, -58], [360, -54]],
    [[372, -48], [392, -48], [404, -54]],
    [[412, -58], [410, -70], [418, -78]],
    [[440, -100], [500, -112], [548, -100]],
    [[584, -90], [600, -50], [600, 0]],
  ],
);

const fHole = (x, y, flip = 1) =>
  group(
    P('M-30 -2 C-18 -10 -8 8 6 2 C16 -2 22 -6 30 -2', 'ink thick', { fill: 'none' }) +
      C(-30, -2, 3.2, 'ink fill-ink') +
      C(30, -2, 3.2, 'ink fill-ink') +
      P('M-4 -6 l2 6 M4 2 l2 6', 'ink thin', { fill: 'none' }),
    { transform: `translate(${x} ${y}) scale(1 ${flip})` },
  );

/**
 * Yatay keman (kıvrım solda). Yerel koordinatlar: x 0–600, y -120–120.
 * parts: parçaları yazıyla göster. playString: titreşen tel ('G','D','A','E').
 */
export function violin(x, y, s = 1, { parts = false, highlight = [], playString } = {}) {
  const hl = new Set(highlight);
  let o = '';
  o += E(320, 128, 270, 8, 'shade');
  // Sap ve burgu kutusu
  o += P('M66 -12 L250 -16 C258 -16 258 16 250 16 L66 12Z', 'ink wood-g');
  o += P('M28 -16 C40 -20 96 -16 112 -12 L112 12 C96 16 40 20 28 16Z', 'ink wood-g');
  o += P('M40 -6 L104 -4 L104 4 L40 6Z', 'ink ebony');
  // Kıvrım (salyangoz)
  o += C(18, 0, 19, `ink ${hl.has('scroll') ? 'glow' : 'wood-g'}`) + P('M18 0 m-12 0 a12 12 0 1 1 12 12 a8 8 0 1 1 6 -8 a4 4 0 1 1 -5 1', 'ink thin', { fill: 'none' });
  // Burgular (ikisi yukarı, ikisi aşağı)
  for (const [px, dir] of [[48, -1], [86, -1], [66, 1], [100, 1]]) {
    o += P(`M${px} ${dir * 14} V${dir * 34}`, 'ink thick');
    o += E(px, dir * 42, 9, 11, `ink ${hl.has('pegs') ? 'glow' : 'ebony'}`);
  }
  // Gövde: cila, kenar süsü (purfling), parlaklık
  o += P(BODY, `ink ${hl.has('body') ? 'glow' : 'varnish'}`);
  o += P(BODY, 'ink thin', { fill: 'none', transform: 'translate(425 0) scale(0.95) translate(-425 0)', opacity: 0.6 });
  o += E(520, -46, 46, 20, 'shine-fill', { opacity: 0.25, transform: 'rotate(-8 520 -46)' });
  o += E(300, -50, 24, 12, 'shine-fill', { opacity: 0.22 });
  o += P('M268 70 C300 92 340 86 352 76 M430 92 C480 112 540 108 580 70', 'hatch-line', { 'stroke-width': 3, fill: 'none', opacity: 0.35 });
  // f delikleri
  o += fHole(408, -42) + fHole(408, 42, -1);
  if (hl.has('fholes')) o += E(408, -42, 40, 16, 'stroke-coral dashed') + E(408, 42, 40, 16, 'stroke-coral dashed');
  // Klavye
  o += P('M118 -11 L382 -20 Q390 0 382 20 L118 11Z', `ink ${hl.has('fingerboard') ? 'glow' : 'ebony'}`);
  o += el('rect', { x: 114, y: -12, width: 6, height: 24, class: 'ink paper' });
  // Kuyruk ve ince akort vidası
  o += P('M478 -15 L548 -24 Q576 -16 576 0 Q576 16 548 24 L478 15 Q472 0 478 -15Z', `ink ${hl.has('tailpiece') ? 'glow' : 'ebony'}`);
  o += C(492, -9, 3.4, 'ink metal-g');
  o += P('M576 -4 L598 -3 L598 3 L576 4', 'ink thin', { fill: 'none' });
  // Çenelik (Sol teli tarafında)
  o += P('M538 30 C548 22 586 24 594 40 C600 56 588 74 570 76 C552 78 538 66 536 52Z', `ink ${hl.has('chinrest') ? 'glow' : 'ebony'}`);
  o += C(600, 0, 4, 'ink ebony');
  // Teller: üst eşikten eşiğe, oradan kuyruğa (üstte Mi, altta Sol)
  const strings = [
    ['E', -7.5, -13.5, -9, 0.9],
    ['A', -2.5, -4.5, -3, 1.2],
    ['D', 2.5, 4.5, 3, 1.5],
    ['G', 7.5, 13.5, 9, 1.9],
  ];
  for (const [id, yn, yb, yt, w] of strings) {
    const vib = playString === id;
    o += P(`M118 ${yn} L412 ${yb} L480 ${yt}`, vib ? 'stroke-coral' : 'string', { 'stroke-width': vib ? w + 1.2 : w });
  }
  // Eşik (köprü)
  o += P('M406 -26 L414 -26 L416 -16 L413 16 L416 26 L404 26 L407 16 L404 -16Z', `ink ${hl.has('bridge') ? 'glow' : 'maple'}`);
  if (hl.has('bridge')) o += E(410, 0, 22, 38, 'stroke-coral dashed');
  if (hl.has('strings')) o += P('M140 -22 Q260 -34 380 -30 M140 22 Q260 34 380 30', 'stroke-teal dashed', { fill: 'none' });

  if (parts) {
    const lab = (str, tx, ty, ax, ay, cls = 'ink-fill') => text(str, tx, ty, { size: 22, cls }) + P(`M${tx} ${ty + (ty < ay ? 6 : -22)} L${ax} ${ay}`, 'ink thin', { fill: 'none' });
    o += lab('Kıvrım', 18, -70, 18, -20);
    o += lab('Burgular', 92, -92, 86, -52);
    o += lab('Klavye', 214, -70, 226, -16);
    o += lab('Teller', 300, 70, 300, 6);
    o += lab('Eşik', 410, -128, 410, -28);
    o += lab('f deliği', 488, -126, 430, -44);
    o += lab('Kuyruk', 516, 128, 520, 18);
    o += lab('Çenelik', 640, 64, 596, 52);
    o += lab('Gövde', 340, 128, 330, 80);
  }
  return place(x, y, s, o);
}

/** Yay (uç solda, topuk sağda). Yerel koordinatlar: x 0–570. */
export function bow(x, y, s = 1, { parts = false, flip = false } = {}) {
  let o = '';
  // Kıl (açık renk, düz) — mürekkep kenarlı
  o += P('M10 18 L492 24', 'ink', { 'stroke-width': 6 }) + P('M10 18 L492 24', 'bow-hair', { 'stroke-width': 3.5 });
  // Çubuk: hafif içe kavisli
  o += P('M4 4 C150 22 360 22 560 12', 'ink', { 'stroke-width': 8 }) + P('M4 4 C150 22 360 22 560 12', 'bow-stick');
  // Uç
  o += P('M0 0 L14 2 L14 20 L6 20 Q0 10 0 0Z', 'ink paper');
  // Sargı ve deri tutma yeri
  o += el('rect', { x: 412, y: 10, width: 40, height: 10, rx: 3, class: 'ink metal-g' });
  o += el('rect', { x: 452, y: 9, width: 16, height: 12, rx: 3, class: 'ink skin-g' });
  // Topuk (kurbağa) ve gözü
  o += P('M470 10 L522 10 L524 36 Q500 40 476 32Z', 'ink ebony');
  o += C(498, 22, 4.5, 'ink pearl');
  o += el('rect', { x: 522, y: 9, width: 10, height: 6, class: 'ink metal-g' });
  // Vida
  o += el('rect', { x: 536, y: 6, width: 26, height: 10, rx: 3, class: 'ink metal-g' });
  if (parts) {
    o += text('Uç', 8, -18, { size: 22 }) + text('Kıl', 220, 58, { size: 22, cls: 'muted-fill' }) + text('Çubuk', 220, -4, { size: 22 });
    o += text('Topuk', 498, 68, { size: 22 }) + text('Vida', 556, -10, { size: 22 });
  }
  return place(x, y, s, flip ? group(o, { transform: 'scale(-1 1) translate(-570 0)' }) : o);
}

// Parmak yerleri (üst eşikten uzaklık): yarım ses başına eşit tampere oranları
const SEMI_POS = [0, 42, 82, 119, 154, 188, 220, 250];

/**
 * Klavye üzerinde parmak yeri şeması (dikey: üst eşik yukarıda, teller soldan sağa Sol Re La Mi).
 * Yerel koordinatlar: x 0–180, y 0–330.
 */
export function fingerboard(x, y, s = 1, { note, all = false } = {}) {
  let o = '';
  const top = 48;
  const sx = (i, yy) => 40 + i * 33 + ((i - 1.5) * yy) / 40; // teller aşağı doğru hafifçe açılır
  o += P(`M22 ${top} L158 ${top} L172 ${top + 280} L8 ${top + 280}Z`, 'ink ebony');
  o += el('rect', { x: 18, y: top - 8, width: 144, height: 9, rx: 2, class: 'ink paper' });
  // Başlangıç bantları: 1. parmak, yüksek 2 ve 3. parmak yerleri
  for (const n of [2, 4, 5]) o += P(`M${sx(0, SEMI_POS[n]) - 14} ${top + SEMI_POS[n]} L${sx(3, SEMI_POS[n]) + 14} ${top + SEMI_POS[n]}`, 'tape');
  STRINGS.forEach((st, i) => {
    o += P(`M${sx(i, 0)} ${top} L${sx(i, 280)} ${top + 280}`, 'string', { 'stroke-width': 1 + (3 - i) * 0.35 });
    o += text(st.name, sx(i, 280), top + 306, { size: 18 });
  });
  const dot = (i, n, finger, cls) => {
    const cx = sx(i, SEMI_POS[n]);
    const cy = top + SEMI_POS[n] - 14;
    return C(cx, cy, 12, `ink ${cls}`) + text(String(finger), cx, cy + 6, { size: 17, cls: cls === 'fill-coral' ? 'paper-fill' : 'ink-fill', weight: 700 });
  };
  if (all) {
    STRINGS.forEach((_, i) => [[2, 1], [4, 2], [5, 3]].forEach(([n, f]) => (o += dot(i, n, f, 'paper'))));
  }
  if (note) {
    const f = violinFingering(note);
    const i = STRINGS.findIndex((st) => st.id === f.string);
    if (f.finger === 0) {
      o += C(sx(i, 0), top - 24, 12, 'ink stroke-coral') + text('0', sx(i, 0), top - 18, { size: 17, cls: 'coral-fill', weight: 700 });
    } else {
      o += dot(i, f.semis, f.finger, 'fill-coral');
      if (f.kind) o += text(f.kind === 'low' ? 'alçak' : 'yüksek', sx(i, SEMI_POS[f.semis]) + (i < 2 ? 34 : -34), top + SEMI_POS[f.semis] + 14, { size: 15, cls: 'coral-fill', weight: 700 });
    }
    o += P(`M${sx(i, 0)} ${top} L${sx(i, 280)} ${top + 280}`, 'stroke-coral', { 'stroke-width': 2, opacity: 0.6 });
  }
  return place(x, y, s, o);
}

/** Keman çalan çocuk (önden): keman sol omuzda, yay sağ elde */
export function violinist(x, y, s = 1) {
  let o = '';
  o += P('M-70 210 C-74 130 -66 84 -34 72 L-14 66 Q0 74 14 66 L34 72 C66 84 74 130 70 210Z', 'ink shirt');
  o += P('M-14 66 L0 92 L14 66', 'ink', { fill: 'none' });
  for (const by of [118, 148, 178]) o += C(0, by, 3, 'ink paper');
  o += el('rect', { x: -12, y: 30, width: 24, height: 40, rx: 8, class: 'ink skin-g' });
  // Sol kol (bize göre sağda) kemanın sapını tutar
  o += limb('M54 90 C96 140 140 120 168 40', 20, 'shirt') + limb('M168 40 L182 10', 16, 'skin-st');
  // Kafa
  o += E(-40, 6, 8, 12, 'ink skin-g') + E(40, 6, 8, 12, 'ink skin-g');
  o += C(0, 0, 40, 'ink skin-g');
  o += P('M-41 -2 C-46 -44 -16 -56 4 -54 C30 -52 48 -36 42 -2 C34 -18 26 -24 18 -20 C10 -30 -6 -32 -14 -22 C-22 -28 -34 -20 -41 -2Z', 'ink hair');
  o += P('M-22 -4 q7 -6 14 -2 M8 -6 q7 -4 14 0', 'ink', { fill: 'none' });
  o += P('M-20 6 q5 -4 10 0 M8 4 q5 -4 10 0', 'ink', { fill: 'none' });
  o += P('M-8 20 q8 6 16 0', 'ink', { fill: 'none' });
  o += E(-24, 14, 7, 4, 'fill-coral', { opacity: 0.5 }) + E(26, 12, 7, 4, 'fill-coral', { opacity: 0.5 });
  // Keman: çenelik çenenin altında, kıvrım bize göre sağa ve yukarı
  o += group(violin(0, 0, 1, {}), { transform: 'translate(22 50) rotate(-14) scale(-0.42 0.42) translate(-600 0)' });
  // Sol el kemanın sapında
  o += C(186, 6, 11, 'ink skin-g') + P('M180 -2 q-6 -8 2 -12 M188 -4 q-4 -10 4 -12', 'ink thin', { fill: 'none' });
  // Sağ kol ve yay (tellere dik, eşik yakınında)
  o += limb('M-54 92 C-66 176 40 196 108 168', 20, 'shirt') + limb('M108 168 L128 156', 16, 'skin-st');
  o += group(bow(0, 0, 1), { transform: 'translate(130 154) rotate(76) scale(0.55) translate(-460 -15)' });
  o += C(130, 154, 12, 'ink skin-g') + P('M122 146 q6 -6 14 -2', 'ink thin', { fill: 'none' });
  return place(x, y, s, o);
}

/** Yay tutuşu: el dışarıdan görünüyor; parmaklar çubuğun üstünden sarkar, başparmak altta bükük */
export function bowHold(x, y, s = 1) {
  let o = '';
  // Yay: çubuk, kıl, sargı ve topuk
  o += P('M-40 70 C80 76 240 76 380 70', 'ink', { 'stroke-width': 13 }) + P('M-40 70 C80 76 240 76 380 70', 'bow-stick', { 'stroke-width': 9 });
  o += P('M-40 100 L330 102', 'ink', { 'stroke-width': 7 }) + P('M-40 100 L330 102', 'bow-hair', { 'stroke-width': 4 });
  o += el('rect', { x: 196, y: 64, width: 52, height: 14, rx: 4, class: 'ink metal-g' });
  o += P('M258 72 L336 72 L338 116 Q300 124 262 112Z', 'ink ebony') + C(298, 94, 7, 'ink pearl');
  // Başparmak: çubuğun altından gelir, bükük; ucu topuğun hemen önünde çubuğa değer
  o += P('M196 132 C198 112 220 98 240 84 C250 78 260 86 254 94 C242 106 226 118 218 136Z', 'ink skin-g');
  o += P('M236 92 q6 -2 10 2', 'ink thin', { fill: 'none' });
  // Elin üstü (boğumlarıyla)
  o += P('M100 46 C94 12 126 -6 156 0 C172 -12 198 -12 212 0 C228 -10 252 -8 262 6 C278 2 300 12 302 32 C304 48 292 58 278 60 L122 62 C106 62 100 56 100 46Z', 'ink skin-g');
  o += P('M150 16 q8 -6 16 0 M192 12 q8 -6 16 0 M232 16 q8 -6 16 0', 'ink thin', { fill: 'none', opacity: 0.6 });
  // Parmaklar: işaret öne eğik, orta ve yüzük çubuğun üstünden aşağı sarkar
  const finger = (x1, y1, x2, y2, w) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const nx = -Math.sin(a) * w;
    const ny = Math.cos(a) * w;
    return P(`M${x1 + nx} ${y1 + ny} L${x2 + nx} ${y2 + ny} A${w} ${w} 0 0 1 ${x2 - nx} ${y2 - ny} L${x1 - nx} ${y1 - ny}Z`, 'ink skin-g');
  };
  o += finger(132, 50, 122, 100, 11) + finger(176, 56, 178, 102, 11) + finger(218, 56, 222, 100, 10.5);
  // Serçe: yuvarlak, ucu çubuğun üstünde
  o += P('M258 52 C262 34 294 34 296 52 C296 64 288 68 280 66 C278 58 270 54 262 58Z', 'ink skin-g');
  // Parmak numaraları
  const tag = (cx, cy, n, cls = 'paper') => C(cx, cy, 10, `ink ${cls}`) + text(n, cx, cy + 6, { size: 15, weight: 700, cls: cls === 'paper' ? 'ink-fill' : 'paper-fill' });
  o += tag(122, 126, '1') + tag(178, 128, '2') + tag(222, 126, '3') + tag(296, 30, '4') + tag(256, 148, 'B', 'fill-coral');
  return place(x, y, s, o);
}

/** Yukarıdan bakış: yay eşik ile klavye arasında, tellere dik */
export function contactPoint(x, y, s = 1) {
  let o = '';
  o += P('M0 20 L140 30 L140 130 L0 140Z', 'ink ebony');
  o += P('M372 10 L384 10 L388 150 L368 150Z', 'ink maple');
  for (let i = 0; i < 4; i++) o += P(`M0 ${48 + i * 22} L480 ${40 + i * 27}`, 'string', { 'stroke-width': 2 - i * 0.3 });
  o += P('M255 -10 L255 170', 'bow-hair', { 'stroke-width': 8 });
  o += P('M247 -10 L247 170', 'bow-stick', { 'stroke-width': 6 });
  o += P('M226 -6 L320 176', 'stroke-coral dashed', { fill: 'none' });
  o += text('klavye', 70, 172, { size: 20, cls: 'muted-fill' }) + text('eşik', 378, 176, { size: 20, cls: 'muted-fill' });
  o += arrow(250, -34, 250, -14, { cls: 'stroke-teal thick' });
  return place(x, y, s, o);
}

/** Yay yönü işaretleri: aşağı yay (⊓) ve yukarı yay (V) */
export function bowMarks(x, y, s = 1) {
  let o = '';
  o += P('M0 40 V0 H44 V40', 'ink thick', { fill: 'none', 'stroke-width': 7 });
  o += P('M150 0 L172 44 L194 0', 'ink thick', { fill: 'none', 'stroke-width': 6 });
  return place(x, y, s, o);
}

/** Reçine (kolofan) kalıbı */
export function rosin(x, y, s = 1) {
  let o = '';
  o += E(0, 40, 70, 8, 'shade');
  o += el('rect', { x: -60, y: 8, width: 120, height: 28, rx: 6, class: 'ink wood-g' });
  o += E(0, 8, 54, 16, 'ink amber');
  o += E(-14, 4, 16, 5, 'shine-fill', { opacity: 0.5 });
  o += P('M-20 10 l30 -4', 'ink thin', { fill: 'none', opacity: 0.5 });
  return place(x, y, s, o);
}
