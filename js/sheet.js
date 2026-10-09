// Egzersiz Yap: çalışma kağıdındaki egzersizler satır satır, büyük nota ve büyük flüt resmiyle.
// Nokta birleştirme yok; her nota hem doğru yükseklik hem doğru süre için puanlanır.
// Modlar ve girdiler Antrenman ile aynı: "Kendi hızımda" / "Tempolu", mikrofon ya da basılı tutulan tuş.
// Sus işaretleri sayılır ama puanlanmaz; korona (𝄐) notası yazılanın iki katı tutulur; bağlı notalar tek nota sayılır.
import { noteSymbol } from './art.js';
import { longName, midiOf, shortName, titleName, noteFromMidi, staffStep, parseNote } from './data/notes.js';
import { prepareExercise } from './data/worksheet.js';
import { PitchListener, playNote, playChime, playClick, matchesTarget, micErrorMessage, SILENT_MIC_MESSAGE } from './audio.js';
import { fingeringSvg, fingeringToggle, h } from './checkpoints.js';
import { instrument } from './instrument.js';
import { progress } from './progress.js';

const VALUE = {
  4: ['birlik', 'whole', '4 vuruş'],
  3: ['noktalı ikilik', 'half', '3 vuruş'],
  2: ['ikilik', 'half', '2 vuruş'],
  1.5: ['noktalı dörtlük', 'quarter', '1,5 vuruş'],
  1: ['dörtlük', 'quarter', '1 vuruş'],
  0.5: ['sekizlik', 'eighth', 'yarım vuruş'],
};
const REST_NAME = { 4: 'birlik sus', 3: 'noktalı ikilik sus', 2: 'ikilik sus', 1: 'dörtlük sus' };
const valueOf = (beats) => VALUE[beats] || VALUE[1];
const beatsText = (b) => `${String(b).replace('.', ',')} vuruş`;
const FERMATA = 2; // korona: yazılan sürenin katı
const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

/** Porte geometrisi (aralık sp, üst çizgi top) */
function geometry(sp, top) {
  const bottom = top + sp * 4;
  const yOf = (id) => bottom - (staffStep(id) * sp) / 2;
  return { sp, top, bottom, yOf };
}

function staffLines(g, x1, x2) {
  let out = '';
  for (let i = 0; i < 5; i++) out += `<line x1="${x1}" y1="${g.top + i * g.sp}" x2="${x2}" y2="${g.top + i * g.sp}" class="ink thin"/>`;
  return out;
}

const clef = (g, x) => `<text x="${x}" y="${g.bottom + g.sp * 1.05}" font-size="${g.sp * 6.6}" class="clef ink-fill">𝄞</text>`;

function timeSig(g, x, time) {
  return `<text x="${x}" y="${g.top + g.sp * 1.9}" font-size="${g.sp * 2.4}" text-anchor="middle" class="time-sig">${time}</text><text x="${x}" y="${g.top + g.sp * 3.9}" font-size="${g.sp * 2.4}" text-anchor="middle" class="time-sig">4</text>`;
}

/** Nota başı, sapı, ek çizgileri, bemol/diyez işareti ve uzatma noktası */
function noteGlyph(g, note, beats, cx) {
  const cy = g.yOf(note);
  const step = staffStep(note);
  let out = '';
  const ledger = (k) => `<line x1="${cx - g.sp * 1.05}" y1="${g.bottom - (k * g.sp) / 2}" x2="${cx + g.sp * 1.05}" y2="${g.bottom - (k * g.sp) / 2}" class="ink thin"/>`;
  for (let k = -2; k >= step; k -= 2) out += ledger(k);
  for (let k = 10; k <= step; k += 2) out += ledger(k);
  const { alter } = parseNote(note);
  if (alter) out += `<text x="${cx - g.sp * 1.5}" y="${cy + g.sp * 0.7}" font-size="${g.sp * 2.6}" text-anchor="middle" class="clef ink-fill">${alter > 0 ? '♯' : '♭'}</text>`;
  out += noteSymbol(cx, cy, g.sp, valueOf(beats)[1], step >= 4);
  if (beats === 3 || beats === 1.5) {
    // Nokta, çizgi üzerindeki notada bir üst aralığa kayar
    const dy = step % 2 === 0 ? -g.sp / 2 : 0;
    out += `<circle cx="${cx + g.sp * 1.15}" cy="${cy + dy}" r="${g.sp * 0.2}" class="fill-ink"/>`;
  }
  return out;
}

