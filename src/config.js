// Configuración del proyecto. Revisar antes de publicar (Fase 0 del pliego).

// Número WhatsApp de TecRural con prefijo de país, sin "+" ni espacios.
// Se puede sobrescribir con la variable de entorno VITE_WHATSAPP_NUMBER.
const WHATSAPP_DEFECTO = "34600000000"; // marcador: TecRural aún sin número propio

export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER || WHATSAPP_DEFECTO).replace(/\D/g, "");

// false mientras el número sea el marcador: el modal avisa y desactiva el
// enlace directo a WhatsApp hasta que haya uno real.
export const WHATSAPP_CONFIGURADO = WHATSAPP_NUMBER !== WHATSAPP_DEFECTO;

// Si se define, cada lead se envía también por POST (Formspree, Supabase, Google Sheets...).
export const LEAD_ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT || "";

// Si se define, cada evento de analítica se envía por POST sin cookies.
export const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || "";

export const SEMAFORO = {
  verde: {
    color: "#1a7a3a",
    titulo: "Te compensa medir",
    texto: "Con tu finca, el kit se paga solo en menos de un año.",
  },
  amarillo: {
    color: "#c98a00",
    titulo: "Te compensa si compartes o ajustas",
    texto: "Está en el límite. Compartir el kit con un vecino o ajustar las horas lo hace rentable.",
  },
  rojo: {
    color: "#c0392b",
    titulo: "Con tu dotación, no te compensa el kit, te compensa ajustar horas",
    texto: "Corrige primero cuánto y cuándo riegas. Medir solo tiene sentido después.",
  },
};

export const EJEMPLO_LANDING = {
  cultivo: "aguacate",
  municipio: "velez",
  hectareas: 3,
  edad: "adulto",
  carga: "on",
  dotacion: 4000,
  horas: 12,
  goteros: 4,
  caudal: 2.2,
  produccion: 10000,
  precio: 2.5,
};
