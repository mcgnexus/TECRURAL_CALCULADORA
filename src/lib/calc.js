// Lógica de cálculo del pliego (Sección 6), implementada en el mismo orden.
// Las unidades de agua son m³/ha/año (1 mm sobre 1 ha = 10 m³/ha, aquí se trabaja
// directamente en m³/ha: ETc en mm x 10).
import { CROPS } from "../data/crops.js";
import { MUNICIPIOS } from "../data/municipalities.js";

export const DEFAULT_INPUTS = {
  cultivo: "aguacate",
  municipio: "velez",
  otroMunicipio: "",
  hectareas: 2.5,
  edad: "adulto",
  carga: "on",
  dotacion: 4000,
  horas: 12,
  goteros: 4,
  caudal: 2.2,
  produccion: 10000,
  precio: 2.5,
};

export const LIMITES = {
  hectareas: { min: 0.1, max: 50, defecto: 2.5 },
  dotacion: { min: 0, max: 8000, defecto: 4000 },
  horas: { min: 0, max: 40, defecto: 12 },
  goteros: { min: 1, max: 16 },
  caudal: { min: 0.5, max: 8 },
  produccion: { min: 0, max: 20000 },
  precio: { min: 0.1, max: 10 },
};

// Supuestos por defecto. El técnico puede cambiarlos todos (vista /tecnico).
export function defaultAssumptions(cropId = "aguacate", municipioId = "velez") {
  const crop = CROPS[cropId] ?? CROPS.aguacate;
  const mun = MUNICIPIOS[municipioId] ?? MUNICIPIOS.otro;
  return {
    // Clima del municipio
    etoVerano: mun.etoVerano,
    etoAnual: mun.etoAnual,
    lluvia: mun.lluvia,
    // Cultivo
    kcBase: crop.kcBase,
    fJoven: 0.65,
    fAdulto: 1.0,
    fMayor: 1.1,
    fOn: 1.0,
    fOff: 0.85,
    kcMin: 0.45,
    kcMax: 1.1,
    arbolesHa: crop.arbolesHa,
    // Riego y suelo
    eficiencia: 0.9,
    factorLluvia: 0.7,
    semanasRiego: 30,
    // Pérdida de producción
    perdidaFactor: 0.6,
    perdidaMax: 0.35,
    // Semáforo: déficit "muy alto" (fracción de la necesidad) a partir del cual
    // el problema es estructural (dotación o reparto) y el kit no es la solución
    // (pliego, semáforo rojo: "payback > 24 meses o déficit muy alto").
    deficitCritico: 0.5,
    // Ahorro con sensores
    percolacion: 0.18,
    percolacionMin: 0.12,
    percolacionMax: 0.25,
    recuperacion: 0.4,
    costeAgua: 0.35,
    costeKit: 850,
  };
}

export const ASSUMPTION_KEYS = Object.keys(defaultAssumptions());

// Solo acepta claves conocidas con valores numéricos finitos (viene de una URL).
export function sanitizeOverrides(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const k of ASSUMPTION_KEYS) {
    const v = raw[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = v;
  }
  return out;
}

// Un campo vacío o fuera de rango no bloquea: se usa el defecto y se marca "Supuesto".
function usar(v, def, min, max) {
  if (typeof v !== "number" || Number.isNaN(v)) return { v: def, supuesto: true };
  if (v < min || v > max) return { v: def, supuesto: true };
  return { v, supuesto: false };
}

