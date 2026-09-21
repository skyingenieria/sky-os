import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectTabs from "@/components/ProjectTabs";
import { EstadoBadge } from "@/components/ui";

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
    <div style={{ padding: "28px 40px 40px", maxWidth: 1100 }}>
      <Link href="/proyectos" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
        ← Proyectos
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0 }}>{proyecto.nombre}</h1>
        <EstadoBadge estado={proyecto.estado} />
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
        {[proyecto.codigo, proyecto.cliente].filter(Boolean).join(" · ") || "Sin datos"} · Módulo 3 · Análisis de cargas
      </div>

      <ProjectTabs id={proyecto.id} />

      <div style={{ marginTop: 22 }}>{children}</div>
    </div>
  );
}
