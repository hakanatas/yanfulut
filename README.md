# Nokta Nokta Flüt ve Keman 🎶

Yan flüt ve keman öğrenmek isteyenler için **çizimli, etkileşimli video dersler** ve **nota-nokta şarkı oyunları** sunan bir web uygulaması.

- Yan flüt: `index.html` → https://hakanatas.github.io/yanfulut/
- Keman: `keman/index.html` → https://hakanatas.github.io/yanfulut/keman/

İki enstrüman aynı altyapıyı (oynatıcı, çizim motoru, nota algılama, Google seslendirmesi, şarkı oyunu) paylaşır; dersler, şarkılar, çizimler ve parmak yerleri enstrümana özgü paketlerdedir (`js/instruments/`).

## Keman

8 ders: Kemanla Tanış, Kemanı Tutmak, Yay Tutuşu, Boş Teller, La Telinde Parmaklar, Re Telinde Parmaklar, Ritim ve Yay Yönleri, Mi Telinde Parmaklar. Derslerde detaylı keman ve yay çizimleri, keman çalan çocuk, yay tutuşu, yayın tellere dik çekilişi ve 1. pozisyon parmak yeri şeması (klavye üzerinde bantlarla) var. Şarkılar La ve Re majörde, en kolaydan başlayarak: Boş Tel Treni (yalnızca boş teller), Salıncak, Merdiven, Sıcak Çörekler, Tembel Çocuk, Küçük Kuzu, Neşeye Övgü (keman resmi çıkar) ve Daha Dün Annemizin. Örnek notalar keman tınısıyla çalınır, mikrofon en kalın Sol telinden (196 Hz) itibaren dinler; boş tel akordu kaymışsa ince akort vidası, basılı notada parmak yeri önerilir.

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
| Si Treni | Si | Kalp |
| Salıncak | Si, La | Balon |
| Merdiven | Sol, La, Si | Ev |
| Tembel Çocuk | Sol, La, Si, Do, Re | Güneş |
| Sıcak Çörekler | Si, La, Sol | Sekizlik nota |
| Küçük Kuzu | Sol, La, Si, Re | Kuzu |
| Neşeye Övgü | Sol, La, Si, Do, Re | Fil |
| Daha Dün Annemizin | Sol, La, Si, Do, Re, Mi | Yıldız |

Mikrofon, hedef notaya ±70 sent yakınlığı doğru sayar; yeni başlayanların biraz tiz/pes çalması (ve La=442–443 akortlu flütler) yanlış nota sayılmaz, bunun yerine akort önerisi gösterilir. Şarkılarda bir oktav kayan nota da kabul edilir. Uygulama kendisi konuşurken ya da örnek nota çalarken mikrofon dinlemeyi bekletir.

Üç oyun modu var: **Flütle çal** (mikrofon), **Dokunarak çal** (ekrandaki nota düğmeleri, flütü yanında olmayanlar için) ve **Dinle ve izle** (ezgiyi çalıp resmi kendisi çizer). Hata sayısına göre 1 ile 3 arasında yıldız kazanılır.

### Antrenman
Resim yok; hedef doğru notayı **doğru süre** boyunca çalmak. Parça gerçek nota yazısıyla gösterilir: 4/4 ölçüler, her vuruşun altında sayı (1 2 3 4), her notanın altında uzunluğunu gösteren süre çubuğu ve aynı vuruştaki sekizlikler kirişle bağlı.

- **Kendi hızımda:** Her nota süresi kadar (vuruş × tempo) tutulunca geçilir; vuruş noktaları tutarken dolar. Erken bırakılırsa "Kısa kaldı: 2 vuruş tutmalısın" denir ve nota tekrar istenir.
- **Tempolu:** Dört vuruşluk metronom sayımından sonra okuma çizgisi ilerler; her nota hem nota hem süre için puanlanır (yeşil: tam, sarı: süre kısa, kırmızı: kaçtı).
- Mikrofonla ya da ekrandaki tuşa basılı tutarak çalınır; sonunda doğru nota ve tam süre sayısı gösterilir.

### Yalnızca porte
"🎼 Yalnızca porte" düğmesi flüt/keman resmini gizler; antrenmanlarda, şarkılarda ve derslerdeki "Şimdi sen çal" kartlarında yalnızca nota yazısı kalır. Seçim hatırlanır.

### Öğrenilmemiş nota yok
Her ders öğrettiği notaları `teaches` alanında listeler. `node tools/check-course.mjs` ders yolunu baştan sona yürür ve hiçbir alıştırmanın (şarkı, antrenman, "Şimdi sen çal") o ana kadar öğretilmemiş bir nota kullanmadığını, antrenmanların 4/4 ölçülere tam bölündüğünü denetler.

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
index.html            Yan flüt sayfası (boot('flute'))
keman/index.html      Keman sayfası (boot('violin'))
js/instrument.js      Etkin enstrüman; ortak modüller enstrümana özgü her şeyi buradan alır
js/instruments/       Enstrüman paketleri: flute.js, violin.js
js/violin/            Keman: notalar ve parmak yerleri, çizimler, dersler, şarkılar, sesler
css/style.css         Kâğıt teması (karanlık modda kara tahta)
js/app.js             Sayfa yönlendirme: ders yolu, parmak tablosu, akort
js/player.js          Etkileşimli ders oynatıcısı (çizimli sahneler + gerçek video)
js/media.js           Video dosyası ve YouTube için ortak oynatıcı arayüzü
js/checkpoints.js     Duraklar: soru, nota çalma, ses tutma, nefes
js/sketch.js          Çizim motoru: SVG'leri çizgi çizgi canlandırır
js/art.js             Çizimler: flüt, porte, maskot, şişe, dudaklar…
js/dots.js            Nota Noktaları oyunu
js/drill.js           Antrenman: nota + süre çalışması (kendi hızımda / tempolu)
js/data/drills.js     Flüt antrenmanları (keman: js/violin/drills.js)
js/data/shapes.js     Kısa şarkıların resimleri
tools/check-course.mjs  Ders yolu denetimi
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
GOOGLE_TTS_API_KEY=anahtarınız node tools/tts.mjs flute    # ya da: violin
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
