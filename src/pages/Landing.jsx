import { Link } from "react-router-dom";
import { Button, Card } from "../components/fields.jsx";
import { calculate } from "../lib/calc.js";
import { CROP_LIST } from "../data/crops.js";
import { EJEMPLO_LANDING } from "../config.js";
import { n0, n1 } from "../lib/format.js";
import { track } from "../lib/analytics.js";

const PASOS = [
  { icono: "🌳", titulo: "Tu finca", texto: "Cultivo, municipio, hectáreas y si es un año con mucha fruta." },
  { icono: "💧", titulo: "Tu agua", texto: "Lo que te da la comunidad, tus horas de riego y lo que cogiste." },
  { icono: "📊", titulo: "Tu resultado", texto: "Cuánto dinero tienes en riesgo y si te compensa medir." },
];

const PRUEBAS = ["Sin cuenta", "Con tus datos", "Revisión por WhatsApp en 24h"];

export default function Landing() {
  const ej = calculate(EJEMPLO_LANDING);
  const { c, eco } = ej;

  return (
    <div>
      {/* HERO */}
      <section className="bg-deep text-white">
        <div className="bg-[radial-gradient(120%_90%_at_80%_-10%,#1a7a3a_0%,transparent_60%),radial-gradient(90%_80%_at_0%_100%,#143f22_0%,transparent_55%)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-[16px] font-semibold text-lima">
            Aguacate Hass · Mango · Chirimoya
          </p>
          <h1 className="text-[32px] font-extrabold leading-[1.1] sm:text-[52px]">
            ¿Cuánto dinero pierdes por regar a ojo?
          </h1>
          <p className="mt-4 max-w-2xl text-[19px] text-white/85 sm:text-[22px]">
            En 2 minutos, sin registro, con tus datos. Te decimos si te compensa medir.
          </p>
          <div className="mt-8 max-w-md">
            <Button variant="lima" href="/calculadora" className="text-[20px]" onClick={() => track("inicio_calculadora", { desde: "hero" })}>
              Calcular ahora · Gratis →
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[17px] font-semibold">
            {PRUEBAS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="text-lima" aria-hidden="true">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        </div>
      </section>

      {/* Comparativa honesta con IRRIGATE */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-5xl gap-3 px-4 py-8 sm:grid-cols-2">
          <div className="rounded-[18px] border border-borde p-5">
            <p className="text-[15px] font-bold uppercase tracking-wide text-gray-500">IRRIGATE</p>
            <p className="mt-1 text-[20px] font-bold">Te dice cuándo regar cada día.</p>
          </div>
          <div className="rounded-[18px] border-2 border-avocado bg-bg p-5">
            <p className="text-[15px] font-bold uppercase tracking-wide text-avocado">TecRural</p>
            <p className="mt-1 text-[20px] font-bold">Te dice si te compensa invertir en medir.</p>
          </div>
        </div>
      </section>

      {/* 3 PASOS */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-center text-[28px] font-extrabold sm:text-[36px]">En 3 pasos y menos de 2 minutos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PASOS.map((p, i) => (
            <Card key={p.titulo} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg text-[28px]" aria-hidden="true">
                {p.icono}
              </div>
              <p className="mt-2 text-[14px] font-bold text-avocado">Paso {i + 1}</p>
              <p className="text-[20px] font-extrabold">{p.titulo}</p>
              <p className="mt-1 text-[17px] text-gray-600">{p.texto}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* EJEMPLO REAL: se calcula en vivo con las mismas fórmulas, nunca un número fijo */}
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <Card>
          <h2 className="text-[24px] font-extrabold">Ejemplo con datos reales, no promesa</h2>
          <p className="mt-1 text-[17px] text-gray-600">
            Finca de {ej.r.hectareas.toLocaleString("es-ES")} ha de aguacate en {ej.mun.nombre}, año con mucha fruta, con
            4.000 m³/ha de agua al año.
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Dato etiqueta="Necesidad de la finca" valor={n0(c.necesidadBruta)} unidad="m³/ha/año" />
            <Dato etiqueta="Dinero en riesgo" valor={n0(c.eurosRiesgo)} unidad="€/ha/año" limite />
            <Dato etiqueta="El kit se paga en" valor={n1(eco.paybackMeses)} unidad="meses" />
          </dl>
          <p className="mt-3 text-[15px] text-gray-500">
            Nota: el ejemplo muestra lo que aplican las fórmulas del pliego y no se ha confirmado con un técnico.
          </p>
        </Card>
      </section>

      {/* CULTIVOS */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-[28px] font-extrabold sm:text-[36px]">Cultivos que ya calculamos</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {CROP_LIST.map((c) => (
              <li key={c.id} className="rounded-[18px] border border-borde p-4">
                <p className="text-[20px] font-extrabold">{c.nombre}</p>
                <p className="mt-1 text-[15px] text-gray-600">{c.notas}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-[28px] font-extrabold sm:text-[36px]">¿Seguimos con tu finca?</h2>
        <p className="mx-auto mt-2 max-w-xl text-[19px] text-gray-600">
          Sin cuenta y sin comprometerte. Solo {CROP_LIST.length} cultivos, 4 municipios y 2 minutos.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="primary" href="/calculadora" onClick={() => track("inicio_calculadora", { desde: "cta_final" })}>
            Calcular ahora · Gratis →
          </Button>
        </div>
        <p className="mt-4 text-[16px] text-gray-500">
          <Link to="/resultado" className="underline underline-offset-4">
            Ver mi último cálculo
          </Link>
        </p>
      </section>
    </div>
  );
}

function Dato({ etiqueta, valor, unidad, limite }) {
  return (
    <div className="rounded-[14px] bg-bg p-4 text-left">
      <dt className="text-[15px] font-semibold text-gray-600">{etiqueta}</dt>
      <dd className="mt-1 flex items-baseline gap-1">
        <span className={"text-[34px] font-extrabold leading-none " + (limite ? "text-avocado" : "text-deep")}>
          {valor}
        </span>
        <span className="text-[15px] font-semibold text-gray-500">{unidad}</span>
      </dd>
    </div>
  );
}
