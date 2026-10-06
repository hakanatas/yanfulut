// Uygulama: sayfa yönlendirme, ders haritası, parmak tablosu ve akort aleti.
// Enstrümana özgü içerik js/instruments/<id>.js paketinden gelir; sayfa boot(id) ile başlar.
import { longName, shortName, titleName } from './data/notes.js';
import { instrument, setInstrument } from './instrument.js';
import { LessonPlayer } from './player.js';
import { DotsGame } from './dots.js';
import { progress } from './progress.js';
import { playNote, PitchListener, micErrorMessage, SILENT_MIC_MESSAGE } from './audio.js';
import { fingeringSvg, staffSvg, h } from './checkpoints.js';
import { mascot } from './art.js';

const view = document.getElementById('view');
let active = null; // açık oynatıcı / oyun / dinleyici (sayfa değişince kapatılır)
let COURSE = [];

const lessonById = (id) => instrument().lessons.find((l) => l.id === id);
const songById = (id) => instrument().songs.find((s) => s.id === id);

const isDone = (item) => (item.type === 'lesson' ? progress.isLessonDone(item.id) : progress.songStars(item.id) > 0);
const itemData = (item) => (item.type === 'lesson' ? lessonById(item.id) : songById(item.id));
const itemHref = (item) => (item.type === 'lesson' ? `#/ders/${item.id}` : `#/sarki/${item.id}`);

function route() {
  active?.destroy();
  active = null;
  const [, page, rawId] = location.hash.replace(/^#/, '').split('/');
  const id = rawId && decodeURIComponent(rawId);
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#/${page || ''}`));
  window.scrollTo(0, 0);
  if (page === 'ders' && lessonById(id)) return showLesson(lessonById(id));
  if (page === 'sarki' && songById(id)) return showSong(songById(id));
  if (page === 'parmak') return showChart(id);
  if (page === 'akort') return showTuner();
  showHome();
}

// --------------------------------------------------------------------- Ana sayfa
function showHome() {
  const nextIdx = COURSE.findIndex((it) => !isDone(it));
  const doneCount = COURSE.filter(isDone).length;
  view.innerHTML = '';
  const page = h(`
    <section class="home">
      <div class="hero">
        <svg class="hero-mascot" viewBox="40 150 220 220" aria-hidden="true"><g filter="url(#sketchy)">${mascot({ x: 140, y: 290, s: 1.2, wave: true })}</g></svg>
        <div>
          <h1>${instrument().heroTitle}</h1>
          <p>${instrument().heroText}</p>
          <div class="hero-actions">
            ${nextIdx >= 0 ? `<a class="btn primary" href="${itemHref(COURSE[nextIdx])}">${doneCount ? 'Devam et' : 'Başla'}: ${itemData(COURSE[nextIdx]).title} ▶</a>` : '<span class="badge">Tüm yolu tamamladın! 🎉</span>'}
          </div>
          <div class="progress-bar" aria-label="İlerleme"><span style="width:${(doneCount / COURSE.length) * 100}%"></span></div>
          <small class="muted">${doneCount} / ${COURSE.length} tamamlandı</small>
        </div>
      </div>
      <div class="path-wrap"><svg class="path-line" aria-hidden="true"></svg><ol class="path"></ol></div>
    </section>`);
  view.appendChild(page);

  const list = page.querySelector('.path');
  COURSE.forEach((item, i) => {
    const data = itemData(item);
    const done = isDone(item);
    const stars = item.type === 'song' ? progress.songStars(item.id) : 0;
    const li = h(`
      <li class="node ${item.type} ${done ? 'done' : ''} ${i === nextIdx ? 'next' : ''}">
        <a href="${itemHref(item)}">
          <span class="node-icon" aria-hidden="true">${item.type === 'song' ? '★' : done ? '✓' : '♪'}</span>
          <span class="node-text">
            <span class="node-kind">${item.type === 'song' ? 'Nota Noktaları' : `Ders ${COURSE.slice(0, i + 1).filter((c) => c.type === 'lesson').length}`}</span>
            <b>${data.title}</b>
            <small>${item.type === 'song' ? `${data.level}${stars ? ' · ' + '★'.repeat(stars) : ''}` : data.summary}</small>
          </span>
        </a>
      </li>`);
    list.appendChild(li);
  });
  const draw = () => drawPath(page.querySelector('.path-wrap'));
  requestAnimationFrame(draw);
  window.addEventListener('resize', draw);
  active = { destroy: () => window.removeEventListener('resize', draw) };
}

/** Düğümleri birleştiren noktalı, dalgalı yol */
function drawPath(wrap) {
  const svg = wrap.querySelector('.path-line');
  const box = wrap.getBoundingClientRect();
  const pts = [...wrap.querySelectorAll('.node-icon')].map((n) => {
    const r = n.getBoundingClientRect();
    return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2];
  });
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  let d = pts.length ? `M${pts[0][0]} ${pts[0][1]}` : '';
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const my = (y0 + y1) / 2;
    d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
  }
  svg.innerHTML = `<path d="${d}" class="road"/>`;
}

