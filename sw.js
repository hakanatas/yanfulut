// Güncelleme koruyucusu: GitHub Pages dosyaları tarayıcıda 10 dakika saklatır. Yeni sürüm yayımlanınca bazı
// modüller yeni, bazıları eski kalırsa sayfa açılmaz ("does not provide an export named …"). Bu service worker
// kod dosyalarını (js, css, json) her açılışta sunucuya sordurur: değişmemişse kısa bir 304 yanıtı gelir.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode === 'navigate') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !/\.(js|mjs|css|json)$/.test(url.pathname)) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).catch(() => fetch(req)));
});
