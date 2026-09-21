/**
 * Módulo 2 — Catálogos globales.
 * Config declarativa: cada catálogo mapea 1:1 a una tabla de Supabase.
 * El slug es la única fuente de nombres de tabla/columna hacia la DB
 * (whitelist), así las server actions nunca reciben identificadores libres.
 */

export type FieldType = "text" | "number" | "enum" | "textarea";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  enumValues?: string[];
  step?: number;
  suffix?: string;
  help?: string;
  defaultValue?: string | number;
}

export interface ComputedField {
  key: string;
  label: string;
  suffix?: string;
  /**
   * Preview serializable del valor que genera la DB: suma de productos.
   * Cada término es una lista de field keys que se multiplican entre sí;
   * el resultado es la suma de los términos.
   *   qp = [["esp_bloque","peso_bloque"],["esp_revoque","peso_revoque"]]
   */
  terms: string[][];
}

/** Evalúa un ComputedField.terms sobre un set de valores numéricos. */
export function evalTerms(terms: string[][], v: Record<string, number>): number {
  return terms.reduce(
    (sum, term) => sum + term.reduce((p, k) => p * (v[k] || 0), 1),
    0,
  );
}

export interface CatalogDef {
  slug: string;
  table: string;
  title: string;
  descripcion: string;
  icon: string;
  fields: Field[];
  computed?: ComputedField[];
  orderBy: string;
  ascending?: boolean;
}

export const CATALOGOS: CatalogDef[] = [
  {
    slug: "materiales",
    table: "materiales",
    title: "Materiales",
    descripcion: "Pesos propios de materiales (volumétrico kN/m³ o superficial kN/m²).",
    icon: "🧱",
    orderBy: "nombre",
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      {
        key: "tipo_peso",
        label: "Tipo de peso",
        type: "enum",
        required: true,
        enumValues: ["volumetrico", "superficial"],
        help: "volumetrico → kN/m³ · superficial → kN/m²",
      },
      { key: "peso", label: "Peso", type: "number", required: true, step: 0.001, help: "kN/m³ o kN/m² según tipo" },
      { key: "notas", label: "Notas", type: "textarea" },
    ],
  },
  {
    slug: "sobrecargas-uso",
    table: "sobrecargas_uso",
    title: "Sobrecargas de uso",
    descripcion: "Cargas de uso por destino (CIRSOC 101).",
    icon: "👥",
    orderBy: "nombre",
    fields: [
      { key: "nombre", label: "Destino", type: "text", required: true },
      { key: "valor", label: "Valor", type: "number", required: true, step: 0.1 },
      { key: "unidad", label: "Unidad", type: "text", defaultValue: "kN/m²" },
      { key: "ref_norma", label: "Ref. norma", type: "text", defaultValue: "CIRSOC 101" },
    ],
  },
  {
    slug: "sistemas-losa",
    table: "sistemas_losa",
    title: "Sistemas de losa",
    descripcion: "Peso propio por sistema de losa (kN/m²).",
    icon: "▦",
    orderBy: "nombre",
    fields: [
      { key: "nombre", label: "Sistema", type: "text", required: true },
      { key: "familia", label: "Familia", type: "text", help: "Viguetas · Maciza · Hueca pretensada" },
      { key: "peso_propio", label: "Peso propio", type: "number", required: true, step: 0.01, suffix: "kN/m²" },
    ],
  },
  {
    slug: "mamposteria",
    table: "tipos_mamposteria",
    title: "Tipos de mampostería",
    descripcion: "Mini-calculador: Qp = esp·γ del bloque + esp·γ del revoque.",
    icon: "🧮",
    orderBy: "codigo",
    fields: [
      { key: "codigo", label: "Código", type: "text", required: true },
      { key: "bloque", label: "Bloque", type: "text" },
      { key: "descripcion", label: "Descripción", type: "text", required: true },
      { key: "esp_bloque", label: "Esp. bloque", type: "number", required: true, step: 0.001, suffix: "m" },
      { key: "peso_bloque", label: "γ bloque", type: "number", required: true, step: 0.01, suffix: "kN/m³" },
      { key: "esp_revoque", label: "Esp. revoque", type: "number", step: 0.001, suffix: "m", defaultValue: 0 },
      { key: "peso_revoque", label: "γ revoque", type: "number", step: 0.01, suffix: "kN/m³", defaultValue: 0 },
    ],
    computed: [
      {
        key: "esp_total",
        label: "Esp. total",
        suffix: "m",
        terms: [["esp_bloque"], ["esp_revoque"]],
      },
      {
        key: "qp",
        label: "Qp",
        suffix: "kN/m²",
        terms: [
          ["esp_bloque", "peso_bloque"],
          ["esp_revoque", "peso_revoque"],
        ],
      },
    ],
  },
  {
    slug: "niveles",
    table: "niveles",
    title: "Niveles",
    descripcion: "Código estructural (000–1700) y su nivel físico.",
    icon: "🏢",
    orderBy: "orden",
    ascending: true,
    fields: [
      { key: "codigo", label: "Código", type: "text", required: true },
      { key: "nombre", label: "Nivel", type: "text", required: true },
      { key: "orden", label: "Orden", type: "number", required: true, step: 1 },
    ],
  },
  {
    slug: "tipos-muro",
    table: "tipos_muro",
    title: "Tipos de muro",
    descripcion: "Clasificación de mampostería para análisis de cargas.",
    icon: "🚧",
    orderBy: "nombre",
    fields: [{ key: "nombre", label: "Tipo", type: "text", required: true }],
  },
  {
    slug: "tipos-fundacion",
    table: "tipos_fundacion",
    title: "Tipos de fundación",
    descripcion: "Sistemas de fundación disponibles.",
    icon: "⚓",
    orderBy: "nombre",
    fields: [{ key: "nombre", label: "Tipo", type: "text", required: true }],
  },
  {
    slug: "estados-calculo",
    table: "estados_calculo",
    title: "Estados de cálculo",
    descripcion: "Semáforo global N/C → C → R.",
    icon: "🚦",
    orderBy: "orden",
    ascending: true,
    fields: [
      { key: "codigo", label: "Código", type: "text", required: true },
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "orden", label: "Orden", type: "number", required: true, step: 1 },
    ],
  },
];

export function getCatalog(slug: string): CatalogDef | undefined {
  return CATALOGOS.find((c) => c.slug === slug);
}

export type Row = Record<string, string | number | null>;
