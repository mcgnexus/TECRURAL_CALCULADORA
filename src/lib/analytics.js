// Analítica simple, sin cookies: capa dataLayer + registro local + endpoint opcional.
import { ANALYTICS_ENDPOINT } from "../config.js";

const KEY = "tecrural_eventos";

export function track(event, data = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]");
    localStorage.setItem(KEY, JSON.stringify([...prev, { event, at: new Date().toISOString(), ...data }].slice(-300)));
    if (ANALYTICS_ENDPOINT && navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify({ event, ...data }));
    }
  } catch {
    /* la analítica nunca debe romper la app */
  }
}
