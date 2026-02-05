export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'backlog' | 'in_progress' | 'done'
  story_points: number | null
  created_at: string
  updated_at: string
}

export type TaskStatus = 'backlog' | 'in_progress' | 'done'

// ==========================================
// SLOTH AVATARS - Sistema de avatares
// ==========================================

export type SlothAvatarId = 'sloth-default' | 'sloth-happy' | 'sloth-sleepy' | 'sloth-cool' | 'sloth-heart' | 'sloth-star' | 'sloth-coffee' | 'sloth-zen'

export const SLOTH_AVATARS: Record<SlothAvatarId, { image: string; label: string; bg: string }> = {
  'sloth-default': { image: '/avatars/sloth-default.png', label: 'Perezoso', bg: 'bg-moss-100' },
  'sloth-happy': { image: '/avatars/sloth-happy.png', label: 'Feliz', bg: 'bg-amber-100' },
  'sloth-sleepy': { image: '/avatars/sloth-sleepy.png', label: 'Dormilón', bg: 'bg-blue-100' },
  'sloth-cool': { image: '/avatars/sloth-cool.png', label: 'Cool', bg: 'bg-purple-100' },
  'sloth-heart': { image: '/avatars/sloth-heart.png', label: 'Cariñoso', bg: 'bg-pink-100' },
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
  task_id: string
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
  task?: Task
}

// Document types
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

export interface DocumentTask {
  document_id: string
  task_id: string
  created_at: string
}

export interface DocumentWithTasks extends Document {
  tasks?: Task[]
}

export interface TaskWithDocuments extends Task {
  documents?: Document[]
}

export const DOCUMENT_TYPES = {
  general: {
    label: 'General',
    icon: '📄',
    color: 'bg-slate-100 text-slate-700',
    description: 'Documentación general del proyecto'
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
    description: 'Especificación técnica'
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
// TASK DOCUMENTS Y LINKS - NUEVA ARQUITECTURA
// ==========================================

export type LinkType = 'github' | 'figma' | 'docs' | 'external' | 'other'

export interface TaskDocument {
  id: string
  task_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface TaskLink {
  id: string
  task_id: string
  url: string
  title: string | null
  type: LinkType
  created_at: string
}

export interface TaskWithDetails extends Task {
  task_document?: TaskDocument | null
  task_links?: TaskLink[]
}

export const LINK_TYPES = {
  github: { label: 'GitHub', icon: '🔗', color: 'text-gray-900' },
  figma: { label: 'Figma', icon: '🎨', color: 'text-purple-600' },
  docs: { label: 'Documentation', icon: '📚', color: 'text-blue-600' },
  external: { label: 'External', icon: '🌐', color: 'text-gray-600' },
  other: { label: 'Other', icon: '📎', color: 'text-gray-500' },
} as const
