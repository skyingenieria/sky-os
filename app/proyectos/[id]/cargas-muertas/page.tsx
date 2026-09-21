import { createClient } from "@/lib/supabase/server";
import PaquetesEditor from "@/components/PaquetesEditor";

export const dynamic = "force-dynamic";

export default async function CargasMuertasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyectoId = Number(id);
  const supabase = await createClient();

  const [paq, mat, est] = await Promise.all([
    supabase
      .from("paquetes_carga")
      .select("id, nombre, orden, estado, capas:paquete_capas(id, material_id, material_nombre, esp, gamma, q_directo, q, orden)")
      .eq("proyecto_id", proyectoId)
      .order("orden")
      .order("orden", { foreignTable: "paquete_capas" }),
    supabase.from("materiales").select("id, nombre, tipo_peso, peso").order("nombre"),
    supabase.from("estados_calculo").select("codigo").order("orden"),
  ]);

  return (
    <PaquetesEditor
      proyectoId={proyectoId}
      paquetes={(paq.data as never[]) ?? []}
      materiales={(mat.data as never[]) ?? []}
      estados={(est.data ?? []).map((e: { codigo: string }) => e.codigo)}
    />
  );
}
