// Antrenman: resim yok; amaç doğru notayı doğru süre boyunca çalmak.
// İki mod:
//  - "Kendi hızımda": her nota, süresi kadar (vuruş × tempo) tutulunca geçilir; erken bırakılırsa tekrar istenir.
//  - "Tempolu": metronom sayımından sonra okuma çizgisi ilerler; her nota hem nota hem süre için puanlanır.
// Girdi: mikrofon ya da ekrandaki tuşa basılı tutma.
import { noteSymbol } from './art.js';
import { longName, midiOf, shortName, titleName, noteFromMidi, staffStep, parseNote } from './data/notes.js';
import { PitchListener, playNote, playChime, playClick, matchesTarget, micErrorMessage, SILENT_MIC_MESSAGE } from './audio.js';
import { fingeringSvg, fingeringToggle, staffSvg, h } from './checkpoints.js';
import { instrument } from './instrument.js';
import { progress } from './progress.js';
import { OnsetDetector, beatsPlayed, holdNeedMs, judgeNote, latencyOf } from './scoring.js';

const VALUE = {
  4: ['birlik', 'whole', '4 vuruş'],
  3: ['noktalı ikilik', 'half', '3 vuruş'],
  2: ['ikilik', 'half', '2 vuruş'],
  1.5: ['noktalı dörtlük', 'quarter', '1,5 vuruş'],
  1: ['dörtlük', 'quarter', '1 vuruş'],
  0.5: ['sekizlik', 'eighth', 'yarım vuruş'],
};
const valueOf = (beats) => VALUE[beats] || VALUE[1];

// Porte ölçüleri
const SP = 13;
const TOP = 30;
const BOTTOM = TOP + SP * 4;
const BEAT_W = 72;
const X0 = 96;
const BAR_Y = BOTTOM + SP * 4.3;

const stepOf = (id) => staffStep(id);
const yOf = (id) => BOTTOM - (stepOf(id) * SP) / 2;

/** Ek çizgiler ve diyez/bemol işareti */
function ledgersAndAccidental(id, cx) {
  const step = stepOf(id);
  let out = '';
  const ledger = (k) => `<line x1="${cx - SP * 1.05}" y1="${BOTTOM - (k * SP) / 2}" x2="${cx + SP * 1.05}" y2="${BOTTOM - (k * SP) / 2}" class="ink thin"/>`;
  for (let k = -2; k >= step; k -= 2) out += ledger(k);
  for (let k = 10; k <= step; k += 2) out += ledger(k);
  const { alter } = parseNote(id);
  if (alter) out += `<text x="${cx - SP * 1.45}" y="${yOf(id) + SP * 0.7}" font-size="${SP * 2.6}" text-anchor="middle" class="clef ink-fill">${alter > 0 ? '♯' : '♭'}</text>`;
  return out;
}

/** Bir notayı çizer; beam verilirse sapı ortak kirişe kadar uzatır (bayraksız) */
function drawNote(n, cx, beam) {
  const cy = yOf(n.note);
  let out = ledgersAndAccidental(n.note, cx);
  if (!beam) return out + noteSymbol(cx, cy, SP, valueOf(n.beats)[1], stepOf(n.note) >= 4);
  const rx = SP * 0.68;
  out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${SP * 0.48}" transform="rotate(-20 ${cx} ${cy})" class="ink head-g"/>`;
  const sx = beam.down ? cx - rx + 1 : cx + rx - 1;
  out += `<line x1="${sx}" y1="${cy}" x2="${sx}" y2="${beam.y}" class="ink"/>`;
  return out;
}

