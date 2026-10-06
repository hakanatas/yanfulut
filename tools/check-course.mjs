// Ders yolu denetimi: her alıştırma (şarkı, antrenman, derslerdeki "Şimdi sen çal")
// yalnızca kendisinden önce öğretilmiş notaları kullanmalı; antrenman ölçüleri 4/4'e tam bölünmeli.
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
  // Ders yolunda olmayan şarkı/antrenman kalmasın
  for (const [type, list] of [['song', inst.songs], ['drill', inst.drills]]) {
    for (const x of list) if (!inst.course.some((c) => c.type === type && c.id === x.id)) problems.push(`${inst.name}: ders yolunda olmayan ${type}: ${x.id}`);
  }
}
if (problems.length) {
  console.error('Ders yolu denetimi BAŞARISIZ:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Ders yolu denetimi geçti: tüm alıştırmalar yalnızca önceden öğretilen notaları kullanıyor.');
