import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const setup = (props = {}) => {
  const handlers = { onNavigate: vi.fn(), onToggleTheme: vi.fn(), onLogin: vi.fn(), onLogout: vi.fn() }
  render(<StickyNavbar user={null} theme="light" currentPath="/" {...handlers} {...props} />)
  return handlers
}

describe('StickyNavbar', () => {
  it('shows guest actions and wires them', async () => {
    const h = setup()

    expect(screen.queryByText('Workspace')).toBeNull()
    expect(screen.queryByText('Admin')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(h.onLogin).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(h.onNavigate).toHaveBeenCalledWith('/register')
  })

  it('shows member links and logs out', async () => {
    const h = setup({ user: { username: 'bob', role: 'member' }, currentPath: '/author' })

    expect(screen.getByRole('link', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Keluar \(bob\)/ }))
    expect(h.onLogout).toHaveBeenCalled()
  })

  it('shows the admin link for admins', async () => {
    const h = setup({ user: { username: 'root', role: 'admin' } })

    await userEvent.click(screen.getByRole('link', { name: 'Admin' }))

    expect(h.onNavigate).toHaveBeenCalledWith('/admin')
  })

  it('navigates home from the brand and the Beranda link', async () => {
    const h = setup()

    await userEvent.click(screen.getByRole('link', { name: /Delcom Blog/ }))
    await userEvent.click(screen.getByRole('link', { name: 'Beranda' }))

    expect(h.onNavigate).toHaveBeenCalledTimes(2)
    expect(h.onNavigate).toHaveBeenCalledWith('/')
  })

  it('toggles the theme and swaps its icon', async () => {
    const h = setup({ theme: 'dark' })

    await userEvent.click(screen.getByRole('button', { name: 'Ganti tema' }))

    expect(h.onToggleTheme).toHaveBeenCalled()
  })

  it('toggles the mobile menu', async () => {
    setup()
    const burger = screen.getByRole('button', { name: 'Buka menu' })
    expect(burger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(burger)

    expect(burger).toHaveAttribute('aria-expanded', 'true')
  })
})
