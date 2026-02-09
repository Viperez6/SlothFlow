'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { SLOTH_AVATARS, SlothAvatarId, Subtask, VotingSession } from '@/lib/types'
import { SlothAvatarSelector } from '@/components/SlothAvatarSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SlothPageLoader } from '@/components/SlothLoader'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function JoinVotingPage() {
  const params = useParams()
  const projectId = params.id as string
  const sessionId = params.sessionId as string
  const router = useRouter()

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<SlothAvatarId>('sloth-default')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [session, setSession] = useState<VotingSession | null>(null)
  const [subtask, setSubtask] = useState<Subtask | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    checkAuthAndLoadSession()
  }, [sessionId])

  const checkAuthAndLoadSession = async () => {
    try {
      const supabase = getSupabase()

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated user - redirect to voting page
        setIsAuthenticated(true)
        router.push(`/projects/${projectId}/voting/${sessionId}`)
        return
      }

      // Load session info for display
      const { data: sessionData, error: sessionError } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        toast.error('Sesión no encontrada')
        return
      }

      setSession(sessionData)

      // Load subtask info
      if (sessionData.subtask_id) {
        const { data: subtaskData } = await supabase
          .from('subtasks')
          .select('*')
          .eq('id', sessionData.subtask_id)
          .single()

        setSubtask(subtaskData)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar la sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Por favor ingresa tu nombre')
      return
    }

    setJoining(true)
    try {
      const supabase = getSupabase()

      // Create guest voter
      const { data: guestData, error: guestError } = await supabase
        .from('guest_voters')
        .insert({
          session_id: sessionId,
          name: name.trim(),
          avatar: avatar,
        })
        .select()
        .single()

      if (guestError) throw guestError

      // Store guest info in localStorage for this session
      localStorage.setItem(`guest_${sessionId}`, JSON.stringify({
        id: guestData.id,
        name: guestData.name,
        avatar: guestData.avatar,
      }))

      toast.success(`¡Bienvenido, ${name}!`)
      router.push(`/projects/${projectId}/voting/${sessionId}`)
    } catch (error) {
      console.error('Error joining:', error)
      toast.error('Error al unirse a la sesión')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <SlothPageLoader message="Cargando sesión" />
  }

  if (isAuthenticated) {
    return <SlothPageLoader message="Redirigiendo..." />
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-organic-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <span className="text-6xl mb-4 block">😕</span>
            <h2 className="text-xl font-display font-bold text-sloth-800 mb-2">
              Sesión no encontrada
            </h2>
            <p className="text-muted-foreground">
              El enlace de votación puede haber expirado o ser inválido.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedAvatar = SLOTH_AVATARS[avatar]

  return (
    <div className="min-h-screen bg-organic-gradient flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-moss-100 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto overflow-hidden',
              selectedAvatar.bg
            )}>
              <Image
                src={selectedAvatar.image}
                alt={selectedAvatar.label}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          </div>
          <CardTitle className="font-display text-2xl text-sloth-800">
            Planning Poker
          </CardTitle>
          <CardDescription>
            Únete a la sesión de estimación
          </CardDescription>
        </CardHeader>

        <CardContent>
          {subtask && (
            <div className="mb-6 p-3 bg-moss-50 rounded-lg border border-moss-100">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Estimando
              </p>
              <p className="font-medium text-sloth-800">{subtask.title}</p>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="text-center text-lg"
                autoFocus
              />
            </div>

            {/* Avatar selector */}
            <div className="space-y-3">
              <Label className="text-center block">Elige tu perezoso</Label>
              <SlothAvatarSelector
                value={avatar}
                onChange={setAvatar}
                size="md"
              />
            </div>

            {/* Join button */}
            <Button
              type="submit"
              disabled={joining || !name.trim()}
              className={cn(
                'w-full bg-moss-gradient hover:opacity-90 text-white',
                'font-display font-semibold text-lg py-6',
                'btn-premium'
              )}
            >
              {joining ? (
                <>
                  <Image
                    src="/avatars/sloth-default.png"
                    alt="Loading"
                    width={24}
                    height={24}
                    className="animate-gentle-sway mr-2"
                  />
                  Uniéndose...
                </>
              ) : (
                <>
                  <Image
                    src={selectedAvatar.image}
                    alt={selectedAvatar.label}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Unirse a la votación
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
