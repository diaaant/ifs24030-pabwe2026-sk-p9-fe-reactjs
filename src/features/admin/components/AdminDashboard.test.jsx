import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/adminApi', () => ({ listUsers: vi.fn(), listPosts: vi.fn(), listUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper', () => ({
  formatDate: (v) => `tgl:${v}`,
  showErrorAlert: vi.fn().mockResolvedValue(),
}))

import { showErrorAlert } from '../../../helpers/toolsHelper'
import { listPosts, listUserPosts, listUsers } from '../api/adminApi'
import AdminDashboard from './AdminDashboard'

const users = [
  { id: 1, username: 'alice', email: 'a@x.com', role: 'member', total_posts: 2, published_posts: 1 },
  { id: 2, username: 'bob', email: 'b@x.com', role: 'admin', total_posts: 1, published_posts: 1 },
]
const posts = [
  { id: 10, user_id: 1, title: 'Post A', category: 'Umum', is_published: true, created_at: 'x' },
  { id: 11, user_id: 2, title: 'Post B', category: 'Bisnis', is_published: false, created_at: 'y' },
]

beforeEach(() => {
  vi.clearAllMocks()
  listUsers.mockResolvedValue(users)
  listPosts.mockResolvedValue(posts)
})

describe('AdminDashboard', () => {
  it('shows summary cards, users and all posts', async () => {
    render(<AdminDashboard />)

    expect(await screen.findByText('Post A')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Semua Artikel')).toBeInTheDocument()
    const row = screen.getByText('Post B').closest('tr')
    expect(within(row).getByText('bob')).toBeInTheDocument()
    expect(within(row).getByText('Draf')).toBeInTheDocument()
    expect(within(screen.getByText('Post A').closest('tr')).getByText('Terbit')).toBeInTheDocument()
  })

  it('filters posts by user and restores the full list', async () => {
    listUserPosts.mockResolvedValue([posts[0]])
    render(<AdminDashboard />)
    await screen.findByText('Post A')

    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat Artikel' })[0])
    expect(await screen.findByText('Artikel alice')).toBeInTheDocument()
    expect(listUserPosts).toHaveBeenCalledWith(1)
    expect(screen.queryByText('Post B')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    expect(await screen.findByText('Post B')).toBeInTheDocument()
    expect(screen.getByText('Semua Artikel')).toBeInTheDocument()
  })

  it('shows an empty message', async () => {
    listPosts.mockResolvedValue([])
    render(<AdminDashboard />)

    expect(await screen.findByText('Tidak ada artikel.')).toBeInTheDocument()
  })

  it('alerts on initial load failure', async () => {
    listUsers.mockRejectedValue(new Error('akses ditolak'))
    render(<AdminDashboard />)

    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('akses ditolak'))
  })

  it('alerts when switching user or restoring fails', async () => {
    render(<AdminDashboard />)
    await screen.findByText('Post A')

    listUserPosts.mockRejectedValueOnce(new Error('user gagal'))
    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat Artikel' })[0])
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('user gagal'))

    listUserPosts.mockResolvedValueOnce([posts[0]])
    await userEvent.click(screen.getAllByRole('button', { name: 'Lihat Artikel' })[0])
    await screen.findByText('Artikel alice')

    listPosts.mockRejectedValueOnce(new Error('semua gagal'))
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('semua gagal'))
  })
})
