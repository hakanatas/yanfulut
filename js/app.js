// Uygulama: sayfa yönlendirme, ders haritası, parmak tablosu, akort aleti ve metronom.
// Enstrümana özgü içerik js/instruments/<id>.js paketinden gelir; sayfa boot(id) ile başlar.
import { longName, shortName, titleName, midiOf } from './data/notes.js';
import { instrument, setInstrument } from './instrument.js';
import { LessonPlayer } from './player.js';
import { DotsGame } from './dots.js';
import { DrillGame } from './drill.js';
import { SheetGame } from './sheet.js';
import { ReadingGame, readingKind } from './reading.js';
import { progress } from './progress.js';
import { playNote, PitchListener, micErrorMessage, SILENT_MIC_MESSAGE, tuningOffset, resetTuning, setTuning } from './audio.js';
import { fingeringSvg, staffSvg, h } from './checkpoints.js';
import { mascot } from './art.js';
import { Metronome, BPM_MAX, BPM_MIN, clampBpm, metronomeSettings, saveMetronomeSettings, tempoName } from './metronome.js';

const view = document.getElementById('view');
let active = null; // açık oynatıcı / oyun / dinleyici (sayfa değişince kapatılır)
let COURSE = [];

const lessonById = (id) => instrument().lessons.find((l) => l.id === id);
const songById = (id) => instrument().songs.find((s) => s.id === id);
const drillById = (id) => instrument().drills.find((d) => d.id === id);
const readingById = (id) => (instrument().readings || []).find((r) => r.id === id);
const scaleById = (id) => (instrument().scales?.exercises || []).find((e) => e.id === id);
const worksheetList = () => (instrument().worksheets || []).flatMap((u) => u.exercises.map((e) => ({ ...e, unit: u })));
const worksheetById = (id) => worksheetList().find((e) => e.id === id);

const starsOf = (item) =>
  item.type === 'drill' ? progress.songStars(`drill-${item.id}`) : item.type === 'reading' ? progress.songStars(`read-${item.id}`) : item.type === 'song' ? progress.songStars(item.id) : 0;
const isDone = (item) => (item.type === 'lesson' ? progress.isLessonDone(item.id) : starsOf(item) > 0);
const itemData = (item) => ({ lesson: lessonById, song: songById, drill: drillById, reading: readingById })[item.type](item.id);
const itemHref = (item) => ({ lesson: '#/ders/', song: '#/sarki/', drill: '#/antrenman/', reading: '#/okuma/' })[item.type] + item.id;

