import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RepertoireDetailsClient from './repertoire-details-client'

interface RepertoirePageProps {
    params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function RepertoirePage({ params }: RepertoirePageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Pegar o perfil do usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    // 2. Buscar detalhes do repertório, músicas inclusas e catálogo total em paralelo
    const [repertoireResponse, chordsResponse, allChordsResponse] = await Promise.all([
        supabase
            .from('repertoires')
            .select(`
                *,
                profiles:created_by (name)
            `)
            .eq('id', id)
            .eq('ministry_id', profile?.ministry_id)
            .single(),
        supabase
            .from('repertoire_chords')
            .select(`
                *,
                chords (*)
            `)
            .eq('repertoire_id', id)
            .order('order_index', { ascending: true }),
        supabase
            .from('chords')
            .select('*')
            .order('title', { ascending: true })
    ])

    const { data: repertoire, error: repError } = repertoireResponse
    const { data: repertoireChords } = chordsResponse
    const { data: allChords } = allChordsResponse

    if (repError || !repertoire) {
        return notFound()
    }

    return (
        <RepertoireDetailsClient
            repertoire={repertoire}
            initialChords={repertoireChords?.map(rc => ({
                ...rc.chords,
                order_index: rc.order_index,
                repertoire_chord_id: rc.id,
                target_key: rc.target_key
            })) || []}
            allChords={allChords || []}
            userProfile={profile}
        />
    )
}
