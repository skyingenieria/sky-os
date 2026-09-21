"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATALOGOS } from "@/lib/catalogos";

const MODULOS = [
  { n: 1, label: "Parámetros generales", href: null },
  { n: 2, label: "Catálogos globales", href: "/catalogos" },
  { n: 3, label: "Análisis de cargas", href: null },
  { n: 4, label: "Losas de viguetas", href: null },
  { n: 5, label: "Escaleras / estribos", href: null },
  { n: 6, label: "Memorias PDF", href: null },
  { n: 7, label: "Cómputo de materiales", href: null },
  { n: 8, label: "Planillas de armaduras", href: null },
  { n: 9, label: "Tareas por proyecto", href: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const inCatalogos = pathname.startsWith("/catalogos");

  return (
    <aside
      style={{
        width: 268,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100dvh",
      }}
    >
      <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.02em" }}>
          SKY<span style={{ color: "var(--brand)" }}>·OS</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          Ingeniería estructural
        </div>
      </div>

      <nav style={{ padding: "10px 10px", overflowY: "auto", flex: 1 }}>
        {MODULOS.map((m) => {
          const active = m.href && pathname.startsWith(m.href);
          const disabled = !m.href;
          return (
            <div key={m.n}>
              <Link
                href={m.href ?? "#"}
                aria-disabled={disabled}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  color: disabled ? "var(--text-muted)" : "var(--text)",
                  background: active ? "var(--surface-2)" : "transparent",
                  opacity: disabled ? 0.55 : 1,
                  pointerEvents: disabled ? "none" : "auto",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text-muted)",
                    minWidth: 16,
                  }}
                >
                  {String(m.n).padStart(2, "0")}
                </span>
                {m.label}
                {disabled && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
                    pronto
                  </span>
                )}
              </Link>

              {m.n === 2 && inCatalogos && (
                <div style={{ margin: "2px 0 6px 26px", display: "flex", flexDirection: "column" }}>
                  {CATALOGOS.map((c) => {
                    const cactive = pathname === `/catalogos/${c.slug}`;
                    return (
                      <Link
                        key={c.slug}
                        href={`/catalogos/${c.slug}`}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          fontSize: 13,
                          color: cactive ? "var(--brand)" : "var(--text-muted)",
                          background: cactive ? "var(--surface-2)" : "transparent",
                          fontWeight: cactive ? 600 : 400,
                        }}
                      >
                        {c.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
        Módulo 2 · dev
      </div>
    </aside>
  );
}
