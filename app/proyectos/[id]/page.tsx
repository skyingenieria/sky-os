import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { num } from "@/components/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value, unit, href }: { label: string; value: string; unit?: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "block",
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
        {value}
        {unit ? <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}> {unit}</span> : null}
      </div>
    </Link>
  );
}

export default async function ProyectoResumen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proyectoId = Number(id);
  const supabase = await createClient();

  const [paq, muro, losa] = await Promise.all([
    supabase.from("paquetes_carga").select("nombre, capas:paquete_capas(q)").eq("proyecto_id", proyectoId),
    supabase.from("cargas_muro").select("id", { count: "exact", head: true }).eq("proyecto_id", proyectoId),
    supabase.from("cargas_muro_losa").select("id", { count: "exact", head: true }).eq("proyecto_id", proyectoId),
  ]);

  const paquetes = (paq.data ?? []) as { nombre: string; capas: { q: number | null }[] }[];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        <Stat label="Paquetes de carga muerta" value={String(paquetes.length)} href={`/proyectos/${proyectoId}/cargas-muertas`} />
        <Stat label="Cargas de muro" value={String(muro.count ?? 0)} href={`/proyectos/${proyectoId}/cargas-muro`} />
        <Stat label="Cargas sobre losa" value={String(losa.count ?? 0)} href={`/proyectos/${proyectoId}/cargas-losa`} />
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "28px 0 12px" }}>Cargas muertas superficiales</h2>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)", maxWidth: 520 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
              <th style={{ padding: "9px 14px", fontWeight: 600 }}>Paquete</th>
              <th style={{ padding: "9px 14px", fontWeight: 600, textAlign: "right" }}>Total [kN/m²]</th>
            </tr>
          </thead>
          <tbody>
            {paquetes.length === 0 && (
              <tr><td colSpan={2} style={{ padding: 16, color: "var(--text-muted)" }}>Sin paquetes.</td></tr>
            )}
            {paquetes.map((p) => (
              <tr key={p.nombre} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 14px" }}>{p.nombre}</td>
                <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 600, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
                  {num(p.capas.reduce((s, c) => s + (Number(c.q) || 0), 0), 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
