import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({ showSuccessAlert: vi.fn().mockResolvedValue() }))

import { showSuccessAlert } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'
import AuthPage from './AuthPage'

beforeEach(() => vi.clearAllMocks())

describe('AuthPage (login)', () => {
  it('exposes the mandatory login ids and logs in', async () => {
    login.mockResolvedValue({ id: 1, username: 'bob' })
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<AuthPage mode="login" onSuccess={onSuccess} onNavigate={vi.fn()} />)

    expect(container.querySelector('#login-username')).toBeInTheDocument()
    expect(container.querySelector('#login-password')).toBeInTheDocument()
    expect(container.querySelector('#login-submit')).toBeInTheDocument()
    expect(container.querySelector('#register-email')).toBeNull()

    await user.type(container.querySelector('#login-username'), 'bob')
    await user.type(container.querySelector('#login-password'), 'secret1')
    await user.click(container.querySelector('#login-submit'))

    expect(login).toHaveBeenCalledWith('bob', 'secret1')
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 1, username: 'bob' }))
  })

  it('shows the server error and clears it on the next attempt', async () => {
    login.mockRejectedValueOnce(new Error('invalid username or password'))
    login.mockResolvedValueOnce({ id: 1 })
    const user = userEvent.setup()
    const { container } = render(<AuthPage mode="login" onSuccess={vi.fn()} onNavigate={vi.fn()} />)

    await user.click(container.querySelector('#login-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('invalid username or password')

    await user.click(container.querySelector('#login-submit'))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  it('disables the submit button while the request is pending', async () => {
    let resolve
    login.mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    const { container } = render(<AuthPage mode="login" onSuccess={vi.fn()} onNavigate={vi.fn()} />)

    await user.click(container.querySelector('#login-submit'))
    expect(container.querySelector('#login-submit')).toBeDisabled()
    expect(container.querySelector('#login-submit')).toHaveTextContent('Memproses...')

    resolve({ id: 1 })
    await waitFor(() => expect(container.querySelector('#login-submit')).not.toBeDisabled())
  })

  it('links to the register page', async () => {
    const onNavigate = vi.fn()
    render(<AuthPage mode="login" onSuccess={vi.fn()} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})

describe('AuthPage (register)', () => {
  it('registers, confirms, then goes to the login page', async () => {
    register.mockResolvedValue({ id: 2 })
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<AuthPage mode="register" onSuccess={vi.fn()} onNavigate={onNavigate} />)

    await user.type(container.querySelector('#register-username'), 'newbie')
    await user.type(container.querySelector('#register-email'), 'n@x.com')
    await user.type(container.querySelector('#register-password'), 'secret1')
    await user.click(container.querySelector('#register-submit'))

    expect(register).toHaveBeenCalledWith('newbie', 'n@x.com', 'secret1')
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/login'))
    expect(showSuccessAlert).toHaveBeenCalled()
  })

  it('shows registration errors and links back to login', async () => {
    register.mockRejectedValue(new Error('username is already taken'))
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<AuthPage mode="register" onSuccess={vi.fn()} onNavigate={onNavigate} />)

    await user.click(container.querySelector('#register-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('already taken')

    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})
