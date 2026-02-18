import { createClient } from '@/lib/supabase/server'
import MusiciansClient from './musicians-client'

export const dynamic = 'force-dynamic'

export default async function MusiciansPage() {
    const supabase = await createClient()

    // Get current user profile for ministry_id
    const { data: { user } } = await supabase.auth.getUser()
    // Pegar o perfil do usuário logado
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    // Base query para músicos
    let musiciansQuery = supabase
        .from('profiles')
        .select(`
            *,
            ministries (name),
            chords_count:chords(count)
        `)
        .order('name', { ascending: true })

    if (!profile?.is_admin) {
        musiciansQuery = musiciansQuery.eq('ministry_id', profile?.ministry_id)
    }

    // Buscar músicos e detalhes do ministério em paralelo (após definir filtros)
    const [musiciansResponse, ministryResponse] = await Promise.all([
        musiciansQuery,
        supabase
            .from('ministries')
            .select('*')
            .eq('id', profile?.ministry_id)
            .single()
    ])

    const { data: profiles, error } = musiciansResponse
    const { data: ministry } = ministryResponse

    if (error) {
        console.error('Error fetching musicians:', error)
    }

    return <MusiciansClient
        musicians={profiles || []}
        ministry={ministry}
        userProfile={profile}
    />
}
