import { describe, it, expect } from "vitest";
import { calculate, core, economia, deficitMuyAlto, defaultAssumptions, DEFAULT_INPUTS } from "../src/lib/calc.js";
import { EJEMPLO_LANDING } from "../src/config.js";
import { encodeOverrides, decodeOverrides } from "../src/lib/share.js";
import { parseNum, telefonoValido, normalizarTelefono } from "../src/lib/format.js";

const cerca = (v, esperado, tol) =>
  expect(Math.abs(v - esperado)).toBeLessThanOrEqual(tol);

// Caso con déficit bajo: dotación alta y riego abundante (aplica más de lo que la finca pide).
const rExceso = { ...DEFAULT_INPUTS, dotacion: 8000, horas: 12, goteros: 16, caudal: 2.2 };
// Caso equilibrado: aplica casi toda la dotación sin pasarse.
const rEquilibrio = { ...DEFAULT_INPUTS, dotacion: 6800, horas: 16, goteros: 16, caudal: 2.2 };

describe("Ejemplo de validación del pliego (Vélez-Málaga, 3 ha, Adulto, ON)", () => {
  const res = calculate(EJEMPLO_LANDING);
  const { c, eco } = res;

  it("Kc = 0,85 * 1,00 * 1,00", () => {
    expect(c.kc).toBeCloseTo(0.85, 10);
    expect(c.kcLimitado).toBe(false);
  });

  it("ETc anual = 1.300 mm * 0,85", () => {
    expect(c.etcAnualMm).toBeCloseTo(1105, 8);
  });

  it("Necesidad neta = 1.105 - (420 * 0,70) = 811 mm", () => {
    expect(c.lluviaEfectivaMm).toBeCloseTo(294, 8);
    expect(c.necesidadNetaMm).toBeCloseTo(811, 8);
  });

  it("Necesidad bruta = 811 mm / 0,90 en m³/ha", () => {
    expect(c.necesidadBruta).toBeCloseTo(9011.1, 1);
  });

  it("Agua aplicada = (4 * 2,2 * 400 / 1000) * 12 * 30", () => {
    expect(c.caudalHa).toBeCloseTo(3.52, 8);
    expect(c.aguaAplicada).toBeCloseTo(1267.2, 6);
  });

  it("Déficit = bruta - min(dotación, aplicada)", () => {
    expect(c.disponible).toBeCloseTo(1267.2, 6);
    expect(c.deficit).toBeCloseTo(7743.9, 1);
  });

  it("Pérdida = min(35 %, déficit/bruta * 0,6)", () => {
    expect(c.pctPerdida).toBeCloseTo(0.35, 10);
    expect(c.kgPerdidos).toBeCloseTo(3500, 6);
    expect(c.eurosRiesgo).toBeCloseTo(8750, 6);
  });

  it("Ahorro: la recuperación se acota al calendario óptimo con la misma agua", () => {
    expect(eco.ahorroM3).toBeCloseTo(228.1, 1);
    expect(eco.ahorroEurosAgua).toBeCloseTo(79.8336, 4);
    // El calendario óptimo aplica hasta la dotación (4.000 m³/ha): el déficit
    // estructural sigue ahí y solo deja de perder ~163 kg de los 3.500.
    const cOpt = core(res.r, res.a, 4000);
    expect(cOpt.kgPerdidos).toBeCloseTo(3336.6, 1);
    expect(eco.kgRecuperados).toBeCloseTo(3500 - cOpt.kgPerdidos, 6);
    cerca(eco.kgRecuperados, 163.4, 0.2);
    expect(eco.eurosRecuperados).toBeCloseTo(eco.kgRecuperados * 2.5, 6);
    expect(eco.ahorroTotal).toBeCloseTo(eco.ahorroEurosAgua + eco.eurosRecuperados, 6);
    cerca(eco.paybackMeses, 20.9, 0.1);
  });

  it("Semáforo: déficit del 86 % es 'muy alto' -> rojo aunque el payback sea de 21 meses", () => {
    expect(c.pctDeficit).toBeGreaterThan(res.a.deficitCritico);
    expect(deficitMuyAlto(c, res.a)).toBe(true);
    expect(eco.semaforo).toBe("rojo");
    expect(res.avisos.some((x) => x.includes("más de la mitad"))).toBe(true);
  });

  it("totales de finca multiplican por hectáreas", () => {
    expect(res.totales.eurosRiesgo).toBeCloseTo(26250, 4);
    expect(res.totales.costeKit).toBeCloseTo(2550, 6);
  });
});

