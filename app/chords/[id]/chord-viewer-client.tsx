'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { transposeLyrics, getSemitonesBetween, convertLyricsToDegrees, transposeChord } from '@/lib/transpose'
import type { ChordWithFavorite } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    ArrowLeft,
    Minus,
    Plus,
    RotateCcw,
    Edit,
    Trash2,
    Star,
    Music,
    Maximize2,
    Columns2,
    Printer,
    Download,
    Share2,
    Play,
    Pause,
    ChevronUp,
    ChevronDown,
    ArrowUp,
    Music2
} from 'lucide-react'

// Regex robusto para detecção de acordes e graus (priorizando os mais longos)
const CHORD_REGEX = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)(?![A-Za-z])/g
const DEGREE_REGEX = /(?<![A-Za-z])((?:b?III|b?II|b?VII|b?VI|#?IV|IV|b?V|V|I)(?:m|maj|M|dim|aug|sus|add|°)*[0-9]*[0-9]*(?:\/(?:b?III|b?II|b?VII|b?VI|#?IV|IV|b?V|V|I))?)(?![A-Za-z])/g

interface ChordViewerClientProps {
    chord: ChordWithFavorite
    isFavorite: boolean
    isOwner: boolean
    userId: string
    initialKey?: string
}

export default function ChordViewerClient({
    chord,
    isFavorite: initialIsFavorite,
    isOwner,
    userId,
    initialKey
}: ChordViewerClientProps) {
    const router = useRouter()

    // Calcular transposição inicial se um tom de repertório for fornecido
    const initialTranspose = initialKey
        ? getSemitonesBetween(chord.original_tonality, initialKey)
        : 0

    const [transpose, setTranspose] = useState(initialTranspose)
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [loading, setLoading] = useState(false)
    const [fontSize, setFontSize] = useState(16)
    const [columns, setColumns] = useState(1)
    const [isMounted, setIsMounted] = useState(false)
    const [isScrolling, setIsScrolling] = useState(false)
    const [scrollSpeed, setScrollSpeed] = useState(2) // 1-10
    const [viewMode, setViewMode] = useState<'chords' | 'degrees'>('chords')
    const [showBackToTop, setShowBackToTop] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsMounted(true)

        const getScrollContainer = () => {
            if (!containerRef.current) return document.querySelector('main') || window;
            let parent = containerRef.current.parentElement;
            while (parent) {
                const overflow = window.getComputedStyle(parent).overflowY;
                if (overflow === 'auto' || overflow === 'scroll') return parent;
                parent = parent.parentElement;
            }
            return document.querySelector('main') || window;
        };

        const scrollContainer = getScrollContainer();

        const handleScroll = () => {
            const scrollTop = scrollContainer instanceof Window
                ? window.scrollY
                : (scrollContainer as HTMLElement).scrollTop
            setShowBackToTop(scrollTop > 100)
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (!isScrolling) return

        let frameId: number
        let lastTime = performance.now()

        const getScrollContainer = () => {
            if (!containerRef.current) return document.querySelector('main');
            let parent = containerRef.current.parentElement;
            while (parent) {
                const overflow = window.getComputedStyle(parent).overflowY;
                if (overflow === 'auto' || overflow === 'scroll') return parent;
                parent = parent.parentElement;
            }
            return document.querySelector('main');
        };

        const scrollContainer = getScrollContainer() as HTMLElement;
        if (!scrollContainer) return

        const scroll = (currentTime: number) => {
            const deltaTime = currentTime - lastTime
            lastTime = currentTime

            // 15 pixels por segundo por nível (ex: Nível 1 = 15px/s, Nível 2 = 30px/s)
            // 15px/s @ 60fps = 0.25 pixels por frame
            const step = (scrollSpeed * 0.25) * (deltaTime / 16.67)
            scrollContainer.scrollTop += step

            frameId = requestAnimationFrame(scroll)
        }

        frameId = requestAnimationFrame(scroll)
        return () => cancelAnimationFrame(frameId)
    }, [isScrolling, scrollSpeed])

    const currentKey = useMemo(() => transposeChord(chord.original_tonality, transpose), [chord.original_tonality, transpose])

    const transposedLyrics = useMemo(() => {
        const lyrics = transposeLyrics(chord.lyrics_chords, transpose)
        if (viewMode === 'degrees') {
            return convertLyricsToDegrees(lyrics, currentKey)
        }
        return lyrics
    }, [chord.lyrics_chords, transpose, viewMode, currentKey])

    const handleTranspose = (amount: number) => {
        setTranspose(prev => prev + amount)
    }

    const toggleFavorite = async () => {
        setLoading(true)
        const supabase = createClient()

        if (isFavorite) {
            await supabase.from('favorites').delete().eq('user_id', userId).eq('chord_id', chord.id)
        } else {
            await supabase.from('favorites').insert({ user_id: userId, chord_id: chord.id })
        }

        setIsFavorite(!isFavorite)
        setLoading(false)
        router.refresh()
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta cifra?')) return

        const supabase = createClient()
        await supabase.from('chords').delete().eq('id', chord.id)
        router.push('/dashboard')
        router.refresh()
    }

    const handlePrint = () => {
        window.print()
    }

    const getDegreeStyle = (deg: string) => {
        const baseMatch = deg.match(/^(?:b|#)?(III|II|VII|VI|IV|V|I)/)
        const base = baseMatch ? baseMatch[1] : ''

        if (base === 'I' || base === 'VI') return 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-900/30'
        if (base === 'II' || base === 'IV') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-900/30'
        if (base === 'III' || base === 'V') return 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-900/30'
        if (base === 'VII') return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700'

        return 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50'
    }

    const renderLine = (line: string, i: number) => {
        if (!line.trim()) return <div key={i} className="h-6" />

        const currentRegex = viewMode === 'degrees' ? DEGREE_REGEX : CHORD_REGEX
        const parts = line.split(currentRegex)
        const matches = line.match(currentRegex)

        if (!matches) return <div key={i} className="text-zinc-800 dark:text-zinc-300 print:text-[#111] print:font-medium">{line}</div>

        return (
            <div key={i} className="leading-relaxed">
                {parts.map((part, index) => {
                    if (matches.includes(part)) {
                        const style = viewMode === 'degrees' ? getDegreeStyle(part) : 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50'

                        return (
                            <span key={index} className={cn(
                                "inline-block font-black border rounded px-1.5 mx-0.5 transition-colors print:bg-transparent print:px-0 print:mx-0 print:text-black print:font-bold",
                                style
                            )}>
                                {part}
                            </span>
                        )
                    }
                    return <span key={index} className="text-zinc-800 dark:text-zinc-300 print:text-[#111] print:font-medium">{part}</span>
                })}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* MAIN CONTENT AREA */}
                <main className="flex-1 lg:mr-64 print:mr-0 print:h-auto print:overflow-visible relative lg:bg-zinc-50/10 dark:lg:bg-zinc-950/10">
                    <div className="max-w-[210mm] mx-auto print:max-w-none print:p-0 print:m-0 print-container lg:my-10 lg:shadow-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-none print:shadow-none print:border-none print:bg-transparent min-h-screen lg:min-h-0">

                        {/* Desktop & Mobile Header (Standardized) */}
                        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-4 print:hidden">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <Link href="/chords">
                                        <ArrowLeft className="w-5 h-5 text-zinc-500" />
                                    </Link>
                                </Button>
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tighter leading-none">
                                        {chord.title}
                                    </h1>
                                    <p className="text-[10px] md:text-xs font-bold text-zinc-500 truncate uppercase tracking-[0.2em] mt-1.5 opacity-70">
                                        {chord.artist}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="hidden sm:inline-flex font-black text-[10px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 px-3 py-1 h-8 rounded-lg uppercase tracking-wider">
                                    {chord.original_tonality}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={toggleFavorite}
                                    className={cn(
                                        "rounded-xl h-10 w-10 transition-all duration-300",
                                        isFavorite ? "text-amber-500 border-amber-200 bg-amber-50 shadow-md shadow-amber-500/10" : "text-zinc-400 border-zinc-200 shadow-none"
                                    )}
                                >
                                    <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
                                </Button>
                            </div>
                        </div>

                        {/* Print Header (Cifra Club Style) */}
                        <div className="hidden print:block border-b mb-8 pb-4 p-8">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-6 mb-6">
                                        <img src="/logo_print.svg" alt="Logo ISJC" className="w-24 h-24 object-contain print:inline-block" style={{ display: 'block' }} />
                                        <div>
                                            <h1 className="text-4xl font-black text-black tracking-tighter leading-[0.8] mb-2">{chord.title}</h1>
                                            <p className="text-lg text-zinc-600 font-bold uppercase tracking-tight">{chord.artist}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="border border-zinc-200 rounded px-4 py-2 text-center min-w-[80px]">
                                        <span className="block text-[8pt] text-zinc-400 uppercase font-bold">Tom</span>
                                        <span className="text-lg font-bold text-black">{transposeLyrics(chord.original_tonality, transpose)}</span>
                                    </div>
                                    <div className="border border-zinc-200 rounded px-4 py-2 text-center min-w-[80px]">
                                        <span className="block text-[8pt] text-zinc-400 uppercase font-bold">Exibição</span>
                                        <span className="text-lg font-bold text-black">{viewMode === 'degrees' ? 'Graus' : 'Acordes'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHORD DISPLAY */}
                        <div
                            className={cn(
                                "p-8 md:p-12 font-mono whitespace-pre-wrap transition-all duration-300",
                                columns === 2 ? 'md:columns-2 md:gap-12 md:divide-x md:divide-zinc-100 dark:divide-zinc-800 print:columns-2' : 'print:columns-1',
                                "print:p-0 print:bg-white"
                            )}
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            {transposedLyrics.split('\n').map((line, i) => (
                                <div key={i} className="min-h-[1.2em] print:break-inside-avoid-page print:mb-0.5">
                                    {renderLine(line, i)}
                                </div>
                            ))}
                        </div>

                        {/* Print Footer */}
                        <div className="hidden print:block fixed bottom-0 left-0 right-0 py-4 border-t border-zinc-200 bg-white px-8">
                            <div className="flex justify-between items-center text-[10px] font-medium text-zinc-400">
                                <div>{isMounted ? `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Aguarde...'}</div>
                                <div className="flex items-center gap-1 uppercase tracking-widest font-bold text-zinc-300"><Music className="w-3 h-3" /> isjc-cifras.app.br</div>
                                <div className="print-page-counter">Página </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* SIDEBAR (Desktop - Standard Right Sidebar) */}
                <aside className="hidden lg:flex flex-col w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shrink-0 print:hidden fixed top-0 right-0 h-screen">
                    <div className="space-y-8">
                        {/* Tools Section */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Tom & Transposição</h4>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 justify-between shadow-sm">
                                    <Button variant="ghost" size="icon" onClick={() => handleTranspose(-1)} className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800">
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[11px] font-black leading-none">{transposeLyrics(chord.original_tonality, transpose)}</span>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">{transpose > 0 ? `+${transpose}` : transpose}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleTranspose(1)} className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Exibição</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode(viewMode === 'chords' ? 'degrees' : 'chords')}
                                        className={cn(
                                            "h-11 justify-start rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all px-4 border border-transparent",
                                            viewMode === 'degrees' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-500 hover:bg-zinc-50 hover:border-zinc-100"
                                        )}
                                    >
                                        <Music2 className="w-4 h-4 mr-3" /> {viewMode === 'degrees' ? 'Graus Ativos' : 'Notas Ativas'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setColumns(columns === 1 ? 2 : 1)}
                                        className={cn(
                                            "h-11 justify-start rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all px-4 border border-transparent",
                                            columns === 2 ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:border-zinc-100"
                                        )}
                                    >
                                        <Columns2 className="w-4 h-4 mr-3" /> {columns === 2 ? 'Modo: 2 Colunas' : 'Modo: 1 Coluna'}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Tamanho da Fonte</h4>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 gap-1 shadow-sm">
                                    <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"><Minus className="w-4 h-4" /></button>
                                    <span className="flex-1 text-center font-black text-xs">{fontSize}</span>
                                    <button onClick={() => setFontSize(Math.min(32, fontSize + 1))} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Auto Scroll</h4>
                                    {isScrolling && (
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 animate-pulse tracking-widest">ON</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsScrolling(!isScrolling)}
                                        className={cn(
                                            "h-9 w-9 rounded-lg transition-all",
                                            isScrolling ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-blue-600'
                                        )}
                                    >
                                        {isScrolling ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                    <div className="flex flex-1 items-center justify-between px-3">
                                        <button onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))} className="p-1 text-zinc-400 hover:text-zinc-600"><ChevronDown className="w-4 h-4" /></button>
                                        <span className="text-xs font-black">{scrollSpeed}</span>
                                        <button onClick={() => setScrollSpeed(Math.min(10, scrollSpeed + 1))} className="p-1 text-zinc-400 hover:text-zinc-600"><ChevronUp className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="pt-8 mt-auto border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="w-full h-11 justify-start rounded-xl font-bold text-zinc-500 hover:bg-zinc-50 hover:border-zinc-200 text-[11px] uppercase tracking-wider px-4 transition-all"
                            >
                                <Printer className="w-4 h-4 mr-3" /> Imprimir Cifra (PDF)
                            </Button>
                            {isOwner && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button asChild variant="secondary" className="rounded-xl h-10 px-2 font-bold text-[10px] tracking-tight">
                                        <Link href={`/chords/${chord.id}/edit`}>
                                            <Edit className="w-3.5 h-3.5 mr-2" /> EDITAR
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" onClick={handleDelete} className="rounded-xl h-10 px-2 font-bold text-[10px] tracking-tight text-red-500 hover:bg-red-50">
                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> DELETE
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Control Bar (Hidden on Large Desktop) */}
            <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-4 flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 print:hidden gap-2">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleTranspose(-1)} className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                        <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex flex-col items-center min-w-[2.5rem]">
                        <span className="text-[8px] font-black text-zinc-400 uppercase">TOM</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none">
                            {transposeLyrics(chord.original_tonality, transpose)}
                        </span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleTranspose(1)} className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

                <div className="flex items-center gap-2">
                    <Button
                        variant={isScrolling ? "default" : "outline"}
                        size="icon"
                        onClick={() => setIsScrolling(!isScrolling)}
                        className={cn("h-10 w-10 rounded-2xl transition-all", isScrolling && "bg-blue-600 shadow-lg shadow-blue-500/20")}
                    >
                        {isScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'chords' ? 'degrees' : 'chords')}
                        className={cn("h-10 w-10 rounded-2xl transition-all", viewMode === 'degrees' && "bg-indigo-600 text-white")}
                    >
                        <Music2 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setFontSize(fontSize === 16 ? 20 : 16)}
                        className="h-10 w-10 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Floating Back to Top */}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                    setIsScrolling(false);
                    const mainElement = document.querySelector('main');
                    if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={cn(
                    "fixed bottom-24 right-6 lg:bottom-10 lg:right-10 h-14 w-14 rounded-full shadow-2xl border-2 border-white dark:border-zinc-800 z-40 bg-blue-600 text-white transition-all duration-500 hover:scale-110 active:scale-95 flex flex-col items-center justify-center gap-0.5 print:hidden",
                    showBackToTop ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
                )}
            >
                <ArrowUp className="w-5 h-5 stroke-[3px]" />
                <span className="text-[10px] font-black leading-none">TOPO</span>
            </Button>

            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: A4; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { background: white !important; color: black !important; counter-reset: page; width: 100% !important; }
                    .print-container { width: 210mm !important; margin: 0 auto !important; background: white !important; position: relative !important; }
                    .print-hidden, [data-sidebar], header, nav, aside, .lg\\:fixed, .md\\:sticky, .sticky, button:not([onClick*="window.print"]) { display: none !important; }
                    .shadow-xl, .shadow-sm, .shadow-none, .border-zinc-200, .bg-zinc-50, .dark\\:bg-zinc-900 { box-shadow: none !important; border: none !important; background: white !important; }
                    main { display: block !important; overflow: visible !important; height: auto !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    .print\\:columns-2 { column-count: 2 !important; column-gap: 50px !important; column-rule: 1px solid #f0f0f0 !important; display: block !important; column-fill: auto !important; }
                    .print\\:columns-1 { column-count: 1 !important; display: block !important; column-fill: auto !important; }
                    .font-mono { font-size: ${fontSize}px !important; line-height: 1.5 !important; }
                    .font-mono div, .font-mono span { font-size: inherit !important; }
                    .print\\:columns-2 div, .print\\:columns-1 div { break-inside: avoid-page !important; }
                    .print-page-counter::after { content: counter(page); }
                    .print-page-counter { counter-increment: page; }
                }
            `}</style>
        </div>
    )
}
