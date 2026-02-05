'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { Profile, SlothAvatarId, SLOTH_AVATARS } from '@/lib/types'
import { SlothAvatarSelector, SlothAvatarDisplay } from '@/components/SlothAvatarSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SlothPageLoader, SlothSpinner } from '@/components/SlothLoader'
import { Logo } from '@/components/Logo'
import { ArrowLeft, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatar, setAvatar] = useState<SlothAvatarId>('sloth-default')

  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setAvatar(profileData.avatar || 'sloth-default')
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const supabase = getSupabase()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          avatar: avatar,
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Perfil actualizado')
      router.refresh()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <SlothPageLoader message="Cargando perfil" />
  }

  if (!profile) {
    return null
  }

  const selectedAvatar = SLOTH_AVATARS[avatar]

  return (
    <div className="min-h-screen bg-organic-gradient">
      {/* Header */}
      <header className="bg-white/80 glass border-b border-moss-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-2xl font-display font-bold text-sloth-800">SlothFlow</h1>
          </div>
          <Link href="/projects">
            <Button variant="ghost" className="text-muted-foreground hover:text-moss-700 hover:bg-moss-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a proyectos
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-moss-100 shadow-lg animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mx-auto overflow-hidden',
                'ring-4 ring-moss-200 ring-offset-2',
                selectedAvatar.bg
              )}>
                <Image
                  src={selectedAvatar.image}
                  alt={selectedAvatar.label}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            </div>
            <CardTitle className="font-display text-2xl text-sloth-800">
              Mi Perfil
            </CardTitle>
            <CardDescription>
              Personaliza tu identidad en SlothFlow
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="px-3 py-2 bg-gray-50 rounded-md border text-sm text-muted-foreground">
                  {profile.email}
                </div>
              </div>

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Rol</Label>
                <div className="px-3 py-2 bg-gray-50 rounded-md border text-sm text-muted-foreground capitalize">
                  {profile.role === 'pm' ? 'Product Manager' : 'Developer'}
                </div>
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="text-center"
                />
              </div>

              {/* Avatar selector */}
              <div className="space-y-3">
                <Label className="text-center block">Elige tu perezoso</Label>
                <SlothAvatarSelector
                  value={avatar}
                  onChange={setAvatar}
                  size="lg"
                />
                <p className="text-xs text-center text-muted-foreground">
                  {selectedAvatar.label}
                </p>
              </div>

              {/* Save button */}
              <Button
                type="submit"
                disabled={saving}
                className={cn(
                  'w-full bg-moss-gradient hover:opacity-90 text-white',
                  'font-display font-semibold text-lg py-6',
                  'btn-premium'
                )}
              >
                {saving ? (
                  <>
                    <SlothSpinner className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
