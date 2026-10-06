// Keman antrenmanları: resim yok; doğru nota + doğru süre çalışılır (bkz. js/data/drills.js).
import { seq } from '../data/songs.js';

export const DRILLS = [
  {
    id: 'bos-sureler',
    title: 'Boş Teller: Kısa ve Uzun',
    focus: 'Dörtlük, ikilik ve birlik; yayı süreye göre böl',
    bpm: 66,
    notes: seq('A4 A4 A4:2 | D4:2 D4:2 | E5 E5 E5 E5 | A4:4'),
  },
  {
    id: 'tel-gecisleri',
    title: 'Tel Geçişleri',
    focus: 'Sol, Re, La ve Mi telleri arasında yay geçişi',
    bpm: 66,
    notes: seq('G3:2 D4:2 | A4:2 E5:2 | E5 A4 D4 G3 | G3:4'),
  },
  {
    id: 'la-teli-dortlukler',
    title: 'La Teli Dörtlükleri',
    focus: 'La, Si, Do♯ ve Re eşit vuruşlarla',
    bpm: 72,
    notes: seq('A4 B4 C#5 D5 | D5 C#5 B4 A4 | A4 C#5 B4:2 | A4:4'),
  },
  {
    id: 'uzun-yaylar',
    title: 'Uzun Yaylar',
    focus: 'Yayı topuktan uca kadar kullan',
    bpm: 60,
    notes: seq('A4:4 | B4:4 | C#5:2 D5:2 | A4:4'),
  },
  {
    id: 're-majorm',
    title: 'Re Majör Dizisi',
    focus: 'Re telinde parmaklar, sonra boş La',
    bpm: 72,
    notes: seq('D4 E4 F#4 G4 | A4:4 | A4 G4 F#4 E4 | D4:4'),
  },
  {
    id: 'sekizlikler',
    title: 'Sekizlikler',
    focus: 'Yarım vuruşluk kısa yaylar',
    bpm: 60,
    notes: seq('D4:.5 E4:.5 F#4:.5 G4:.5 A4:2 | A4:.5 G4:.5 F#4:.5 E4:.5 D4:2 | F#4 F#4:.5 F#4:.5 E4 E4 | D4:4'),
  },
  {
    id: 'mi-teli',
    title: 'Mi Teli Parmakları',
    focus: 'Mi, Fa♯, Sol♯ ve La',
    bpm: 66,
    notes: seq('E5 F#5 G#5 A5 | A5:4 | A5 G#5 F#5 E5 | E5:4'),
  },
];
