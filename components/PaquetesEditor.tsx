"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { upsertCarga, deleteCarga } from "@/app/proyectos/actions";
import { EstadoBadge, btn, inputStyle, num } from "@/components/ui";

interface MaterialOpt {
  id: number;
  nombre: string;
  tipo_peso: "volumetrico" | "superficial";
  peso: number;
}
interface Capa {
  id: number;
  material_id: number | null;
  material_nombre: string;
  esp: number | null;
  gamma: number | null;
  q_directo: number | null;
  q: number | null;
  orden: number | null;
}
interface Paquete {
  id: number;
  nombre: string;
  orden: number | null;
  estado: string | null;
  capas: Capa[];
}

export default function PaquetesEditor({
  proyectoId,
  paquetes,
  materiales,
  estados,
}: {
  proyectoId: number;
  paquetes: Paquete[];
  materiales: MaterialOpt[];
  estados: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [paqForm, setPaqForm] = useState<Paquete | "new" | null>(null);
  const [capaForm, setCapaForm] = useState<{ paqueteId: number; capa: Capa | null } | null>(null);

  const refresh = () => router.refresh();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setErr(res.error ?? "Error");
      else refresh();
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button style={btn("brand")} onClick={() => { setPaqForm("new"); setErr(null); }}>
          + Nuevo paquete
        </button>
      </div>
      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{err}</div>}

      {paquetes.length === 0 && (
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Todavía no hay paquetes de carga. Creá uno (ej. “Solado Planta Baja”) y agregale capas.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {paquetes.map((p) => {
          const total = p.capas.reduce((s, c) => s + (Number(c.q) || 0), 0);
          return (
            <div key={p.id} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</div>
                <EstadoBadge estado={p.estado} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
                      {(+total.toFixed(4)).toString()}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}> kN/m²</span>
                  </div>
                  <button style={{ ...btn("ghost"), padding: "5px 9px" }} onClick={() => { setPaqForm(p); setErr(null); }}>Editar</button>
                  <button
                    style={{ ...btn("danger"), padding: "5px 9px" }}
                    onClick={() => confirm(`¿Eliminar el paquete "${p.nombre}"?`) && run(() => deleteCarga("paquetes_carga", proyectoId, p.id))}
                  >✕</button>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                    <th style={{ padding: "8px 16px", fontWeight: 600 }}>Capa</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600 }}>e [m]</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600 }}>γ [kN/m³]</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600 }}>q [kN/m²]</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {p.capas.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 14, color: "var(--text-muted)" }}>Sin capas.</td></tr>
                  )}
                  {p.capas.map((c) => (
                    <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "7px 16px" }}>{c.material_nombre}</td>
                      <td style={{ padding: "7px 12px", fontVariantNumeric: "tabular-nums" }}>{num(c.esp)}</td>
                      <td style={{ padding: "7px 12px", fontVariantNumeric: "tabular-nums" }}>{num(c.gamma)}</td>
                      <td style={{ padding: "7px 12px", fontWeight: 600, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>{num(c.q)}</td>
                      <td style={{ padding: "5px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button style={{ ...btn("ghost"), padding: "4px 8px", marginRight: 6 }} onClick={() => { setCapaForm({ paqueteId: p.id, capa: c }); setErr(null); }}>Editar</button>
                        <button style={{ ...btn("danger"), padding: "4px 8px" }} onClick={() => run(() => deleteCarga("paquete_capas", proyectoId, c.id))}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "8px 16px" }}>
                <button style={{ ...btn("ghost"), padding: "6px 10px" }} onClick={() => { setCapaForm({ paqueteId: p.id, capa: null }); setErr(null); }}>
                  + Agregar capa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {paqForm && (
        <PaqueteForm
          initial={paqForm === "new" ? null : paqForm}
          estados={estados}
          pending={pending}
          onCancel={() => setPaqForm(null)}
          onSave={(data) =>
            run(async () => {
              const res = await upsertCarga("paquetes_carga", proyectoId, paqForm === "new" ? null : paqForm.id, { ...data, proyecto_id: proyectoId });
              if (res.ok) setPaqForm(null);
              return res;
            })
          }
        />
      )}

      {capaForm && (
        <CapaForm
          initial={capaForm.capa}
          materiales={materiales}
          pending={pending}
          onCancel={() => setCapaForm(null)}
          onSave={(data) =>
            run(async () => {
              const res = await upsertCarga("paquete_capas", proyectoId, capaForm.capa?.id ?? null, { ...data, paquete_id: capaForm.paqueteId });
              if (res.ok) setCapaForm(null);
              return res;
            })
          }
        />
      )}
    </div>
  );
}

function PaqueteForm({
  initial, estados, pending, onCancel, onSave,
}: {
  initial: Paquete | null;
  estados: string[];
  pending: boolean;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [estado, setEstado] = useState(initial?.estado ?? "N/C");
  return (
    <div style={overlay} onClick={onCancel}>
      <div style={{ ...modal, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>{initial ? "Editar" : "Nuevo"} paquete</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ nombre, estado }); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Nombre *</span>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} placeholder="Ej. Solado Planta Baja" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} style={inputStyle}>
              {estados.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" style={btn("ghost")} onClick={onCancel} disabled={pending}>Cancelar</button>
            <button type="submit" style={btn("brand")} disabled={pending}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CapaForm({
  initial, materiales, pending, onCancel, onSave,
}: {
  initial: Capa | null;
  materiales: MaterialOpt[];
  pending: boolean;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [materialId, setMaterialId] = useState<string>(initial?.material_id ? String(initial.material_id) : "");
  const [nombre, setNombre] = useState(initial?.material_nombre ?? "");
  const [esp, setEsp] = useState(initial?.esp != null ? String(initial.esp) : "");
  const [gamma, setGamma] = useState(initial?.gamma != null ? String(initial.gamma) : "");
  const [qDir, setQDir] = useState(initial?.q_directo != null ? String(initial.q_directo) : "");

  function pickMaterial(id: string) {
    setMaterialId(id);
    const m = materiales.find((x) => String(x.id) === id);
    if (!m) return;
    setNombre(m.nombre);
    if (m.tipo_peso === "volumetrico") { setGamma(String(m.peso)); setQDir(""); }
    else { setQDir(String(m.peso)); setGamma(""); setEsp(""); }
  }

  const q = useMemo(() => {
    const e = Number(esp), g = Number(gamma);
    if (esp !== "" && gamma !== "") return e * g;
    return Number(qDir) || 0;
  }, [esp, gamma, qDir]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      material_id: materialId ? Number(materialId) : null,
      material_nombre: nombre,
      esp: esp === "" ? null : Number(esp),
      gamma: gamma === "" ? null : Number(gamma),
      q_directo: qDir === "" ? null : Number(qDir),
    });
  }

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={{ ...modal, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>{initial ? "Editar" : "Nueva"} capa</h2>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Material</span>
            <select value={materialId} onChange={(e) => pickMaterial(e.target.value)} style={inputStyle}>
              <option value="">— (manual)</option>
              {materiales.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.tipo_peso === "volumetrico" ? "kN/m³" : "kN/m²"} {m.peso})</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Nombre en la capa *</span>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>e [m]</span>
              <input type="number" step="0.001" value={esp} onChange={(e) => setEsp(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>γ [kN/m³]</span>
              <input type="number" step="0.01" value={gamma} onChange={(e) => setGamma(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>q directo</span>
              <input type="number" step="0.001" value={qDir} onChange={(e) => setQDir(e.target.value)} style={inputStyle} />
            </label>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
            Volumétrico → cargá e y γ (q = e·γ). Superficial → cargá q directo.
          </div>
          <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>q de la capa </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>{+q.toFixed(4)}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}> kN/m²</span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" style={btn("ghost")} onClick={onCancel} disabled={pending}>Cancelar</button>
            <button type="submit" style={btn("brand")} disabled={pending}>Guardar</button>
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
  width: "100%", maxHeight: "90dvh", overflowY: "auto", padding: 24,
};
