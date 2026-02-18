'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Music,
    Calendar,
    ArrowLeft,
    Plus,
    Search,
    Trash2,
    GripVertical,
    ExternalLink,
    Clock,
    User,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Musical notes for key selection
const ALL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']

interface RepertoireDetailsClientProps {
    repertoire: any
    initialChords: any[]
    allChords: any[]
    userProfile: any
}

export default function RepertoireDetailsClient({
    repertoire,
    initialChords,
    allChords,
    userProfile
}: RepertoireDetailsClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()
    const [chords, setChords] = useState(initialChords)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddingSong, setIsAddingSong] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedKeys, setSelectedKeys] = useState<Record<string, string>>({})
    const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'missing_column'>('checking')

    useEffect(() => {
        async function checkColumn() {
            try {
                // Tenta buscar um registro incluindo a coluna target_key
                const { error } = await supabase
                    .from('repertoire_chords')
                    .select('target_key')
                    .limit(1)

                if (error && (error.code === '42703' || error.message?.includes('target_key'))) {
                    setDbStatus('missing_column')
                } else {
                    setDbStatus('ok')
                }
            } catch (err) {
                setDbStatus('ok') // Assume ok em caso de erro genérico
            }
        }
        checkColumn()
    }, [supabase])

    const filteredAvailableChords = allChords.filter(chord => {
        const isAlreadyAdded = chords.some(c => c.id === chord.id)
        if (isAlreadyAdded) return false

        const search = searchQuery.toLowerCase()
        return chord.title.toLowerCase().includes(search) ||
            chord.artist.toLowerCase().includes(search)
    })

    const handleAddChord = async (chord: any) => {
        setIsLoading(true)
        const targetKey = selectedKeys[chord.id] || chord.original_tonality

        try {
            const nextOrder = chords.length > 0
                ? Math.max(...chords.map(c => c.order_index)) + 1
                : 0

            // Tentar inserir com target_key
            let { data, error } = await supabase
                .from('repertoire_chords')
                .insert({
                    repertoire_id: repertoire.id,
                    chord_id: chord.id,
                    order_index: nextOrder,
                    target_key: targetKey
                })
                .select(`
                    *,
                    chords (*)
                `)
                .single()

            // FALLBACK: Se falhar (provavelmente por falta da coluna target_key), tentar sem ela
            if (error && (error.code === '42703' || error.message?.includes('target_key'))) {
                console.warn('Fallback: target_key storage failed. The column might be missing.');

                toast({
                    title: "Aviso de Banco de Dados",
                    description: "A música foi adicionada, mas o TOM não pôde ser salvo por falta da coluna 'target_key' no seu Supabase. Execute o comando SQL enviado anteriormente.",
                    variant: "default",
                })

                const result = await supabase
                    .from('repertoire_chords')
                    .insert({
                        repertoire_id: repertoire.id,
                        chord_id: chord.id,
                        order_index: nextOrder
                    })
                    .select(`
                        *,
                        chords (*)
                    `)
                    .single()
                data = result.data
                error = result.error
            }

            if (error) throw error

            setChords([...chords, {
                ...data.chords,
                order_index: data.order_index,
                repertoire_chord_id: data.id,
                target_key: data.target_key
            }])

            toast({
                title: "Música adicionada",
                description: `${chord.title} foi adicionada ao repertório.`
            })
        } catch (error: any) {
            console.error('Error adding chord detail (RAW):', error)

            // Logar detalhes específicos para depuração (Supabase Errors são objetos especiais)
            const errorDetails = {
                message: error.message || error.error_description || 'No message',
                code: error.code || 'No code',
                details: error.details || 'No details',
                hint: error.hint || 'No hint',
                status: error.status || 'No status',
                name: error.name || 'No name'
            }
            console.error('DEBUG - Error details parsed:', errorDetails)
            console.error('DEBUG - Stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error)))

            // Se o erro for de coluna inexistente, avisar de forma mais clara
            const isMissingColumn = (error.message && error.message.includes('target_key')) ||
                error.code === '42703' ||
                (error.details && error.details.includes('target_key'))

            toast({
                title: "Erro ao adicionar",
                description: isMissingColumn
                    ? "A coluna 'target_key' não foi encontrada. Verifique se executou o comando SQL no Supabase."
                    : (error.message || "Erro de banco de dados. Verifique a console do navegador."),
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveChord = async (repertoireChordId: string, title: string) => {
        try {
            const { error } = await supabase
                .from('repertoire_chords')
                .delete()
                .eq('id', repertoireChordId)

            if (error) throw error

            setChords(chords.filter(c => c.repertoire_chord_id !== repertoireChordId))
            toast({
                title: "Música removida",
                description: `${title} foi removida do repertório.`
            })
        } catch (error: any) {
            console.error('Error removing chord:', error)
            toast({
                title: "Erro ao remover",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-8">
            {/* Database Warning Banner */}
            {dbStatus === 'missing_column' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900 dark:text-amber-100">Atualização do Banco de Dados Necessária</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            A funcionalidade de **escolha de tom** requer uma nova coluna no banco de dados.
                            Como não tenho permissão para alterar o esquema, você precisa fazer isso manualmente no painel do Supabase.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-zinc-50 border-amber-200 text-amber-900 shrink-0"
                        onClick={() => {
                            navigator.clipboard.writeText("ALTER TABLE public.repertoire_chords ADD COLUMN IF NOT EXISTS target_key TEXT;")
                            toast({
                                title: "Copiado!",
                                description: "Comando SQL copiado para a área de transferência."
                            })
                        }}
                    >
                        Copiar SQL para o Supabase
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="sm" className="w-fit" asChild>
                    <Link href="/repertoires">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Voltar para Repertórios
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{repertoire.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(repertoire.event_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <User className="w-4 h-4" />
                                <span>Criado por {repertoire.profiles?.name || 'Sistema'}</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                {chords.length} músicas
                            </Badge>
                        </div>
                    </div>

                    <Button onClick={() => setIsAddingSong(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Música
                    </Button>
                </div>

                {repertoire.description && (
                    <p className="text-muted-foreground max-w-3xl">
                        {repertoire.description}
                    </p>
                ) || (
                        <p className="text-muted-foreground italic">Sem descrição.</p>
                    )}
            </div>

            <Separator />

            {/* Chords List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Music className="w-5 h-5 text-blue-500" />
                        Ordem das Músicas
                    </h2>
                </div>

                {chords.length === 0 ? (
                    <Card className="border-dashed py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-zinc-400" />
                            </div>
                            <CardTitle className="text-lg">Nenhuma música selecionada</CardTitle>
                            <CardDescription className="mt-2">
                                Adicione as músicas para compor este repertório.
                            </CardDescription>
                            <Button variant="outline" className="mt-6" onClick={() => setIsAddingSong(true)}>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar Músicas
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {chords.map((chord, index) => (
                            <div
                                key={chord.repertoire_chord_id}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border rounded-xl hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-500">
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{chord.title}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{chord.artist}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono bg-blue-50/50 border-blue-200 text-blue-700">
                                        {chord.target_key || chord.original_tonality}
                                    </Badge>

                                    <Separator orientation="vertical" className="h-6" />

                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/chords/${chord.id}?repertoire_chord_id=${chord.repertoire_chord_id}`}>
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="sr-only">Ver Cifra</span>
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleRemoveChord(chord.repertoire_chord_id, chord.title)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="sr-only">Remover</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Song Dialog */}
            <Dialog open={isAddingSong} onOpenChange={setIsAddingSong}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Adicionar Música ao Repertório</DialogTitle>
                        <DialogDescription>
                            Busque em sua biblioteca de cifras.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por título ou artista..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-2">
                            {filteredAvailableChords.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? "Nenhuma música encontrada." : "Comece a digitar para buscar."}
                                </div>
                            ) : (
                                filteredAvailableChords.map(chord => (
                                    <div
                                        key={chord.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-blue-500/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                                                <Music className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{chord.title}</div>
                                                <div className="text-xs text-muted-foreground">{chord.artist} (Original: {chord.original_tonality})</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={selectedKeys[chord.id] || chord.original_tonality}
                                                onValueChange={(val) => setSelectedKeys(prev => ({ ...prev, [chord.id]: val }))}
                                            >
                                                <SelectTrigger className="w-[80px] h-8 text-xs">
                                                    <SelectValue placeholder="Tom" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_KEYS.map(key => (
                                                        <SelectItem key={key} value={key} className="text-xs">{key}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="group-hover:bg-blue-600 group-hover:text-white"
                                                onClick={() => handleAddChord(chord)}
                                                disabled={isLoading}
                                            >
                                                Adicionar
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 border-t mt-auto">
                        <Button variant="outline" onClick={() => setIsAddingSong(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
