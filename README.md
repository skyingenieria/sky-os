# SKY·OS

SaaS interno de cálculo estructural de **Sky Ingeniería**. Unifica el flujo hoy
disperso en Google Sheets en una sola app.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (PostgreSQL + Auth) · Vercel.

## Módulos

| # | Módulo | Estado |
|---|--------|--------|
| 1 | Parámetros generales | pendiente |
| 2 | **Catálogos globales** | ✅ en curso |
| 3 | Análisis de cargas | pendiente |
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
