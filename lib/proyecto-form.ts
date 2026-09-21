/**
 * Módulo 1 — opciones del formulario de "Reunión de información".
 * Listas cerradas del intake (sobrescribibles: el usuario puede tipear otra cosa).
 */

export const OPCIONES = {
  tipo_vivienda: ["Unifamiliar", "Multifamiliar"],
  sistema_estructural: ["Estructura independiente", "Mampostería portante", "N/A"],
  sistema_fundacion: ["Platea de fundación", "Bases aisladas", "Pilotes", "N/A"],
  sistema_losa: [
    "Losa de viguetas",
    "Losa maciza de hormigón",
    "Losa maciza de hormigón visto",
    "Loseta shap 30",
    "Losa maciza sin vigas",
  ],
  cubierta_inclinada: [
    "Cubierta de madera con teja ceramica",
    "Cubierta de madera con chapa",
    "Cubierta metálica con chapa",
    "N/A",
  ],
  pergola: ["Estructura de madera", "Estructura metálica", "N/A"],
  escalera: ["Losa entera", "Ortopoligonal", "N/A"],
  losa_radiante: ["Si", "No"],
} as const;

// Sugerencias (datalist) para campos de texto libre
export const SUGERENCIAS_MURO = [
  "Muro ladrillo hueco portante e=18",
  "Muro ladrillo hueco portante e=12",
  "Muro ladrillo hueco e=18",
  "Muro ladrillo hueco e=12",
  "Muro ladrillo hueco e=8",
  "Muro ladrillo común",
  "Tabique de hormigón e=15",
  "Tabique de hormigón e=20",
  "N/A",
];

export const SUGERENCIAS_SOLADO = [
  "Cielorraso durlok suspendido",
  "Cielorraso de yeso aplicado",
  "Cielorraso de madera",
  "Contrapiso de cemento, arena y cascote",
  "Contrapiso RDC300",
  "Contrapiso alivianado con telgopor",
  "Cubierta de chapa acanalada",
  "Cubierta de policarbonato alveolar",
  "Carpeta de cemento y arena",
  "Piso de madera dura",
  "Piso de porcellanato",
  "Hormigón p/piso radiante",
  "Placa de telgopor e=20 mm",
  "N/A",
];

export const ZONAS_SOLADO = [
  "Subsuelo",
  "Planta baja",
  "Planta alta",
  "Azotea accesible",
  "Azotea inaccesible",
  "Pérgola",
];

// Etiquetas de los campos de sistema estructural (para render del form)
export const CAMPOS_SISTEMA: { key: keyof typeof OPCIONES; label: string }[] = [
  { key: "sistema_estructural", label: "Sistema estructural" },
  { key: "sistema_fundacion", label: "Sistema de fundación" },
  { key: "sistema_losa", label: "Sistema de losa" },
  { key: "cubierta_inclinada", label: "Cubierta inclinada" },
  { key: "pergola", label: "Pérgolas" },
  { key: "escalera", label: "Escalera" },
  { key: "losa_radiante", label: "Losa radiante" },
];
