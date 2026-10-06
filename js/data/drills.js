// Flüt antrenmanları: resim yok; doğru nota + doğru süre çalışılır.
// Süreler vuruş cinsinden: 4 = birlik, 2 = ikilik, 1 = dörtlük, .5 = sekizlik. Her ölçü 4 vuruş (4/4).
// Her antrenman yalnızca ders yolunda kendisinden önce öğretilen notaları kullanır (tools/check-course.mjs denetler).
import { seq } from './songs.js';

export const DRILLS = [
  {
    id: 'si-sureler',
    title: 'Si: Kısa ve Uzun',
    focus: 'Dörtlük, ikilik ve birlik',
    bpm: 66,
    notes: seq('B4 B4 B4:2 | B4:2 B4:2 | B4 B4 B4 B4 | B4:4'),
  },
  {
    id: 'si-la-sol',
    title: 'Si, La, Sol Dörtlükleri',
    focus: 'Üç nota, eşit vuruşlar',
    bpm: 72,
    notes: seq('B4 A4 G4:2 | G4 A4 B4:2 | B4 B4 A4 A4 | G4:4'),
  },
  {
    id: 'uzun-notalar',
    title: 'Uzun Notalar',
    focus: 'İkilik ve birliği sonuna kadar tut',
    bpm: 66,
    notes: seq('G4:2 A4:2 | B4:4 | A4:2 G4:2 | G4:4'),
  },
  {
    id: 'bes-nota',
    title: 'Beş Nota Merdiveni',
    focus: 'Sol\'den Re\'ye çık, in',
    bpm: 72,
    notes: seq('G4 A4 B4 C5 | D5:4 | D5 C5 B4 A4 | G4:4'),
  },
  {
    id: 'sekizlikler',
    title: 'Sekizlikler',
    focus: 'Yarım vuruşluk hızlı notalar',
    bpm: 60,
    notes: seq('G4:.5 A4:.5 B4:.5 C5:.5 D5:2 | D5:.5 C5:.5 B4:.5 A4:.5 G4:2 | B4 B4:.5 B4:.5 A4 A4 | G4:4'),
  },
  {
    id: 'pes-notalar',
    title: 'Pes Re ve Mi',
    focus: 'Havayı yavaş ve geniş üfle',
    bpm: 66,
    notes: seq('D4:2 E4:2 | G4 E4 D4:2 | D4 E4 G4 A4 | B4:4'),
  },
  {
    id: 'oktav',
    title: 'Oktav Atlama',
    focus: 'Aynı parmaklar, farklı hava',
    bpm: 60,
    notes: seq('E4:2 E5:2 | E4 E5 E4:2 | E5:4'),
  },
];
