import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppCtx } from "../App.jsx";
import { Progress } from "../components/layout.jsx";
import { Button, Card, Chips, NumberField, SliderField } from "../components/fields.jsx";
import { CROPS, CROP_LIST } from "../data/crops.js";
import { MUNICIPIO_LIST } from "../data/municipalities.js";
import { validateInputs } from "../lib/calc.js";
import { track } from "../lib/analytics.js";

const EDADES = [
  { id: "joven", nombre: "Joven (menos de 4 años)" },
  { id: "adulto", nombre: "Adulto (4 a 10 años)" },
  { id: "mayor", nombre: "Mayor (más de 10 años)" },
];

const CARGAS = [
  { id: "on", nombre: "Con mucha fruta" },
  { id: "off", nombre: "Con poca fruta" },
];

const AYUDA = {
  hectareas: "Ej: 3,5 ha. Si tienes más de 50, calcula por sectores.",
  edad: "La edad media de tus árboles.",
  carga: "Si este año tienes mucha fruta, elige “con mucha fruta”.",
  dotacion: "Lo que te dice tu comunidad, no lo que riegas. Si no lo sabes, pon 4.000.",
  horas: "En julio, ¿cuántas horas a la semana abres el riego?",
  goteros: "Cuenta los goteros que tiene un árbol. Si no lo sabes, deja 4.",
  caudal: "Mira un gotero, ¿pone 2 l/h o 4 l/h? Si no lo sabes, deja 2,2.",
  produccion: "Los kilos que sacaste el año pasado por hectárea, más o menos.",
  precio: "¿A cuánto te lo pagaron de media?",
};

const ETIQUETA_SUPUESTO = {
  hectareas: "Hectáreas",
  dotacion: "Agua que te da la comunidad",
  horas: "Horas de riego",
  goteros: "Goteros por árbol",
  caudal: "Caudal del gotero",
  produccion: "Kilos que cogiste",
  precio: "Precio",
};

function BarraInferior({ children }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 bg-gradient-to-t from-bg via-bg to-transparent px-4 pb-4 pt-8">
      {children}
    </div>
  );
}

