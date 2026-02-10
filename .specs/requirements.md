# SlothFlow - Features Actuales

> **Ultima actualizacion:** 2026-02-09
> Fuente de verdad de que existe en SlothFlow.

## Autenticacion y Perfiles

- [x] Login con email/password via Supabase Auth
- [x] Registro de usuarios
- [x] Reset de password
- [x] Callback de autenticacion (`/auth/callback`)
- [x] Perfil de usuario editable (`/profile`): nombre, email, rol (PM/Developer)
- [x] Sistema de avatares sloth: 8 avatares tematicos con fondos de color
- [x] Selector de avatar en perfil y en voting
- [x] Roles: PM y Developer con labels correctos (PM, no "Pm")
- [x] Middleware de autenticacion: protege rutas, permite acceso anonimo a voting

## Proyectos

- [x] Lista de proyectos del usuario (`/projects`)
- [x] Crear proyecto (nombre + descripcion)
- [x] Editar proyecto
- [x] Eliminar proyecto con confirmacion
- [x] Vista detalle de proyecto con tabs: Kanban Board + Documentos

## Historias de Usuario (HU)

- [x] CRUD completo de Historias de Usuario
- [x] Campos: titulo, descripcion (Markdown), prioridad (low/medium/high/critical)
- [x] Prioridades con badges de color y labels en espanol
- [x] Story points con rollup automatico desde subtareas
- [x] Story points override manual (una vez editado, no se recalcula)
- [x] Criterios de aceptacion: lista de checkboxes (agregar, eliminar, toggle)
- [x] Contador de criterios completados (ej: 3/5)
- [x] Secciones colapsables en el Kanban
- [x] Barra de progreso por HU (subtareas completadas / total)

## Subtareas

- [x] CRUD completo de subtareas
- [x] Campos: titulo, descripcion, status, tipo, asignado a, story points
- [x] Status: backlog, in_progress, done
- [x] Tipos: frontend, backend, testing, devops, design, other (con iconos emoji)
- [x] Asignacion a miembros del equipo con selector de avatar
- [x] Opcion "Sin asignar"
- [x] Badges de tipo y story points en tarjetas
- [x] Preview de descripcion en tarjeta (markdown stripped)

## Kanban Board

- [x] HUs como secciones colapsables
- [x] 3 columnas por HU: Backlog, En Progreso, Terminado
- [x] Drag & Drop de subtareas entre columnas (misma HU)
- [x] Restriccion: no mover subtareas entre HUs distintas
- [x] Actualizacion optimista con rollback en error
- [x] Boton "+" para agregar subtarea desde cualquier columna
- [x] Feedback visual al arrastrar (highlight de columna destino)
- [x] Barra de estadisticas: conteo HUs, progreso subtareas, SP completados, velocidad

## Documentos de Proyecto

- [x] CRUD completo de documentos de proyecto
- [x] Tipos: General, PRD, Spec Tecnica, Notas de Reunion, Retrospectiva
- [x] Editor rich text (TipTap): bold, italic, headings, listas, tablas, code blocks, task lists
- [x] Syntax highlighting en code blocks
- [x] Templates predefinidos por tipo de documento
- [x] Auto-guardado con debounce de 3s
- [x] Preview mode (toggle editor/preview)
- [x] Busqueda por titulo
- [x] Filtro por tipo de documento
- [x] Vista de documento con export a Markdown
- [x] Eliminacion con dialog de confirmacion

## Documentos de Historia de Usuario

- [x] Crear/ver/editar documento por HU
- [x] Un documento por HU (relacion 1:1)
- [x] Editor TipTap con auto-guardado
- [x] Acceso desde modal de HU (links a view/edit/new)
- [x] Breadcrumb navigation
- [x] Export a Markdown

## Enlaces Externos (HU)

- [x] CRUD de enlaces en historias de usuario
- [x] Tipos: GitHub, Figma, Docs, External, Other (con iconos emoji)
- [x] Agregar/eliminar desde modal de HU
- [x] Links abren en nueva tab

## Planning Poker (Voting)

- [x] Crear sesion de votacion desde subtarea (solo PM)
- [x] Pagina de votacion en tiempo real (`/voting/[sessionId]`)
- [x] Cartas de Fibonacci: 0, 1, 2, 3, 5, 8, 13, 21, ?
- [x] Animacion de flip en cartas
- [x] Fase de votacion: cartas ocultas, indicador de quien ya voto
- [x] Revelar votos (solo PM): muestra todas las cartas
- [x] Estadisticas post-revelacion: promedio, mediana, moda, consenso
- [x] PM confirma y asigna story points con dialog de confirmacion
- [x] Cambiar voto durante sesion activa (UPSERT pattern)
- [x] Descripcion de subtarea renderizada como Markdown en votacion
- [x] Contexto de HU padre visible en header

## Votacion Anonima (Guest Voting)

- [x] Pagina de join para invitados (`/voting/[sessionId]/join`)
- [x] Registro con nombre + seleccion de avatar sloth
- [x] Persistencia de guest en localStorage por sesion
- [x] Invitados pueden votar igual que usuarios autenticados
- [x] Usuarios autenticados redirigidos automaticamente (no necesitan join)
- [x] Middleware permite acceso sin auth a rutas de voting

## UI/UX

- [x] Tema custom sloth/moss/earth con paleta organica
- [x] Animaciones: fade-in, float, gentle-sway, pulse-soft, scale-in, card-hover
- [x] Loaders tematicos: SlothLoader, SlothPageLoader, SlothSpinner
- [x] Logo con animacion de sway
- [x] Menu de usuario con dropdown (perfil, logout)
- [x] Toast notifications (sonner) en espanol
- [x] Responsive design
- [x] Texto completamente en espanol

## Notas Tecnicas

- **Stack**: Next.js 14 (App Router) + React 18 + TypeScript 5.9
- **Database**: Supabase (PostgreSQL) con RLS
- **Auth**: Supabase Auth con SSR cookies
- **UI**: shadcn/ui (Radix) + Tailwind CSS 3.4 + Framer Motion
- **Editor**: TipTap 3.19 con lowlight syntax highlighting
- **DnD**: @hello-pangea/dnd 18
- **Markdown**: react-markdown 10 + remark-gfm
- **Deploy**: No configurado (next build funcional)
