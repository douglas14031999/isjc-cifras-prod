'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { z } from 'zod'
import crypto from 'crypto'

const ministrySchema = z.object({
    name: z.string().min(3, "Nome do ministério deve ter no mínimo 3 caracteres").max(50, "Nome do ministério deve ter no máximo 50 caracteres"),
})

export async function createMinistry(name: string) {
    const supabase = await createClient()

    // 1. Validar input com Zod
    const validatedFields = ministrySchema.safeParse({ name })

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.flatten().fieldErrors.name?.[0] || "Dados inválidos")
    }

    // 2. Verificar se o usuário é admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        throw new Error('Apenas administradores podem criar ministérios')
    }

    // 3. Gerar código de convite único e seguro
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()

    // 4. Inserir ministério
    const { data: ministry, error } = await supabase
        .from('ministries')
        .insert({
            name: validatedFields.data.name,
            invite_code: inviteCode,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating ministry:', error)
        throw new Error('Erro ao criar ministério')
    }

    revalidatePath('/admin/ministries')
    return ministry
}

export async function deleteMinistry(id: string) {
    const supabase = await createClient()

    // 1. Verificar admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        throw new Error('Não autorizado')
    }

    // 2. Deletar (RLS deve estar configurado)
    const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting ministry:', error)
        throw new Error('Erro ao excluir ministério')
    }

    revalidatePath('/admin/ministries')
}
