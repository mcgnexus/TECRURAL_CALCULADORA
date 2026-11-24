// Formato de números en español: 5.886 m³, 2,5 ha
const make = (digits) =>
  // useGrouping "always": en español "4.000" lleva separador desde los 4 dígitos.
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits, useGrouping: "always" });

const f0 = make(0);
const f1 = make(1);
const f2 = make(2);

const ok = (v) => typeof v === "number" && Number.isFinite(v);

export const n0 = (v) => (ok(v) ? f0.format(v) : "–");
export const n1 = (v) => (ok(v) ? f1.format(v) : "–");
export const n2 = (v) => (ok(v) ? f2.format(v) : "–");
export const eur = (v) => `${n0(v)} €`;

// "2,5" -> 2.5 ; "4.000" -> 4000 ; "1.234.567" -> 1234567 ; "" -> NaN
export function parseNum(text) {
  let t = String(text ?? "").trim().replace(/\s/g, "");
  if (t === "") return NaN;
  // Puntos de miles: grupos exactos de 3 cifras ("4.000", "1.234.567").
  // Un punto con 1-2 cifras detrás se queda como decimal ("2.5" -> 2,5).
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replaceAll(".", "");
  t = t.replace(",", ".");
  const v = Number(t);
  return v;
}

// 2.5 -> "2,5"
export function fmtNum(v, digits = 2) {
  if (!ok(v)) return "";
  return make(digits).format(v);
}

export function fmtMeses(v) {
  if (!ok(v)) return "Más de 10 años";
  if (v >= 120) return "Más de 10 años";
  if (v < 1) return "Menos de 1";
  return n1(v);
}

// Valida teléfono español: 9 dígitos, con o sin +34 / 0034, admite espacios
export function normalizarTelefono(text) {
  let t = String(text ?? "").replace(/[\s.\-]/g, "");
  if (t.startsWith("+34")) t = t.slice(3);
  else if (t.startsWith("0034")) t = t.slice(4);
  else if (t.startsWith("34") && t.length === 11) t = t.slice(2);
  return t;
}

export function telefonoValido(text) {
  const t = normalizarTelefono(text);
  return /^[6789]\d{8}$/.test(t);
}