/** Sus işaretleri: tam ölçü (4. çizgiden sarkan), ikilik (3. çizgiye oturan), dörtlük (𝄽) */
function restGlyph(g, beats, cx, wholeBar) {
  const w = g.sp * 1.2;
  if (wholeBar || beats === 4) return `<rect x="${cx - w / 2}" y="${g.top + g.sp}" width="${w}" height="${g.sp * 0.55}" class="fill-ink"/>`;
  if (beats >= 2) {
    const base = `<rect x="${cx - w / 2}" y="${g.top + g.sp * 2 - g.sp * 0.55}" width="${w}" height="${g.sp * 0.55}" class="fill-ink"/>`;
    return beats === 3 ? base + `<circle cx="${cx + w}" cy="${g.top + g.sp * 1.5}" r="${g.sp * 0.2}" class="fill-ink"/>` : base;
  }
  return `<text x="${cx}" y="${g.top + g.sp * 3.1}" font-size="${g.sp * 3.6}" text-anchor="middle" class="rest-glyph ink-fill">𝄽</text>`;
}

/** Korona: yay ve nokta */
function fermataGlyph(g, cx, y) {
  const r = g.sp * 0.8;
  return `<path d="M${cx - r} ${y} A${r} ${r} 0 0 1 ${cx + r} ${y}" class="ink" fill="none"/><circle cx="${cx}" cy="${y - g.sp * 0.25}" r="${g.sp * 0.17}" class="fill-ink"/>`;
}

// ------------------------------------------------------------------ satır portesi
const SP = 16;
const TOP = 56;
const BW = 42; // bir vuruşun genişliği
const MIN_W = 44;

/**
 * Bir satırı çizer. items: parseRow çıktısı. first: egzersizin ilk satırı mı (ölçü işareti çizilir)
 * startPos: satır başında ölçü içindeki vuruş konumu. Dönüş: {svg, geo: [{x, w, cx}], endPos}
 */
function rowSvg(items, { time, first, startPos, rowIndex, baseIndex }) {
  const g = geometry(SP, TOP);
  const nameY = g.bottom + 30;
  const barY = g.bottom + 37;
  const numY = g.bottom + 68;
  const height = numY + 10;
  let x = 66 + (first ? 34 : 0);
  let body = '';
  const geo = [];
  let pos = startPos;
  items.forEach((it, k) => {
    const w = Math.max(MIN_W, it.beats * BW);
    const cx = it.rest && (it.beats === time || it.beats === 4) && pos === 0 ? x + w / 2 : x + 16;
    geo.push({ x, w, cx });
    let mark = '';
    if (it.rest) mark = restGlyph(g, it.beats, cx, it.beats === time && pos === 0);
    else mark = noteGlyph(g, it.note, it.beats, cx);
    if (it.fermata) {
      let y = g.top - g.sp * 0.6;
      if (!it.rest) {
        const step = staffStep(it.note);
        const headTop = g.yOf(it.note) - g.sp * (step >= 4 ? 0.6 : 3.4);
        y = Math.min(y, headTop - g.sp * 0.5);
      }
      mark += fermataGlyph(g, cx, y);
    }
    // Vuruş numaraları
    let nums = '';
    for (let b = 0; b < Math.ceil(it.beats); b++) {
      const n = ((pos + b) % time) + 1;
      nums += `<text x="${x + 16 + b * BW}" y="${numY}" text-anchor="middle" class="beat-num ${n === 1 ? 'strong' : ''}">${n}</text>`;
    }
    const idx = baseIndex + k;
    body += `<g class="drill-note ws-item ${it.rest ? 'rest' : ''}" data-i="${idx}">
      <rect x="${x + 1}" y="${g.top - g.sp * 2.6}" width="${w - 2}" height="${numY + 8 - (g.top - g.sp * 2.6)}" rx="9" class="drill-hl"/>
      <path d="M${cx - 7} ${g.top - g.sp * 3.3} h14 l-7 9 z" class="cur-mark"/>
      ${mark}
      ${it.rest ? `<text x="${x + w / 2}" y="${nameY}" text-anchor="middle" class="dur-name">sus</text>` : `<text x="${x + w / 2}" y="${nameY}" text-anchor="middle" class="dur-name">${shortName(it.note)}</text>`}
      <rect x="${x + 4}" y="${barY}" width="${w - 8}" height="9" rx="4.5" class="dur-bar ${it.rest ? 'rest-bar' : ''}"/>
      <rect x="${x + 4}" y="${barY}" width="0" height="9" rx="4.5" class="dur-fill"/>
      ${nums}
    </g>`;
    pos = (pos + it.beats) % time;
    x += w;
    if (it.bar) {
      const bx = x + 4;
      if (it.bar === 'final') body += `<path d="M${bx} ${g.top} V${g.bottom}" class="ink thin"/><rect x="${bx + 4}" y="${g.top}" width="4.5" height="${g.sp * 4}" class="fill-ink"/>`;
      else if (it.bar === 'double') body += `<path d="M${bx} ${g.top} V${g.bottom} M${bx + 5} ${g.top} V${g.bottom}" class="ink thin"/>`;
      else body += `<path d="M${bx} ${g.top} V${g.bottom}" class="ink thin"/>`;
      x += it.bar === 'single' ? 10 : 16;
    }
  });
  // Bağlar
  items.forEach((it, k) => {
    const nx = items[k + 1];
    if (!it.tie || !nx || nx.note !== it.note) return;
    const down = staffStep(it.note) >= 4; // sap aşağı: bağ üstte
    const y = g.yOf(it.note) + (down ? -g.sp * 0.75 : g.sp * 0.75);
    const a = geo[k].cx + g.sp * 0.6;
    const b = geo[k + 1].cx - g.sp * 0.6;
    const c = down ? -g.sp * 0.9 : g.sp * 0.9;
    body += `<path d="M${a} ${y} Q${(a + b) / 2} ${y + c} ${b} ${y}" class="ink tie" fill="none"/>`;
  });
  const width = x + 14;
  let head = staffLines(g, 8, width - 6) + clef(g, 10);
  if (first) head += timeSig(g, 80, time);
  head += `<line class="playhead" x1="0" y1="${g.top - g.sp * 2.4}" x2="0" y2="${numY + 4}" hidden/>`;
  return {
    svg: `<svg class="ws-row-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${rowIndex + 1}. satır">${head}${body}</svg>`,
    geo,
    endPos: pos,
  };
}

