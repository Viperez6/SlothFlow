'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Task, TaskStatus } from '@/lib/types'
import TaskCard from './TaskCard'
import { Plus, Inbox, Loader, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
  isDragEnabled?: boolean
  userRole: string | null
  taskDocsMap: Record<string, boolean>
  taskLinksMap: Record<string, number>
}

const statusConfig: Record<TaskStatus, {
  bg: string
  headerBg: string
  headerText: string
  icon: React.ElementType
  emptyText: string
  accentColor: string
  dropHighlight: string
}> = {
  backlog: {
    bg: 'bg-gradient-to-b from-slate-50/80 to-slate-100/50',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-700',
    icon: Inbox,
    emptyText: 'Sin tareas pendientes',
    accentColor: 'bg-slate-400',
    dropHighlight: 'bg-slate-200/50 border-slate-300',
  },
  in_progress: {
    bg: 'bg-gradient-to-b from-amber-50/80 to-amber-100/50',
    headerBg: 'bg-amber-100',
    headerText: 'text-amber-700',
    icon: Loader,
    emptyText: 'Nada en progreso',
    accentColor: 'bg-amber-400',
    dropHighlight: 'bg-amber-200/50 border-amber-300',
  },
  done: {
    bg: 'bg-gradient-to-b from-moss-50/80 to-moss-100/50',
    headerBg: 'bg-moss-100',
    headerText: 'text-moss-700',
    icon: CheckCircle2,
    emptyText: 'Completa tu primera tarea',
    accentColor: 'bg-moss-500',
    dropHighlight: 'bg-moss-200/50 border-moss-300',
  },
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  onTaskClick,
  onAddTask,
  isDragEnabled = false,
  userRole,
  taskDocsMap,
  taskLinksMap,
}: KanbanColumnProps) {
  const config = statusConfig[status]
  const filteredTasks = tasks.filter((task) => task.status === status)
  const Icon = config.icon

  const renderTasks = (isDraggingOver: boolean = false) => (
    <>
      {filteredTasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          index={index}
          isDragEnabled={isDragEnabled}
          userRole={userRole}
          hasDocument={taskDocsMap[task.id] || false}
          linksCount={taskLinksMap[task.id] || 0}
        />
      ))}

      {filteredTasks.length === 0 && !isDraggingOver && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
            'bg-white/60'
          )}>
            <Icon className={cn('w-8 h-8 opacity-40', config.headerText)} />
          </div>
          <p className="text-muted-foreground text-sm text-center">
            {config.emptyText}
          </p>
          <Button
            onClick={() => onAddTask(status)}
            variant="ghost"
            size="sm"
            className="mt-3 text-moss-600 hover:text-moss-700 hover:bg-moss-100"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar tarea
          </Button>
        </div>
      )}

      {/* Drop hint when dragging over empty column */}
      {filteredTasks.length === 0 && isDraggingOver && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
            'bg-white/80 animate-pulse'
          )}>
            <Icon className={cn('w-8 h-8', config.headerText)} />
          </div>
          <p className={cn('text-sm font-medium', config.headerText)}>
            Suelta aquí
          </p>
        </div>
      )}
    </>
  )

  return (
    <div
      className={cn(
        'rounded-2xl min-h-[500px] flex flex-col overflow-hidden',
        'border border-moss-100/50 shadow-sm',
        'transition-all duration-300 hover:shadow-md',
        config.bg,
        'animate-fade-in opacity-0'
      )}
      style={{
        animationDelay: status === 'backlog' ? '0.1s' : status === 'in_progress' ? '0.2s' : '0.3s',
        animationFillMode: 'forwards'
      }}
    >
      {/* Column Header */}
      <div
        className={cn(
          'px-4 py-4 flex justify-between items-center',
          'border-b border-white/50',
          config.headerBg
        )}
      >
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className={cn(
            'w-2 h-8 rounded-full',
            config.accentColor
          )} />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', config.headerText)} />
              <h3 className={cn('font-display font-bold text-lg', config.headerText)}>
                {title}
              </h3>
            </div>
          </div>

          <Badge
            variant="secondary"
            className={cn(
              'ml-1 font-display font-bold px-2.5 py-0.5',
              'bg-white/60 border-0',
              config.headerText
            )}
          >
            {filteredTasks.length}
          </Badge>
        </div>

        <Button
          onClick={() => onAddTask(status)}
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full',
            'hover:bg-white/50 transition-all duration-200',
            'hover:scale-110',
            config.headerText
          )}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tasks Area */}
      {isDragEnabled ? (
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'p-4 flex-1 space-y-3 overflow-y-auto scrollbar-organic transition-colors duration-200',
                snapshot.isDraggingOver && config.dropHighlight,
                snapshot.isDraggingOver && 'border-2 border-dashed rounded-lg m-2'
              )}
            >
              {renderTasks(snapshot.isDraggingOver)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="p-4 flex-1 space-y-3 overflow-y-auto scrollbar-organic">
          {renderTasks()}
        </div>
      )}
    </div>
  )
}
