// Videoyu durduran etkileşimli duraklar: soru, nota çalma, ses tutma, nefes egzersizi.
import { flute, staff } from './art.js';
import { longName, midiOf, titleName } from './data/notes.js';
import { PitchListener, NoteMatcher, playNote, playChime, matchesTarget } from './audio.js';
import { say, stopSpeaking } from './voice.js';
import { progress } from './progress.js';
import { PHRASES, checkpointPrompt } from './data/phrases.js';

const voiceSay = (text) => progress.settings.voice && say(text, { rate: progress.settings.rate });

export const h = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export function fluteSvg(note, { highlight = [] } = {}) {
  return `<svg class="mini-flute" viewBox="0 0 680 130" role="img" aria-label="${longName(note)} parmak pozisyonu">
    <g filter="url(#sketchy-sm)">${flute({ x: 20, y: 62, w: 640, note, highlight })}</g></svg>`;
}

export function staffSvg(note) {
  return `<svg class="mini-staff" viewBox="0 0 170 110" role="img" aria-label="Porte üzerinde ${longName(note)}">
    <g filter="url(#sketchy-sm)">${staff({ x: 6, y: 34, w: 158, sp: 10, notes: [note] })}</g></svg>`;
}

/**
 * Bir durağı verilen kapsayıcıda gösterir.
 * @returns {{done: Promise<{skipped: boolean}>, cancel: () => void}}
 */
export function runCheckpoint(container, check) {
  const impl = { quiz, play: playCheck, 'listen-any': listenAny, breath }[check.type];
  if (!impl) throw new Error(`Bilinmeyen durak türü: ${check.type}`);
  const card = h('<div class="cp-card" role="dialog" aria-modal="true"></div>');
  container.replaceChildren(card);
  container.hidden = false;
  const cleanups = [];
  let resolve;
  const done = new Promise((r) => (resolve = r));
  const finish = (result) => {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
    container.hidden = true;
    container.replaceChildren();
    resolve(result);
  };
  impl(card, check, { finish, onCleanup: (fn) => cleanups.push(fn) });
  card.querySelector('button, [tabindex]')?.focus();
  voiceSay(checkpointPrompt(check));
  return {
    done,
    cancel() {
      stopSpeaking();
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      container.hidden = true;
      container.replaceChildren();
    },
  };
}

function successBlock(msg) {
  return `<div class="cp-success"><span class="burst" aria-hidden="true">♪ ♫ ♪</span>${msg}</div>`;
}

function quiz(card, c, { finish }) {
  card.innerHTML = `
    <div class="cp-tag">Soru</div>
    <h3 class="cp-title">${c.q}</h3>
    <div class="cp-options">${c.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>
    <p class="cp-feedback" aria-live="polite"></p>`;
  const fb = card.querySelector('.cp-feedback');
  card.querySelectorAll('.opt').forEach((btn) =>
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      if (i === c.answer) {
        btn.classList.add('right');
        card.querySelectorAll('.opt').forEach((b) => (b.disabled = true));
        playChime();
        voiceSay(PHRASES.correct);
        fb.innerHTML = `${successBlock(PHRASES.correct)} <span>${c.explain || ''}</span>`;
        const next = h('<button class="btn primary">Devam ▶</button>');
        next.addEventListener('click', () => finish({ skipped: false }));
        card.appendChild(next);
        next.focus();
      } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        fb.textContent = PHRASES.tryAgain;
        voiceSay(PHRASES.tryAgain);
      }
    }),
  );
}

/** Mikrofonu başlatan ve durum/göstergeyi yöneten ortak parça */
/** Akort geri bildirimi: ±25 sentten küçük sapmalar için boş */
export function tuningAdvice(cents) {
  if (Math.abs(cents) <= 25) return '';
  return cents > 0
    ? `Ses biraz tiz (+${cents} sent): havayı biraz yumuşat ya da flütün baş kısmını hafifçe dışarı çek.`
    : `Ses biraz pes (${cents} sent): havayı biraz hızlandır ve dudak açıklığını küçült.`;
}

