import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATALOGOS } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

export default async function CatalogosPage() {
  const supabase = await createClient();

  const counts = await Promise.all(
    CATALOGOS.map(async (c) => {
      const { count, error } = await supabase
        .from(c.table)
        .select("*", { count: "exact", head: true });
      return { slug: c.slug, count: error ? null : count ?? 0, error: error?.message };
    }),
  );
  const countBySlug = Object.fromEntries(counts.map((c) => [c.slug, c]));
  const anyError = counts.find((c) => c.error)?.error;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em" }}>
        MÓDULO 2
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px" }}>Catálogos globales</h1>
      <p style={{ color: "var(--text-muted)", margin: "0 0 24px", maxWidth: 640 }}>
        Fuente única de verdad de materiales, cargas y clasificaciones. Alimentan
        todos los proyectos; se editan una sola vez acá.
      </p>

      {anyError && (
        <div
          style={{
            border: "1px solid var(--warn)",
            background: "color-mix(in srgb, var(--warn) 12%, transparent)",
            color: "var(--warn)",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          No se pudo leer Supabase: {anyError}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 14,
        }}
      >
        {CATALOGOS.map((c) => {
          const info = countBySlug[c.slug];
          return (
            <Link
              key={c.slug}
              href={`/catalogos/${c.slug}`}
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                borderRadius: 12,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minHeight: 128,
                transition: "border-color .15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--brand)",
                  }}
                >
                  {info?.count ?? "—"}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
                {c.descripcion}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
