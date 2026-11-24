// Cultivos soportados. Los valores marcados como "referencia" deben revisarse
// con un técnico antes de publicar (Fase 0 del pliego: GO/NO-GO del técnico).

export const CROPS = {
  aguacate: {
    id: "aguacate",
    nombre: "Aguacate Hass",
    corto: "Aguacate",
    // Dato del pliego (Sección 6): Kc base 0,85 para Hass adulto.
    kcBase: 0.85,
    arbolesHa: 400, // marco 5x5 (dato del pliego)
    defaults: {
      produccion: 10000, // kg/ha
      precio: 2.5, // €/kg
      precioMin: 0.5,
      precioMax: 5,
      goteros: 4,
      caudal: 2.2,
    },
    maxProduccion: 20000,
    notas: "Kc base 0,85 (Hass adulto) y 400 árboles/ha según pliego.",
    origen: "pliego",
  },
  mango: {
    id: "mango",
    nombre: "Mango",
    corto: "Mango",
    // REFERENCIA (pendiente de revisión técnica). FAO-56 da Kc 0,95 en pleno
    // desarrollo para mango; como media de temporada se usa 0,90.
    kcBase: 0.9,
    arbolesHa: 156, // REFERENCIA: marco 8x8
    defaults: {
      produccion: 12000, // REFERENCIA: kg/ha en costa tropical
      precio: 1.2, // REFERENCIA: €/kg en origen
      precioMin: 0.3,
      precioMax: 5,
      goteros: 4,
      caudal: 2.2,
    },
    maxProduccion: 25000,
    notas: "Kc base 0,90, 156 árboles/ha, 12.000 kg/ha y 1,20 €/kg son valores de referencia, no del pliego.",
    origen: "referencia",
  },
  chirimoya: {
    id: "chirimoya",
    nombre: "Chirimoya",
    corto: "Chirimoya",
    // REFERENCIA (pendiente de revisión técnica).
    kcBase: 0.8,
    arbolesHa: 278, // REFERENCIA: marco 6x6
    defaults: {
      produccion: 8000, // REFERENCIA: kg/ha en costa tropical
      precio: 1.5, // REFERENCIA: €/kg en origen
      precioMin: 0.3,
      precioMax: 5,
      goteros: 4,
      caudal: 2.2,
    },
    maxProduccion: 20000,
    notas: "Kc base 0,80, 278 árboles/ha, 8.000 kg/ha y 1,50 €/kg son valores de referencia, no del pliego.",
    origen: "referencia",
  },
};

export const CROP_LIST = Object.values(CROPS);
