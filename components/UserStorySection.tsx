'use client'

import { useState } from 'react'
import { UserStory, Subtask, AcceptanceCriterion, SubtaskStatus, USER_STORY_PRIORITIES, Profile } from '@/lib/types'
import SubtaskColumn from './SubtaskColumn'
import { ChevronDown, ChevronRight, BookOpen, CheckSquare, Sparkles, Edit2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserStorySectionProps {
  userStory: UserStory
  subtasks: Subtask[]
  acceptanceCriteria: AcceptanceCriterion[]
  projectId: string
  userRole: string | null
  isExpanded: boolean
  onToggleExpand: () => void
  onSubtaskClick: (subtask: Subtask) => void
  onAddSubtask: (userStoryId: string, status: SubtaskStatus) => void
  onEditUserStory: (userStory: UserStory) => void
  isDragEnabled: boolean
  teamMembers: Profile[]
}

export default function UserStorySection({
  userStory,
  subtasks,
  acceptanceCriteria,
  projectId,
  userRole,
  isExpanded,
  onToggleExpand,
  onSubtaskClick,
  onAddSubtask,
  onEditUserStory,
  isDragEnabled,
  teamMembers,
}: UserStorySectionProps) {
  const priorityConfig = USER_STORY_PRIORITIES[userStory.priority]

  // Calculate SP: rollup from subtasks unless overridden
  const subtaskSPTotal = subtasks.reduce((sum, st) => sum + (st.story_points || 0), 0)
  const displaySP = userStory.story_points_override ? userStory.story_points : subtaskSPTotal

  // Progress
  const totalSubtasks = subtasks.length
  const doneSubtasks = subtasks.filter(st => st.status === 'done').length
  const progressPercent = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0

  // Acceptance criteria
  const totalCriteria = acceptanceCriteria.length
  const completedCriteria = acceptanceCriteria.filter(c => c.is_completed).length

  return (
    <div className={cn(
      'rounded-2xl border border-moss-100/50 shadow-sm overflow-hidden',
      'transition-all duration-300 hover:shadow-md',
      'bg-white/80 glass',
      'animate-fade-in opacity-0'
    )}
    style={{ animationFillMode: 'forwards' }}
    >
      {/* Header - always visible */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-moss-50/50 transition-colors"
        onClick={onToggleExpand}
      >
        {/* Expand/collapse icon */}
        <button className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Priority dot */}
        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', priorityConfig.dot)} />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-moss-500 flex-shrink-0" />
            <h3 className="font-display font-semibold text-sloth-800 truncate">
              {userStory.title}
            </h3>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Priority */}
          <Badge className={cn('text-[10px] px-2 py-0 border-0', priorityConfig.color)}>
            {priorityConfig.label}
          </Badge>

          {/* Story Points */}
          {displaySP !== null && displaySP > 0 && (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-xs font-semibold px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              {displaySP} SP
              {userStory.story_points_override && (
                <span className="ml-1 text-[9px] opacity-75">*</span>
              )}
            </Badge>
          )}

          {/* Acceptance Criteria */}
          {totalCriteria > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200">
              <CheckSquare className="w-3 h-3 mr-1" />
              {completedCriteria}/{totalCriteria}
            </Badge>
          )}

          {/* Subtask progress */}
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-moss-gradient rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {doneSubtasks}/{totalSubtasks}
            </span>
          </div>

          {/* Edit button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-moss-100"
            onClick={(e) => {
              e.stopPropagation()
              onEditUserStory(userStory)
            }}
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Expanded content - 3 column subtask layout */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-moss-100/50">
          {totalSubtasks === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-3">🦥</span>
              <p className="text-muted-foreground text-sm mb-3">
                Esta historia no tiene subtareas aun
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSubtask(userStory.id, 'backlog')}
                className="text-moss-600 hover:text-moss-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar subtarea
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mt-2">
              <SubtaskColumn
                status="backlog"
                subtasks={subtasks}
                userStoryId={userStory.id}
                projectId={projectId}
                onSubtaskClick={onSubtaskClick}
                onAddSubtask={onAddSubtask}
                isDragEnabled={isDragEnabled}
                userRole={userRole}
                teamMembers={teamMembers}
              />
              <SubtaskColumn
                status="in_progress"
                subtasks={subtasks}
                userStoryId={userStory.id}
                projectId={projectId}
                onSubtaskClick={onSubtaskClick}
                onAddSubtask={onAddSubtask}
                isDragEnabled={isDragEnabled}
                userRole={userRole}
                teamMembers={teamMembers}
              />
              <SubtaskColumn
                status="done"
                subtasks={subtasks}
                userStoryId={userStory.id}
                projectId={projectId}
                onSubtaskClick={onSubtaskClick}
                onAddSubtask={onAddSubtask}
                isDragEnabled={isDragEnabled}
                userRole={userRole}
                teamMembers={teamMembers}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
