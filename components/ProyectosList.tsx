"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upsertProyecto, deleteProyecto } from "@/app/proyectos/actions";
import { EstadoBadge, btn, inputStyle } from "@/components/ui";

interface Proyecto {
  id: number;
  nombre: string;
  codigo: string | null;
  cliente: string | null;
  estado: string | null;
}

export default function ProyectosList({
  rows,
  loadError,
}: {
  rows: Proyecto[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: "", codigo: "", cliente: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await upsertProyecto(null, form);
      if (!res.ok) return setErr(res.error ?? "Error");
      setCreating(false);
      setForm({ nombre: "", codigo: "", cliente: "" });
      router.refresh();
    });
  }

  function remove(p: Proyecto) {
    if (!confirm(`¿Eliminar el proyecto "${p.nombre}" y todas sus cargas?`)) return;
    start(async () => {
      const res = await deleteProyecto(p.id);
      if (!res.ok) setErr(res.error ?? "Error");
      else router.refresh();
    });
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em" }}>
            MÓDULO 3
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px" }}>Análisis de cargas</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, maxWidth: 620 }}>
            Elegí un proyecto para trabajar sus cargas muertas, cargas de muro y cargas sobre losa.
          </p>
        </div>
        <button style={btn("brand")} onClick={() => setCreating((v) => !v)}>
          + Nuevo proyecto
        </button>
      </div>

      {creating && (
        <form
          onSubmit={create}
          style={{
            display: "flex",
            gap: 10,
            marginTop: 18,
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--surface)",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <label style={{ flex: "2 1 220px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Nombre *</span>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
          </label>
          <label style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Código</span>
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} style={inputStyle} />
          </label>
          <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Cliente</span>
            <input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} style={inputStyle} />
          </label>
          <button type="submit" style={btn("brand")} disabled={pending}>
            {pending ? "Creando…" : "Crear"}
          </button>
        </form>
      )}

      {(loadError || err) && (
        <div style={{ marginTop: 14, color: "var(--danger)", fontSize: 13 }}>{loadError ?? err}</div>
      )}

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Todavía no hay proyectos.</div>
        )}
        {rows.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--surface)",
              padding: "14px 18px",
            }}
          >
            <Link href={`/proyectos/${p.id}`} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{p.nombre}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                {[p.codigo, p.cliente].filter(Boolean).join(" · ") || "—"}
              </div>
            </Link>
            <EstadoBadge estado={p.estado} />
            <Link href={`/proyectos/${p.id}`} style={btn("ghost")}>
              Abrir
            </Link>
            <button style={{ ...btn("danger"), padding: "6px 10px" }} onClick={() => remove(p)} disabled={pending}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
