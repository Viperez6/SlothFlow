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

  // Fetch tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
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
            <KanbanBoard projectId={id} initialTasks={tasks || []} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsList projectId={id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
