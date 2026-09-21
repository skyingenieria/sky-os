import { createClient } from "@/lib/supabase/server";
import CargaEditor from "@/components/CargaEditor";

export const dynamic = "force-dynamic";

export default async function CargasLosaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyectoId = Number(id);
  const supabase = await createClient();

  const [rows, mamp, niv, est] = await Promise.all([
    supabase.from("cargas_muro_losa").select("*").eq("proyecto_id", proyectoId).order("orden"),
    supabase.from("tipos_mamposteria").select("id, codigo, qp").order("codigo"),
    supabase.from("niveles").select("codigo, nombre").order("orden"),
    supabase.from("estados_calculo").select("codigo").order("orden"),
  ]);

  return (
    <CargaEditor
      kind="losa"
      proyectoId={proyectoId}
      rows={(rows.data as never[]) ?? []}
      mamposterias={(mamp.data as never[]) ?? []}
      niveles={(niv.data as never[]) ?? []}
      tiposMuro={[]}
      estados={(est.data ?? []).map((e: { codigo: string }) => e.codigo)}
    />
  );
}
