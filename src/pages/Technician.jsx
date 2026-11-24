import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppCtx } from "../App.jsx";
import { Button, Card, NumberField } from "../components/fields.jsx";
import { calculate, defaultAssumptions } from "../lib/calc.js";
import { encodeOverrides } from "../lib/share.js";
import { eur, fmtMeses, fmtNum, n0 } from "../lib/format.js";
import { SEMAFORO } from "../config.js";

const GRUPOS = [
  {
    titulo: "Clima del municipio",
    campos: [
      ["etoVerano", "Evaporación en verano", "mm/día"],
      ["etoAnual", "Evaporación al año", "mm/año"],
      ["lluvia", "Lluvia al año", "mm/año"],
    ],
  },
  {
    titulo: "Cultivo",
    campos: [
      ["kcBase", "Kc base", ""],
      ["fJoven", "Cobertura: joven", ""],
      ["fAdulto", "Cobertura: adulto", ""],
      ["fMayor", "Cobertura: mayor", ""],
      ["fOn", "Carga: año con mucha fruta", ""],
      ["fOff", "Carga: año con poca fruta", ""],
      ["arbolesHa", "Árboles por hectárea", "árboles"],
    ],
  },
  {
    titulo: "Riego y suelo",
    campos: [
      ["eficiencia", "Eficiencia del goteo", ""],
      ["factorLluvia", "Lluvia efectiva", ""],
      ["semanasRiego", "Semanas de riego al año", "semanas"],
    ],
  },
  {
    titulo: "Pérdida de producción",
    campos: [
      ["perdidaFactor", "Factor de pérdida por déficit", ""],
      ["perdidaMax", "Pérdida máxima", ""],
      ["deficitCritico", "Umbral de déficit crítico", ""],
    ],
  },
  {
    titulo: "Economía del kit",
    campos: [
      ["percolacion", "Ahorro de agua con sensores", ""],
      ["recuperacion", "Producción recuperada al medir", ""],
      ["costeAgua", "Coste del agua", "€/m³"],
      ["costeKit", "Coste del kit", "€/ha"],
    ],
  },
];

const ESCALA = {
  etoVerano: 0.1,
  etoAnual: 10,
  lluvia: 10,
  kcBase: 0.05,
  fJoven: 0.05,
  fAdulto: 0.05,
  fMayor: 0.05,
  fOn: 0.05,
  fOff: 0.05,
  arbolesHa: 1,
  eficiencia: 0.01,
  factorLluvia: 0.05,
  semanasRiego: 1,
  perdidaFactor: 0.05,
  perdidaMax: 0.05,
  deficitCritico: 0.05,
  percolacion: 0.01,
  recuperacion: 0.05,
  costeAgua: 0.01,
  costeKit: 10,
};

// Rangos recomendados por supuesto: evitan valores sin sentido (negativos,
// eficiencias de 5...) sin limitar el criterio del técnico.
const RANGOS = {
  etoVerano: [1, 12],
  etoAnual: [600, 2200],
  lluvia: [0, 1500],
  kcBase: [0.2, 1.5],
  fJoven: [0.2, 1.5],
  fAdulto: [0.2, 1.5],
  fMayor: [0.2, 1.5],
  fOn: [0.2, 1.5],
  fOff: [0.2, 1.5],
  arbolesHa: [50, 2000],
  eficiencia: [0.4, 1],
  factorLluvia: [0, 1],
  semanasRiego: [10, 52],
  perdidaFactor: [0, 2],
  perdidaMax: [0, 1],
  deficitCritico: [0, 1],
  percolacion: [0, 0.6],
  recuperacion: [0, 1],
  costeAgua: [0, 3],
  costeKit: [0, 5000],
};

