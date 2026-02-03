'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  animate?: boolean
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
}

export function Logo({ size = 'md', className, animate = true }: LogoProps) {
  const dimension = sizeMap[size]

  return (
    <Image
      src="/logo-slothflow-circle.png"
      alt="SlothFlow Logo"
      width={dimension}
      height={dimension}
      className={cn(
        'object-contain rounded-full',
        animate && 'animate-gentle-sway',
        className
      )}
      priority
    />
  )
}

export function LogoWithText({
  size = 'md',
  className,
  textClassName,
}: LogoProps & { textClassName?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Logo size={size} />
      <span className={cn(
        'font-display font-bold text-sloth-800',
        size === 'xs' && 'text-lg',
        size === 'sm' && 'text-xl',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-3xl',
        size === 'xl' && 'text-4xl',
        size === '2xl' && 'text-5xl',
        textClassName
      )}>
        SlothFlow
      </span>
    </div>
  )
}
