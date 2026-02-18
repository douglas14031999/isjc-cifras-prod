import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
    const supabase = await createClient()

    // Verificar autenticação
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Buscar perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ministries(*)')
        .eq('id', user.id)
        .single()

    return <ProfileClient user={user} profile={profile} />
}
