// Etkin enstrüman (flüt, keman…). Ortak modüller (oynatıcı, duraklar, şarkı oyunu,
// seslendirme) enstrümana özgü her şeyi buradan alır. Paketler js/instruments/ altında.
let current = null;

export function setInstrument(inst) {
  current = inst;
}

export function instrument() {
  if (!current) throw new Error('Enstrüman seçilmedi');
  return current;
}
