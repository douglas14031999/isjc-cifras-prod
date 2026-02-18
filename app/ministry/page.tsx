import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    Music,
    Calendar,
    Building2,
    ShieldCheck,
    Copy,
    ChevronRight,
    Search
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const dynamic = 'force-dynamic'

export default async function MinistryPage() {
    const supabase = await createClient()

    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ministries(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.ministry_id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-800">
                    <Building2 className="w-10 h-10 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-bold">Sem Ministério</h1>
                <p className="text-muted-foreground max-w-md">
                    Você ainda não está vinculado a nenhum ministério. Peça ao seu líder o código de convite ou crie seu próprio ministério.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/settings">Ir para Configurações</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const ministry = profile.ministries

    // Fetch members
    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('ministry_id', profile.ministry_id)
        .order('name')

    // Fetch ministry chords count
    const { count: chordsCount } = await supabase
        .from('chords')
        .select('*', { count: 'exact', head: true })
        .eq('ministry_id', profile.ministry_id)

    // Fetch recent repertoires
    const { data: repertoires } = await supabase
        .from('repertoires')
        .select('*')
        .eq('ministry_id', profile.ministry_id)
        .order('event_date', { ascending: false })
        .limit(3)

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">{ministry.name}</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">Gerencie sua equipe, cifras e escalas em um só lugar.</p>
                </div>

                {profile.is_admin && (
                    <Button asChild className="shadow-lg shadow-blue-500/10">
                        <Link href={`/admin/ministries`}>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Gestão Administrativa
                        </Link>
                    </Button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Membros da Equipe</p>
                                <p className="text-3xl font-black">{members?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Cifras no Catálogo</p>
                                <p className="text-3xl font-black">{chordsCount || 0}</p>
                            </div>
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                                <Music className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Escalas Ativas</p>
                                <p className="text-3xl font-black">{repertoires?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Members List */}
                <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                        <div className="space-y-1">
                            <CardTitle>Membros do Ministério</CardTitle>
                            <CardDescription>Pessoas que fazem parte desta equipe.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="text-blue-600">
                            <Link href="/musicians">Ver todos <ChevronRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {members?.slice(0, 5).map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                                            <AvatarImage src={member.avatar_url} />
                                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800">
                                                {member.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{member.name}</span>
                                            <span className="text-xs text-muted-foreground">{member.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.is_admin && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] py-0">Líder</Badge>
                                        )}
                                        {!member.is_active && (
                                            <Badge variant="destructive" className="text-[10px] py-0">Inativo</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <div className="space-y-6">
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] -mr-10 -mt-10"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                Convite
                            </CardTitle>
                            <CardDescription className="text-zinc-400">Compartilhe este código para adicionar membros.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group">
                                <code className="text-2xl font-black tracking-widest text-blue-400">
                                    {ministry.invite_code}
                                </code>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Novos usuários podem usar este código durante o registro para se vincularem automaticamente a este ministério.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl">
                                <Link href="/chords/new">
                                    <Music className="w-4 h-4 text-emerald-500" />
                                    Cadastrar Música
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl">
                                <Link href="/repertoires">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    Criar Nova Escala
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl">
                                <Link href="/chords">
                                    <Search className="w-4 h-4 text-blue-500" />
                                    Buscar Cifras
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
