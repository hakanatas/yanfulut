// Keman dersleri. Sahne biçimi flüt dersleriyle aynıdır (bkz. js/data/lessons.js).
import { text, arrow, underline, circleMark, staff, mascot, bubble, sparkle, musicNote, check, cross, metronome, noteSymbol, group, el } from '../art.js';
import { violin, bow, fingerboard, violinist, bowHold, contactPoint, bowMarks, rosin } from './art.js';

const title = (str, x = 400, y = 70) => text(str, x, y, { size: 50, weight: 700 }) + underline(x - str.length * 11, y + 14, str.length * 22);
const outro = (msg, say) => ({
  clear: true,
  draw: mascot({ x: 250, y: 275, s: 1.4, mood: 'wink', wave: true }) + bubble(msg, 340, 90, { w: 380, h: 80, size: 30 }) + sparkle(680, 280) + sparkle(720, 240, 0.6) + musicNote(600, 340, 1.2) + musicNote(470, 250, 0.8, 'stroke-coral'),
  say,
});
const beatDots = (cx, beats) => {
  const n = Math.max(1, Math.ceil(beats));
  let out = '';
  for (let i = 0; i < n; i++) {
    const bx = cx - ((n - 1) * 18) / 2 + i * 18;
    out += beats < 1 ? el('path', { d: `M${bx - 7} 236 a7 7 0 0 1 14 0Z`, class: 'ink fill-coral' }) : el('circle', { cx: bx, cy: 232, r: 7, class: 'ink fill-coral' });
  }
  return group(out);
};
/** Parmak yeri şeması + porte + başlık: bir notayı öğreten sahne */
const noteScene = (note, name, say, extra = '') => ({
  clear: true,
  draw: fingerboard(60, 6, 0.95, { note }) + title(name, 520, 64) + staff({ x: 320, y: 180, w: 400, sp: 22, notes: [note] }) + extra,
  sound: { note, dur: 1.8 },
  say,
  check: { type: 'play', note },
});
/** Teli titreşen keman + başlık: boş teli öğreten sahne */
const openString = (id, note, name, say) => ({
  clear: true,
  draw: title(`${name} teli`, 400, 70) + violin(90, 230, 1, { playString: id }) + musicNote(700, 150, 1.1) + musicNote(640, 120, 0.8, 'stroke-coral'),
  sound: { note, dur: 1.8 },
  say,
  check: { type: 'play', note },
});

