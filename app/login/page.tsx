'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SlothSpinner } from '@/components/SlothLoader'
import { Logo, LogoWithText } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Bienvenido de vuelta', {
        description: 'Redirigiendo a tus proyectos...',
      })
      router.push('/projects')
      router.refresh()
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description: err instanceof Error ? err.message : 'Credenciales inválidas',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('Cuenta creada', {
        description: 'Revisa tu email para confirmar tu cuenta.',
      })
    } catch (err) {
      toast.error('Error al crear cuenta', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email requerido', {
        description: 'Por favor ingresa tu email',
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast.success('Email enviado', {
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      })
    } catch (err) {
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Intenta de nuevo',
      })
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
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
              Sin prisa, sin pausa
            </h1>
            <p className="text-xl text-moss-100 leading-relaxed">
              Tómate tu tiempo para recordar. Te enviaremos un enlace seguro.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md border-moss-100 shadow-xl animate-fade-in">
            <CardHeader className="space-y-1">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-moss-600 transition mb-2 group w-fit"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al login
              </button>
              <CardTitle className="text-2xl font-display">Recuperar Contraseña</CardTitle>
              <CardDescription>
                Te enviaremos un enlace a tu email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
                >
                  {loading ? (
                    <SlothSpinner className="mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Enviar enlace de recuperación
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-gradient flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-moss-gradient relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 organic-blob bg-white" />
          <div className="absolute bottom-40 right-10 w-48 h-48 organic-blob-2 bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 organic-blob bg-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Logo size="2xl" className="mb-8" />
          <h1 className="text-5xl font-display font-bold mb-4">
            SlothFlow
          </h1>
          <p className="text-2xl text-moss-100 mb-8 leading-relaxed">
            Take it slow,<br />get it done.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-moss-100">Gestión de proyectos sin estrés</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                🎯
              </div>
              <span className="text-moss-100">Tableros Kanban intuitivos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                🃏
              </div>
              <span className="text-moss-100">Planning Poker en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-display font-bold text-sloth-800">SlothFlow</h1>
            <p className="text-muted-foreground">Take it slow, get it done</p>
          </div>

          <Card className="border-moss-100 shadow-xl animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-display">Bienvenido</CardTitle>
              <CardDescription>
                Inicia sesión o crea una cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
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
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-moss-600 hover:text-moss-700 transition hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 bg-moss-gradient hover:opacity-90 text-white font-display font-semibold btn-premium"
                  >
                    {loading ? <SlothSpinner /> : 'Iniciar Sesión'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 border-moss-200 text-moss-700 hover:bg-moss-50 font-display font-semibold"
                  >
                    {loading ? <SlothSpinner /> : 'Registrarse'}
                  </Button>
                </div>
              </form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  o continúa con
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full border-moss-200 text-muted-foreground hover:bg-moss-50"
                disabled
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google (Próximamente)
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
