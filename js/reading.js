// Nota Okuma: portede görünen notayı bul ve çal. Piyanoya geçmeden önceki giriş alıştırmaları.
// Türler:
//  - find:  porte yok; "Fa'ya bas" denir, klavyede o adı taşıyan herhangi bir tuş doğru sayılır.
//  - flash: portede tek nota (sol ya da fa anahtarı, karışık da olabilir); rastgele sırayla sorulur.
//  - line:  bir satır nota soldan sağa okunur ve sırayla çalınır (ritim yok, yalnızca doğru nota).
// Cevap yolları: ekrandaki klavye, gerçek piyano (mikrofon), MIDI klavye ya da nota adı düğmeleri.
import { noteSymbol } from './art.js';
import { clefStep, longName, midiOf, noteFromMidi, parseNote } from './data/notes.js';
import { PitchListener, playNote, playChime, micErrorMessage, SILENT_MIC_MESSAGE } from './audio.js';
import { h } from './checkpoints.js';
import { navButtons } from './drill.js';
import { createKeyboard, keyboardRange, keyboardSvg } from './keyboard.js';
import { progress } from './progress.js';

const PC_NAMES = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const pcOf = (m) => ((m % 12) + 12) % 12;
const letterPc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ------------------------------------------------------------------ porte çizimi
/**
 * Okuma portesi. notes: [{note, state: ''|'current'|'ok'|'wrong'|'done', label}], clef: 'treble' | 'bass'.
 * Notalar birlik (içi boş) çizilir: süre yok, yalnızca yükseklik okunur.
 */
export function readingStaff({ clef = 'treble', notes = [], sp = 14, width = null, cls = 'rd-staff-svg' }) {
  const top = sp * 4.6;
  const bottom = top + sp * 4;
  const x0 = sp * 6.2;
  const gap = sp * 4.2;
  const w = width || Math.max(sp * 16, x0 + notes.length * gap + sp * 2);
  const yOf = (id) => bottom - (clefStep(id, clef) * sp) / 2;
  let out = '';
  for (let i = 0; i < 5; i++) out += `<line x1="4" y1="${top + i * sp}" x2="${w - 4}" y2="${top + i * sp}" class="ink thin"/>`;
  out +=
    clef === 'bass'
      ? `<text x="${sp * 0.6}" y="${top + sp * 2.95}" font-size="${sp * 3.6}" class="clef ink-fill">𝄢</text>`
      : `<text x="${sp * 0.5}" y="${bottom + sp * 1.05}" font-size="${sp * 6.6}" class="clef ink-fill">𝄞</text>`;
  notes.forEach((n, i) => {
    const cx = x0 + i * gap + gap / 2;
    const cy = yOf(n.note);
    const step = clefStep(n.note, clef);
    let g = '';
    const ledger = (k) => `<line x1="${cx - sp * 1.15}" y1="${bottom - (k * sp) / 2}" x2="${cx + sp * 1.15}" y2="${bottom - (k * sp) / 2}" class="ink thin"/>`;
    for (let k = -2; k >= step; k -= 2) g += ledger(k);
    for (let k = 10; k <= step; k += 2) g += ledger(k);
    const { alter } = parseNote(n.note);
    if (alter) g += `<text x="${cx - sp * 1.6}" y="${cy + sp * 0.7}" font-size="${sp * 2.6}" text-anchor="middle" class="clef ink-fill">${alter > 0 ? '♯' : '♭'}</text>`;
    g += noteSymbol(cx, cy, sp, 'whole');
    if (n.state === 'current') g = `<rect x="${cx - sp * 1.7}" y="${top - sp * 3.4}" width="${sp * 3.4}" height="${sp * 11.6}" rx="10" class="drill-hl"/>` + g;
    const label = n.label ? `<text x="${cx}" y="${bottom + sp * 5.2}" text-anchor="middle" class="rd-label">${n.label}</text>` : '';
    out += `<g class="rd-note ${n.state || ''}">${g}${label}</g>`;
  });
  const height = bottom + sp * 6;
  return `<svg class="${cls}" viewBox="0 0 ${w} ${height}" role="img" aria-label="${clef === 'bass' ? 'Fa' : 'Sol'} anahtarlı porte">${out}</svg>`;
}

