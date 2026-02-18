import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, MoreHorizontal, FileText, Music, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/components/chords/favorite-button'
import { SearchInput } from '@/components/chords/search-input'

export const dynamic = 'force-dynamic'

export default async function ChordsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const supabase = await createClient()

    // Pegar usuário atual
    const { data: { user } } = await supabase.auth.getUser()

    // Pegar perfil do usuário
    const { data: profile } = user ? await supabase
        .from('profiles')
        .select('is_admin, ministry_id')
        .eq('id', user.id)
        .single() : { data: null }

    // 4. Buscar cifras (com filtro opcional de busca) e favoritos em paralelo
    let chordsQuery = supabase
        .from('chords')
        .select(`
            *,
            profiles:created_by (name)
        `)
        .order('updated_at', { ascending: false })

    if (query) {
        // Busca insensível a maiúsculas no título ou artista
        chordsQuery = chordsQuery.or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    }

    const [chordsResponse, favoritesResponse] = await Promise.all([
        chordsQuery,
        user ? supabase.from('favorites').select('chord_id').eq('user_id', user.id) : { data: [] }
    ])

    if (chordsResponse.error) {
        console.error('Error fetching chords:', chordsResponse.error)
    }

    const chords = chordsResponse.data || []
    const favoriteIds = new Set(favoritesResponse.data?.map((f: any) => f.chord_id) || [])

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cifras</h1>
                    <p className="text-muted-foreground mt-1 text-balanced max-w-lg">
                        Explore todo o catálogo do ministério e adicione as suas favoritas.
                    </p>
                </div>
                <Button asChild className="shadow-lg shadow-blue-500/10">
                    <Link href="/chords/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Cifra
                    </Link>
                </Button>
            </div>

            {/* Helper Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl flex gap-3 items-start">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    <b>Dica:</b> Todas as músicas aqui são compartilhadas com a equipe. Suas seleções pessoais aparecem na aba <b>"Favoritos"</b> para acesso rápido.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2">
                <SearchInput defaultValue={query} />
            </div>

            {/* Data Table */}
            <div className="rounded-[2rem] border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="font-bold py-5">Título</TableHead>
                            <TableHead className="font-bold">Artista</TableHead>
                            <TableHead className="font-bold">Tom</TableHead>
                            <TableHead className="hidden md:table-cell font-bold">Atualizado</TableHead>
                            <TableHead className="hidden lg:table-cell font-bold">Colaborador</TableHead>
                            <TableHead className="text-right font-bold pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!chords || chords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Music className="w-8 h-8 opacity-20" />
                                        <p>Nenhuma cifra encontrada no repertório.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            chords.map((chord) => (
                                <TableRow key={chord.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors border-b">
                                    <TableCell className="pl-4">
                                        {user && (
                                            <FavoriteButton
                                                chordId={chord.id}
                                                isFavorite={favoriteIds.has(chord.id)}
                                                userId={user.id}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50 group-hover:scale-105 transition-transform">
                                                <Music className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            <Link href={`/chords/${chord.id}`} className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                {chord.title}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-600 dark:text-zinc-400 font-medium">
                                        {chord.artist}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-300 pointer-events-none">
                                            {chord.original_tonality}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                        {new Date(chord.updated_at || chord.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm italic">
                                        {chord.profiles?.name || 'Sistema'}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="icon" asChild className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/chords/${chord.id}`}>
                                                <FileText className="w-4 h-4 text-zinc-500" />
                                                <span className="sr-only">Ver</span>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-4 px-2">
                <div className="text-sm text-zinc-500 font-medium">
                    Mostrando <span className="text-zinc-900 dark:text-zinc-100 font-bold">{chords?.length || 0}</span> músicas disponíveis.
                </div>
            </div>
        </div>
    )
}
