// Enlaces compartibles con supuestos del técnico: /calculadora?asum=<base64 json>
import { defaultAssumptions, sanitizeOverrides, ASSUMPTION_KEYS } from "./calc.js";

// `base` es contra lo que se compara: desde el panel técnico hay que pasar el base
// del cultivo/municipio activos (defaultAssumptions(cultivo, municipio)) para no
// serializar como "cambios del técnico" los valores que solo difieren del caso
// por defecto (aguacate/Vélez) porque el cultivo o el municipio son otros.
export function encodeOverrides(overrides, base = defaultAssumptions()) {
  const diff = {};
  for (const k of ASSUMPTION_KEYS) {
    if (overrides[k] !== undefined && overrides[k] !== base[k]) diff[k] = overrides[k];
  }
  if (Object.keys(diff).length === 0) return "";
  const json = JSON.stringify(diff);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)));
}

export function decodeOverrides(encoded) {
  if (!encoded) return {};
  try {
    const bin = atob(encoded);
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return sanitizeOverrides(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return {};
  }
}