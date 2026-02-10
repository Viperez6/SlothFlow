# SlothFlow - Arquitectura

## Vista General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        LP[Landing Page]
        LG[Login / Auth]
        PL[Lista de Proyectos]
        KB[Kanban Board]
        DE[Document Editor]
        VP[Voting Page]
        GJ[Guest Join]
    end

    subgraph "Next.js App Router"
        MW[Middleware - Auth Check]
        SC[Server Components - Data Fetch]
        CC[Client Components - Interactividad]
    end

    subgraph "Supabase Cloud"
        AU[Auth Service]
        PG[(PostgreSQL)]
        RLS[Row Level Security]
    end

    LP --> LG
    LG -->|email/pass| AU
    AU -->|cookie| MW
    MW -->|redirect| SC
    SC -->|SSR query| PG
    SC -->|render| CC
    CC -->|CRUD| PG
    PG --> RLS
    GJ -->|localStorage| VP
    VP -->|realtime| PG
```

## Jerarquia de Datos (3 niveles)

```mermaid
graph TD
    P[Proyecto - Epica] -->|1:N| HU[Historia de Usuario]
    P -->|1:N| PD[Documentos de Proyecto]
    HU -->|1:N| ST[Subtarea]
    HU -->|1:N| AC[Criterios de Aceptacion]
    HU -->|1:1| HD[Documento de HU]
    HU -->|1:N| HL[Enlaces Externos]
    ST -->|1:N| VS[Sesion de Votacion]
    VS -->|1:N| V[Votos]
    VS -->|1:N| GV[Votantes Invitados]

    style P fill:#72865e,color:#fff
    style HU fill:#5a7f59,color:#fff
    style ST fill:#b37d5c,color:#fff
```

| Nivel | Entidad | Proposito |
|-------|---------|-----------|
| 1 | **Proyecto (Epica)** | Contenedor principal con documentacion |
| 2 | **Historia de Usuario** | Valor de negocio, prioridad, criterios de aceptacion |
| 3 | **Subtarea** | Trabajo tecnico, arrastrable en kanban, estimable via Planning Poker |

## Componentes Principales

### Kanban Board

```mermaid
graph TD
    KB[KanbanBoard] -->|map| USS[UserStorySection x N]
    USS -->|3 columnas| SC1[SubtaskColumn - Backlog]
    USS --> SC2[SubtaskColumn - In Progress]
    USS --> SC3[SubtaskColumn - Done]
    SC1 -->|map| TC1[SubtaskCard x N]
    SC2 -->|map| TC2[SubtaskCard x N]
    SC3 -->|map| TC3[SubtaskCard x N]

    KB -->|modal| USM[UserStoryModal]
    KB -->|modal| STM[SubtaskModal]
    KB -->|wraps| DnD[DragDropContext]
    DnD -->|parse| ID["droppableId = storyId:status"]
```

- **KanbanBoard**: Componente contenedor. Maneja estado de HUs, subtareas, criterios. Coordina drag & drop.
- **UserStorySection**: Seccion colapsable por HU. Muestra prioridad, SP rollup, progreso, y 3 columnas internas.
- **SubtaskColumn**: Columna droppable (`{storyId}:{status}`). Renderiza tarjetas de subtareas.
- **SubtaskCard**: Tarjeta draggable. Muestra tipo, asignado, SP. Click abre SubtaskModal.

### Flujo de Drag & Drop

```mermaid
sequenceDiagram
    participant U as Usuario
    participant DnD as DragDropContext
    participant KB as KanbanBoard
    participant DB as Supabase

    U->>DnD: Arrastra subtarea
    DnD->>KB: onDragEnd(result)
    KB->>KB: Parse droppableId (storyId:status)
    KB->>KB: Validar misma HU
    alt Misma HU
        KB->>KB: Optimistic update (setState)
        KB->>DB: UPDATE subtasks SET status
        alt Error
            DB-->>KB: Error response
            KB->>KB: Rollback estado
            KB->>U: Toast error
        end
    else Distinta HU
        KB->>U: Toast "No se puede mover entre HUs"
    end
```

### Planning Poker

```mermaid
sequenceDiagram
    participant PM as PM (creador)
    participant VP as Voting Page
    participant DB as Supabase
    participant G as Guest (invitado)

    PM->>DB: Crear voting_session (subtask_id)
    PM->>G: Compartir link /voting/[sessionId]
    G->>VP: Join con nombre + avatar (localStorage)
    G->>DB: INSERT guest_voter

    loop Votacion
        PM->>DB: INSERT vote (user_id)
        G->>DB: INSERT vote (guest_id)
        VP->>DB: Realtime subscription
        DB-->>VP: Nuevos votos (ocultos)
    end

    PM->>DB: Revelar votos (status = 'revealed')
    DB-->>VP: Votos visibles para todos
    PM->>DB: Asignar SP a subtarea
```

## Patron Server/Client

```mermaid
graph LR
    subgraph "Server Component (page.tsx)"
        A[Auth Check] --> B[Fetch Data]
        B --> C[Pass as Props]
    end

    subgraph "Client Component (.tsx)"
        C --> D["'use client'"]
        D --> E[Local State]
        E --> F[Optimistic Updates]
        F --> G[Supabase Client]
    end
```

**Regla**: Las pages (`page.tsx`) son Server Components que verifican auth y hacen el fetch inicial. Los componentes interactivos (`KanbanBoard`, modals, etc.) son Client Components con `'use client'`.

**Patron de Supabase Client:**
```typescript
// Server: se crea por request
const supabase = await createServerSupabaseClient()

// Client: se cachea en useRef
const supabaseRef = useRef<SupabaseClient | null>(null)
const getSupabase = () => {
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  return supabaseRef.current
}
```

## Seguridad

- **Middleware** (`middleware.ts`): Intercepta todas las rutas. Redirige a `/login` si no hay sesion, excepto rutas de voting (acceso guest).
- **RLS (Row Level Security)**: Todas las tablas tienen policies. SELECT es publico (para guest voting), INSERT/UPDATE/DELETE requiere `auth.uid()`.
- **Guest voting**: Los invitados se identifican via `localStorage` (guest_id + nombre + avatar). No necesitan cuenta.

## Tema Visual

Paleta organica custom definida en `tailwind.config.ts`:

| Color | Hex base | Uso |
|-------|---------|-----|
| `sloth` | #72865e | Verde organico principal |
| `moss` | #5a7f59 | Botones, acentos, CTA |
| `earth` | #b37d5c | Fondos calidos, badges |

Fonts: `font-sans` para texto general, `font-display` para titulos.

9 animaciones custom: fade-in, slide-in, float, gentle-sway, scale-in, card-hover, etc.
