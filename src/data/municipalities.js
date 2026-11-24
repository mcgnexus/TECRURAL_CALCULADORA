// Datos base por municipio. Fuente declarada en el pliego: SIAR / RIA Andalucía.
export const MUNICIPIOS = {
  almunecar: {
    id: "almunecar",
    nombre: "Almuñécar",
    etoVerano: 5.2, // mm/día (jun-ago)
    etoAnual: 1350, // mm/año
    lluvia: 350, // mm/año
  },
  motril: { id: "motril", nombre: "Motril", etoVerano: 5.0, etoAnual: 1320, lluvia: 380 },
  velez: {
    id: "velez",
    nombre: "Vélez-Málaga",
    etoVerano: 4.9,
    etoAnual: 1300,
    lluvia: 420,
  },
  otro: { id: "otro", nombre: "Otro", etoVerano: 5.0, etoAnual: 1330, lluvia: 380 },
};

export const MUNICIPIO_LIST = ["almunecar", "motril", "velez", "otro"].map((id) => MUNICIPIOS[id]);
