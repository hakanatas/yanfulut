// Ders yolu denetimi: her alıştırma (şarkı, antrenman, derslerdeki "Şimdi sen çal")
// yalnızca kendisinden önce öğretilmiş notaları kullanmalı; antrenman ölçüleri 4/4'e tam bölünmeli;
// her anlatım cümlesinin Google TTS sesi üretilmiş olmalı (yoksa: node tools/tts.mjs <enstrüman>).
import { PHRASES, checkpointPrompt, ttsKey } from '../js/data/phrases.js';
// Kullanım: node tools/check-course.mjs   (hata varsa çıkış kodu 1)
const problems = [];
for (const id of ['flute', 'violin']) {
  const inst = (await import(`../js/instruments/${id}.js`)).default;
  const learned = new Set();
  const find = (type, itemId) => inst[{ lesson: 'lessons', song: 'songs', drill: 'drills' }[type]].find((x) => x.id === itemId);
  for (const item of inst.course) {
    const data = find(item.type, item.id);
    if (!data) {
      problems.push(`${inst.name}: ders yolunda bulunamadı: ${item.type} ${item.id}`);
      continue;
    }
    const where = `${inst.name} › ${data.title}`;
    if (item.type === 'lesson') {
      if (!Array.isArray(data.teaches)) problems.push(`${where}: "teaches" listesi yok`);
      const known = new Set([...learned, ...(data.teaches || [])]);
      for (const sc of data.scenes || []) {
        if (sc.check?.type === 'play' && !known.has(sc.check.note)) problems.push(`${where}: "Şimdi sen çal" durağında öğretilmemiş nota ${sc.check.note}`);
      }
      (data.teaches || []).forEach((n) => learned.add(n));
      continue;
    }
    const bad = [...new Set(data.notes.map((n) => n.note).filter((n) => !learned.has(n)))];
    if (bad.length) problems.push(`${where}: öğretilmemiş nota(lar) ${bad.join(', ')} — o ana kadar öğrenilen: ${[...learned].join(' ')}`);
    if (item.type === 'drill') {
      const beats = data.notes.reduce((a, n) => a + n.beats, 0);
      if (beats % 4) problems.push(`${where}: toplam ${beats} vuruş, 4/4 ölçülere tam bölünmüyor`);
    }
  }
  // Her anlatım cümlesinin sesi var mı?
  inst.activate();
  const texts = new Set(Object.values(PHRASES));
  for (const l of inst.lessons) for (const sc of l.scenes || []) {
    if (sc.say) texts.add(sc.say);
    if (sc.check) texts.add(checkpointPrompt(sc.check));
  }
  const { manifest } = inst.tts;
  for (const t of texts) if (t && !manifest.files[ttsKey(t, manifest.voice)]) problems.push(`${inst.name}: Google sesi üretilmemiş cümle: "${t.slice(0, 60)}…" (node tools/tts.mjs ${id})`);
  // Egzersiz Yap (çalışma kağıdı): yalnızca tanıtılmış notalar, ölçüler ölçü sayısına tam uymalı, bağlar aynı notaya
  if (inst.worksheets) {
    const { parseRow } = await import('../js/data/worksheet.js');
    const introduced = new Set();
    for (const u of inst.worksheets) {
      u.newNotes.forEach((n) => {
        introduced.add(n);
        if (!inst.notes.includes(n)) problems.push(`${inst.name} › ${u.title}: parmak pozisyonu olmayan nota ${n}`);
      });
      for (const ex of u.exercises) {
        const where = `${inst.name} › ${u.title} › ${ex.title}`;
        const items = ex.rows.flatMap(parseRow);
        const bad = [...new Set(items.filter((i) => !i.rest && !introduced.has(i.note)).map((i) => i.note))];
        if (bad.length) problems.push(`${where}: tanıtılmamış nota(lar) ${bad.join(', ')}`);
        items.forEach((it, k) => {
          if (it.tie && (items[k + 1]?.note !== it.note || it.bar === 'final')) problems.push(`${where}: bağ aynı notaya gitmiyor (${k + 1}. öğe)`);
        });
        // Ölçüler: satır sonları ölçü çizgisi sayılır; anakruz (pickup) ilk ölçüyü, son ölçü onu tamamlar
        const bars = [];
        let acc = 0;
        for (const row of ex.rows) {
          const r = parseRow(row);
          r.forEach((it, k) => {
            acc += it.beats;
            if (it.bar || k === r.length - 1) {
              bars.push(acc);
              acc = 0;
            }
          });
        }
        bars.forEach((b, k) => {
          const want = ex.pickup && k === 0 ? ex.pickup : ex.pickup && k === bars.length - 1 ? ex.time - ex.pickup : ex.time;
          if (b !== want) problems.push(`${where}: ${k + 1}. ölçü ${b} vuruş, ${want} olmalı`);
        });
      }
    }
  }
  // Ders yolunda olmayan şarkı/antrenman kalmasın
  for (const [type, list] of [['song', inst.songs], ['drill', inst.drills]]) {
    for (const x of list) if (!inst.course.some((c) => c.type === type && c.id === x.id)) problems.push(`${inst.name}: ders yolunda olmayan ${type}: ${x.id}`);
  }
}
if (problems.length) {
  console.error('Ders yolu denetimi BAŞARISIZ:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Ders yolu denetimi geçti: tüm alıştırmalar yalnızca önceden öğretilen notaları kullanıyor ve her anlatım cümlesinin Google sesi var.');