export default function Calculator() {
  const { inputs, setInputs, reset, result } = useContext(AppCtx);
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();
  const errors = validateInputs(inputs);
  const crop = CROPS[inputs.cultivo] ?? CROPS.aguacate;

  const esSupuesto = (key) => result.supuestos.includes(ETIQUETA_SUPUESTO[key]);

  const set = (key, value) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      // Al cambiar de cultivo se cargan sus valores por defecto.
      if (key === "cultivo") {
        const d = (CROPS[value] ?? CROPS.aguacate).defaults;
        next.produccion = d.produccion;
        next.precio = d.precio;
        next.goteros = d.goteros;
        next.caudal = d.caudal;
      }
      return next;
    });
  };

  const irAResultado = () => {
    window.scrollTo(0, 0);
    navigate("/resultado");
    track("resultado_visto", { cultivo: inputs.cultivo, municipio: inputs.municipio });
  };

  const cambiarPaso = (n) => {
    setPaso(n);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <Progress actual={paso} />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {paso === 1 ? (
          <section aria-labelledby="paso1">
            <p className="text-[15px] font-bold uppercase tracking-wide text-avocado">
              Paso 1 de 2 · Te queda 1 paso
            </p>
            <h1 id="paso1" className="mt-1 text-[30px] font-extrabold sm:text-[40px]">
              Cuéntame tu finca
            </h1>

            <div className="mt-6 space-y-5">
              <Card>
                <Chips
                  name="cultivo"
                  label="¿Qué cultivas?"
                  options={CROP_LIST.map((c) => ({ id: c.id, nombre: c.corto, detalle: c.notas }))}
                  value={inputs.cultivo}
                  onChange={(v) => set("cultivo", v)}
                />
              </Card>

              <Card>
                <Chips
                  name="municipio"
                  label="¿En qué municipio está?"
                  options={MUNICIPIO_LIST}
                  value={inputs.municipio}
                  onChange={(v) => set("municipio", v)}
                />
                {inputs.municipio === "otro" && (
                  <div className="mt-4">
                    <label htmlFor="otro-municipio" className="mb-2 block text-[19px] font-bold">
                      Tu municipio
                    </label>
                    <input
                      id="otro-municipio"
                      type="text"
                      value={inputs.otroMunicipio}
                      onChange={(e) => set("otroMunicipio", e.target.value)}
                      placeholder="Ej: Frigiliana"
                      className="h-14 w-full rounded-[14px] border-2 border-borde bg-white px-4 text-[19px] focus:border-avocado focus:outline-none"
                    />
                    <p className="mt-2 text-[16px] text-gray-600">
                      Usaremos los datos medios de la Costa Tropical.
                    </p>
                  </div>
                )}
              </Card>

              <Card className="space-y-6">
                <SliderField
                  label="Hectáreas"
                  help={AYUDA.hectareas}
                  value={inputs.hectareas}
                  onChange={(v) => set("hectareas", v)}
                  min={0.1}
                  max={50}
                  step={0.1}
                  unit="ha"
                  error={errors.hectareas}
                  marcado={esSupuesto("hectareas")}
                />
                <Chips
                  name="edad"
                  label="Edad de los árboles"
                  help={AYUDA.edad}
                  options={EDADES}
                  value={inputs.edad}
                  onChange={(v) => set("edad", v)}
                />
                <Chips
                  name="carga"
                  label="¿Cómo está el año?"
                  help={AYUDA.carga}
                  options={CARGAS}
                  value={inputs.carga}
                  onChange={(v) => set("carga", v)}
                />
              </Card>
            </div>

            <BarraInferior>
              <Button variant="primary" onClick={() => cambiarPaso(2)}>
                Siguiente: tu agua →
              </Button>
              <p className="mt-3 text-center text-[16px]">
                <Link to="/" className="underline underline-offset-4">
                  Volver al inicio
                </Link>
              </p>
            </BarraInferior>
          </section>
        ) : (
          <section aria-labelledby="paso2">
            <p className="text-[15px] font-bold uppercase tracking-wide text-water">Paso 2 de 2 · Último paso</p>
            <h1 id="paso2" className="mt-1 text-[30px] font-extrabold sm:text-[40px]">
              Ahora, tu agua
            </h1>

            <div className="mt-6 space-y-5">
              <Card>
                <SliderField
                  label="Agua que te da la comunidad"
                  help={AYUDA.dotacion}
                  value={inputs.dotacion}
                  onChange={(v) => set("dotacion", v)}
                  min={0}
                  max={8000}
                  step={100}
                  unit="m³/ha"
                  error={errors.dotacion}
                  marcado={esSupuesto("dotacion")}
                />
              </Card>

              <Card>
                <SliderField
                  label="Horas de riego por semana en verano"
                  help={AYUDA.horas}
                  value={inputs.horas}
                  onChange={(v) => set("horas", v)}
                  min={0}
                  max={40}
                  step={1}
                  unit="h/semana"
                  error={errors.horas}
                  marcado={esSupuesto("horas")}
                />
              </Card>

              <Card>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <NumberField
                    label="Goteros por árbol"
                    help={AYUDA.goteros}
                    value={inputs.goteros}
                    onChange={(v) => set("goteros", v)}
                    min={1}
                    max={16}
                    step={1}
                    unit="goteros"
                    error={errors.goteros}
                    marcado={esSupuesto("goteros")}
                  />
                  <NumberField
                    label="Caudal de cada gotero"
                    help={AYUDA.caudal}
                    value={inputs.caudal}
                    onChange={(v) => set("caudal", v)}
                    min={0.5}
                    max={8}
                    step={0.1}
                    unit="l/h"
                    error={errors.caudal}
                    marcado={esSupuesto("caudal")}
                  />
                </div>
              </Card>

              <Card>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <NumberField
                    label="Kilos que cogiste por hectárea"
                    help={AYUDA.produccion}
                    value={inputs.produccion}
                    onChange={(v) => set("produccion", v)}
                    min={0}
                    max={crop.maxProduccion}
                    step={100}
                    unit="kg/ha"
                    error={errors.produccion}
                    marcado={esSupuesto("produccion")}
                  />
                  <NumberField
                    label="Precio al que lo vendiste"
                    help={AYUDA.precio}
                    value={inputs.precio}
                    onChange={(v) => set("precio", v)}
                    min={crop.defaults.precioMin}
                    max={crop.defaults.precioMax}
                    step={0.1}
                    unit="€/kg"
                    error={errors.precio}
                    marcado={esSupuesto("precio")}
                  />
                </div>
              </Card>
            </div>

            <BarraInferior>
              <Button variant="lima" onClick={irAResultado}>
                Ver cuánto pierdo →
              </Button>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => cambiarPaso(1)}>
                  ← Volver a tu finca
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    reset();
                    cambiarPaso(1);
                  }}
                >
                  Restablecer y empezar de cero
                </Button>
              </div>
            </BarraInferior>
          </section>
        )}
      </div>
    </div>
  );
}
