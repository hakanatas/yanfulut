// Antrenman, Egzersiz Yap ve Nota Noktaları için ortak puanlama kuralları.
// Süre affedilmez: nota ancak yazılı süresinin neredeyse tamamı boyunca çalınırsa "tam süre" sayılır;
// yalnızca dil vurma boşluğu ve mikrofon gecikmesi kadar pay bırakılır.

import { noteSymbol } from './art.js';
import { matchesTarget } from './audio.js';

/** Nota değerleri: [ad, çizim türü, süre yazısı, simge] */
const VALUE = {
  4: ['birlik', 'whole', '4 vuruş', '𝅝'],
  3: ['noktalı ikilik', 'half', '3 vuruş', '𝅗𝅥.'],
  2: ['ikilik', 'half', '2 vuruş', '𝅗𝅥'],
  1.5: ['noktalı dörtlük', 'quarter', '1,5 vuruş', '♩.'],
  1: ['dörtlük', 'quarter', '1 vuruş', '♩'],
  0.5: ['sekizlik', 'eighth', 'yarım vuruş', '♪'],
};
export const valueOf = (beats) => VALUE[beats] || VALUE[1];

/** Nota değerinin küçük çizimi (yazı tipine bağlı değil) */
export function valueIcon(beats, cls = 'value-icon') {
  const dotted = beats === 3 || beats === 1.5;
  return `<svg class="${cls}" viewBox="0 0 28 44" aria-hidden="true">${noteSymbol(11, 34, 9, valueOf(beats)[1], false)}${dotted ? '<circle cx="22" cy="34" r="2" class="fill-ink"/>' : ''}</svg>`;
}

/** Mikrofonun sesi fark etme gecikmesi (ms); tuşta gecikme yok denecek kadar az */
export const latencyOf = (input) => (input === 'mic' ? 90 : 10);

/** Tempolu çalmada eksik kalabilecek en uzun süre (ms): dil vurma boşluğu + algılama payı */
export const missingAllowed = (ms) => Math.max(170, ms * 0.12);

/** Kendi hızımda: notanın tutulması gereken süre (ms) — tempolu moddaki payla aynı (dil vurma boşluğu + algılama) */
export const holdNeedMs = (ms) => Math.max(250, ms - missingAllowed(ms));

/**
 * Tempolu çalmada bir notanın sonucu.
 * correct/wrong: notanın penceresinde doğru/yanlış sesle geçen süre (ms).
 * rearticulated: aynı nota art arda geliyorsa yeniden başlatıldı mı (dil vuruldu mu)
 * @returns {'ok'|'short'|'wrong'|'miss'}
 */
export function judgeNote({ ms, correct = 0, wrong = 0, rearticulated = true }) {
  let kind = ms - correct <= missingAllowed(ms) ? 'ok' : correct >= ms * 0.25 ? 'short' : 'miss';
  if (kind === 'ok' && !rearticulated) kind = 'short';
  if (kind === 'miss' && wrong > ms * 0.4) kind = 'wrong';
  return kind;
}

/** Vuruş cinsinden yaklaşık çalınan süre: 0,5'e yuvarlanmış */
export const beatsPlayed = (ms, beatMs) => Math.max(0, Math.round((ms / beatMs) * 2) / 2);

/**
 * Nota başlangıçlarını (dil vurma / yeni basış) yakalar: sesin kesilip yeniden başlaması
 * ya da ses şiddetindeki belirgin bir düşüşün ardından yükselmesi.
 */
export class OnsetDetector {
  constructor() {
    this.active = false;
    this.peak = 0;
    this.trough = 0;
  }

