"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EstadoBadge } from "@/components/ui";

interface Proyecto {
  id: number;
  nombre: string;
  codigo: string | null;
  cliente: string | null;
  estado: string | null;
}

export default function ProjectMenu({ proyecto }: { proyecto: Proyecto }) {
  const pathname = usePathname();
  const base = `/proyectos/${proyecto.id}`;

  const item = (href: string, label: string, n?: number, disabled = false, sub = false) => {
    const active = pathname === href;
    return (
      <Link
        key={href + label}
        href={disabled ? "#" : href}
        aria-disabled={disabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: sub ? "6px 10px 6px 30px" : "8px 12px",
          borderRadius: 8,
          fontSize: sub ? 12.5 : 13.5,
          color: disabled ? "var(--text-muted)" : active ? "var(--brand)" : "var(--text)",
          background: active ? "var(--surface-2)" : "transparent",
          fontWeight: active ? 700 : sub ? 400 : 500,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {n !== undefined && (
          <span style={{ fontSize: 10.5, fontVariantNumeric: "tabular-nums", color: "var(--text-muted)", minWidth: 15 }}>
            {String(n).padStart(2, "0")}
          </span>
        )}
        <span style={{ flex: 1 }}>{label}</span>
        {disabled && <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>pronto</span>}
      </Link>
    );
  };

  const cargasActive = pathname.startsWith(`${base}/cargas`);

  return (
    <aside
      style={{
        width: 234,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        height: "100dvh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/proyectos" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>← Proyectos</Link>
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6, lineHeight: 1.25 }}>{proyecto.nombre}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
          {proyecto.codigo && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{proyecto.codigo}</span>}
          <EstadoBadge estado={proyecto.estado} />
        </div>
      </div>

      <nav style={{ padding: 8, display: "flex", flexDirection: "column", gap: 1 }}>
        {item(base, "Resumen")}
        {item(`${base}/informacion`, "Información del proyecto", 1)}

        <div style={{ padding: "10px 12px 3px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)" }}>
          CÁLCULO
        </div>
        <div
          style={{
            padding: "8px 12px", fontSize: 13.5, borderRadius: 8, display: "flex", gap: 9,
            color: cargasActive ? "var(--brand)" : "var(--text)", fontWeight: cargasActive ? 700 : 500,
          }}
        >
          <span style={{ fontSize: 10.5, color: "var(--text-muted)", minWidth: 15 }}>03</span>
          Análisis de cargas
        </div>
        {item(`${base}/cargas-muertas`, "Cargas muertas", undefined, false, true)}
        {item(`${base}/cargas-muro`, "Cargas de muro", undefined, false, true)}
        {item(`${base}/cargas-losa`, "Sobre losa", undefined, false, true)}

        {item("#", "Losas de viguetas", 4, true)}
        {item("#", "Escaleras / estribos", 5, true)}
        {item("#", "Memorias PDF", 6, true)}
        {item("#", "Cómputo de materiales", 7, true)}
        {item("#", "Planillas de armaduras", 8, true)}
        {item("#", "Tareas por proyecto", 9, true)}
      </nav>
    </aside>
  );
}
