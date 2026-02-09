'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Subtask, SubtaskStatus, Profile } from '@/lib/types'
import SubtaskCard from './SubtaskCard'
import { Plus, Inbox, Loader, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SubtaskColumnProps {
  status: SubtaskStatus
  subtasks: Subtask[]
  userStoryId: string
  projectId: string
  onSubtaskClick: (subtask: Subtask) => void
  onAddSubtask: (userStoryId: string, status: SubtaskStatus) => void
  isDragEnabled?: boolean
  userRole: string | null
  teamMembers: Profile[]
}

const statusConfig: Record<SubtaskStatus, {
  label: string
  headerText: string
  icon: React.ElementType
  emptyText: string
  accentColor: string
  dropHighlight: string
}> = {
  backlog: {
    label: 'Backlog',
    headerText: 'text-slate-600',
    icon: Inbox,
    emptyText: 'Sin subtareas',
    accentColor: 'bg-slate-400',
    dropHighlight: 'bg-slate-100/50 border-slate-300',
  },
  in_progress: {
    label: 'En Progreso',
    headerText: 'text-amber-600',
    icon: Loader,
    emptyText: 'Nada en progreso',
    accentColor: 'bg-amber-400',
    dropHighlight: 'bg-amber-100/50 border-amber-300',
  },
  done: {
    label: 'Completado',
    headerText: 'text-moss-600',
    icon: CheckCircle2,
    emptyText: 'Sin completar',
    accentColor: 'bg-moss-500',
    dropHighlight: 'bg-moss-100/50 border-moss-300',
  },
}

export default function SubtaskColumn({
  status,
  subtasks,
  userStoryId,
  projectId,
  onSubtaskClick,
  onAddSubtask,
  isDragEnabled = false,
  userRole,
  teamMembers,
}: SubtaskColumnProps) {
  const config = statusConfig[status]
  const filteredSubtasks = subtasks.filter((st) => st.status === status)
  const Icon = config.icon
  const droppableId = `${userStoryId}:${status}`

  const getAssignee = (assignedTo: string | null) => {
    if (!assignedTo) return null
    return teamMembers.find(m => m.id === assignedTo) || null
  }

  const renderSubtasks = (isDraggingOver: boolean = false) => (
    <>
      {filteredSubtasks.map((subtask, index) => (
        <SubtaskCard
          key={subtask.id}
          subtask={subtask}
          onClick={() => onSubtaskClick(subtask)}
          index={index}
          isDragEnabled={isDragEnabled}
          userRole={userRole}
          projectId={projectId}
          assignee={getAssignee(subtask.assigned_to)}
        />
      ))}

      {filteredSubtasks.length === 0 && !isDraggingOver && (
        <div className="flex flex-col items-center justify-center py-8 px-3">
          <Icon className={cn('w-6 h-6 opacity-30 mb-2', config.headerText)} />
          <p className="text-muted-foreground text-xs text-center mb-2">
            {config.emptyText}
          </p>
          <Button
            onClick={() => onAddSubtask(userStoryId, status)}
            variant="ghost"
            size="sm"
            className="text-xs text-moss-600 hover:text-moss-700 hover:bg-moss-50 h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Agregar
          </Button>
        </div>
      )}

      {filteredSubtasks.length === 0 && isDraggingOver && (
        <div className="flex flex-col items-center justify-center py-8 px-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/80 animate-pulse mb-2">
            <Icon className={cn('w-6 h-6', config.headerText)} />
          </div>
          <p className={cn('text-xs font-medium', config.headerText)}>
            Suelta aqui
          </p>
        </div>
      )}
    </>
  )

  return (
    <div className="flex-1 min-w-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('w-1.5 h-5 rounded-full', config.accentColor)} />
        <span className={cn('text-sm font-semibold', config.headerText)}>
          {config.label}
        </span>
        <Badge
          variant="secondary"
          className={cn('text-[10px] px-1.5 py-0 bg-white/60 border-0', config.headerText)}
        >
          {filteredSubtasks.length}
        </Badge>
        <div className="flex-1" />
        <Button
          onClick={() => onAddSubtask(userStoryId, status)}
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 rounded-full hover:bg-white/50', config.headerText)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Droppable Area */}
      {isDragEnabled ? (
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'min-h-[120px] space-y-2 p-2 rounded-xl transition-colors duration-200',
                snapshot.isDraggingOver && config.dropHighlight,
                snapshot.isDraggingOver && 'border-2 border-dashed'
              )}
            >
              {renderSubtasks(snapshot.isDraggingOver)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="min-h-[120px] space-y-2 p-2">
          {renderSubtasks()}
        </div>
      )}
    </div>
  )
}
