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
Şarkının her notası bir resmin bir noktasıdır. Doğru notayı **süresi kadar** tuttukça sıradaki noktaya çizgi çekilir; şarkı bitince gizli resim ortaya çıkar.
Ezgi şeridinde her notanın değeri çizili (dörtlük, ikilik, birlik…; kutu genişliği süreyle orantılı), hedef panelinde vuruş noktaları ve dolan çubuk var.
Nota erken bırakılırsa "Kısa kaldı" denir ve tekrar istenir; art arda aynı nota her seferinde yeniden başlatılmalı. Sonuçta yanlış nota ve kısa kalan süre sayıları gösterilir.
Dokunarak çalarken tuşa notanın süresi kadar basılı tutulur.

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

### Egzersiz Yap (flüt ve keman)

**Keman** için 5 ünitede 32 egzersiz (`js/violin/worksheet.js`): boş teller La ve Re (aşağı/yukarı yay, dörtlük-ikilik-birlik),
Sol ve Mi telleri (sus, korona, 3/4 vals), La telinde parmaklar (Si, Do♯, Re; noktalı ikilik), Re telinde parmaklar (Mi, Fa♯, Sol;
bağ, 2/4, tam ölçü sus) ve Mi telinde parmaklar (Fa♯, Sol♯, La; sekizlik, noktalı dörtlük). Ezgiler telif süresi dolmuş geleneksel
ezgiler: Saint Margarita Ninnisi, Küçük Hans, Ay Işığında, Zil Sesleri, Londra Köprüsü, Küçük Ördekler. Kemanda büyük flüt resmi
yerine parmak yeri şeması görünür; aynı nota tekrarında "yayı yeniden başlat" denir.

**Flüt**: 7 ünitede toplam 61 egzersiz. Kağıttaki egzersizlerin ardından her ünitede aynı notalar ve ritimlerle ek alıştırmalar
(basamaklar, atlamalar, 3/4 vals, sus ile başlayan ölçüler, ölçüyü aşan bağlar, Si/Si bemol ayrımı, Fa majör dizisi) ve
telif süresi dolmuş, bilindik ezgiler var: Sıcak Çörekler, Ay Işığında (Au clair de la lune), Küçük Yıldız, Küçük Hans
(Hänschen klein), Zil Sesleri (Jingle Bells nakaratı), Küçük Kuzu ve Neşeye Övgü (Beethoven).
**Ünite 6** pes Re, Fa diyez ve ince Mi'yi tanıtır; Sol majörde: Ali Baba'nın Çiftliği (Old MacDonald), Tembel Çocuk (Frère Jacques),
Küçük Ördekler, Yankee Doodle, İyi ki Doğdun (Happy Birthday, 3/4 anakruz), Londra Köprüsü, Eve Dönüş (Dvořák, Yeni Dünya),
Amazing Grace ve Neşeye Övgü'nün orta bölümlü tam hali. **Ünite 7** ince Fa diyez ve ince Sol'u tanıtır: oktav atlamaları ve
Petzold'un Sol majör Minuet'i (Anna Magdalena Bach defteri). Kemanda da Ali Baba'nın Çiftliği, Eve Dönüş ve Amazing Grace var.
**Parçalar**'da Üsküdar'a Gider İken (Kâtibim, anonim türkü) ilk kıtası var: nota sırası iki kaynakta aynı, ritim sadeleştirildi;
doğrulanamayan nakarat eklenmedi. Başka türküler, notası (fotoğraf ya da do-re-mi yazısı) gelince eklenecek.
**Ünite 8** ince Fa, ince La ve Sol diyezi tanıtır; 5/8 aksak ölçü (`time: 2.5, sig: '5/8', beatUnit: 0.5`: metronom ve sayım
sekizlik vurur). Öğretmenin gönderdiği notalardan: Caddelerde Rüzgar, Fikrimin İnce Gülü (giriş ve ilk dize), Gönül Sayfam ve
Kara Tren; tekrarlar ve 1./2. sonlar satırlara açıldı, üçlemeler ve onaltılıklar sekizliğe sadeleştirildi.

**Parçalar** bölümünde "Bana Bir Masal Anlat Baba" (Söz: Yavuz Turgul – Cengiz Onural, Müzik: Cengiz Onural) dört notaya
(La, Si, İnce Do, İnce Re) uyarlanmış kolay düzenlemesiyle bulunur: sekizlik, noktalı dörtlük ve sekizlik sus içerir.