/** Mikrofondan duyulan sesin kısa açıklaması (hedef verilirse ona göre) */
export function heardText(frame, target, opts) {
  if (frame.muted) return 'Dinliyorum…';
  if (!frame.note) return 'Dinliyorum…';
  if (target != null && matchesTarget(frame, target, opts)) return `Duyulan: ${longName(frame.note)} ✓`;
  return `Duyulan: ${longName(frame.note)}`;
}

function micPanel(card, onCleanup, { onFrame, target }) {
  const panel = h(`
    <div class="mic">
      <div class="meter" aria-hidden="true"><span></span></div>
      <div class="heard" aria-live="polite">Mikrofon kapalı</div>
      <div class="hold"><span></span></div>
    </div>`);
  card.insertBefore(panel, card.querySelector('.cp-feedback'));
  const meter = panel.querySelector('.meter span');
  const heard = panel.querySelector('.heard');
  const hold = panel.querySelector('.hold span');
  const listener = new PitchListener((frame) => {
    meter.style.width = `${Math.min(100, frame.rms * 600)}%`;
    heard.textContent = heardText(frame, target);
    onFrame(frame);
  });
  onCleanup(() => listener.stop());
  const start = async () => {
    try {
      heard.textContent = 'Mikrofon açılıyor…';
      await listener.start();
      return true;
    } catch {
      heard.textContent = 'Mikrofona erişilemedi. Tarayıcı izinlerini kontrol et ya da mikrofonsuz devam et.';
      return false;
    }
  };
  return { start, setHold: (p) => (hold.style.width = `${p * 100}%`), heard };
}

function playCheck(card, c, { finish, onCleanup }) {
  card.innerHTML = `
    <div class="cp-tag">Şimdi sen çal</div>
    <h3 class="cp-title big">${titleName(c.note)}</h3>
    <div class="cp-visual">${staffSvg(c.note)}${fluteSvg(c.note)}</div>
    <div class="cp-actions">
      <button class="btn" data-act="listen">🔊 Dinle</button>
      <button class="btn primary" data-act="mic">🎤 Çalmaya başla</button>
    </div>
    <p class="cp-feedback" aria-live="polite"></p>
    <button class="link" data-act="skip">Mikrofonsuz devam et</button>`;
  const fb = card.querySelector('.cp-feedback');
  const matcher = new NoteMatcher({
    holdMs: 700,
    onProgress: (p) => mic.setHold(p),
    onMatch: (t, info) => {
      playChime();
      voiceSay(PHRASES.great);
      const advice = tuningAdvice(info.tuning);
      fb.innerHTML = successBlock(`Harika! Bu bir ${longName(c.note)}!`) + (advice ? `<span>${advice}</span>` : '');
      setTimeout(() => finish({ skipped: false }), advice ? 3200 : 1400);
    },
    onWrong: (frame) => {
      const target = midiOf(c.note);
      const d = frame.midiFloat - target;
      const octaves = Math.round(d / 12);
      if (octaves !== 0 && Math.abs(d - octaves * 12) <= 0.7) {
        fb.textContent = octaves > 0 ? 'Doğru nota ama bir oktav yüksek: daha yavaş ve geniş üfle.' : 'Doğru nota ama bir oktav pes: havayı biraz hızlandır.';
      } else if (Math.abs(d) < 1.5) {
        fb.textContent = d > 0 ? 'Çok yakın! Ses biraz tiz: havayı yumuşat, parmaklarının delikleri tam kapattığından emin ol.' : 'Çok yakın! Ses biraz pes: havayı biraz hızlandır, parmaklarının delikleri tam kapattığından emin ol.';
      } else {
        fb.textContent = `Şu an ${longName(frame.note)} duyuyorum. Parmaklarını resimdekiyle karşılaştır.`;
      }
    },
  });
  matcher.setTarget(midiOf(c.note));
  const mic = micPanel(card, onCleanup, { onFrame: (f) => matcher.feed(f), target: midiOf(c.note) });
  let sound = null;
  onCleanup(() => sound?.stop());
  card.querySelector('[data-act=listen]').addEventListener('click', () => {
    sound?.stop();
    sound = playNote(c.note, 1.6);
  });
  const micBtn = card.querySelector('[data-act=mic]');
  micBtn.addEventListener('click', async () => {
    micBtn.disabled = true;
    if (await mic.start()) micBtn.textContent = '🎤 Dinliyorum…';
    else micBtn.disabled = false;
  });
  card.querySelector('[data-act=skip]').addEventListener('click', () => finish({ skipped: true }));
}