/** Aynı vuruştaki iki sekizliği kirişle bağlar: [{i, j, down, y}] */
function beamPairs(notes) {
  const pairs = [];
  let pos = 0;
  for (let i = 0; i < notes.length; i++) {
    const a = notes[i];
    const b = notes[i + 1];
    if (a.beats === 0.5 && b?.beats === 0.5 && Number.isInteger(pos)) {
      const down = (stepOf(a.note) + stepOf(b.note)) / 2 >= 4;
      const ys = [yOf(a.note), yOf(b.note)];
      const y = down ? Math.max(...ys) + SP * 3.3 : Math.min(...ys) - SP * 3.3;
      pairs.push({ i, j: i + 1, down, y });
      pos += 1;
      i++;
      continue;
    }
    pos += a.beats;
  }
  return pairs;
}

/** Antrenman notalarını ölçü çizgileri, vuruş sayıları ve süre çubuklarıyla çizer */
function drillStaff(notes) {
  const total = notes.reduce((a, n) => a + n.beats, 0);
  const width = X0 + total * BEAT_W + 24;
  let out = '';
  for (let i = 0; i < 5; i++) out += `<line x1="8" y1="${TOP + i * SP}" x2="${width - 8}" y2="${TOP + i * SP}" class="ink thin"/>`;
  out += `<text x="10" y="${BOTTOM + SP * 1.05}" font-size="${SP * 6.6}" class="clef ink-fill">𝄞</text>`;
  out += `<text x="66" y="${TOP + SP * 1.9}" font-size="${SP * 2.4}" text-anchor="middle" class="time-sig">4</text><text x="66" y="${TOP + SP * 3.9}" font-size="${SP * 2.4}" text-anchor="middle" class="time-sig">4</text>`;
  // Ölçü çizgileri ve vuruş sayıları
  for (let b = 0; b <= total; b++) {
    const x = X0 + b * BEAT_W;
    if (b > 0 && b % 4 === 0) out += b === total ? `<path d="M${x - 6} ${TOP} V${BOTTOM}" class="ink thin"/><rect x="${x - 3}" y="${TOP}" width="4" height="${SP * 4}" class="fill-ink"/>` : `<path d="M${x - 2} ${TOP} V${BOTTOM}" class="ink thin"/>`;
    if (b < total) out += `<text x="${x + 18}" y="${BAR_Y + 34}" text-anchor="middle" class="beat-num ${b % 4 === 0 ? 'strong' : ''}">${(b % 4) + 1}</text>`;
  }
  const pairs = beamPairs(notes);
  const beamOf = (i) => pairs.find((p) => p.i === i || p.j === i);
  const xs = [];
  let pos = 0;
  notes.forEach((n, i) => {
    const x = X0 + pos * BEAT_W;
    const w = n.beats * BEAT_W;
    xs.push(x + 18);
    out += `<g class="drill-note" data-i="${i}">
      <rect x="${x + 2}" y="${TOP - 18}" width="${w - 4}" height="${BAR_Y + 44 - TOP}" rx="8" class="drill-hl"/>
      ${drawNote(n, x + 18, beamOf(i))}
      ${n.beats === 3 || n.beats === 1.5 ? `<circle cx="${x + 34}" cy="${BOTTOM - (SP / 2) * 0.5}" r="2.6" class="fill-ink"/>` : ''}
      <rect x="${x + 6}" y="${BAR_Y}" width="${w - 12}" height="10" rx="5" class="dur-bar"/>
      <rect x="${x + 6}" y="${BAR_Y}" width="0" height="10" rx="5" class="dur-fill"/>
      <text x="${x + w / 2}" y="${BAR_Y - 6}" text-anchor="middle" class="dur-name">${shortName(n.note)}</text>
    </g>`;
    pos += n.beats;
  });
  // Kirişler
  const rx = SP * 0.68;
  for (const p of pairs) {
    const x1 = xs[p.i] + (p.down ? -rx + 1 : rx - 1);
    const x2 = xs[p.j] + (p.down ? -rx + 1 : rx - 1);
    const t = p.down ? -5 : 0;
    out += `<rect x="${x1 - 1}" y="${p.y + t}" width="${x2 - x1 + 2}" height="5" class="fill-ink"/>`;
  }
  out += `<line class="playhead" x1="${X0}" y1="${TOP - 20}" x2="${X0}" y2="${BAR_Y + 40}" hidden/>`;
  return `<svg class="drill-staff" viewBox="0 0 ${width} ${BAR_Y + 46}" width="${width}" height="${BAR_Y + 46}" role="img" aria-label="Antrenman notaları">${out}</svg>`;
}

