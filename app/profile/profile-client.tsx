'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    User as UserIcon,
    Mail,
    Building2,
    Save,
    Loader2,
    Camera,
    Shield
} from 'lucide-react'

import type { User } from '@supabase/supabase-js'

interface Profile {
    id: string
    name: string | null
    avatar_url: string | null
    updated_at: string | null
    created_at: string
    ministry_id: string | null
    is_admin: boolean
    ministries?: {
        name: string
        invite_code: string
    }
}

interface ProfileClientProps {
    user: User
    profile: Profile | null
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
    const router = useRouter()
    const [name, setName] = useState(profile?.name || '')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()

        const { error } = await supabase
            .from('profiles')
            .update({
                name: name,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil: ' + error.message })
        } else {
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden">
                    <Link href="/dashboard">
                        <ArrowLeft className="w-5 h-5 text-zinc-500" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr,300px]">

                {/* Main Content */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Informações Pessoais</h2>
                            <p className="text-muted-foreground">Gerencie suas informações e preferências.</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <Card className="p-6">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="pl-10 bg-muted/50"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">O email não pode ser alterado.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="pl-10"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl">
                                <span className="text-2xl font-bold text-zinc-400">
                                    {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{profile?.name || 'Usuário'}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            <Shield className="w-3 h-3 mr-1" /> Membro
                        </Badge>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                            <Building2 className="w-4 h-4" />
                            <span>Ministério</span>
                        </div>
                        {profile?.ministry_id ? (
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                                <p className="font-medium text-sm">Ministério de Louvor</p>
                                <p className="text-xs text-muted-foreground">ID: {profile.ministry_id}</p>
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-sm text-muted-foreground">Nenhum ministério vinculado</p>
                                <Button variant="link" size="sm" className="h-auto p-0 mt-1">Vincular agora</Button>
                            </div>
                        )}
                    </Card>
                </div>

            </div>
        </div>
    )
}