export const LESSONS = [
  {
    id: 'tanisma',
    title: 'Kemanla Tanış',
    summary: 'Kemanın ve yayın parçaları',
    scenes: [
      {
        clear: true,
        draw: mascot({ x: 200, y: 268, s: 1.5, wave: true }) + bubble('Merhaba!', 300, 70, { w: 230, h: 76, size: 34 }),
        say: 'Merhaba! Ben Nota. Bugün birlikte keman çalmayı öğreneceğiz.',
      },
      {
        draw: title('Keman', 600, 250) + musicNote(480, 330, 1.2) + musicNote(710, 340, 1, 'stroke-coral') + sparkle(740, 200),
        say: 'Keman, telli ve yaylı bir çalgıdır. Sesi, insan sesine en çok benzeyen çalgılardan biri olarak bilinir.',
      },
      {
        clear: true,
        draw: violin(60, 205, 1.05, { parts: true }),
        say: 'Kemanın parçalarını tanıyalım: kıvrım ve burgular, klavye, gövde, eşik, f delikleri, kuyruk ve çenelik.',
      },
      {
        draw: circleMark(491, 205, 30, 46) + circleMark(488, 160, 46, 18, 'stroke-teal'),
        say: 'Dört tel eşiğin üzerinden geçer. Yay teli titreştirir, eşik bu titreşimi gövdeye taşır, gövde de sesi büyütür.',
        check: {
          type: 'quiz',
          q: 'Teller gövdenin üzerinde hangi parçanın üstünden geçer?',
          options: ['Eşik', 'Çenelik', 'Kıvrım'],
          answer: 0,
          explain: 'Eşik telleri yukarıda tutar ve titreşimlerini gövdeye iletir.',
        },
      },
      {
        clear: true,
        draw: bow(110, 120, 1.05, { parts: true }) + rosin(600, 280, 1) + text('reçine', 600, 345, { size: 26, cls: 'coral-fill' }) + arrow(470, 300, 540, 290, { bend: 0.2 }),
        say: 'Bu da yay. Ucu, çubuğu, kılları ve topuğu var. Kıllara reçine sürmezsek yay teli kavrayamaz ve ses çıkmaz.',
        check: {
          type: 'quiz',
          q: 'Yayın kıllarına ne sürülür?',
          options: ['Reçine', 'Su', 'Yağ'],
          answer: 0,
          explain: 'Reçine kıllara tutunma sağlar; böylece yay teli titreştirebilir.',
        },
      },
      outro('İlk ders tamam!', 'Harika! Kemanı ve yayı tanıdın. Sırada kemanı doğru tutmak var.'),
    ],
  },

  {
    id: 'tutus',
    title: 'Kemanı Tutmak',
    summary: 'Duruş ve kemanın omuza yerleşmesi',
    scenes: [
      {
        clear: true,
        draw:
          violinist(230, 130, 1) +
          check(580, 120) + text('keman sol omuzda', 690, 128, { size: 26 }) +
          check(580, 190) + text('çene çenelikte', 680, 198, { size: 26 }),
        say: 'Keman sol omzumuza yerleşir. Çenemizi çeneliğe hafifçe koyarız; kemanı sıkmadan, başımızın ağırlığıyla tutarız.',
      },
      {
        draw: check(580, 260) + text('sol bilek düz', 670, 268, { size: 26 }) + check(580, 330) + text('omuzlar rahat', 676, 338, { size: 26 }),
        say: 'Sol el sapı nazikçe tutar; bilek düz kalır, avuç sapa yapışmaz. Omuzlar rahat, sırt dik.',
        check: {
          type: 'quiz',
          q: 'Keman hangi omza yerleşir?',
          options: ['Sol omza', 'Sağ omza', 'Hiçbirine, kucakta tutulur'],
          answer: 0,
          explain: 'Keman sol omza yerleşir; yay sağ elde durur.',
        },
      },
      outro('Hazırsın!', 'Süper! Kemanı doğru tutmayı öğrendin. Sırada yay tutuşu var.'),
    ],
  },

  {
    id: 'yay',
    title: 'Yay Tutuşu',
    summary: 'Yayı tutmak ve tele dik çekmek',
    scenes: [
      {
        clear: true,
        draw: bowHold(150, 70, 1.3) + text('başparmak bükük', 560, 300, { size: 26, cls: 'coral-fill' }) + arrow(460, 292, 488, 262, { bend: -0.2 }),
        say: 'Yayı tutarken başparmak bükük durur ve ucuyla topuğun hemen önüne dokunur. Diğer parmaklar çubuğun üstünden yumuşakça sarkar.',
      },
      {
        draw: text('serçe parmak yuvarlak', 640, 60, { size: 26, cls: 'teal-fill' }) + arrow(610, 70, 548, 104, { bend: 0.2 }),
        say: 'Serçe parmak yuvarlak durur ve ucuyla çubuğun üstüne konar. Elin gevşek olsun, yayı sıkma.',
        check: {
          type: 'quiz',
          q: 'Yay tutuşunda başparmak nasıl durur?',
          options: ['Bükük', 'Dümdüz ve gergin', 'Çubuğun üstünde'],
          answer: 0,
          explain: 'Bükük başparmak eli esnek tutar; yay rahatça hareket eder.',
        },
      },
      {
        clear: true,
        draw: contactPoint(170, 110, 1.1) + text('tellere dik', 444, 70, { size: 28, cls: 'teal-fill' }) + text('eşik ile klavye arası', 300, 350, { size: 26 }) + cross(548, 316, 0.7) + text('eğik değil', 630, 326, { size: 24, cls: 'coral-fill' }),
        say: 'Yayı eşik ile klavyenin arasından, tellere dik çekeriz. Yay eğik giderse ses cızırtılı olur.',
        check: {
          type: 'quiz',
          q: 'Yay tellere nasıl çekilmeli?',
          options: ['Dik, eşik ile klavye arasından', 'Klavyenin üstünden, eğik', 'Eşiğin üstünden'],
          answer: 0,
          explain: 'Tellere dik ve eşik ile klavye arasından çekilen yay temiz ses verir.',
        },
      },
      outro('Yay hazır!', 'Bravo! Artık yayı tutmayı biliyorsun. Bir sonraki derste ilk seslerimizi çıkaracağız.'),
    ],
  },

  {
    id: 'bos-teller',
    title: 'Boş Teller',
    summary: 'Sol, Re, La ve Mi telleri',
    scenes: [
      {
        clear: true,
        draw:
          fingerboard(50, 6, 0.95, {}) +
          staff({ x: 300, y: 130, w: 460, sp: 20, notes: ['G3', 'D4', 'A4', 'E5'] }) +
          text('Sol', 455, 330, { size: 28 }) + text('Re', 545, 330, { size: 28 }) + text('La', 630, 330, { size: 28 }) + text('Mi', 715, 330, { size: 28 }),
        sound: { melody: ['G3', 'D4', 'A4', 'E5'], bpm: 50 },
        say: 'Kemanın dört teli var: kalından inceye Sol, Re, La ve Mi. Hiçbir parmak basmadan çalınan tele boş tel deriz.',
      },
      openString('A', 'A4', 'La', 'İlk olarak La telini boş çalalım. Yayı La teline koy ve topuktan uca kadar düz çek.'),
      openString('D', 'D4', 'Re', 'Şimdi Re teli. Sağ dirseğini biraz kaldır ki yay yalnızca Re teline değsin.'),
      openString('E', 'E5', 'Mi', 'Mi teli en ince teldir; sesi parlak çıkar. Dirseğini biraz indir ve yayı hafifçe çek.'),
      openString('G', 'G3', 'Sol', 'Son olarak en kalın tel, Sol teli. Dirseğini en yükseğe kaldır ve yayı sakin çek.'),
      outro('Dört tel tamam!', 'Muhteşem! Dört boş teli de çaldın. Sırada parmaklarımızı kullanmak var.'),
    ],
  },

  {
    id: 'la-teli',
    title: 'La Telinde Parmaklar',
    summary: 'Si, Do diyez ve Re',
    scenes: [
      noteScene('B4', 'Si', 'Şimdi parmak basma zamanı. La telinde birinci parmağını ilk bandın üzerine koy: bu nota Si.'),
      noteScene('C#5', 'Do diyez', 'İkinci parmağını, üçüncü parmağın yerine yakın koy; buna yüksek 2 deriz. Bu nota Do diyez.'),
      noteScene('D5', 'İnce Re', 'Üçüncü parmağını ikinci parmağının hemen yanına yapıştır. İşte ince Re!'),
      {
        clear: true,
        draw: staff({ x: 100, y: 120, w: 600, sp: 22, notes: ['A4', 'B4', 'C#5', 'D5'] }) + arrow(230, 340, 640, 270, { bend: 0.1, cls: 'stroke-teal thick' }),
        sound: { melody: ['A4', 'B4', 'C#5', 'D5'], bpm: 80 },
        say: 'La, Si, Do diyez ve Re: dört nota bir merdiven gibi yükseliyor.',
        check: {
          type: 'quiz',
          q: 'Do diyez için ikinci parmak nerede durur?',
          options: ['Üçüncü parmağa yakın (yüksek 2)', 'Birinci parmağa yakın (alçak 2)', 'Hiç basılmaz, boş tel çalınır'],
          answer: 0,
          explain: 'Do diyez yüksek 2 ile çalınır: orta parmak üçüncü parmağa yakın durur.',
        },
      },
      outro('Şarkı zamanı!', 'Artık Sıcak Çörekler ve Küçük Kuzu şarkılarını çalabilirsin. Şarkılar bölümünde notalarla noktaları birleştir!'),
    ],
  },

  {
    id: 're-teli',
    title: 'Re Telinde Parmaklar',
    summary: 'Mi, Fa diyez ve Sol',
    scenes: [
      noteScene('E4', 'Mi', 'Re telinde birinci parmak Mi notasını verir. Parmağını ilk bandın üzerine koy.'),
      noteScene('F#4', 'Fa diyez', 'İkinci parmak yine yüksek: üçüncü parmağın yerine yakın. Bu nota Fa diyez.'),
      noteScene('G4', 'Sol', 'Üçüncü parmağını ikinci parmağının yanına yapıştır: işte Sol!'),
      {
        clear: true,
        draw: staff({ x: 100, y: 120, w: 600, sp: 22, notes: ['D4', 'E4', 'F#4', 'G4', 'A4'] }) + arrow(230, 340, 640, 270, { bend: 0.1, cls: 'stroke-teal thick' }),
        sound: { melody: ['D4', 'E4', 'F#4', 'G4', 'A4'], bpm: 80 },
        say: 'Re, Mi, Fa diyez, Sol ve boş La: Re majör dizinin ilk beş notası!',
        check: {
          type: 'quiz',
          q: 'Re telinde üçüncü parmak hangi notayı verir?',
          options: ['Sol', 'Mi', 'La'],
          answer: 0,
          explain: 'Re telinde 1. parmak Mi, 2. parmak Fa diyez, 3. parmak Sol notasını verir.',
        },
      },
      outro('Yeni şarkı!', 'Harika! Artık Neşeye Övgü şarkısını çalıp bir keman resmi ortaya çıkarabilirsin.'),
    ],
  },

  {
    id: 'ritim',
    title: 'Ritim ve Yay Yönleri',
    summary: 'Nota süreleri, aşağı ve yukarı yay',
    scenes: [
      {
        clear: true,
        draw: metronome(210, 205, 1.3) + text('1 - 2 - 3 - 4', 530, 220, { size: 48, weight: 700 }),
        say: 'Müzikte her notanın bir süresi vardır. Bu süreyi eşit vuruşlarla sayarız: bir, iki, üç, dört.',
      },
      {
        clear: true,
        draw:
          group(noteSymbol(170, 175, 30, 'whole')) + beatDots(170, 4) + text('birlik', 170, 290, { size: 30 }) +
          group(noteSymbol(330, 175, 30, 'half')) + beatDots(330, 2) + text('ikilik', 330, 290, { size: 30 }) +
          group(noteSymbol(490, 175, 30, 'quarter')) + beatDots(490, 1) + text('dörtlük', 490, 290, { size: 30 }) +
          group(noteSymbol(640, 175, 30, 'eighth')) + beatDots(640, 0.5) + text('sekizlik', 640, 290, { size: 30 }),
        sound: { melody: ['A4', 'A4', 'A4', 'A4'], bpm: 100 },
        say: 'Birlik dört vuruş, ikilik iki vuruş, dörtlük bir vuruş, sekizlik ise yarım vuruş sürer. Uzun notada yayı yavaş, kısa notada hızlı çekeriz.',
      },
      {
        clear: true,
        draw:
          bowMarks(250, 120, 1.6) + text('aşağı yay', 285, 230, { size: 30 }) + text('yukarı yay', 525, 230, { size: 30, cls: 'teal-fill' }) +
          bow(150, 280, 0.6) + arrow(250, 330, 450, 330, { cls: 'stroke-coral thick' }) + text('topuktan uca', 350, 360, { size: 22, cls: 'coral-fill' }),
        say: 'Kemanda yayın yönü de yazılır. Kapı gibi olan işaret aşağı yay demek: yayı topuktan uca doğru çekeriz. V işareti ise yukarı yay: uçtan topuğa doğru iteriz.',
        check: {
          type: 'quiz',
          q: 'V işareti ne demek?',
          options: ['Yukarı yay: uçtan topuğa', 'Aşağı yay: topuktan uca', 'Dur, çalma'],
          answer: 0,
          explain: 'V yukarı yay, kapı biçimli işaret aşağı yay demektir.',
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
      outro('Ritim tamam!', 'Süper! Şarkılarda hem nota sürelerine hem de yay yönlerine dikkat et.'),
    ],
  },

  {
    id: 'mi-teli',
    title: 'Mi Telinde Parmaklar',
    summary: 'Fa diyez, Sol diyez ve La',
    scenes: [
      noteScene('F#5', 'İnce Fa diyez', 'Mi telinde birinci parmak ince Fa diyez notasını verir.'),
      noteScene('G#5', 'İnce Sol diyez', 'İkinci parmak yine yüksek: üçüncü parmağın yerine yakın. Bu nota ince Sol diyez.'),
      noteScene('A5', 'İnce La', 'Üçüncü parmağını ikinci parmağının yanına koy: ince La. Boş La telinden tam bir oktav yukarıda!'),
      outro('Yıldız şarkısı!', 'Muhteşem! Artık Daha Dün Annemizin şarkısını çalıp gökyüzüne bir yıldız çizebilirsin.'),
    ],
  },
];
