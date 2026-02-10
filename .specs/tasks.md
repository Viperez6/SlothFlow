# SlothFlow - Backlog Tecnico

> **Ultima actualizacion:** 2026-02-09

## Deuda Tecnica

- [ ] **Eliminar tabla `tasks` de Supabase:** La tabla vieja `tasks` sigue existiendo en la BD. Deberia eliminarse tras verificar que la migracion funciona correctamente.
  - Estimacion: S
  - Archivos: `supabase/migrations/005_user_stories_subtasks.sql`

- [ ] **Eliminar componente `DragDropWrapper.tsx`:** No se usa - KanbanBoard maneja DragDropContext internamente.
  - Estimacion: S
  - Archivos: `components/DragDropWrapper.tsx`

- [ ] **Instalar `@radix-ui/react-checkbox` como dependencia:** El componente `ui/checkbox.tsx` fue creado manualmente pero la dependencia de radix necesita instalarse via npm.
  - Estimacion: S
  - Archivos: `package.json`

- [ ] **Import de `Clock` no usado en SubtaskCard:** Se elimino la funcionalidad de horas estimadas pero puede quedar el import huerfano.
  - Estimacion: S
  - Archivos: `components/SubtaskCard.tsx`

- [ ] **`dangerouslySetInnerHTML` en MarkdownViewer:** Se usa para contenido HTML de TipTap. Riesgo de XSS si el contenido es manipulado. Considerar sanitizacion con DOMPurify.
  - Estimacion: M
  - Archivos: `components/documents/MarkdownViewer.tsx`

- [ ] **Supabase client no tipado:** Las queries a Supabase no usan tipos generados. `supabase-js` soporta generacion de tipos con `supabase gen types`.
  - Estimacion: M
  - Archivos: `lib/supabase.ts`, `lib/supabase-server.ts`, todos los componentes con queries

- [ ] **Falta error boundary:** No hay React Error Boundary. Un error en un componente crashea toda la pagina.
  - Estimacion: M
  - Archivos: `app/layout.tsx` o nuevo `components/ErrorBoundary.tsx`

## Features Incompletas

- [ ] **Realtime en Kanban Board:** El board no tiene suscripcion realtime. Si otro usuario mueve una subtarea, no se refleja hasta refresh.
  - Estimacion: M
  - Archivos: `components/KanbanBoard.tsx`

- [ ] **Sort order en drag & drop:** El `sort_order` de subtareas se actualiza en la BD pero no se usa para ordenar las tarjetas en el frontend.
  - Estimacion: S
  - Archivos: `components/KanbanBoard.tsx`, `components/SubtaskColumn.tsx`

- [ ] **Reordenar HUs:** No hay drag & drop para reordenar historias de usuario. `sort_order` existe en el schema pero no se usa.
  - Estimacion: L
  - Archivos: `components/KanbanBoard.tsx`, `components/UserStorySection.tsx`

- [ ] **Busqueda/filtro en Kanban:** No hay forma de filtrar subtareas por asignado, tipo, o buscar por texto en el board.
  - Estimacion: M
  - Archivos: `components/KanbanBoard.tsx`

- [ ] **Invitar miembros al proyecto:** No hay flujo de invitacion. Los "team members" se cargan de `profiles` pero sin relacion directa al proyecto.
  - Estimacion: L
  - Archivos: Nuevo sistema de `project_members`, RLS policies

- [ ] **Notificaciones:** No hay sistema de notificaciones cuando te asignan una subtarea o te mencionan.
  - Estimacion: L
  - Archivos: Nuevo sistema completo

## Mejoras de Performance

- [ ] **Lazy loading de subtareas:** Todas las subtareas se cargan en la page server component. Con muchas HUs esto puede ser lento.
  - Estimacion: M
  - Archivos: `app/projects/[id]/page.tsx`, `components/KanbanBoard.tsx`

- [ ] **Memoizacion de componentes:** SubtaskCard y SubtaskColumn no usan React.memo. Con muchas tarjetas, re-renders innecesarios en drag.
  - Estimacion: S
  - Archivos: `components/SubtaskCard.tsx`, `components/SubtaskColumn.tsx`

- [ ] **Bundle size:** El First Load JS de la pagina de proyecto es 260kB. TipTap y sus extensiones son pesados - considerar lazy import del editor.
  - Estimacion: M
  - Archivos: `components/documents/MarkdownEditor.tsx`

## Mejoras de UX

- [ ] **Confirmacion al salir con cambios:** No hay "unsaved changes" warning al navegar fuera de un formulario con datos sin guardar.
  - Estimacion: S
  - Archivos: `UserStoryModal.tsx`, `SubtaskModal.tsx`, edit forms

- [ ] **Keyboard shortcuts:** No hay atajos de teclado (Ctrl+N para nueva subtarea, Esc para cerrar modal, etc).
  - Estimacion: M
  - Archivos: Varios componentes

- [ ] **Dark mode:** El tema solo tiene modo claro. La estructura de CSS variables lo soportaria facilmente.
  - Estimacion: M
  - Archivos: `app/globals.css`, `tailwind.config.ts`

- [ ] **Loading skeletons en Kanban:** El board no muestra skeleton mientras carga. Solo hay loader de pagina completa.
  - Estimacion: S
  - Archivos: `components/KanbanBoard.tsx`
