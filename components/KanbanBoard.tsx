'use client'

import { useState, useRef, useEffect } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { UserStory, Subtask, SubtaskStatus, AcceptanceCriterion, Profile } from '@/lib/types'
import UserStorySection from './UserStorySection'
import UserStoryModal from './UserStoryModal'
import SubtaskModal from './SubtaskModal'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'

interface KanbanBoardProps {
  projectId: string
  initialUserStories: UserStory[]
  initialSubtasks: Subtask[]
  initialAcceptanceCriteria: AcceptanceCriterion[]
  userRole: string | null
  userStoryDocsMap: Record<string, boolean>
  userStoryLinksMap: Record<string, number>
  teamMembers: Profile[]
}

export default function KanbanBoard({
  projectId,
  initialUserStories,
  initialSubtasks,
  initialAcceptanceCriteria,
  userRole,
  userStoryDocsMap,
  userStoryLinksMap,
  teamMembers,
}: KanbanBoardProps) {
  const [userStories, setUserStories] = useState<UserStory[]>(initialUserStories)
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriterion[]>(initialAcceptanceCriteria)

  // Expand state: which stories are expanded
  const [expandedStories, setExpandedStories] = useState<Set<string>>(
    new Set(initialUserStories.map(s => s.id))
  )

  // User Story Modal
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null)

  // Subtask Modal
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false)
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null)
  const [subtaskParentStoryId, setSubtaskParentStoryId] = useState<string>('')
  const [subtaskDefaultStatus, setSubtaskDefaultStatus] = useState<SubtaskStatus>('backlog')

  const [isMounted, setIsMounted] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  // Toggle expand/collapse
  const toggleExpand = (storyId: string) => {
    setExpandedStories(prev => {
      const next = new Set(prev)
      if (next.has(storyId)) {
        next.delete(storyId)
      } else {
        next.add(storyId)
      }
      return next
    })
  }

  // --- User Story CRUD ---

  const handleAddStory = () => {
    setSelectedStory(null)
    setIsStoryModalOpen(true)
  }

  const handleEditStory = (story: UserStory) => {
    setSelectedStory(story)
    setIsStoryModalOpen(true)
  }

  const handleSaveStory = async (
    storyData: Partial<UserStory>,
    criteriaData: { description: string; is_completed: boolean }[]
  ) => {
    const supabase = getSupabase()

    if (selectedStory) {
      // Update existing story
      const { data, error } = await supabase
        .from('user_stories')
        .update({
          title: storyData.title,
          description: storyData.description,
          priority: storyData.priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedStory.id)
        .select()
        .single()

      if (error) throw error

      setUserStories(prev => prev.map(s => s.id === selectedStory.id ? data : s))

      // Update acceptance criteria: delete all and re-insert
      await supabase
        .from('acceptance_criteria')
        .delete()
        .eq('user_story_id', selectedStory.id)

      if (criteriaData.length > 0) {
        const { data: newCriteria } = await supabase
          .from('acceptance_criteria')
          .insert(criteriaData.map((c, i) => ({
            user_story_id: selectedStory.id,
            description: c.description,
            is_completed: c.is_completed,
            sort_order: i,
          })))
          .select()

        setAcceptanceCriteria(prev => [
          ...prev.filter(c => c.user_story_id !== selectedStory.id),
          ...(newCriteria || []),
        ])
      } else {
        setAcceptanceCriteria(prev => prev.filter(c => c.user_story_id !== selectedStory.id))
      }

      toast.success('Historia actualizada')
    } else {
      // Create new story
      const { data, error } = await supabase
        .from('user_stories')
        .insert({
          project_id: projectId,
          title: storyData.title,
          description: storyData.description,
          priority: storyData.priority || 'medium',
        })
        .select()
        .single()

      if (error) throw error

      setUserStories(prev => [...prev, data])
      setExpandedStories(prev => {
        const next = new Set(prev)
        next.add(data.id)
        return next
      })

      // Insert acceptance criteria
      if (criteriaData.length > 0) {
        const { data: newCriteria } = await supabase
          .from('acceptance_criteria')
          .insert(criteriaData.map((c, i) => ({
            user_story_id: data.id,
            description: c.description,
            is_completed: c.is_completed,
            sort_order: i,
          })))
          .select()

        if (newCriteria) {
          setAcceptanceCriteria(prev => [...prev, ...newCriteria])
        }
      }

      toast.success('Historia creada')
    }
  }

  const handleDeleteStory = async () => {
    if (!selectedStory) return

    const supabase = getSupabase()
    const { error } = await supabase
      .from('user_stories')
      .delete()
      .eq('id', selectedStory.id)

    if (error) throw error

    setUserStories(prev => prev.filter(s => s.id !== selectedStory.id))
    setSubtasks(prev => prev.filter(st => st.user_story_id !== selectedStory.id))
    setAcceptanceCriteria(prev => prev.filter(c => c.user_story_id !== selectedStory.id))
    toast.success('Historia eliminada')
  }

  // --- Subtask CRUD ---

  const handleSubtaskClick = (subtask: Subtask) => {
    setSelectedSubtask(subtask)
    setSubtaskParentStoryId(subtask.user_story_id)
    setIsSubtaskModalOpen(true)
  }

  const handleAddSubtask = (userStoryId: string, status: SubtaskStatus) => {
    setSelectedSubtask(null)
    setSubtaskParentStoryId(userStoryId)
    setSubtaskDefaultStatus(status)
    setIsSubtaskModalOpen(true)
  }

  const handleSaveSubtask = async (subtaskData: Partial<Subtask>) => {
    const supabase = getSupabase()

    if (selectedSubtask) {
      // Update
      const { data, error } = await supabase
        .from('subtasks')
        .update({
          title: subtaskData.title,
          description: subtaskData.description,
          status: subtaskData.status,
          type: subtaskData.type,
          assigned_to: subtaskData.assigned_to,
          story_points: subtaskData.story_points,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSubtask.id)
        .select()
        .single()

      if (error) throw error

      setSubtasks(prev => prev.map(st => st.id === selectedSubtask.id ? data : st))
      toast.success('Subtarea actualizada')
    } else {
      // Create
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          user_story_id: subtaskParentStoryId,
          title: subtaskData.title,
          description: subtaskData.description,
          status: subtaskData.status || subtaskDefaultStatus,
          type: subtaskData.type || 'other',
          assigned_to: subtaskData.assigned_to,
          story_points: subtaskData.story_points,
        })
        .select()
        .single()

      if (error) throw error

      setSubtasks(prev => [...prev, data])
      toast.success('Subtarea creada')
    }
  }

  const handleDeleteSubtask = async () => {
    if (!selectedSubtask) return

    const supabase = getSupabase()
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', selectedSubtask.id)

    if (error) throw error

    setSubtasks(prev => prev.filter(st => st.id !== selectedSubtask.id))
    toast.success('Subtarea eliminada')
  }

  // --- Drag & Drop ---

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // Parse droppable IDs: "userStoryId:status"
    const [sourceStoryId, sourceStatus] = source.droppableId.split(':')
    const [destStoryId, destStatus] = destination.droppableId.split(':')

    // Enforce same-HU constraint
    if (sourceStoryId !== destStoryId) {
      toast.error('No puedes mover subtareas entre historias')
      return
    }

    if (sourceStatus === destStatus && source.index === destination.index) return

    const subtaskId = draggableId
    const newStatus = destStatus as SubtaskStatus

    // Optimistic update
    setSubtasks(prev => prev.map(st =>
      st.id === subtaskId ? { ...st, status: newStatus } : st
    ))

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('subtasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subtaskId)

      if (error) throw error

      const statusMessages: Record<SubtaskStatus, string> = {
        backlog: 'Subtarea movida a Backlog',
        in_progress: 'Subtarea en progreso',
        done: 'Subtarea completada!',
      }

      toast.success(statusMessages[newStatus], {
        description: newStatus === 'done' ? 'Buen trabajo! 🦥' : undefined,
      })
    } catch (error) {
      // Revert
      setSubtasks(prev => prev.map(st =>
        st.id === subtaskId ? { ...st, status: sourceStatus as SubtaskStatus } : st
      ))
      toast.error('Error al mover subtarea')
      console.error(error)
    }
  }

  // --- Stats ---

  const totalStories = userStories.length
  const totalSubtasksCount = subtasks.length
  const doneSubtasks = subtasks.filter(st => st.status === 'done').length
  const totalSP = subtasks.reduce((sum, st) => sum + (st.story_points || 0), 0)
  const doneSP = subtasks.filter(st => st.status === 'done').reduce((sum, st) => sum + (st.story_points || 0), 0)

  const boardContent = (
    <div className="space-y-4">
      {userStories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🦥</span>
          <h3 className="font-display font-semibold text-xl text-sloth-800 mb-2">
            Sin historias de usuario
          </h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera historia de usuario para empezar
          </p>
          <Button
            onClick={handleAddStory}
            className="bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Historia de Usuario
          </Button>
        </div>
      ) : (
        userStories.map(story => (
          <UserStorySection
            key={story.id}
            userStory={story}
            subtasks={subtasks.filter(st => st.user_story_id === story.id)}
            acceptanceCriteria={acceptanceCriteria.filter(c => c.user_story_id === story.id)}
            projectId={projectId}
            userRole={userRole}
            isExpanded={expandedStories.has(story.id)}
            onToggleExpand={() => toggleExpand(story.id)}
            onSubtaskClick={handleSubtaskClick}
            onAddSubtask={handleAddSubtask}
            onEditUserStory={handleEditStory}
            isDragEnabled={isMounted}
            teamMembers={teamMembers}
          />
        ))
      )}
    </div>
  )

  return (
    <>
      {/* Stats Bar */}
      <div className="mb-6 p-4 bg-white/60 glass rounded-xl border border-moss-100 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦥</span>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Historias</p>
                <p className="font-display font-bold text-xl text-sloth-800">
                  {totalStories}
                  <span className="text-sm font-normal text-muted-foreground ml-1">HUs</span>
                </p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-10" />

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Subtareas</p>
              <p className="font-display font-bold text-xl text-sloth-800">
                {doneSubtasks}/{totalSubtasksCount}
              </p>
            </div>

            <Separator orientation="vertical" className="h-10" />

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points</p>
              <p className="font-display font-bold text-xl text-moss-600">
                {doneSP}/{totalSP}
                <span className="text-sm font-normal text-muted-foreground ml-1">SP</span>
              </p>
            </div>

            {totalSP > 0 && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Velocidad</p>
                  <p className="font-display font-bold text-xl text-earth-600">
                    {Math.round((doneSP / totalSP) * 100)}%
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Add Story Button + Progress bar */}
          <div className="flex items-center gap-4">
            <div className="w-48 hidden md:block">
              <div className="h-2 bg-moss-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss-gradient rounded-full transition-all duration-500 ease-out"
                  style={{ width: totalSubtasksCount > 0 ? `${(doneSubtasks / totalSubtasksCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <Button
              onClick={handleAddStory}
              className="bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nueva HU
            </Button>
          </div>
        </div>
      </div>

      {/* Board with Drag and Drop */}
      {isMounted ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          {boardContent}
        </DragDropContext>
      ) : (
        boardContent
      )}

      {/* Modals */}
      <UserStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => { setIsStoryModalOpen(false); setSelectedStory(null) }}
        onSave={handleSaveStory}
        onDelete={selectedStory ? handleDeleteStory : undefined}
        userStory={selectedStory}
        projectId={projectId}
      />

      <SubtaskModal
        isOpen={isSubtaskModalOpen}
        onClose={() => { setIsSubtaskModalOpen(false); setSelectedSubtask(null) }}
        onSave={handleSaveSubtask}
        onDelete={selectedSubtask ? handleDeleteSubtask : undefined}
        subtask={selectedSubtask}
        defaultStatus={subtaskDefaultStatus}
        teamMembers={teamMembers}
      />
    </>
  )
}
