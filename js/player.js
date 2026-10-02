// Etkileşimli ders oynatıcısı. İki kaynak türünü destekler:
//  1) Çizimli sahneler: tahtaya çizim + anlatım (seslendirme/altyazı) + duraklar
//  2) Gerçek video (mp4/webm): belirli saniyelerde duran ve soru soran video
import { Board } from './sketch.js';
import { speak, stopSpeaking, estimateMs, canSpeak } from './voice.js';
import { playNote, playMelody } from './audio.js';
import { runCheckpoint, h } from './checkpoints.js';
import { progress } from './progress.js';
import { createMedia } from './media.js';

const TICK = 50;

export class LessonPlayer {
  constructor(root, lesson, { onComplete } = {}) {
    this.root = root;
    this.lesson = lesson;
    this.onComplete = onComplete;
    this.isVideo = !!lesson.video;
    this.items = this.isVideo ? lesson.video.cues || [] : lesson.scenes;
    this.index = 0;
    this.paused = true;
    this.started = false;
    this.token = null;
    this.render();
    this.onKey = this.onKey.bind(this);
    document.addEventListener('keydown', this.onKey);
  }

  destroy() {
    if (this.token) this.token.cancelled = true;
    this.checkpoint?.cancel();
    this.sound?.stop();
    stopSpeaking();
    this.board?.clear();
    this.media?.destroy();
    document.removeEventListener('keydown', this.onKey);
  }

