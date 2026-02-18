import { render, screen } from '@testing-library/react'
import { Logo } from './logo'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('Logo Component', () => {
    it('renders correctly with default props', () => {
        render(<Logo />)
        const logoText = screen.getByText('ISJC Cifras')
        expect(logoText).toBeInTheDocument()
        const image = screen.getByRole('img', { name: /ISJC Cifras Logo/i })
        expect(image).toBeInTheDocument()
    })

    it('does not render text when showText is false', () => {
        render(<Logo showText={false} />)
        const logoText = screen.queryByText('ISJC Cifras')
        expect(logoText).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
        const customClass = 'test-class'
        const { container } = render(<Logo className={customClass} />)
        expect(container.firstChild).toHaveClass(customClass)
    })
})
