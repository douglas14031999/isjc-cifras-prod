
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMinistry } from './actions'

// Mocks
const mockSupabase = {
    auth: {
        getUser: vi.fn(),
    },
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn(),
            })),
            single: vi.fn(),
        })),
        insert: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn(),
            })),
        })),
    })),
}

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('createMinistry Action', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should throw validation error if name is too short', async () => {
        await expect(createMinistry('Oi')).rejects.toThrow('Nome do ministério deve ter no mínimo 3 caracteres')
    })

    it('should throw "Não autorizado" if no user is found', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
        await expect(createMinistry('Ministério Teste')).rejects.toThrow('Não autorizado')
    })

    it('should throw "Apenas administradores..." if user is not admin', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

        // Mock profile query response
        const mockSelect = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { is_admin: false } })
            })
        })
        mockSupabase.from.mockReturnValue({ select: mockSelect } as any)

        await expect(createMinistry('Ministério Teste')).rejects.toThrow('Apenas administradores podem criar ministérios')
    })

    it('should create ministry successfully when admin and valid input', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-123' } } })

        // Mock profile check (is_admin: true)
        const mockProfileSelect = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { is_admin: true } })
            })
        })

        // Mock insert ministry
        const mockInsert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'min-1', name: 'Ministério Teste' }, error: null })
            })
        })

        mockSupabase.from.mockImplementation((table) => {
            if (table === 'profiles') return { select: mockProfileSelect } as any
            if (table === 'ministries') return { insert: mockInsert } as any
            return {} as any
        })

        const result = await createMinistry('Ministério Teste')

        expect(result).toEqual({ id: 'min-1', name: 'Ministério Teste' })
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Ministério Teste',
            invite_code: expect.any(String) // Verify invite code was generated
        }))
    })
})
