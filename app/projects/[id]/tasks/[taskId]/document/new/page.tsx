import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { NewTaskDocumentForm } from './NewTaskDocumentForm'

interface Props {
  params: { id: string; taskId: string }
}

export default async function NewTaskDocumentPage({ params }: Props) {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (projectError || !project) {
    redirect('/projects')
  }

  // Get task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.taskId)
    .eq('project_id', params.id)
    .single()

  if (taskError || !task) {
    notFound()
  }

  // Check if document already exists (1:1 relationship)
  const { data: existingDoc } = await supabase
    .from('task_documents')
    .select('id')
    .eq('task_id', params.taskId)
    .maybeSingle()

  if (existingDoc) {
    // Redirect to edit if document already exists
    redirect(`/projects/${params.id}/tasks/${params.taskId}/document/edit`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss-50 via-earth-50 to-sloth-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/projects" className="hover:text-moss-600 transition-colors">Proyectos</a>
          <span>/</span>
          <a href={`/projects/${params.id}`} className="hover:text-moss-600 transition-colors">
            {project.name}
          </a>
          <span>/</span>
          <a href={`/projects/${params.id}/tasks/${params.taskId}`} className="hover:text-moss-600 transition-colors">
            {task.title}
          </a>
          <span>/</span>
          <span className="text-sloth-800 font-medium">Nuevo Documento</span>
        </nav>

        <NewTaskDocumentForm
          task={task}
          projectId={params.id}
        />
      </div>
    </div>
  )
}
