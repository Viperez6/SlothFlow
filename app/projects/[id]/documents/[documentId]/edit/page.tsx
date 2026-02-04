import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { EditDocumentForm } from './EditDocumentForm'

interface Props {
  params: { id: string; documentId: string }
}

export default async function EditDocumentPage({ params }: Props) {
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

  // Get document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.documentId)
    .eq('project_id', params.id)
    .single()

  if (docError || !document) {
    notFound()
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
          <a href={`/projects/${params.id}/documents/${params.documentId}`} className="hover:text-moss-600 transition-colors">
            {document.title}
          </a>
          <span>/</span>
          <span className="text-sloth-800 font-medium">Editar</span>
        </nav>

        <EditDocumentForm
          document={document}
          projectId={params.id}
        />
      </div>
    </div>
  )
}
