"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/catalogos";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Toma sólo las columnas declaradas en el catálogo (whitelist). */
function coerce(slug: string, form: FormData) {
  const def = getCatalog(slug);
  if (!def) throw new Error("Catálogo desconocido");
  const data: Record<string, unknown> = {};
  for (const f of def.fields) {
    const raw = form.get(f.key);
    if (raw === null || raw === "") {
      data[f.key] = f.required ? null : (f.defaultValue ?? null);
      continue;
    }
    data[f.key] = f.type === "number" ? Number(raw) : String(raw).trim();
  }
  return { def, data };
}

export async function upsertRow(
  slug: string,
  id: number | null,
  form: FormData,
): Promise<ActionResult> {
  try {
    const { def, data } = coerce(slug, form);
    const supabase = await createClient();
    const res = id
      ? await supabase.from(def.table).update(data).eq("id", id)
      : await supabase.from(def.table).insert(data);
    if (res.error) return { ok: false, error: res.error.message };
    revalidatePath(`/catalogos/${slug}`);
    revalidatePath("/catalogos");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteRow(slug: string, id: number): Promise<ActionResult> {
  const def = getCatalog(slug);
  if (!def) return { ok: false, error: "Catálogo desconocido" };
  const supabase = await createClient();
  const { error } = await supabase.from(def.table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/catalogos/${slug}`);
  revalidatePath("/catalogos");
  return { ok: true };
}