/** Hedef nota ya da sus için büyük porte */
function bigNoteSvg(item) {
  const g = geometry(18, 46);
  const w = 230;
  let out = staffLines(g, 6, w - 6) + clef(g, 8);
  const cx = 150;
  if (!item) return `<svg class="ws-big-staff" viewBox="0 0 ${w} 176"></svg>`;
  out += item.rest ? restGlyph(g, item.beats, cx, item.beats === 4) : noteGlyph(g, item.note, item.beats, cx);
  if (item.fermata) out += fermataGlyph(g, cx, Math.min(g.top - 8, item.rest ? g.top - 8 : g.yOf(item.note) - g.sp * (staffStep(item.note) >= 4 ? 1.2 : 3.8)));
  return `<svg class="ws-big-staff" viewBox="0 0 ${w} 176" role="img" aria-label="${item.rest ? 'Sus' : longName(item.note)}">${out}</svg>`;
}

// ------------------------------------------------------------------ oyun
export class SheetGame {
  constructor(root, exercise, { onFinish } = {}) {
    this.root = root;
    this.ex = prepareExercise(exercise);
    this.beatMs = 60000 / exercise.bpm;
    this.onFinish = onFinish;
    this.input = 'mic';
    this.mode = 'tempo';
    this.build();
    this.render();
    this.reset();
  }

  destroy() {
    this.stop();
  }

