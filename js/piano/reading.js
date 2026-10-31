// Piyano: Nota Okuma yolu. Piyanoya geçmeden önce klavyeyi tanıma, sol anahtarı ve fa anahtarında okuma.
// Her alıştırmanın üstünde kısa bir konu anlatımı (intro) ve resmi var. Türler için bkz. js/reading.js.

const range = (a, b) => {
  const order = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const out = [];
  let [l, o] = [a[0], Number(a.slice(1))];
  for (;;) {
    out.push(`${l}${o}`);
    if (`${l}${o}` === b) return out;
    const k = order.indexOf(l) + 1;
    if (k === 7) o++;
    l = order[k % 7];
  }
};

export const READINGS = [
  {
    id: 'klavye-do-re-mi',
    title: 'Klavyeyi Tanı: Do, Re, Mi',
    focus: 'İkili siyah tuşlar: Do solunda, Re arasında, Mi sağında',
    mode: 'find',
    letters: ['C', 'D', 'E'],
    count: 12,
    keyboard: { min: 'C3', max: 'B4' },
    intro: {
      title: 'Siyah tuşlar sana yol gösterir',
      points: [
        'Piyanoda siyah tuşlar ikili ve üçlü gruplar halindedir. Bu gruplar sayesinde her notayı bulabilirsin.',
        '<b>Do</b>, iki siyah tuşun hemen <b>solundaki</b> beyaz tuştur. <b>Re</b> iki siyah tuşun <b>arasında</b>, <b>Mi</b> ise <b>sağındadır</b>.',
        'Klavyede birçok Do vardır; hepsi aynı adı taşır. Burada istenen notanın herhangi birine basabilirsin.',
      ],
      visual: { type: 'keyboard', from: 'C3', to: 'B4', marked: ['C3', 'D3', 'E3', 'C4', 'D4', 'E4'] },
    },
  },
  {
    id: 'klavye-fa-si',
    title: 'Klavyeyi Tanı: Fa, Sol, La, Si',
    focus: 'Üçlü siyah tuşlar: Fa solunda, Si sağında',
    mode: 'find',
    letters: ['F', 'G', 'A', 'B'],
    count: 12,
    keyboard: { min: 'C3', max: 'B4' },
    intro: {
      title: 'Üçlü siyah tuş grubu',
      points: [
        '<b>Fa</b>, üç siyah tuşun hemen <b>solundaki</b> beyaz tuştur. Sonra sırayla <b>Sol</b> ve <b>La</b> gelir, <b>Si</b> üçlü grubun <b>sağındadır</b>.',
        'Si\'den sonraki beyaz tuş yine Do: notalar Do Re Mi Fa Sol La Si diye tekrar eder.',
      ],
      visual: { type: 'keyboard', from: 'C3', to: 'B4', marked: ['F3', 'G3', 'A3', 'B3', 'F4', 'G4', 'A4', 'B4'] },
    },
  },
  {
    id: 'klavye-hepsi',
    title: 'Klavyeyi Tanı: Yedi Nota',
    focus: 'Do Re Mi Fa Sol La Si: hepsini hızla bul',
    mode: 'find',
    letters: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    count: 14,
    keyboard: { min: 'C3', max: 'B4' },
    intro: {
      title: 'Yedi beyaz tuş, yedi nota',
      points: ['Önce iki ya da üç siyah tuşlu grubu bul, sonra notayı say.', 'Hız kazanınca "Tuş adları" düğmesini kapalı tut: adlara bakmadan bul.'],
      visual: { type: 'keyboard', from: 'C4', to: 'B4', labels: true },
    },
  },
  {
    id: 'porte-orta-do',
    title: 'Porte ve Sol Anahtarı: Orta Do, Re, Mi',
    focus: 'Portede ilk üç nota; klavyede orta Do\'dan başla',
    mode: 'flash',
    clef: 'treble',
    pool: ['C4', 'D4', 'E4'],
    count: 12,
    intro: {
      title: 'Porte nedir?',
      points: [
        '<b>Porte</b> beş çizgi ve aralarındaki dört aralıktır. Notalar çizgilerin üstüne ya da aralıklara yazılır; yukarıdaki nota daha incedir.',
        '<b>Sol anahtarı</b> (𝄞) ikinci çizgide kıvrılır: o çizgideki nota Sol\'dür. Sağ elin okuduğu notalar genellikle sol anahtarıyla yazılır.',
        '<b>Orta Do</b> portenin altında, kendi küçük ek çizgisinin üstündedir. Klavyede piyanonun ortasına yakın Do\'dur (resimde noktalı).',
        'Re, ek çizginin hemen altında değil, porteye değen aralıktadır; Mi birinci çizginin üstündedir.',
      ],
      visual: { type: 'staff', clef: 'treble', notes: ['C4', 'D4', 'E4'] },
    },
  },
  {
    id: 'do-sol',
    title: 'Do\'dan Sol\'e Beş Nota',
    focus: 'Sağ el birinci konum: Do Re Mi Fa Sol',
    mode: 'flash',
    clef: 'treble',
    pool: range('C4', 'G4'),
    count: 15,
    intro: {
      title: 'Beş parmak, beş nota',
      points: [
        'Sağ elinin başparmağını orta Do\'ya koy: her parmak bir beyaz tuşa düşer (Do Re Mi Fa Sol).',
        'Portede notalar sırayla bir çizgi, bir aralık diye yükselir: Do (ek çizgi), Re (aralık), Mi (1. çizgi), Fa (1. aralık), Sol (2. çizgi).',
      ],
      visual: { type: 'staff', clef: 'treble', notes: range('C4', 'G4') },
    },
  },
  {
    id: 'do-sol-satir',
    title: 'Satır Oku: Do\'dan Sol\'e',
    focus: 'Soldan sağa oku, her notayı sırayla çal · son iki satır bir ezgi',
    mode: 'line',
    clef: 'treble',
    rows: ['C4 D4 E4 F4 G4', 'G4 F4 E4 D4 C4', 'C4 E4 G4 E4 C4', 'D4 F4 E4 G4 C4', 'E4 E4 F4 G4 G4 F4 E4 D4', 'C4 C4 D4 E4 E4 D4 D4'],
    intro: {
      title: 'Bir satırı okumak',
      points: [
        'Notalar kitap gibi soldan sağa okunur. İşaretli notayı çal; doğruysa işaret bir sonrakine geçer.',
        'Burada süre yok: acele etme, önce notanın yerini bul. Son iki satır tanıdık bir ezgi; hangisi olduğunu bul!',
      ],
    },
  },
  {
    id: 'la-si-do',
    title: 'La, Si ve İnce Do',
    focus: 'Sol\'ün üstü: La (2. aralık), Si (3. çizgi), ince Do (3. aralık)',
    mode: 'flash',
    clef: 'treble',
    pool: ['G4', 'A4', 'B4', 'C5'],
    count: 15,
    intro: {
      title: 'Portenin ortası',
      points: [
        'La ikinci aralıkta, Si orta (üçüncü) çizgide, ince Do üçüncü aralıktadır.',
        'İnce Do orta Do\'dan bir <b>oktav</b> yukarıdadır: aynı ad, sekiz beyaz tuş sağda.',
      ],
      visual: { type: 'staff', clef: 'treble', notes: ['G4', 'A4', 'B4', 'C5'] },
    },
  },
  {
    id: 'cizgi-aralik',
    title: 'Çizgi ve Aralık Notaları',
    focus: 'Çizgiler: Mi Sol Si Re Fa · aralıklar: Fa La Do Mi',
    mode: 'flash',
    clef: 'treble',
    pool: ['E4', 'G4', 'B4', 'D5', 'F5', 'F4', 'A4', 'C5', 'E5'],
    count: 18,
    intro: {
      title: 'Bir kural, dokuz nota',
      points: [
        'Sol anahtarında beş çizginin notaları aşağıdan yukarı: <b>Mi, Sol, Si, Re, Fa</b>.',
        'Dört aralığın notaları: <b>Fa, La, Do, Mi</b>.',
        'Tanımadığın bir notada bildiğin bir notadan say: bir çizgi yukarısı bir sonraki çizgi notası, iki nota yukarıdadır.',
      ],
      visual: { type: 'staff', clef: 'treble', notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
    },
  },
  {
    id: 'ince-notalar',
    title: 'İnce Re\'den İnce Sol\'e',
    focus: 'Portenin üst kısmı ve hemen üstü',
    mode: 'flash',
    clef: 'treble',
    pool: range('C5', 'G5'),
    count: 16,
    intro: {
      title: 'Yukarı doğru',
      points: ['İnce Re dördüncü çizgide, ince Mi dördüncü aralıkta, ince Fa en üst çizgide.', 'İnce Sol, en üst çizginin hemen üstüne oturur.'],
      visual: { type: 'staff', clef: 'treble', notes: range('C5', 'G5') },
    },
  },
  {
    id: 'sol-anahtari',
    title: 'Sol Anahtarı: Hepsi Bir Arada',
    focus: 'Orta Do\'dan ince Sol\'e kadar karışık',
    mode: 'flash',
    clef: 'treble',
    pool: range('C4', 'G5'),
    count: 20,
    intro: {
      title: 'Hızlanma zamanı',
      points: ['Bütün notalar karışık gelir. Önce yerini doğru bul, sonra hızlan: sonuçta ortalama süren de yazılır.', '"Nota adını göster" ipucunu kapalı tutmaya çalış.'],
    },
  },
  {
    id: 'sol-satir-ezgiler',
    title: 'Satır Oku: Bilindik Ezgiler',
    focus: 'Neşeye Övgü, Küçük Yıldız ve diziler',
    mode: 'line',
    clef: 'treble',
    rows: [
      'E4 E4 F4 G4 G4 F4 E4 D4',
      'C4 C4 D4 E4 E4 D4 D4',
      'E4 E4 F4 G4 G4 F4 E4 D4',
      'C4 C4 D4 E4 D4 C4 C4',
      'C4 C4 G4 G4 A4 A4 G4',
      'F4 F4 E4 E4 D4 D4 C4',
      'C5 B4 A4 G4 F4 E4 D4 C4',
      'G4 B4 D5 G5 D5 B4 G4',
    ],
    intro: {
      title: 'Ezgileri notadan okumak',
      points: ['İlk dört satır Beethoven\'ın Neşeye Övgü\'sü, sonraki iki satır Küçük Yıldız (Daha Dün Annemizin).', 'Son iki satırda büyük atlamalar var: çizgileri sayarak oku.'],
    },
  },
  {
    id: 'fa-anahtari',
    title: 'Fa Anahtarı: Sol El Do\'dan Sol\'e',
    focus: 'Pes notalar: Do Re Mi Fa Sol (orta Do\'nun bir oktav aşağısı)',
    mode: 'flash',
    clef: 'bass',
    pool: range('C3', 'G3'),
    count: 15,
    keyboard: { min: 'C3', max: 'B4' },
    intro: {
      title: 'Fa anahtarı',
      points: [
        'Sol elin çaldığı pes notalar <b>fa anahtarıyla</b> (𝄢) yazılır. Anahtarın iki noktası dördüncü çizgiyi sarar: o çizgideki nota <b>Fa</b>\'dır.',
        'Sol elinin serçe parmağını orta Do\'nun bir oktav aşağısındaki Do\'ya koy: Do Re Mi Fa Sol.',
        'Fa anahtarında çizgiler aşağıdan yukarı: <b>Sol, Si, Re, Fa, La</b>; aralıklar: <b>La, Do, Mi, Sol</b>.',
      ],
      visual: { type: 'staff', clef: 'bass', notes: range('C3', 'G3') },
    },
  },
  {
    id: 'fa-anahtari-2',
    title: 'Fa Anahtarı: Pes Sol\'den Orta Do\'ya',
    focus: 'En alt çizgiden orta Do\'ya (portenin üstündeki ek çizgi)',
    mode: 'flash',
    clef: 'bass',
    pool: range('G2', 'C4'),
    count: 20,
    keyboard: { min: 'C2', max: 'B4' },
    intro: {
      title: 'Orta Do iki anahtarda',
      points: [
        'Fa anahtarında orta Do portenin <b>üstünde</b>, kendi ek çizgisindedir; sol anahtarında ise <b>altındaydı</b>. İkisi klavyede <b>aynı tuştur</b>.',
        'En alt çizgi pes Sol, en üst çizgi La\'dır.',
      ],
      visual: { type: 'staff', clef: 'bass', notes: range('G2', 'C4') },
    },
  },
  {
    id: 'fa-satir',
    title: 'Satır Oku: Fa Anahtarı',
    focus: 'Sol el notalarını sırayla oku ve çal',
    mode: 'line',
    clef: 'bass',
    rows: ['C3 D3 E3 F3 G3', 'G3 F3 E3 D3 C3', 'C3 E3 G3 E3 C3', 'G2 A2 B2 C3', 'C3 G3 C4 G3 C3', 'A3 B3 C4 B3 A3 G3'],
    keyboard: { min: 'C2', max: 'B4' },
  },
  {
    id: 'iki-anahtar',
    title: 'İki Anahtar Karışık',
    focus: 'Sol anahtarı ve fa anahtarı sırayla değil, karışık',
    mode: 'flash',
    pools: { treble: range('C4', 'G5'), bass: range('G2', 'C4') },
    count: 24,
    keyboard: { min: 'C2', max: 'B5' },
    intro: {
      title: 'Önce anahtara bak',
      points: ['Her notada önce anahtarı oku: 𝄞 sol anahtarı mı, 𝄢 fa anahtarı mı? Aynı yerdeki nota iki anahtarda farklıdır.', 'Bu, iki elle piyano çalmanın ilk adımı.'],
    },
  },
  {
    id: 'iki-anahtar-satir',
    title: 'Satır Oku: İki El',
    focus: 'Satırlar sırayla fa ve sol anahtarında: orta Do\'da buluşma',
    mode: 'line',
    rows: [
      { clef: 'bass', notes: 'C3 D3 E3 F3 G3' },
      { clef: 'treble', notes: 'C4 D4 E4 F4 G4' },
      { clef: 'bass', notes: 'G3 A3 B3 C4' },
      { clef: 'treble', notes: 'C4 B4 C5 G4 E4 C4' },
      { clef: 'bass', notes: 'C4 G3 E3 C3' },
      { clef: 'treble', notes: 'E4 G4 C5 G4 E4 C4' },
    ],
    keyboard: { min: 'C3', max: 'B5' },
  },
];
