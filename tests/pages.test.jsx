// Prueba de humo: cada página debe renderizar sin lanzar errores para cada cultivo.
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App, { AppCtx } from "../src/App.jsx";
import Landing from "../src/pages/Landing.jsx";
import Calculator from "../src/pages/Calculator.jsx";
import Result from "../src/pages/Result.jsx";
import Technician from "../src/pages/Technician.jsx";
import LeadModal from "../src/components/LeadModal.jsx";
import { calculate, DEFAULT_INPUTS } from "../src/lib/calc.js";
import { CROP_LIST } from "../src/data/crops.js";

function ctx(inputs, overrides = {}) {
  return { inputs, overrides, result: calculate(inputs, overrides), setInputs: () => {}, reset: () => {} };
}

function render(ui, ruta = "/") {
  return renderToString(<MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>);
}

describe("Las páginas renderizan sin errores", () => {
  for (const crop of CROP_LIST) {
    it(`resultado completo con ${crop.id}`, () => {
      const inputs = { ...DEFAULT_INPUTS, cultivo: crop.id, municipio: "otro", otroMunicipio: "Frigiliana" };
      const html = render(<AppCtx.Provider value={ctx(inputs)}><Result /></AppCtx.Provider>);
      expect(html).toContain("Supuestos que puedes corregir");
      expect(html).toContain("print-area");
      expect(html).toContain(crop.nombre);
    });

    it(`calculadora paso 2 y formulario lead con ${crop.id}`, () => {
      const value = ctx({ ...DEFAULT_INPUTS, cultivo: crop.id });
      expect(render(<AppCtx.Provider value={value}><Calculator /></AppCtx.Provider>)).toContain("Cuéntame tu finca");
      const lead = render(<AppCtx.Provider value={value}><LeadModal res={value.result} onClose={() => {}} /></AppCtx.Provider>);
      expect(lead).toContain("Enviar y recibir revisión en 24h");
    });
  }

  it("portada, panel técnico y app completa", () => {
    const value = ctx(DEFAULT_INPUTS, { kcBase: 0.75, cuotaKit: 12 });
    expect(render(<AppCtx.Provider value={value}><Landing /></AppCtx.Provider>)).toContain("¿Cuánto dinero pierdes por regar a ojo?");
    const tec = render(<AppCtx.Provider value={value}><Technician /></AppCtx.Provider>);
    expect(tec).toContain("Generar enlace con estos supuestos");
    expect(tec).toContain("0,75");
    expect(render(<App />)).toContain("Calcular ahora");
  });

  it("campos vacíos no rompen el resultado", () => {
    const value = ctx({ ...DEFAULT_INPUTS, hectareas: NaN, precio: NaN, produccion: undefined });
    const html = render(<AppCtx.Provider value={value}><Result /></AppCtx.Provider>);
    expect(html).toContain("Supuesto");
  });
});
