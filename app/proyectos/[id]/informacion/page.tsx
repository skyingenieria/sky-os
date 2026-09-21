import { createClient } from "@/lib/supabase/server";
import InformacionEditor from "@/components/InformacionEditor";

export const dynamic = "force-dynamic";

export default async function InformacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyectoId = Number(id);
  const supabase = await createClient();

  const [proy, niv, mur, sol] = await Promise.all([
    supabase.from("proyectos").select("*").eq("id", proyectoId).single(),
    supabase.from("proyecto_niveles").select("*").eq("proyecto_id", proyectoId).order("orden"),
    supabase.from("proyecto_muros").select("*").eq("proyecto_id", proyectoId).order("orden"),
    supabase
      .from("proyecto_solados")
      .select("id, zona, orden, capas:proyecto_solado_capas(id, detalle, espesor, unidad, orden)")
      .eq("proyecto_id", proyectoId)
      .order("orden")
      .order("orden", { foreignTable: "proyecto_solado_capas" }),
  ]);

  return (
    <InformacionEditor
      proyecto={proy.data as never}
      niveles={(niv.data as never[]) ?? []}
      muros={(mur.data as never[]) ?? []}
      solados={(sol.data as never[]) ?? []}
    />
  );
}
