// Ders içerikleri. Her ders, sırayla oynatılan "sahnelerden" oluşan çizimli bir videodur.
//
// Sahne alanları:
//   say    — anlatım metni (altyazı olarak gösterilir, açıksa seslendirilir)
//   draw   — tahtaya çizilecek SVG parçası (art.js yardımcılarıyla)
//   clear  — true ise çizimden önce tahta silinir
//   sound  — { note, dur } ya da { melody: ['B4','A4'], bpm } : sahnede çalınacak örnek ses
//   check  — videoyu durduran etkileşimli durak:
//            { type: 'quiz', q, options, answer, explain }
//            { type: 'play', note }            → mikrofonla doğru notayı çal
//            { type: 'listen-any', holdMs }    → herhangi bir sesi tut
//            { type: 'breath', inhale, exhale, rounds } → nefes egzersizi
//
// Çizim yerine gerçek bir video kullanmak için derse `video` alanı ekleyin (README'ye bakın):
//   video: { src: 'videos/ders.mp4', captions: 'videos/ders.vtt', cues: [{ at: 12.5, check: {...} }] }

import {
  text, arrow, air, underline, circleMark, flute, staff, mascot, bubble, bottle,
  embouchure, person, belly, sparkle, musicNote, check, cross, metronome, noteSymbol, group, musicStand, el,
} from '../art.js';

const title = (str, x = 400, y = 70) => text(str, x, y, { size: 50, weight: 700 }) + underline(x - str.length * 11, y + 14, str.length * 22);
/** Nota süresini gösteren vuruş noktaları (yarım vuruş = yarım daire) */
const beatDots = (cx, beats) => {
  const n = Math.max(1, Math.ceil(beats));
  const gap = 18;
  let out = '';
  for (let i = 0; i < n; i++) {
    const bx = cx - ((n - 1) * gap) / 2 + i * gap;
    out += beats < 1
      ? el('path', { d: `M${bx - 7} 236 a7 7 0 0 1 14 0Z`, class: 'ink fill-coral' })
      : el('circle', { cx: bx, cy: 232, r: 7, class: 'ink fill-coral' });
  }
  return group(out);
};

const outro = (msg, say) => ({
  clear: true,
  draw: mascot({ x: 250, y: 275, s: 1.4, mood: 'wink', wave: true }) + bubble(msg, 340, 90, { w: 380, h: 80, size: 30 }) + sparkle(680, 280) + sparkle(720, 240, 0.6) + musicNote(600, 340, 1.2) + musicNote(470, 250, 0.8, 'stroke-coral'),
  say,
});

