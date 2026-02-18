import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SchedulesClient } from './schedules-client'
import { Sidebar } from '@/components/ui/sidebar'

export default async function SchedulesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ministries(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.ministry_id) redirect('/ministry')

    // Fetch events for the ministry
    const { data: events } = await supabase
        .from('events')
        .select(`
            *,
            event_assignments (
                *,
                profiles (
                    id,
                    name,
                    email
                )
            ),
            repertoires (
                id,
                title
            )
        `)
        .eq('ministry_id', profile.ministry_id)
        .order('start_at', { ascending: true })

    // Fetch all musicians for assignments
    const { data: musicians } = await supabase
        .from('profiles')
        .select('*')
        .eq('ministry_id', profile.ministry_id)
        .eq('is_active', true)

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <SchedulesClient
                    initialEvents={events || []}
                    musicians={musicians || []}
                    isAdmin={profile.is_admin}
                    ministryId={profile.ministry_id}
                    profileId={user.id}
                />
            </main>
        </div>
    )
}
