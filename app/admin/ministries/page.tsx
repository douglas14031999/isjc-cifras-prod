import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MinistriesClient from '@/app/admin/ministries/ministries-client'

export default async function MinistriesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        redirect('/dashboard')
    }

    // Buscar ministérios
    const { data: ministries } = await supabase
        .from('ministries')
        .select(`
            *,
            members_count:profiles(count)
        `)
        .order('name')

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Ministérios</h1>
                <p className="text-muted-foreground mt-1">Crie e gerencie os ministérios da plataforma.</p>
            </div>

            <MinistriesClient initialData={ministries || []} />
        </div>
    )
}