describe("Resto de la lógica", () => {
  const base = defaultAssumptions();
  const r = {
    ...DEFAULT_INPUTS,
    edad: "adulto",
    carga: "on",
  };

  it("Kc se limita entre 0,45 y 1,10 y avisa", () => {
    const res = calculate({ ...DEFAULT_INPUTS, edad: "joven", carga: "off" });
    expect(res.c.kc).toBeCloseTo(0.85 * 0.65 * 0.85, 10);
    const lim = calculate(DEFAULT_INPUTS, { kcBase: 2 });
    expect(lim.c.kc).toBe(1.1);
    expect(lim.c.kcLimitado).toBe(true);
    expect(lim.avisos.some((x) => x.includes("limitado"))).toBe(true);
  });

  it("si sobra agua, déficit 0 y sin riesgo", () => {
    const c = core({ ...r, edad: "joven", dotacion: 8000, horas: 40, goteros: 16 }, base);
    expect(c.deficit).toBe(0);
    expect(c.eurosRiesgo).toBe(0);
    expect(c.aguaSobra).toBe(true);
  });

  it("campos vacíos o fuera de rango usan el defecto y se marcan como supuesto", () => {
    const res = calculate({ ...DEFAULT_INPUTS, hectareas: 100, precio: NaN, produccion: -5 });
    expect(res.r.hectareas).toBe(2.5);
    expect(res.r.precio).toBe(2.5);
    expect(res.r.produccion).toBe(10000);
    expect(res.supuestos).toContain("Hectáreas");
    expect(res.supuestos).toContain("Precio");
    expect(res.supuestos).toContain("Kilos que cogiste");
  });

  it("semáforo por payback con déficit bajo: verde <=12, amarillo 12-24, rojo >24", () => {
    const c = core(rExceso, base);
    const cOpt = core(rExceso, base, Math.min(c.necesidadBruta, rExceso.dotacion));
    const ecoKit = (kit) => economia(c, rExceso, { ...base, costeKit: kit }, cOpt);
    expect(c.pctDeficit).toBeLessThan(base.deficitCritico);
    expect(ecoKit(100).semaforo).toBe("verde");
    expect(ecoKit(5000).semaforo).toBe("amarillo");
    expect(ecoKit(20000).semaforo).toBe("rojo");
  });

  it("déficit muy alto fuerza rojo aunque el payback sea bueno (regla del pliego)", () => {
    const bajo = calculate(rExceso, { deficitCritico: 0.3 });
    expect(bajo.c.pctDeficit).toBeGreaterThan(0.3);
    expect(bajo.eco.paybackMeses).toBeLessThan(12);
    expect(bajo.eco.semaforo).toBe("rojo");
  });

  it("el semáforo discrimina con el kit estándar: verde, amarillo y rojo son alcanzables", () => {
    // Riega de más con dotación de sobra: los sensores ahorran agua -> verde.
    const verde = calculate(rExceso);
    expect(verde.eco.paybackMeses).toBeLessThan(12);
    expect(verde.eco.semaforo).toBe("verde");
    // Equilibrado: aprovecha casi toda la dotación, poco margen de mejora -> amarillo.
    const amarillo = calculate(rEquilibrio);
    expect(amarillo.c.pctDeficit).toBeLessThan(amarillo.a.deficitCritico);
    cerca(amarillo.eco.paybackMeses, 20.6, 0.5);
    expect(amarillo.eco.semaforo).toBe("amarillo");
    // Por defecto (dotación 4.000, riego escaso): déficit estructural -> rojo.
    expect(calculate(DEFAULT_INPUTS).eco.semaforo).toBe("rojo");
  });

  it("sin dotación, el escenario B no promete agua que no hay", () => {
    const res = calculate({ ...DEFAULT_INPUTS, dotacion: 0 });
    const [A, B] = res.esc;
    expect(B.aguaAplicada).toBeCloseTo(A.aguaAplicada, 6);
    expect(B.eurosRiesgo).toBeCloseTo(A.eurosRiesgo, 6);
    expect(B.ahorroEuros).toBe(0);
    expect(B.descripcion).toContain("revisar el agua");
  });

  it("los sensores no recuperan más de lo que el calendario óptimo arregla", () => {
    const res = calculate({ ...DEFAULT_INPUTS, dotacion: 8000, horas: 4 });
    expect(res.eco.kgRecuperados).toBeLessThanOrEqual(res.c.kgPerdidos * res.a.recuperacion);
    const cOpt = core(res.r, res.a, Math.min(res.c.necesidadBruta, res.r.dotacion));
    expect(res.eco.kgRecuperados).toBeLessThanOrEqual(res.c.kgPerdidos - cOpt.kgPerdidos + 1e-9);
  });

  it("avisa si el agua aplicada parece alta", () => {
    const res = calculate({ ...DEFAULT_INPUTS, horas: 40, goteros: 16, caudal: 8 });
    expect(res.c.aguaAplicada).toBeGreaterThan(10000);
    expect(res.avisos.some((x) => x.includes("parece alto"))).toBe(true);
  });

  it("escenarios B y C son coherentes con A", () => {
    const res = calculate(DEFAULT_INPUTS);
    const [A, B, C] = res.esc;
    expect(A.eurosRiesgo).toBeCloseTo(res.c.eurosRiesgo, 6);
    expect(B.aguaAplicada).toBeCloseTo(Math.min(res.c.necesidadBruta, res.r.dotacion), 6);
    expect(B.eurosRiesgo).toBeLessThan(A.eurosRiesgo);
    expect(C.paybackMeses).toBeCloseTo(res.eco.paybackMeses, 6);
  });

  it("los tres cultivos calculan con sus propios valores", () => {
    for (const id of ["aguacate", "mango", "chirimoya"]) {
      const res = calculate({ ...DEFAULT_INPUTS, cultivo: id });
      expect(res.crop.id).toBe(id);
      expect(res.c.necesidadBruta).toBeGreaterThan(0);
      expect(res.c.aguaAplicada).toBeGreaterThan(0);
      expect(Number.isFinite(res.eco.paybackMeses)).toBe(true);
    }
    const mango = calculate({ ...DEFAULT_INPUTS, cultivo: "mango" });
    expect(mango.c.kc).toBeCloseTo(0.9, 10);
    expect(mango.a.arbolesHa).toBe(156);
    const chiri = calculate({ ...DEFAULT_INPUTS, cultivo: "chirimoya" });
    expect(chiri.c.kc).toBeCloseTo(0.8, 10);
    expect(chiri.a.arbolesHa).toBe(278);
  });

  it("cambiar un supuesto cambia el resultado (Fase 3)", () => {
    const normal = calculate(DEFAULT_INPUTS);
    const kc075 = calculate(DEFAULT_INPUTS, { kcBase: 0.75 });
    expect(kc075.c.necesidadBruta).toBeLessThan(normal.c.necesidadBruta);
  });

  it("enlace de supuestos: codifica y decodifica", () => {
    const o = { kcBase: 0.75, costeKit: 1200 };
    expect(decodeOverrides(encodeOverrides(o))).toEqual(o);
    expect(decodeOverrides(encodeOverrides({ deficitCritico: 0.3 }))).toEqual({ deficitCritico: 0.3 });
    expect(decodeOverrides("basura")).toEqual({});
    expect(decodeOverrides(encodeOverrides({ kcBase: "x" }))).toEqual({});
    expect(encodeOverrides({})).toBe("");
  });

  it("el enlace compara contra el base del cultivo/municipio activos", () => {
    const baseMango = defaultAssumptions("mango", "motril");
    // Sin cambios respecto a ese base: enlace vacío (antes serializaba los
    // valores por defecto del mango como si fueran ajustes del técnico).
    expect(encodeOverrides({ ...baseMango }, baseMango)).toBe("");
    const cambiado = { ...baseMango, kcBase: 0.75 };
    expect(decodeOverrides(encodeOverrides(cambiado, baseMango))).toEqual({ kcBase: 0.75 });
  });
});

describe("Formato y teléfono", () => {
  it("parseNum acepta coma y punto de miles", () => {
    expect(parseNum("2,5")).toBe(2.5);
    expect(parseNum("4.000")).toBe(4000);
    expect(parseNum("2.5")).toBe(2.5);
    expect(parseNum("1.234.567")).toBe(1234567);
    expect(Number.isNaN(parseNum(""))).toBe(true);
  });

  it("valida móvil español", () => {
    expect(telefonoValido("600123456")).toBe(true);
    expect(telefonoValido("+34 600 123 456")).toBe(true);
    expect(telefonoValido("0034600123456")).toBe(true);
    expect(telefonoValido("12345")).toBe(false);
    expect(telefonoValido("900123456")).toBe(true);
    expect(normalizarTelefono("+34 600 123 456")).toBe("600123456");
  });
});