"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { upsertCarga, deleteCarga } from "@/app/proyectos/actions";
import { btn, inputStyle } from "@/components/ui";

export interface Col {
  key: string;
  label: string;
  type?: "text" | "number";
  suffix?: string;
  datalist?: string[];
  step?: number;
  width?: number;
}
type Row = Record<string, string | number | null> & { id: number };

/**
 * Tabla editable inline para listas simples project-scoped.
 * `parent` es el FK que cuelga las filas nuevas (proyecto_id, solado_id, ...).
 */
export default function ListEditor({
  proyectoId,
  table,
  parent,
  columns,
  rows,
  addLabel = "+ Agregar fila",
}: {
  proyectoId: number;
  table: string;
  parent: { key: string; value: number };
  columns: Col[];
  rows: Row[];
  addLabel?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const listId = useId();

  function blank() {
    return Object.fromEntries(columns.map((c) => [c.key, ""]));
  }
  const [nueva, setNueva] = useState<Record<string, string>>(blank());

  function persist(id: number | null, values: Record<string, string>, orden: number) {
    const data: Record<string, unknown> = { [parent.key]: parent.value, orden };
    for (const c of columns) {
      const raw = values[c.key];
      data[c.key] = raw === "" || raw == null ? null : c.type === "number" ? Number(raw) : raw;
    }
    start(async () => {
      const res = await upsertCarga(table, proyectoId, id, data);
      if (res.ok) {
        setDraft({});
        setNueva(blank());
        router.refresh();
      }
    });
  }

  function remove(id: number) {
    start(async () => {
      const res = await deleteCarga(table, proyectoId, id);
      if (res.ok) router.refresh();
    });
  }

  const dv = (row: Row, k: string) => {
    const key = `${row.id}:${k}`;
    return draft[key] ?? (row[k] == null ? "" : String(row[k]));
  };
  const setDv = (row: Row, k: string, val: string) => setDraft((d) => ({ ...d, [`${row.id}:${k}`]: val }));
  const rowDirty = (row: Row) => columns.some((c) => `${row.id}:${c.key}` in draft);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
      {columns.some((c) => c.datalist) && (
        <>
          {columns.filter((c) => c.datalist).map((c) => (
            <datalist key={c.key} id={`${listId}-${c.key}`}>
              {c.datalist!.map((o) => <option key={o} value={o} />)}
            </datalist>
          ))}
        </>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
            {columns.map((c) => (
              <th key={c.key} style={{ padding: "8px 12px", fontWeight: 600, width: c.width }}>
                {c.label}{c.suffix ? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> [{c.suffix}]</span> : null}
              </th>
            ))}
            <th style={{ width: 1 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ borderTop: "1px solid var(--border)" }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "5px 8px" }}>
                  <input
                    type={c.type === "number" ? "number" : "text"}
                    step={c.step}
                    list={c.datalist ? `${listId}-${c.key}` : undefined}
                    value={dv(row, c.key)}
                    onChange={(e) => setDv(row, c.key, e.target.value)}
                    style={{ ...inputStyle, padding: "6px 8px" }}
                  />
                </td>
              ))}
              <td style={{ padding: "4px 8px", whiteSpace: "nowrap", textAlign: "right" }}>
                {rowDirty(row) && (
                  <button
                    style={{ ...btn("brand"), padding: "5px 9px", marginRight: 6 }}
                    disabled={pending}
                    onClick={() => persist(row.id, Object.fromEntries(columns.map((c) => [c.key, dv(row, c.key)])), row.orden as number ?? i)}
                  >
                    Guardar
                  </button>
                )}
                <button style={{ ...btn("danger"), padding: "5px 9px" }} disabled={pending} onClick={() => remove(row.id)}>✕</button>
              </td>
            </tr>
          ))}

          <tr style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
            {columns.map((c) => (
              <td key={c.key} style={{ padding: "5px 8px" }}>
                <input
                  type={c.type === "number" ? "number" : "text"}
                  step={c.step}
                  list={c.datalist ? `${listId}-${c.key}` : undefined}
                  placeholder={c.label}
                  value={nueva[c.key]}
                  onChange={(e) => setNueva((n) => ({ ...n, [c.key]: e.target.value }))}
                  style={{ ...inputStyle, padding: "6px 8px" }}
                />
              </td>
            ))}
            <td style={{ padding: "4px 8px", textAlign: "right", whiteSpace: "nowrap" }}>
              <button
                style={{ ...btn("ghost"), padding: "5px 9px" }}
                disabled={pending || columns.every((c) => !nueva[c.key])}
                onClick={() => persist(null, nueva, rows.length + 1)}
              >
                {addLabel}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
