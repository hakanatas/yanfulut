// Gerçek video kaynakları için ortak arayüz: kendi video dosyanız (mp4/webm) ya da YouTube.
// Oynatıcı yalnızca şu yüzeyi kullanır: play(), pause(), seek(t), currentTime, duration,
// paused ve on(olay, fn) — olaylar: 'ready', 'play', 'pause', 'time', 'ended'.

class Emitter {
  constructor() {
    this.handlers = {};
  }
  on(evt, fn) {
    (this.handlers[evt] ||= []).push(fn);
  }
  emit(evt, ...args) {
    (this.handlers[evt] || []).forEach((fn) => fn(...args));
  }
}

/** <video> etiketiyle oynatılan dosya */
export class FileMedia extends Emitter {
  constructor(host, { src, poster, captions }) {
    super();
    const v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'metadata';
    v.src = src;
    if (poster) v.poster = poster;
    if (captions) {
      const track = document.createElement('track');
      Object.assign(track, { kind: 'captions', srclang: 'tr', label: 'Türkçe', src: captions, default: true });
      v.appendChild(track);
    }
    host.appendChild(v);
    this.v = v;
    this.hasOwnCaptions = !!captions;
    v.addEventListener('loadedmetadata', () => this.emit('ready'));
    v.addEventListener('play', () => this.emit('play'));
    v.addEventListener('pause', () => this.emit('pause'));
    v.addEventListener('timeupdate', () => this.emit('time', v.currentTime));
    v.addEventListener('ended', () => this.emit('ended'));
  }
  play() {
    return this.v.play();
  }
  pause() {
    this.v.pause();
  }
  seek(t) {
    this.v.currentTime = t;
  }
  get currentTime() {
    return this.v.currentTime;
  }
  get duration() {
    return this.v.duration || 0;
  }
  get paused() {
    return this.v.paused;
  }
  setCaptions(on) {
    if (this.v.textTracks[0]) this.v.textTracks[0].mode = on ? 'showing' : 'hidden';
  }
  destroy() {
    this.v.pause();
    this.v.removeAttribute('src');
    this.v.load();
  }
}

let ytApi = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  ytApi ||= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => reject(new Error('YouTube yüklenemedi'));
    document.head.appendChild(s);
  });
  return ytApi;
}

/** YouTube videosu (IFrame API) */
export class YouTubeMedia extends Emitter {
  constructor(host, { youtube }) {
    super();
    const div = document.createElement('div');
    host.appendChild(div);
    this.isPaused = true;
    this.hasOwnCaptions = true;
    loadYouTubeApi()
      .then((YT) => {
        this.p = new YT.Player(div, {
          videoId: youtube,
          playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, cc_lang_pref: 'tr', hl: 'tr' },
          events: {
            onReady: () => this.emit('ready'),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) {
                this.isPaused = false;
                this.emit('play');
                this.startPolling();
              } else if (e.data === YT.PlayerState.PAUSED) {
                this.isPaused = true;
                this.emit('pause');
              } else if (e.data === YT.PlayerState.ENDED) {
                this.isPaused = true;
                this.emit('pause');
                this.emit('ended');
              }
            },
          },
        });
      })
      .catch(() => {
        host.insertAdjacentHTML('beforeend', '<p class="media-error">Video yüklenemedi. İnternet bağlantını kontrol et.</p>');
      });
  }
  startPolling() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPaused) return clearInterval(this.timer);
      this.emit('time', this.currentTime);
    }, 200);
  }
  play() {
    this.p?.playVideo();
  }
  pause() {
    this.p?.pauseVideo();
  }
  seek(t) {
    this.p?.seekTo(t, true);
    this.emit('time', t);
  }
  get currentTime() {
    return this.p?.getCurrentTime?.() || 0;
  }
  get duration() {
    return this.p?.getDuration?.() || 0;
  }
  get paused() {
    return this.isPaused;
  }
  setCaptions() {}
  destroy() {
    clearInterval(this.timer);
    this.p?.destroy?.();
  }
}

export function createMedia(host, video) {
  return video.youtube ? new YouTubeMedia(host, video) : new FileMedia(host, video);
}
