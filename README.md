# Nokta Nokta Flüt 🎶

Yan flüt öğrenmek isteyenler için **çizimli, etkileşimli video dersler** ve **nota-nokta şarkı oyunları** sunan bir web uygulaması.

## Neler var?

### 1. Çizimli video dersler
Her ders, tahtaya elle çiziliyormuş gibi beliren sahnelerden oluşan bir "video".

- Sahneler çizgi çizgi çizilir: metal parlaklığı, anahtar kapakları ve milleriyle gerçekçi bir Boehm flütü, yandan yüz profili, akciğer/diyafram çizimi, gölgeler ve kurşun kalem taramaları.
- Anlatımı **Google Cloud Text-to-Speech** ile üretilmiş doğal bir Türkçe ses (Chirp3-HD) okur; **altyazı** eşlik eder. Duraklatınca ses kaldığı yerden devam eder.
- Video gibi kullanılır: oynat/duraklat, önceki/sonraki sahne, zaman çizelgesinden istediğin sahneye atlama. Klavyeyle: boşluk tuşu oynatır/duraklatır, ← → sahne değiştirir.
- **Etkileşimli duraklar** (zaman çizelgesinde sarı elmaslar): video durur ve sırayla şunları yaptırır:
  - **Soru:** çoktan seçmeli bilgi sorusu
  - **Şimdi sen çal:** mikrofon, çaldığın notayı dinler; doğru notayı tutunca ders devam eder
  - **Ses çıkar:** ilk ses denemesi (herhangi bir notayı tutmak yeter)
  - **Nefes egzersizi:** 4 say nefes al, 8 say üfle

Maskotumuz **Nota** (yüzü olan bir sekizlik nota) dersler boyunca eşlik eder.

### 2. Nota Noktaları (şarkı oyunu)
Şarkının her notası bir resmin bir noktasıdır. Doğru notayı çaldıkça sıradaki noktaya çizgi çekilir; şarkı bitince gizli resim ortaya çıkar.

| Şarkı | Notalar | Gizli resim |
|---|---|---|
| Sıcak Çörekler | Si, La, Sol | Sekizlik nota |
| Küçük Kuzu | Sol, La, Si, Re | Kuzu |
| Neşeye Övgü | Sol, La, Si, Do, Re | Fil |
| Daha Dün Annemizin | Sol, La, Si, Do, Re, Mi | Yıldız |

Mikrofon, hedef notaya ±70 sent yakınlığı doğru sayar; yeni başlayanların biraz tiz/pes çalması (ve La=442–443 akortlu flütler) yanlış nota sayılmaz, bunun yerine akort önerisi gösterilir. Şarkılarda bir oktav kayan nota da kabul edilir. Uygulama kendisi konuşurken ya da örnek nota çalarken mikrofon dinlemeyi bekletir.

Üç oyun modu var: **Flütle çal** (mikrofon), **Dokunarak çal** (ekrandaki nota düğmeleri, flütü yanında olmayanlar için) ve **Dinle ve izle** (ezgiyi çalıp resmi kendisi çizer). Hata sayısına göre 1 ile 3 arasında yıldız kazanılır.

### 3. Yardımcı araçlar
- **Parmak tablosu:** Pes Do'dan tiz Do'ya kadar her nota için flüt üzerinde parmak pozisyonu, porte görünümü ve örnek ses.
- **Akort:** Mikrofonla çalınan notayı ve kaç sent pes/tiz olduğunu gösterir.

İlerleme tarayıcıda (localStorage) saklanır. Mikrofon sesi yalnızca tarayıcıda işlenir, hiçbir yere gönderilmez.

## Çalıştırma

Derleme adımı yok; düz HTML, CSS ve JavaScript (ES modülleri). Modüller `file://` üzerinden açılmadığı için küçük bir yerel sunucu yeterli:

```bash
python3 -m http.server 8080
# ya da
npx serve .
```

Ardından tarayıcıda `http://localhost:8080` adresini aç. Mikrofon için sayfanın `localhost` ya da `https` üzerinden açılması gerekir. GitHub Pages gibi herhangi bir statik barındırma hizmetinde de olduğu gibi çalışır.

## Proje yapısı

