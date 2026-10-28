// "Egzersiz Yap": çalışma kağıdındaki (Ünite 1–5) egzersizler, satır satır.
// Nokta birleştirme yok; amaç notayı ve süresini doğru çalmak.
//
// Yazım: her satır bir dizgedir; "|" ölçü çizgisi, "||" çift çizgi.
//   B4:2   Si, 2 vuruş (4 birlik, 3 noktalı ikilik, 2 ikilik, 1 dörtlük)
//   R:2    2 vuruşluk sus (ölçünün tamamı kadar sus, tam ölçü susu olarak çizilir)
//   B4:2!  korona (𝄐): nota yazılandan uzun tutulur
//   A4~    bağ: sonraki aynı notaya bağlanır, dil vurmadan tek nota gibi çalınır
//   B4:.5  sekizlik, B4:1.5 noktalı dörtlük, R:.5 sekizlik sus
// Kağıttaki egzersizlerin ardından her ünitede aynı notalar ve ritimlerle ek alıştırmalar ve telif
// süresi dolmuş geleneksel ezgiler var.
// Her ünite yeni notalarını "newNotes" ile tanıtır; egzersizler yalnızca o üniteye kadar tanıtılan
// notaları kullanır (tools/check-course.mjs denetler).

export const SOURCE = 'Learn As You Play Flute çalışma kağıdı, Ünite 1–5; ek alıştırmalar, Ünite 6–7 ve geleneksel ezgiler uygulamaya özgüdür';

