"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: number;
}

type Data = Record<string, unknown>;

const ALLOWED: Record<string, string[]> = {
  proyectos: [
    "nombre", "codigo", "cliente", "estado", "tipo_vivienda", "barrio_lote", "cuit",
    "sistema_estructural", "sistema_fundacion", "sistema_losa", "cubierta_inclinada",
    "pergola", "escalera", "losa_radiante",
  ],
  paquetes_carga: ["proyecto_id", "nombre", "orden", "estado"],
  paquete_capas: ["paquete_id", "material_id", "material_nombre", "esp", "gamma", "q_directo", "orden"],
  cargas_muro: ["proyecto_id", "ubicacion", "nivel_codigo", "mamposteria_id", "muro_codigo", "qp", "altura", "estado", "orden"],
  cargas_muro_losa: ["proyecto_id", "losa", "nivel_codigo", "lx", "ly", "mamposteria_id", "muro_codigo", "qp", "l_muro", "altura", "estado", "orden"],
  proyecto_niveles: ["proyecto_id", "losa", "cota", "unidad", "orden"],
  proyecto_muros: ["proyecto_id", "detalle", "espesor", "unidad", "orden"],
  proyecto_solados: ["proyecto_id", "zona", "orden"],
  proyecto_solado_capas: ["solado_id", "detalle", "espesor", "unidad", "orden"],
};

function pick(table: string, data: Data): Data {
  const cols = ALLOWED[table];
  const out: Data = {};
  for (const c of cols) if (c in data) out[c] = data[c] === "" ? null : data[c];
  return out;
}

async function upsert(table: string, id: number | null, data: Data): Promise<ActionResult> {
  const supabase = await createClient();
  const payload = pick(table, data);
  if (id) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    return error ? { ok: false, error: error.message } : { ok: true, id };
  }
  const { data: row, error } = await supabase.from(table).insert(payload).select("id").single();
  return error ? { ok: false, error: error.message } : { ok: true, id: row?.id as number };
}

async function del(table: string, id: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ---- Proyectos ------------------------------------------------------------
export async function upsertProyecto(id: number | null, data: Data): Promise<ActionResult> {
  const r = await upsert("proyectos", id, data);
  revalidatePath("/proyectos");
  if (id) revalidatePath(`/proyectos/${id}`);
  return r;
}
export async function deleteProyecto(id: number): Promise<ActionResult> {
  const r = await del("proyectos", id);
  revalidatePath("/proyectos");
  return r;
}

// ---- Cargas (project-scoped) ---------------------------------------------
export async function upsertCarga(
  table: string,
  proyectoId: number,
  id: number | null,
  data: Data,
): Promise<ActionResult> {
  if (!ALLOWED[table]) return { ok: false, error: "Tabla no permitida" };
  const r = await upsert(table, id, data);
  revalidatePath(`/proyectos/${proyectoId}`, "layout");
  return r;
}
export async function deleteCarga(
  table: string,
  proyectoId: number,
  id: number,
): Promise<ActionResult> {
  if (!ALLOWED[table]) return { ok: false, error: "Tabla no permitida" };
  const r = await del(table, id);
  revalidatePath(`/proyectos/${proyectoId}`, "layout");
  return r;
}