```
index.html            Sayfa iskeleti ve elle çizim SVG filtreleri
css/style.css         Kâğıt teması (karanlık modda kara tahta)
js/app.js             Sayfa yönlendirme: ders yolu, parmak tablosu, akort
js/player.js          Etkileşimli ders oynatıcısı (çizimli sahneler + gerçek video)
js/media.js           Video dosyası ve YouTube için ortak oynatıcı arayüzü
js/checkpoints.js     Duraklar: soru, nota çalma, ses tutma, nefes
js/sketch.js          Çizim motoru: SVG'leri çizgi çizgi canlandırır
js/art.js             Çizimler: flüt, porte, maskot, şişe, dudaklar…
js/dots.js            Nota Noktaları oyunu
js/audio.js           Flüt benzeri sentezleyici ve mikrofonla perde algılama
js/voice.js           Seslendirme: önceden üretilmiş Google TTS sesleri, yoksa tarayıcı sesi
js/tts/               Google TTS ile üretilmiş anlatım sesleri (JS modülü içinde MP3) ve manifest.js
tools/tts.mjs         Anlatımları Google Cloud Text-to-Speech ile MP3'e çeviren betik
js/progress.js        İlerleme ve ayarlar
js/data/notes.js      Notalar, frekanslar ve parmak pozisyonları
js/data/lessons.js    Ders içerikleri
js/data/songs.js      Şarkılar ve gizli resimler
js/data/phrases.js    Seslendirilen kısa cümleler (soru, "Doğru!" vb.)
```

## Seslendirme (Google TTS)

Anlatımlar `js/tts/` klasöründe hazır gelir (her ses, base64 MP3 içeren küçük bir JS modülüdür; böylece dosya indirmeyi kısıtlayan gömülü görünümlerde de çalar); uygulama çalışırken internete ya da bir API anahtarına ihtiyaç duymaz. Ders metnini değiştirdiğinizde veya yeni bir ders eklediğinizde sesleri yeniden üretin:

```bash
GOOGLE_TTS_API_KEY=anahtarınız node tools/tts.mjs
```

Betik yalnızca eksik cümleleri üretir, artık kullanılmayan dosyaları siler ve `js/tts/manifest.js` dosyasını günceller. Başka bir ses için `TTS_VOICE=tr-TR-Chirp3-HD-Aoede` gibi bir değer verin (Türkçe sesler: `tr-TR-Chirp3-HD-*`, `tr-TR-Wavenet-*`). API anahtarı yalnızca bu betikte kullanılır, tarayıcıya hiç gönderilmez. Tarayıcının robotik sesi hiç kullanılmaz; sesi henüz üretilmemiş bir cümle yalnızca altyazıyla gösterilir.

## İçerik ekleme

### Yeni bir çizimli ders
`js/data/lessons.js` içindeki `LESSONS` dizisine bir ders ekleyin, ardından `js/app.js` içindeki `COURSE` listesine yerleştirin:

```js
{
  id: 'fa',
  title: 'Pes Fa',
  summary: 'Yeni bir nota',
  scenes: [
    {
      clear: true,                                   // tahtayı sil
      draw: flute({ note: 'F4', labels: true }),     // çizim (art.js yardımcıları)
      sound: { note: 'F4', dur: 1.5 },               // örnek ses
      say: 'Fa için sağ işaret parmağını da kapat.', // anlatım + altyazı
      check: { type: 'play', note: 'F4' },           // durak (isteğe bağlı)
    },
  ],
}
```

Tahta 800×450 birimdir; altyazı alt kısmı kapladığı için çizimleri y ≈ 370'in üstünde tutun.

### Gerçek video ile ders
Kendi çektiğiniz bir videoyu (ya da bir YouTube videosunu) etkileşimli derse çevirmek için `scenes` yerine `video` alanı verin. `cues` içindeki her durakta video durur, soruyu sorar ya da notayı dinler, sonra kaldığı yerden devam eder:

```js
{
  id: 'video-ders',
  title: 'Öğretmenimle İlk Ses',
  video: {
    src: 'videos/ilk-ses.mp4',            // ya da: youtube: 'VIDEO_KIMLIGI'
    captions: 'videos/ilk-ses.vtt',       // isteğe bağlı WebVTT altyazı
    cues: [
      { at: 42, check: { type: 'quiz', q: 'Hava nereye üflenir?', options: ['Kenara', 'İçeri'], answer: 0 } },
      { at: 75, check: { type: 'play', note: 'B4' } },
    ],
  },
}
```

### Yeni bir şarkı
`js/data/songs.js` içindeki `SONGS` dizisine ekleyin. `notes` notaları (`B4:2` = iki vuruşluk Si), `shape.outline` ise 0–100 aralığında kapalı bir çokgendir. `shape.details` (göz, kulak, yün kıvrımı…) ve `shape.scene` (çimen, gökyüzü…) resim tamamlanınca sırayla belirir. Noktalar çokgenin köşelerine ve kenarlarına otomatik dağıtılır; bu yüzden şarkıdaki nota sayısı köşe sayısından az olmamalıdır.

## Tarayıcı desteği
Güncel Chrome, Edge, Safari ve Firefox.
