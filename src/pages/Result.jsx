import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppCtx } from "../App.jsx";
import { Progress } from "../components/layout.jsx";
import LeadModal from "../components/LeadModal.jsx";
import { Button, Card } from "../components/fields.jsx";
import { SEMAFORO } from "../config.js";
import { eur, n0, n1, n2, fmtMeses } from "../lib/format.js";
import { track } from "../lib/analytics.js";

const EDAD_TXT = { joven: "joven", adulto: "adulto", mayor: "mayor" };
const CARGA_TXT = { on: "año con mucha fruta", off: "año con poca fruta" };

export default function Result() {
  const { result: res, inputs, overrides } = useContext(AppCtx);
  const [lead, setLead] = useState(false);
  const [tab, setTab] = useState("C");

  const { r, c, eco, a } = res;
  const sem = SEMAFORO[eco.semaforo];
  const municipio = res.mun.id === "otro" ? r.otroMunicipio || "Otro" : res.mun.nombre;
  const sinAgua = c.aguaAplicada === 0;
  const hayOverrides = Object.keys(overrides).length > 0;

  const imprimir = () => {
    track("clic_pdf");
    window.print();
  };

  const abrirLead = () => {
    setLead(true);
    track("clic_whatsapp");
  };

  return (
    <div>
      <Progress actual={3} />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <p className="text-[15px] font-bold uppercase tracking-wide text-avocado">Tu resultado</p>
        <h1 className="mt-1 text-[30px] font-extrabold leading-tight sm:text-[40px]">
          Así está tu finca de {res.crop.corto.toLowerCase()}
        </h1>
        <p className="mt-1 text-[17px] text-gray-600">
          {r.hectareas.toLocaleString("es-ES")} ha en {municipio} · {EDAD_TXT[r.edad]} · {CARGA_TXT[r.carga]}
        </p>

        {/* SEMÁFORO */}
        <div
          className="mt-5 rounded-[18px] p-5 text-white"
          style={{ backgroundColor: sem.color }}
          role="status"
        >
          <p className="text-[26px] font-extrabold leading-tight sm:text-[32px]">{sem.titulo}</p>
          <p className="mt-1 text-[18px]">{sem.texto}</p>
        </div>

        {/* AVISOS */}
        {res.avisos.length > 0 && (
          <Card className="mt-4 border-lima bg-lima-claro/40">
            <ul className="list-disc space-y-1 pl-5 text-[16px] text-deep">
              {res.avisos.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* 3 NÚMEROS GIGANTES */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Numero etiqueta="Dinero en riesgo al año" valor={eur(c.eurosRiesgo)} unidad="€/ha" color="text-avocado" />
          <Numero
            etiqueta="El kit se paga en"
            valor={sinAgua ? "–" : fmtMeses(eco.paybackMeses)}
            unidad="meses"
            color="text-deep"
          />
          <Numero etiqueta="Lo que ahorras con sensores" valor={`${eur(eco.ahorroMin)} - ${eur(eco.ahorroMax)}`} unidad="al año por ha" color="text-water" />
        </div>
        <p className="mt-2 text-[15px] text-gray-500">
          En toda la finca: {eur(res.totales.eurosRiesgo)} en riesgo · ahorro de {eur(res.totales.ahorroMin)} a{" "}
          {eur(res.totales.ahorroMax)} · kit {eur(res.totales.costeKit)}.
        </p>

        {/* AGUA (secundario, pequeño) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="text-[20px] font-extrabold">Tu agua en un vistazo</h2>
            <Grafico necesidad={c.necesidadBruta} dotacion={r.dotacion} aplicada={c.aguaAplicada} />
            <p className="mt-3 text-[15px] text-gray-600">
              {c.aguaSobra
                ? "Tienes agua suficiente: tu problema no es cantidad, es reparto."
                : `Te faltan ${n0(c.deficit)} m³/ha al año: cubres el ${n0((1 - c.pctDeficit) * 100)} % de lo que la finca necesita.`}
            </p>
          </Card>

          <Card>
            <h2 className="text-[20px] font-extrabold">Por qué te sale este número</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[16px]">
              <li>
                Tu finca necesita <b>{n0(c.necesidadBruta)} m³/ha</b> al año (evaporación de tu zona × lo que bebe el{" "}
                {res.crop.corto.toLowerCase()}, menos la lluvia útil).
              </li>
              <li>
                Le llegan <b>{n0(c.disponible)} m³/ha</b>: lo mínimo entre lo que te da la comunidad ({n0(r.dotacion)}
                ) y lo que dejas pasar por los goteros ({n0(c.aguaAplicada)}).
              </li>
              <li>
                Por ese fallo de agua se pierde un {n1(c.pctPerdida * 100)} % de la cosecha: {n0(c.kgPerdidos)} kg ×{" "}
                {r.precio.toLocaleString("es-ES")} €/kg.
              </li>
            </ol>
          </Card>
        </div>

        {/* 3 ESCENARIOS */}
        <Card className="mt-4">
          <h2 className="text-[22px] font-extrabold">Tres caminos, comparados</h2>
          <div role="tablist" aria-label="Escenarios" className="mt-3 flex flex-wrap gap-2">
            {res.esc.map((e) => (
              <button
                key={e.id}
                role="tab"
                aria-selected={tab === e.id}
                onClick={() => setTab(e.id)}
                className={
                  "min-h-12 rounded-[12px] border-2 px-3 py-2 text-[16px] font-bold " +
                  (tab === e.id ? "border-avocado bg-avocado text-white" : "border-borde bg-white")
                }
              >
                {e.id}) {e.nombre}
              </button>
            ))}
          </div>
          {res.esc
            .filter((e) => e.id === tab)
            .map((e) => (
              <div key={e.id} className="mt-4 grid gap-3 sm:grid-cols-3" role="tabpanel">
                <Mini etiqueta="Agua que aplicas" valor={`${n0(e.aguaAplicada)} m³/ha`} />
                <Mini etiqueta="Dinero en riesgo" valor={`${eur(e.eurosRiesgo)}/ha`} />
                <Mini
                  etiqueta={e.id === "A" ? "Lo que ganas" : "Lo que ganas al año"}
                  valor={
                    e.id === "A"
                      ? "Nada nuevo"
                      : `${eur(Math.max(0, e.ahorroEuros))}/ha${e.id === "C" ? ` en ${fmtMeses(e.paybackMeses)} meses se paga` : ""}`
                  }
                />
                <p className="text-[16px] text-gray-600 sm:col-span-3">{e.descripcion}</p>
              </div>
            ))}
        </Card>

        {/* SUPUESTOS */}
        <Card className="mt-4">
          <h2 className="text-[22px] font-extrabold">Supuestos que puedes corregir</h2>
          <p className="mt-1 text-[16px] text-gray-600">
            No es una caja negra. Estos son los valores con los que hemos calculado:
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-2">
            <Sup nombre="Evaporación media al día en verano" valor={`${n1(a.etoVerano)} mm`} />
            <Sup nombre="Evaporación total al año" valor={`${n0(a.etoAnual)} mm`} />
            <Sup nombre="Lluvia al año (aprovechamos el 70 %)" valor={`${n0(a.lluvia)} mm`} />
            <Sup nombre="Lo que bebe el cultivo (respecto a la evaporación)" valor={n2(c.kc)} />
            <Sup nombre="Árboles por hectárea" valor={n0(a.arbolesHa)} />
            <Sup nombre="Semanas de riego al año" valor={n0(a.semanasRiego)} />
            <Sup nombre="Goteo que aprovecha el árbol" valor={`${n0(a.eficiencia * 100)} %`} />
            <Sup nombre="Precio del agua" valor={`${n2(a.costeAgua)} €/m³`} />
            <Sup nombre="Precio del kit de sensores" valor={`${eur(a.costeKit)}/ha`} />
            <Sup nombre="Déficit a partir del cual el kit no es la solución" valor={`${n0(a.deficitCritico * 100)} %`} />
            <Sup nombre="Suelo supuesto" valor="Franco" />
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" href="/tecnico" className="sm:w-auto">
              Corregir supuestos (técnico)
            </Button>
            {hayOverrides && (
              <Button variant="ghost" href="/calculadora" className="sm:w-auto">
                Quitar supuestos del técnico
              </Button>
            )}
          </div>
          {res.supuestos.length > 0 && (
            <p className="mt-3 rounded-[12px] bg-lima-claro/50 p-3 text-[16px] font-semibold text-deep">
              Hemos usado valores por defecto en: {res.supuestos.join(", ")}. Revísalos arriba para afinar el
              resultado.
            </p>
          )}
        </Card>

        {/* ACCIONES */}
        <div className="mt-6 space-y-3">
          <Button variant="whatsapp" onClick={abrirLead}>
            Quiero que me lo revisen con mis datos · WhatsApp
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="primary" onClick={imprimir}>
              Descargar PDF de 1 página
            </Button>
            <Button variant="secondary" href="/calculadora">
              Volver a calcular
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-[15px] text-gray-500">
          Estimación con rangos, no un número exacto. {inputs.cultivo === "aguacate" ? "" : "Los datos de referencia de este cultivo están pendientes de revisión técnica. "}
        </p>
      </div>

      {lead && <LeadModal res={res} onClose={() => setLead(false)} />}

      {/* Versión imprimible: 1 página */}
      <div id="print-area">
        <PrintArea res={res} municipio={municipio} />
      </div>
    </div>
  );
}

function Numero({ etiqueta, valor, unidad, color }) {
  return (
    <Card className={color}>
      <p className="text-[15px] font-semibold text-gray-600">{etiqueta}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-1">
        <span className="text-[40px] font-extrabold leading-none sm:text-[48px]">{valor}</span>
        <span className="text-[16px] font-semibold text-gray-500">{unidad}</span>
      </p>
    </Card>
  );
}

function Mini({ etiqueta, valor }) {
  return (
    <div className="rounded-[14px] bg-bg p-3">
      <p className="text-[14px] font-semibold text-gray-600">{etiqueta}</p>
      <p className="text-[22px] font-extrabold leading-tight">{valor}</p>
    </div>
  );
}

function Sup({ nombre, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-borde py-1">
      <dt className="text-gray-700">{nombre}</dt>
      <dd className="font-bold">{valor}</dd>
    </div>
  );
}

function Grafico({ necesidad, dotacion, aplicada }) {
  const max = Math.max(necesidad, dotacion, aplicada, 1);
  const barras = [
    { nombre: "Necesita", valor: necesidad, color: "#1a7a3a" },
    { nombre: "Comunidad", valor: dotacion, color: "#2a9dcc" },
    { nombre: "Aplicas", valor: aplicada, color: "#8b5e3c" },
  ];
  return (
    <div className="mt-3 space-y-3" role="img" aria-label={`La finca necesita ${n0(necesidad)} m³ por hectárea, la comunidad da ${n0(dotacion)} y aplicas ${n0(aplicada)}`}>
      {barras.map((b) => (
        <div key={b.nombre} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[16px] font-bold">{b.nombre}</span>
          <div className="h-8 flex-1 overflow-hidden rounded-lg bg-bg">
            <div className="h-full rounded-lg" style={{ width: `${(b.valor / max) * 100}%`, backgroundColor: b.color }} />
          </div>
          <span className="w-24 shrink-0 text-right text-[16px] font-bold">{n0(b.valor)} m³</span>
        </div>
      ))}
    </div>
  );
}

function PrintArea({ res, municipio }) {
  const { r, c, eco, a } = res;
  const fila = (k, v) => (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", padding: "2px 0" }}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
  return (
    <div>
      <h1 style={{ fontSize: "20px", color: "#0F4D24", margin: 0 }}>TecRural · Resultado de tu cálculo de riego</h1>
      <p style={{ margin: "4px 0 10px", color: "#555" }}>
        {res.crop.nombre} · {municipio} · {r.hectareas.toLocaleString("es-ES")} ha · {EDAD_TXT[r.edad]} ·{" "}
        {CARGA_TXT[r.carga]} · {new Date().toLocaleDateString("es-ES")}
      </p>

      <div style={{ border: "2px solid #1A7A3A", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "17px", color: "#1A7A3A" }}>{SEMAFORO[eco.semaforo].titulo}</h2>
        <p style={{ margin: "2px 0 0" }}>{SEMAFORO[eco.semaforo].texto}</p>
      </div>

      <h2 style={{ fontSize: "15px", margin: "8px 0 4px" }}>Los 3 números de tu finca (por hectárea y año)</h2>
      {fila("Dinero en riesgo", eur(c.eurosRiesgo))}
      {fila("El kit de sensores se paga en", `${fmtMeses(eco.paybackMeses)} meses`)}
      {fila("Ahorro estimado con sensores", `${eur(eco.ahorroMin)} - ${eur(eco.ahorroMax)}`)}
      {fila("En toda la finca: dinero en riesgo", eur(res.totales.eurosRiesgo))}

      <h2 style={{ fontSize: "15px", margin: "10px 0 4px" }}>Tu agua (por hectárea y año)</h2>
      {fila("Necesidad de la finca", `${n0(c.necesidadBruta)} m³`)}
      {fila("Agua que te da la comunidad", `${n0(r.dotacion)} m³`)}
      {fila("Agua que aplicas", `${n0(c.aguaAplicada)} m³`)}
      {fila("Lo que te falta", `${n0(c.deficit)} m³`)}

      <h2 style={{ fontSize: "15px", margin: "10px 0 4px" }}>Tus datos</h2>
      {fila("Horas de riego en verano", `${n0(r.horas)} h/semana · ${n0(r.goteros)} goteros/árbol · ${n1(r.caudal)} l/h`)}
      {fila("Producción y precio", `${n0(r.produccion)} kg/ha · ${r.precio.toLocaleString("es-ES")} €/kg`)}

      <h2 style={{ fontSize: "15px", margin: "10px 0 4px" }}>Supuestos usados (puedes corregirlos)</h2>
      {fila("Evaporación: verano / año", `${n1(a.etoVerano)} mm/día · ${n0(a.etoAnual)} mm/año`)}
      {fila("Lluvia al año (se aprovecha el 70 %)", `${n0(a.lluvia)} mm`)}
      {fila("Sed del cultivo (Kc)", n2(c.kc))}
      {fila("Árboles por hectárea", n0(a.arbolesHa))}
      {fila("Semanas de riego al año", n0(a.semanasRiego))}
      {fila("Aprovechamiento del goteo", `${n0(a.eficiencia * 100)} %`)}
      {fila("Suelo supuesto", "Franco")}
      {fila("Precio del agua", `${n2(a.costeAgua)} €/m³`)}
      {fila("Kit de sensores", `${eur(a.costeKit)}/ha`)}
      {fila("Déficit a partir del cual el kit no es la solución", `${n0(a.deficitCritico * 100)} %`)}
      {res.crop.origen === "referencia" &&
        fila("Aviso", "Los datos de referencia de este cultivo están pendientes de revisión técnica.")}

      <p style={{ marginTop: "10px", fontSize: "11px", color: "#555" }}>
        Estimación con rangos para decidir una inversión, no una medida exacta. IRRIGATE te dice cuándo regar cada día;
        TecRural te dice si te compensa invertir en medir.
      </p>
    </div>
  );
}
