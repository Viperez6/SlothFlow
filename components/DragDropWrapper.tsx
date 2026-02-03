'use client'

import { useState, useEffect, ReactNode } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'

interface DragDropWrapperProps {
  children: ReactNode
  onDragEnd: (result: DropResult) => void
}

export function DragDropWrapper({ children, onDragEnd }: DragDropWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering DragDropContext on server
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  )
}
