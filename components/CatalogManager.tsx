"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { evalTerms, type CatalogDef, type Row } from "@/lib/catalogos";
import { upsertRow, deleteRow } from "@/app/catalogos/actions";

const btn = (variant: "brand" | "ghost" | "danger"): React.CSSProperties => ({
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
});

function fmt(v: string | number | null): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(+v.toFixed(4));
  return v;
}

export default function CatalogManager({
  def,
  rows,
  loadError,
}: {
  def: CatalogDef;
  rows: Row[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const open = creating || editing !== null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const form = new FormData(e.currentTarget);
    const id = editing ? (editing.id as number) : null;
    startTransition(async () => {
      const res = await upsertRow(def.slug, id, form);
      if (!res.ok) return setErr(res.error ?? "Error al guardar");
      setCreating(false);
      setEditing(null);
      router.refresh();
    });
  }

  function onDelete(row: Row) {
    if (!confirm(`¿Eliminar "${row[def.fields[0].key]}"?`)) return;
    startTransition(async () => {
      const res = await deleteRow(def.slug, row.id as number);
      if (!res.ok) setErr(res.error ?? "Error al eliminar");
      else router.refresh();
    });
  }

  const allCols = [...def.fields, ...(def.computed ?? [])];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em" }}>
            MÓDULO 2 · CATÁLOGOS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0 4px" }}>
            {def.icon} {def.title}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13.5 }}>{def.descripcion}</p>
        </div>
        <button style={btn("brand")} onClick={() => { setCreating(true); setErr(null); }}>
          + Nuevo
        </button>
      </div>

      {(loadError || err) && (
        <div style={{ marginTop: 16, color: "var(--danger)", fontSize: 13 }}>
          {loadError ?? err}
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
              {allCols.map((c) => (
                <th key={c.key} style={{ padding: "10px 14px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {c.label}
                  {"suffix" in c && c.suffix ? (
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> [{c.suffix}]</span>
                  ) : null}
                </th>
              ))}
              <th style={{ padding: "10px 14px", width: 1 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={allCols.length + 1} style={{ padding: 24, color: "var(--text-muted)", textAlign: "center" }}>
                  Sin registros.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id as number} style={{ borderTop: "1px solid var(--border)" }}>
                {allCols.map((c) => {
                  const isComputed = (def.computed ?? []).some((cc) => cc.key === c.key);
                  return (
                    <td
                      key={c.key}
                      style={{
                        padding: "9px 14px",
                        color: isComputed ? "var(--brand)" : "var(--text)",
                        fontWeight: isComputed ? 600 : 400,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmt(row[c.key])}
                    </td>
                  );
                })}
                <td style={{ padding: "6px 10px", whiteSpace: "nowrap", textAlign: "right" }}>
                  <button style={{ ...btn("ghost"), padding: "5px 10px", marginRight: 6 }} onClick={() => { setEditing(row); setErr(null); }}>
                    Editar
                  </button>
                  <button style={{ ...btn("danger"), padding: "5px 10px" }} onClick={() => onDelete(row)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
        {rows.length} registro{rows.length === 1 ? "" : "s"}
      </div>

      {open && (
        <CatalogForm
          def={def}
          initial={editing}
          pending={isPending}
          error={err}
          onCancel={() => { setCreating(false); setEditing(null); setErr(null); }}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

function CatalogForm({
  def,
  initial,
  pending,
  error,
  onCancel,
  onSubmit,
}: {
  def: CatalogDef;
  initial: Row | null;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      def.fields.map((f) => [
        f.key,
        initial?.[f.key] != null ? String(initial[f.key]) : String(f.defaultValue ?? ""),
      ]),
    ),
  );

  const computedPreview = useMemo(() => {
    if (!def.computed) return [];
    const nums = Object.fromEntries(
      def.fields.map((f) => [f.key, Number(values[f.key]) || 0]),
    );
    return def.computed.map((c) => ({ label: c.label, suffix: c.suffix, value: evalTerms(c.terms, nums) }));
  }, [def, values]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 460,
          maxHeight: "90dvh",
          overflowY: "auto",
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>
          {initial ? "Editar" : "Nuevo"} · {def.title}
        </h2>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {def.fields.map((f) => (
            <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                {f.label}
                {f.suffix ? <span style={{ color: "var(--text-muted)" }}> [{f.suffix}]</span> : null}
                {f.required ? <span style={{ color: "var(--danger)" }}> *</span> : null}
              </span>

              {f.type === "enum" ? (
                <select
                  name={f.key}
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="" disabled>
                    Elegir…
                  </option>
                  {f.enumValues?.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  name={f.key}
                  rows={2}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              ) : (
                <input
                  name={f.key}
                  type={f.type === "number" ? "number" : "text"}
                  step={f.step}
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              )}
              {f.help ? (
                <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{f.help}</span>
              ) : null}
            </label>
          ))}

          {computedPreview.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 14px",
                background: "var(--surface-2)",
                borderRadius: 10,
              }}
            >
              {computedPreview.map((c) => (
                <div key={c.label}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
                    {+c.value.toFixed(4)}{" "}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>{c.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" style={btn("ghost")} onClick={onCancel} disabled={pending}>
              Cancelar
            </button>
            <button type="submit" style={btn("brand")} disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
};
