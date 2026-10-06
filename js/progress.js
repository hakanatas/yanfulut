// İlerleme ve ayarlar tarayıcıda (localStorage) saklanır; her enstrümanın ayrı kaydı var.
import { instrument } from './instrument.js';

const defaults = () => ({ lessons: {}, songs: {}, settings: { voice: true, captions: true, rate: 1, showFingering: true } });

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(instrument().storageKey));
    if (data) return { ...defaults(), ...data, settings: { ...defaults().settings, ...data.settings } };
  } catch {
    /* gizli sekme vb. */
  }
  return defaults();
}

let cache = null;
const S = () => (cache ||= load());

function save() {
  try {
    localStorage.setItem(instrument().storageKey, JSON.stringify(S()));
  } catch {
    /* saklanamadıysa uygulama yine çalışır */
  }
}

export const progress = {
  isLessonDone: (id) => !!S().lessons[id],
  completeLesson(id) {
    S().lessons[id] = { done: true, at: Date.now() };
    save();
  },
  songStars: (id) => S().songs[id]?.stars || 0,
  completeSong(id, stars) {
    S().songs[id] = { stars: Math.max(stars, S().songs[id]?.stars || 0), at: Date.now() };
    save();
  },
  get settings() {
    return S().settings;
  },
  setSetting(k, v) {
    S().settings[k] = v;
    save();
  },
  reset() {
    Object.assign(S(), defaults());
    save();
  },
};
