'use client'

import Link from 'next/link'
import {
    Music2,
    CalendarDays,
    Users,
    ArrowUpRight,
    PlayCircle,
    Plus,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardClientProps {
    stats: {
        chords: number
        activeScales: number
        members: number
    }
    recentChords: any[]
    upcomingEvents: any[]
}

export function DashboardClient({ stats, recentChords, upcomingEvents }: DashboardClientProps) {
    const nextEvent = upcomingEvents[0]
    const otherEvents = upcomingEvents.slice(1)

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'rehearsal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'event': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'meeting': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'rehearsal': return 'Ensaio'
            case 'event': return 'Evento/Culto'
            case 'meeting': return 'Reunião'
            default: return type
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Visão geral do ministério e atividades recentes.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/chords/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Cifra
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-blue-500/50 transition-all duration-300 border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repertório Total</CardTitle>
                        <Music2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.chords}</div>
                        <p className="text-xs text-muted-foreground">
                            Cifras cadastradas
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:border-blue-500/50 transition-all duration-300 border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Minhas Escalas</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeScales}</div>
                        <p className="text-xs text-muted-foreground">
                            Eventos futuros escalados
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:border-blue-500/50 transition-all duration-300 border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Músicos</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.members}</div>
                        <p className="text-xs text-muted-foreground">
                            Integrantes ativos
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Links Rápidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mt-1">
                            <Link href="/schedules" className="text-xs hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold">
                                Agenda Completa <ArrowUpRight className="w-3 h-3" />
                            </Link>
                            <Link href="/repertoires" className="text-xs hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold">
                                Repertórios <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Feed */}
                <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Atividades Recentes</CardTitle>
                                <CardDescription>
                                    Novas cifras e atualizações no repertório.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/chords" className="text-xs text-blue-500 font-bold">Ver tudo</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentChords.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 lowercase">
                                    <Music2 className="w-8 h-8 mb-2 opacity-20" />
                                    Nenhuma atividade recente
                                </div>
                            ) : (
                                recentChords.map((chord) => (
                                    <div key={chord.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition-transform">
                                            <Music2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <p className="text-sm font-bold truncate">
                                                {chord.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {chord.artist} • Por {chord.profiles?.name || 'Sistema'}
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 flex items-center gap-1 shrink-0">
                                            <Clock className="w-3 h-3" /> {new Date(chord.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events Widget */}
                <Card className="lg:col-span-3 border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-blue-600 text-white pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                Próximas Atividades
                            </Badge>
                            <CalendarDays className="w-5 h-5 opacity-50" />
                        </div>
                        {nextEvent ? (
                            <>
                                <CardTitle className="text-2xl font-black lowercase first-letter:uppercase leading-tight">
                                    {nextEvent.title}
                                </CardTitle>
                                <CardDescription className="text-white/80 font-medium">
                                    {format(new Date(nextEvent.start_at), "EEEE, d 'de' MMMM 'às' HH:mm'h'", { locale: ptBR })}
                                </CardDescription>
                            </>
                        ) : (
                            <>
                                <CardTitle className="text-xl font-bold">Nenhum evento agendado</CardTitle>
                                <CardDescription className="text-white/80">Fique atento aos novos agendamentos.</CardDescription>
                            </>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        {upcomingEvents.map((event, idx) => (
                                            <div key={event.id} className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                idx === 0
                                                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
                                                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                                            )}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getTypeColor(event.type))}>
                                                            {getTypeLabel(event.type)}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-zinc-400">
                                                            {format(new Date(event.start_at), "dd/MM 'às' HH:mm", { locale: ptBR })}h
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">
                                                        {event.title}
                                                    </p>
                                                </div>
                                                {event.repertoires?.title && (
                                                    <Badge variant="secondary" className="ml-2 text-[10px] bg-zinc-200 dark:bg-zinc-800 truncate max-w-[80px]">
                                                        {event.repertoires.title}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full rounded-xl font-bold h-11 bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20" asChild>
                                        <Link href={`/schedules`}>
                                            Ver Agenda Completa
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <CalendarDays className="w-12 h-12 mx-auto text-zinc-100 dark:text-zinc-800 mb-3" />
                                    <p className="text-sm text-zinc-500">A equipe ainda não planejou os próximos encontros.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
