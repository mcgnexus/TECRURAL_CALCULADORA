import { useEffect, useRef, useState } from "react";
import { WHATSAPP_NUMBER } from "../config.js";
import { Button } from "./fields.jsx";
import { guardarLead, resumenWhatsApp, whatsappLink } from "../lib/lead.js";
import { telefonoValido, normalizarTelefono } from "../lib/format.js";
import { track } from "../lib/analytics.js";

export default function LeadModal({ res, onClose }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [tocado, setTocado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const refTelefono = useRef(null);

  // Empezar en el teléfono, cerrar con Escape y bloquear el scroll del fondo.
  useEffect(() => {
    refTelefono.current?.focus();
    const overflowAntes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alPulsar = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", alPulsar);
    return () => {
      document.body.style.overflow = overflowAntes;
      window.removeEventListener("keydown", alPulsar);
    };
  }, [onClose]);

  const telefonoOk = telefonoValido(telefono);
  const puedeEnviar = telefonoOk && acepto;
  const municipio = res.mun.id === "otro" ? res.r.otroMunicipio || "Otro" : res.mun.nombre;
  const link = whatsappLink(resumenWhatsApp(res, nombre.trim()));

  const enviar = (e) => {
    e.preventDefault();
    setTocado(true);
    if (!puedeEnviar) return;
    guardarLead({
      nombre: nombre.trim(),
      telefono: normalizarTelefono(telefono),
      municipio,
      cultivo: res.crop.id,
      hectareas: res.r.hectareas,
      dotacion: res.r.dotacion,
      eurosRiesgo: Math.round(res.c.eurosRiesgo),
      ahorroMin: Math.round(res.eco.ahorroMin),
      ahorroMax: Math.round(res.eco.ahorroMax),
      acepta: acepto,
    });
    track("lead_enviado", { cultivo: res.crop.id });
    setEnviado(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep/70 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-titulo"
      onClick={(e) => {
        // Clic en el fondo (fuera del formulario): cerrar.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={enviar}
        noValidate
        className="no-print max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-5 sm:max-w-lg sm:rounded-[24px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="mb-2 float-right flex h-11 w-11 items-center justify-center rounded-full text-[26px] text-gray-500 hover:bg-bg"
        >
          ×
        </button>

        {enviado ? (
          <div>
            <h2 id="lead-titulo" className="pr-10 text-[26px] font-extrabold text-avocado">
              ¡Listo! Te escribimos en 24h con tu revisión.
            </h2>
            <p className="mt-3 text-[18px]">Mientras, guarda tu PDF.</p>
            {WHATSAPP_NUMBER === "34600000000" ? (
              <p className="mt-4 rounded-[14px] bg-lima-claro p-4 text-[16px] font-semibold text-deep">
                El enlace directo a WhatsApp se activará cuando TecRural configure su número.
              </p>
            ) : (
              <p className="mt-4">
                <Button variant="whatsapp" href={link} target="_blank" rel="noopener noreferrer" className="mt-0">
                  Abrir WhatsApp con mi resumen
                </Button>
              </p>
            )}
            <Button variant="secondary" onClick={onClose} className="mt-3">
              Volver a mi resultado
            </Button>
          </div>
        ) : (
          <div>
            <h2 id="lead-titulo" className="pr-10 text-[26px] font-extrabold">
              Que un técnico revise tu cálculo
            </h2>
            <p className="mt-2 text-[17px] text-gray-600">
              Sin compromiso. Solo te escribimos por WhatsApp, en 24h, con tu revisión.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="lead-nombre" className="mb-2 block text-[18px] font-bold">
                  Tu nombre <span className="font-normal text-gray-500">(opcional)</span>
                </label>
                <input
                  id="lead-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                  className="h-14 w-full rounded-[14px] border-2 border-borde bg-white px-4 text-[19px] focus:border-avocado focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="lead-telefono" className="mb-2 block text-[18px] font-bold">
                  Tu móvil de WhatsApp
                </label>
                <input
                  id="lead-telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  ref={refTelefono}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 600 123 456"
                  aria-invalid={tocado && !telefonoOk}
                  className="h-14 w-full rounded-[14px] border-2 border-borde bg-white px-4 text-[19px] focus:border-avocado focus:outline-none"
                />
                {tocado && !telefonoOk && (
                  <p role="alert" className="mt-2 text-[16px] font-semibold text-red-700">
                    Pon tu móvil de 9 números para escribirte por WhatsApp.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-[18px] font-bold">Municipio</p>
                <p className="rounded-[14px] border-2 border-borde bg-bg px-4 py-3 text-[18px]">{municipio}</p>
              </div>

              <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-[14px] border-2 border-borde p-3">
                <input
                  type="checkbox"
                  checked={acepto}
                  onChange={(e) => setAcepto(e.target.checked)}
                  className="mt-1 h-6 w-6 shrink-0 accent-[#1a7a3a]"
                />
                <span className="text-[16px]">
                  Acepto que me contacten por WhatsApp para revisar mi cálculo.
                </span>
              </label>
              {tocado && !acepto && (
                <p role="alert" className="-mt-2 text-[16px] font-semibold text-red-700">
                  Marca la casilla para poder escribirte.
                </p>
              )}
            </div>

            <Button type="submit" variant="whatsapp" className="mt-5" disabled={tocado && !puedeEnviar}>
              Enviar y recibir revisión en 24h
            </Button>
            <p className="mt-3 text-center text-[15px] text-gray-500">
              El resultado es tuyo aunque no envíes nada.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
