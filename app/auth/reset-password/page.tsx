'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SlothSpinner } from '@/components/SlothLoader'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('El enlace ha expirado o es inválido. Por favor solicita uno nuevo.')
      }
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      toast.success('Contraseña actualizada', {
        description: 'Serás redirigido al login...',
      })

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-organic-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-moss-100 shadow-xl animate-scale-in text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full bg-moss-gradient flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-sloth-800 mb-2">
              ¡Contraseña actualizada!
            </h1>
            <p className="text-muted-foreground">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <p className="text-muted-foreground mt-2">
              Serás redirigido al login...
            </p>

            <div className="mt-6 flex justify-center">
              <Logo size="md" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-gradient flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-moss-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 organic-blob bg-white" />
          <div className="absolute bottom-40 right-10 w-48 h-48 organic-blob-2 bg-white" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Logo size="xl" className="mb-6" />
          <h1 className="text-4xl font-display font-bold mb-4">
            Nueva Contraseña
          </h1>
          <p className="text-xl text-moss-100 leading-relaxed">
            Elige una contraseña segura y memorable. Tómate tu tiempo.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-moss-100 shadow-xl animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="lg:hidden text-center mb-4 flex justify-center">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl font-display">Nueva Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-lg mb-4',
                'bg-destructive/10 text-destructive border border-destructive/20'
              )}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
              >
                {loading ? (
                  <>
                    <SlothSpinner className="mr-2" />
                    Actualizando...
                  </>
                ) : (
                  'Cambiar contraseña'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
