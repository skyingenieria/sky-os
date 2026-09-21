import { createClient } from "@/lib/supabase/server";
import ProjectsSidebar from "@/components/ProjectsSidebar";

export const dynamic = "force-dynamic";

export default async function ProyectosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proyectos")
    .select("id, nombre, codigo, estado")
    .order("updated_at", { ascending: false });

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      <ProjectsSidebar proyectos={(data as never[]) ?? []} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
