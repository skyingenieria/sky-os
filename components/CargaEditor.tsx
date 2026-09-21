"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { upsertCarga, deleteCarga } from "@/app/proyectos/actions";
import { EstadoBadge, btn, inputStyle, num } from "@/components/ui";

export interface MamposteriaOpt {
  id: number;
  codigo: string;
  qp: number;
}
export interface NivelOpt {
  codigo: string;
  nombre: string;
}
export type Row = Record<string, string | number | null>;

type Kind = "muro" | "losa";

const TABLE: Record<Kind, "cargas_muro" | "cargas_muro_losa"> = {
  muro: "cargas_muro",
  losa: "cargas_muro_losa",
};

export default function CargaEditor({
  kind,
  proyectoId,
  rows,
  mamposterias,
  niveles,
  tiposMuro,
  estados,
}: {
  kind: Kind;
  proyectoId: number;
  rows: Row[];
  mamposterias: MamposteriaOpt[];
  niveles: NivelOpt[];
  tiposMuro: string[];
  estados: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const open = creating || editing !== null;

  const columns =
    kind === "muro"
      ? [
          { key: "ubicacion", label: "Ubicación" },
          { key: "nivel_codigo", label: "Nivel" },
          { key: "muro_codigo", label: "Muro" },
          { key: "qp", label: "Qp", suffix: "kN/m²", n: true },
          { key: "altura", label: "H", suffix: "m", n: true },
          { key: "qd", label: "qD", suffix: "kN/m", n: true, calc: true },
        ]
      : [
          { key: "losa", label: "Losa" },
          { key: "nivel_codigo", label: "Nivel" },
          { key: "lx", label: "Lx", suffix: "m", n: true },
          { key: "ly", label: "Ly", suffix: "m", n: true },
          { key: "muro_codigo", label: "Muro" },
          { key: "qp", label: "Qp", suffix: "kN/m²", n: true },
          { key: "l_muro", label: "L", suffix: "m", n: true },
          { key: "altura", label: "H", suffix: "m", n: true },
          { key: "p", label: "P", suffix: "kN", n: true, calc: true },
          { key: "qd", label: "QD", suffix: "kN/m²", n: true, calc: true },
        ];

  function save(data: Row) {
    setErr(null);
    start(async () => {
      const res = await upsertCarga(TABLE[kind], proyectoId, editing ? (editing.id as number) : null, {
        ...data,
        proyecto_id: proyectoId,
      });
      if (!res.ok) return setErr(res.error ?? "Error al guardar");
      setCreating(false);
      setEditing(null);
      router.refresh();
    });
  }

  function remove(row: Row) {
    if (!confirm("¿Eliminar esta carga?")) return;
    start(async () => {
      const res = await deleteCarga(TABLE[kind], proyectoId, row.id as number);
      if (!res.ok) setErr(res.error ?? "Error");
      else router.refresh();
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button style={btn("brand")} onClick={() => { setCreating(true); setErr(null); }}>
          + Nueva carga
        </button>
      </div>

      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{err}</div>}

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto", background: "var(--surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
              {columns.map((c) => (
                <th key={c.key} style={{ padding: "9px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {c.label}
                  {c.suffix ? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> [{c.suffix}]</span> : null}
                </th>
              ))}
              <th style={{ padding: "9px 12px" }}>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: 22, textAlign: "center", color: "var(--text-muted)" }}>
                  Sin cargas.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id as number} style={{ borderTop: "1px solid var(--border)" }}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "8px 12px",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      color: c.calc ? "var(--brand)" : "var(--text)",
                      fontWeight: c.calc ? 600 : 400,
                    }}
                  >
                    {c.n ? num(row[c.key]) : (row[c.key] ?? "—")}
                  </td>
                ))}
                <td style={{ padding: "8px 12px" }}>
                  <EstadoBadge estado={row.estado as string} />
                </td>
                <td style={{ padding: "6px 10px", whiteSpace: "nowrap", textAlign: "right" }}>
                  <button style={{ ...btn("ghost"), padding: "5px 9px", marginRight: 6 }} onClick={() => { setEditing(row); setErr(null); }}>
                    Editar
                  </button>
                  <button style={{ ...btn("danger"), padding: "5px 9px" }} onClick={() => remove(row)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <CargaForm
          kind={kind}
          initial={editing}
          mamposterias={mamposterias}
          niveles={niveles}
          tiposMuro={tiposMuro}
          estados={estados}
          pending={pending}
          error={err}
          onCancel={() => { setCreating(false); setEditing(null); setErr(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function CargaForm({
  kind,
  initial,
  mamposterias,
  niveles,
  tiposMuro,
  estados,
  pending,
  error,
  onCancel,
  onSave,
}: {
  kind: Kind;
  initial: Row | null;
  mamposterias: MamposteriaOpt[];
  niveles: NivelOpt[];
  tiposMuro: string[];
  estados: string[];
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (data: Row) => void;
}) {
  const [v, setV] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {
      ubicacion: "", losa: "", nivel_codigo: "", mamposteria_id: "", muro_codigo: "",
      qp: "", altura: "", lx: "", ly: "", l_muro: "", estado: "N/C",
    };
    if (initial) for (const k of Object.keys(base)) if (initial[k] != null) base[k] = String(initial[k]);
    return base;
  });

  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));

  function onMamposteria(id: string) {
    const mp = mamposterias.find((m) => String(m.id) === id);
    setV((s) => ({ ...s, mamposteria_id: id, qp: mp ? String(mp.qp) : s.qp, muro_codigo: mp ? mp.codigo : s.muro_codigo }));
  }

  const calc = useMemo(() => {
    const qp = Number(v.qp) || 0;
    const h = Number(v.altura) || 0;
    if (kind === "muro") return [{ label: "qD", suffix: "kN/m", value: qp * h }];
    const l = Number(v.l_muro) || 0;
    const lx = Number(v.lx) || 0;
    const ly = Number(v.ly) || 0;
    const p = qp * l * h;
    return [
      { label: "P", suffix: "kN", value: p },
      { label: "QD", suffix: "kN/m²", value: lx * ly ? p / (lx * ly) : 0 },
    ];
  }, [kind, v]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data: Row = {
      nivel_codigo: v.nivel_codigo || null,
      mamposteria_id: v.mamposteria_id ? Number(v.mamposteria_id) : null,
      muro_codigo: v.muro_codigo || null,
      qp: Number(v.qp) || 0,
      altura: Number(v.altura) || 0,
      estado: v.estado || "N/C",
    };
    if (kind === "muro") {
      data.ubicacion = v.ubicacion || null;
    } else {
      data.losa = v.losa;
      data.lx = v.lx === "" ? null : Number(v.lx);
      data.ly = v.ly === "" ? null : Number(v.ly);
      data.l_muro = Number(v.l_muro) || 0;
    }
    onSave(data);
  }

  const field = (label: string, node: React.ReactNode, suffix?: string) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
        {suffix ? <span style={{ color: "var(--text-muted)" }}> [{suffix}]</span> : null}
      </span>
      {node}
    </label>
  );

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>
          {initial ? "Editar" : "Nueva"} carga · {kind === "muro" ? "muro" : "sobre losa"}
        </h2>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {kind === "muro"
            ? field(
                "Ubicación",
                <select value={v.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} style={inputStyle}>
                  <option value="">—</option>
                  {tiposMuro.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>,
              )
            : field("Losa", <input value={v.losa} onChange={(e) => set("losa", e.target.value)} required style={inputStyle} />)}

          {field(
            "Nivel",
            <select value={v.nivel_codigo} onChange={(e) => set("nivel_codigo", e.target.value)} style={inputStyle}>
              <option value="">—</option>
              {niveles.map((n) => <option key={n.codigo} value={n.codigo}>{n.codigo} · {n.nombre}</option>)}
            </select>,
          )}

          {kind === "losa" && (
            <>
              {field("Lx", <input type="number" step="0.01" value={v.lx} onChange={(e) => set("lx", e.target.value)} style={inputStyle} />, "m")}
              {field("Ly", <input type="number" step="0.01" value={v.ly} onChange={(e) => set("ly", e.target.value)} style={inputStyle} />, "m")}
            </>
          )}

          {field(
            "Mampostería",
            <select value={v.mamposteria_id} onChange={(e) => onMamposteria(e.target.value)} style={inputStyle}>
              <option value="">— (Qp manual)</option>
              {mamposterias.map((m) => <option key={m.id} value={m.id}>{m.codigo} · Qp {m.qp}</option>)}
            </select>,
          )}
          {field("Qp", <input type="number" step="0.01" value={v.qp} onChange={(e) => set("qp", e.target.value)} required style={inputStyle} />, "kN/m²")}

          {kind === "losa" && field("L muro", <input type="number" step="0.01" value={v.l_muro} onChange={(e) => set("l_muro", e.target.value)} required style={inputStyle} />, "m")}
          {field("Altura H", <input type="number" step="0.01" value={v.altura} onChange={(e) => set("altura", e.target.value)} required style={inputStyle} />, "m")}

          {field(
            "Estado",
            <select value={v.estado} onChange={(e) => set("estado", e.target.value)} style={inputStyle}>
              {estados.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>,
          )}

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10 }}>
            {calc.map((c) => (
              <div key={c.label}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
                  {+c.value.toFixed(4)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>{c.suffix}</span>
                </div>
              </div>
            ))}
          </div>

          {error && <div style={{ gridColumn: "1 / -1", color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" style={btn("ghost")} onClick={onCancel} disabled={pending}>Cancelar</button>
            <button type="submit" style={btn("brand")} disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
};
const modal: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
  width: "100%", maxWidth: 560, maxHeight: "90dvh", overflowY: "auto", padding: 24,
};