function route() {
  active?.destroy();
  active = null;
  const [, page, rawId] = location.hash.replace(/^#/, '').split('/');
  const id = rawId && decodeURIComponent(rawId);
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#/${page || ''}`));
  window.scrollTo(0, 0);
  if (page === 'ders' && lessonById(id)) return showLesson(lessonById(id));
  if (page === 'sarki' && songById(id)) return showSong(songById(id));
  if (page === 'antrenman' && drillById(id)) return showDrill(drillById(id));
  if (page === 'okuma' && readingById(id)) return showReading(readingById(id));
  if (page === 'gam' && scaleById(id)) return showScale(scaleById(id));
  if (page === 'gamlar' && instrument().scales) return showScaleList();
  if (page === 'antrenman') return showDrillList();
  if (page === 'egzersiz' && instrument().worksheets) {
    const ex = worksheetById(id);
    return ex ? showWorksheet(ex) : showWorksheetList();
  }
  if (page === 'parmak') return showChart(id);
  if (page === 'akort') return showTuner();
  if (page === 'metronom') return showMetronome();
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
    const stars = starsOf(item);
    const icon = { song: '★', drill: '♩', reading: data.mode === 'find' ? '🎹' : data.mode === 'line' ? '♫' : data.clef === 'bass' ? '𝄢' : '𝄞', lesson: done ? '✓' : '♪' }[item.type];
    const kind = { song: 'Nota Noktaları', drill: 'Antrenman', reading: item.type === 'reading' && readingKind(data), lesson: `Ders ${COURSE.slice(0, i + 1).filter((c) => c.type === 'lesson').length}` }[item.type];
    const sub = { song: data.level, drill: data.focus, reading: data.focus, lesson: data.summary }[item.type];
    const li = h(`
      <li class="node ${item.type} ${done ? 'done' : ''} ${i === nextIdx ? 'next' : ''}">
        <a href="${itemHref(item)}">
          <span class="node-icon" aria-hidden="true">${icon}</span>
          <span class="node-text">
            <span class="node-kind">${kind}</span>
            <b>${data.title}</b>
            <small>${sub}${stars ? ' · ' + '★'.repeat(stars) : ''}</small>
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

// --------------------------------------------------------------------- Nota Okuma
function showReading(set) {
  const sets = COURSE.filter((c) => c.type === 'reading').map((c) => readingById(c.id));
  const k = sets.findIndex((s) => s.id === set.id);
  const link = (s) => s && { href: `#/okuma/${s.id}`, title: s.title };
  const nav = { prev: link(sets[k - 1]), next: link(sets[k + 1]) };
  view.innerHTML = '';
  const page = h(`
    <section class="drill-page">
      <div class="page-head"><a class="back" href="#/">← Ders yolu</a>${pagerHtml(nav, 'alıştırma', k, sets.length)}</div>
      <div class="game-host"></div>
    </section>`);
  view.appendChild(page);
  active = new ReadingGame(page.querySelector('.game-host'), set, { nav });
}

// --------------------------------------------------------------------- Gamlar (sınav hazırlığı)
function showScaleList() {
  const { title, keys, exercises, picks = [] } = instrument().scales;
  const card = (e, head, sub) => {
    const stars = progress.songStars(`read-${e.id}`);
    return `<a class="drill-card" href="#/gam/${e.id}"><b>${head || e.short.charAt(0).toLocaleUpperCase('tr') + e.short.slice(1)}</b><span>${sub || e.focus}</span>
      <span class="stars small">${[1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('')}</span></a>`;
  };
  view.innerHTML = '';
  const page = h(`
    <section class="drill-list-page scales-page">
      <div class="page-head"><h2>${title}</h2></div>
      <p class="muted">Sınav kitabındaki gamlar (s. 5–8): Mi, Si, Si♭, Mi♭, La♭, Re♭ majör; Si, Sol, Do, Fa armonik ve melodik minör
        (sınavda hangisi olacağını aday seçer); zıt yönde Sol, Re majör ve La armonik minör. Hepsi iki oktav, eller ayrı ve birlikte,
        <i>piano</i> ve <i>forte</i>, sınav temposu ♩ = 96 (her vuruşa iki nota).</p>
      <p class="muted">Parmak numaraları kitaptaki gibi notaların üstünde. Önce yavaş ve doğru çal, sonra metronomu adım adım 96'ya çıkar.
        Sınavda gamlar ezberden çalınır: rahatladıkça "Nota adını göster" kapalı kalsın.</p>
    </section>`);
  if (picks.length) {
    const list = picks.map((p) => ({ ...p, e: exercises.find((x) => x.id === p.id) })).filter((p) => p.e);
    page.appendChild(
      h(`<div class="ws-unit card scale-key scale-picks">
        <div class="ws-unit-head"><h3>⭐ Sınav seçimi</h3><span class="muted">kitaba yazılan sırayla</span></div>
        <p>Kitaba elle yazılan altı gam. Her birini yazılan dinamikle çal: <i>forte</i> güçlü, <i>piano</i> yumuşak.</p>
        <div class="drill-cards">${list.map((p, k) => card(p.e, `${k + 1}. ${p.e.title}`, p.note === 'forte' ? '<i>forte</i> (f) · güçlü' : '<i>piano</i> (p) · yumuşak')).join('')}</div>
      </div>`),
    );
  }
  for (const k of keys) {
    const list = exercises.filter((e) => e.key === k.id);
    const done = list.filter((e) => progress.songStars(`read-${e.id}`) > 0).length;
    page.appendChild(
      h(`<div class="ws-unit card scale-key">
        <div class="ws-unit-head"><h3>${k.name}</h3><span class="muted">${done} / ${list.length} alıştırma</span></div>
        <p>${k.tip}</p>
        <div class="drill-cards">${list.map((e) => card(e)).join('')}</div>
      </div>`),
    );
  }
  view.appendChild(page);
}

function showScale(ex) {
  const all = instrument().scales.exercises;
  const k = all.findIndex((e) => e.id === ex.id);
  const link = (e) => e && { href: `#/gam/${e.id}`, title: e.title };
  const nav = { prev: link(all[k - 1]), next: link(all[k + 1]) };
  view.innerHTML = '';
  const page = h(`
    <section class="drill-page">
      <div class="page-head"><a class="back" href="#/gamlar">← Gamlar</a>${pagerHtml(nav, 'gam', k, all.length)}</div>
      <div class="game-host"></div>
    </section>`);
  view.appendChild(page);
  active = new ReadingGame(page.querySelector('.game-host'), ex, { nav });
}

// --------------------------------------------------------------------- Antrenman
function showDrill(drill) {
  // Önceki/sonraki antrenman: ders yolundaki sırayla
  const drills = COURSE.filter((c) => c.type === 'drill').map((c) => drillById(c.id));
  const k = drills.findIndex((d) => d.id === drill.id);
  const link = (d) => d && { href: `#/antrenman/${d.id}`, title: d.title };
  const nav = { prev: link(drills[k - 1]), next: link(drills[k + 1]) };
  view.innerHTML = '';
  const page = h(`
    <section class="drill-page">
      <div class="page-head"><a class="back" href="#/antrenman">← Antrenmanlar</a>${pagerHtml(nav, 'antrenman', k, drills.length)}</div>
      <div class="game-host"></div>
    </section>`);
  view.appendChild(page);
  active = new DrillGame(page.querySelector('.game-host'), drill, { nav });
}

/** Sayfa başındaki önceki / sonraki düğmeleri */
function pagerHtml(nav, what, k, n) {
  return `<nav class="pager" aria-label="Önceki ve sonraki ${what}">
    ${nav.prev ? `<a class="btn small" href="${nav.prev.href}" title="${nav.prev.title}">◀ Önceki</a>` : '<span class="btn small disabled" aria-disabled="true">◀ Önceki</span>'}
    <span class="pager-count muted">${k + 1} / ${n}</span>
    ${nav.next ? `<a class="btn small primary" href="${nav.next.href}" title="${nav.next.title}">Sonraki ▶</a>` : '<span class="btn small disabled" aria-disabled="true">Sonraki ▶</span>'}
  </nav>`;
}

/** Tüm antrenmanlar, ders yolundaki sırasıyla; her biri hangi dersten sonra açıldığını söyler */
function showDrillList() {
  view.innerHTML = '';
  let lastLesson = null;
  const rows = [];
  for (const item of COURSE) {
    if (item.type === 'lesson') lastLesson = lessonById(item.id);
    if (item.type !== 'drill') continue;
    const d = drillById(item.id);
    const stars = starsOf(item);
    const notes = [...new Set(d.notes.map((n) => n.note))].sort((a, b) => midiOf(a) - midiOf(b)).map(shortName).join(' · ');
    rows.push(`
      <a class="drill-card" href="${itemHref(item)}">
        <span class="node-kind">${lastLesson ? `${lastLesson.title} dersinden sonra` : ''}</span>
        <b>${d.title}</b>
        <span>${d.focus}</span>
        <small class="muted">Notalar: ${notes} · ${d.notes.length} nota · ${d.bpm} vuruş/dk</small>
        <span class="stars small">${[1, 2, 3].map((k) => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</span>
      </a>`);
  }
  view.appendChild(
    h(`
    <section class="drill-list-page">
      <div class="page-head"><h2>Antrenman</h2></div>
      <p class="muted">Burada resim yok: hedef, doğru notayı doğru süre boyunca çalmak. Her antrenman yalnızca o noktaya kadar öğrendiğin notaları kullanır.</p>
      <div class="drill-cards">${rows.join('')}</div>
    </section>`),
  );
}

// --------------------------------------------------------------------- Egzersiz Yap (çalışma kağıdı)
function showWorksheetList() {
  view.innerHTML = '';
  const units = instrument().worksheets;
  const page = h(`
    <section class="drill-list-page ws-list-page">
      <div class="page-head"><h2>Egzersiz Yap</h2></div>
      <p class="muted">${instrument().worksheetIntro} Burada nokta birleştirme yok: büyük notayı ve ${instrument().pictureName} izle,
        her notayı <b>doğru süre</b> boyunca çal. Sonunda kaç notayı doğru, kaçını yanlış çaldığını görürsün.
        Her ünite yeni notalarını önce tanıtır; egzersizler yalnızca o ana kadar tanıtılan notaları kullanır.
        Tempoyu egzersiz sayfasında <b>−/+</b> ile kendine göre ayarlayabilirsin.</p>
    </section>`);
  for (const u of units) {
    const sec = h(`
      <div class="ws-unit card">
        <div class="ws-unit-head"><h3>${u.title}</h3><span class="muted">${u.subtitle}</span></div>
        ${u.newNotes.length ? `<div class="ws-new-notes">${u.newNotes.map((n) => `
          <div class="ws-new-note">
            <div class="ws-new-top"><b>${titleName(n)}</b>${staffSvg(n)}<button class="btn ghost small" data-play="${n}">🔊</button></div>
            ${fingeringSvg(n)}
          </div>`).join('')}</div>` : ''}
        <ul class="ws-concepts">${u.concepts.map((c) => `<li><span class="ws-sym">${c.sym}</span><span><b>${c.title}:</b> ${c.text}</span></li>`).join('')}</ul>
        <div class="drill-cards">${u.exercises.map((e) => {
          const stars = progress.songStars(`ws-${e.id}`);
          const notes = [...new Set(e.rows.join(' ').split(/\s+/).map((t) => t.split(':')[0].replace(/[!~]/g, '')).filter((t) => /^[A-G]/.test(t)))]
            .sort((a, b) => midiOf(a) - midiOf(b)).map(shortName).join(' · ');
          return `<a class="drill-card" href="#/egzersiz/${e.id}">
            <span class="node-kind">${e.sig || `${e.time}/4`} · ${e.rows.length} satır</span>
            <b>${e.title}</b>
            <span>${e.focus}</span>
            <small class="muted">Notalar: ${notes} · ${e.bpm} vuruş/dk</small>
            <span class="stars small">${[1, 2, 3].map((k) => `<span class="${k <= stars ? 'on' : ''}">★</span>`).join('')}</span>
          </a>`;
        }).join('')}</div>
      </div>`);
    sec.addEventListener('click', (e) => {
      const b = e.target.closest('[data-play]');
      if (b) playNote(b.dataset.play, 1.2);
    });
    page.appendChild(sec);
  }
  page.appendChild(h(`<p class="muted small-print">Kaynak: ${instrument().worksheetSource}.</p>`));
  view.appendChild(page);
}

function showWorksheet(ex) {
  const all = worksheetList();
  const k = all.findIndex((e) => e.id === ex.id);
  const link = (e) => e && { href: `#/egzersiz/${e.id}`, title: `${e.unit.id !== ex.unit.id ? `${e.unit.title} · ` : ''}${e.title}` };
  const nav = { prev: link(all[k - 1]), next: link(all[k + 1]) };
  view.innerHTML = '';
  const page = h(`
    <section class="drill-page">
      <div class="page-head"><a class="back" href="#/egzersiz">← Egzersizler · ${ex.unit.title}</a>${pagerHtml(nav, 'egzersiz', k, all.length)}</div>
      <div class="game-host"></div>
    </section>`);
  view.appendChild(page);
  active = new SheetGame(page.querySelector('.game-host'), ex, { nav });
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
// Hedef seçilirse (ör. kemanda Re teli) iğne o notaya göre, seçilmezse en yakın notaya göre durur.
// Referans düğmesi hedef sesi çalar; uygulama ses çalarken mikrofon kendi sesini dinlemez.
const median = (a) => {
  const b = [...a].sort((x, y) => x - y);
  return b[b.length >> 1];
};

function showTuner() {
  const inst = instrument();
  const refs = inst.tunerRefs || [];
  view.innerHTML = '';
  const page = h(`
    <section class="tuner-page">
      <div class="page-head"><h2>Akort</h2><a class="btn ghost small" href="#/metronom">🥁 Metronom</a></div>
      <div class="tuner card">
        <div class="tuner-refs" role="group" aria-label="Hedef nota">
          <button class="chip-btn standalone ref-btn" data-ref="">🎯 Otomatik</button>
          ${refs.map((r) => `<button class="chip-btn standalone ref-btn" data-ref="${r.note}" title="${r.label} sesini dinle ve ona göre akort et">🔊 ${r.label}</button>`).join('')}
        </div>
        <div class="tuner-note">–</div>
        <div class="tuner-name muted">Bir nota çal</div>
        <div class="gauge"><span class="needle"></span><i class="flat">♭ pes</i><i class="mid">0</i><i class="sharp">tiz ♯</i><span class="gauge-ok" aria-hidden="true"></span></div>
        <div class="tuner-cents"></div>
        <p class="tuner-advice" aria-live="polite"></p>
        <div class="meter level" aria-hidden="true"><span></span></div>
        <button class="btn primary" data-act="mic">🎤 Mikrofonu aç</button>
      </div>
      <p class="hint muted">${inst.tunerHint}</p>
      <p class="hint tuning-learned"></p>
    </section>`);
  view.appendChild(page);
  const $ = (s) => page.querySelector(s);
  // Egzersizlerde doğru çalınan notalardan öğrenilen genel akort
  const learned = $('.tuning-learned');
  const showLearned = () => {
    const c = Math.round(tuningOffset() * 100);
    learned.innerHTML =
      Math.abs(c) < 10
        ? `Uygulamanın bildiği akort: ${inst.name.toLocaleLowerCase('tr')} akordu yerinde. Burada akort edince alıştırmalar da yeni akordu kullanır.`
        : `Uygulamanın bildiği akort: ${inst.name.toLocaleLowerCase('tr')} genel olarak <b>${c > 0 ? '+' : ''}${c} sent ${c > 0 ? 'tiz' : 'pes'}</b> çalıyor; alıştırmalar bunu hesaba katıyor. Burada akort edip bir notayı sabit tutunca güncellenir. <button class="link" data-act="reset-tuning">Sıfırla</button>`;
    learned.querySelector('[data-act=reset-tuning]')?.addEventListener('click', () => {
      resetTuning();
      showLearned();
    });
  };
  showLearned();

  let target = null; // seçilen hedef nota (null: otomatik)
  let refSound = null;
  const recent = [];
  let inTuneSince = 0;
  // Enstrüman yeniden akort edilince alıştırmalar eski (öğrenilmiş) akordu kullanmasın:
  // sabit tutulan bir nota ölçülünce uygulamanın akordu bu ölçüme ayarlanır
  let steadySince = 0;
  let steadyCents = [];
  let lastSet = 0;
  const measure = (cents, now) => {
    if (Math.abs(cents) > 50) {
      steadySince = 0;
      steadyCents = [];
      return;
    }
    if (!steadySince) steadySince = now;
    steadyCents.push(cents);
    if (steadyCents.length > 60) steadyCents.shift();
    if (now - steadySince > 1200 && now - lastSet > 1000) {
      lastSet = now;
      setTuning(median(steadyCents) / 100);
      showLearned();
    }
  };
  const selectRef = (note) => {
    target = note || null;
    recent.length = 0;
    page.querySelectorAll('.ref-btn').forEach((b) => b.classList.toggle('active', (b.dataset.ref || null) === target));
    refSound?.stop();
    refSound = target ? playNote(target, 2.5) : null;
    $('.tuner-note').textContent = target ? shortName(target) : '–';
    $('.tuner-name').textContent = target ? `Hedef: ${refs.find((r) => r.note === target)?.label || longName(target)} · şimdi çal` : 'Bir nota çal';
    $('.tuner-cents').textContent = '';
    $('.tuner-advice').textContent = '';
  };
  page.querySelector('.tuner-refs').addEventListener('click', (e) => {
    const b = e.target.closest('.ref-btn');
    if (b) selectRef(b.dataset.ref);
  });
  page.querySelector('.ref-btn').classList.add('active');

  /** Duyulan sese göre hedef: seçilen nota, kemanda en yakın boş tel (yakınsa), yoksa en yakın nota */
  const goalOf = (mf) => {
    if (target) return { note: target, midi: midiOf(target) };
    const auto = refs.filter((r) => r.auto).map((r) => ({ note: r.note, midi: midiOf(r.note) }));
    const near = auto.find((r) => Math.abs(mf - r.midi) <= 0.6);
    if (near) return near;
    const m = Math.round(mf);
    return { note: null, midi: m };
  };
  const listener = new PitchListener(
    (f) => {
      $('.level span').style.width = `${Math.min(100, (f.rms || 0) * 600)}%`;
      if (!f.note || f.midiFloat == null) {
        recent.length = 0;
        inTuneSince = 0;
        steadySince = 0;
        steadyCents = [];
        $('.tuner').classList.remove('in-tune');
        return;
      }
      recent.push(f.midiFloat);
      if (recent.length > 7) recent.shift();
      const mf = median(recent); // titreşimde iğne zıplamasın
      const goal = goalOf(mf);
      const cents = Math.round((mf - goal.midi) * 100);
      const heard = f.note;
      $('.tuner-note').textContent = shortName(goal.note || heard);
      const adv = inst.tuneAdvice ? inst.tuneAdvice[cents > 0 ? 'sharp' : 'flat'] : cents > 0 ? inst.sharpAdvice : inst.flatAdvice;
      const advice = typeof adv === 'function' ? adv(goal.note || heard) : adv;
      if (target && Math.abs(cents) > 50) {
        steadySince = 0;
        steadyCents = [];
        // Hedeften uzak: iğne kenarda; çok uzaksa büyük olasılıkla başka tel/parmak çalınıyor
        $('.tuner-name').textContent = `Duyulan: ${longName(heard)} · hedef ${refs.find((r) => r.note === target)?.label || longName(target)}`;
        $('.tuner-cents').textContent = `Hedeften ${cents > 0 ? '+' : ''}${cents} sent`;
        $('.tuner-advice').textContent =
          Math.abs(cents) > 90
            ? `Bu başka bir nota (${longName(heard)}): ${inst.id === 'violin' ? 'doğru teli' : 'doğru parmakları'} çaldığından emin ol.`
            : `Çok ${cents > 0 ? 'tiz' : 'pes'} → ${advice}.`;
        $('.needle').style.transform = `rotate(${cents > 0 ? 45 : -45}deg)`;
        $('.tuner').classList.remove('in-tune');
        inTuneSince = 0;
        return;
      }
      $('.tuner-name').textContent = goal.note ? `${refs.find((r) => r.note === goal.note)?.label || longName(goal.note)}` : longName(heard);
      $('.tuner-cents').textContent = `${cents > 0 ? '+' : ''}${cents} sent · ${f.freq.toFixed(1)} Hz`;
      $('.needle').style.transform = `rotate(${Math.max(-50, Math.min(50, cents)) * 0.9}deg)`;
      const ok = Math.abs(cents) <= 5;
      const now = performance.now();
      measure(cents, now);
      if (!ok) inTuneSince = 0;
      else if (!inTuneSince) inTuneSince = now;
      const steady = ok && now - inTuneSince > 600;
      $('.tuner').classList.toggle('in-tune', steady);
      $('.tuner-advice').textContent = steady
        ? '✓ Akortlu! Böyle kalsın.'
        : ok
          ? 'Neredeyse tamam, sesi sabit tut…'
          : `${Math.abs(cents) <= 15 ? 'Çok az' : 'Biraz'} ${cents > 0 ? 'tiz' : 'pes'} → ${advice}.`;
    },
    { onStatus: (st) => ($('.tuner-name').textContent = st === 'silent' ? SILENT_MIC_MESSAGE : 'Bir nota çal') },
  );
  active = {
    destroy() {
      refSound?.stop();
      listener.stop();
    },
  };
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

// --------------------------------------------------------------------- Metronom
function showMetronome() {
  const st = metronomeSettings();
  view.innerHTML = '';
  const page = h(`
    <section class="metro-page">
      <div class="page-head"><h2>Metronom</h2><a class="btn ghost small" href="#/akort">🎯 Akort</a></div>
      <div class="metro card">
        <div class="metro-beats" aria-hidden="true"></div>
        <div class="metro-bpm"><span class="big"></span><small>vuruş/dakika</small></div>
        <div class="metro-term muted"></div>
        <div class="metro-steps">
          <button class="btn" data-step="-5" aria-label="5 yavaşlat">−5</button>
          <button class="btn" data-step="-1" aria-label="1 yavaşlat">−1</button>
          <button class="btn" data-step="1" aria-label="1 hızlandır">+1</button>
          <button class="btn" data-step="5" aria-label="5 hızlandır">+5</button>
        </div>
        <input type="range" class="metro-slider" min="${BPM_MIN}" max="${BPM_MAX}" step="1" aria-label="Tempo">
        <div class="metro-opts">
          <div class="seg-group" role="group" aria-label="Ölçü">
            ${[2, 3, 4].map((b) => `<button class="chip-btn" data-beats="${b}">${b}/4</button>`).join('')}
            <button class="chip-btn" data-beats="1" title="Ölçü başı vurgusu olmadan">Vurgusuz</button>
          </div>
          <button class="chip-btn standalone" data-act="sub" title="Her vuruşun ortasında hafif bir tık: sekizlikleri saymak için">♪ Sekizlik ara vuruş</button>
        </div>
        <div class="metro-actions">
          <button class="btn primary metro-toggle" data-act="toggle">▶ Başlat</button>
          <button class="btn" data-act="tap" title="İstediğin hızda birkaç kez dokun: tempo ona ayarlanır">👆 Vuruşa dokun</button>
        </div>
        <p class="muted small-print">Klavye: boşluk başlat/durdur · ↑ ↓ tempo ±1 · Page Up/Down ±5</p>
      </div>
      <p class="hint muted">Yeni bir parçayı önce yavaş tempoda, hiç hata yapmadan çal; sonra tempoyu birkaç vuruş artır.
        Egzersiz ve antrenman sayfalarında da tempoyu <b>−/+</b> ile değiştirebilir, metronom sesini açıp kapatabilirsin.</p>
    </section>`);
  view.appendChild(page);
  const $ = (s) => page.querySelector(s);
  const metro = new Metronome({
    bpm: st.bpm,
    beats: st.beats,
    sub: st.sub,
    onBeat: (b) => {
      page.querySelectorAll('.metro-beats span').forEach((d, k) => d.classList.toggle('on', k === b));
    },
  });
  const show = () => {
    $('.metro-bpm .big').textContent = metro.bpm;
    $('.metro-term').textContent = tempoName(metro.bpm);
    $('.metro-slider').value = metro.bpm;
    $('.metro-beats').innerHTML = Array.from({ length: metro.beats }, (_, k) => `<span class="${k === 0 && metro.beats > 1 ? 'strong' : ''}"></span>`).join('');
    page.querySelectorAll('[data-beats]').forEach((b) => b.classList.toggle('active', Number(b.dataset.beats) === metro.beats));
    const sub = $('[data-act=sub]');
    sub.classList.toggle('active', metro.sub);
    sub.setAttribute('aria-pressed', metro.sub);
    $('.metro-toggle').textContent = metro.running ? '⏸ Durdur' : '▶ Başlat';
    $('.metro').classList.toggle('running', metro.running);
    saveMetronomeSettings({ bpm: metro.bpm, beats: metro.beats, sub: metro.sub });
  };
  const setBpm = (v) => {
    metro.setBpm(clampBpm(v));
    show();
  };
  const toggle = () => {
    if (metro.running) metro.stop();
    else metro.start();
    show();
  };
  let taps = [];
  const tap = () => {
    const now = performance.now();
    if (taps.length && now - taps.at(-1) > 2000) taps = [];
    taps.push(now);
    if (taps.length > 6) taps.shift();
    if (taps.length >= 2) {
      const gaps = taps.slice(1).map((t, k) => t - taps[k]);
      setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
    }
  };
  page.querySelector('.metro').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.step) setBpm(metro.bpm + Number(b.dataset.step));
    else if (b.dataset.beats) {
      metro.setBeats(Number(b.dataset.beats));
      show();
    } else if (b.dataset.act === 'sub') {
      metro.sub = !metro.sub;
      show();
    } else if (b.dataset.act === 'toggle') toggle();
    else if (b.dataset.act === 'tap') tap();
  });
  $('.metro-slider').addEventListener('input', (e) => setBpm(e.target.value));
  const onKey = (e) => {
    if (e.target.closest?.('input, textarea, select')) return;
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (e.key === ' ' && !e.target.closest?.('button')) {
      e.preventDefault();
      toggle();
    } else if (step) {
      e.preventDefault();
      setBpm(metro.bpm + step);
    }
  };
  document.addEventListener('keydown', onKey);
  active = {
    destroy() {
      metro.stop();
      document.removeEventListener('keydown', onKey);
    },
  };
  show();
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

  // Egzersiz Yap bölümü yalnızca çalışma kağıdı olan enstrümanda görünür
  const wsLink = document.querySelector('.nav-worksheet');
  if (wsLink) wsLink.hidden = !inst.worksheets;

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
