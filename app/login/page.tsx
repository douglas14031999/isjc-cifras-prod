'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 z-0" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10">
                    <Logo width={36} height={36} textClassName="text-2xl" />
                </div>

                <div className="relative z-10 max-w-md">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed text-zinc-300">
                            &ldquo;A plataforma transformou a maneira como nosso ministério gerencia o repertório. Simples, rápido e essencial.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-500">
                            — Liderança de Louvor
                        </footer>
                    </blockquote>
                </div>

                <div className="relative z-10 text-xs text-zinc-600">
                    © 2026 Igreja Sede. Todos os direitos reservados.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[380px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
                        <p className="text-sm text-muted-foreground">
                            Digite suas credenciais para acessar sua conta.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium animate-in shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Button variant="link" size="sm" className="px-0 h-auto font-normal text-muted-foreground hover:text-primary" type="button">
                                    Esqueceu a senha?
                                </Button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Não tem uma conta? </span>
                        <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
                            Cadastre-se
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
