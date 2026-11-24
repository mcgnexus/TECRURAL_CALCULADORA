// Lead: enlace WhatsApp pre-rellenado + guardado local + POST opcional.
import { WHATSAPP_NUMBER, LEAD_ENDPOINT } from "../config.js";

const KEY = "tecrural_leads";

export function resumenWhatsApp(res, nombre = "") {
  const { r, c, eco } = res;
  const f = (v) => Math.round(v).toLocaleString("es-ES");
  const lineas = [
    `Hola TecRural, quiero que reviséis mi cálculo de riego.`,
    nombre ? `Nombre: ${nombre}` : null,
    `Cultivo: ${res.crop.nombre}`,
    `Municipio: ${res.mun.id === "otro" ? r.otroMunicipio || "Otro" : res.mun.nombre}`,
    `Superficie: ${r.hectareas.toLocaleString("es-ES")} ha`,
    `Agua que me da la comunidad: ${f(r.dotacion)} m³/ha`,
    `Horas de riego en verano: ${f(r.horas)} h/semana`,
    `Necesidad de la finca: ${f(c.necesidadBruta)} m³/ha`,
    `Dinero en riesgo: ${f(c.eurosRiesgo)} €/ha`,
    `Ahorro estimado con sensores: ${f(eco.ahorroMin)}-${f(eco.ahorroMax)} €/ha`,
  ];
  return lineas.filter(Boolean).join("\n");
}

export function whatsappLink(texto) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}

export function guardarLead(lead) {
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]");
    localStorage.setItem(KEY, JSON.stringify([...prev, { ...lead, at: new Date().toISOString() }]));
  } catch {
    /* sin almacenamiento: el enlace WhatsApp sigue funcionando */
  }
  if (LEAD_ENDPOINT && fetch) {
    fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      keepalive: true,
    }).catch(() => {});
  }
}

export function leerLeads() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