/** Konu anlatımındaki resim */
function introVisual(v) {
  if (!v) return '';
  if (v.type === 'keyboard') return keyboardSvg({ from: v.from || 'C4', to: v.to || 'B4', marked: v.marked || [], labels: v.labels, cls: 'kb kb-intro' });
  if (v.type === 'staff') return readingStaff({ clef: v.clef, notes: v.notes.map((n) => ({ note: n, label: v.labels === false ? '' : PC_NAMES[parseNote(n).letter] })), sp: 11, cls: 'rd-intro-staff' });
  return '';
}

// ------------------------------------------------------------------ MIDI
async function listenMidi(onNote) {
  if (!navigator.requestMIDIAccess) throw new Error('Bu tarayıcı MIDI klavyeyi desteklemiyor (Chrome ya da Edge kullan).');
  const access = await navigator.requestMIDIAccess();
  const attach = () => {
    let n = 0;
    access.inputs.forEach((input) => {
      n++;
      input.onmidimessage = (e) => {
        const [status, note, vel] = e.data;
        if ((status & 0xf0) === 0x90 && vel > 0) onNote(note);
      };
    });
    return n;
  };
  const count = attach();
  access.onstatechange = attach;
  return {
    count,
    stop() {
      access.inputs.forEach((input) => (input.onmidimessage = null));
      access.onstatechange = null;
    },
  };
}

// ------------------------------------------------------------------ oyun
export class ReadingGame {
  constructor(root, set, { nav = {} } = {}) {
    Object.assign(this, { root, set, nav });
    this.input = 'keys';
    this.labels = false; // tuş adları
    this.hintNames = false; // portedeki notanın adı
    this.render();
    this.reset();
  }

  destroy() {
    this.stop();
    this.kb?.destroy();
  }

  /** Bütün notalar (klavye aralığı ve nota adı düğmeleri için) */
  allNotes() {
    const s = this.set;
    if (s.mode === 'line') return s.rows.flatMap((r) => (typeof r === 'string' ? r : r.notes).split(/\s+/));
    if (s.mode === 'find') return [];
    return Object.values(s.pools || { [s.clef]: s.pool }).flat();
  }

