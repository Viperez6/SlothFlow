import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { StoryDocumentView } from './StoryDocumentView'

interface Props {
  params: { id: string; storyId: string }
}

export default async function StoryDocumentPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (projectError || !project) {
    redirect('/projects')
  }

  const { data: userStory, error: storyError } = await supabase
    .from('user_stories')
    .select('id, title')
    .eq('id', params.storyId)
    .eq('project_id', params.id)
    .single()

  if (storyError || !userStory) {
    notFound()
  }

  const { data: document, error: docError } = await supabase
    .from('user_story_documents')
    .select('*')
    .eq('user_story_id', params.storyId)
    .maybeSingle()

  if (docError || !document) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-moss-50 via-earth-50 to-sloth-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/projects" className="hover:text-moss-600 transition-colors">Proyectos</a>
          <span>/</span>
          <a href={`/projects/${params.id}`} className="hover:text-moss-600 transition-colors">
            {project.name}
          </a>
          <span>/</span>
          <span className="text-muted-foreground">{userStory.title}</span>
          <span>/</span>
          <span className="text-sloth-800 font-medium">{document.title}</span>
        </nav>

        <StoryDocumentView
          document={document}
          projectId={params.id}
          storyId={params.storyId}
          storyTitle={userStory.title}
        />
      </div>
    </div>
  )
}
