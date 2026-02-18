'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    ArrowLeft,
    Music,
    Eye,
    Code,
    Save,
    Wand2,
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TONALIDADES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Regex robusto para detecção de acordes (Mantido da versão anterior)
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)\b/g

export default function NewChordPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [tonality, setTonality] = useState('C')
    const [lyrics, setLyrics] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('Usuário não autenticado')
            setLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('ministry_id')
            .eq('id', user.id)
            .single()

        if (!profile || !profile.ministry_id) {
            setError('Você precisa estar em um ministério para criar cifras')
            setLoading(false)
            return
        }

        const { error: insertError } = await supabase.from('chords').insert({
            ministry_id: profile.ministry_id,
            created_by: user.id,
            title,
            artist,
            original_tonality: tonality,
            lyrics_chords: lyrics,
        })

        if (insertError) {
            setError('Erro ao salvar: ' + insertError.message)
            setLoading(false)
            return
        }

        router.push('/chords')
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
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Adicionar Nova Cifra</h1>
                    <p className="text-sm text-muted-foreground">Preencha os dados e cole a cifra abaixo.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/chords">Cancelar</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (<Wand2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4" />)}
                        Salvar Cifra
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg border border-destructive/20 mb-6">
                    {error}
                </div>
            )}

            <div className="grid gap-6">
                <Card className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título da Música</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Lindo és"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="artist">Artista</Label>
                            <Input
                                id="artist"
                                placeholder="Ex: Tempo de Semear"
                                value={artist}
                                onChange={e => setArtist(e.target.value)}
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

                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                    {/* Editor */}
                    <Card className="flex flex-col overflow-hidden border-2 focus-within:border-primary/50 transition-colors">
                        <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <Code className="w-4 h-4" /> Editor
                            </span>
                            <Badge variant="outline" className="text-[10px]">Markdown Support</Badge>
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
    )
}
