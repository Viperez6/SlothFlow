# ADR 001: Next.js 14 App Router + Supabase

**Status:** Accepted
**Date:** 2026-02-09
**Context:** Se necesitaba un framework fullstack con SSR, routing, y base de datos con autenticacion integrada para construir una herramienta de gestion de backlog.

## Decision

Se eligio **Next.js 14 con App Router** como framework frontend/backend y **Supabase** como base de datos y sistema de autenticacion.

- Next.js App Router para server/client component separation
- Supabase PostgreSQL con Row Level Security (RLS) como unica capa de datos
- @supabase/ssr para autenticacion basada en cookies (SSR-safe)
- No hay API routes propias - todas las operaciones van directo a Supabase desde el cliente

## Alternatives Considered

- **Vite + Express + Prisma**: Mas control sobre el backend, pero mayor complejidad de setup y deploy
- **Remix**: Buena alternativa con loaders/actions, pero menor ecosistema de componentes
- **Firebase**: Similar a Supabase pero vendor lock-in mas fuerte y SQL no nativo

## Consequences

- Simplicidad: No hay backend separado, Supabase maneja auth + DB + RLS
- RLS como "backend": Las policies de seguridad viven en la BD, no en middleware
- Server Components: Permite data fetching en el servidor sin waterfall
- Limitacion: Sin API routes, la logica de negocio compleja tendria que ir en Supabase Functions o Edge Functions
- Dependencia: Fuerte dependencia en Supabase como servicio
