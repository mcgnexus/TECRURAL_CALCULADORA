import { createContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { calculate, DEFAULT_INPUTS } from "./lib/calc.js";
import { decodeOverrides } from "./lib/share.js";
import { Header, Footer } from "./components/layout.jsx";
import Landing from "./pages/Landing.jsx";
import Calculator from "./pages/Calculator.jsx";
import Result from "./pages/Result.jsx";
import Technician from "./pages/Technician.jsx";

export const AppCtx = createContext(null);
const KEY = "tecrural_inputs";

function cargar() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object") return { ...DEFAULT_INPUTS, ...raw };
  } catch {
    /* storage no disponible */
  }
  return { ...DEFAULT_INPUTS };
}

export default function App() {
  const [inputs, setInputsState] = useState(cargar);
  const location = useLocation();

  // Guardar al salir de la página o al ocultarla (cambiar de app en el móvil,
  // deslizar para cerrar): no interfiere con la escritura en los campos.
  useEffect(() => {
    const guardar = () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(inputs));
      } catch {
        /* sin almacenamiento */
      }
    };
    const alOcultar = () => {
      if (document.visibilityState === "hidden") guardar();
    };
    window.addEventListener("pagehide", guardar);
    document.addEventListener("visibilitychange", alOcultar);
    return () => {
      window.removeEventListener("pagehide", guardar);
      document.removeEventListener("visibilitychange", alOcultar);
    };
  }, [inputs]);

  const overrides = useMemo(() => decodeOverrides(new URLSearchParams(location.search).get("asum")), [location.search]);

  const result = useMemo(() => calculate(inputs, overrides), [inputs, overrides]);

  const value = useMemo(
    () => ({
      inputs,
      overrides,
      result,
      setInputs: setInputsState,
      reset: () => setInputsState({ ...DEFAULT_INPUTS }),
    }),
    [inputs, overrides, result],
  );

  return (
    <AppCtx.Provider value={value}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/calculadora" element={<Calculator />} />
            <Route path="/resultado" element={<Result />} />
            <Route path="/tecnico" element={<Technician />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppCtx.Provider>
  );
}
