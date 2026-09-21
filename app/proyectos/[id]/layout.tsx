import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectMenu from "@/components/ProjectMenu";

export const dynamic = "force-dynamic";

export default async function ProyectoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("id, nombre, codigo, cliente, estado")
    .eq("id", Number(id))
    .single();

  if (!proyecto) notFound();

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      <ProjectMenu proyecto={proyecto as never} />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 40px 40px" }}>{children}</div>
    </div>
  );
}
