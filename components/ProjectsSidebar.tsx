"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { upsertProyecto } from "@/app/proyectos/actions";
import { EstadoBadge, btn, inputStyle } from "@/components/ui";

interface Proyecto {
  id: number;
  nombre: string;
  codigo: string | null;
  estado: string | null;
}

export default function ProjectsSidebar({ proyectos }: { proyectos: Proyecto[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", codigo: "", cliente: "", tipo_vivienda: "Unifamiliar" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await upsertProyecto(null, form);
      if (!res.ok || !res.id) return setErr(res.error ?? "Error");
      setModal(false);
      setForm({ nombre: "", codigo: "", cliente: "", tipo_vivienda: "Unifamiliar" });
      router.push(`/proyectos/${res.id}/informacion`);
      router.refresh();
    });
  }

  return (
    <aside
      style={{
        width: 230,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em" }}>
          PROYECTOS
        </div>
        <button style={{ ...btn("brand"), width: "100%", marginTop: 10 }} onClick={() => { setModal(true); setErr(null); }}>
          + Nuevo proyecto
        </button>
      </div>

      <nav style={{ padding: 8, overflowY: "auto", flex: 1 }}>
        {proyectos.length === 0 && (
          <div style={{ padding: 12, fontSize: 12.5, color: "var(--text-muted)" }}>Sin proyectos.</div>
        )}
        {proyectos.map((p) => {
          const active = pathname.startsWith(`/proyectos/${p.id}`);
          return (
            <Link
              key={p.id}
              href={`/proyectos/${p.id}/informacion`}
              style={{
                display: "block",
                padding: "9px 11px",
                borderRadius: 8,
                marginBottom: 2,
                background: active ? "var(--surface-2)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? "var(--brand)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.nombre}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                {p.codigo && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.codigo}</span>}
                <span style={{ marginLeft: "auto" }}><EstadoBadge estado={p.estado} /></span>
              </div>
            </Link>
          );
        })}
      </nav>

      {modal && (
        <div style={overlay} onClick={() => setModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Nuevo proyecto</h2>
            <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="Nombre *">
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} placeholder="Ej. Casa Pérez" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Código"><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} style={inputStyle} placeholder="F26xxx" /></Field>
                <Field label="Tipo">
                  <select value={form.tipo_vivienda} onChange={(e) => setForm({ ...form, tipo_vivienda: e.target.value })} style={inputStyle}>
                    <option>Unifamiliar</option>
                    <option>Multifamiliar</option>
                  </select>
                </Field>
              </div>
              <Field label="Estudio / arquitecto">
                <input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} style={inputStyle} />
              </Field>
              {err && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{err}</div>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" style={btn("ghost")} onClick={() => setModal(false)} disabled={pending}>Cancelar</button>
                <button type="submit" style={btn("brand")} disabled={pending}>{pending ? "Creando…" : "Crear y abrir"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
};
const modalBox: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
  width: "100%", maxWidth: 420, padding: 24,
};
