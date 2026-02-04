import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { EditTaskDocumentForm } from './EditTaskDocumentForm'

interface Props {
  params: { id: string; taskId: string }
}

export default async function EditTaskDocumentPage({ params }: Props) {
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

  // Get task document
  const { data: taskDocument, error: docError } = await supabase
    .from('task_documents')
    .select('*')
    .eq('task_id', params.taskId)
    .maybeSingle()

  if (!taskDocument) {
    // Redirect to create page if no document exists
    redirect(`/projects/${params.id}/tasks/${params.taskId}/document/new`)
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
          <a href={`/projects/${params.id}/tasks/${params.taskId}/document`} className="hover:text-moss-600 transition-colors">
            Documento
          </a>
          <span>/</span>
          <span className="text-sloth-800 font-medium">Editar</span>
        </nav>

        <EditTaskDocumentForm
          task={task}
          taskDocument={taskDocument}
          projectId={params.id}
        />
      </div>
    </div>
  )
}
