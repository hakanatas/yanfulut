// Nota Noktaları: şarkının her notası resmin bir noktası. Doğru notayı çaldıkça
// sıradaki noktaya çizgi çekilir; şarkı bitince resim tamamlanır.
import { distributeDots } from './data/songs.js';
import { longName, midiOf, shortName, noteFromMidi, titleName } from './data/notes.js';
import { PitchListener, NoteMatcher, playNote, playMelody, playChime, micErrorMessage, SILENT_MIC_MESSAGE } from './audio.js';
import { fingeringSvg, fingeringToggle, staffSvg, h, heardText } from './checkpoints.js';
import { progress } from './progress.js';
import { say } from './voice.js';
import { PHRASES } from './data/phrases.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

export class DotsGame {
  constructor(root, song, { onExit } = {}) {
    this.root = root;
    this.song = song;
    this.onExit = onExit;
    this.dots = distributeDots(song.shape.outline, song.notes.length);
    this.mode = null;
    this.render();
    this.reset();
  }

  destroy() {
    this.stopAll();
  }

  render() {
    const distinct = [...new Set(this.song.notes.map((n) => n.note))].sort((a, b) => midiOf(a) - midiOf(b));
    this.root.innerHTML = '';
    this.el = h(`
      <div class="dots-game">
        <div class="dots-head">
          <div>
            <h2>${this.song.title}</h2>
            <p class="muted">Notaları çal, noktaları birleştir: gizli resim ne?</p>
            ${this.song.hint ? `<p class="song-hint">💡 ${this.song.hint}</p>` : ''}
          </div>
          <div class="stars" aria-label="Yıldızlar"></div>
        </div>
        <div class="dots-main">
          <div class="dots-board-wrap">
            <svg class="dots-board" viewBox="-6 -6 112 112" role="img" aria-label="Nokta birleştirme resmi">
              <g filter="url(#sketchy)">
                <g class="dots-scene"></g>
                <polygon class="dots-fill" points=""></polygon>
                <g class="dots-lines"></g>
                <g class="dots-details"></g>
              </g>
              <g class="dots-points"></g>
            </svg>
            <div class="dots-done" hidden></div>
          </div>
          <aside class="dots-side">
            <div class="target">
              <div class="cp-tag">Sıradaki nota</div>
              <div class="target-name"></div>
              <div class="target-visual"></div>
            </div>
            <div class="mic-status" aria-live="polite"></div>
            <div class="meter level" aria-hidden="true" hidden><span></span></div>
            <div class="hold"><span></span></div>
            <p class="cp-feedback" aria-live="polite"></p>
          </aside>
        </div>
        <div class="melody-strip" aria-label="Ezgi"></div>
        <div class="dots-controls">
          <button class="btn primary" data-mode="mic">🎤 Flütle çal</button>
          <button class="btn" data-mode="touch">👆 Dokunarak çal</button>
          <button class="btn" data-mode="demo">🔊 Dinle ve izle</button>
          <button class="btn ghost" data-act="reset">↺ Baştan</button>
        </div>
        <div class="touch-pad" hidden>
          ${distinct.map((n) => `<button class="pad-key" data-note="${n}"><b>${shortName(n)}</b>${longName(n) !== shortName(n) ? `<small>${longName(n)}</small>` : ''}</button>`).join('')}
        </div>
      </div>`);
    this.root.appendChild(this.el);

    const $ = (s) => this.el.querySelector(s);
    this.$ = $;
    this.pointsG = $('.dots-points');
    this.linesG = $('.dots-lines');
    this.detailsG = $('.dots-details');
    this.sceneG = $('.dots-scene');
    this.fillPoly = $('.dots-fill');
    this.fillPoly.style.fill = this.song.shape.color;

    // Noktalar ve numaralar
    const cx = this.dots.reduce((a, p) => a + p[0], 0) / this.dots.length;
    const cy = this.dots.reduce((a, p) => a + p[1], 0) / this.dots.length;
    this.dotEls = this.dots.map(([x, y], i) => {
      const g = svgEl('g', { class: 'dot', 'data-i': i });
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy) || 1;
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: 1.5 }));
      const label = svgEl('text', { x: x + (dx / d) * 4.2, y: y + (dy / d) * 4.2 + 1.1, 'text-anchor': 'middle' });
      label.textContent = i + 1;
      g.appendChild(label);
      this.pointsG.appendChild(g);
      return g;
    });

    // Ezgi şeridi
    $('.melody-strip').innerHTML = this.song.notes
      .map((n, i) => `<span class="chip" data-i="${i}" style="--w:${Math.min(2, n.beats)}">${shortName(n.note)}</span>`)
      .join('');

    this.el.querySelector('.dots-controls').appendChild(fingeringToggle(() => this.update(), 'btn ghost'));
    this.el.querySelector('.dots-controls').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.classList.contains('fingering-toggle')) return;
      if (btn.dataset.act === 'reset') return this.reset();
      this.setMode(btn.dataset.mode);
    });
    $('.touch-pad').addEventListener('click', (e) => {
      const key = e.target.closest('.pad-key');
      if (!key) return;
      playNote(key.dataset.note, 0.5);
      this.input(midiOf(key.dataset.note));
    });
  }

  reset() {
    this.clearPicture();
    this.setMode(null);
  }

  clearPicture() {
    this.index = 0;
    this.mistakes = 0;
    this.linesG.replaceChildren();
    this.detailsG.replaceChildren();
    this.sceneG.replaceChildren();
    this.fillPoly.setAttribute('points', '');
    this.fillPoly.classList.remove('show');
    this.$('.dots-board').classList.remove('complete');
    this.$('.dots-done').hidden = true;
    this.$('.cp-feedback').textContent = '';
    this.dotEls.forEach((d) => d.classList.remove('hit', 'next'));
    this.renderStars(progress.songStars(this.song.id));
    this.update();
  }

  renderStars(n) {
    this.$('.stars').innerHTML = [1, 2, 3].map((k) => `<span class="${k <= n ? 'on' : ''}">★</span>`).join('');
  }

  stopAll() {
    this.listener?.stop();
    this.listener = null;
    this.demo?.stop();
    this.demo = null;
  }

  async setMode(mode) {
    this.stopAll();
    // Gösteri her zaman boş resimle başlar; gösteriden sonra da resim temizlenir
    if ((mode === 'demo' || this.mode === 'demo') && this.index > 0) this.clearPicture();
    this.mode = mode;
    this.el.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    this.$('.touch-pad').hidden = mode !== 'touch';
    const status = this.$('.mic-status');
    this.$('.level').hidden = true;
    if (mode !== 'mic') {
      status.textContent = mode === 'touch' ? 'Sıradaki notanın düğmesine dokun.' : mode === 'demo' ? 'Dinle ve resmin çizilişini izle…' : 'Başlamak için bir mod seç.';
    }
    if (mode === 'mic') {
      // Şarkıda bir oktav yukarı/aşağı çalınan nota da kabul edilir (yeni başlayanlar sık sık üst oktava kayar)
      this.matcher = new NoteMatcher({
        holdMs: 220,
        octaveOk: true,
        onProgress: (p) => (this.$('.hold span').style.width = `${p * 100}%`),
        onMatch: (midi, info) => this.input(midi, info),
        onWrong: (frame) => this.input(frame.midi),
      });
      this.matcher.setTarget(this.targetMidi());
      const level = this.$('.level');
      let silent = false;
      this.listener = new PitchListener(
        (f) => {
          level.firstElementChild.style.width = `${Math.min(100, (f.rms || 0) * 600)}%`;
          if (silent) status.textContent = SILENT_MIC_MESSAGE;
          else status.textContent = f.note ? heardText(f, this.targetMidi(), { octaveOk: true }) : 'Dinliyorum… sıradaki notayı çal.';
          this.matcher.feed(f);
        },
        { onStatus: (st) => (silent = st === 'silent') },
      );
      try {
        status.textContent = 'Mikrofon açılıyor…';
        await this.listener.start();
        level.hidden = false;
      } catch (err) {
        status.textContent = `${micErrorMessage(err)} Şimdilik “Dokunarak çal” modunu kullanabilirsin.`;
        this.listener = null;
        this.el.querySelector('[data-mode=mic]').classList.remove('active');
      }
    }
    if (mode === 'demo') {
      this.demo = playMelody(this.song.notes, {
        bpm: this.song.bpm,
        onNote: (i) => this.advance(i, { demo: true }),
      });
      await this.demo.done;
      this.demo = null;
    }
  }

  targetMidi() {
    const n = this.song.notes[this.index];
    return n ? midiOf(n.note) : null;
  }

  /** Bir nota girdisi (mikrofon ya da dokunma) */
  input(midi, info) {
    if (this.index >= this.song.notes.length) return;
    const fb = this.$('.cp-feedback');
    if (midi === this.targetMidi()) {
      fb.textContent = info?.octave ? 'Bir oktav farklı çaldın ama nota doğru, kabul! 👍' : '';
      this.advance(this.index);
      if (this.mode === 'mic' && this.matcher) this.matcher.setTarget(this.targetMidi());
    } else {
      this.mistakes++;
      const target = this.song.notes[this.index].note;
      fb.textContent = `Bu ${longName(noteFromMidi(midi))} oldu, sıradaki nota ${longName(target)}.`;
      const cur = this.dotEls[this.index];
      cur.classList.remove('shake');
      void cur.getBBox();
      cur.classList.add('shake');
      if (this.mode === 'mic' && this.matcher) this.matcher.setTarget(this.targetMidi());
    }
  }

  advance(i, { demo = false } = {}) {
    this.index = i + 1;
    this.dotEls[i].classList.add('hit');
    if (i > 0) this.drawLine(this.dots[i - 1], this.dots[i]);
    this.update();
    if (this.index >= this.song.notes.length) this.complete(demo);
  }

  drawLine([x1, y1], [x2, y2]) {
    const line = svgEl('line', { x1, y1, x2, y2, class: 'dots-line' });
    this.linesG.appendChild(line);
    const len = Math.hypot(x2 - x1, y2 - y1);
    line.style.strokeDasharray = len;
    line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 260, fill: 'both', easing: 'ease-out' });
  }

  update() {
    const i = this.index;
    this.dotEls.forEach((d, k) => d.classList.toggle('next', k === i));
    this.el.querySelectorAll('.chip').forEach((c, k) => {
      c.classList.toggle('done', k < i);
      c.classList.toggle('current', k === i);
    });
    this.el.querySelector('.chip.current')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    const n = this.song.notes[i];
    this.$('.target-name').textContent = n ? titleName(n.note) : '🎉';
    this.$('.target-visual').innerHTML = n ? staffSvg(n.note) + fingeringSvg(n.note) : '';
    this.$('.hold span').style.width = '0%';
  }

  complete(demo) {
    const first = this.dots[0];
    this.drawLine(this.dots[this.dots.length - 1], first);
    this.fillPoly.setAttribute('points', this.dots.map((p) => p.join(',')).join(' '));
    this.fillPoly.classList.add('show');
    this.$('.dots-board').classList.add('complete');
    // Resmin ayrıntıları ve çevresi (çimen, gökyüzü…) sırayla belirir
    const addPaths = (target, items, base, delay0) =>
      items.forEach((item, i) => {
        const { d, cls = 'plain' } = typeof item === 'string' ? { d: item } : item;
        const path = svgEl('path', { d, class: `${base} ${cls}` });
        target.appendChild(path);
        path.animate([{ opacity: 0 }, { opacity: getComputedStyle(path).opacity }], { duration: 400, delay: delay0 + i * 120, fill: 'both' });
      });
    addPaths(this.sceneG, this.song.shape.scene || [], 'dots-scene-part', 200);
    addPaths(this.detailsG, this.song.shape.details, 'dots-detail', 700);
    this.listener?.stop();
    this.listener = null;
    let stars = 0;
    if (!demo) {
      stars = this.mistakes <= 2 ? 3 : this.mistakes <= 6 ? 2 : 1;
      progress.completeSong(this.song.id, stars);
      if (progress.settings.voice) say(PHRASES.songDone);
      this.renderStars(progress.songStars(this.song.id));
      playChime();
    }
    const done = this.$('.dots-done');
    done.hidden = false;
    done.innerHTML = demo
      ? `<b>Bu bir ${this.song.shape.name.toLocaleLowerCase('tr')}!</b><span>Şimdi sıra sende: “Flütle çal” ya da “Dokunarak çal”.</span>`
      : `<b>${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b><span>Harika! Resmi tamamladın: ${this.song.shape.name}. Hata sayısı: ${this.mistakes}</span>
         <button class="btn primary" data-act="again">Tekrar çal</button>`;
    done.querySelector('[data-act=again]')?.addEventListener('click', () => this.reset());
  }
}
