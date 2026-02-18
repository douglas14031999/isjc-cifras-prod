import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChordViewerClient from './chord-viewer-client'

export default async function ChordPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ repertoire_chord_id?: string }>
}) {
    const { id } = await params
    const { repertoire_chord_id } = await searchParams
    const supabase = await createClient()

    // 1. Verificar autenticação e buscar dados em paralelo
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // 2. Buscar cifra, tom do repertório e favorito simultaneamente para evitar a cascata de "awaits" (waterfall)
    const [
        { data: chord, error: chordError },
        { data: repChord },
        { data: favorite }
    ] = await Promise.all([
        supabase.from('chords').select('*').eq('id', id).single(),
        repertoire_chord_id
            ? supabase.from('repertoire_chords').select('target_key').eq('id', repertoire_chord_id).single()
            : Promise.resolve({ data: null }),
        supabase.from('favorites').select('*').eq('user_id', user.id).eq('chord_id', id).single()
    ])

    if (chordError || !chord) {
        notFound()
    }

    const initialKey = repChord?.target_key || chord.original_tonality
    const isFavorite = !!favorite
    const isOwner = chord.created_by === user.id

    return (
        <ChordViewerClient
            chord={chord}
            isFavorite={isFavorite}
            isOwner={isOwner}
            userId={user.id}
            initialKey={initialKey}
        />
    )
}