Çalışma kağıdının (Ünite 1–5) egzersizleri. Nokta birleştirme yok: büyük nota adı, büyük porte ve büyük flüt parmak resmi
gösterilir; satırlar ayrı kartlarda durur, çalınan nota üzerinde vurgu ve okuma çizgisi ilerler. Sus işaretleri sayılır
(puanlanmaz), korona notası yazılanın iki katı tutulur, bağlı notalar tek nota sayılır. Bütün egzersiz ya da tek bir satır
çalınabilir; sonda doğru / süresi kısa / yanlış / kaçırılan nota sayıları ve yüzde gösterilir. Her ünite yeni notalarını
önce tanıtır; `tools/check-course.mjs` egzersizlerin yalnızca tanıtılmış notaları kullandığını ve ölçü toplamlarını denetler.
Çalarken çalınan satır ekranın üstüne kayar (altındaki satır önceden görünür); büyük hedef kartı ekrandan çıkınca sayım, hedef
nota, süre ve geri bildirim satırların üstündeki yapışkan şeritte görünür.

### Antrenman
Resim yok; hedef doğru notayı **doğru süre** boyunca çalmak. Parça gerçek nota yazısıyla gösterilir: 4/4 ölçüler, her vuruşun altında sayı (1 2 3 4), her notanın altında uzunluğunu gösteren süre çubuğu ve aynı vuruştaki sekizlikler kirişle bağlı.

