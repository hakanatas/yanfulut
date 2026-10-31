// Piyano klavyesi: beyaz ve siyah tuşlar, basma/bırakma, vurgulama (doğru, yanlış, ipucu) ve tuş adları.
// Ders yolundaki Nota Okuma alıştırmaları ve Klavye sayfası kullanır.
import { midiOf, noteFromMidi, parseNote } from './data/notes.js';

const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

const WHITE = [0, 2, 4, 5, 7, 9, 11];
const isWhite = (m) => WHITE.includes(((m % 12) + 12) % 12);
/** Siyah tuşun beyazlar arasındaki konumu (sol beyaz tuşa göre kaydırma) */
const BLACK_SHIFT = { 1: 0.62, 3: 0.72, 6: 0.6, 8: 0.66, 10: 0.74 };

/** Bir midi aralığındaki tuşlar: {midi, white, x, w} (beyaz tuş genişliği 1 birim) */
function layout(from, to) {
  const keys = [];
  let wx = 0;
  for (let m = from; m <= to; m++) {
    if (isWhite(m)) {
      keys.push({ midi: m, white: true, x: wx, w: 1 });
      wx++;
    } else {
      keys.push({ midi: m, white: false, x: wx - 1 + BLACK_SHIFT[m % 12], w: 0.6 });
    }
  }
  return { keys, whites: wx };
}

/** Aralığı tam oktavlara (Do'dan Si'ye) genişletir */
export function keyboardRange(notes, { min = 'C4', max = 'B4' } = {}) {
  const ms = notes.map(midiOf);
  let lo = Math.min(midiOf(min), ...ms);
  let hi = Math.max(midiOf(max), ...ms);
  lo -= ((lo % 12) + 12) % 12; // Do'ya in
  hi += 11 - (((hi % 12) + 12) % 12); // Si'ye çık
  return [lo, hi];
}

/** Durağan klavye çizimi (Klavye sayfası ve küçük resimler): marked notalar boyanır */
export function keyboardSvg({ from = 'C4', to = 'B4', marked = [], labels = false, cls = 'kb' } = {}) {
  const [lo, hi] = [midiOf(from), midiOf(to)];
  const { keys, whites } = layout(lo, hi);
  const W = 40;
  const H = 150;
  const mark = new Set(marked.map(midiOf));
  const draw = (k) => {
    const on = mark.has(k.midi) ? ' marked' : '';
    if (k.white) {
      const id = noteFromMidi(k.midi);
      return `<g class="key white${on}" data-midi="${k.midi}"><rect x="${k.x * W + 1}" y="1" width="${W - 2}" height="${H}" rx="5"/>${
        labels || mark.has(k.midi) ? `<text x="${k.x * W + W / 2}" y="${H - 12}" text-anchor="middle" class="key-label">${SOLFEGE[parseNote(id).letter]}</text>` : ''
      }${k.midi === 60 ? `<circle cx="${k.x * W + W / 2}" cy="${H - 34}" r="3.5" class="mid-c-dot"/>` : ''}</g>`;
    }
    return `<g class="key black${on}" data-midi="${k.midi}"><rect x="${k.x * W}" y="1" width="${k.w * W}" height="${H * 0.62}" rx="4"/></g>`;
  };
  return `<svg class="${cls}" viewBox="0 0 ${whites * W + 2} ${H + 4}" role="img" aria-label="Piyano klavyesi">
    ${keys.filter((k) => k.white).map(draw).join('')}${keys.filter((k) => !k.white).map(draw).join('')}</svg>`;
}

/**
 * Etkileşimli klavye. onPress(midi) basılınca, onRelease(midi) bırakılınca çağrılır.
 * @returns {{el, setLabels(on), flash(midi, kind), hint(midi), clear(), destroy()}}
 */
export function createKeyboard({ from, to, labels = false, onPress, onRelease }) {
  const el = document.createElement('div');
  el.className = 'kb-wrap';
  const render = () => {
    el.innerHTML = keyboardSvg({ from: noteFromMidi(from), to: noteFromMidi(to), labels, cls: 'kb kb-live' });
    // Tuşlar gerçek boyuta yakın kalsın: tek oktav ekranı kaplamasın
    el.querySelector('svg').style.maxWidth = `${layout(from, to).whites * 60}px`;
  };
  render();
  let down = null;
  const keyOf = (e) => e.target.closest?.('.key');
  const press = (e) => {
    const k = keyOf(e);
    if (!k) return;
    e.preventDefault();
    try {
      k.setPointerCapture?.(e.pointerId); // parmak tuştan kaysa da bırakılana kadar bu tuş sayılır
    } catch {
      /* bazı tarayıcılarda/yapay olaylarda yakalanamaz: önemsiz */
    }
    release();
    down = Number(k.dataset.midi);
    k.classList.add('down');
    onPress?.(down);
  };
  const release = () => {
    if (down == null) return;
    el.querySelector(`.key[data-midi="${down}"]`)?.classList.remove('down');
    const m = down;
    down = null;
    onRelease?.(m);
  };
  el.addEventListener('pointerdown', press);
  for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(t, release);
  const timers = new Set();
  const keyEl = (m) => el.querySelector(`.key[data-midi="${m}"]`);
  return {
    el,
    setLabels(on) {
      labels = on;
      render();
    },
    /** Kısa süreli renk: ok (yeşil) ya da wrong (kırmızı) */
    flash(m, kind) {
      const k = keyEl(m);
      if (!k) return;
      k.classList.add(kind);
      const t = setTimeout(() => {
        k.classList.remove(kind);
        timers.delete(t);
      }, 700);
      timers.add(t);
    },
    /** Doğru tuşu yanıp sönerek göster */
    hint(m) {
      keyEl(m)?.classList.add('hint');
    },
    clear() {
      el.querySelectorAll('.key.hint').forEach((k) => k.classList.remove('hint'));
    },
    /** Dışarıdan (MIDI ya da mikrofon) gelen basışı göster */
    show(m) {
      const k = keyEl(m);
      if (!k) return;
      k.classList.add('down');
      setTimeout(() => k.classList.remove('down'), 250);
    },
    destroy() {
      timers.forEach(clearTimeout);
    },
  };
}
