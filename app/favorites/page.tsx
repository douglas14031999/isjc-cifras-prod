import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Music, ArrowRight } from 'lucide-react'
import { FavoriteButton } from '@/components/chords/favorite-button'
import { SearchInput } from '@/components/chords/search-input'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const supabase = await createClient()

    // 1. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // 2. Buscar favoritos com join e filtro de busca
    let favoritesQuery = supabase
        .from('favorites')
        .select('chord_id, chords (*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (query) {
        // Filtrar na tabela chords através da relação
        favoritesQuery = favoritesQuery.or(`title.ilike.%${query}%,artist.ilike.%${query}%`, { foreignTable: 'chords' })
    }

    const { data: favorites } = await favoritesQuery

    const favoriteChords = favorites?.map((f: any) => f.chords).filter(Boolean) || []

    return (
        <div className="max-w-5xl space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Favoritos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        Sua seleção pessoal de cifras para acesso rápido durante o louvor e ensaios do ministério.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl border border-blue-200/50 dark:border-blue-500/20 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {favoriteChords.length} {favoriteChords.length === 1 ? 'música' : 'músicas'}
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-2xl">
                <SearchInput defaultValue={query} />
            </div>

            {/* List Content */}
            {favoriteChords.length === 0 ? (
                <div className="flex flex-col items-start justify-center py-20 px-10 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-left">
                    <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10">
                        <Star className="w-8 h-8 text-blue-500/30" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                        {query ? 'Nenhum favorito encontrado' : 'Lista vazia por enquanto'}
                    </h3>
                    <p className="text-zinc-500 max-w-xs mb-8 text-sm font-medium leading-relaxed">
                        {query
                            ? `Não encontramos resultados para "${query}" nos seus favoritos.`
                            : 'Explore o catálogo e adicione suas canções preferidas aqui para facilitar o acesso.'
                        }
                    </p>
                    <Button asChild className="rounded-2xl h-12 px-8 font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20">
                        <Link href={query ? "/favorites" : "/chords"}>
                            {query ? 'Limpar Busca' : 'Explorar Músicas'}
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {favoriteChords.map((chord: any) => (
                        <ListItem key={chord.id} chord={chord} userId={user.id} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ListItem({ chord, userId }: { chord: any, userId: string }) {
    return (
        <div className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <Link
                href={`/chords/${chord.id}`}
                className="absolute inset-0 z-0"
            />

            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-700 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 shrink-0">
                <Music className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {chord.title}
                </h4>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider opacity-70 mt-0.5">
                    {chord.artist}
                </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative z-10">
                <Badge variant="outline" className="hidden sm:inline-flex font-black text-[10px] bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 px-2 py-0 h-6">
                    {chord.original_tonality}
                </Badge>
                <FavoriteButton chordId={chord.id} isFavorite={true} userId={userId} />
                <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    )
}
