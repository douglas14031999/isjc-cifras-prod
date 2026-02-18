'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen, MoreHorizontal, Calendar, Music, Trash2, ExternalLink, Copy, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface RepertoireClientProps {
    repertoires: any[]
    userProfile: any
}

export default function RepertoireClient({ repertoires, userProfile }: RepertoireClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCloningId, setIsCloningId] = useState<string | null>(null)
    const [editingRepertoire, setEditingRepertoire] = useState<any>(null)

    // Form states
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [eventDate, setEventDate] = useState('')

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setEventDate('')
        setEditingRepertoire(null)
    }

    const handleOpenEdit = (repertoire: any) => {
        setEditingRepertoire(repertoire)
        setTitle(repertoire.title)
        setDescription(repertoire.description || '')
        // Format ISO date to YYYY-MM-DD for input type="date"
        if (repertoire.event_date) {
            const date = new Date(repertoire.event_date)
            setEventDate(date.toISOString().split('T')[0])
        } else {
            setEventDate('')
        }
        setIsCreateOpen(true)
    }

    const handleClone = async (repertoire: any) => {
        setIsCloningId(repertoire.id)
        try {
            // 1. Create new repertoire
            const { data: newRep, error: repError } = await supabase
                .from('repertoires')
                .insert({
                    title: `${repertoire.title} (Cópia)`,
                    description: repertoire.description,
                    event_date: repertoire.event_date || null,
                    ministry_id: repertoire.ministry_id,
                    created_by: userProfile.id
                })
                .select()
                .single()

            if (repError) throw repError

            // 2. Fetch source songs
            const { data: sourceChords, error: fetchError } = await supabase
                .from('repertoire_chords')
                .select('*')
                .eq('repertoire_id', repertoire.id)

            if (fetchError) throw fetchError

            // 3. Copy songs if any
            if (sourceChords && sourceChords.length > 0) {
                const newChords = sourceChords.map(sc => ({
                    repertoire_id: newRep.id,
                    chord_id: sc.chord_id,
                    order_index: sc.order_index,
                    target_key: sc.target_key
                }))

                const { error: insertError } = await supabase
                    .from('repertoire_chords')
                    .insert(newChords)

                if (insertError) throw insertError
            }

            toast({ title: "Sucesso!", description: "Repertório clonado com sucesso." })
            router.refresh()
        } catch (error: any) {
            console.error('Error cloning repertoire:', error)
            toast({ title: "Erro", description: error.message, variant: "destructive" })
        } finally {
            setIsCloningId(null)
        }
    }

    const handleSaveRepertoire = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return

        setIsLoading(true)
        try {
            const repertoireData = {
                title,
                description,
                event_date: eventDate ? new Date(eventDate).toISOString() : null,
                updated_at: new Date().toISOString()
            }

            if (editingRepertoire) {
                // UPDATE
                const { error } = await supabase
                    .from('repertoires')
                    .update(repertoireData)
                    .eq('id', editingRepertoire.id)

                if (error) throw error
                toast({ title: "Sucesso!", description: "Repertório atualizado." })
            } else {
                // CREATE
                const { error } = await supabase
                    .from('repertoires')
                    .insert({
                        ...repertoireData,
                        ministry_id: userProfile.ministry_id,
                        created_by: userProfile.id
                    })

                if (error) throw error
                toast({ title: "Sucesso!", description: "Repertório criado." })
            }

            setIsCreateOpen(false)
            resetForm()
            router.refresh()
        } catch (error: any) {
            console.error('Error saving repertoire:', error)
            toast({ title: "Erro", description: "Certifique-se que a coluna 'event_date' aceita valores nulos no banco de dados.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Repertórios</h1>
                    <p className="text-muted-foreground mt-1">
                        Organize suas listas de músicas para cultos e eventos.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Repertório
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSaveRepertoire}>
                            <DialogHeader>
                                <DialogTitle>{editingRepertoire ? 'Editar Repertório' : 'Criar Novo Repertório'}</DialogTitle>
                                <DialogDescription>
                                    Prepare a lista de músicas para um culto ou evento específico.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="title" className="text-sm font-medium">Título</label>
                                    <Input
                                        id="title"
                                        placeholder="Ex: Culto de Domingo"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="date" className="text-sm font-medium">Data do Evento (Opcional)</label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="description" className="text-sm font-medium">Descrição (Opcional)</label>
                                    <Textarea
                                        id="description"
                                        placeholder="Observações sobre o repertório..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Salvando..." : (editingRepertoire ? "Salvar Alterações" : "Criar Repertório")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State / Placeholder */}
            {repertoires.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader className="text-center pb-10 pt-10">
                        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <FolderOpen className="h-6 w-6 text-zinc-500" />
                        </div>
                        <CardTitle className="text-xl">Nenhum repertório criado</CardTitle>
                        <CardDescription>
                            Crie seu primeiro repertório para organizar as músicas do próximo culto.
                        </CardDescription>
                        <div className="mt-6">
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Repertório
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {repertoires.map((repertoire) => (
                        <Card
                            key={repertoire.id}
                            className="hover:border-blue-500/50 transition-colors group relative cursor-pointer"
                            onClick={() => router.push(`/repertoires/${repertoire.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <Badge variant="secondary" className="font-normal">
                                        {repertoire.chords_count?.[0]?.count || 0} músicas
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 line-clamp-1">{repertoire.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {repertoire.description || 'Sem descrição.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Data</span>
                                        <span className="text-sm font-medium">
                                            {repertoire.event_date
                                                ? new Date(repertoire.event_date).toLocaleDateString('pt-BR')
                                                : 'Sem data'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenEdit(repertoire)
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleClone(repertoire)
                                            }}
                                            disabled={isCloningId === repertoire.id}
                                        >
                                            <Copy className={`w-4 h-4 ${isCloningId === repertoire.id ? 'animate-pulse' : ''}`} />
                                            <span className="sr-only">Clonar</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="group-hover:bg-blue-50 group-hover:text-blue-600 ml-1 px-3"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/repertoires/${repertoire.id}`)
                                            }}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
