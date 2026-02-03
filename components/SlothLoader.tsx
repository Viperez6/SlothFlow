'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SlothLoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: {
    logoSize: 48,
    text: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    logoSize: 64,
    text: 'text-base',
    gap: 'gap-4',
  },
  lg: {
    logoSize: 96,
    text: 'text-lg',
    gap: 'gap-6',
  },
}

export function SlothLoader({
  message = 'Cargando lentamente...',
  size = 'md',
  className
}: SlothLoaderProps) {
  const config = sizeConfig[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      config.gap,
      className
    )}>
      {/* Floating sloth logo */}
      <div className="animate-float">
        <Image
          src="/logo-slothflow.png"
          alt="SlothFlow"
          width={config.logoSize}
          height={config.logoSize}
          className="object-contain"
          priority
        />
      </div>

      {/* Message with animated dots */}
      <div className="flex items-center gap-1">
        <p className={cn(
          'text-moss-600 font-display font-medium',
          config.text
        )}>
          {message}
        </p>
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0s' }} />
          <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
          <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
        </span>
      </div>
    </div>
  )
}

// Full page loader
export function SlothPageLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-organic-gradient flex items-center justify-center">
      <div className="text-center">
        <SlothLoader message={message} size="lg" />

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-moss-200 rounded-full animate-pulse-soft" />
          <div className="w-3 h-3 bg-moss-300 rounded-full animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-2 bg-moss-200 rounded-full animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  )
}

// Inline loader for buttons or small spaces
export function SlothSpinner({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-slothflow.png"
      alt="Loading"
      width={20}
      height={20}
      className={cn('inline-block animate-gentle-sway', className)}
    />
  )
}
