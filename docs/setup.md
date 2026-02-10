# SlothFlow - Guia de Setup

## Prerequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x (viene con Node.js)
- **Cuenta en Supabase** ([supabase.com](https://supabase.com))

## 1. Clonar e instalar

```bash
git clone <repo-url>
cd SlothFlow
npm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Estas credenciales se obtienen en: **Supabase Dashboard > Project Settings > API**

## 3. Configurar base de datos

Ejecuta las migraciones SQL en el **SQL Editor** de Supabase Dashboard, en orden:

1. `supabase/migrations/002_guest_voting_and_avatars.sql`
2. `supabase/migrations/003_profile_update_policy.sql`
3. `supabase/migrations/004_guest_voting_policies.sql`
4. `supabase/migrations/005_user_stories_subtasks.sql`

> **Nota:** La migracion 005 es idempotente (usa `IF NOT EXISTS` / `IF EXISTS`), se puede ejecutar multiples veces sin error.

### Tablas creadas

| Tabla | Descripcion |
|-------|-------------|
| `projects` | Proyectos (epicas) |
| `user_stories` | Historias de usuario con prioridad y SP |
| `subtasks` | Subtareas tecnicas con tipo y status |
| `acceptance_criteria` | Criterios de aceptacion (checkboxes) |
| `user_story_documents` | Documento rich text por HU |
| `user_story_links` | Enlaces externos por HU |
| `project_documents` | Documentos de proyecto (PRD, specs, etc.) |
| `voting_sessions` | Sesiones de Planning Poker |
| `votes` | Votos individuales por sesion |
| `guest_voters` | Votantes invitados (anonimos) |
| `profiles` | Perfiles de usuario (nombre, rol, avatar) |

### Configurar autenticacion

En Supabase Dashboard > Authentication > Settings:

1. Habilitar **Email/Password** como metodo de login
2. (Opcional) Configurar proveedores OAuth

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

La app estara disponible en `http://localhost:3000`

## 5. Build de produccion

```bash
npm run build
npm start
```

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run build` | Build de produccion |
| `npm start` | Ejecutar build de produccion |
| `npm run lint` | Ejecutar ESLint |
| `npx tsc --noEmit` | Verificar tipos TypeScript |

## Estructura de archivos clave

```
.env.local              # Variables de entorno (NO commitear)
.env.example            # Template de variables
next.config.js          # Configuracion de Next.js
tsconfig.json           # Configuracion de TypeScript
tailwind.config.ts      # Tema custom (sloth/moss/earth)
middleware.ts           # Auth middleware + rutas publicas
lib/supabase.ts         # Cliente Supabase (browser)
lib/supabase-server.ts  # Cliente Supabase (server)
```

## Troubleshooting

### Error: Missing Supabase environment variables
Verifica que `.env.local` existe y tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Error de RLS (Row Level Security)
Si las queries devuelven datos vacios, verifica que las policies RLS estan creadas (migracion 005).

### Error: Cannot find module '@/components/ui/...'
Los componentes shadcn/ui deben existir en `components/ui/`. Si falta alguno, se puede crear manualmente con la dependencia Radix correspondiente.

### Build size alto en paginas con editor
Es esperado (~380KB First Load JS). TipTap + ProseMirror + extensiones contribuyen al bundle. Las paginas sin editor son mas livianas (~150KB).