// --------------------------------------------------------------------- Ders
function showLesson(lesson) {
  const idx = COURSE.findIndex((c) => c.type === 'lesson' && c.id === lesson.id);
  const next = COURSE[idx + 1];
  view.innerHTML = '';
  const page = h(`
    <section class="lesson-page">
      <div class="page-head">
        <a class="back" href="#/">← Ders yolu</a>
        <h2>${lesson.title}</h2>
      </div>
      <div class="player-host"></div>
      <p class="hint muted">İpucu: Boşluk tuşu ile durdur/oynat, ← → ile sahneler arasında gezin. Mikrofon izni, çaldığın notaları duymamı sağlar.</p>
      <div class="end-card" hidden></div>
    </section>`);
  view.appendChild(page);
  const end = page.querySelector('.end-card');
  active = new LessonPlayer(page.querySelector('.player-host'), lesson, {
    onComplete: () => {
      progress.completeLesson(lesson.id);
      end.hidden = false;
      end.innerHTML = `
        <h3>🎉 Ders tamamlandı!</h3>
        <div class="end-actions">
          ${next ? `<a class="btn primary" href="${itemHref(next)}">Sıradaki: ${itemData(next).title} ▶</a>` : ''}
          <a class="btn" href="#/">Ders yoluna dön</a>
        </div>`;
      end.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
  });
}

// --------------------------------------------------------------------- Şarkı
function showSong(song) {
  view.innerHTML = '';
  const page = h(`
    <section class="song-page">
      <div class="page-head"><a class="back" href="#/">← Ders yolu</a></div>
      <div class="game-host"></div>
    </section>`);
  view.appendChild(page);
  active = new DotsGame(page.querySelector('.game-host'), song);
}

// --------------------------------------------------------------------- Parmak tablosu
function showChart(selected) {
  const ALL_NOTES = instrument().notes;
  if (!ALL_NOTES.includes(selected)) selected = instrument().defaultNote;
  view.innerHTML = '';
  const page = h(`
    <section class="chart-page">
      <div class="page-head"><h2>${instrument().chartTitle}</h2></div>
      <div class="note-grid" role="tablist">
        ${ALL_NOTES.map((n) => `<button role="tab" class="note-btn" data-note="${n}" title="${longName(n)}">${shortName(n)}</button>`).join('')}
      </div>
      <div class="chart-detail card"></div>
    </section>`);
  view.appendChild(page);
  const detail = page.querySelector('.chart-detail');
  const select = (n) => {
    page.querySelectorAll('.note-btn').forEach((b) => b.setAttribute('aria-selected', b.dataset.note === n));
    const info = instrument().chartDetail(n);
    detail.innerHTML = `
      <div class="chart-top">
        <div><h3>${titleName(n)}</h3><p class="muted">${info.tip}</p></div>
        ${staffSvg(n)}
        <button class="btn primary" data-act="play">🔊 Dinle</button>
      </div>
      ${fingeringSvg(n)}
      <ul class="key-list">${info.items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
    detail.querySelector('[data-act=play]').addEventListener('click', () => playNote(n, 1.5));
    history.replaceState(null, '', `#/parmak/${n}`);
  };
  page.querySelector('.note-grid').addEventListener('click', (e) => {
    const b = e.target.closest('.note-btn');
    if (b) select(b.dataset.note);
  });
  select(selected);
}

// --------------------------------------------------------------------- Akort
function showTuner() {
  view.innerHTML = '';
  const page = h(`
    <section class="tuner-page">
      <div class="page-head"><h2>Akort ve Nota Dinleyici</h2></div>
      <div class="tuner card">
        <div class="tuner-note">–</div>
        <div class="tuner-name muted">Bir nota çal</div>
        <div class="gauge"><span class="needle"></span><i class="flat">♭</i><i class="mid">0</i><i class="sharp">♯</i></div>
        <div class="tuner-cents muted"></div>
        <div class="meter level" aria-hidden="true"><span></span></div>
        <button class="btn primary" data-act="mic">🎤 Mikrofonu aç</button>
      </div>
      <p class="hint muted">${instrument().tunerHint}</p>
    </section>`);
  view.appendChild(page);
  const $ = (s) => page.querySelector(s);
  const listener = new PitchListener(
    (f) => {
      $('.level span').style.width = `${Math.min(100, (f.rms || 0) * 600)}%`;
      if (!f.note) return;
      $('.tuner-note').textContent = shortName(f.note);
      $('.tuner-name').textContent = longName(f.note);
      $('.tuner-cents').textContent = `${f.cents > 0 ? '+' : ''}${f.cents} sent · ${f.freq.toFixed(1)} Hz`;
      $('.needle').style.transform = `rotate(${Math.max(-50, Math.min(50, f.cents)) * 0.9}deg)`;
      $('.tuner').classList.toggle('in-tune', Math.abs(f.cents) <= 10);
    },
    { onStatus: (st) => ($('.tuner-name').textContent = st === 'silent' ? SILENT_MIC_MESSAGE : 'Bir nota çal') },
  );
  active = listener;
  $('[data-act=mic]').addEventListener('click', async (e) => {
    try {
      await listener.start();
      e.target.textContent = '🎤 Dinliyorum…';
      e.target.disabled = true;
    } catch (err) {
      $('.tuner-name').textContent = micErrorMessage(err);
    }
  });
}

// --------------------------------------------------------------------- Başlat
/** Uygulamayı verilen enstrümanla başlatır: boot('flute') ya da boot('violin') */
export async function boot(id) {
  const inst = (await import(`./instruments/${id}.js`)).default;
  inst.activate();
  setInstrument(inst);
  COURSE = inst.course;
  document.title = inst.appTitle;
  document.querySelector('.logo-name').textContent = inst.appTitle;
  const other = document.querySelector('.other-instrument');
  if (other && inst.other) {
    // Gömülü görünümde (ör. Claude önizlemesi) göreli adres çalışmaz: canlı siteye git
    const embedded = window.top !== window.self;
    other.href = embedded ? inst.other.live : inst.other.href;
    if (embedded) other.target = '_blank';
    other.textContent = `${inst.other.name} →`;
  }

  // Sıfırlama iki tıklamayla onaylanır (bazı gömülü görünümlerde confirm() çalışmaz)
  const resetBtn = document.getElementById('reset-progress');
  let resetTimer = null;
  resetBtn?.addEventListener('click', () => {
    if (!resetTimer) {
      resetBtn.textContent = 'Emin misin? Silmek için tekrar tıkla';
      resetTimer = setTimeout(() => {
        resetTimer = null;
        resetBtn.textContent = 'İlerlemeyi sıfırla';
      }, 4000);
      return;
    }
    clearTimeout(resetTimer);
    resetTimer = null;
    resetBtn.textContent = 'İlerleme sıfırlandı';
    progress.reset();
    route();
  });

  // Başka bir sayfanın içinde (ör. Claude önizlemesi) mikrofon izni verilmez: canlı siteye yönlendir
  if (window.top !== window.self) document.querySelector('.embed-note').hidden = false;

  window.addEventListener('hashchange', route);
  route();
}