export const LESSONS = [
  {
    id: 'tanisma',
    teaches: [],
    title: 'Yan Flütle Tanış',
    summary: 'Flütün parçaları ve nasıl tutulduğu',
    scenes: [
      {
        clear: true,
        draw: mascot({ x: 200, y: 268, s: 1.5, wave: true }) + bubble('Merhaba!', 300, 70, { w: 230, h: 76, size: 34 }),
        say: 'Merhaba! Ben Nota. Bugün birlikte yan flüt çalmayı öğreneceğiz.',
      },
      {
        draw: title('Yan Flüt', 600, 250) + musicNote(470, 330, 1.2) + musicNote(700, 350, 1, 'stroke-coral') + sparkle(740, 200),
        say: 'Yan flüt, insanlığın en eski çalgılarından birinin modern hâli. Sesi bir kuş ötüşü kadar parlak!',
      },
      {
        clear: true,
        draw: flute({ x: 80, y: 190, w: 640, parts: true }),
        say: 'Flüt üç parçadan oluşur: baş, gövde ve ayak.',
      },
      {
        draw: circleMark(163, 190, 40, 26) + arrow(220, 90, 172, 160, { bend: 0.2 }) + text('üfleme deliği', 300, 82, { size: 28, cls: 'coral-fill' }),
        say: 'Baş kısmında dudaklığı ve üfleme deliğini görüyorsun. Sesi tam burada üretiyoruz.',
      },
      {
        draw: circleMark(355, 190, 52, 24, 'stroke-teal') + circleMark(504, 190, 52, 24, 'stroke-teal') + text('anahtarlar', 430, 110, { size: 28, cls: 'teal-fill' }),
        say: 'Gövdede parmaklarımızı koyduğumuz anahtarlar var. Anahtarlara basınca flütün içindeki hava sütunu uzar ya da kısalır; böylece farklı notalar çıkar.',
        check: {
          type: 'quiz',
          q: 'Sesi flütün hangi kısmında üretiyoruz?',
          options: ['Baş kısmındaki üfleme deliğinde', 'Gövdedeki anahtarlarda', 'Ayak kısmında'],
          answer: 0,
          explain: 'Ses, üfleme deliğinin kenarına çarpan hava akımıyla oluşur. Anahtarlar yalnızca notayı değiştirir.',
        },
      },
      {
        clear: true,
        draw: person(470, 120, 1) + musicStand(690, 120, 0.85) + arrow(300, 92, 150, 108, { bend: 0.1, cls: 'stroke-coral thick' }) + text('sağ tarafına doğru', 225, 76, { size: 28, cls: 'coral-fill' }),
        say: 'Flütü yere paralel ve sağ tarafına doğru tutarız. Karşıdan bakınca flüt sola uzanıyor gibi görünür. Adı da buradan gelir: yan flüt!',
        check: {
          type: 'quiz',
          q: 'Yan flüt hangi yöne doğru tutulur?',
          options: ['Sağa doğru, yatay', 'Sola doğru, yatay', 'Aşağıya doğru, blok flüt gibi'],
          answer: 0,
          explain: 'Yan flüt sağ tarafa doğru, yatay tutulur.',
        },
      },
      outro('İlk ders tamam!', 'Harika! İlk dersi bitirdin. Sırada ilk sesimizi çıkarmak var.'),
    ],
  },

  {
    id: 'ilk-ses',
    teaches: [],
    title: 'İlk Ses: Şişe Gibi Üfle',
    summary: 'Dudak pozisyonu ve ilk ses',
    scenes: [
      {
        clear: true,
        draw: mascot({ x: 110, y: 150, s: 0.7, mood: 'blow' }) + bottle(330, 120, 1.05) + air(150, 118, 160),
        say: 'Boş bir şişenin ağzına yandan üflediğinde "huuu" diye bir ses çıktığını hiç fark ettin mi?',
      },
      {
        draw: text('huuu!', 520, 160, { size: 54, cls: 'teal-fill', weight: 700 }) + musicNote(480, 260, 1.3) + musicNote(620, 230, 1, 'stroke-coral'),
        sound: { note: 'A4', dur: 1.6 },
        say: 'İşte flüt de tam olarak böyle çalışır. Havayı deliğin içine değil, karşı kenarına üflüyoruz.',
      },
      {
        clear: true,
        draw: embouchure(150, 30, 1.1) + text('dudaklar', 560, 150, { size: 26 }) + arrow(510, 156, 418, 200, { bend: -0.15 }) + text('flütün kesiti', 650, 300, { size: 26 }) + arrow(580, 296, 484, 300, { bend: 0.1 }) + text('üfleme deliği', 620, 250, { size: 22, cls: 'muted-fill' }) + arrow(560, 250, 428, 254, { bend: -0.1, cls: 'ink thin' }),
        say: 'Dudaklarını hafifçe gerip "pu" der gibi küçük bir açıklık bırak. Yanakların şişmesin.',
      },
      {
        draw:
          arrow(392, 214, 422, 248, { cls: 'stroke-sky thick' }) +
          arrow(424, 252, 428, 296, { cls: 'stroke-sky thick' }) +
          arrow(426, 250, 520, 214, { cls: 'stroke-sky thick' }) +
          text('yarısı içeri', 340, 340, { size: 26, cls: 'sky-fill' }) +
          text('yarısı dışarı', 600, 205, { size: 26, cls: 'sky-fill' }),
        say: 'Hava akımı deliğin karşı kenarına çarpar ve ikiye ayrılır: yarısı flütün içine, yarısı dışarıya gider. Ses bu titreşimden doğar.',
        check: {
          type: 'quiz',
          q: 'Havayı nereye üflemeliyiz?',
          options: ['Deliğin karşı kenarına', 'Deliğin tam içine, sertçe', 'Delikten uzağa, havaya'],
          answer: 0,
          explain: 'Hava akımı kenara çarpıp ikiye bölündüğünde ses oluşur.',
        },
      },
      {
        clear: true,
        draw: flute({ x: 80, y: 220, w: 640, highlight: ['head', 'hole'] }) + text('Önce sadece baş kısmıyla dene', 400, 90, { size: 34 }) + mascot({ x: 140, y: 140, s: 0.55, mood: 'blow' }) + air(166, 148, 40, { lines: 2, gap: 8 }) + arrow(206, 160, 178, 202, { cls: 'stroke-sky thick' }),
        say: 'Şimdi sıra sende! Önce sadece baş kısmını al, dudaklığı alt dudağının hemen altına yasla ve uzun, sakin bir ses çıkarmayı dene.',
        check: { type: 'listen-any', holdMs: 1000 },
      },
      outro('Ses var!', 'Bravo! İlk sesini çıkardın. Ses çıkmazsa dert etme; dudak açıklığını ve flütün açısını azar azar değiştirerek dene.'),
    ],
  },

  {
    id: 'nefes',
    teaches: [],
    title: 'Nefes ve Duruş',
    summary: 'Karın nefesi ve doğru duruş',
    scenes: [
      {
        clear: true,
        draw:
          belly(240, 74, 1.2) + arrow(296, 295, 370, 295) + arrow(184, 295, 110, 295) +
          text('akciğerler', 500, 176, { size: 28 }) + arrow(430, 170, 318, 190, { bend: 0.1 }) +
          text('diyafram', 500, 236, { size: 28, cls: 'teal-fill' }) + arrow(440, 232, 316, 246, { bend: 0.1 }) +
          text('karın balonu', 500, 304, { size: 30, cls: 'coral-fill' }),
        say: 'Flüt çalarken nefesimizi göğsümüze değil, karnımıza alırız. Karnını bir balon gibi düşün.',
      },
      {
        draw: cross(160, 126) + cross(320, 126) + text('omuzlar kalkmasın', 560, 110, { size: 30 }),
        say: 'Nefes alırken omuzların kalkmasın. Karnın şişsin, sonra havayı yavaş yavaş ve kontrollü bırak.',
        check: { type: 'breath', inhale: 4, exhale: 8, rounds: 2 },
      },
      {
        clear: true,
        draw:
          person(330, 112, 1) +
          check(560, 110) + text('dik dur', 650, 120, { size: 28 }) +
          check(560, 200) + text('omuzlar rahat', 680, 210, { size: 28 }) +
          check(560, 290) + text('dirsekler yanda', 690, 300, { size: 28 }),
        say: 'Duruşa gelelim: Dik dur ya da otur, omuzların rahat olsun. Dirseklerini gövdene yapıştırma; flütü kolların taşısın, başını hafifçe sola çevir.',
        check: {
          type: 'quiz',
          q: 'Doğru nefes nasıl alınır?',
          options: ['Karına, omuzlar rahat', 'Göğse, omuzlar yukarı', 'Hızlı hızlı, kısa kısa'],
          answer: 0,
          explain: 'Karın nefesi sana uzun ve dengeli bir hava akımı sağlar.',
        },
      },
      outro('Hazırsın!', 'Süper! Nefesin ve duruşun hazır. Bir sonraki derste ilk notamızı öğreniyoruz.'),
    ],
  },

  {
    id: 'si',
    teaches: ['B4'],
    title: 'İlk Nota: Si',
    summary: 'Si notasının parmak pozisyonu',
    scenes: [
      {
        clear: true,
        draw: title('Si', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'B4', labels: true, highlight: ['th', 'l1'] }),
        say: 'İlk notamız Si! Sol başparmağını alttaki başparmak anahtarına, sol işaret parmağını ilk anahtara koy.',
      },
      {
        draw: arrow(680, 330, 626, 284, { bend: -0.2 }) + text('sağ serçe parmak', 660, 362, { size: 26, cls: 'coral-fill' }),
        say: 'Sağ serçe parmağın Mi bemol anahtarına bassın. Bu anahtar flütü dengede tutar ve neredeyse bütün notalarda basılı kalır.',
      },
      {
        clear: true,
        draw: staff({ x: 200, y: 120, w: 400, sp: 24, notes: ['B4'] }) + arrow(620, 320, 490, 180, { bend: 0.2 }) + text('3. çizgi', 640, 350, { size: 30, cls: 'coral-fill' }),
        sound: { note: 'B4', dur: 1.8 },
        say: 'Porte üzerinde Si, ortadaki üçüncü çizginin üzerinde durur. Nasıl duyulduğunu dinle.',
      },
      {
        say: 'Şimdi sen çal! Si notasını uzun ve sakin bir şekilde tut.',
        check: { type: 'play', note: 'B4' },
      },
      outro('İlk notan: Si!', 'Tebrikler, ilk notanı çaldın! Sırada nota süreleri var: Si notasını kısa ve uzun çalmayı öğreneceğiz.'),
    ],
  },

  {
    id: 'la-sol',
    teaches: ['A4', 'G4'],
    title: 'La ve Sol',
    summary: 'İki yeni nota ve ilk ezgi',
    scenes: [
      {
        clear: true,
        draw: title('La', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'A4', labels: true, highlight: ['l2'] }),
        sound: { note: 'A4', dur: 1.6 },
        say: "Si'nin parmaklarına sol orta parmağını eklersen La çıkar.",
        check: { type: 'play', note: 'A4' },
      },
      {
        clear: true,
        draw: title('Sol', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'G4', labels: true, highlight: ['l3'] }),
        sound: { note: 'G4', dur: 1.6 },
        say: 'Bir parmak daha: sol yüzük parmağını da kapat. İşte Sol!',
        check: { type: 'play', note: 'G4' },
      },
      {
        clear: true,
        draw: staff({ x: 120, y: 120, w: 560, sp: 24, notes: ['B4', 'A4', 'G4'] }) + text('Si', 330, 330, { size: 32 }) + text('La', 470, 330, { size: 32 }) + text('Sol', 610, 330, { size: 32 }),
        sound: { melody: ['B4', 'A4', 'G4'], bpm: 70 },
        say: 'Üç notayı sırayla dinle: Si, La, Sol. Parmakların bir merdivenden iniyor gibi.',
        check: {
          type: 'quiz',
          q: 'Sol notası için sol elinde kaç parmak kapalı? (başparmak hariç)',
          options: ['3', '2', '1'],
          answer: 0,
          explain: 'Sol için sol elin işaret, orta ve yüzük parmakları kapalı.',
        },
      },
      outro('Şarkı zamanı!', 'Artık üç nota biliyorsun! Önce Salıncak ve Merdiven ile ısın, sonra Sıcak Çörekler’i çal.'),
    ],
  },

  {
    id: 'do-re',
    teaches: ['C5', 'D5'],
    title: 'İnce Do ve İnce Re',
    summary: 'Başparmağı kaldırmayı öğren',
    scenes: [
      {
        clear: true,
        draw: title('İnce Do', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'C5', labels: true, highlight: ['th', 'l1'] }) + cross(296, 262, 0.6),
        sound: { note: 'C5', dur: 1.6 },
        say: 'Daha ince notalara çıkalım. İnce Do için yalnızca sol işaret parmağın ve sağ serçe parmağın basılı. Başparmağını kaldır!',
        check: { type: 'play', note: 'C5' },
      },
      {
        clear: true,
        draw: title('İnce Re', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'D5', labels: true, highlight: ['l1', 'eb'] }),
        sound: { note: 'D5', dur: 1.6 },
        say: 'İnce Re biraz farklı: sol işaret parmağını kaldır, diğer parmakların hepsini kapat. Sağ serçe parmak bu sefer havada.',
        check: { type: 'play', note: 'D5' },
      },
      {
        clear: true,
        draw: staff({ x: 90, y: 130, w: 620, sp: 22, notes: ['G4', 'A4', 'B4', 'C5', 'D5'] }) + arrow(250, 350, 640, 280, { bend: 0.1, cls: 'stroke-teal thick' }),
        sound: { melody: ['G4', 'A4', 'B4', 'C5', 'D5'], bpm: 90 },
        say: 'Artık beş nota biliyorsun: Sol, La, Si, Do ve Re! Porte üzerinde bir merdiven gibi yükseliyorlar.',
        check: {
          type: 'quiz',
          q: 'İnce Re çalarken hangi parmak havada kalır?',
          options: ['Sol işaret parmağı', 'Sol başparmak', 'Sağ yüzük parmağı'],
          answer: 0,
          explain: 'İnce Re’de sol işaret parmağı (ve sağ serçe parmak) kalkar.',
        },
      },
      outro('3 yeni şarkı!', 'Harika! Önce kısa Tembel Çocuk şarkısını dene, sonra Küçük Kuzu ve Neşeye Övgü’yü çalabilirsin.'),
    ],
  },

  {
    id: 'ritim',
    teaches: [],
    title: 'Nota Süreleri',
    summary: 'Birlik, ikilik, dörtlük, sekizlik',
    scenes: [
      {
        clear: true,
        draw: metronome(210, 205, 1.3) + text('1 - 2 - 3 - 4', 530, 220, { size: 48, weight: 700 }) + group([440, 500, 560, 620].map((bx, i) => el('circle', { cx: bx + 12, cy: 262, r: i === 0 ? 9 : 6, class: i === 0 ? 'ink fill-coral' : 'ink paper' })).join('')),
        say: 'Müzikte her notanın bir süresi vardır. Bu süreyi eşit vuruşlarla sayarız: bir, iki, üç, dört.',
      },
      {
        clear: true,
        draw:
          group(noteSymbol(170, 175, 30, 'whole')) + beatDots(170, 4) + text('birlik', 170, 290, { size: 30 }) + text('4 vuruş', 170, 330, { size: 24, cls: 'muted-fill' }) +
          group(noteSymbol(330, 175, 30, 'half')) + beatDots(330, 2) + text('ikilik', 330, 290, { size: 30 }) + text('2 vuruş', 330, 330, { size: 24, cls: 'muted-fill' }),
        sound: { melody: ['B4'], bpm: 25 },
        say: 'Birlik nota içi boş bir yuvarlaktır ve dört vuruş sürer. İkilik notanın bir sapı vardır ve iki vuruş sürer.',
      },
      {
        draw:
          group(noteSymbol(490, 175, 30, 'quarter')) + beatDots(490, 1) + text('dörtlük', 490, 290, { size: 30 }) + text('1 vuruş', 490, 330, { size: 24, cls: 'muted-fill' }) +
          group(noteSymbol(640, 175, 30, 'eighth')) + beatDots(640, 0.5) + text('sekizlik', 640, 290, { size: 30 }) + text('yarım vuruş', 640, 330, { size: 24, cls: 'muted-fill' }),
        sound: { melody: ['B4', 'B4', 'B4', 'B4'], bpm: 100 },
        say: 'Dörtlük nota içi dolu ve sapılıdır, bir vuruş sürer. Sekizliğin bir de bayrağı vardır, yarım vuruş sürer.',
        check: {
          type: 'quiz',
          q: 'Hangisi en uzun süren notadır?',
          options: ['Birlik', 'Dörtlük', 'Sekizlik'],
          answer: 0,
          explain: 'Birlik nota dört vuruş sürer.',
        },
      },
      {
        say: 'Bir soru daha!',
        check: {
          type: 'quiz',
          q: 'Bir ikilik nota kaç dörtlük eder?',
          options: ['2', '4', '1'],
          answer: 0,
          explain: 'İkilik 2 vuruş, dörtlük 1 vuruş sürer.',
        },
      },
      outro('Ritim tamam!', 'Süper! Şimdi antrenmanda Si notasını doğru sürelerle çal, sonra Si Treni ile ilk resmini çiz.'),
    ],
  },

  {
    id: 'mi',
    teaches: ['D4', 'E4', 'E5'],
    title: 'Pes Re, Mi ve İnce Mi',
    summary: 'Pes notalar ve oktav atlama',
    scenes: [
      {
        clear: true,
        draw: title('Pes Re', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'D4', labels: true, highlight: ['r1', 'r2', 'r3'] }),
        sound: { note: 'D4', dur: 1.6 },
        say: 'Pes Re için bütün delikleri kapat, sağ serçe parmak havada kalsın. Pes notalarda havayı yavaş ve geniş üfle.',
        check: { type: 'play', note: 'D4' },
      },
      {
        clear: true,
        draw: title('Pes Mi', 400, 70) + flute({ x: 80, y: 230, w: 640, note: 'E4', labels: true, highlight: ['r3', 'eb'] }),
        sound: { note: 'E4', dur: 1.6 },
        say: 'Mi için sağ yüzük parmağını kaldır ve sağ serçe parmağını tekrar Mi bemol anahtarına koy.',
        check: { type: 'play', note: 'E4' },
      },
      {
        clear: true,
        draw:
          staff({ x: 150, y: 140, w: 500, sp: 22, notes: ['E4', 'E5'] }) +
          arrow(330, 260, 500, 150, { bend: -0.3, cls: 'stroke-coral thick' }) +
          text('aynı parmaklar, daha hızlı hava!', 400, 350, { size: 32, cls: 'coral-fill' }),
        sound: { melody: ['E4', 'E5'], bpm: 50 },
        say: 'Şimdi sihirli kısım: Pes Mi’nin parmaklarını bozmadan havayı daha hızlı ve dar üflersen, bir oktav yukarıdaki ince Mi çıkar!',
        check: { type: 'play', note: 'E5' },
      },
      outro('Yıldız şarkısı!', 'Muhteşem! Artık Daha Dün Annemizin şarkısını çalıp gökyüzüne bir yıldız çizebilirsin.'),
    ],
  },
];

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
