"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertProyecto, upsertCarga, deleteCarga } from "@/app/proyectos/actions";
import { btn, inputStyle } from "@/components/ui";
import ListEditor from "@/components/ListEditor";
import {
  OPCIONES, CAMPOS_SISTEMA, SUGERENCIAS_MURO, SUGERENCIAS_SOLADO, ZONAS_SOLADO,
} from "@/lib/proyecto-form";

type Row = Record<string, string | number | null> & { id: number };
interface Solado { id: number; zona: string; orden: number | null; capas: Row[] }
interface Proyecto {
  id: number;
  nombre: string; codigo: string | null; cliente: string | null; estado: string | null;
  tipo_vivienda: string | null; barrio_lote: string | null; cuit: string | null;
  sistema_estructural: string | null; sistema_fundacion: string | null; sistema_losa: string | null;
  cubierta_inclinada: string | null; pergola: string | null; escalera: string | null; losa_radiante: string | null;
}

function Section({ title, n, children, right }: { title: string; n: number; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>{n}.</span>
        <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: 0 }}>{title}</h2>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

export default function InformacionEditor({
  proyecto, niveles, muros, solados,
}: {
  proyecto: Proyecto;
  niveles: Row[];
  muros: Row[];
  solados: Solado[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [g, setG] = useState({
    nombre: proyecto.nombre ?? "",
    codigo: proyecto.codigo ?? "",
    cliente: proyecto.cliente ?? "",
    barrio_lote: proyecto.barrio_lote ?? "",
    cuit: proyecto.cuit ?? "",
    tipo_vivienda: proyecto.tipo_vivienda ?? "Unifamiliar",
    sistema_estructural: proyecto.sistema_estructural ?? "",
    sistema_fundacion: proyecto.sistema_fundacion ?? "",
    sistema_losa: proyecto.sistema_losa ?? "",
    cubierta_inclinada: proyecto.cubierta_inclinada ?? "",
    pergola: proyecto.pergola ?? "",
    escalera: proyecto.escalera ?? "",
    losa_radiante: proyecto.losa_radiante ?? "",
  });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => { setG((s) => ({ ...s, [k]: v })); setSaved(false); };

  function guardarGeneral() {
    start(async () => {
      const res = await upsertProyecto(proyecto.id, g);
      if (res.ok) { setSaved(true); router.refresh(); }
    });
  }

  const [nuevaZona, setNuevaZona] = useState(ZONAS_SOLADO[0]);
  const zonasUsadas = new Set(solados.map((s) => s.zona));
  const zonasLibres = ZONAS_SOLADO.filter((z) => !zonasUsadas.has(z));

  function addZona() {
    start(async () => {
      const res = await upsertCarga("proyecto_solados", proyecto.id, null, { proyecto_id: proyecto.id, zona: nuevaZona, orden: solados.length + 1 });
      if (res.ok) router.refresh();
    });
  }
  function removeZona(id: number) {
    if (!confirm("¿Eliminar esta zona de solado y sus capas?")) return;
    start(async () => {
      const res = await deleteCarga("proyecto_solados", proyecto.id, id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {/* 1. Información general */}
      <Section n={1} title="Información general"
        right={
          <button style={btn("brand")} onClick={guardarGeneral} disabled={pending}>
            {pending ? "Guardando…" : saved ? "✓ Guardado" : "Guardar información"}
          </button>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
          <Field label="Nombre del proyecto"><input value={g.nombre} onChange={(e) => set("nombre", e.target.value)} style={inputStyle} /></Field>
          <Field label="Código"><input value={g.codigo} onChange={(e) => set("codigo", e.target.value)} style={inputStyle} /></Field>
          <Field label="Estudio / arquitecto"><input value={g.cliente} onChange={(e) => set("cliente", e.target.value)} style={inputStyle} /></Field>
          <Field label="Barrio y lote"><input value={g.barrio_lote} onChange={(e) => set("barrio_lote", e.target.value)} style={inputStyle} /></Field>
          <Field label="CUIT (factura C)"><input value={g.cuit} onChange={(e) => set("cuit", e.target.value)} style={inputStyle} /></Field>
          <Field label="Tipo de vivienda">
            <select value={g.tipo_vivienda} onChange={(e) => set("tipo_vivienda", e.target.value)} style={inputStyle}>
              {OPCIONES.tipo_vivienda.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* 2. Niveles */}
      <Section n={2} title="Niveles">
        <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--text-muted)" }}>
          Cotas referidas al nivel 0.00 del proyecto (cara superior de la losa estructural).
        </p>
        <ListEditor
          proyectoId={proyecto.id}
          table="proyecto_niveles"
          parent={{ key: "proyecto_id", value: proyecto.id }}
          columns={[
            { key: "losa", label: "Losa" },
            { key: "cota", label: "Cota", type: "number", step: 0.01, suffix: "m", width: 140 },
            { key: "unidad", label: "Un.", width: 90 },
          ]}
          rows={niveles}
          addLabel="+ Nivel"
        />
      </Section>

      {/* 3. Sistema estructural */}
      <Section n={3} title="Sistema estructural (metodología constructiva)"
        right={<button style={btn("ghost")} onClick={guardarGeneral} disabled={pending}>{pending ? "…" : "Guardar"}</button>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
          {CAMPOS_SISTEMA.map((c) => (
            <Field key={c.key} label={c.label}>
              <input
                list={`opt-${c.key}`}
                value={g[c.key]}
                onChange={(e) => set(c.key, e.target.value)}
                style={inputStyle}
                placeholder="Elegir o escribir…"
              />
              <datalist id={`opt-${c.key}`}>
                {OPCIONES[c.key].map((o) => <option key={o} value={o} />)}
              </datalist>
            </Field>
          ))}
        </div>
      </Section>

      {/* 4. Paquetes de mampostería */}
      <Section n={4} title="Paquetes de mampostería">
        <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--text-muted)" }}>
          Tipos de muro del proyecto. El espesor incluye revoques.
        </p>
        <ListEditor
          proyectoId={proyecto.id}
          table="proyecto_muros"
          parent={{ key: "proyecto_id", value: proyecto.id }}
          columns={[
            { key: "detalle", label: "Detalle", datalist: SUGERENCIAS_MURO },
            { key: "espesor", label: "Espesor", type: "number", step: 0.5, suffix: "cm", width: 140 },
            { key: "unidad", label: "Un.", width: 90 },
          ]}
          rows={muros}
          addLabel="+ Muro"
        />
      </Section>

      {/* 5. Paquetes de solados */}
      <Section n={5} title="Paquetes de solados"
        right={
          zonasLibres.length > 0 ? (
            <div style={{ display: "flex", gap: 8 }}>
              <select value={nuevaZona} onChange={(e) => setNuevaZona(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                {zonasLibres.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              <button style={btn("ghost")} onClick={addZona} disabled={pending}>+ Zona</button>
            </div>
          ) : null
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {solados.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin zonas de solado.</div>}
          {solados.map((s) => (
            <div key={s.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.zona}</div>
                <button style={{ ...btn("danger"), padding: "3px 8px", fontSize: 12 }} onClick={() => removeZona(s.id)}>Quitar zona</button>
              </div>
              <ListEditor
                proyectoId={proyecto.id}
                table="proyecto_solado_capas"
                parent={{ key: "solado_id", value: s.id }}
                columns={[
                  { key: "detalle", label: "Capa", datalist: SUGERENCIAS_SOLADO },
                  { key: "espesor", label: "Espesor", type: "number", step: 0.5, suffix: "cm", width: 140 },
                  { key: "unidad", label: "Un.", width: 90 },
                ]}
                rows={s.capas}
                addLabel="+ Capa"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
