export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// HISTORIAS DE USUARIO (HU)
// ==========================================

export type UserStoryPriority = 'low' | 'medium' | 'high' | 'critical'

export interface UserStory {
  id: string
  project_id: string
  title: string
  description: string | null
  priority: UserStoryPriority
  story_points: number | null
  story_points_override: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const USER_STORY_PRIORITIES = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  critical: { label: 'Critica', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
} as const

// ==========================================
// CRITERIOS DE ACEPTACION
// ==========================================

export interface AcceptanceCriterion {
  id: string
  user_story_id: string
  description: string
  is_completed: boolean
  sort_order: number
  created_at: string
}

// ==========================================
// SUBTAREAS
// ==========================================

export type SubtaskStatus = 'backlog' | 'in_progress' | 'done'
export type SubtaskType = 'frontend' | 'backend' | 'testing' | 'devops' | 'design' | 'other'

export interface Subtask {
  id: string
  user_story_id: string
  title: string
  description: string | null
  status: SubtaskStatus
  assigned_to: string | null
  type: SubtaskType
  story_points: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export const SUBTASK_TYPES = {
  frontend: { label: 'Frontend', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
  backend: { label: 'Backend', icon: '⚙️', color: 'bg-blue-100 text-blue-700' },
  testing: { label: 'Testing', icon: '🧪', color: 'bg-green-100 text-green-700' },
  devops: { label: 'DevOps', icon: '🚀', color: 'bg-orange-100 text-orange-700' },
  design: { label: 'Diseno', icon: '✏️', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Otro', icon: '📦', color: 'bg-slate-100 text-slate-700' },
} as const

export const ROLE_LABELS: Record<string, string> = {
  pm: 'PM',
  developer: 'Developer',
} as const

// ==========================================
// SLOTH AVATARS - Sistema de avatares
// ==========================================

export type SlothAvatarId = 'sloth-default' | 'sloth-happy' | 'sloth-sleepy' | 'sloth-cool' | 'sloth-heart' | 'sloth-star' | 'sloth-coffee' | 'sloth-zen'

export const SLOTH_AVATARS: Record<SlothAvatarId, { image: string; label: string; bg: string }> = {
  'sloth-default': { image: '/avatars/sloth-default.png', label: 'Perezoso', bg: 'bg-moss-100' },
  'sloth-happy': { image: '/avatars/sloth-happy.png', label: 'Feliz', bg: 'bg-amber-100' },
  'sloth-sleepy': { image: '/avatars/sloth-sleepy.png', label: 'Dormilon', bg: 'bg-blue-100' },
  'sloth-cool': { image: '/avatars/sloth-cool.png', label: 'Cool', bg: 'bg-purple-100' },
  'sloth-heart': { image: '/avatars/sloth-heart.png', label: 'Carinoso', bg: 'bg-pink-100' },
  'sloth-star': { image: '/avatars/sloth-star.png', label: 'Estrella', bg: 'bg-yellow-100' },
  'sloth-coffee': { image: '/avatars/sloth-coffee.png', label: 'Cafetero', bg: 'bg-orange-100' },
  'sloth-zen': { image: '/avatars/sloth-zen.png', label: 'Zen', bg: 'bg-teal-100' },
} as const

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'pm' | 'developer'
  avatar: SlothAvatarId | null
  created_at: string
}

// Guest voter for Planning Poker (no auth required)
export interface GuestVoter {
  id: string
  session_id: string
  name: string
  avatar: SlothAvatarId
  created_at: string
}

export interface VotingSession {
  id: string
  subtask_id: string | null
  status: 'voting' | 'revealed'
  created_by: string
  created_at: string
  revealed_at: string | null
}

export interface Vote {
  id: string
  session_id: string
  user_id: string | null      // null for guest voters
  guest_id: string | null     // for guest voters
  story_points: number
  created_at: string
  profiles?: Profile          // for registered users
  guest_voters?: GuestVoter   // for guest voters
}

export interface VotingSessionWithVotes extends VotingSession {
  votes: Vote[]
  subtask?: Subtask
  user_story?: UserStory
}

// ==========================================
// DOCUMENTOS DE PROYECTO
// ==========================================

export type DocumentType = 'general' | 'prd' | 'spec' | 'meeting_notes' | 'retrospective'

export interface Document {
  id: string
  project_id: string
  title: string
  content: string
  type: DocumentType
  created_by: string | null
  created_at: string
  updated_at: string
}

export const DOCUMENT_TYPES = {
  general: {
    label: 'General',
    icon: '📄',
    color: 'bg-slate-100 text-slate-700',
    description: 'Documentacion general del proyecto'
  },
  prd: {
    label: 'PRD',
    icon: '📋',
    color: 'bg-blue-100 text-blue-700',
    description: 'Product Requirements Document'
  },
  spec: {
    label: 'Technical Spec',
    icon: '⚙️',
    color: 'bg-purple-100 text-purple-700',
    description: 'Especificacion tecnica'
  },
  meeting_notes: {
    label: 'Meeting Notes',
    icon: '📝',
    color: 'bg-amber-100 text-amber-700',
    description: 'Notas de reuniones'
  },
  retrospective: {
    label: 'Retrospective',
    icon: '🔄',
    color: 'bg-moss-100 text-moss-700',
    description: 'Retrospectiva de sprint'
  },
} as const

// ==========================================
// DOCUMENTOS Y LINKS DE HISTORIAS DE USUARIO
// ==========================================

export type LinkType = 'github' | 'figma' | 'docs' | 'external' | 'other'

export interface UserStoryDocument {
  id: string
  user_story_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface UserStoryLink {
  id: string
  user_story_id: string
  url: string
  title: string | null
  type: LinkType
  created_at: string
}

export interface UserStoryWithDetails extends UserStory {
  acceptance_criteria?: AcceptanceCriterion[]
  subtasks?: Subtask[]
  user_story_document?: UserStoryDocument | null
  user_story_links?: UserStoryLink[]
}

export const LINK_TYPES = {
  github: { label: 'GitHub', icon: '🔗', color: 'text-gray-900' },
  figma: { label: 'Figma', icon: '🎨', color: 'text-purple-600' },
  docs: { label: 'Documentation', icon: '📚', color: 'text-blue-600' },
  external: { label: 'External', icon: '🌐', color: 'text-gray-600' },
  other: { label: 'Other', icon: '📎', color: 'text-gray-500' },
} as const
