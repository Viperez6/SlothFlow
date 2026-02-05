'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { VotingSession, Vote, Task, Profile, GuestVoter, SLOTH_AVATARS, SlothAvatarId } from '@/lib/types'
import { SlothAvatarDisplay } from '@/components/SlothAvatarSelector'
import { ArrowLeft, Eye, EyeOff, Users, Sparkles, CheckCircle2, Trophy, Share2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SlothPageLoader } from '@/components/SlothLoader'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { SupabaseClient } from '@supabase/supabase-js'

const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21, 34]

interface CurrentVoter {
  type: 'user' | 'guest'
  id: string
  name: string
  avatar: SlothAvatarId | null
  role?: string
}

export default function VotingPage() {
  const params = useParams()
  const projectId = params.id as string
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<VotingSession | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [currentVoter, setCurrentVoter] = useState<CurrentVoter | null>(null)
  const [myVote, setMyVote] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  // Load initial data
  useEffect(() => {
    if (sessionId) {
      loadData()
    }
  }, [sessionId])

  // Setup realtime subscription
  useEffect(() => {
    if (!sessionId) return

    const supabase = getSupabase()

    const channel = supabase
      .channel(`voting-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new) {
            setSession(payload.new as VotingSession)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadVotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const loadData = async () => {
    try {
      const supabase = getSupabase()

      // Check for authenticated user first
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated user
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setCurrentVoter({
          type: 'user',
          id: user.id,
          name: profile?.full_name || profile?.email || 'Usuario',
          avatar: profile?.avatar || 'sloth-default',
          role: profile?.role,
        })

        // Check for existing vote
        const { data: myVoteData } = await supabase
          .from('votes')
          .select('story_points')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .single()

        if (myVoteData) {
          setMyVote(myVoteData.story_points)
        }
      } else {
        // Check for guest in localStorage
        const guestData = localStorage.getItem(`guest_${sessionId}`)

        if (!guestData) {
          // No auth and no guest - redirect to join page
          router.push(`/projects/${projectId}/voting/${sessionId}/join`)
          return
        }

        const guest = JSON.parse(guestData) as GuestVoter
        setCurrentVoter({
          type: 'guest',
          id: guest.id,
          name: guest.name,
          avatar: guest.avatar,
        })

        // Check for existing guest vote
        const { data: myVoteData } = await supabase
          .from('votes')
          .select('story_points')
          .eq('session_id', sessionId)
          .eq('guest_id', guest.id)
          .single()

        if (myVoteData) {
          setMyVote(myVoteData.story_points)
        }
      }

      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        toast.error('Sesión no encontrada')
        router.push(`/projects/${projectId}`)
        return
      }

      setSession(sessionData)

      // Load task
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', sessionData.task_id)
        .single()

      setTask(taskData)
      await loadVotes()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVotes = async () => {
    try {
      const supabase = getSupabase()
      const { data: votesData } = await supabase
        .from('votes')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            role,
            avatar
          ),
          guest_voters:guest_id (
            id,
            name,
            avatar
          )
        `)
        .eq('session_id', sessionId)

      if (votesData) {
        setVotes(votesData)
      }
    } catch (error) {
      console.error('Error loading votes:', error)
    }
  }

  const handleVote = async (points: number) => {
    if (voting || myVote !== null || !currentVoter) return

    setVoting(true)
    try {
      const supabase = getSupabase()

      const voteData = currentVoter.type === 'user'
        ? { session_id: sessionId, user_id: currentVoter.id, story_points: points }
        : { session_id: sessionId, guest_id: currentVoter.id, story_points: points }

      const { error } = await supabase
        .from('votes')
        .insert(voteData)

      if (error) throw error
      setMyVote(points)
      toast.success('Voto registrado', {
        description: `Has votado ${points} story points`,
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Error al votar')
    } finally {
      setVoting(false)
    }
  }

  const handleReveal = async () => {
    if (revealing || votes.length === 0) return

    setRevealing(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('voting_sessions')
        .update({
          status: 'revealed',
          revealed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error
      toast.success('Votos revelados')
    } catch (error) {
      console.error('Error revealing:', error)
      toast.error('Error al revelar votos')
    } finally {
      setRevealing(false)
    }
  }

  const handleAssignPoints = async (points: number) => {
    if (assigning || !session) return

    setAssigning(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('tasks')
        .update({ story_points: points })
        .eq('id', session.task_id)

      if (error) throw error

      setShowConfetti(true)
      toast.success('Story Points asignados', {
        description: `La tarea ahora tiene ${points} SP`,
      })

      setTimeout(() => {
        router.push(`/projects/${projectId}`)
      }, 1500)
    } catch (error) {
      console.error('Error assigning points:', error)
      toast.error('Error al asignar puntos')
    } finally {
      setAssigning(false)
    }
  }

  const copyShareLink = () => {
    const joinUrl = `${window.location.origin}/projects/${projectId}/voting/${sessionId}/join`
    navigator.clipboard.writeText(joinUrl)
    toast.success('Enlace copiado', {
      description: 'Comparte este enlace con tu equipo',
    })
  }

  const getVoteCount = (points: number) => {
    return votes.filter(v => v.story_points === points).length
  }

  const getVoterDisplay = (vote: Vote) => {
    if (vote.profiles) {
      return {
        name: vote.profiles.full_name || vote.profiles.email || 'Usuario',
        avatar: vote.profiles.avatar as SlothAvatarId || 'sloth-default',
        role: vote.profiles.role,
        isGuest: false,
      }
    }
    if (vote.guest_voters) {
      return {
        name: vote.guest_voters.name,
        avatar: vote.guest_voters.avatar as SlothAvatarId,
        role: null,
        isGuest: true,
      }
    }
    return { name: 'Anónimo', avatar: 'sloth-default' as SlothAvatarId, role: null, isGuest: true }
  }

  if (loading) {
    return <SlothPageLoader message="Cargando sesión de poker" />
  }

  const isRevealed = session?.status === 'revealed'
  const isPM = currentVoter?.type === 'user' && currentVoter?.role === 'pm'
  const hasVoted = myVote !== null

  // Calculate average and consensus
  const voteValues = votes.map(v => v.story_points)
  const average = voteValues.length > 0
    ? (voteValues.reduce((a, b) => a + b, 0) / voteValues.length).toFixed(1)
    : 0
  const hasConsensus = voteValues.length > 1 && new Set(voteValues).size === 1

  return (
    <div className="min-h-screen bg-organic-gradient">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🦥', '🌿', '✨', '🎉'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 glass border-b border-moss-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-moss-600 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al tablero
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-sloth-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-gradient rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Planning Poker
              </h1>
              {task && (
                <p className="text-muted-foreground mt-1">
                  Estimando: <span className="font-medium text-sloth-700">{task.title}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Share button */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Invitar
              </Button>

              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-moss-100 rounded-full">
                <span className="w-2 h-2 bg-moss-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-moss-700">En vivo</span>
              </div>
            </div>
          </div>

          {/* Current voter info */}
          {currentVoter && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <SlothAvatarDisplay avatarId={currentVoter.avatar} size="xs" />
              <span>Votando como <strong className="text-sloth-700">{currentVoter.name}</strong></span>
              {currentVoter.type === 'guest' && (
                <Badge variant="outline" className="text-xs">Invitado</Badge>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Voting Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-semibold text-sloth-700 mb-4 flex items-center gap-2">
            {hasVoted ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-moss-500" />
                Tu voto ha sido registrado
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-500" />
                Selecciona tu estimación
              </>
            )}
          </h2>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {FIBONACCI_NUMBERS.map((num, index) => (
              <button
                key={num}
                onClick={() => handleVote(num)}
                disabled={hasVoted || voting || isRevealed}
                className={cn(
                  'voting-card aspect-[3/4] flex items-center justify-center',
                  'text-2xl md:text-3xl font-display font-bold',
                  'animate-fade-in opacity-0',
                  myVote === num && 'selected',
                  (hasVoted && myVote !== num) && 'opacity-40',
                  isRevealed && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards'
                }}
              >
                {num}
                {myVote === num && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-4 h-4 text-moss-500" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Waiting message */}
        {hasVoted && !isRevealed && !isPM && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50 animate-fade-in">
            <CardContent className="py-4">
              <p className="text-amber-700 flex items-center gap-2">
                <span className="text-xl animate-gentle-sway">🦥</span>
                Esperando a que el PM revele los votos...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats when revealed */}
        {isRevealed && votes.length > 0 && (
          <Card className="mb-8 border-moss-200 bg-moss-50/50 animate-scale-in">
            <CardContent className="py-6">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Promedio</p>
                  <p className="text-4xl font-display font-bold text-moss-600">{average}</p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Votos</p>
                  <p className="text-4xl font-display font-bold text-sloth-700">{votes.length}</p>
                </div>
                {hasConsensus && (
                  <>
                    <Separator orientation="vertical" className="h-16" />
                    <div className="text-center">
                      <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-amber-600">Consenso</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-semibold text-sloth-700 mb-4">
            Participantes ({votes.length})
          </h2>

          {votes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <span className="text-4xl mb-4 block">🦥</span>
                <p className="text-muted-foreground">Esperando votos...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {votes.map((vote, index) => {
                const voter = getVoterDisplay(vote)
                return (
                  <Card
                    key={vote.id}
                    className={cn(
                      'overflow-hidden animate-fade-in opacity-0',
                      'hover:shadow-md transition-shadow'
                    )}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <SlothAvatarDisplay avatarId={voter.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sloth-800 truncate">
                            {voter.name}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {voter.isGuest ? 'Invitado' : voter.role}
                          </Badge>
                        </div>
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          'transition-all duration-300',
                          isRevealed
                            ? 'bg-moss-gradient text-white'
                            : 'bg-earth-100'
                        )}>
                          {isRevealed ? (
                            <span className="text-xl font-display font-bold">
                              {vote.story_points}
                            </span>
                          ) : (
                            <EyeOff className="w-5 h-5 text-earth-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* PM Controls */}
        {isPM && (
          <section className="border-t border-moss-100 pt-8">
            <h2 className="text-lg font-display font-semibold text-sloth-700 mb-4">
              Controles del PM
            </h2>

            {!isRevealed ? (
              <Button
                onClick={handleReveal}
                disabled={revealing || votes.length === 0}
                size="lg"
                className={cn(
                  'w-full bg-moss-gradient hover:opacity-90 text-white',
                  'font-display font-semibold text-lg py-6',
                  'btn-premium'
                )}
              >
                {revealing ? (
                  <span className="animate-gentle-sway text-2xl mr-2">🦥</span>
                ) : (
                  <Eye className="w-5 h-5 mr-2" />
                )}
                Revelar Votos
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Asignar Story Points Final</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {FIBONACCI_NUMBERS.map((num) => {
                      const count = getVoteCount(num)
                      return (
                        <button
                          key={num}
                          onClick={() => handleAssignPoints(num)}
                          disabled={assigning}
                          className={cn(
                            'relative aspect-square rounded-xl border-2 border-moss-200',
                            'text-xl font-display font-bold text-sloth-700',
                            'hover:border-moss-500 hover:bg-moss-50 transition-all',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            count > 0 && 'border-moss-400 bg-moss-50'
                          )}
                        >
                          {num}
                          {count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-moss-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {assigning && (
                    <div className="flex items-center justify-center mt-4 gap-2">
                      <span className="animate-gentle-sway text-2xl">🦥</span>
                      <span className="text-moss-600">Guardando...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>

      {/* CSS for confetti */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  )
}
