'use client'

import { useState, useRef, useEffect } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { Task, TaskStatus } from '@/lib/types'
import KanbanColumn from './KanbanColumn'
import TaskModal from './TaskModal'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import type { SupabaseClient } from '@supabase/supabase-js'

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
  userRole: string | null
  taskDocsMap: Record<string, boolean>
  taskLinksMap: Record<string, number>
}

export default function KanbanBoard({
  projectId,
  initialTasks,
  userRole,
  taskDocsMap,
  taskLinksMap
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog')
  const [isMounted, setIsMounted] = useState(false)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Fix hydration mismatch - only render drag and drop on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  // Open modal to edit task on click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null)
    setDefaultStatus(status)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside a droppable area
    if (!destination) return

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId as TaskStatus
    const taskId = draggableId

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    // Update in database
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (error) throw error

      // Show success feedback based on new status
      const statusMessages: Record<TaskStatus, string> = {
        backlog: 'Tarea movida a Backlog',
        in_progress: 'Tarea en progreso',
        done: '¡Tarea completada!',
      }

      toast.success(statusMessages[newStatus], {
        description: newStatus === 'done' ? '¡Buen trabajo! 🦥' : undefined,
      })
    } catch (error) {
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: source.droppableId as TaskStatus } : task
        )
      )
      toast.error('Error al mover tarea', {
        description: 'No se pudo actualizar el estado. Intenta de nuevo.',
      })
      console.error(error)
    }
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const supabase = getSupabase()

    if (selectedTask) {
      // Update existing task
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            story_points: taskData.story_points,
            status: taskData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTask.id)
          .select()
          .single()

        if (error) throw error

        setTasks(tasks.map(t => t.id === selectedTask.id ? data : t))
        toast.success('Tarea actualizada')
      } catch (error) {
        toast.error('Error al actualizar', {
          description: 'No se pudo actualizar la tarea.',
        })
        console.error(error)
        throw error
      }
    } else {
      // Create new task
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            project_id: projectId,
            title: taskData.title,
            description: taskData.description,
            story_points: taskData.story_points,
            status: taskData.status || defaultStatus,
          })
          .select()
          .single()

        if (error) throw error

        setTasks([...tasks, data])
        toast.success('Tarea creada', {
          description: 'La nueva tarea ha sido agregada al tablero.',
        })
      } catch (error) {
        toast.error('Error al guardar', {
          description: 'No se pudo guardar la tarea.',
        })
        console.error(error)
        throw error
      }
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      const supabase = getSupabase()

      // Delete related task_links
      await supabase.from('task_links').delete().eq('task_id', selectedTask.id)
      // Delete related task_documents
      await supabase.from('task_documents').delete().eq('task_id', selectedTask.id)
      // Delete task
      const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== selectedTask.id))
      toast.success('Tarea eliminada')
    } catch (error) {
      toast.error('Error al eliminar', {
        description: 'No se pudo eliminar la tarea.',
      })
      console.error(error)
      throw error
    }
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0)
  const completedPoints = tasks
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + (t.story_points || 0), 0)

  const columnsContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="Backlog"
        status="backlog"
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
        isDragEnabled={isMounted}
        userRole={userRole}
        taskDocsMap={taskDocsMap}
        taskLinksMap={taskLinksMap}
      />
      <KanbanColumn
        title="En Progreso"
        status="in_progress"
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
        isDragEnabled={isMounted}
        userRole={userRole}
        taskDocsMap={taskDocsMap}
        taskLinksMap={taskLinksMap}
      />
      <KanbanColumn
        title="Completado"
        status="done"
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
        isDragEnabled={isMounted}
        userRole={userRole}
        taskDocsMap={taskDocsMap}
        taskLinksMap={taskLinksMap}
      />
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Progreso</p>
                <p className="font-display font-bold text-xl text-sloth-800">
                  {completedTasks}/{totalTasks}
                  <span className="text-sm font-normal text-muted-foreground ml-1">tareas</span>
                </p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-10" />

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points</p>
              <p className="font-display font-bold text-xl text-moss-600">
                {completedPoints}/{totalPoints}
                <span className="text-sm font-normal text-muted-foreground ml-1">SP</span>
              </p>
            </div>

            {totalPoints > 0 && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Velocidad</p>
                  <p className="font-display font-bold text-xl text-earth-600">
                    {Math.round((completedPoints / totalPoints) * 100)}%
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-48 hidden md:block">
            <div className="h-2 bg-moss-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-moss-gradient rounded-full transition-all duration-500 ease-out"
                style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Columns with Drag and Drop */}
      {isMounted ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          {columnsContent}
        </DragDropContext>
      ) : (
        columnsContent
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        task={selectedTask}
        projectId={projectId}
      />
    </>
  )
}
