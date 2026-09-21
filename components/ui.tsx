import type { CSSProperties } from "react";

export const ESTADOS: Record<string, { label: string; color: string }> = {
  "N/C": { label: "No calculado", color: "#8b94a3" },
  C: { label: "Calculado", color: "#d97706" },
  R: { label: "Revisado", color: "#10b981" },
};

export function EstadoBadge({ estado }: { estado: string | null }) {
  const e = ESTADOS[estado ?? "N/C"] ?? ESTADOS["N/C"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        fontWeight: 600,
        color: e.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: e.color, display: "inline-block" }} />
      {estado ?? "N/C"}
    </span>
  );
}

export function btn(variant: "brand" | "ghost" | "danger" = "ghost"): CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background:
      variant === "brand" ? "var(--brand)" : variant === "danger" ? "transparent" : "var(--surface)",
    color:
      variant === "brand" ? "var(--brand-ink)" : variant === "danger" ? "var(--danger)" : "var(--text)",
  };
}

export const inputStyle: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
};

export function num(v: unknown, dp = 3): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(dp));
}
