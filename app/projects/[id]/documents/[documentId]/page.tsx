import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { DocumentView } from './DocumentView'

interface Props {
  params: { id: string; documentId: string }
}

export default async function DocumentPage({ params }: Props) {
  const supabase = createClient()

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

  // Get document with linked tasks
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select(`
      *,
      document_tasks(
        task_id,
        tasks(*)
      )
    `)
    .eq('id', params.documentId)
    .eq('project_id', params.id)
    .single()

  if (docError || !document) {
    notFound()
  }

  // Transform data
  const documentWithTasks = {
    ...document,
    tasks: document.document_tasks?.map((dt: any) => dt.tasks).filter(Boolean) || []
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
          <span className="text-sloth-800 font-medium">{document.title}</span>
        </nav>

        <DocumentView
          document={documentWithTasks}
          projectId={params.id}
          projectName={project.name}
        />
      </div>
    </div>
  )
}
