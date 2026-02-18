
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from './page'
import { useRouter } from 'next/navigation'

// Mocks
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSignIn = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithPassword: mockSignIn,
        },
    }),
}))

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login form correctly', () => {
        render(<LoginPage />)
        expect(screen.getByRole('heading', { level: 1, name: /Bem-vindo de volta/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
    })

    it('updates input fields', () => {
        render(<LoginPage />)
        const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
        const passwordInput = screen.getByLabelText(/Senha/i) as HTMLInputElement

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput.value).toBe('test@example.com')
        expect(passwordInput.value).toBe('password123')
    })

    it('handles successful login', async () => {
        mockSignIn.mockResolvedValueOnce({ error: null })
        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } })
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'secret' } })

        const submitButton = screen.getByRole('button', { name: /Entrar/i })
        fireEvent.click(submitButton)

        expect(submitButton).toBeDisabled()
        expect(screen.getByText(/Entrando.../i)).toBeInTheDocument()

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'secret',
            })
            expect(mockPush).toHaveBeenCalledWith('/dashboard')
            expect(mockRefresh).toHaveBeenCalled()
        })
    })

    it('displays error message on failed login', async () => {
        mockSignIn.mockResolvedValueOnce({ error: { message: 'Credenciais inválidas' } })
        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@example.com' } })
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'wrong' } })

        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

        await waitFor(() => {
            expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
            expect(mockPush).not.toHaveBeenCalled()
        })

        expect(screen.getByRole('button', { name: /Entrar/i })).not.toBeDisabled()
    })
})