- **Kendi hızımda:** Her nota süresi kadar (vuruş × tempo) tutulunca geçilir; vuruş noktaları tutarken dolar. Erken bırakılırsa "Kısa kaldı: 2 vuruş tutmalısın" denir ve nota tekrar istenir.
- **Tempolu:** Dört vuruşluk metronom sayımından sonra okuma çizgisi **ilk notanı duyana kadar bekler**, sonra ilerler; her nota hem nota hem süre için puanlanır (yeşil: tam, sarı: süre eksik, kırmızı: yanlış ya da kaçtı).
- **Okuma çizgisi öğrenciyi izler** (`TempoFollower`): nota geçişinde sıradaki nota en çok 0,32 sn erken başlarsa çizgi ona uyar, geç kalırsa o kadar bekler; böylece insan temposundaki küçük kaymalar notadan notaya birikmez. Aynı nota tekrarında erken geçiş için yeni vuruş notanın ikinci yarısında aranır; kısa notada (ör. iki sekizlik) şimdiki notanın kendi başlangıcı sonrakinin başlangıcı sanılmaz.
- **Süre affedilmez** (`js/scoring.js`): nota ancak yazılı süresinin neredeyse tamamı çalınırsa "tam süre" sayılır; yalnızca dil vurma boşluğu kadar (en çok 0,17 sn ya da sürenin %12'si) eksik kalabilir. Aynı nota art arda geliyorsa her biri yeniden başlatılmalı (dil vurma); tek uzun ses olarak çalınırsa sayılmaz. Kendi hızımda modunda da aynı pay geçerli; sıradaki notaya süre dolmadan geçilirse nota "yanlış" değil "süre eksik" sayılır ve devam edilir (aynı nota tekrarında ise nota yeniden istenir).
- **Tempo elle ayarlanır:** egzersiz ve antrenman sayfalarında **− / +** düğmeleri ya da kutuya yazarak 30–200 vuruş/dk; seçilen tempo o alıştırma için hatırlanır, "Yazılı tempo" ile geri dönülür. Yazılı tempodan %10'dan fazla yavaş çalınınca en çok 2 yıldız verilir ve sonuçta not düşülür.
- **Metronom sesi:** Tempolu modda öğrenci başlayınca her vuruşta (ölçü başı vurgulu) tahta tıkırtısı çalar; ses okuma çizgisiyle birlikte zamanlanır (`js/metronome.js`, Web Audio). Tıkırtı perdesiz gürültü olduğu için mikrofondaki nota algısını şaşırtmaz. "Metronom sesi açık/kapalı" düğmesiyle kapatılabilir.
- **Elini sürmeden:** mikrofonla çalarken alıştırma bitince mikrofon açık kalır. Flütte **Si** (kemanda **La**) yaklaşık 1 sn uzun çalınırsa alıştırma baştan başlar; flütte **La** (kemanda **Re**) uzun çalınırsa sonraki alıştırmaya geçilir ve o da aynı modla kendiliğinden başlar. Bitişte hâlâ süren ses sayılmaz; önce bir an susmak gerekir.
- **Akort öğrenme:** doğru kabul edilen notalardan enstrümanın genel akordu öğrenilir ve notalar buna göre değerlendirilir; tiz akortlu bir flütte ince Do "Do diyez" sanılmaz. Yanlış öğrenme notaları bozmasın diye yalnızca hedefe ±60 sent yakın sesler öğrenilir, en az üç farklı notanın ortancası alınır, kaydırma en çok ±25 senttir ve değer yalnızca o sekmede saklanır (ortak bilgisayarda bir öğrencinin flütü diğerini etkilemez). Akort ne olursa olsun komşu notanın kendisi (100 sent) hiçbir zaman kabul edilmez. Akort sayfasında öğrenilen değer görünür ve sıfırlanabilir.
- **Yanlış notada yol gösterme:** ses iki nota arasında kaldıysa kaç sent tiz/pes olduğu ve akort önerisi; tam başka bir notaysa hedef için hangi parmağın kapatılıp kaldırılacağı söylenir (ör. "İnce Do için sol işaret parmağını kapat"). Duyulan notanın yanında belirgin sapma sent olarak yazılır.
- Antrenman ve Egzersiz sayfalarında **◀ Önceki / Sonraki ▶** düğmeleri hem üstte hem sonuç kartında bulunur.
- Mikrofonla ya da ekrandaki tuşa basılı tutarak çalınır; sonunda doğru nota ve tam süre sayısı gösterilir.

### Yalnızca porte
"🎼 Yalnızca porte" düğmesi flüt/keman resmini gizler; antrenmanlarda, şarkılarda ve derslerdeki "Şimdi sen çal" kartlarında yalnızca nota yazısı kalır. Seçim hatırlanır.

### Öğrenilmemiş nota yok
Her ders öğrettiği notaları `teaches` alanında listeler. `node tools/check-course.mjs` ders yolunu baştan sona yürür ve hiçbir alıştırmanın (şarkı, antrenman, "Şimdi sen çal") o ana kadar öğretilmemiş bir nota kullanmadığını, antrenmanların 4/4 ölçülere tam bölündüğünü denetler.

### 3. Yardımcı araçlar
- **Parmak tablosu:** Pes Do'dan tiz Do'ya kadar her nota için flüt üzerinde parmak pozisyonu, porte görünümü ve örnek ses.
- **Akort:** Mikrofonla çalınan notayı ve kaç sent pes/tiz olduğunu iğneyle gösterir (titreşimde zıplamasın diye son karelerin ortancası). Hedef düğmeleri referans sesi çalar ve iğneyi o notaya göre ayarlar: kemanda Sol, Re, La, Mi telleri (otomatik modda yakın çalınan boş tel kendiliğinden hedef olur), flütte La (440 Hz) ve Si bemol. Ne yapılacağı yazılır: kemanda "ince akort vidasını hafifçe gevşet/sık", flütte "baş kısmını çok az dışarı çek/içeri it"; ±5 sent içinde sabit kalınca "Akortlu ✓". Hedeften yarım ses kadar uzak ses başka bir nota olarak bildirilir. Akort sayfasında bir nota 1 saniyeden uzun sabit tutulunca uygulamanın bildiği akort bu ölçüme ayarlanır: enstrüman yeniden akort edilince alıştırmalar eski (öğrenilmiş) akordu kullanmaz. Flütte Si yerine Si bemol duyulursa başparmağın küçük Si bemol mandalında olabileceği söylenir.
- **Metronom:** 30–200 vuruş/dk, −5/−1/+1/+5 düğmeleri ve kaydırıcı, 2/4–3/4–4/4 ya da vurgusuz, sekizlik ara vuruş, "Vuruşa dokun" ile tempo bulma ve klavye kısayolları (boşluk, oklar). Ayarlar hatırlanır.

İlerleme tarayıcıda (localStorage) saklanır. Mikrofon sesi yalnızca tarayıcıda işlenir, hiçbir yere gönderilmez.

## Nokta Nokta Piyano (`/piyano/`): Nota Okuma

Piyanoya geçmeden önce nota okuma yolu (`js/piano/reading.js`, oyun `js/reading.js`, klavye `js/keyboard.js`). 16 adım:
klavyeyi tanıma (ikili/üçlü siyah tuşlar, yedi nota), sol anahtarı (orta Do'dan ince Sol'e; çizgi ve aralık notaları),
fa anahtarı (pes Sol'den orta Do'ya) ve iki anahtar karışık. Her adımın üstünde kısa konu anlatımı ve resmi (klavye ya da porte) var.

- **Türler:** *Klavyede bul* (porte yok, "Fa'ya bas"; her oktav doğru), *Nota okuma* (portede tek nota, rastgele sırayla),
  *Satır okuma* (bir satır notayı soldan sağa sırayla çal; Neşeye Övgü ve Küçük Yıldız gibi ezgiler de var).
- **Cevap yolları:** ekrandaki klavye (basınca piyano sesi), gerçek piyano (mikrofon: yeni ve kararlı bir nota başlayınca sayılır;
  sönen eski nota tekrar sayılmaz, aynı tuşa yeniden basış ses yükselişinden anlaşılır), MIDI klavye (Web MIDI; Chrome/Edge) ve
  piyanosuz *nota adıyla* cevap (Do Re Mi… düğmeleri; oktav sorulmaz).
- **Geri bildirim:** yanlışta hedefin yukarıda mı aşağıda mı olduğu, doğru nota yanlış oktav uyarısı; iki yanlıştan sonra doğru tuş
  yanıp söner. Sonuçta ilk denemede doğru yüzdesi, ortalama süre ve zorlanılan notalar; yıldızlar ilerlemeye kaydedilir.
- **Porte:** sol (𝄞) ve fa (𝄢) anahtarı (`clefStep`), ek çizgiler; ipucu olarak nota adı gösterilebilir, klavyede tuş adları açılabilir.
- Video dersler ve şarkılar sonraki adımda.

### Gamlar: Trinity Grade 3 (`#/gamlar`, `js/piano/scales.js`)

Sınav kitabındaki (s. 5–8) gamlar, parmak numaralarıyla: Mi, Si, Si♭, Mi♭, La♭, Re♭ majör; Si, Sol, Do, Fa armonik ve melodik
minör (sağ el, sol el, iki el birlikte); zıt yönde Sol, Re majör ve La armonik minör. Hepsi iki oktav (29 nota), kitaptaki gibi
oktav oktav dört satır; sol elin tiz oktavı sol anahtarında. Notalar doğru yazılır (Mi♯, La♭…), satırlar `spell()` ile üretilir.

- **Sınav seçimi:** kitaba elle yazılan altı gam, dinamiğiyle (forte / piano) listenin başında (`EXAM_PICKS`).
- **İki el:** büyük porte (sağ el üstte, sol el altta). MIDI klavyede iki tuş yarım saniye içinde birlikte beklenir; ekran ve
  mikrofonda biri yeter. Satır okumada doğru notadan sonra beklemeden sıradakine geçilir, hızlı çalışta nota kaçmaz.
- **Piyanodan komut:** mikrofon ya da MIDI seçiliyken alıştırma çalışmıyorsa aynı tuşa (hangi oktav olursa olsun) iki kez basmak
  komuttur: **Do Do** başla / tekrar, **Re Re** sonraki alıştırma, **Si Si** önceki. Cevap yolu, metronom ve ipucu seçimleri
  alıştırmadan alıştırmaya korunur; mikrofon açık kalır. (Nota Okuma adımlarında da geçerli.)
- **Tempo:** isteğe bağlı metronom (♩ = 60'tan başlar, ±4); sonuçta dakikadaki nota sayısı, düzgünlük ve sınav temposu
  (♩ = 96, her vuruşa iki nota = dakikada 192 nota) gösterilir.

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
js/scoring.js         Ortak puanlama: tam süre toleransı, dil vurma (nota başlangıcı) algılama
js/sheet.js           Egzersiz Yap: egzersizler satır satır (sus, korona, bağ, 2/4-3/4-4/4)
js/metronome.js       Metronom: zamanlanmış vuruşlar, çalarken tıkırtı, tempo düğmeleri
js/data/worksheet.js  Flüt çalışma kağıdı: Ünite 1–5 egzersizleri ve yeni notalar
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
