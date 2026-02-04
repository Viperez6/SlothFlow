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
  google_doc_link: string | null
  created_at: string
  updated_at: string
}

export type TaskStatus = 'backlog' | 'in_progress' | 'done'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'pm' | 'developer'
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
  user_id: string
  story_points: number
  created_at: string
  profiles?: Profile
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
  general: { label: 'General', icon: '📄', color: 'bg-slate-100 text-slate-700' },
  prd: { label: 'PRD', icon: '📋', color: 'bg-blue-100 text-blue-700' },
  spec: { label: 'Technical Spec', icon: '⚙️', color: 'bg-purple-100 text-purple-700' },
  meeting_notes: { label: 'Meeting Notes', icon: '📝', color: 'bg-amber-100 text-amber-700' },
  retrospective: { label: 'Retrospective', icon: '🔄', color: 'bg-moss-100 text-moss-700' },
} as const
