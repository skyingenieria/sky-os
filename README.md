# SKY·OS

SaaS interno de cálculo estructural de **Sky Ingeniería**. Unifica el flujo hoy
disperso en Google Sheets en una sola app.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (PostgreSQL + Auth) · Vercel.

## Módulos

| # | Módulo | Estado |
|---|--------|--------|
| 1 | Parámetros generales | pendiente |
| 2 | **Catálogos globales** | ✅ |
| 3 | **Análisis de cargas** | ✅ en curso |
| 4 | Losas de viguetas | pendiente |
| 5 | Escaleras / estribos | pendiente |
| 6 | Memorias PDF | pendiente |
| 7 | Cómputo de materiales | pendiente |
| 8 | Planillas de armaduras | pendiente |
| 9 | Tareas por proyecto | pendiente |

### Módulo 2 — Catálogos globales

Fuente única de verdad. 8 catálogos, CRUD genérico dirigido por config
(`lib/catalogos.ts`): `materiales`, `sobrecargas_uso`, `sistemas_losa`,
`tipos_mamposteria` (con mini-calculador de Qp en vivo), `niveles`,
`tipos_muro`, `tipos_fundacion`, `estados_calculo`.

Los datos se sembraron desde la pestaña `Aux` del Sheet *Parámetros & Cargas*.

### Módulo 3 — Análisis de cargas (project-scoped)

Primer módulo por proyecto. Tabla `proyectos` como contenedor y tres tipos de
carga, todos con columnas generadas en Postgres y FKs a los catálogos:

- **Cargas muertas superficiales** — paquetes (assemblies) con capas de material;
  `q = e·γ` (volumétrico) o `q` directo (superficial); total = suma de capas.
- **Cargas de muro** — `qD = Qp·H`, con Qp tomado del catálogo de mampostería.
- **Cargas sobre losa** — `P = Qp·L·H`, `QD = P/(Lx·Ly)`.

Rutas: `/proyectos`, `/proyectos/[id]` (resumen) y las tres pestañas de carga.
Sembrado un proyecto demo (`FAAPPP`) con los datos del template (CM / CM-Extra).

> La memoria de cálculo (`MC`) es un reporte denormalizado que se autogenera de
> estos datos; se implementará junto con el Módulo 6 (memorias PDF).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar URL + publishable key de Supabase
npm run dev                  # http://localhost:3000
```

## Supabase

- Project ref: `oicktqjhgsdaapgdsdra`
- Tablas de catálogo con RLS. Policies `catalogo lectura`/`catalogo escritura`
  para rol `authenticated`.

> **Pendiente antes de producción:** montar Supabase Auth y **dropear las
> policies `dev anon *`** que hoy permiten acceso sin login (migración
> `dev_anon_policies_catalogos_modulo2`).
