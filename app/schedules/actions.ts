'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const eventSchema = z.object({
    title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    type: z.enum(['rehearsal', 'event', 'meeting']),
    start_at: z.string(),
    end_at: z.string().optional(),
    ministry_id: z.string().uuid(),
    repertoire_id: z.string().uuid().optional().nullable(),
})

export async function createEvent(values: z.infer<typeof eventSchema>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    // Validate admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, ministry_id')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin || profile.ministry_id !== values.ministry_id) {
        throw new Error('Apenas administradores podem criar eventos')
    }

    const { data, error } = await supabase
        .from('events')
        .insert({
            ...values,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating event:', error)
        throw new Error('Erro ao criar evento')
    }

    revalidatePath('/schedules')
    return data
}

export async function addAssignment(eventId: string, profileId: string, role: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    const { error } = await supabase
        .from('event_assignments')
        .insert({
            event_id: eventId,
            profile_id: profileId,
            role
        })

    if (error) {
        console.error('Error adding assignment:', error)
        throw new Error('Erro ao adicionar integrante')
    }

    revalidatePath('/schedules')
}

export async function removeAssignment(assignmentId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('event_assignments')
        .delete()
        .eq('id', assignmentId)

    if (error) {
        console.error('Error removing assignment:', error)
        throw new Error('Erro ao remover integrante')
    }

    revalidatePath('/schedules')
}

export async function deleteEvent(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting event:', error)
        throw new Error('Erro ao excluir evento')
    }

    revalidatePath('/schedules')
}

