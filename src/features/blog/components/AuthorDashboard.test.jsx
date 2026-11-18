import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({
  listMyPosts: vi.fn(),
  getMyStats: vi.fn(),
  getMyPost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  togglePublish: vi.fn(),
  deletePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper', () => ({
  formatDate: (v) => `tgl:${v}`,
  showErrorAlert: vi.fn().mockResolvedValue(),
  showSuccessAlert: vi.fn().mockResolvedValue(),
  showConfirmDialog: vi.fn(),
}))
vi.mock('../modals/PostModal', () => ({
  default: ({ post, onClose, onSave }) => (
    <div data-testid="post-modal">
      <span data-testid="modal-id">{post.id ?? 'new'}</span>
      <span data-testid="modal-title">{post.title ?? ''}</span>
      <button onClick={() => onSave({ title: 'T' })}>modal-save</button>
      <button onClick={onClose}>modal-close</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ onClose, onApply }) => (
    <div data-testid="ai-modal">
      <button onClick={() => onApply({ title: 'Draf AI', content: 'c' })}>ai-apply</button>
      <button onClick={onClose}>ai-close</button>
    </div>
  ),
}))

import { showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'
import { createPost, deletePost, getMyPost, getMyStats, listMyPosts, togglePublish, updatePost } from '../api/blogApi'
import AuthorDashboard from './AuthorDashboard'

const posts = [
  { id: 1, slug: 'satu', title: 'Satu', category: 'Umum', is_published: true, created_at: 'a' },
  { id: 2, slug: 'dua', title: 'Dua', category: 'Bisnis', is_published: false, created_at: 'b' },
]

const setup = async (onNavigate = vi.fn()) => {
  render(<AuthorDashboard dark={false} onNavigate={onNavigate} />)
  await screen.findByText('Satu')
  return onNavigate
}

beforeEach(() => {
  vi.clearAllMocks()
  listMyPosts.mockResolvedValue(posts)
  getMyStats.mockResolvedValue({ total: 2, total_terbit: 1, total_draf: 1 })
  togglePublish.mockResolvedValue({})
  deletePost.mockResolvedValue()
  createPost.mockResolvedValue({})
  updatePost.mockResolvedValue({})
  getMyPost.mockResolvedValue({ id: 2, title: 'Dua', content: 'isi' })
})

describe('AuthorDashboard', () => {
  it('loads posts and stats', async () => {
    await setup()

    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('tgl:a')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Terbitkan Satu' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Terbitkan Dua' })).toHaveAttribute('aria-checked', 'false')
  })

  it('shows an empty state and a load error', async () => {
    listMyPosts.mockResolvedValueOnce([])
    render(<AuthorDashboard dark={false} onNavigate={vi.fn()} />)
    expect(await screen.findByText(/Belum ada artikel/)).toBeInTheDocument()
  })

  it('alerts when loading fails', async () => {
    listMyPosts.mockRejectedValue(new Error('gagal muat'))
    render(<AuthorDashboard dark={false} onNavigate={vi.fn()} />)

    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal muat'))
  })

  it('toggles publish status and reloads, alerting on error', async () => {
    await setup()

    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Dua' }))
    expect(togglePublish).toHaveBeenCalledWith(2)
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))

    togglePublish.mockRejectedValueOnce(new Error('toggle gagal'))
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Dua' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('toggle gagal'))
  })

  it('kebab menu: Lihat only for published posts, opens and closes', async () => {
    const onNavigate = await setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Satu' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Lihat/ }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/satu')

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Satu' })) // tutup
    expect(screen.queryByRole('menu')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    expect(screen.queryByRole('menuitem', { name: /Lihat/ })).toBeNull()
  })

  it('edits a post: fetches full content then updates', async () => {
    await setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Ubah/ }))
    expect(await screen.findByTestId('modal-id')).toHaveTextContent('2')

    await userEvent.click(screen.getByText('modal-save'))

    await waitFor(() => expect(updatePost).toHaveBeenCalledWith(2, { title: 'T' }))
    expect(showSuccessAlert).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByTestId('post-modal')).toBeNull())
  })

  it('alerts when the post cannot be fetched for editing', async () => {
    getMyPost.mockRejectedValue(new Error('tidak ada'))
    await setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Ubah/ }))

    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('tidak ada'))
    expect(screen.queryByTestId('post-modal')).toBeNull()
  })

  it('creates a new post and can close the modal', async () => {
    await setup()

    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(screen.getByTestId('modal-id')).toHaveTextContent('new')
    await userEvent.click(screen.getByText('modal-close'))
    expect(screen.queryByTestId('post-modal')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    await userEvent.click(screen.getByText('modal-save'))
    await waitFor(() => expect(createPost).toHaveBeenCalledWith({ title: 'T' }))
  })

  it('deletes after confirmation, and skips when cancelled', async () => {
    await setup()

    showConfirmDialog.mockResolvedValueOnce(false)
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    expect(deletePost).not.toHaveBeenCalled()

    showConfirmDialog.mockResolvedValueOnce(true)
    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(2))
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel dihapus')
  })

  it('alerts when deletion fails', async () => {
    deletePost.mockRejectedValue(new Error('hapus gagal'))
    showConfirmDialog.mockResolvedValue(true)
    await setup()

    await userEvent.click(screen.getByRole('button', { name: 'Menu aksi Dua' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Hapus/ }))

    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('hapus gagal'))
  })

  it('hands an AI draft over to the editor modal', async () => {
    await setup()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('ai-close'))
    expect(screen.queryByTestId('ai-modal')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByText('ai-apply'))

    expect(screen.queryByTestId('ai-modal')).toBeNull()
    expect(within(screen.getByTestId('post-modal')).getByTestId('modal-title')).toHaveTextContent('Draf AI')
    expect(screen.getByTestId('modal-id')).toHaveTextContent('new')
  })
})
