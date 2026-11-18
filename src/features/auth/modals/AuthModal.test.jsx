import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))

import AuthModal from './AuthModal'

describe('AuthModal', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<AuthModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} onNavigate={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the login form with the mandatory ids', () => {
    const { container } = render(<AuthModal open onClose={vi.fn()} onSuccess={vi.fn()} onNavigate={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(container.querySelector('#login-username')).toBeInTheDocument()
    expect(container.querySelector('#login-password')).toBeInTheDocument()
    expect(container.querySelector('#login-submit')).toBeInTheDocument()
  })

  it('closes via the X button', async () => {
    const onClose = vi.fn()
    render(<AuthModal open onClose={onClose} onSuccess={vi.fn()} onNavigate={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('closes and navigates to the register page', async () => {
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(<AuthModal open onClose={onClose} onSuccess={vi.fn()} onNavigate={onNavigate} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Daftar' })[0])

    expect(onClose).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})
