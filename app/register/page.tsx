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

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [ministryCode, setMinistryCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()

        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        })

        if (authError) {
            console.error('Registration Error:', authError)
            if (authError.status === 409) {
                setError('Este e-mail já está cadastrado. Tente fazer login.')
            } else {
                setError(authError.message || 'Erro ao criar usuário no banco de dados')
            }
            setLoading(false)
            return
        }

        if (!authData.user) {
            setError('Erro ao criar usuário')
            setLoading(false)
            return
        }

        // 2. Verificar código (simplificado para UI demo, manter lógica original se necessário)
        let ministryId: string | null = null
        if (ministryCode.trim()) {
            const { data: ministryData, error: ministryError } = await supabase
                .rpc('get_ministry_by_invite_code', {
                    code: ministryCode.trim().toUpperCase()
                })
                .single()

            if (ministryError || !ministryData) {
                setError('Código de convite inválido')
                setLoading(false)
                return
            }
            ministryId = (ministryData as { id: string }).id
        }

        // 3. Criar perfil
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            name,
            email,
            ministry_id: ministryId,
            is_admin: false,
            is_active: true,
        })

        if (profileError) {
            setError('Erro ao criar perfil: ' + profileError.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-10 text-white relative overflow-hidden order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-bl from-zinc-900 via-zinc-900 to-black z-0" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]"></div>

                <div className="relative z-10">
                    <Logo width={36} height={36} textClassName="text-2xl" />
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold mb-4">Junte-se ao time.</h2>
                    <p className="text-lg text-zinc-400">
                        Tenha acesso a milhares de cifras, organize escalas e ensaie com mais eficiência.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 text-sm text-zinc-500">
                    <span>Termos de Uso</span>
                    <span>Privacidade</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background order-1 lg:order-2">
                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
                        <p className="text-sm text-muted-foreground">
                            Preencha os dados abaixo para começar.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium animate-in shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

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

                        <div className="gap-4 grid grid-cols-2">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="ministryCode">Código (Opcional)</Label>
                                <Input
                                    id="ministryCode"
                                    placeholder="ABC123"
                                    value={ministryCode}
                                    onChange={(e) => setMinistryCode(e.target.value)}
                                    disabled={loading}
                                    className="h-11 uppercase"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 mt-2" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                <>
                                    Finalizar Cadastro
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Já tem uma conta? </span>
                        <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
                            Entrar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
