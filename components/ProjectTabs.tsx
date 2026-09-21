"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectTabs({ id }: { id: number }) {
  const pathname = usePathname();
  const base = `/proyectos/${id}`;
  const tabs = [
    { href: `${base}/informacion`, label: "Información" },
    { href: base, label: "Resumen" },
    { href: `${base}/cargas-muertas`, label: "Cargas muertas" },
    { href: `${base}/cargas-muro`, label: "Cargas de muro" },
    { href: `${base}/cargas-losa`, label: "Sobre losa" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginTop: 16 }}>
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: "9px 14px",
              fontSize: 13.5,
              fontWeight: active ? 700 : 500,
              color: active ? "var(--brand)" : "var(--text-muted)",
              borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