export const UNITS = [
  {
    id: 'unite-1',
    title: 'Ünite 1',
    subtitle: 'Sol, La, Si, ince Do · ikilik ve dörtlük',
    newNotes: ['G4', 'A4', 'B4', 'C5'],
    concepts: [
      { sym: '𝅗𝅥', title: 'İkilik nota', text: 'İçi boş, saplı nota: 2 vuruş tutulur. "Bir-iki" diye sayarken ses kesilmez.' },
      { sym: '♩', title: 'Dörtlük nota', text: 'İçi dolu, saplı nota: 1 vuruş. Her notayı "tu" diyerek dille ayrı başlat.' },
      { sym: '4/4', title: 'Dört dörtlük ölçü', text: 'Her ölçüde 4 vuruş var. Ölçü çizgileri vuruşları dörder dörder ayırır.' },
    ],
    exercises: [
      { id: 'u1-e1', title: 'Egzersiz 1', focus: 'Si ve La ikilikleri', time: 4, bpm: 72, rows: ['B4:2 B4:2 | A4:2 A4:2 | B4:2 B4:2 | A4:2 A4:2 | B4:2 B4:2'] },
      { id: 'u1-e2', title: 'Egzersiz 2', focus: 'Si ve ince Do ikilikleri', time: 4, bpm: 72, rows: ['B4:2 B4:2 | C5:2 C5:2 | B4:2 B4:2 | C5:2 C5:2 | B4:2 B4:2'] },
      {
        id: 'u1-e3',
        title: 'Egzersiz 3',
        focus: 'Dört nota, ikiliklerle',
        time: 4,
        bpm: 72,
        rows: ['B4:2 A4:2 | G4:2 A4:2 | B4:2 B4:2 || C5:2 B4:2 | A4:2 B4:2 | C5:2 C5:2', 'B4:2 A4:2 | G4:2 A4:2 | B4:2 C5:2 | B4:2 A4:2 | G4:2 G4:2'],
      },
      {
        id: 'u1-e4',
        title: 'Egzersiz 4',
        focus: 'Dörtlükler: her vuruşa bir nota',
        time: 4,
        bpm: 76,
        rows: ['B4 B4 A4 A4 | G4 G4 A4 A4 | B4 B4 C5 C5 | A4:2 A4:2', 'C5 C5 B4 B4 | A4 A4 B4 B4 | A4 A4 G4 G4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e5',
        title: 'Egzersiz 5',
        focus: 'İkilik ve dörtlük karışık',
        time: 4,
        bpm: 76,
        rows: ['G4:2 A4 B4 | A4:2 B4 C5 | B4:2 G4 B4 | A4:2 A4:2', 'C5:2 A4 C5 | B4:2 G4 B4 | A4:2 B4 A4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e6',
        title: 'Egzersiz 6',
        focus: 'Sol ve La: pes notalarda dolgun ses',
        time: 4,
        bpm: 72,
        rows: ['G4:2 A4:2 | G4:2 A4:2 | G4 A4 G4 A4 | G4:2 G4:2', 'A4:2 G4:2 | A4 G4 A4 G4 | A4 A4 G4 G4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e7',
        title: 'Egzersiz 7',
        focus: 'Basamak basamak: Sol\'dan ince Do\'ya çık ve in',
        time: 4,
        bpm: 76,
        rows: ['G4 A4 B4 C5 | B4 A4 G4:2 | G4 A4 B4 C5 | C5:2 C5:2', 'C5 B4 A4 G4 | A4 B4 C5:2 | C5 B4 A4 G4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e8',
        title: 'Egzersiz 8',
        focus: 'Atlamalar: Sol–Si ve La–ince Do',
        time: 4,
        bpm: 72,
        rows: ['G4 B4 G4 B4 | A4 C5 A4 C5 | G4 B4 A4 C5 | B4:2 B4:2', 'C5 A4 C5 A4 | B4 G4 B4 G4 | C5 A4 B4 G4 | G4:2 G4:2'],
      },
      {
        id: 'u1-e9',
        title: 'Egzersiz 9',
        focus: 'Yankı: aynı kalıp farklı notalardan',
        time: 4,
        bpm: 80,
        rows: ['G4 A4 B4:2 | A4 B4 C5:2 | B4 A4 G4:2 | A4:2 A4:2', 'C5 B4 A4:2 | B4 A4 G4:2 | A4 B4 C5 A4 | G4:2 G4:2'],
      },
      {
        id: 'u1-corek',
        title: 'Sıcak Çörekler',
        focus: 'Geleneksel İngiliz ezgisi (Hot Cross Buns) · üç nota',
        time: 4,
        bpm: 80,
        rows: ['B4 A4 G4:2 | B4 A4 G4:2 | G4 G4 G4 G4 | A4 A4 A4 A4', 'B4 A4 G4:2 | B4 A4 G4:2 | G4 G4 A4 A4 | B4 A4 G4:2'],
      },
      {
        id: 'u1-ninni',
        title: 'Saint Margarita Ninnisi',
        focus: 'Geleneksel Fransız ezgisi · orta hızda',
        time: 4,
        bpm: 80,
        rows: ['B4:2 A4 G4 | B4:2 G4:2 | B4 C5 B4 A4 | B4:2 G4:2', 'B4 C5 B4 A4 | G4 B4 A4:2 | B4 C5 B4 A4 | G4:2 G4:2'],
      },
      {
        id: 'u1-gece',
        title: 'Gece Şarkısı',
        focus: 'Geleneksel Fransız ezgisi (Chanson de nuit) · oldukça yavaş',
        time: 4,
        bpm: 66,
        rows: ['B4:2 G4:2 | B4 B4 G4:2 | A4 B4 C5 B4 | A4 A4 B4 G4', 'B4:2 G4:2 | B4 B4 G4:2 | A4 B4 C5 B4 | A4 A4 G4:2'],
      },
    ],
  },
  {
    id: 'unite-2',
    title: 'Ünite 2',
    subtitle: 'Korona, sus işaretleri ve 3/4 ölçü',
    newNotes: [],
    concepts: [
      { sym: '𝄐', title: 'Korona (durak)', text: 'Notanın üstündeki yay ve nokta: vuruş durur, notayı yazılandan daha uzun tutarsın. Burada ilk notayı rahatça bulman için kullanılıyor.' },
      { sym: '𝄽', title: 'Dörtlük sus', text: '1 vuruş sessizlik. Susarken de saymaya devam et.' },
      { sym: '𝄼', title: 'İkilik sus', text: '2 vuruş sessizlik: üçüncü çizginin üstüne oturan küçük kutu.' },
      { sym: '3/4', title: 'Üç dörtlük ölçü', text: 'Her ölçüde 3 vuruş: "bir-iki-üç, bir-iki-üç".' },
    ],
    exercises: [
      {
        id: 'u2-e1',
        title: 'Egzersiz 1',
        focus: 'Dörtlük sus ile nefes al',
        time: 4,
        bpm: 76,
        rows: ['B4:2! R:2 || B4 A4 B4 R:1 | A4 B4 A4 R:1 | A4 B4 C5 R:1', 'B4:2 R:2 | C5 B4 A4 R:1 | B4 A4 G4 R:1 | A4 B4 A4 R:1 | G4:2 R:2'],
      },
      {
        id: 'u2-e2',
        title: 'Egzersiz 2',
        focus: '3/4 ölçü: üçer vuruş',
        time: 3,
        bpm: 80,
        rows: ['B4:2! R:1 || B4 A4 B4 | A4:2 R:1 | A4 B4 C5', 'B4:2 R:1 | B4 A4 G4 | A4:2 R:1 | A4 B4 A4 | G4:2 R:1'],
      },
      {
        id: 'u2-e3',
        title: 'Egzersiz 3',
        focus: 'İkilik sus: iki vuruş say',
        time: 4,
        bpm: 76,
        rows: ['B4:2! R:2 || B4 A4 B4 A4 | G4:2 R:2 | A4 B4 C5 B4', 'A4:2 R:2 | G4 A4 B4 C5 | B4:2 R:2 | B4 A4 B4 A4 | G4:2 R:2'],
      },
      {
        id: 'u2-e4',
        title: 'Egzersiz 4',
        focus: '3/4: ikilik ve dörtlük',
        time: 3,
        bpm: 80,
        rows: ['B4:2! R:1 || G4:2 A4 | B4:2 C5 | B4:2 A4 | G4:2 R:1', 'A4:2 B4 | C5:2 B4 | A4:2 G4 | A4:2 R:1 | G4:2 R:1'],
      },
      {
        id: 'u2-e5',
        title: 'Egzersiz 5',
        focus: 'Sus ile başlayan ölçüler: "bir"de sus, "iki"de çal',
        time: 4,
        bpm: 76,
        rows: ['B4:2! R:2 || R:1 B4 A4 G4 | R:1 A4 B4 C5 | R:1 C5 B4 A4 | B4:2 R:2', 'R:2 G4 A4 | B4:2 R:2 | R:2 A4 B4 | G4:2 R:2'],
      },
      {
        id: 'u2-e6',
        title: 'Egzersiz 6',
        focus: 'Vals: bir-iki-üç, ilk vuruş güçlü',
        time: 3,
        bpm: 84,
        rows: ['G4 B4 B4 | A4 C5 C5 | B4 A4 G4 | A4:2 R:1', 'G4 B4 B4 | A4 C5 C5 | B4 A4 B4 | G4:2 R:1'],
      },
      {
        id: 'u2-ton',
        title: 'Uzun Ses Çalışması',
        focus: 'Her korona notasını dolgun ve eşit bir sesle tut',
        time: 4,
        bpm: 66,
        rows: ['B4:2! R:2 || A4:2! R:2 || C5:2! R:2 || A4:2! R:2', 'G4:2! R:2 || B4:2! R:2 || A4:2! R:2'],
      },
    ],
  },
  {
    id: 'unite-3',
    title: 'Ünite 3',
    subtitle: 'Fa ve pes Mi · noktalı ikilik ve birlik',
    newNotes: ['F4', 'E4'],
    concepts: [
      { sym: '𝅗𝅥.', title: 'Noktalı ikilik', text: 'Notanın yanındaki nokta, süresine yarısını ekler: 2 + 1 = 3 vuruş.' },
      { sym: '𝅝', title: 'Birlik nota', text: 'İçi boş, sapsız nota: 4 vuruş, 4/4\'te ölçünün tamamı. Sonuna kadar havayı eşit ver.' },
      { sym: 'Fa', title: 'Fa', text: 'Sol el üç parmak kapalı, sağ el yalnızca işaret parmağı kapalı; sağ serçe Mi♭ anahtarında.' },
      { sym: 'Mi', title: 'Pes Mi', text: 'Fa\'ya ek olarak sağ orta parmağı da kapat. Havayı yavaş ve geniş üfle.' },
    ],
    exercises: [
      {
        id: 'u3-e1',
        title: 'Egzersiz 1',
        focus: 'Noktalı ikilik: 3 vuruş tut',
        time: 4,
        bpm: 76,
        rows: ['F4:2! R:2 || A4:3 R:1 | G4:3 R:1 | F4:3 R:1 | G4:3 R:1 | F4:3 R:1', 'G4:3 R:1 | A4:3 R:1 | C5:3 R:1 | G4:3 R:1 | A4:3 R:1 | F4:3 R:1'],
      },
      {
        id: 'u3-e2',
        title: 'Egzersiz 2',
        focus: 'Aynı notayı dille ayır',
        time: 4,
        bpm: 76,
        rows: ['F4:2! R:2 || A4 A4 A4 R:1 | G4 G4 G4 R:1 | F4 F4 F4 R:1', 'G4:3 R:1 | F4 F4 F4 R:1 | A4 A4 A4 R:1 | G4 G4 G4 R:1 | F4:4'],
      },
      {
        id: 'u3-e3',
        title: 'Egzersiz 3',
        focus: 'Pes Mi ile tanış',
        time: 4,
        bpm: 72,
        rows: ['E4:2! R:2 || F4:3 A4 | G4:3 C5 | A4 F4 E4 F4', 'G4:3 R:1 | G4:3 C5 | A4:3 F4 | E4 A4 G4 G4 | F4:4'],
      },
      {
        id: 'u3-e4',
        title: 'Egzersiz 4',
        focus: 'Beş nota dörtlüklerle',
        time: 4,
        bpm: 76,
        rows: ['E4:2! R:2 || A4 G4 F4 E4 | F4 G4 A4 F4 | G4 F4 E4 F4', 'G4:3 R:1 | F4 E4 F4 G4 | A4 C5 A4 F4 | E4 F4 G4 G4 | F4:4'],
      },
      {
        id: 'u3-e5',
        title: 'Egzersiz 5',
        focus: 'Mi–Fa–Sol: pes notalar arasında küçük adımlar',
        time: 4,
        bpm: 72,
        rows: ['E4:2! R:2 || E4 F4 G4:2 | F4 G4 A4:2 | G4 F4 E4:2 | F4:4', 'G4 F4 E4 F4 | G4:3 R:1 | A4 G4 F4 G4 | E4:4'],
      },
      {
        id: 'u3-e6',
        title: 'Egzersiz 6',
        focus: 'Noktalı ikilik + dörtlük: 3 tut, 1 çal',
        time: 4,
        bpm: 76,
        rows: ['F4:3 G4 | A4:3 B4 | C5:3 A4 | G4:4', 'A4:3 G4 | F4:3 E4 | F4:3 G4 | F4:4'],
      },
      {
        id: 'u3-e7',
        title: 'Egzersiz 7',
        focus: 'Mi\'den ince Do\'ya: altı notanın hepsi',
        time: 4,
        bpm: 80,
        rows: ['E4 F4 G4 A4 | B4 C5 B4 A4 | G4 F4 E4 F4 | G4:2 R:2', 'C5 B4 A4 G4 | F4 E4 F4 G4 | A4 B4 C5 A4 | G4:2 E4:2', 'F4 A4 G4 B4 | A4 C5 B4 G4 | A4 F4 G4 E4 | F4:4'],
      },
      {
        id: 'u3-ay',
        title: 'Ay Işığında',
        focus: 'Geleneksel Fransız ezgisi (Au clair de la lune) · birlik notalar',
        time: 4,
        bpm: 80,
        rows: ['F4 F4 F4 G4 | A4:2 G4:2 | F4 A4 G4 G4 | F4:4', 'F4 F4 F4 G4 | A4:2 G4:2 | F4 A4 G4 G4 | F4:4'],
      },
      {
        id: 'u3-koral',
        title: 'Koral Ezgisi',
        focus: '16. yüzyıl Alman ezgisi · koronalarda nefes al',
        time: 4,
        pickup: 1,
        bpm: 76,
        rows: ['C5 | B4 A4 B4 G4 | A4 B4 C5! C5 | C5 G4 G4 E4 | G4 F4 E4! E4', 'A4 A4 G4 B4 | C5 A4 G4! C5 | B4 A4 G4 C5 | C5 B4 C5!'],
      },
    ],
  },
  {
    id: 'unite-4',
    title: 'Ünite 4',
    subtitle: 'Tam ölçü sus, bağ ve 2/4 ölçü',
    newNotes: [],
    concepts: [
      { sym: '𝄻', title: 'Tam ölçü sus', text: 'Dördüncü çizgiden sarkan kutu: ölçünün tamamı kadar sus. 4/4\'te 4, 3/4\'te 3, 2/4\'te 2 vuruş say.' },
      { sym: '⁀', title: 'Bağ', text: 'Aynı yükseklikteki iki notayı birleştiren yay: ikinci notayı dille başlatma, tek ve uzun bir nota gibi çal.' },
      { sym: '2/4', title: 'İki dörtlük ölçü', text: 'Her ölçüde 2 vuruş: "bir-iki, bir-iki".' },
    ],
    exercises: [
      {
        id: 'u4-e1',
        title: 'Egzersiz 1',
        focus: '2/4 ölçü ve tam ölçü sus',
        time: 2,
        bpm: 80,
        rows: ['C5! R:1 || C5 B4 | A4 B4 | C5:2 | R:2 | A4 F4 | C5 A4 | G4:2', 'R:2 | F4 E4 | F4 G4 | A4:2 | R:2 | G4 C5 | C5 B4 | C5:2~ | C5 R:1'],
      },
      {
        id: 'u4-e2',
        title: 'Egzersiz 2',
        focus: '3/4 ölçüde bağlı notalar',
        time: 3,
        bpm: 80,
        rows: ['C5:2! R:1 || C5 A4 F4 | G4:2 A4~ | A4 G4 G4 | F4:3', 'R:3 | C5 A4 F4 | G4:2 A4~ | A4 C5 C5 | F4:3'],
      },
      {
        id: 'u4-e3',
        title: 'Egzersiz 3',
        focus: 'Bağ: ikinci notada dil vurma',
        time: 4,
        bpm: 80,
        rows: ['C5:2! R:2 || C5 C5 A4 F4 | E4 G4 E4 G4~ | G4 A4 G4 G4 | F4:2 R:2', 'R:4 | C5 C5 A4 F4 | E4 G4 E4 G4~ | G4 C5 C5 C5 | F4:4'],
      },
      {
        id: 'u4-e4',
        title: 'Egzersiz 4',
        focus: '2/4: kısa ölçüler, "bir-iki" diye say',
        time: 2,
        bpm: 84,
        rows: ['A4 B4 | C5 A4 | G4 F4 | E4 R:1 | F4 G4 | A4 F4 | G4:2 | R:2', 'C5 B4 | A4 G4 | F4 G4 | A4:2 | G4 E4 | F4 G4 | F4:2'],
      },
      {
        id: 'u4-e5',
        title: 'Egzersiz 5',
        focus: 'Ölçü çizgisini aşan bağlar',
        time: 4,
        bpm: 76,
        rows: ['C5:2! R:2 || A4:2 B4 C5~ | C5 B4 A4:2 | G4:2 A4 B4~ | B4 A4 G4:2', 'F4:2 G4 A4~ | A4 G4 F4:2 | E4:2 F4 G4~ | G4:4'],
      },
      {
        id: 'u4-e6',
        title: 'Egzersiz 6',
        focus: '3/4: tam ölçü sus ve bağ',
        time: 3,
        bpm: 80,
        rows: ['C5:2! R:1 || A4 B4 C5 | G4:3 | R:3 | F4 G4 A4 | E4:2 F4~ | F4:3', 'R:3 | A4 G4 F4 | G4:2 A4~ | A4 B4 C5 | A4:3 | F4:3'],
      },
      {
        id: 'u4-ton',
        title: 'Uzun Ses Çalışması',
        focus: 'Üst dudak sabit, alt dudak gevşek; koronayı olabildiğince uzun tut',
        time: 4,
        bpm: 66,
        rows: ['B4:2 A4:2 | B4:2! R:2 || A4:2 G4:2 | A4:2! R:2', 'G4:2 F4:2 | G4:2! R:2 || F4:2 E4:2 | F4:2! R:2'],
      },
    ],
  },
  {
    id: 'unite-5',
    title: 'Ünite 5',
    subtitle: 'Si bemol ve ince Re',
    newNotes: ['Bb4', 'D5'],
    concepts: [
      { sym: '♭', title: 'Bemol', text: 'Bemol işareti notayı yarım ses pesleştirir. Si♭ için Si parmaklarına ek olarak sağ işaret parmağını da kapat.' },
      { sym: 'Re\'', title: 'İnce Re', text: 'Sol işaret parmağı açık; sol orta, yüzük ve sağ elin üç parmağı kapalı. Serçe parmak havada.' },
    ],
    exercises: [
      {
        id: 'u5-e1',
        title: 'Egzersiz 1',
        focus: 'Si bemol ikilikleri',
        time: 4,
        bpm: 72,
        rows: ['Bb4:2! R:2 || A4:2 R:2 | Bb4:2 R:2 | C5:2 R:2 | Bb4:2 R:2', 'C5:2 R:2 | A4:2 R:2 | Bb4:2 R:2 | G4:2 R:2 | F4:4'],
      },
      {
        id: 'u5-e2',
        title: 'Egzersiz 2',
        focus: 'Si bemol dörtlüklerde',
        time: 4,
        bpm: 76,
        rows: ['Bb4:2! R:2 || A4 Bb4 C5 A4 | C5 A4 F4 A4 | C5 A4 F4 A4', 'G4:2 R:2 | E4 G4 Bb4 G4 | Bb4 G4 E4 G4 | Bb4 G4 F4 E4 | F4:4'],
      },
      {
        id: 'u5-e3',
        title: 'Egzersiz 3',
        focus: 'İnce Re\'den aşağı atlamalar',
        time: 4,
        bpm: 72,
        rows: ['D5:2! R:2 || D5:2 C5 R:1! | D5:2 Bb4 R:1! | D5:2 A4 R:1!', 'D5:3 R:1! | D5:2 Bb4 R:1! | D5:2 A4 R:1! | D5:2 G4 R:1! | D5:4'],
      },
      {
        id: 'u5-e4',
        title: 'Egzersiz 4',
        focus: 'Fa majör: Fa\'dan ince Re\'ye',
        time: 4,
        bpm: 76,
        rows: ['F4 G4 A4 Bb4 | C5 D5 C5:2 | D5 C5 Bb4 A4 | G4:2 F4:2', 'F4 A4 C5 A4 | Bb4 D5 C5:2 | Bb4 A4 G4 E4 | F4:4'],
      },
      {
        id: 'u5-e5',
        title: 'Egzersiz 5',
        focus: 'Si mi, Si bemol mü? Parmağı dikkatle değiştir',
        time: 4,
        bpm: 72,
        rows: ['B4:2! R:2 || A4 B4 C5 B4 | A4 Bb4 C5 Bb4 | A4 B4 A4 G4', 'A4 Bb4 A4 G4 | G4 B4 D5 B4 | F4 Bb4 D5 Bb4 | G4:2 B4:2 | A4 Bb4 A4 G4 | G4:4'],
      },
      {
        id: 'u5-yildiz',
        title: 'Küçük Yıldız',
        focus: 'Geleneksel Fransız ezgisi (Ah vous dirai-je, maman) · Fa majör',
        time: 4,
        bpm: 80,
        rows: ['F4 F4 C5 C5 | D5 D5 C5:2 | Bb4 Bb4 A4 A4 | G4 G4 F4:2', 'C5 C5 Bb4 Bb4 | A4 A4 G4:2 | C5 C5 Bb4 Bb4 | A4 A4 G4:2', 'F4 F4 C5 C5 | D5 D5 C5:2 | Bb4 Bb4 A4 A4 | G4 G4 F4:2'],
      },
      {
        id: 'u5-hans',
        title: 'Küçük Hans',
        focus: 'Geleneksel Alman ezgisi (Hänschen klein) · Sol majör',
        time: 4,
        bpm: 84,
        rows: [
          'D5 B4 B4:2 | C5 A4 A4:2 | G4 A4 B4 C5 | D5 D5 D5:2',
          'D5 B4 B4:2 | C5 A4 A4:2 | G4 B4 D5 D5 | G4:4',
          'A4 A4 A4 A4 | A4 B4 C5:2 | B4 B4 B4 B4 | B4 C5 D5:2',
          'D5 B4 B4:2 | C5 A4 A4:2 | G4 B4 D5 D5 | G4:4',
        ],
      },
      {
        id: 'u5-zil',
        title: 'Zil Sesleri',
        focus: 'Jingle Bells nakaratı (J. Pierpont, 1857) · kolay düzenleme',
        time: 4,
        bpm: 88,
        rows: [
          'A4 A4 A4:2 | A4 A4 A4:2 | A4 C5 F4 G4 | A4:4',
          'Bb4 Bb4 Bb4 Bb4 | Bb4 A4 A4 A4 | A4 G4 G4 A4 | G4:2 C5:2',
          'A4 A4 A4:2 | A4 A4 A4:2 | A4 C5 F4 G4 | A4:4',
          'Bb4 Bb4 Bb4 Bb4 | Bb4 A4 A4 A4 | C5 C5 Bb4 G4 | F4:4',
        ],
      },
      {
        id: 'u5-kuzu',
        title: 'Küçük Kuzu',
        focus: 'Geleneksel ezgi (Mary Had a Little Lamb) · Sol majör',
        time: 4,
        bpm: 88,
        rows: ['B4 A4 G4 A4 | B4 B4 B4:2 | A4 A4 A4:2 | B4 D5 D5:2', 'B4 A4 G4 A4 | B4 B4 B4 B4 | A4 A4 B4 A4 | G4:4'],
      },
    ],
  },
  {
    id: 'unite-6',
    title: 'Ünite 6',
    subtitle: 'Pes Re, Fa diyez ve ince Mi · Sol majörde bilindik ezgiler',
    newNotes: ['D4', 'F#4', 'E5'],
    concepts: [
      { sym: 'Re', title: 'Pes Re', text: 'Bütün delikler kapalı, sağ serçe parmak havada (Mi♭ anahtarına basmaz). Havayı yavaş ve geniş üfle.' },
      { sym: '♯', title: 'Fa diyez', text: 'Diyez notayı yarım ses tizleştirir. Fa parmaklarında sağ işaret parmağını kaldır, sağ yüzük parmağını kapat.' },
      { sym: "Mi'", title: 'İnce Mi', text: 'Pes Mi parmaklarıyla, havayı biraz hızlandırıp daraltarak bir oktav yukarı üfle.' },
      { sym: 'G', title: 'Sol majör', text: 'Bu ünitedeki ezgiler Sol majörde: Fa yerine hep Fa diyez gelir, portede notanın yanında ♯ görürsün.' },
      { sym: '♪', title: 'Sekizlik ve noktalı dörtlük', text: 'Sekizlik yarım vuruş. Noktalı dörtlük 1,5 vuruş tutulur, ardından gelen sekizlikle birlikte bir ikilik eder.' },
    ],
    exercises: [
      {
        id: 'u6-e1',
        title: 'Egzersiz 1',
        focus: 'Pes Re\'den yukarı: Re, Mi, Fa diyez, Sol',
        time: 4,
        bpm: 66,
        rows: ['D4:2! R:2 || D4 E4 F#4 G4 | G4 F#4 E4 D4 | D4 F#4 A4 F#4 | D4:4', 'G4 F#4 E4 D4 | E4 F#4 G4 A4 | B4 A4 G4 F#4 | G4:4'],
      },
      {
        id: 'u6-e2',
        title: 'Egzersiz 2',
        focus: 'Sol majör dizisi ve ince Mi',
        time: 4,
        bpm: 72,
        rows: ['G4 A4 B4 C5 | D5 E5 D5:2 | D5 C5 B4 A4 | G4 F#4 G4:2', 'D4 E4 F#4 G4 | A4 B4 C5 D5 | E5 D5 C5 B4 | A4 F#4 G4:2'],
      },
      {
        id: 'u6-e3',
        title: 'Egzersiz 3',
        focus: 'Fa mı, Fa diyez mi? Parmağı dikkatle değiştir',
        time: 4,
        bpm: 72,
        rows: ['F4 G4 F4 E4 | F#4 G4 F#4 E4 | F4 E4 D4:2 | F#4 E4 D4:2', 'D4 F#4 A4 D5 | D5 A4 F#4 D4 | D4 F4 A4 D5 | D5:4'],
      },
      {
        id: 'u6-ciftlik',
        title: 'Ali Baba\'nın Çiftliği',
        focus: 'Geleneksel ezgi (Old MacDonald Had a Farm) · Sol majör',
        time: 4,
        bpm: 96,
        rows: ['G4 G4 G4 D4 | E4 E4 D4:2 | B4 B4 A4 A4 | G4:3 D4', 'G4 G4 G4 D4 | E4 E4 D4:2 | B4 B4 A4 A4 | G4:4'],
      },
      {
        id: 'u6-tembel',
        title: 'Tembel Çocuk',
        focus: 'Geleneksel Fransız ezgisi (Frère Jacques) · sekizlikler',
        time: 4,
        bpm: 88,
        rows: [
          'G4 A4 B4 G4 | G4 A4 B4 G4 | B4 C5 D5:2 | B4 C5 D5:2',
          'D5:.5 E5:.5 D5:.5 C5:.5 B4 G4 | D5:.5 E5:.5 D5:.5 C5:.5 B4 G4 | G4 D4 G4:2 | G4 D4 G4:2',
        ],
      },
      {
        id: 'u6-ordek',
        title: 'Küçük Ördekler',
        focus: 'Geleneksel Alman ezgisi (Alle meine Entchen) · ince Mi',
        time: 4,
        bpm: 88,
        rows: ['G4 A4 B4 C5 | D5:2 D5:2 | E5 E5 E5 E5 | D5:4', 'E5 E5 E5 E5 | D5:4 | C5 C5 C5 C5 | B4:2 B4:2', 'A4 A4 A4 A4 | G4:4'],
      },
      {
        id: 'u6-yankee',
        title: 'Yankee Doodle',
        focus: 'Geleneksel Amerikan ezgisi · pes Re ve Fa diyez',
        time: 4,
        bpm: 100,
        rows: ['G4 G4 A4 B4 | G4 B4 A4 D4 | G4 G4 A4 B4 | G4:2 F#4:2', 'G4 G4 A4 B4 | C5 B4 A4 G4 | F#4 D4 E4 F#4 | G4:2 G4:2'],
      },
      {
        id: 'u6-dogdun',
        title: 'İyi ki Doğdun',
        focus: 'Happy Birthday (Hill kardeşler, 1893) · 3/4, anakruzla başlar',
        time: 3,
        pickup: 1,
        bpm: 90,
        rows: ['D4:.5 D4:.5 | E4 D4 G4 | F#4:2 D4:.5 D4:.5 | E4 D4 A4 | G4:2 D4:.5 D4:.5', 'D5 B4 G4 | F#4 E4 C5:.5 C5:.5 | B4 G4 A4 | G4:2'],
      },
      {
        id: 'u6-londra',
        title: 'Londra Köprüsü',
        focus: 'Geleneksel İngiliz ezgisi (London Bridge) · noktalı dörtlük',
        time: 4,
        bpm: 84,
        rows: ['D5:1.5 E5:.5 D5 C5 | B4 C5 D5:2 | A4 B4 C5:2 | B4 C5 D5:2', 'D5:1.5 E5:.5 D5 C5 | B4 C5 D5:2 | A4:2 D5:2 | B4 G4:2 R:1'],
      },
      {
        id: 'u6-eve-donus',
        title: 'Eve Dönüş',
        focus: 'Dvořák, Yeni Dünya Senfonisi Largo teması (1893) · yavaş ve şarkı gibi',
        time: 4,
        bpm: 60,
        rows: ['B4:1.5 D5:.5 D5:2 | B4:1.5 A4:.5 G4:2 | A4 B4 D5 B4 | A4:4', 'B4:1.5 D5:.5 D5:2 | B4:1.5 A4:.5 G4:2 | A4 B4 A4 G4 | G4:4'],
      },
      {
        id: 'u6-grace',
        title: 'Amazing Grace',
        focus: 'Geleneksel ilahi ezgisi (New Britain) · 3/4, bağ ve sekizlikler',
        time: 3,
        pickup: 1,
        bpm: 76,
        rows: [
          'D4 | G4:2 B4:.5 G4:.5 | B4:2 A4 | G4:2 E4 | D4:2 D4',
          'G4:2 B4:.5 G4:.5 | B4:2 A4 | D5:3~ | D5:2 B4',
          'D5:1.5 B4:.5 D5:.5 B4:.5 | G4:2 D4 | E4:1.5 G4:.5 G4:.5 E4:.5 | D4:2 D4',
          'G4:2 B4:.5 G4:.5 | B4:2 A4 | G4:2',
        ],
      },
      {
        id: 'u6-nese',
        title: 'Neşeye Övgü · tam hali',
        focus: 'Beethoven, 9. Senfoni (1824) · Sol majör, orta bölümüyle',
        time: 4,
        bpm: 84,
        rows: [
          'B4 B4 C5 D5 | D5 C5 B4 A4 | G4 G4 A4 B4 | B4:1.5 A4:.5 A4:2',
          'B4 B4 C5 D5 | D5 C5 B4 A4 | G4 G4 A4 B4 | A4:1.5 G4:.5 G4:2',
          'A4 A4 B4 G4 | A4 B4:.5 C5:.5 B4 G4 | A4 B4:.5 C5:.5 B4 A4 | G4 A4 D4:2',
          'B4 B4 C5 D5 | D5 C5 B4 A4 | G4 G4 A4 B4 | A4:1.5 G4:.5 G4:2',
        ],
      },
    ],
  },
  {
    id: 'unite-7',
    title: 'Ünite 7',
    subtitle: 'İnce Fa diyez ve ince Sol · Minuet',
    newNotes: ['F#5', 'G5'],
    concepts: [
      { sym: "Fa♯'", title: 'İnce Fa diyez', text: 'Pes Fa diyez parmaklarıyla, havayı hızlandırıp dudak açıklığını küçülterek bir oktav yukarı üfle.' },
      { sym: "Sol'", title: 'İnce Sol', text: 'Pes Sol parmaklarıyla bir oktav yukarı. Sertçe değil, hızlı ve ince bir hava akımıyla üfle.' },
    ],
    exercises: [
      {
        id: 'u7-e1',
        title: 'Egzersiz 1',
        focus: 'Oktav atlamaları: aynı parmak, hızlı hava',
        time: 4,
        bpm: 66,
        rows: ['G4:2 G5:2 | F#4:2 F#5:2 | E4:2 E5:2 | D4:2 D5:2', 'G4 G5 F#5 G5 | E5 F#5 G5:2 | D5 E5 F#5 G5 | G5:4'],
      },
      {
        id: 'u7-e2',
        title: 'Egzersiz 2',
        focus: 'Sol majör dizisi: pes Re\'den ince Sol\'e',
        time: 4,
        bpm: 72,
        rows: ['D4 E4 F#4 G4 | A4 B4 C5 D5 | E5 F#5 G5:2 | R:4', 'G5 F#5 E5 D5 | C5 B4 A4 G4 | F#4 E4 D4:2 | G4:4'],
      },
      {
        id: 'u7-minuet',
        title: 'Minuet (Sol majör)',
        focus: 'C. Petzold, Anna Magdalena Bach defterinden (1725) · 3/4, sekizlikler',
        time: 3,
        bpm: 84,
        rows: [
          'D5 G4:.5 A4:.5 B4:.5 C5:.5 | D5 G4 G4 | E5 C5:.5 D5:.5 E5:.5 F#5:.5 | G5 G4 G4',
          'C5 D5:.5 C5:.5 B4:.5 A4:.5 | B4 C5:.5 B4:.5 A4:.5 G4:.5 | F#4 G4:.5 A4:.5 B4:.5 G4:.5 | A4:3',
          'D5 G4:.5 A4:.5 B4:.5 C5:.5 | D5 G4 G4 | E5 C5:.5 D5:.5 E5:.5 F#5:.5 | G5 G4 G4',
          'C5 D5:.5 C5:.5 B4:.5 A4:.5 | B4 C5:.5 B4:.5 A4:.5 G4:.5 | A4 B4:.5 A4:.5 G4:.5 F#4:.5 | G4:3',
        ],
      },
    ],
  },
  {
    id: 'parcalar',
    title: 'Parçalar',
    subtitle: 'Sevilen ezgiler ve türküler · sekizlik ve noktalı dörtlük',
    newNotes: [],
    concepts: [
      { sym: '♪', title: 'Sekizlik nota', text: 'Yarım vuruş. İki sekizlik bir dörtlük eder; "tu-tu" diye hızlıca dil vur.' },
      { sym: '♩.', title: 'Noktalı dörtlük', text: '1 + ½ = 1,5 vuruş. Sekizlikten sonra gelince uzun tutmayı unutma.' },
      { sym: '𝄾', title: 'Sekizlik sus', text: 'Yarım vuruş sessizlik; nefes için kısa bir an.' },
    ],
    exercises: [
      {
        id: 'masal-anlat-baba',
        title: 'Bana Bir Masal Anlat Baba',
        focus: 'Kolay düzenleme · yalnızca La, Si, İnce Do, İnce Re',
        credit:
          'Söz: Yavuz Turgul – Cengiz Onural · Müzik: Cengiz Onural. Onur Volkangil\'in kolay düzenlemesinden (Ses Veriyorum) dört notaya uyarlandı: Mi–Fa♯–Sol–La yerine La–Si–Do–Re; Re♯, ince Do ve Si notaları sadeleştirildi.',
        time: 4,
        bpm: 76,
        rows: [
          // Giriş
          'A4 R:1 C5 R:1 | B4 C5:.5 B4:1.5 R:1 | R:1 B4:.5 B4:.5 B4:.5 B4:1.5 | C5 D5:.5 C5 R:.5 R:1',
          'R:1 A4:.5 A4:.5 A4:.5 A4:1.5 | B4 C5:.5 B4 A4:1.5 | C5:4 | R:4',
          'A4 R:1 C5 R:1 | B4 C5:.5 B4:1.5 R:1 | R:1 B4:.5 B4:.5 B4:.5 B4:1.5 | C5 D5:.5 C5 R:.5 R:1',
          'R:1 A4:.5 A4:.5 A4:.5 A4:1.5 | B4 C5:.5 B4 A4:1.5 | A4:4 ||',
          // Ara ezgi
          'A4 R:1 C5 R:1 | B4 C5:.5 B4:1.5 R:1 | R:1 B4:.5 B4:.5 B4:.5 B4:1.5 | C5 D5:.5 C5 R:.5 R:1',
          'R:1 A4:.5 A4:.5 A4:.5 A4:1.5 | B4 C5:.5 D5 C5:1.5 | A4:4',
        ],
      },
      {
        id: 'katibim',
        title: 'Üsküdar\'a Gider İken (Kâtibim)',
        focus: 'Anonim İstanbul türküsü · ilk kıta, kolay düzenleme · 2/4',
        credit:
          'Anonim türkü. Nota sırası iki kaynakta aynı (Blok Flüt Notaları, Şarkı Notası); ritim sadeleştirildi, kaynaklarda yalnızca nota sırası vardı. Son ölçüdeki en pes do (do♯) yerine re çalınır. Nakarat ("Kâtip uykudan uyanmış…") doğrulanamadığı için eklenmedi.',
        time: 2,
        bpm: 76,
        rows: [
          'D4:.5 A4:.5 A4:.5 A4:.5 | Bb4:.5 A4:.5 Bb4:.5 C5:.5 | A4 A4 | G4:.5 G4:.5 G4:.5 F4:.5 | G4 A4~ | A4:2',
          'D4:.5 A4:.5 A4:.5 A4:.5 | Bb4:.5 A4:.5 Bb4:.5 C5:.5 | A4 A4 | G4:.5 G4:.5 G4:.5 F4:.5 | G4 A4~ | A4:2',
          'D4:.5 E4:.5 F4:.5 G4:.5 | A4:.5 Bb4:.5 A4:.5 G4:.5 | F4:.5 E4:.5 D4 | E4:.5 G4:.5 F4:.5 E4:.5 | E4:.5 D4:.5 D4:.5 E4:.5 | E4:2',
        ],
      },
      {
        id: 'nese',
        title: 'Neşeye Övgü',
        focus: 'Kolay düzenleme · Fa majör, noktalı dörtlük ve sekizlik',
        credit: 'Ludwig van Beethoven, 9. Senfoni (1824). Üçüncü satırın sonunda pes Do yerine ince Do çalınır.',
        time: 4,
        bpm: 80,
        rows: [
          'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | A4:1.5 G4:.5 G4:2',
          'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | G4:1.5 F4:.5 F4:2',
          'G4 G4 A4 F4 | G4 A4:.5 Bb4:.5 A4 F4 | G4 A4:.5 Bb4:.5 A4 G4 | F4 G4 C5:2',
          'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | G4:1.5 F4:.5 F4:2',
        ],
      },
    ],
  },
];

/** Satır dizgesini öğelere çevirir: {rest, note, beats, fermata, tie, bar} — bar: öğeden sonra gelen çizgi */
export function parseRow(str) {
  const items = [];
  for (const tok of str.trim().split(/\s+/)) {
    if (tok === '|' || tok === '||') {
      if (items.length) items[items.length - 1].bar = tok === '||' ? 'double' : 'single';
      continue;
    }
    const m = /^([A-G][#b]?\d|R)(?::([\d.]+))?(!?)(~?)$/.exec(tok);
    if (!m) throw new Error(`Geçersiz egzersiz öğesi: ${tok}`);
    const [, name, beats, fermata, tie] = m;
    items.push({ rest: name === 'R', note: name === 'R' ? null : name, beats: beats ? Number(beats) : 1, fermata: !!fermata, tie: !!tie, bar: null });
  }
  return items;
}

/** Bir egzersizi satırlarıyla birlikte hazırlar */
export function prepareExercise(ex) {
  const rows = ex.rows.map(parseRow);
  rows[rows.length - 1].at(-1).bar = 'final';
  return { ...ex, parsed: rows };
}

export const EXERCISES = UNITS.flatMap((u) => u.exercises.map((e) => ({ ...e, unit: u.id })));