  /** @returns {boolean} bu karede yeni bir nota başladı mı */
  update(sounding, rms) {
    if (!sounding) {
      this.active = false;
      return false;
    }
    if (!this.active) {
      this.active = true;
      this.peak = this.trough = rms;
      return true;
    }
    // Vibrato sesi ±%25 kadar dalgalandırır; dil vurma ise sesi neredeyse keser
    const dipped = () => this.trough < this.peak * 0.4 && rms > this.trough * 2;
    if (rms > this.peak) {
      // Düşüşten sonra belirgin yükseliş: aynı nota yeniden başlatıldı
      const dip = dipped();
      this.peak = this.trough = rms;
      return dip;
    }
    if (rms < this.trough) this.trough = rms;
    if (dipped()) {
      this.peak = this.trough = rms;
      return true;
    }
    return false;
  }
}

/**
 * Tempolu çalmada okuma çizgisi öğrenciyi izler: insan temposu hafifçe kayar, bu yüzden
 * nota geçişlerinde saat öğrenciye uyar.
 *  - Erken geçiş: sıradaki nota, sınırdan en çok `win` ms önce başladıysa çizgi o ana kaydırılır.
 *  - Geç geçiş: sınıra gelindiğinde sıradaki nota henüz başlamadıysa çizgi en çok `win` ms bekler.
 * Notanın süresi yine yazıldığı kadar ölçülür; kayma notalar arasında birikmez.
 */
export class TempoFollower {
  /** starts: olay başlangıçları (ms); events: [{midi|null, rest}] */
  constructor(starts, events, { win = 320 } = {}) {
    Object.assign(this, { starts, events, win });
    this.offset = 0;
    this.waited = {};
    this.lastOnset = -Infinity;
  }

  /**
   * raw: düzeltmesiz okuma zamanı; cur: şu anki olay; isMidi(m): şu an m çalınıyor mu; onset: bu karede yeni başlangıç var mı.
   * @returns düzeltilmiş okuma zamanı
   */
  update(raw, cur, isMidi, onset) {
    let heard = raw - this.offset;
    if (onset) this.lastOnset = heard;
    const k = cur + 1;
    const next = this.events[k];
    const start = this.starts[k];
    if (cur < 0 || !next || next.rest || start == null) return heard;
    const prev = this.events[cur];
    const same = prev && !prev.rest && prev.midi === next.midi;
    // Sıradaki nota başladı mı? Aynı nota tekrarındaysa yeni bir dil vuruşu gerekir
    const started = isMidi(next.midi) && (!same || this.lastOnset >= start - this.win);
    if (heard < start && heard >= start - this.win && started) {
      this.offset -= start - heard; // erken geçiş: çizgiyi ileri al
      return start;
    }
    if (heard >= start - 1 && !started && (this.waited[k] || 0) < this.win) {
      const hold = heard - (start - 1); // geç geçiş: sınırda bekle
      this.offset += hold;
      this.waited[k] = (this.waited[k] || 0) + hold;
      return start - 1;
    }
    return heard;
  }
}

/**
 * Komut notası: egzersiz bitince belli bir nota uzun çalınırsa yeniden başlatılır (klavye/fare gerekmez).
 * Bitişte hâlâ çalınan son nota sayılmaz: önce bir kez susmak ya da başka nota çalmak gerekir.
 */
export class CommandNote {
  constructor(midi, { holdMs = 1200 } = {}) {
    Object.assign(this, { midi, holdMs });
    this.armed = false;
    this.since = 0;
    this.lastOn = 0;
  }

  /** frame: duyulan nota karesi ya da null. @returns 0–1 ilerleme (1 = komut verildi) */
  feed(frame, now = performance.now()) {
    const on = !!frame?.note && matchesTarget(frame, this.midi);
    if (on) {
      this.lastOn = now;
      if (!this.armed) return 0;
      if (!this.since) this.since = now;
      return Math.min(1, (now - this.since) / this.holdMs);
    }
    this.armed = true;
    // Algılamadaki çok kısa kopmalar tutmayı bozmasın
    if (this.since && now - this.lastOn < 150) return Math.min(1, (now - this.since) / this.holdMs);
    this.since = 0;
    return 0;
  }
}
