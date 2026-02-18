import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditChordClient from '@/app/chords/[id]/edit-chord-client'

export default async function EditChordPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticação
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Buscar cifra
    const { data: chord, error } = await supabase
        .from('chords')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !chord) {
        notFound()
    }

    // Verificar se é o dono
    if (chord.created_by !== user.id) {
        redirect(`/chords/${id}`)
    }

    return <EditChordClient chord={chord} />
}