/** Sonuç kartının alt düğmeleri: tekrar, önceki ve sonraki */
export function navButtons(nav, what) {
  return `<div class="end-actions result-nav">
    ${nav.prev ? `<a class="btn" href="${nav.prev.href}" title="${nav.prev.title}">◀ Önceki ${what}</a>` : ''}
    <button class="btn" data-act="again">↺ Tekrar çal</button>
    ${nav.next ? `<a class="btn primary" href="${nav.next.href}">Sonraki ${what}: ${nav.next.title} ▶</a>` : ''}
  </div>`;
}

export class DrillGame {
  /** nav: {prev, next} → {href, title}; sonuç kartında önceki/sonraki antrenman düğmeleri */
  constructor(root, drill, { nav = {} } = {}) {
    this.root = root;
    this.drill = drill;
    this.nav = nav;
    this.notes = drill.notes;
    this.beatMs = 60000 / drill.bpm;
    this.input = 'mic';
    this.mode = 'hold';
    this.render();
    this.reset();
  }

  destroy() {
    this.stop();
  }

  render() {
    const distinct = [...new Set(this.notes.map((n) => n.note))].sort((a, b) => midiOf(a) - midiOf(b));
    const name = instrument().name;
    this.root.innerHTML = '';
    this.el = h(`
      <div class="drill">
        <div class="drill-head">
          <div>
            <div class="cp-tag">Antrenman</div>
            <h2>${this.drill.title}</h2>
            <p class="muted">${this.drill.focus} · ${this.drill.bpm} vuruş/dakika</p>
          </div>
          <div class="stars" aria-label="Yıldızlar"></div>
        </div>
        <div class="drill-options">
          <div class="seg-group" role="group" aria-label="Nasıl çalacaksın">
            <button class="chip-btn" data-input="mic">🎤 ${name}la çal</button>
            <button class="chip-btn" data-input="touch">👆 Tuşa basılı tut</button>
          </div>
          <div class="seg-group" role="group" aria-label="Mod">
            <button class="chip-btn" data-mode="hold" title="Her notayı süresi kadar tut, sonra sıradakine geç">⏳ Kendi hızımda</button>
            <button class="chip-btn" data-mode="tempo" title="Metronomla, okuma çizgisiyle birlikte çal">🥁 Tempolu</button>
          </div>
          <button class="btn primary" data-act="start">▶ Başla</button>
          <button class="btn ghost" data-act="reset">↺ Baştan</button>
          <button class="btn ghost" data-act="listen">🔊 Dinle</button>
        </div>
        <div class="drill-staff-wrap">${drillStaff(this.notes)}</div>
        <div class="drill-main">
          <div class="drill-target">
            <div class="countdown" hidden></div>
            <div class="target-name"></div>
            <div class="value-line"><svg class="value-sym" viewBox="0 0 44 60" aria-hidden="true"></svg><span class="value-text"></span></div>
            <div class="beat-dots" aria-hidden="true"></div>
            <div class="hold"><span></span></div>
            <p class="cp-feedback" aria-live="polite"></p>
          </div>
          <div class="drill-side">
            <div class="target-visual"></div>
            <div class="mic-status muted" aria-live="polite"></div>
            <div class="meter level" aria-hidden="true" hidden><span></span></div>
          </div>
        </div>
        <div class="touch-pad" hidden>
          ${distinct.map((n) => `<button class="pad-key" data-note="${n}"><b>${shortName(n)}</b>${longName(n) !== shortName(n) ? `<small>${longName(n)}</small>` : ''}</button>`).join('')}
        </div>
        <div class="drill-result" hidden></div>
      </div>`);
    this.root.appendChild(this.el);
    const $ = (s) => this.el.querySelector(s);
    this.$ = $;
    this.noteEls = [...this.el.querySelectorAll('.drill-note')];
    $('.drill-options').appendChild(fingeringToggle(() => this.showTarget(this.index || 0)));

    this.el.querySelector('.drill-options').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.input) this.setInput(b.dataset.input);
      else if (b.dataset.mode) this.setMode(b.dataset.mode);
      else if (b.dataset.act === 'start') this.start();
      else if (b.dataset.act === 'reset') this.reset();
      else if (b.dataset.act === 'listen') this.listen();
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

