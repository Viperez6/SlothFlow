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
