import { createClient } from '@/lib/supabase/server'
import RepertoireClient from './repertoire-client'

export const dynamic = 'force-dynamic'

export default async function RepertoiresPage() {
    const supabase = await createClient()

    // Get current user profile for ministry_id
    // Pegar o perfil do usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    // Buscar repertórios reais (se houver ministério)
    let repertoires = []
    if (profile?.ministry_id) {
        const { data, error: repError } = await supabase
            .from('repertoires')
            .select(`
                *,
                profiles:created_by (name),
                repertoire_chords (count)
            `)
            .eq('ministry_id', profile.ministry_id)
            .order('event_date', { ascending: false })

        if (repError) {
            console.error('Error fetching repertoires:', repError)
        } else {
            repertoires = data?.map(r => ({
                ...r,
                chords_count: r.repertoire_chords?.[0]?.count || 0
            })) || []
        }
    }

    return <RepertoireClient
        repertoires={repertoires || []}
        userProfile={profile}
    />
}
