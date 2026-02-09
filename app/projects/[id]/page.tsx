import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import KanbanBoard from '@/components/KanbanBoard'
import { Logo } from '@/components/Logo'
import { DocumentsList } from '@/components/documents/DocumentsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, LayoutGrid, FileText } from 'lucide-react'

interface ProjectPageProps {
  params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch user stories
  const { data: userStories } = await supabase
    .from('user_stories')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || null

  const storyIds = (userStories || []).map(s => s.id)

  // Fetch subtasks, acceptance criteria, docs, links in parallel
  let subtasks: any[] = []
  let acceptanceCriteria: any[] = []
  let userStoryDocsMap: Record<string, boolean> = {}
  let userStoryLinksMap: Record<string, number> = {}
  let teamMembers: any[] = []

  if (storyIds.length > 0) {
    const [subtasksResult, criteriaResult, docsResult, linksResult, membersResult] = await Promise.all([
      supabase
        .from('subtasks')
        .select('*')
        .in('user_story_id', storyIds)
        .order('sort_order', { ascending: true }),
      supabase
        .from('acceptance_criteria')
        .select('*')
        .in('user_story_id', storyIds)
        .order('sort_order', { ascending: true }),
      supabase
        .from('user_story_documents')
        .select('user_story_id')
        .in('user_story_id', storyIds),
      supabase
        .from('user_story_links')
        .select('user_story_id')
        .in('user_story_id', storyIds),
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar, role'),
    ])

    subtasks = subtasksResult.data || []
    acceptanceCriteria = criteriaResult.data || []
    teamMembers = membersResult.data || []

    userStoryDocsMap = (docsResult.data || []).reduce((acc: Record<string, boolean>, doc: any) => {
      acc[doc.user_story_id] = true
      return acc
    }, {})

    userStoryLinksMap = (linksResult.data || []).reduce((acc: Record<string, number>, link: any) => {
      acc[link.user_story_id] = (acc[link.user_story_id] || 0) + 1
      return acc
    }, {})
  } else {
    // Still fetch team members even if no stories
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar, role')

    teamMembers = members || []
  }

  return (
    <div className="min-h-screen bg-organic-gradient">
      {/* Header */}
      <header className="bg-white/80 glass border-b border-moss-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/projects"
                className="flex items-center gap-2 text-muted-foreground hover:text-moss-600 transition group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Proyectos</span>
              </Link>

              <div className="h-6 w-px bg-moss-200" />

              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div>
                  <h1 className="text-xl font-display font-bold text-sloth-800">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="board" className="space-y-6">
          <TabsList className="bg-white/60 glass border border-moss-100 p-1">
            <TabsTrigger
              value="board"
              className="data-[state=active]:bg-moss-gradient data-[state=active]:text-white font-display font-semibold"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Tablero
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-moss-gradient data-[state=active]:text-white font-display font-semibold"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <KanbanBoard
              projectId={id}
              initialUserStories={userStories || []}
              initialSubtasks={subtasks}
              initialAcceptanceCriteria={acceptanceCriteria}
              userRole={userRole}
              userStoryDocsMap={userStoryDocsMap}
              userStoryLinksMap={userStoryLinksMap}
              teamMembers={teamMembers}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsList projectId={id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