  /** Öğeleri düzleştirir ve bağlı notaları tek olaya toplar */
  build() {
    this.items = [];
    this.ex.parsed.forEach((row, r) => row.forEach((it) => this.items.push({ ...it, row: r })));
    this.events = [];
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      const prev = this.items[i - 1];
      const ms = it.beats * this.beatMs * (it.fermata ? FERMATA : 1);
      if (!it.rest && prev?.tie && prev.note === it.note && this.events.length) {
        const ev = this.events.at(-1);
        ev.parts.push(i);
        ev.beats += it.beats;
        ev.ms += ms;
        ev.fermata ||= it.fermata;
        continue;
      }
      this.events.push({ rest: it.rest, note: it.note, beats: it.beats, fermata: it.fermata, ms, parts: [i], row: it.row });
    }
    this.scored = this.events.map((e, i) => (e.rest ? -1 : i)).filter((i) => i >= 0);
  }

  render() {
    const ex = this.ex;
    const distinct = [...new Set(this.items.filter((i) => !i.rest).map((i) => i.note))].sort((a, b) => midiOf(a) - midiOf(b));
    const name = instrument().name;
    this.root.innerHTML = '';
    this.el = h(`
      <div class="drill ws">
        <div class="drill-head">
          <div>
            <div class="cp-tag">Egzersiz Yap</div>
            <h2>${ex.title}</h2>
            <p class="muted">${ex.focus} · ${ex.time}/4 ölçü · ${ex.bpm} vuruş/dakika · ${this.scored.length} nota</p>
          </div>
          <div class="stars" aria-label="Yıldızlar"></div>
        </div>
        <div class="drill-options">
          <div class="seg-group" role="group" aria-label="Nasıl çalacaksın">
            <button class="chip-btn" data-input="mic">🎤 ${name}la çal</button>
            <button class="chip-btn" data-input="touch">👆 Tuşa basılı tut</button>
          </div>
          <div class="seg-group" role="group" aria-label="Mod">
            <button class="chip-btn" data-mode="tempo" title="Metronomla, okuma çizgisiyle birlikte çal">🥁 Tempolu</button>
            <button class="chip-btn" data-mode="hold" title="Her notayı süresi kadar tut, sonra sıradakine geç">⏳ Kendi hızımda</button>
          </div>
          <button class="btn primary" data-act="start">▶ Baştan sona çal</button>
          <button class="btn ghost" data-act="listen">🔊 Dinle</button>
          <button class="btn ghost" data-act="reset">↺ Sıfırla</button>
        </div>
        <div class="ws-stage">
          <div class="ws-target drill-target">
            <div class="countdown" hidden></div>
            <div class="ws-where muted"></div>
            <div class="target-name"></div>
            <div class="value-line"><span class="value-text"></span></div>
            <div class="beat-dots" aria-hidden="true"></div>
            <div class="hold"><span></span></div>
            <p class="cp-feedback" aria-live="polite"></p>
            <div class="mic-status muted" aria-live="polite"></div>
            <div class="meter level" aria-hidden="true" hidden><span></span></div>
          </div>
          <div class="ws-big drill-side"></div>
          <div class="ws-flute"></div>
        </div>
        <div class="drill-result ws-result" hidden></div>
        <div class="ws-rows"></div>
        <div class="touch-pad" hidden>
          ${distinct.map((n) => `<button class="pad-key" data-note="${n}"><b>${shortName(n)}</b>${longName(n) !== shortName(n) ? `<small>${longName(n)}</small>` : ''}</button>`).join('')}
        </div>
      </div>`);
    this.root.appendChild(this.el);
    const $ = (s) => this.el.querySelector(s);
    this.$ = $;

    // Satırlar: her biri ayrı kartta
    const rowsEl = $('.ws-rows');
    let pos = ex.pickup ? ex.time - ex.pickup : 0;
    let base = 0;
    this.geo = [];
    this.rowEls = ex.parsed.map((row, r) => {
      const { svg, geo, endPos } = rowSvg(row, { time: ex.time, first: r === 0, startPos: pos, rowIndex: r, baseIndex: base });
      pos = endPos;
      base += row.length;
      this.geo.push(...geo);
      const card = h(`
        <div class="ws-row" data-row="${r}">
          <div class="ws-row-head"><b>${r + 1}. satır</b><span class="ws-row-score muted"></span><button class="link" data-row-listen="${r}">🔊 Dinle</button><button class="link" data-row-play="${r}">▶ Bu satırı çal</button></div>
          <div class="ws-row-scroll">${svg}</div>
        </div>`);
      rowsEl.appendChild(card);
      return card;
    });
    this.itemEls = [...this.el.querySelectorAll('.ws-item')];

    $('.drill-options').appendChild(fingeringToggle(() => this.showTarget(this.cur ?? this.range[0])));
    $('.drill-options').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.input) this.setInput(b.dataset.input);
      else if (b.dataset.mode) this.setMode(b.dataset.mode);
      else if (b.dataset.act === 'start') this.start();
      else if (b.dataset.act === 'reset') this.reset();
      else if (b.dataset.act === 'listen') this.listen();
    });
    rowsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-row-play], [data-row-listen]');
      if (b?.dataset.rowPlay) this.start(Number(b.dataset.rowPlay));
      else if (b?.dataset.rowListen) this.listen(Number(b.dataset.rowListen));
    });

    // Basılı tutma: tuşa basıldığı sürece nota çalar
    const pad = $('.touch-pad');
    const release = () => {
      this.pressed = null;
      this.padSound?.stop();
      this.padSound = null;
      pad.querySelectorAll('.pad-key').forEach((k) => k.classList.remove('down'));
    };
    pad.addEventListener('pointerdown', (e) => {
      const key = e.target.closest('.pad-key');
      if (!key) return;
      e.preventDefault();
      key.setPointerCapture?.(e.pointerId);
      release();
      key.classList.add('down');
      this.pressed = midiOf(key.dataset.note);
      this.padSound = playNote(key.dataset.note, 12);
    });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(t, release);
    this.releasePad = release;
    this.updateButtons();
  }

  updateButtons() {
    this.el.querySelectorAll('[data-input]').forEach((b) => b.classList.toggle('active', b.dataset.input === this.input));
    this.el.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === this.mode));
    this.$('.touch-pad').hidden = this.input !== 'touch';
  }

  setInput(input) {
    this.input = input;
    this.reset();
    this.updateButtons();
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
    this.updateButtons();
  }

  /** Satır aralığındaki olaylar: [ilk, son) */
  rangeOf(row) {
    if (row == null) return [0, this.events.length];
    const idx = this.events.map((e, i) => (e.row === row ? i : -1)).filter((i) => i >= 0);
    return [idx[0], idx.at(-1) + 1];
  }

  reset(row = null) {
    this.stop();
    this.range = this.rangeOf(row);
    this.onlyRow = row;
    this.results = this.events.map(() => null);
    this.cur = null;
    this.activeRow = null;
    this.itemEls.forEach((g) => {
      g.classList.remove('current', 'ok', 'short', 'miss', 'wrong');
      g.querySelector('.dur-fill').setAttribute('width', 0);
    });
    this.rowEls.forEach((r) => {
      r.classList.remove('active');
      r.querySelector('.ws-row-score').textContent = '';
    });
    this.$('.drill-result').hidden = true;
    this.$('.cp-feedback').textContent = '';
    this.$('.countdown').hidden = true;
    this.el.querySelectorAll('.playhead').forEach((p) => p.setAttribute('hidden', ''));
    this.renderStars(progress.songStars(`ws-${this.ex.id}`));
    this.showTarget(this.range[0]);
    this.$('.mic-status').textContent =
      this.input === 'mic' ? '"Baştan sona çal"a ya da bir satırdaki "Bu satırı çal"a bas; mikrofon açılsın.' : 'Başlat, sonra tuşa notanın süresi kadar basılı tut.';
  }

  renderStars(n) {
    this.$('.stars').innerHTML = [1, 2, 3].map((k) => `<span class="${k <= n ? 'on' : ''}">★</span>`).join('');
  }

  stop() {
    this.running = false;
    this.el?.classList.remove('running');
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.listener?.stop();
    this.listener = null;
    this.releasePad?.();
    this.el?.querySelectorAll('[data-act=start], [data-row-play]').forEach((b) => b.removeAttribute('disabled'));
  }

  partsEls(i) {
    return this.events[i].parts.map((p) => this.itemEls[p]);
  }

  /** Olayı vurgular, satırını öne çıkarır ve görünür tutar */
  highlight(i) {
    this.itemEls.forEach((g) => g.classList.remove('current'));
    if (i == null || !this.events[i]) return;
    this.partsEls(i).forEach((g) => g.classList.add('current'));
    const row = this.events[i].row;
    this.rowEls.forEach((r, k) => r.classList.toggle('active', k === row));
    if (row !== this.activeRow) {
      this.activeRow = row;
      this.rowEls[row].scrollIntoView({ behavior: smooth(), block: 'nearest' });
    }
    // Uzun satırlarda (dar ekran) notayı yatayda görünür tut
    const scroller = this.rowEls[row].querySelector('.ws-row-scroll');
    if (scroller.scrollWidth > scroller.clientWidth) {
      const geo = this.geo[this.events[i].parts[0]];
      const svg = scroller.querySelector('svg');
      const scale = svg.getBoundingClientRect().width / Number(svg.getAttribute('width'));
      scroller.scrollTo({ left: Math.max(0, geo.x * scale - scroller.clientWidth / 3), behavior: smooth() });
    }
  }

  /** Büyük hedef: nota adı, süre, vuruş noktaları, büyük porte ve flüt resmi */
  showTarget(i) {
    const ev = this.events[i];
    if (!ev) return;
    this.cur = i;
    const scoredIdx = this.scored.indexOf(i);
    this.$('.ws-where').textContent = `${ev.row + 1}. satır${scoredIdx >= 0 ? ` · ${scoredIdx + 1}/${this.scored.length}. nota` : ''}`;
    const first = this.items[ev.parts[0]];
    if (ev.rest) {
      this.$('.target-name').textContent = 'Sus';
      this.$('.value-text').textContent = `${REST_NAME[ev.beats] || 'sus'} · ${beatsText(ev.beats)}${ev.fermata ? ' + korona' : ''}`;
    } else {
      this.$('.target-name').textContent = titleName(ev.note);
      const tied = ev.parts.length > 1 ? ` (bağlı: ${ev.parts.map((p) => this.items[p].beats).join(' + ')})` : '';
      this.$('.value-text').textContent = `${ev.parts.length > 1 ? 'bağlı nota' : valueOf(ev.beats)[0]} · ${beatsText(ev.beats)}${tied}${ev.fermata ? ' · korona: daha uzun tut' : ''}`;
    }
    const total = ev.beats * (ev.fermata ? FERMATA : 1);
    const dots = Math.max(1, Math.ceil(total));
    this.$('.beat-dots').innerHTML = Array.from({ length: dots }, (_, k) => `<span class="${total < 1 ? 'half' : ''} ${ev.fermata && k >= ev.beats ? 'extra' : ''} ${ev.rest ? 'rest' : ''}"></span>`).join('');
    this.$('.ws-big').innerHTML = bigNoteSvg({ ...first, beats: ev.parts.length > 1 ? first.beats : ev.beats });
    // Susta sıradaki notanın parmakları gösterilir (hazırlan)
    const next = ev.rest ? this.events.slice(i + 1).find((e) => !e.rest) : ev;
    const fing = next ? fingeringSvg(next.note) : '';
    this.$('.ws-flute').innerHTML = fing ? `${ev.rest ? `<div class="ws-flute-cap muted">Sıradaki: ${longName(next.note)}</div>` : ''}${fing}` : '';
    this.$('.ws-flute').classList.toggle('dim', !!ev.rest);
    this.setHold(0);
  }

  setHold(fraction) {
    const ev = this.events[this.cur];
    if (!ev) return;
    const f = Math.max(0, Math.min(1, fraction));
    this.$('.hold span').style.width = `${f * 100}%`;
    const dots = this.$('.beat-dots').querySelectorAll('span');
    const filled = f * dots.length;
    dots.forEach((d, k) => d.classList.toggle('on', filled > k + 0.02));
    // Süre çubukları: bağlı notalarda parça parça dolar
    const totalBeats = ev.parts.reduce((a, p) => a + this.items[p].beats, 0);
    let left = f * totalBeats;
    for (const p of ev.parts) {
      const el = this.itemEls[p];
      const b = this.items[p].beats;
      const part = Math.max(0, Math.min(1, left / b));
      left -= b;
      el.querySelector('.dur-fill').setAttribute('width', part * Number(el.querySelector('.dur-bar').getAttribute('width')));
    }
  }

  /** Okuma çizgisi: olayın parçaları boyunca ilerler */
  movePlayhead(i, f) {
    this.el.querySelectorAll('.playhead').forEach((p) => p.setAttribute('hidden', ''));
    const ev = this.events[i];
    if (!ev) return;
    const totalBeats = ev.parts.reduce((a, p) => a + this.items[p].beats, 0);
    let at = Math.max(0, Math.min(1, f)) * totalBeats;
    let p = ev.parts[0];
    for (const q of ev.parts) {
      p = q;
      if (at <= this.items[q].beats) break;
      at -= this.items[q].beats;
    }
    const geo = this.geo[p];
    const x = geo.x + Math.min(1, at / this.items[p].beats) * geo.w;
    const line = this.rowEls[this.items[p].row].querySelector('.playhead');
    line.removeAttribute('hidden');
    line.setAttribute('x1', x);
    line.setAttribute('x2', x);
  }

  /** Egzersizi doğru süreleriyle dinlet */
  listen(row = null) {
    this.reset(row);
    const [a, b] = this.range;
    let i = a;
    const play = () => {
      if (i >= b) {
        this.highlight(null);
        return;
      }
      const ev = this.events[i];
      this.showTarget(i);
      this.highlight(i);
      if (!ev.rest) playNote(ev.note, (ev.ms / 1000) * 0.92);
      i++;
      this.timer = setTimeout(play, ev.ms);
    };
    play();
  }

  async start(row = null) {
    this.reset(row);
    this.el.querySelectorAll('[data-act=start], [data-row-play]').forEach((b) => b.setAttribute('disabled', ''));
    if (this.input === 'mic') {
      const status = this.$('.mic-status');
      const level = this.$('.level');
      let silent = false;
      this.listener = new PitchListener(
        (f) => {
          this.frame = f;
          this.frameAt = performance.now();
          level.firstElementChild.style.width = `${Math.min(100, (f.rms || 0) * 600)}%`;
          status.textContent = silent ? SILENT_MIC_MESSAGE : f.note ? `Duyulan: ${longName(f.note)}` : 'Dinliyorum…';
        },
        { onStatus: (st) => (silent = st === 'silent') },
      );
      try {
        status.textContent = 'Mikrofon açılıyor…';
        await this.listener.start();
        level.hidden = false;
      } catch (err) {
        status.textContent = `${micErrorMessage(err)} Şimdilik “Tuşa basılı tut” seçeneğini kullanabilirsin.`;
        this.listener = null;
        this.stop();
        return;
      }
    }
    this.running = true;
    this.el.classList.add('running');
    this.highlight(this.range[0]);
    if (this.mode === 'hold') this.startHold();
    else this.startTempo();
  }

  sounding(now) {
    if (this.input === 'touch') return this.pressed ?? null;
    const f = this.frame;
    if (!f?.note || now - this.frameAt > 150) return null;
    return f;
  }

  isTarget(s, midi) {
    if (s == null) return false;
    return typeof s === 'number' ? s === midi : matchesTarget(s, midi);
  }

  midiOfSounding(s) {
    return typeof s === 'number' ? s : s?.midi;
  }

  /** Sonucu kaydet ve olayın parçalarını renklendir */
  mark(i, kind) {
    this.results[i] = kind;
    this.partsEls(i).forEach((g) => {
      g.classList.remove('current', 'ok', 'short', 'miss', 'wrong');
      g.classList.add(kind);
    });
  }

  // ------------------------------------------------------------- Kendi hızımda
  startHold() {
    this.enter(this.range[0]);
    const loop = () => {
      if (!this.running) return;
      this.tickHold(performance.now());
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  enter(i) {
    if (i >= this.range[1]) return this.finish();
    this.index = i;
    this.holdStart = 0;
    this.lastHit = 0;
    this.reached = false;
    this.peakRms = 0;
    this.wrongMidi = null;
    this.wrongSince = 0;
    this.firstTry = null; // ilk denemenin sonucu: kısa ya da yanlış kaldıysa o sayılır
    // Önceki nota bir süre daha çalınmaya devam edebilir (fazla tutma): bu yanlış nota sayılmaz
    const prev = this.events[i - 1];
    this.prevMidi = prev && !prev.rest ? midiOf(prev.note) : null;
    this.enteredAt = performance.now();
    this.showTarget(i);
    this.highlight(i);
    const ev = this.events[i];
    this.$('.cp-feedback').textContent = ev.rest ? `Sus: ${beatsText(ev.beats * (ev.fermata ? FERMATA : 1))} say, nefes al.` : '';
  }

  tickHold(now) {
    const i = this.index;
    const ev = this.events[i];
    const fb = this.$('.cp-feedback');
    if (ev.rest) {
      const f = (now - this.enteredAt) / ev.ms;
      this.setHold(f);
      if (f >= 1) this.enter(i + 1);
      return;
    }
    const target = midiOf(ev.note);
    const needMs = Math.max(250, ev.ms * 0.9 - (this.input === 'mic' ? 90 : 0));
    const s = this.sounding(now);
    const rms = this.input === 'mic' ? this.frame?.rms || 0 : this.pressed != null ? 1 : 0;
    const dip = this.holdStart && rms < this.peakRms * (this.reached ? 0.6 : 0.35);
    if (this.isTarget(s, target) && !dip) {
      this.wrongSince = 0;
      if (!this.holdStart) {
        this.holdStart = now;
        this.peakRms = rms;
      }
      this.peakRms = Math.max(this.peakRms * 0.995, rms);
      this.lastHit = now;
      const held = now - this.holdStart;
      this.setHold(held / needMs);
      if (!this.reached && held >= needMs) {
        this.reached = true;
        this.mark(i, this.firstTry || 'ok');
        fb.textContent = this.firstTry ? 'Tamam, bu kez oldu. Sıradakine geç.' : '✓ Doğru nota, tam süre!';
        const next = this.events[i + 1];
        // Sıradaki farklı bir notaysa doğrudan geçilir; aynı nota ya da sus ise önce bırakmak gerekir
        if (i + 1 >= this.range[1]) this.finish();
        else if (!next.rest && next.note !== ev.note) this.enter(i + 1);
      }
      return;
    }
    if (this.holdStart && (this.reached || now - this.lastHit > 140)) {
      if (this.reached) return this.enter(i + 1);
      const held = this.lastHit - this.holdStart;
      if (held > 120) {
        const beatsHeld = Math.max(0.5, Math.round((held / this.beatMs) * 2) / 2);
        fb.textContent = `Kısa kaldı: ${beatsText(ev.beats * (ev.fermata ? FERMATA : 1))} tutmalısın (sen yaklaşık ${beatsText(beatsHeld)} tuttun). Tekrar dene!`;
        this.firstTry ||= 'short';
        this.partsEls(i).forEach((g) => g.classList.add('short'));
      }
      this.holdStart = 0;
      this.setHold(0);
    }
    const m = this.midiOfSounding(s);
    if (m != null && !this.isTarget(s, target) && !(m === this.prevMidi && !this.lastHit)) {
      if (this.wrongMidi !== m) {
        this.wrongMidi = m;
        this.wrongSince = now;
      } else if (this.wrongSince && now - this.wrongSince > 500) {
        this.wrongSince = 0;
        fb.textContent = `Bu ${longName(noteFromMidi(m))}; hedef ${longName(ev.note)}. Parmaklarını resimle karşılaştır.`;
        this.firstTry = 'wrong';
        this.partsEls(i).forEach((g) => g.classList.add('wrong'));
      }
    }
  }

  // ------------------------------------------------------------- Tempolu
  startTempo() {
    const countEl = this.$('.countdown');
    countEl.hidden = false;
    const time = this.ex.time;
    const clicks = time === 2 ? 4 : time;
    this.$('.cp-feedback').textContent = `Dinle: ${clicks} vuruş sayıyorum, sonra başla.`;
    let k = 0;
    const tick = () => {
      if (!this.running) return;
      if (k === clicks) {
        countEl.hidden = true;
        this.$('.cp-feedback').textContent = '';
        return this.runTempo();
      }
      countEl.textContent = (k % time) + 1;
      playClick(k % time === 0);
      k++;
      this.timer = setTimeout(tick, this.beatMs);
    };
    tick();
  }

  runTempo() {
    const [a, b] = this.range;
    const starts = [];
    let acc = 0;
    for (let i = a; i < b; i++) {
      starts[i] = acc;
      acc += this.events[i].ms;
    }
    const total = acc;
    const correct = {};
    const wrong = {};
    const latency = 90; // mikrofon gecikmesi
    const t0 = performance.now();
    let last = t0;
    let cur = -1;
    const fb = this.$('.cp-feedback');
    const evaluate = (i) => {
      const ev = this.events[i];
      if (ev.rest) return;
      const cov = (correct[i] || 0) / ev.ms;
      let kind = cov >= 0.6 ? 'ok' : cov >= 0.25 ? 'short' : 'miss';
      if (kind === 'miss' && (wrong[i] || 0) > ev.ms * 0.4) kind = 'wrong';
      this.mark(i, kind);
      // Geri bildirim az önce biten nota içindir
      fb.textContent = `Önceki nota (${shortName(ev.note)}): ` + { ok: '✓ doğru nota, doğru süre', short: `nota doğru ama süre kısa, ${beatsText(ev.beats)} tut.`, wrong: `yanlış nota, hedef ${longName(ev.note)} idi.`, miss: 'kaçırdın.' }[kind];
    };
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      const dt = now - last;
      last = now;
      const heard = now - t0 - latency;
      let i = cur < 0 ? a - 1 : cur;
      while (i + 1 < b && heard >= starts[i + 1]) i++;
      if (i >= a && i !== cur) {
        if (cur >= 0) evaluate(cur);
        cur = i;
        this.index = i;
        this.showTarget(i);
        this.highlight(i);
        if (this.events[i].rest) fb.textContent = 'Sus… saymaya devam et.';
      }
      if (cur >= 0) {
        const ev = this.events[cur];
        const s = this.sounding(now);
        if (!ev.rest) {
          if (this.isTarget(s, midiOf(ev.note))) correct[cur] = (correct[cur] || 0) + dt;
          else if (s != null) wrong[cur] = (wrong[cur] || 0) + dt;
        }
        const f = (heard - starts[cur]) / ev.ms;
        this.setHold(f);
        this.movePlayhead(cur, f);
      }
      if (heard >= total) {
        if (cur >= 0) evaluate(cur);
        this.el.querySelectorAll('.playhead').forEach((p) => p.setAttribute('hidden', ''));
        return this.finish();
      }
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  // ------------------------------------------------------------- Sonuç
  finish() {
    this.stop();
    this.highlight(null);
    this.rowEls.forEach((r) => r.classList.remove('active'));
    const [a, b] = this.range;
    const idx = this.scored.filter((i) => i >= a && i < b);
    const count = (k) => idx.filter((i) => (this.results[i] || 'miss') === k).length;
    const n = idx.length;
    const ok = count('ok');
    const short = count('short');
    const wrong = count('wrong');
    const miss = count('miss');
    const pct = n ? Math.round((ok / n) * 100) : 0;
    const pitchPct = n ? Math.round(((ok + short) / n) * 100) : 0;
    // Satır satır özet
    this.rowEls.forEach((r, row) => {
      const ri = idx.filter((i) => this.events[i].row === row);
      if (!ri.length) return;
      const rOk = ri.filter((i) => this.results[i] === 'ok').length;
      r.querySelector('.ws-row-score').textContent = `${rOk}/${ri.length} doğru`;
    });
    const full = this.onlyRow == null;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    if (full) {
      progress.completeSong(`ws-${this.ex.id}`, stars);
      this.renderStars(progress.songStars(`ws-${this.ex.id}`));
    }
    playChime();
    const seg = (k, v) => (v ? `<span class="seg ${k}" style="flex:${v}"></span>` : '');
    const res = this.$('.drill-result');
    res.hidden = false;
    res.innerHTML = `
      <h3>${full ? 'Egzersiz bitti!' : `${this.onlyRow + 1}. satır bitti!`}</h3>
      ${full ? `<b class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b>` : ''}
      <div class="ws-score"><span class="big">%${pct}</span><small>doğru (nota ve süre birlikte)</small></div>
      <div class="ws-bar" aria-hidden="true">${seg('ok', ok)}${seg('short', short)}${seg('wrong', wrong)}${seg('miss', miss)}</div>
      <div class="result-grid ws-counts">
        <div class="ok"><span class="big">${ok}</span><small>✓ doğru</small></div>
        <div class="short"><span class="big">${short}</span><small>◐ nota doğru, süre kısa</small></div>
        <div class="wrong"><span class="big">${wrong}</span><small>✗ yanlış nota</small></div>
        ${this.mode === 'tempo' ? `<div class="miss"><span class="big">${miss}</span><small>○ kaçırılan</small></div>` : ''}
      </div>
      <p>${n} notanın ${ok + short} tanesinde nota doğru (%${pitchPct}), ${ok} tanesinde süre de tam. ${
        ok === n ? 'Kusursuz!' : 'Renkli notalar satırlarda duruyor: sarı süre kısa, kırmızı yanlış ya da kaçırılan nota.'
      }</p>
      <div class="end-actions">
        <button class="btn primary" data-act="again">↺ Tekrar çal</button>
        ${full ? '' : '<button class="btn" data-act="all">▶ Baştan sona çal</button>'}
      </div>`;
    res.querySelector('[data-act=again]').addEventListener('click', () => this.start(this.onlyRow));
    res.querySelector('[data-act=all]')?.addEventListener('click', () => this.start());
    res.scrollIntoView({ behavior: smooth(), block: 'center' });
    this.onFinish?.({ ok, short, wrong, miss, n, full });
  }
}