  // ------------------------------------------------------------------ arayüz
  render() {
    const s = progress.settings;
    this.root.innerHTML = '';
    this.el = h(`
      <div class="player">
        <div class="stage">
          ${this.isVideo ? '<div class="media-host"></div>' : '<svg class="board" viewBox="0 0 800 450" aria-hidden="true"></svg>'}
          <div class="caption" aria-live="polite" ${s.captions ? '' : 'hidden'}></div>
          <div class="cp-overlay" hidden></div>
          <button class="cover">
            <span class="cover-play" aria-hidden="true">▶</span>
            <span class="cover-title">${this.lesson.title}</span>
            <span class="cover-sub">${this.lesson.summary || ''}</span>
          </button>
        </div>
        <div class="controls">
          <button class="ctl" data-act="prev" title="Önceki sahne (←)" aria-label="Önceki sahne">⏮</button>
          <button class="ctl play" data-act="toggle" title="Oynat / Duraklat (boşluk)" aria-label="Oynat">▶</button>
          <button class="ctl" data-act="next" title="Sonraki sahne (→)" aria-label="Sonraki sahne">⏭</button>
          <div class="timeline" role="group" aria-label="Sahneler"></div>
          ${this.isVideo || !canSpeak() ? '' : `<button class="ctl toggle ${s.voice ? 'on' : ''}" data-act="voice" title="Seslendirme" aria-pressed="${s.voice}">🗣</button>`}
          <button class="ctl toggle ${s.captions ? 'on' : ''}" data-act="cc" title="Altyazı" aria-pressed="${s.captions}">CC</button>
        </div>
      </div>`);
    this.root.appendChild(this.el);
    this.caption = this.el.querySelector('.caption');
    this.overlay = this.el.querySelector('.cp-overlay');
    this.cover = this.el.querySelector('.cover');
    this.playBtn = this.el.querySelector('[data-act=toggle]');
    this.timeline = this.el.querySelector('.timeline');

    if (this.isVideo) this.setupVideo();
    else this.board = new Board(this.el.querySelector('.board'));
    this.renderTimeline();

    this.cover.addEventListener('click', () => this.play());
    this.el.querySelector('.controls').addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'toggle') this.toggle();
      else if (act === 'prev') this.step(-1);
      else if (act === 'next') this.step(1);
      else if (act === 'voice') this.toggleSetting('voice', e.target);
      else if (act === 'cc') {
        this.toggleSetting('captions', e.target);
        this.caption.hidden = !progress.settings.captions;
        this.media?.setCaptions(progress.settings.captions);
      }
    });
  }

  toggleSetting(key, btn) {
    const v = !progress.settings[key];
    progress.setSetting(key, v);
    btn.classList.toggle('on', v);
    btn.setAttribute('aria-pressed', v);
    if (key === 'voice' && !v) stopSpeaking();
  }

  renderTimeline() {
    if (this.isVideo) {
      this.timeline.innerHTML = '<div class="seg video-seg"><span class="fill"></span></div>';
      return;
    }
    this.timeline.innerHTML = this.items
      .map(
        (sc, i) =>
          `<button class="seg ${sc.check ? 'has-check' : ''}" data-i="${i}" title="Sahne ${i + 1}${sc.check ? ' · etkileşim' : ''}" aria-label="Sahne ${i + 1}"><span class="fill"></span></button>`,
      )
      .join('');
    this.timeline.addEventListener('click', (e) => {
      const seg = e.target.closest('.seg');
      if (seg) this.jump(Number(seg.dataset.i));
    });
  }

  setSegment(i, fraction) {
    this.timeline.querySelectorAll('.seg').forEach((seg, k) => {
      const f = k < i ? 1 : k === i ? fraction : 0;
      seg.querySelector('.fill').style.width = `${f * 100}%`;
      seg.classList.toggle('current', k === i);
    });
  }

  setPlayingUI(playing) {
    this.playBtn.textContent = playing ? '⏸' : '▶';
    this.playBtn.setAttribute('aria-label', playing ? 'Duraklat' : 'Oynat');
    this.el.classList.toggle('is-playing', playing);
  }

  onKey(e) {
    if (e.target.closest('input, textarea') || !this.root.isConnected) return;
    if (!this.overlay.hidden) return; // durakta klavye düğmeler içindir
    if (e.code === 'Space') {
      e.preventDefault();
      this.toggle();
    } else if (e.code === 'ArrowRight') this.step(1);
    else if (e.code === 'ArrowLeft') this.step(-1);
  }

  toggle() {
    if (this.checkpoint) return; // durak açıkken video zaten bekliyor
    if (this.paused) this.play();
    else this.pause();
  }

  step(dir) {
    if (this.isVideo) this.seekCue(dir);
    else this.jump(this.index + dir);
  }

  // ------------------------------------------------------------- oynatma
  play() {
    this.cover.hidden = true;
    if (this.isVideo) {
      if (this.ended) this.items.forEach((c) => (c.done = false));
      this.ended = false;
      this.media.play();
      return;
    }
    if (this.ended) return this.jump(0);
    if (!this.started) {
      this.started = true;
      this.paused = false;
      this.setPlayingUI(true);
      this.runFrom(0);
      return;
    }
    if (!this.paused) return;
    this.paused = false;
    this.setPlayingUI(true);
    this.board.resume();
  }

  pause() {
    if (this.isVideo) {
      this.media.pause();
      return;
    }
    if (this.paused) return;
    this.paused = true;
    this.setPlayingUI(false);
    this.board.pause();
    this.sound?.stop();
    if (this.speaking) {
      this.speechInterrupted = true;
      stopSpeaking();
    }
  }

  jump(i) {
    if (i < 0 || i >= this.items.length) return;
    this.cover.hidden = true;
    this.started = true;
    this.ended = false;
    this.rebuildBoard(i);
    this.paused = false;
    this.setPlayingUI(true);
    this.runFrom(i);
  }

  /** i. sahneden önceki çizimleri anında yeniden kurar */
  rebuildBoard(i) {
    if (this.token) this.token.cancelled = true;
    this.checkpoint?.cancel();
    this.sound?.stop();
    stopSpeaking();
    this.board.clear();
    let start = i;
    while (start > 0 && !this.items[start].clear) start--;
    for (let k = start; k < i; k++) this.board.draw(this.items[k].draw, { instant: true });
  }

  async runFrom(i) {
    const token = { cancelled: false };
    this.token = token;
    for (let k = i; k < this.items.length; k++) {
      this.index = k;
      const ok = await this.playScene(k, token);
      if (!ok || token.cancelled) return;
      const sc = this.items[k];
      if (sc.check) {
        this.setPlayingUI(false);
        this.checkpoint = runCheckpoint(this.overlay, sc.check);
        await this.checkpoint.done;
        this.checkpoint = null;
        if (token.cancelled) return;
        this.setPlayingUI(true);
      }
    }
    this.paused = true;
    this.setPlayingUI(false);
    this.finished();
  }

  async playScene(i, token) {
    const sc = this.items[i];
    if (sc.clear) this.board.clear();
    const drawMs = this.board.draw(sc.draw, { maxDuration: Math.max(1800, estimateMs(sc.say || '') * 0.8) });
    this.caption.textContent = sc.say || '';
    const est = Math.max(drawMs, estimateMs(sc.say || ''));
    let elapsed = 0;
    const progressTimer = setInterval(() => {
      if (!this.paused) elapsed += TICK;
      this.setSegment(i, Math.min(0.95, elapsed / est));
    }, TICK);
    try {
      if (sc.sound) this.playSound(sc.sound);
      const [a, b] = await Promise.all([this.wait(drawMs, token), this.narrate(sc.say || '', token)]);
      if (!a || !b) return false;
      if (!(await this.wait(sc.check ? 300 : 700, token))) return false;
      this.setSegment(i, 1);
      return true;
    } finally {
      clearInterval(progressTimer);
    }
  }

  playSound(sound) {
    this.sound?.stop();
    this.sound = sound.melody ? playMelody(sound.melody.map((note) => ({ note })), { bpm: sound.bpm || 80 }) : playNote(sound.note, sound.dur || 1.5);
  }

  /** Duraklatılan süreyi saymadan bekler. İptal edilirse false döner. */
  wait(ms, token) {
    return new Promise((resolve) => {
      let left = ms;
      const step = () => {
        if (token.cancelled) return resolve(false);
        if (!this.paused) left -= TICK;
        if (left <= 0) return resolve(true);
        setTimeout(step, TICK);
      };
      step();
    });
  }

  untilResumed(token) {
    return this.wait(1, token);
  }

  async narrate(text, token) {
    if (!text) return true;
    if (!progress.settings.voice || !canSpeak()) return this.wait(estimateMs(text, progress.settings.rate), token);
    for (;;) {
      if (!(await this.untilResumed(token))) return false;
      if (!progress.settings.voice) return this.wait(estimateMs(text) * 0.5, token);
      this.speaking = true;
      this.speechInterrupted = false;
      const t0 = performance.now();
      const ok = await speak(text, { rate: progress.settings.rate });
      this.speaking = false;
      if (token.cancelled) return false;
      if (this.speechInterrupted) continue; // duraklatıldı: devam edince cümleyi baştan oku
      // Ses motoru hiç konuşamadıysa altyazının okunabilmesi için bekle
      const spoke = performance.now() - t0;
      if (!ok || spoke < 400) return this.wait(Math.max(0, estimateMs(text) - spoke), token);
      return true;
    }
  }

  finished() {
    this.ended = true;
    this.caption.textContent = '';
    this.onComplete?.();
  }

  // ------------------------------------------------------------- gerçek video
  setupVideo() {
    const m = createMedia(this.el.querySelector('.media-host'), this.lesson.video);
    this.media = m;
    if (m.hasOwnCaptions) this.caption.remove();
    m.setCaptions(progress.settings.captions);
    this.items.forEach((cue) => (cue.done = false));
    m.on('play', () => {
      this.paused = false;
      this.cover.hidden = true;
      this.setPlayingUI(true);
    });
    m.on('pause', () => {
      this.paused = true;
      this.setPlayingUI(false);
    });
    m.on('ready', () => this.renderCueMarkers());
    m.on('time', (t) => {
      const fill = this.timeline.querySelector('.fill');
      if (m.duration) fill.style.width = `${(t / m.duration) * 100}%`;
      const cue = this.items.find((c) => !c.done && t >= c.at);
      if (cue && !this.checkpoint) this.videoCheckpoint(cue);
    });
    m.on('ended', () => this.finished());
    this.timeline.addEventListener('click', (e) => {
      if (!m.duration) return;
      const rect = this.timeline.getBoundingClientRect();
      // İleri sarılırken atlanan duraklar yine sorulur
      m.seek(((e.clientX - rect.left) / rect.width) * m.duration);
    });
  }

  renderCueMarkers() {
    const seg = this.timeline.querySelector('.seg');
    seg.querySelectorAll('.cue-mark').forEach((c) => c.remove());
    this.items.forEach((cue) => {
      seg.appendChild(h(`<span class="cue-mark" style="left:${(cue.at / this.media.duration) * 100}%"></span>`));
    });
  }

  async videoCheckpoint(cue) {
    this.media.pause();
    this.checkpoint = runCheckpoint(this.overlay, cue.check);
    await this.checkpoint.done;
    this.checkpoint = null;
    cue.done = true;
    this.media.play();
  }

  /** Bir önceki / sonraki durağa sarar (ileri sarınca durak yine sorulur). */
  seekCue(dir) {
    const v = this.media;
    const times = [0, ...this.items.map((c) => c.at)].sort((a, b) => a - b);
    const now = v.currentTime;
    const target =
      dir > 0
        ? times.find((t) => t > now + 0.1)
        : (times.findLast((t) => t < now - 1.5) ?? 0);
    if (target == null) return;
    // Geri sarılınca aradaki duraklar yeniden etkinleşir
    this.items.forEach((c) => {
      if (c.at >= target) c.done = false;
    });
    v.seek(Math.max(0, target - (dir > 0 ? 0.05 : 0)));
    this.cover.hidden = true;
  }
}
