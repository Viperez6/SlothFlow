import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NewDocumentForm } from './NewDocumentForm'

interface Props {
  params: { id: string }
}

export default async function NewDocumentPage({ params }: Props) {
  const supabase = createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check project exists and user has access
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (error || !project) {
    redirect('/projects')
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
          <span className="text-sloth-800 font-medium">Nuevo Documento</span>
        </nav>

        <NewDocumentForm projectId={params.id} userId={user.id} />
      </div>
    </div>
  )
}
