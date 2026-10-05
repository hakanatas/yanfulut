// İlerleme ve ayarlar tarayıcıda (localStorage) saklanır.
const KEY = 'yanflut.progress.v1';

const defaults = () => ({ lessons: {}, songs: {}, settings: { voice: true, captions: true, rate: 1 } });

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data) return { ...defaults(), ...data, settings: { ...defaults().settings, ...data.settings } };
  } catch {
    /* gizli sekme vb. */
  }
  return defaults();
}

const state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* saklanamadıysa uygulama yine çalışır */
  }
}

export const progress = {
  isLessonDone: (id) => !!state.lessons[id],
  completeLesson(id) {
    state.lessons[id] = { done: true, at: Date.now() };
    save();
  },
  songStars: (id) => state.songs[id]?.stars || 0,
  completeSong(id, stars) {
    state.songs[id] = { stars: Math.max(stars, state.songs[id]?.stars || 0), at: Date.now() };
    save();
  },
  get settings() {
    return state.settings;
  },
  setSetting(k, v) {
    state.settings[k] = v;
    save();
  },
  reset() {
    Object.assign(state, defaults());
    save();
  },
};
