'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Trash2,
    CalendarDays,
    Music,
    Share2,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    UserPlus,
    Check,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createEvent, addAssignment, removeAssignment, deleteEvent } from './actions'
import { useToast } from '@/hooks/use-toast'

interface Event {
    id: string
    title: string
    description: string | null
    type: 'rehearsal' | 'event' | 'meeting'
    start_at: string
    end_at: string | null
    ministry_id: string
    repertoire_id: string | null
    event_assignments: any[]
    repertoires: { id: string, title: string } | null
}

interface SchedulesClientProps {
    initialEvents: any[]
    musicians: any[]
    isAdmin: boolean
    ministryId: string
    profileId: string
}

export function SchedulesClient({
    initialEvents,
    musicians,
    isAdmin,
    ministryId,
    profileId
}: SchedulesClientProps) {
    const { toast } = useToast()
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(false)

    // Form states
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'rehearsal' | 'event' | 'meeting'>('rehearsal')
    const [startTime, setStartTime] = useState('19:30')
    const [musicianId, setMusicianId] = useState('')
    const [musicianRole, setMusicianRole] = useState('')

    const events = initialEvents as Event[]

    const eventDates = useMemo(() => {
        return events.map(e => new Date(e.start_at))
    }, [events])

    const filteredEvents = events.filter(event =>
        isSameDay(new Date(event.start_at), selectedDate)
    )

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const startAt = new Date(selectedDate)
            const [hours, minutes] = startTime.split(':')
            startAt.setHours(parseInt(hours), parseInt(minutes))

            await createEvent({
                title,
                description,
                type,
                start_at: startAt.toISOString(),
                ministry_id: ministryId
            })

            toast({
                title: 'Sucesso',
                description: 'Evento agendado com sucesso!'
            })
            setIsCreateOpen(false)
            resetForm()
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddAssignmentLocal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedEvent || !musicianId) return
        setLoading(true)

        try {
            await addAssignment(selectedEvent.id, musicianId, musicianRole)
            toast({
                title: 'Sucesso',
                description: 'Escala atualizada!'
            })
            setMusicianId('')
            setMusicianRole('')
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveAssignmentLocal = async (assignmentId: string) => {
        try {
            await removeAssignment(assignmentId)
            toast({
                title: 'Sucesso',
                description: 'Membro removido da escala.'
            })
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive'
            })
        }
    }

    const handleDeleteEventLocal = async () => {
        if (!selectedEvent) return
        setLoading(true)

        try {
            await deleteEvent(selectedEvent.id)
            toast({
                title: 'Sucesso',
                description: 'Agendamento excluído.'
            })
            setIsDeleteOpen(false)
            setSelectedEvent(null)
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCopyScale = (event: Event) => {
        const date = format(new Date(event.start_at), "dd/MM 'às' HH:mm", { locale: ptBR })
        const assignments = event.event_assignments
            .map(a => `• ${a.profiles.name}${a.role ? ` (${a.role})` : ''}`)
            .join('\n')

        const text = `📌 *${event.title}*\n🗓 ${date}\n\n*ESCALA:*\n${assignments || 'Nenhum músico escalado.'}\n\n${event.description ? `📝 _Obs: ${event.description}_` : ''}`

        navigator.clipboard.writeText(text)
        toast({
            title: 'Copiado!',
            description: 'A escala foi copiada para o WhatsApp com sucesso.'
        })
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setType('rehearsal')
        setStartTime('19:30')
    }

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
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Minimalist Header */}
            <header className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Agendamentos</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie ensaios, eventos e escalas.</p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Agendamento
                    </Button>
                )}
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Calendar & Quick Filters */}
                <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 overflow-y-auto hidden lg:block">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Calendário</h2>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(d) => d && setSelectedDate(d)}
                                className="rounded-xl border border-zinc-100 dark:border-zinc-800"
                                locale={ptBR}
                                modifiers={{ hasEvent: eventDates }}
                                modifiersClassNames={{
                                    hasEvent: "font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                }}
                            />
                        </div>

                        <div>
                            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Categorias</h2>
                            <div className="space-y-2">
                                {[
                                    { label: 'Ensaio', color: 'bg-blue-500' },
                                    { label: 'Culto/Evento', color: 'bg-emerald-500' },
                                    { label: 'Reunião', color: 'bg-purple-500' }
                                ].map((cat) => (
                                    <div key={cat.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Agenda View */}
                <main className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                    {/* Compact Date Navigation for Mobile/Small Screens */}
                    <div className="lg:hidden p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(subMonths(selectedDate, 1))}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                        </Button>
                        <span className="font-bold text-sm uppercase tracking-wider">
                            {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}>
                            Próximo <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white lowercase first-letter:uppercase">
                                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </h2>
                            {isToday(selectedDate) && (
                                <Badge variant="secondary" className="mt-2 bg-blue-500/10 text-blue-500 border-blue-500/20">Hoje</Badge>
                            )}
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full h-9"
                                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Mês anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full h-9"
                                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                            >
                                Próximo mês <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-4">
                        {filteredEvents.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                    <CalendarIcon className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Nenhum evento agendado</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                                    Fique à vontade para planejar um novo ensaio ou reunião para este dia.
                                </p>
                                {isAdmin && (
                                    <Button
                                        onClick={() => setIsCreateOpen(true)}
                                        variant="outline"
                                        className="mt-6 rounded-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Agendar Agora
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredEvents.map((event, index) => {
                                        const isUserAssigned = event.event_assignments.some(a => a.profiles.id === profileId)

                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className={cn(
                                                    "overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all duration-300",
                                                    isUserAssigned && "border-l-4 border-l-blue-500"
                                                )}>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="space-y-3 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className={cn("font-medium", getTypeColor(event.type))}>
                                                                        {getTypeLabel(event.type)}
                                                                    </Badge>
                                                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {format(new Date(event.start_at), 'HH:mm')}h
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                                        {event.title}
                                                                        {isUserAssigned && (
                                                                            <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-none px-1.5 py-0">
                                                                                <Check className="w-3 h-3" />
                                                                            </Badge>
                                                                        )}
                                                                    </h3>
                                                                    {event.description && (
                                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                                                            {event.description}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-6 pt-2">
                                                                    <div className="flex -space-x-2">
                                                                        {event.event_assignments.slice(0, 4).map((a: any) => (
                                                                            <div
                                                                                key={a.id}
                                                                                className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black"
                                                                                title={a.profiles.name}
                                                                            >
                                                                                {a.profiles.name[0]}
                                                                            </div>
                                                                        ))}
                                                                        {event.event_assignments.length > 4 && (
                                                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                                                +{event.event_assignments.length - 4}
                                                                            </div>
                                                                        )}
                                                                        {event.event_assignments.length === 0 && (
                                                                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold self-center ml-2">Escala aberta</span>
                                                                        )}
                                                                    </div>

                                                                    {event.repertoire_id && (
                                                                        <Link
                                                                            href={`/repertoires/${event.repertoire_id}`}
                                                                            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline text-sm font-bold"
                                                                        >
                                                                            <Music className="w-3.5 h-3.5" />
                                                                            Ver Repertório
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="rounded-full"
                                                                    onClick={() => handleCopyScale(event)}
                                                                >
                                                                    <Share2 className="w-4 h-4 text-zinc-500" />
                                                                </Button>
                                                                {isAdmin && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="rounded-full text-blue-600"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event)
                                                                                setIsAssignmentOpen(true)
                                                                            }}
                                                                        >
                                                                            <UserPlus className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="rounded-full text-zinc-500"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event)
                                                                                setIsDeleteOpen(true)
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Event Dialog (Clean) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Novo Agendamento</DialogTitle>
                        <DialogDescription>
                            Defina os detalhes para o compromisso no dia {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título do Evento</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Ensaio de Sábado"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rehearsal">Ensaio</SelectItem>
                                        <SelectItem value="event">Evento / Culto</SelectItem>
                                        <SelectItem value="meeting">Reunião</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Horário de Início</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição / Notas</Label>
                            <Textarea
                                id="description"
                                placeholder="Opcional: Detalhes adicionais..."
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateEvent} disabled={loading || !title} className="bg-blue-600 hover:bg-blue-500 text-white">
                            {loading ? "Criando..." : "Criar Evento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assignment Dialog (Clean) */}
            <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Escala</DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.title} • {selectedEvent && format(new Date(selectedEvent.start_at), "d 'de' MMM, HH:mm'h'", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Current Scale */}
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-500 mb-3">Membros Escalados</h3>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedEvent?.event_assignments.map((assignment: any) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                                {assignment.profiles.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{assignment.profiles.name}</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{assignment.role || 'Geral'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                            onClick={() => handleRemoveAssignmentLocal(assignment.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                                {selectedEvent?.event_assignments.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed rounded-xl border-zinc-100 dark:border-zinc-800">
                                        <p className="text-sm text-zinc-400 font-medium">Nenhum membro escalado ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add New Assignment */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-sm font-semibold text-zinc-500 mb-4">Adicionar Membro</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Membro</Label>
                                    <Select value={musicianId} onValueChange={setMusicianId}>
                                        <SelectTrigger className="rounded-lg h-9">
                                            <SelectValue placeholder="Selecionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {musicians.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Função (Ex: Guitarra)</Label>
                                    <Input
                                        className="h-9 rounded-lg"
                                        placeholder="Geral"
                                        value={musicianRole}
                                        onChange={(e) => setMusicianRole(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg h-9 font-bold"
                                onClick={handleAddAssignmentLocal}
                                disabled={loading || !musicianId}
                            >
                                {loading ? "Adicionando..." : "Confirmar Escala"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation (Clean) */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Excluir Agendamento</DialogTitle>
                        <DialogDescription>
                            Deseja realmente remover o evento "{selectedEvent?.title}"? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteEventLocal}
                            disabled={loading}
                        >
                            {loading ? "Excluindo..." : "Confirmar Exclusão"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
