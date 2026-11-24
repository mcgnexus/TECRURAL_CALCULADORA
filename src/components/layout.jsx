import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="no-print bg-deep text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-[22px] font-extrabold tracking-tight">
          Tec<span className="text-lima">Rural</span>
        </Link>
      </div>
    </header>
  );
}

const PASOS = [
  { n: 1, nombre: "Tu finca", icono: "🌳" },
  { n: 2, nombre: "Tu agua", icono: "💧" },
  { n: 3, nombre: "Tu resultado", icono: "📊" },
];

export function Progress({ actual }) {
  return (
    <nav aria-label="Progreso" className="no-print bg-white px-4 py-3">
      <ol className="mx-auto flex max-w-5xl items-center gap-2">
        {PASOS.map((p, i) => {
          const estado = p.n < actual ? "hecho" : p.n === actual ? "actual" : "pendiente";
          return (
            <li key={p.n} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-[18px] " +
                    (estado === "hecho"
                      ? "border-avocado bg-avocado text-white"
                      : estado === "actual"
                        ? "border-avocado bg-white"
                        : "border-borde bg-bg opacity-60")
                  }
                  aria-hidden="true"
                >
                  {estado === "hecho" ? "✓" : p.icono}
                </span>
                <span
                  className={
                    "text-center text-[14px] font-bold sm:text-[15px] " +
                    (estado === "actual" ? "text-avocado" : "text-gray-600")
                  }
                >
                  <span className="hidden sm:inline">{p.n}. </span>
                  {p.nombre}
                </span>
              </div>
              {i < PASOS.length - 1 && <div className="mb-6 h-0.5 flex-1 bg-borde" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="no-print bg-deep text-white/80">
      <div className="mx-auto max-w-5xl px-4 py-10 text-[16px]">
        <p className="mb-3 text-[18px] font-bold text-white">
          IRRIGATE te dice cuándo regar cada día. Nosotros te decimos si te compensa invertir en medir.
        </p>
        <p>
          Esta calculadora es una estimación para decidir una inversión, no un número exacto. Usa datos medios de tu
          zona y supuestos que puedes corregir. Pídenos una revisión gratuita con tus datos reales.
        </p>
        <p className="mt-4">
          <Link to="/tecnico" className="underline underline-offset-4 hover:text-white">
            Panel técnico
          </Link>
        </p>
      </div>
    </footer>
  );
}
