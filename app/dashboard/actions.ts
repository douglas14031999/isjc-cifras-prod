'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    invite_code: z.string().min(4, 'Código deve ter pelo menos 4 caracteres').toUpperCase(),
})

export async function createMinistry(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { message: 'Não autorizado' }

    // Verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) return { message: 'Apenas administradores podem criar ministérios' }

    const validatedFields = schema.safeParse({
        name: formData.get('name'),
        invite_code: formData.get('invite_code'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, invite_code } = validatedFields.data

    // Criar ministério
    const { data: ministry, error } = await supabase
        .from('ministries')
        .insert({
            name,
            invite_code,
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') return { message: 'Código de convite já existe' }
        return { message: 'Erro ao criar ministério: ' + error.message }
    }

    // Vincular usuário ao ministério
    await supabase
        .from('profiles')
        .update({ ministry_id: ministry.id })
        .eq('id', user.id)

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