  render() {
    const s = this.set;
    this.root.innerHTML = '';
    const canMidi = !!navigator.requestMIDIAccess;
    this.el = h(`
      <div class="drill reading">
        <div class="drill-head">
          <div>
            <div class="cp-tag">Nota Okuma</div>
            <h2>${s.title}</h2>
            <p class="muted">${s.focus}</p>
          </div>
          <div class="stars" aria-label="Yıldızlar"></div>
        </div>
        ${s.intro ? `<details class="rd-intro card" open><summary><b>${s.intro.title}</b></summary>
          <div class="rd-intro-body"><ul>${s.intro.points.map((p) => `<li>${p}</li>`).join('')}</ul><div class="rd-intro-visual">${introVisual(s.intro.visual)}</div></div></details>` : ''}
        <div class="drill-options">
          <div class="seg-group" role="group" aria-label="Nasıl cevaplayacaksın">
            <button class="chip-btn" data-input="keys" title="Ekrandaki klavyede tuşa bas">🎹 Ekrandaki klavye</button>
            <button class="chip-btn" data-input="mic" title="Gerçek piyanonda çal, mikrofon duysun">🎤 Piyanomla</button>
            ${canMidi ? '<button class="chip-btn" data-input="midi" title="Bilgisayara USB ile bağlı piyano ya da MIDI klavye">🎛️ MIDI klavye</button>' : ''}
            ${s.mode === 'find' ? '' : '<button class="chip-btn" data-input="names" title="Piyano olmadan: notanın adını seç">🔤 Nota adıyla</button>'}
          </div>
          <button class="chip-btn standalone" data-act="labels" aria-pressed="false">🏷️ Tuş adları</button>
          ${s.mode === 'find' ? '' : '<button class="chip-btn standalone" data-act="hint" aria-pressed="false">💡 Nota adını göster</button>'}
          <button class="btn primary" data-act="start">▶ Başla</button>
          <button class="btn ghost" data-act="reset">↺ Baştan</button>
        </div>
        <div class="rd-stage card">
          <div class="rd-board"></div>
          <div class="rd-side">
            <div class="rd-progress"><b class="rd-count"></b><span class="rd-score muted"></span></div>
            <p class="cp-feedback rd-feedback" aria-live="polite"></p>
            <div class="mic-status muted" aria-live="polite"></div>
            <div class="meter level" aria-hidden="true" hidden><span></span></div>
          </div>
        </div>
        <div class="rd-names" hidden>${LETTERS.map((l) => `<button class="pad-key" data-letter="${l}"><b>${PC_NAMES[l]}</b></button>`).join('')}</div>
        <div class="rd-kb"></div>
        <div class="drill-result" hidden></div>
      </div>`);
    this.root.appendChild(this.el);
    const $ = (sel) => this.el.querySelector(sel);
    this.$ = $;
    const notes = this.allNotes();
    const [lo, hi] = notes.length ? keyboardRange(notes, s.keyboard || {}) : keyboardRange([], { min: s.keyboard?.min || 'C3', max: s.keyboard?.max || 'B4' });
    this.range = [lo, hi];
    this.makeKeyboard();
    $('.drill-options').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.input) this.setInput(b.dataset.input);
      else if (b.dataset.act === 'start') this.start();
      else if (b.dataset.act === 'reset') this.reset();
      else if (b.dataset.act === 'labels') {
        this.labels = !this.labels;
        this.makeKeyboard();
        this.updateButtons();
      } else if (b.dataset.act === 'hint') {
        this.hintNames = !this.hintNames;
        this.updateButtons();
        this.draw();
      }
    });
    $('.rd-names').addEventListener('click', (e) => {
      const b = e.target.closest('[data-letter]');
      if (b && this.running) this.answer({ letter: b.dataset.letter });
    });
    this.updateButtons();
  }

  makeKeyboard() {
    this.kb?.destroy();
    this.kb = createKeyboard({
      from: this.range[0],
      to: this.range[1],
      labels: this.labels,
      onPress: (m) => {
        this.padSound?.stop();
        this.padSound = playNote(noteFromMidi(m), 1.6);
        if (this.running && this.input === 'keys') this.answer({ midi: m });
      },
      onRelease: () => {
        this.padSound?.stop();
        this.padSound = null;
      },
    });
    this.$('.rd-kb').replaceChildren(this.kb.el);
  }

  updateButtons() {
    this.el.querySelectorAll('[data-input]').forEach((b) => b.classList.toggle('active', b.dataset.input === this.input));
    const lab = this.el.querySelector('[data-act=labels]');
    lab.classList.toggle('active', this.labels);
    lab.setAttribute('aria-pressed', this.labels);
    const hint = this.el.querySelector('[data-act=hint]');
    hint?.classList.toggle('active', this.hintNames);
    hint?.setAttribute('aria-pressed', this.hintNames);
    this.$('.rd-names').hidden = this.input !== 'names';
  }

  setInput(input) {
    this.input = input;
    this.reset();
    this.updateButtons();
  }

  /** Soru listesi: [{note?, letter?, clef, row?, col?}] */
  buildQuestions() {
    const s = this.set;
    if (s.mode === 'find') {
      const letters = s.letters;
      const qs = [];
      while (qs.length < s.count) {
        const pick = shuffle([...letters]);
        for (const l of pick) if (qs.length < s.count && qs.at(-1)?.letter !== l) qs.push({ letter: l });
      }
      return qs;
    }
    if (s.mode === 'line') {
      return s.rows.flatMap((r, row) => {
        const { clef, notes } = typeof r === 'string' ? { clef: s.clef, notes: r } : r;
        return notes.split(/\s+/).map((note, col) => ({ note, clef, row, col }));
      });
    }
    const pools = s.pools || { [s.clef]: s.pool };
    const entries = Object.entries(pools).flatMap(([clef, list]) => list.map((note) => ({ note, clef })));
    const qs = [];
    while (qs.length < s.count) {
      // Her notadan eşit sayıda; art arda aynı nota gelmesin
      for (const q of shuffle([...entries])) {
        if (qs.length >= s.count) break;
        if (qs.at(-1)?.note === q.note && entries.length > 1) continue;
        qs.push({ ...q });
      }
    }
    return qs;
  }

  reset() {
    this.stop();
    this.questions = this.buildQuestions();
    this.i = 0;
    this.results = this.questions.map(() => null); // 'ok' | 'retry' (ilk denemede bilemedi)
    this.tries = 0;
    this.times = [];
    this.$('.drill-result').hidden = true;
    this.$('.rd-feedback').textContent = '';
    this.renderStars(progress.songStars(`read-${this.set.id}`));
    this.draw();
    this.updateCount();
    this.$('.mic-status').textContent = {
      keys: '"Başla"ya bas, sonra notayı ekrandaki klavyede bul.',
      mic: '"Başla"ya bas, mikrofon açılsın; notayı piyanonda çal.',
      midi: '"Başla"ya bas; MIDI klavyeni bilgisayara bağla.',
      names: '"Başla"ya bas, sonra notanın adını seç.',
    }[this.input];
  }

  renderStars(n) {
    this.$('.stars').innerHTML = [1, 2, 3].map((k) => `<span class="${k <= n ? 'on' : ''}">★</span>`).join('');
  }

  updateCount() {
    const n = this.questions.length;
    const ok = this.results.filter((r) => r === 'ok').length;
    const retry = this.results.filter((r) => r === 'retry').length;
    this.$('.rd-count').textContent = `${Math.min(this.i + 1, n)} / ${n}`;
    this.$('.rd-score').textContent = this.i ? ` · ✓ ${ok} ilk denemede · ↺ ${retry}` : '';
  }

  /** Porte ya da (find türünde) büyük soru yazısı */
  draw() {
    const board = this.$('.rd-board');
    const q = this.questions[this.i];
    if (this.set.mode === 'find') {
      board.innerHTML = q && this.running ? `<div class="rd-find"><span class="muted">Klavyede bul:</span><b>${PC_NAMES[q.letter]}</b></div>` : `<div class="rd-find muted">${this.set.letters.map((l) => PC_NAMES[l]).join(' · ')}</div>`;
      return;
    }
    if (!q) return;
    let notes;
    let clef = q.clef;
    if (this.set.mode === 'line') {
      const row = this.questions.filter((x) => x.row === q.row);
      const base = this.questions.indexOf(row[0]);
      notes = row.map((x, k) => {
        const idx = base + k;
        const state = idx === this.i && this.running ? 'current' : this.results[idx] === 'ok' ? 'ok' : this.results[idx] === 'retry' ? 'wrong' : '';
        const label = this.hintNames || (this.results[idx] && idx < this.i) ? PC_NAMES[parseNote(x.note).letter] : '';
        return { note: x.note, state, label };
      });
    } else {
      notes = [{ note: q.note, state: this.running ? 'current' : '', label: this.hintNames ? PC_NAMES[parseNote(q.note).letter] : '' }];
    }
    board.innerHTML = readingStaff({ clef, notes, sp: this.set.mode === 'line' ? 13 : 16, width: this.set.mode === 'line' ? null : 330 });
    if (this.set.mode === 'line') {
      const rows = new Set(this.questions.map((x) => x.row)).size;
      board.insertAdjacentHTML('afterbegin', `<div class="rd-row-tag muted">${q.row + 1}. satır / ${rows} · ${clef === 'bass' ? 'Fa' : 'Sol'} anahtarı</div>`);
    }
  }

  async start() {
    this.reset();
    if (this.input === 'mic') {
      const status = this.$('.mic-status');
      const level = this.$('.level');
      let silent = false;
      this.listener = new PitchListener((f) => this.onFrame(f, level, () => silent), { onStatus: (st) => (silent = st === 'silent') });
      try {
        status.textContent = 'Mikrofon açılıyor…';
        await this.listener.start();
        level.hidden = false;
        status.textContent = 'Dinliyorum… Notayı piyanonda çal.';
      } catch (err) {
        status.textContent = `${micErrorMessage(err)} Şimdilik ekrandaki klavyeyi kullanabilirsin.`;
        this.listener = null;
        return;
      }
    } else if (this.input === 'midi') {
      try {
        this.midi = await listenMidi((m) => {
          this.kb.show(m);
          if (this.running) this.answer({ midi: m });
        });
        this.$('.mic-status').textContent = this.midi.count ? 'MIDI klavye bağlı. Notayı çal.' : 'MIDI klavye bulunamadı: kabloyu tak, birkaç saniye bekle ve bir tuşa bas.';
      } catch (err) {
        this.$('.mic-status').textContent = `${err.message || err}`;
        return;
      }
    } else {
      this.$('.mic-status').textContent = this.input === 'names' ? 'Notanın adını aşağıdaki düğmelerden seç.' : 'Notayı ekrandaki klavyede bul ve bas.';
    }
    this.running = true;
    this.el.classList.add('running');
    this.askedAt = performance.now();
    this.draw();
    this.$('.rd-feedback').textContent = this.set.mode === 'line' ? 'Soldan sağa oku: işaretli notayı çal.' : '';
    this.$('.rd-stage').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  stop() {
    this.running = false;
    this.el?.classList.remove('running');
    this.listener?.stop();
    this.listener = null;
    this.midi?.stop();
    this.midi = null;
    this.padSound?.stop();
    clearTimeout(this.nextTimer);
  }

  /** Mikrofon karesi: yeni ve kararlı bir nota başlayınca cevap sayılır (sönen eski nota tekrar sayılmaz) */
  onFrame(f, level, silent) {
    level.firstElementChild.style.width = `${Math.min(100, (f.rms || 0) * 600)}%`;
    if (silent()) {
      this.$('.mic-status').textContent = SILENT_MIC_MESSAGE;
      return;
    }
    const m = f.note ? f.midi : null;
    const rms = f.rmsFast ?? f.rms ?? 0;
    const st = (this.micState ||= { cand: null, n: 0, last: null, trough: 1, armed: true });
    if (m == null) {
      st.cand = null;
      st.n = 0;
      st.armed = true;
      st.trough = 0;
      return;
    }
    // Aynı tuşa yeniden basış: ses belirgin biçimde azalıp tekrar yükselirse
    st.trough = Math.min(st.trough, rms);
    if (!st.armed && rms > st.trough * 2.5 && rms > 0.02) {
      st.armed = true;
      st.n = 0; // yeni basış: kararlılık sayımı baştan
    }
    if (m === st.cand) st.n++;
    else {
      st.cand = m;
      st.n = 1;
    }
    if (st.n === 3 && (st.armed || m !== st.last)) {
      st.last = m;
      st.armed = false;
      st.trough = rms;
      this.kb.show(m);
      this.$('.mic-status').textContent = `Duyulan: ${longName(noteFromMidi(m))}`;
      if (this.running) this.answer({ midi: m, mic: true });
    }
  }

  /** Cevabı değerlendir: {midi} ya da {letter} */
  answer(a) {
    const q = this.questions[this.i];
    if (!q || this.locked) return;
    const fb = this.$('.rd-feedback');
    const targetLetter = q.letter || parseNote(q.note).letter;
    const target = q.note ? midiOf(q.note) : null;
    let ok;
    let msg = '';
    if (a.letter) ok = a.letter === targetLetter; // nota adıyla cevap: oktav sorulmaz
    else if (!q.note) ok = pcOf(a.midi) === letterPc[targetLetter]; // klavyede bul: her oktav doğru
    else ok = a.midi === target;
    if (ok) {
      if (!this.tries) this.times.push(performance.now() - this.askedAt);
      this.results[this.i] = this.tries ? 'retry' : 'ok';
      if (a.midi != null) this.kb.flash(a.midi, 'ok');
      fb.textContent = this.tries ? `✓ Evet, ${q.note ? longName(q.note) : PC_NAMES[targetLetter]}.` : `✓ Doğru: ${q.note ? longName(q.note) : PC_NAMES[targetLetter]}!`;
      if (a.letter && q.note) playNote(q.note, 0.8);
      this.kb.clear();
      this.tries = 0;
      this.locked = true;
      this.nextTimer = setTimeout(() => {
        this.locked = false;
        this.next();
      }, this.set.mode === 'line' ? 250 : 550);
      return;
    }
    this.tries++;
    if (a.midi != null) this.kb.flash(a.midi, 'wrong');
    // Klavyede bulma türünde oktav önemsiz: yalnızca ad (siyah tuşta "diyez")
    const pcName = (m) => {
      const { letter, alter } = parseNote(noteFromMidi(m));
      return PC_NAMES[letter] + (alter ? ' diyez' : '');
    };
    const heard = a.letter ? PC_NAMES[a.letter] : q.note ? longName(noteFromMidi(a.midi)) : pcName(a.midi);
    if (q.note && a.midi != null && pcOf(a.midi) === pcOf(target)) {
      msg = `Nota doğru (${PC_NAMES[targetLetter]}) ama oktav yanlış: ${a.midi < target ? 'daha yukarıdaki' : 'daha aşağıdaki'} ${PC_NAMES[targetLetter]}'yi çal.`;
    } else if (q.note && a.midi != null) {
      const d = target - a.midi;
      msg = `Bu ${heard}. Hedef ${a.midi < target ? 'daha yukarıda (sağda)' : 'daha aşağıda (solda)'}${Math.abs(d) <= 2 ? ', çok yakınsın' : ''}.`;
    } else msg = `Bu ${heard}. Tekrar bak${q.note ? ': notanın hangi çizgide ya da aralıkta olduğunu say' : ''}.`;
    if (this.tries >= 2) {
      msg += ` İpucu: ${q.note ? longName(q.note) : PC_NAMES[targetLetter]}`;
      if (target != null) this.kb.hint(target);
      else for (let m = this.range[0]; m <= this.range[1]; m++) if (pcOf(m) === letterPc[targetLetter]) this.kb.hint(m);
    }
    fb.textContent = msg;
    this.results[this.i] = 'retry';
    this.updateCount();
    this.draw();
  }

  next() {
    this.i++;
    this.askedAt = performance.now();
    if (this.i >= this.questions.length) return this.finish();
    this.updateCount();
    this.draw();
  }

  finish() {
    this.running = false;
    this.el.classList.remove('running');
    this.listener?.stop();
    this.listener = null;
    this.midi?.stop();
    this.midi = null;
    const n = this.questions.length;
    const ok = this.results.filter((r) => r === 'ok').length;
    const pct = Math.round((ok / n) * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    progress.completeSong(`read-${this.set.id}`, stars);
    this.renderStars(progress.songStars(`read-${this.set.id}`));
    playChime();
    const avg = this.times.length ? (this.times.reduce((a, b) => a + b, 0) / this.times.length / 1000).toFixed(1).replace('.', ',') : null;
    // Zorlanılan notalar
    const missed = {};
    this.questions.forEach((q, k) => {
      if (this.results[k] !== 'ok') {
        const key = q.note || q.letter;
        missed[key] = (missed[key] || 0) + 1;
      }
    });
    const hard = Object.keys(missed)
      .sort((a, b) => missed[b] - missed[a])
      .map((k) => (k.length === 1 ? PC_NAMES[k] : longName(k)));
    this.updateCount();
    this.draw();
    const res = this.$('.drill-result');
    res.hidden = false;
    res.innerHTML = `
      <h3>Bitti!</h3>
      <b class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b>
      <div class="ws-score"><span class="big">%${pct}</span><small>ilk denemede doğru</small></div>
      <p>${n} sorunun ${ok} tanesini ilk denemede bildin${avg ? `; ortalama ${avg} saniyede` : ''}.
        ${hard.length ? `Zorlandığın notalar: <b>${hard.join(', ')}</b>. Bunlara tekrar bak.` : 'Hiç takılmadın, harika!'}</p>
      ${navButtons(this.nav, 'alıştırma')}`;
    res.querySelector('[data-act=again]').addEventListener('click', () => this.start());
    res.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Ders yolunda düğümün türü */
export const readingKind = (set) => ({ find: 'Klavye', flash: 'Nota Okuma', line: 'Satır Okuma' })[set.mode];
