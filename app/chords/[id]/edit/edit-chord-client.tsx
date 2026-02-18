'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    ArrowLeft,
    Music,
    Save,
    LogOut,
    Plus,
    Search,
    LayoutGrid,
    List,
    Clock,
    Code,
    Eye,
    Wand2
} from 'lucide-react'
import type { Chord } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

// Regex robusto para detecção de acordes
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)\b/g

const TONALIDADES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

interface EditChordClientProps {
    chord: Chord
}

export default function EditChordClient({ chord }: EditChordClientProps) {
    const router = useRouter()
    const [title, setTitle] = useState(chord.title)
    const [artist, setArtist] = useState(chord.artist)
    const [tonality, setTonality] = useState(chord.original_tonality)
    const [lyrics, setLyrics] = useState(chord.lyrics_chords)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()

        const { error: updateError } = await supabase
            .from('chords')
            .update({
                title,
                artist,
                original_tonality: tonality,
                lyrics_chords: lyrics,
            })
            .eq('id', chord.id)

        if (updateError) {
            setError('Erro ao atualizar cifra: ' + updateError.message)
            setLoading(false)
            return
        }

        router.push(`/chords/${chord.id}`)
        router.refresh()
    }

    const renderLine = (line: string, i: number) => {
        if (!line.trim()) return <div key={i} className="h-6" />

        const parts = line.split(CHORD_REGEX)
        const matches = line.match(CHORD_REGEX)

        if (!matches) return <div key={i} className="text-zinc-600 dark:text-zinc-400 font-sans">{line}</div>

        return (
            <div key={i} className="leading-8">
                {parts.map((part, index) => {
                    if (matches.includes(part)) {
                        return (
                            <span key={index} className="inline-block font-bold text-blue-600 dark:text-blue-400 mr-1">
                                {part}
                            </span>
                        )
                    }
                    return <span key={index} className="text-zinc-800 dark:text-zinc-200">{part}</span>
                })}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* TOOLBAR ACTIONS */}
            <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-8 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Link href={`/chords/${chord.id}`}>
                                <ArrowLeft className="w-5 h-5 text-zinc-500" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">Editar Música</h1>
                            <p className="text-xs text-zinc-500 font-medium">Visualização em tempo real</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            asChild
                            className="rounded-xl text-zinc-500 hover:text-zinc-700 h-10 px-4"
                        >
                            <Link href={`/chords/${chord.id}`}>Cancelar</Link>
                        </Button>
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={loading}
                            className="rounded-xl"
                        >
                            {loading ? (
                                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full">
                {error && (
                    <div className="mb-8 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl font-medium animate-in slide-in-from-top duration-500">
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Metadata Card */}
                    <Card className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título da Música</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="artist">Artista</Label>
                                <Input
                                    id="artist"
                                    value={artist}
                                    onChange={e => setArtist(e.target.value)}
                                    className="font-semibold"
                                />
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <Label>Tom Original</Label>
                            <div className="flex flex-wrap gap-2">
                                {TONALIDADES.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTonality(t)}
                                        className={`
                                            w-10 h-10 rounded-md text-sm font-medium transition-all
                                            ${tonality === t
                                                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                                        `}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Editor Split View */}
                    <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                        {/* Editor */}
                        <Card className="flex flex-col overflow-hidden border-2 focus-within:border-primary/50 transition-colors">
                            <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Code className="w-4 h-4" /> Conteúdo
                                </span>
                                <Badge variant="outline" className="text-[10px]">Editor</Badge>
                            </div>
                            <textarea
                                className="flex-1 w-full resize-none p-4 font-mono text-sm focus:outline-none bg-background leading-relaxed"
                                placeholder="Cole a cifra aqui..."
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                            />
                        </Card>

                        {/* Preview */}
                        <Card className="flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Visualização
                                </span>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                                {lyrics ? (
                                    lyrics.split('\n').map((line, i) => renderLine(line, i))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <Music className="w-12 h-12 mb-2" />
                                        <p>A visualização aparecerá aqui</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