function listenAny(card, c, { finish, onCleanup }) {
  const holdMs = c.holdMs || 1000;
  card.innerHTML = `
    <div class="cp-tag">Şimdi sen çal</div>
    <h3 class="cp-title">Uzun bir ses çıkar</h3>
    <p>Sesi en az ${Math.round(holdMs / 1000)} saniye tut. Hangi nota olduğu önemli değil!</p>
    <div class="cp-actions"><button class="btn primary" data-act="mic">🎤 Başla</button></div>
    <p class="cp-feedback" aria-live="polite"></p>
    <button class="link" data-act="skip">Mikrofonsuz devam et</button>`;
  const fb = card.querySelector('.cp-feedback');
  let since = 0;
  let matched = false;
  const mic = micPanel(card, onCleanup, {
    onFrame: (f) => {
      if (matched) return;
      const now = performance.now();
      if (f.note && f.rms > 0.02) {
        since ||= now;
        const p = Math.min(1, (now - since) / holdMs);
        mic.setHold(p);
        if (p >= 1) {
          matched = true;
          playChime();
          voiceSay(PHRASES.great);
          fb.innerHTML = successBlock('İşte bu! Flüt sesi!');
          setTimeout(() => finish({ skipped: false }), 1400);
        }
      } else {
        since = 0;
        mic.setHold(0);
      }
    },
  });
  const micBtn = card.querySelector('[data-act=mic]');
  micBtn.addEventListener('click', async () => {
    micBtn.disabled = true;
    if (await mic.start()) micBtn.textContent = '🎤 Dinliyorum…';
    else micBtn.disabled = false;
  });
  card.querySelector('[data-act=skip]').addEventListener('click', () => finish({ skipped: true }));
}

function breath(card, c, { finish, onCleanup }) {
  const { inhale = 4, exhale = 8, rounds = 2 } = c;
  card.innerHTML = `
    <div class="cp-tag">Nefes egzersizi</div>
    <h3 class="cp-title">${inhale} say nefes al, ${exhale} say üfle</h3>
    <div class="breath"><div class="balloon"></div><div class="breath-label">Hazır mısın?</div></div>
    <div class="cp-actions"><button class="btn primary" data-act="start">Başla</button></div>
    <button class="link" data-act="skip">Atla</button>`;
  const balloon = card.querySelector('.balloon');
  const label = card.querySelector('.breath-label');
  const timers = [];
  onCleanup(() => timers.forEach(clearTimeout));
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  card.querySelector('[data-act=start]').addEventListener('click', (e) => {
    e.target.disabled = true;
    let t = 0;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < inhale; i++) at(t + i * 1000, () => {
        label.textContent = `Nefes al… ${i + 1}`;
        balloon.style.transitionDuration = `${inhale}s`;
        balloon.classList.add('full');
      });
      t += inhale * 1000;
      for (let i = 0; i < exhale; i++) at(t + i * 1000, () => {
        label.textContent = `Ssss… ${i + 1}`;
        balloon.style.transitionDuration = `${exhale}s`;
        balloon.classList.remove('full');
      });
      t += exhale * 1000;
    }
    at(t, () => {
      label.textContent = 'Çok iyi!';
      playChime();
      const next = h('<button class="btn primary">Devam ▶</button>');
      next.addEventListener('click', () => finish({ skipped: false }));
      card.querySelector('.cp-actions').replaceChildren(next);
      next.focus();
    });
  });
  card.querySelector('[data-act=skip]').addEventListener('click', () => finish({ skipped: true }));
}