// Mensajes de error en lenguaje llano (Sección 7 del pliego). Vacío = sin error.
export function validateInputs(inputs) {
  const crop = CROPS[inputs.cultivo] ?? CROPS.aguacate;
  const e = {};
  const check = (key, min, max, msg) => {
    const v = inputs[key];
    if (typeof v !== "number" || Number.isNaN(v) || v < min || v > max) e[key] = msg;
  };
  check("hectareas", 0.1, 50, "Pon entre 0,1 y 50 ha. Si tienes más, calcula por sector.");
  check("dotacion", 0, 8000, "Tiene que estar entre 0 y 8.000 m³/ha.");
  if (inputs.dotacion === 0)
    e.dotacion = "La dotación no puede ser 0. Si no la sabes, pon 4.000 y lo revisamos luego.";
  check("horas", 0, 40, "Pon entre 0 y 40 horas a la semana.");
  check("goteros", 1, 16, "Pon entre 1 y 16 goteros por árbol.");
  check("caudal", 0.5, 8, "Mira un gotero: suele poner 2 o 4 l/h.");
  check(
    "produccion",
    0,
    crop.maxProduccion,
    `Pon entre 0 y ${crop.maxProduccion.toLocaleString("es-ES")} kilos por hectárea.`,
  );
  check(
    "precio",
    crop.defaults.precioMin,
    crop.defaults.precioMax,
    `Pon entre ${crop.defaults.precioMin.toLocaleString("es-ES")} y ${crop.defaults.precioMax.toLocaleString("es-ES")} €/kg.`,
  );
  return e;
}

// Avisos suaves (no son errores): el cálculo sigue con el valor dado.
export function avisosInputs(r) {
  const a = [];
  if (r.horas === 0) a.push("Has puesto 0 horas de riego en verano: te decimos qué pasa si no riegas.");
  return a;
}

// Núcleo matemático. `applied` permite recalcular con otra agua aplicada (escenarios).
export function core(r, a, appliedOverride) {
  // 1. Kc ajustado
  const fCobertura = r.edad === "joven" ? a.fJoven : r.edad === "mayor" ? a.fMayor : a.fAdulto;
  const fCarga = r.carga === "on" ? a.fOn : a.fOff;
  const kcSinLimitar = a.kcBase * fCobertura * fCarga;
  const kcLimitado = kcSinLimitar < a.kcMin || kcSinLimitar > a.kcMax;
  const kc = Math.min(a.kcMax, Math.max(a.kcMin, kcSinLimitar));

  // 2. ETc
  const etcDiaria = a.etoVerano * kc;
  const etcAnualMm = a.etoAnual * kc;

  // 3. Necesidad neta
  const lluviaEfectivaMm = a.lluvia * a.factorLluvia;
  const necesidadNetaMm = Math.max(0, etcAnualMm - lluviaEfectivaMm);

  // 4. Necesidad bruta (mm -> m³/ha)
  const necesidadBruta = (necesidadNetaMm / a.eficiencia) * 10;

  // 5. Agua aplicada real
  const caudalArbol = r.goteros * r.caudal; // l/h
  const caudalHa = (caudalArbol * a.arbolesHa) / 1000; // m³/h
  const aguaAplicada =
    appliedOverride ?? caudalHa * r.horas * a.semanasRiego; // m³/ha/año

  // 6. Déficit
  const disponible = Math.min(r.dotacion, aguaAplicada);
  const deficit = Math.max(0, necesidadBruta - disponible);
  const aguaSobra = deficit === 0;

  // 7. Producción en riesgo
  const pctDeficit = necesidadBruta > 0 ? deficit / necesidadBruta : 0;
  const pctPerdida = Math.min(a.perdidaMax, pctDeficit * a.perdidaFactor);
  const kgPerdidos = r.produccion * pctPerdida;
  const eurosRiesgo = kgPerdidos * r.precio;

  return {
    kc,
    kcSinLimitar,
    kcLimitado,
    etcDiaria,
    etcAnualMm,
    lluviaEfectivaMm,
    necesidadNetaMm,
    necesidadBruta,
    caudalArbol,
    caudalHa,
    aguaAplicada,
    disponible,
    deficit,
    aguaSobra,
    pctDeficit,
    pctPerdida,
    kgPerdidos,
    eurosRiesgo,
  };
}

// Regla del semáforo rojo del pliego: "payback > 24 meses o déficit muy alto".
// Con déficit muy alto el problema es estructural (dotación o reparto), no de medir.
export function deficitMuyAlto(c, a) {
  return c.necesidadBruta > 0 && c.pctDeficit > a.deficitCritico;
}