  /** Antrenmanı başa sarar */
  reset() {
    this.stop();
    this.index = 0;
    this.results = this.notes.map(() => null);
    this.noteEls.forEach((g) => {
      g.classList.remove('current', 'ok', 'short', 'miss');
      g.querySelector('.dur-fill').setAttribute('width', 0);
    });
    this.$('.drill-result').hidden = true;
    this.$('.cp-feedback').textContent = '';
    this.$('.countdown').hidden = true;
    this.$('.playhead').setAttribute('hidden', '');
    this.renderStars(progress.songStars(`drill-${this.drill.id}`));
    this.showTarget(0);
    this.$('.mic-status').textContent = this.input === 'mic' ? '"Başla"ya bas, mikrofon açılsın.' : '"Başla"ya bas, sonra tuşa notanın süresi kadar basılı tut.';
  }

  renderStars(n) {
    this.$('.stars').innerHTML = [1, 2, 3].map((k) => `<span class="${k <= n ? 'on' : ''}">★</span>`).join('');
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.countTimer);
    this.listener?.stop();
    this.listener = null;
    this.demo?.stop();
    this.demo = null;
    this.releasePad?.();
    this.el?.querySelector('[data-act=start]')?.removeAttribute('disabled');
  }

  /** Antrenmanı dinlet (doğru süreleriyle) */
  listen() {
    this.stop();
    let i = 0;
    const play = () => {
      if (i >= this.notes.length) return;
      const n = this.notes[i];
      this.showTarget(i);
      this.highlight(i);
      playNote(n.note, ((n.beats * this.beatMs) / 1000) * 0.92);
      i++;
      this.countTimer = setTimeout(play, n.beats * this.beatMs);
    };
    play();
  }

  highlight(i) {
    this.noteEls.forEach((g, k) => g.classList.toggle('current', k === i));
    const el = this.noteEls[i];
    if (el) {
      const wrap = this.$('.drill-staff-wrap');
      const box = el.getBBox();
      const target = box.x - wrap.clientWidth / 3;
      wrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }

  /** Hedef notanın büyük gösterimi */
  showTarget(i) {
    const n = this.notes[i];
    if (!n) return;
    const [vName, vSym, vBeats] = valueOf(n.beats);
    this.$('.target-name').textContent = titleName(n.note);
    this.$('.value-sym').innerHTML = noteSymbol(16, 44, 11, vSym, false) + (n.beats === 3 || n.beats === 1.5 ? '<circle cx="30" cy="44" r="2.4" class="fill-ink"/>' : '');
    this.$('.value-text').textContent = `${vName} · ${vBeats}`;
    const dots = Math.max(1, Math.ceil(n.beats));
    this.$('.beat-dots').innerHTML = Array.from({ length: dots }, (_, k) => `<span class="${n.beats < 1 ? 'half' : ''}" data-k="${k}"></span>`).join('');
    // Parmak resmi gizlendiyse yalnızca porte üzerindeki nota gösterilir
    this.$('.target-visual').innerHTML = fingeringSvg(n.note) || staffSvg(n.note);
    this.setHold(0, n.beats);
  }

  /** Tutma ilerlemesi: vuruş noktaları ve süre çubuğu */
  setHold(fraction, beats = this.notes[this.index]?.beats || 1) {
    const f = Math.max(0, Math.min(1, fraction));
    this.$('.hold span').style.width = `${f * 100}%`;
    const filled = f * Math.max(1, Math.ceil(beats));
    this.$('.beat-dots')
      .querySelectorAll('span')
      .forEach((d, k) => d.classList.toggle('on', filled > k + 0.02));
    const g = this.noteEls[this.index];
    if (g) {
      const bar = g.querySelector('.dur-bar');
      g.querySelector('.dur-fill').setAttribute('width', f * Number(bar.getAttribute('width')));
    }
  }

  async start() {
    this.reset();
    this.el.querySelector('[data-act=start]').setAttribute('disabled', '');
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
        this.el.querySelector('[data-act=start]').removeAttribute('disabled');
        return;
      }
    }
    this.running = true;
    if (this.mode === 'hold') this.startHold();
    else this.startTempo();
  }

  /** Şu an çalınan nota (midi) ya da null */
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

  // ------------------------------------------------------------- Kendi hızımda
  startHold() {
    this.index = 0;
    this.enterNote(0);
    const loop = () => {
      if (!this.running) return;
      this.tickHold(performance.now());
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  enterNote(i) {
    this.index = i;
    this.holdStart = 0;
    this.lastHit = 0;
    this.reached = false;
    this.peakRms = 0;
    this.wrongSince = 0;
    this.wrongMidi = null;
    this.showTarget(i);
    this.highlight(i);
    this.setHold(0);
  }

  tickHold(now) {
    const n = this.notes[this.index];
    const target = midiOf(n.note);
    // Süre affedilmez: yazılı sürenin neredeyse tamamı tutulmalı (scoring.js)
    const needMs = holdNeedMs(n.beats * this.beatMs, this.input);
    const s = this.sounding(now);
    const fb = this.$('.cp-feedback');
    // Aynı nota tekrarlanırken notalar arasındaki boşluk çok kısa olabilir (dil vuruşu, yay değişimi):
    // ses şiddetindeki ani düşüş de "bırakma" sayılır.
    const rms = this.input === 'mic' ? this.frame?.rms || 0 : this.pressed != null ? 1 : 0;
    // Süre tamamlandıysa küçük bir düşüş bile yeni nota başlangıcı sayılır
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
      this.setHold(held / needMs, n.beats);
      if (!this.reached && held >= needMs) {
        this.reached = true;
        this.mark(this.index, 'ok');
        fb.textContent = 'Tamam! Şimdi bırak ve sıradakine geç.';
        const next = this.notes[this.index + 1];
        // Sıradaki nota farklıysa doğrudan geçilebilir; aynı notaysa önce bırakmak gerekir
        if (next && next.note !== n.note) this.advance();
        else if (!next) this.finish();
      }
      return;
    }
    // Nota bırakıldı: hedef süreye ulaşıldıysa kısa bir boşluk yeter; ulaşılmadıysa kısa kopmalar sayılmaz
    if (this.holdStart && (this.reached || now - this.lastHit > 140)) {
      const held = this.lastHit - this.holdStart;
      if (this.reached) {
        this.advance();
        return;
      }
      if (held > 120) {
        const beatsHeld = Math.max(0.5, Math.round((held / this.beatMs) * 2) / 2);
        fb.textContent = `Kısa kaldı: ${valueOf(n.beats)[2]} tutmalısın (sen yaklaşık ${String(beatsHeld).replace('.', ',')} vuruş tuttun). Tekrar dene!`;
        this.results[this.index] = this.results[this.index] || 'short';
        this.noteEls[this.index].classList.add('short');
      }
      this.holdStart = 0;
      this.setHold(0);
    }
    // Yanlış nota
    const m = this.midiOfSounding(s);
    if (m != null && !this.isTarget(s, target)) {
      if (this.wrongMidi !== m) {
        this.wrongMidi = m;
        this.wrongSince = now;
      } else if (this.wrongSince && now - this.wrongSince > 500) {
        this.wrongSince = 0;
        fb.textContent = `Bu ${longName(noteFromMidi(m))}; hedef ${longName(n.note)}. Parmaklarını resimle karşılaştır.`;
        if (this.results[this.index] !== 'short') this.results[this.index] = 'wrong';
      }
    }
  }

  advance() {
    const next = this.index + 1;
    if (next >= this.notes.length) return this.finish();
    this.$('.cp-feedback').textContent = '';
    this.enterNote(next);
  }

  /** Notanın sonucunu işaretle: ilk denemede tam süre 'ok', önce kısa kaldıysa 'short' olarak kalır */
  mark(i, kind) {
    if (kind === 'ok' && this.results[i] && this.results[i] !== 'ok') {
      // İlk denemede kısa ya da yanlıştı: porte üzerinde sarı kalsın
      this.noteEls[i].classList.remove('current');
      this.noteEls[i].classList.add('short');
      return;
    }
    this.results[i] = kind;
    this.noteEls[i].classList.remove('current', 'short', 'miss');
    this.noteEls[i].classList.add(kind);
  }

  // ------------------------------------------------------------- Tempolu
  startTempo() {
    const countEl = this.$('.countdown');
    countEl.hidden = false;
    this.$('.cp-feedback').textContent = 'Dinle: dört vuruş sayıyorum. Okuma çizgisi ilk notanı duyunca başlar.';
    let k = 4;
    const tick = () => {
      if (!this.running) return;
      if (k === 0) {
        countEl.hidden = true;
        this.$('.cp-feedback').textContent = '';
        return this.runTempo();
      }
      countEl.textContent = k;
      playClick(k === 4);
      k--;
      this.countTimer = setTimeout(tick, this.beatMs);
    };
    tick();
  }

  runTempo() {
    const starts = [];
    let acc = 0;
    for (const n of this.notes) {
      starts.push(acc);
      acc += n.beats * this.beatMs;
    }
    const total = acc;
    const correct = this.notes.map(() => 0);
    const wrong = this.notes.map(() => 0);
    const onsets = [];
    const detector = new OnsetDetector();
    const playhead = this.$('.playhead');
    playhead.removeAttribute('hidden');
    playhead.setAttribute('x1', X0);
    playhead.setAttribute('x2', X0);
    const latency = latencyOf(this.input);
    const fb = this.$('.cp-feedback');
    fb.textContent = `Hazır olduğunda ilk notayı (${longName(this.notes[0].note)}) çal: okuma çizgisi seni bekliyor.`;
    this.showTarget(0);
    this.highlight(0);
    let t0 = null; // ilk ses duyulunca kurulur
    let soundSince = 0;
    let last = performance.now();
    let cur = -1;
    const evaluate = (i) => {
      const n = this.notes[i];
      const dur = n.beats * this.beatMs;
      const repeat = i > 0 && this.notes[i - 1].note === n.note;
      // Pencere geniş: önceki notanın ortasından bu notanın %60'ına kadar (insan temposu biraz kayar)
      const prevDur = repeat ? this.notes[i - 1].beats * this.beatMs : 0;
      const rearticulated = !repeat || onsets.some((t) => t >= starts[i] - prevDur / 2 && t <= starts[i] + dur * 0.6);
      const kind = judgeNote({ ms: dur, correct: correct[i], wrong: wrong[i], rearticulated });
      this.results[i] = kind;
      this.noteEls[i].classList.remove('current');
      this.noteEls[i].classList.add(kind);
      const got = String(beatsPlayed(correct[i], this.beatMs)).replace('.', ',');
      fb.textContent =
        `Önceki nota (${shortName(n.note)}): ` +
        {
          ok: '✓ doğru nota, tam süre',
          short: rearticulated ? `süre eksik! ${valueOf(n.beats)[2]} çalmalıydın, yaklaşık ${got} vuruş çaldın.` : 'aynı notayı yeniden başlatmadın: dil vur (tu-tu).',
          wrong: `yanlış nota, hedef ${longName(n.note)} idi.`,
          miss: 'kaçırdın.',
        }[kind];
    };
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      const s = this.sounding(now);
      if (t0 == null) {
        if (s == null) soundSince = 0;
        else if (!soundSince) soundSince = now;
        if (!soundSince || now - soundSince < 60) {
          this.raf = requestAnimationFrame(loop);
          return;
        }
        t0 = soundSince - latency;
        last = soundSince;
        fb.textContent = '';
      }
      const dt = now - last;
      last = now;
      const heard = now - t0 - latency;
      const rms = this.input === 'mic' ? (this.frame?.rmsFast ?? this.frame?.rms) || 0 : s != null ? 1 : 0;
      if (detector.update(s != null, rms)) onsets.push(heard - (this.input === 'mic' ? 30 : 0));
      playhead.setAttribute('x1', X0 + (heard / this.beatMs) * BEAT_W);
      playhead.setAttribute('x2', X0 + (heard / this.beatMs) * BEAT_W);
      let i = cur;
      while (i + 1 < this.notes.length && heard >= starts[i + 1]) i++;
      if (i !== cur) {
        if (cur >= 0) evaluate(cur);
        cur = i;
        this.index = i;
        if (i >= 0) {
          this.showTarget(i);
          this.highlight(i);
        }
      }
      if (cur >= 0) {
        if (this.isTarget(s, midiOf(this.notes[cur].note))) correct[cur] += dt;
        else if (s != null) wrong[cur] += dt;
        const dur = this.notes[cur].beats * this.beatMs;
        this.setHold((heard - starts[cur]) / dur, this.notes[cur].beats);
      }
      if (heard >= total) {
        evaluate(cur);
        playhead.setAttribute('hidden', '');
        return this.finish();
      }
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  // ------------------------------------------------------------- Sonuç
  finish() {
    const n = this.notes.length;
    const count = (k) => this.results.filter((r) => (r || 'miss') === k).length;
    const ok = count('ok');
    const short = count('short');
    const wrong = count('wrong');
    const miss = count('miss');
    this.stop();
    const ratio = ok / n;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;
    progress.completeSong(`drill-${this.drill.id}`, stars);
    this.renderStars(progress.songStars(`drill-${this.drill.id}`));
    playChime();
    this.noteEls.forEach((g) => g.classList.remove('current'));
    const res = this.$('.drill-result');
    res.hidden = false;
    res.innerHTML = `
      <b class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b>
      <div class="ws-score"><span class="big">%${Math.round(ratio * 100)}</span><small>doğru (nota ve tam süre birlikte)</small></div>
      <div class="result-grid ws-counts">
        <div class="ok"><span class="big">${ok}</span><small>✓ doğru</small></div>
        <div class="short"><span class="big">${short}</span><small>◐ süre eksik</small></div>
        <div class="wrong"><span class="big">${wrong}</span><small>✗ yanlış nota</small></div>
        ${this.mode === 'tempo' ? `<div class="miss"><span class="big">${miss}</span><small>○ kaçırılan</small></div>` : ''}
      </div>
      <p>${ratio === 1 ? 'Kusursuz! Hem notalar hem süreler doğru.' : 'Renkli notalar portede duruyor: sarı süre eksik, kırmızı yanlış ya da kaçırılan nota.'}</p>
      ${navButtons(this.nav, 'antrenman')}`;
    res.querySelector('[data-act=again]').addEventListener('click', () => this.start());
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

}
