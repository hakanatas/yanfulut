// Keman için Nota Noktaları şarkıları (1. pozisyon, La majör ve Re majör).
import { seq, starOutline, SONGS as FLUTE_SONGS } from '../data/songs.js';
import { HEART, BALLOON, HOUSE, SUN } from '../data/shapes.js';

const shapeOf = (id) => FLUTE_SONGS.find((s) => s.id === id).shape;

export const SONGS = [
  {
    id: 'bos-tel-treni',
    title: 'Boş Tel Treni',
    level: 'Boş teller: La · Mi · Re',
    hint: 'Hiç parmak basma! Yalnızca yayı bir telden diğerine taşı.',
    bpm: 80,
    notes: seq('A4 A4 E5 E5 A4 A4 D4:2 D4 D4 A4 A4 D4:2'),
    shape: HEART,
  },
  {
    id: 'salincak',
    title: 'Salıncak',
    level: 'İki nota: Si · La',
    hint: 'La telinde 1. parmağını kaldır, bas: Si, La, Si, La… Her notada yay yönünü değiştir.',
    bpm: 80,
    notes: seq('B4 A4 B4 A4 B4 A4 B4:2 A4 A4 B4 B4 A4:2'),
    shape: BALLOON,
  },
  {
    id: 'merdiven',
    title: 'Merdiven',
    level: 'Üç nota: La · Si · Do♯',
    hint: 'La telinde parmaklarını teker teker koy (1, 2), sonra teker teker kaldır.',
    bpm: 80,
    notes: seq('A4 B4 C#5:2 C#5 B4 A4:2 A4 B4 C#5 B4 A4:2'),
    shape: HOUSE,
  },
  {
    id: 'tembel',
    title: 'Tembel Çocuk',
    level: 'La teli + boş Mi',
    hint: 'Uyuyor musun, tembel çocuk? İki kez La-Si-Do♯-La, sonra iki kez Do♯-Re-Mi.',
    bpm: 88,
    notes: seq('A4 B4 C#5 A4 A4 B4 C#5 A4 C#5 D5 E5:2 C#5 D5 E5:2'),
    shape: SUN,
  },
  {
    id: 'corekler',
    title: 'Sıcak Çörekler',
    level: 'La teli: Do♯ · Si · La',
    requires: 'la-teli',
    bpm: 96,
    notes: seq('C#5 B4 A4:2 C#5 B4 A4:2 A4:.5 A4:.5 A4:.5 A4:.5 B4:.5 B4:.5 B4:.5 B4:.5 C#5 B4 A4:2'),
    shape: shapeOf('corekler'),
  },
  {
    id: 'kuzu',
    title: 'Küçük Kuzu',
    level: 'La teli + boş Mi',
    requires: 'la-teli',
    bpm: 108,
    notes: seq('C#5 B4 A4 B4 C#5 C#5 C#5:2 B4 B4 B4:2 C#5 E5 E5:2 C#5 B4 A4 B4 C#5 C#5 C#5 C#5 B4 B4 C#5 B4 A4:4'),
    shape: shapeOf('kuzu'),
  },
  {
    id: 'nese',
    title: 'Neşeye Övgü',
    level: 'Re teli: Fa♯ · Sol · La',
    requires: 're-teli',
    bpm: 112,
    notes: seq('F#4 F#4 G4 A4 A4 G4 F#4 E4 D4 D4 E4 F#4 F#4:1.5 E4:.5 E4:2 F#4 F#4 G4 A4 A4 G4 F#4 E4 D4 D4 E4 F#4 E4:1.5 D4:.5 D4:2'),
    shape: {
      name: 'Keman',
      color: 'var(--varnish)',
      outline: [
        [47, 4], [53, 4], [56, 9], [53, 13], [53, 30], [62, 31], [72, 35], [74, 45], [67, 52], [65, 60],
        [71, 64], [78, 72], [78, 84], [70, 93], [56, 97], [44, 97], [30, 93], [22, 84], [22, 72], [29, 64],
        [35, 60], [33, 52], [26, 45], [28, 35], [38, 31], [47, 30], [47, 13], [44, 9],
      ],
      details: [
        { d: 'M47.5 14 L52.5 14 L54 62 L46 62Z', cls: 'fill-ink' },
        'M48.6 14 L47.6 86 M49.6 14 L49.2 86 M50.4 14 L50.8 86 M51.4 14 L52.4 86',
        { d: 'M44 70 L56 70 L55 72 L45 72Z', cls: 'fill-sun' },
        'M40 62 C36 66 41 70 38 76 M60 62 C64 66 59 70 62 76',
        { d: 'M45 80 L55 80 L53 92 L47 92Z', cls: 'fill-ink' },
        { d: 'M50 5 a3 3 0 1 0 0.1 0Z', cls: 'fill-paper' },
        { d: 'M64 40 C70 42 72 48 68 52', cls: 'shine' },
        { d: 'M66 76 C72 80 72 88 66 92', cls: 'shine' },
      ],
      scene: [
        { d: 'M8 20 l1.6 -4 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6Z', cls: 'fill-sun' },
        { d: 'M88 60 l1.4 -3.6 l1.4 3.6 l3.6 1.4 l-3.6 1.4 l-1.4 3.6 l-1.4 -3.6 l-3.6 -1.4Z', cls: 'fill-sun' },
        { d: 'M12 74 a3 2.4 0 1 0 0.1 0Z M16 58 V74 M86 22 a3 2.4 0 1 0 0.1 0Z M90 8 V22', cls: 'fill-ink' },
      ],
    },
  },
  {
    id: 'yildiz',
    title: 'Daha Dün Annemizin',
    level: 'La ve Mi telleri',
    requires: 'mi-teli',
    bpm: 104,
    notes: seq(
      'A4 A4 E5 E5 F#5 F#5 E5:2 D5 D5 C#5 C#5 B4 B4 A4:2 ' +
        'E5 E5 D5 D5 C#5 C#5 B4:2 E5 E5 D5 D5 C#5 C#5 B4:2 ' +
        'A4 A4 E5 E5 F#5 F#5 E5:2 D5 D5 C#5 C#5 B4 B4 A4:2',
    ),
    shape: { ...shapeOf('yildiz'), outline: starOutline(50, 52, 42, 18) },
  },
];