// 8. Ahorro con sensores y 9. Payback.
// `cOptimo` es el mismo cálculo con el mejor calendario posible con la MISMA agua
// (aplicar hasta la dotación, sin pasar de la necesidad). Los sensores solo pueden
// recuperar la producción que ese calendario arreglaría: si el déficit es
// estructural (dotación corta), medir no fabrica agua.
export function economia(c, r, a, cOptimo) {
  const ahorroM3 = c.aguaAplicada * a.percolacion;
  const ahorroEurosAgua = ahorroM3 * a.costeAgua;
  const recuperables = cOptimo ? Math.max(0, c.kgPerdidos - cOptimo.kgPerdidos) : c.kgPerdidos;
  const kgRecuperados = Math.min(c.kgPerdidos * a.recuperacion, recuperables);
  const eurosRecuperados = kgRecuperados * r.precio;
  const ahorroTotal = ahorroEurosAgua + eurosRecuperados;
  const ahorroMin = ahorroTotal * 0.8;
  const ahorroMax = ahorroTotal * 1.2;
  const paybackMeses = ahorroTotal > 0 ? a.costeKit / (ahorroTotal / 12) : Infinity;
  const semaforo = deficitMuyAlto(c, a)
    ? "rojo"
    : paybackMeses <= 12
      ? "verde"
      : paybackMeses <= 24
        ? "amarillo"
        : "rojo";
  return {
    ahorroM3,
    ahorroEurosAgua,
    kgRecuperados,
    eurosRecuperados,
    ahorroTotal,
    ahorroMin,
    ahorroMax,
    paybackMeses,
    semaforo,
  };
}

// Tres escenarios: A) como riegas hoy, B) con calendario optimizado,
// C) con sensores. Todos comparten la misma necesidad de la finca.
export function escenarios(r, a, c, eco, cOptimo) {
  const recompute = (applied) => core(r, a, applied);

  // B) Calendario: se aplica lo que la finca necesita, sin pasar de la dotación.
  // Sin dotación no hay calendario que arregle la cantidad: B = A, sin prometer
  // agua que el agricultor no tiene.
  const objetivoB = r.dotacion > 0 ? Math.min(c.necesidadBruta, r.dotacion) : c.aguaAplicada;
  const cB = recompute(objetivoB);
  const ahorroB = Math.max(0, c.aguaAplicada - cB.aguaAplicada) * a.costeAgua + (c.eurosRiesgo - cB.eurosRiesgo);
  const descripcionB =
    r.dotacion > 0
      ? "Riegas lo que la finca pide, sin pasarte ni quedarte corto."
      : "Sin dotación no hay calendario que arregle la cantidad: toca revisar el agua con la comunidad.";

  // C) Sensores: la fórmula del pliego (8) aplicada sobre el riego actual.
  const ecoC = economia(c, r, a, cOptimo);

  const mk = (id, nombre, descripcion, cc, ee, extra = {}) => ({
    id,
    nombre,
    descripcion,
    aguaAplicada: cc.aguaAplicada,
    deficit: cc.deficit,
    eurosRiesgo: cc.eurosRiesgo,
    ahorroEuros: extra.ahorroEuros ?? ee.ahorroTotal,
    ahorroM3: extra.ahorroM3 ?? ee.ahorroM3,
    costeKit: extra.costeKit ?? 0,
    paybackMeses: extra.paybackMeses ?? 0,
    semaforo: extra.semaforo ?? "verde",
  });

  return [
    mk("A", "Como riegas hoy", "Con las horas y goteros que nos has dicho.", c, null, {
      ahorroEuros: 0,
      ahorroM3: 0,
    }),
    mk("B", "Con calendario a ojo ajustado", descripcionB, cB, null, {
      ahorroEuros: ahorroB,
      ahorroM3: Math.max(0, c.aguaAplicada - cB.aguaAplicada),
    }),
    mk("C", "Con sensores", "Mides suelo y clima y riegas justo, con aviso en el móvil.", c, ecoC, {
      costeKit: a.costeKit,
      paybackMeses: eco.paybackMeses,
      semaforo: eco.semaforo,
    }),
  ];
}

