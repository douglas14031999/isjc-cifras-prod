import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const now = new Date().toISOString()

    // Buscando dados reais em paralelo para evitar waterfalls
    const [
        { count: chordsCount },
        { count: ministryMembersCount },
        { data: recentChords },
        { count: activeScalesCount },
        { data: upcomingEvents }
    ] = await Promise.all([
        supabase.from('chords').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chords').select(`
            id,
            title,
            artist,
            created_at,
            profiles:created_by (name)
        `).order('created_at', { ascending: false }).limit(5),
        supabase.from('event_assignments')
            .select('id, events!inner(start_at)', { count: 'exact', head: true })
            .eq('profile_id', user.id)
            .gte('events.start_at', now),
        supabase.from('events')
            .select(`
                id,
                title,
                description,
                start_at,
                type,
                repertoires:repertoire_id (title)
            `)
            .gte('start_at', now)
            .order('start_at', { ascending: true })
            .limit(5)
    ])

    return (
        <DashboardClient
            stats={{
                chords: chordsCount || 0,
                activeScales: activeScalesCount || 0,
                members: ministryMembersCount || 0
            }}
            recentChords={recentChords || []}
            upcomingEvents={upcomingEvents || []}
        />
    )
}
