'use client'

import Image from 'next/image'
import { SLOTH_AVATARS, SlothAvatarId } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SlothAvatarSelectorProps {
  value: SlothAvatarId | null
  onChange: (avatar: SlothAvatarId) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: { container: 'w-10 h-10', image: 32 },
  md: { container: 'w-14 h-14', image: 48 },
  lg: { container: 'w-18 h-18', image: 64 },
}

export function SlothAvatarSelector({
  value,
  onChange,
  size = 'md',
  className,
}: SlothAvatarSelectorProps) {
  const avatarIds = Object.keys(SLOTH_AVATARS) as SlothAvatarId[]
  const config = sizeConfig[size]

  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {avatarIds.map((avatarId) => {
        const avatar = SLOTH_AVATARS[avatarId]
        const isSelected = value === avatarId

        return (
          <button
            key={avatarId}
            type="button"
            onClick={() => onChange(avatarId)}
            className={cn(
              'rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-moss-500 focus:ring-offset-2',
              config.container,
              avatar.bg,
              isSelected
                ? 'ring-2 ring-moss-500 ring-offset-2 scale-110'
                : 'opacity-70 hover:opacity-100'
            )}
            title={avatar.label}
          >
            <Image
              src={avatar.image}
              alt={avatar.label}
              width={config.image}
              height={config.image}
              className="object-cover"
            />
          </button>
        )
      })}
    </div>
  )
}

interface SlothAvatarDisplayProps {
  avatarId: SlothAvatarId | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showLabel?: boolean
}

const displaySizeConfig = {
  xs: { container: 'w-6 h-6', image: 24 },
  sm: { container: 'w-8 h-8', image: 32 },
  md: { container: 'w-12 h-12', image: 48 },
  lg: { container: 'w-16 h-16', image: 64 },
  xl: { container: 'w-24 h-24', image: 96 },
}

export function SlothAvatarDisplay({
  avatarId,
  size = 'md',
  className,
  showLabel = false,
}: SlothAvatarDisplayProps) {
  const avatar = avatarId ? SLOTH_AVATARS[avatarId] : SLOTH_AVATARS['sloth-default']
  const config = displaySizeConfig[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center overflow-hidden',
          config.container,
          avatar.bg
        )}
      >
        <Image
          src={avatar.image}
          alt={avatar.label}
          width={config.image}
          height={config.image}
          className="object-cover"
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600">{avatar.label}</span>
      )}
    </div>
  )
}