// Punto de entrada: inputs del agricultor + cultivo + municipio + supuestos del técnico.
export function calculate(inputs, overrides = {}) {
  const crop = CROPS[inputs.cultivo] ?? CROPS.aguacate;
  const mun = MUNICIPIOS[inputs.municipio] ?? MUNICIPIOS.otro;
  const d = crop.defaults;
  const L = LIMITES;

  const hectareas = usar(inputs.hectareas, L.hectareas.defecto, L.hectareas.min, L.hectareas.max);
  const dotacion = usar(inputs.dotacion, L.dotacion.defecto, L.dotacion.min, L.dotacion.max);
  const horas = usar(inputs.horas, L.horas.defecto, L.horas.min, L.horas.max);
  const goteros = usar(inputs.goteros, d.goteros, L.goteros.min, L.goteros.max);
  const caudal = usar(inputs.caudal, d.caudal, L.caudal.min, L.caudal.max);
  const produccion = usar(inputs.produccion, d.produccion, L.produccion.min, crop.maxProduccion);
  const precio = usar(inputs.precio, d.precio, d.precioMin, d.precioMax);

  const r = {
    cultivo: crop.id,
    municipio: mun.id,
    otroMunicipio: inputs.otroMunicipio || "",
    hectareas: hectareas.v,
    edad: inputs.edad === "joven" || inputs.edad === "mayor" ? inputs.edad : "adulto",
    carga: inputs.carga === "off" ? "off" : "on",
    dotacion: dotacion.v,
    horas: horas.v,
    goteros: goteros.v,
    caudal: caudal.v,
    produccion: produccion.v,
    precio: precio.v,
  };

  const supuestos = [
    hectareas.supuesto && "Hectáreas",
    dotacion.supuesto && "Agua que te da la comunidad",
    horas.supuesto && "Horas de riego",
    goteros.supuesto && "Goteros por árbol",
    caudal.supuesto && "Caudal del gotero",
    produccion.supuesto && "Kilos que cogiste",
    precio.supuesto && "Precio",
  ].filter(Boolean);

  const a = { ...defaultAssumptions(crop.id, mun.id), ...sanitizeOverrides(overrides) };

  const c = core(r, a);
  // Mejor calendario posible con la misma agua: acota lo que los sensores pueden recuperar.
  const aplicacionOptima = r.dotacion > 0 ? Math.min(c.necesidadBruta, r.dotacion) : 0;
  const cOptimo = core(r, a, aplicacionOptima);
  const eco = economia(c, r, a, cOptimo);

  const avisos = [...avisosInputs(r)];
  if (c.kcLimitado)
    avisos.push("La sed del cultivo se ha limitado al rango válido (0,45 - 1,10). Revísalo en supuestos.");
  if (c.aguaAplicada > 10000) avisos.push("Revisa horas o caudal, parece alto.");
  if (deficitMuyAlto(c, a))
    avisos.push(
      "A la finca le falta más de la mitad del agua que necesita. El problema es de dotación o de reparto: los sensores por sí solos no lo arreglan.",
    );

  const totales = {
    eurosRiesgo: c.eurosRiesgo * r.hectareas,
    ahorroMin: eco.ahorroMin * r.hectareas,
    ahorroMax: eco.ahorroMax * r.hectareas,
    ahorroM3: eco.ahorroM3 * r.hectareas,
    costeKit: a.costeKit * r.hectareas,
    deficit: c.deficit * r.hectareas,
    aguaAplicada: c.aguaAplicada * r.hectareas,
    necesidadBruta: c.necesidadBruta * r.hectareas,
  };

  return {
    crop,
    mun,
    r,
    a,
    c,
    eco,
    supuestos,
    avisos,
    totales,
    esc: escenarios(r, a, c, eco, cOptimo),
  };
}
