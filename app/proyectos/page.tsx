import { createClient } from "@/lib/supabase/server";
import ProyectosList from "@/components/ProyectosList";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyectos")
    .select("id, nombre, codigo, cliente, estado, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <ProyectosList
      rows={(data as never[]) ?? []}
      loadError={error?.message ?? null}
    />
  );
}