export default function Technician() {
  const { inputs, overrides } = useContext(AppCtx);
  const navigate = useNavigate();
  const base = useMemo(() => defaultAssumptions(inputs.cultivo, inputs.municipio), [inputs.cultivo, inputs.municipio]);
  // Si se llega con supuestos en el enlace, se arranca desde ellos.
  const [a, setA] = useState({ ...base, ...overrides });
  const [copiado, setCopiado] = useState(false);
  const [errores, setErrores] = useState({});

  const set = (k, v) => {
    // Un campo vacío conserva el último valor válido: nunca rompe el cálculo.
    if (Number.isNaN(v)) return;
    // Fuera del rango recomendado tampoco se aplica: así lo que se ve en los
    // campos es siempre lo que usa el cálculo (antes un negativo se mostraba
    // pero el cálculo lo descartaba en silencio).
    const rango = RANGOS[k];
    if (rango && (v < rango[0] || v > rango[1])) {
      setErrores((prev) => ({
        ...prev,
        [k]: `Pon un valor entre ${fmtNum(rango[0], 2)} y ${fmtNum(rango[1], 2)}. El cálculo sigue con el último valor válido.`,
      }));
      return;
    }
    setErrores((prev) => {
      if (!prev[k]) return prev;
      const resto = { ...prev };
      delete resto[k];
      return resto;
    });
    setCopiado(false); // el enlace copiado antes ya no refleja estos valores
    setA((prev) => ({ ...prev, [k]: v }));
  };

  // La vista previa usa los datos del agricultor con los supuestos editados aquí.
  const preview = useMemo(() => calculate(inputs, a), [inputs, a]);
  const sem = SEMAFORO[preview.eco.semaforo];
  const tocados = Object.keys(a).filter((k) => a[k] !== base[k]).length;
  const codificado = encodeOverrides(a, base);
  const ruta = `/calculadora${codificado ? `?asum=${codificado}` : ""}`;

  const compartir = async () => {
    const url = `${window.location.origin}${ruta}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-[15px] font-bold uppercase tracking-wide text-soil">Panel técnico</p>
      <h1 className="text-[30px] font-extrabold sm:text-[40px]">Supuestos del cálculo</h1>
      <p className="mt-2 max-w-3xl text-[17px] text-gray-600">
        Cambia cualquier supuesto y el resultado se recalcula al momento. Después genera un enlace para que el
        agricultor vea su cálculo con estos valores.
      </p>

      <Card className="mt-5">
        <p className="text-[16px] font-semibold text-gray-600">
          Vista previa con los datos del agricultor · {preview.crop.nombre} en {preview.mun.nombre}
          {tocados > 0 && <span className="font-bold text-avocado"> · {tocados} supuestos cambiados</span>}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Previo etiqueta="Necesidad" valor={`${n0(preview.c.necesidadBruta)} m³/ha`} />
          <Previo etiqueta="Agua aplicada" valor={`${n0(preview.c.aguaAplicada)} m³/ha`} />
          <Previo etiqueta="Dinero en riesgo" valor={`${eur(preview.c.eurosRiesgo)}/ha`} />
          <Previo etiqueta="Payback" valor={`${fmtMeses(preview.eco.paybackMeses)} meses`} />
        </div>
        <p className="mt-3 rounded-[12px] p-3 text-[17px] font-bold text-white" style={{ backgroundColor: sem.color }}>
          {sem.titulo}
        </p>
        {preview.avisos.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-[15px] text-gray-600">
            {preview.avisos.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {GRUPOS.map((g) => (
          <Card key={g.titulo}>
            <h2 className="mb-3 text-[20px] font-extrabold">{g.titulo}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.campos.map(([k, label, unit]) => (
                <NumberField
                  key={k}
                  label={label}
                  value={a[k]}
                  onChange={(v) => set(k, v)}
                  unit={unit || undefined}
                  step={ESCALA[k]}
                  error={errores[k]}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button variant="primary" onClick={compartir}>
          {copiado ? "✓ Enlace copiado" : "Generar enlace con estos supuestos"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(ruta)}>
          Abrir la calculadora con estos supuestos
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setA(base);
            setCopiado(false);
            setErrores({});
          }}
        >
          Restablecer valores por defecto
        </Button>
        <Button variant="ghost" href="/resultado">
          Ver el resultado del agricultor
        </Button>
      </div>
      {copiado && (
        <p className="mt-3 text-[16px] text-gray-600">
          Enlace copiado. Pégalo en WhatsApp: el agricultor verá su cálculo con estos supuestos.
        </p>
      )}
    </div>
  );
}

function Previo({ etiqueta, valor }) {
  return (
    <div className="rounded-[14px] bg-bg p-3">
      <p className="text-[14px] font-semibold text-gray-600">{etiqueta}</p>
      <p className="text-[20px] font-extrabold leading-tight">{valor}</p>
    </div>
  );
}
