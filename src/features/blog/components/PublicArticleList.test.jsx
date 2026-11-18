import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ listCategories: vi.fn(), listPublicPosts: vi.fn() }))

import { listCategories, listPublicPosts } from '../api/blogApi'
import PublicArticleList from './PublicArticleList'

const post = (id, extra = {}) => ({
  id,
  slug: `post-${id}`,
  title: `Judul ${id}`,
  excerpt: `Ringkasan ${id}`,
  category: 'Teknologi',
  reading_time: 3,
  published_at: '2026-08-17T00:00:00Z',
  author: { username: 'alice' },
  cover_image_path: '',
  ...extra,
})

beforeEach(() => {
  vi.clearAllMocks()
  listCategories.mockResolvedValue(['Teknologi', 'Bisnis'])
  listPublicPosts.mockResolvedValue([post(1), post(2, { cover_image_path: 'https://img/x.png' })])
})

describe('PublicArticleList', () => {
  it('shows a loading state then the article cards', async () => {
    render(<PublicArticleList onNavigate={vi.fn()} />)

    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Judul 1')).toBeInTheDocument()
    expect(screen.getByText('Ringkasan 2')).toBeInTheDocument()
    expect(screen.getAllByText(/3 menit baca/)).toHaveLength(2)
    expect(screen.getByAltText('Judul 2')).toHaveAttribute('src', 'https://img/x.png')
    expect(screen.queryByAltText('Judul 1')).toBeNull()
    expect(await screen.findByRole('button', { name: 'Bisnis' })).toBeInTheDocument()
  })

  it('navigates to the article when a card is clicked', async () => {
    const onNavigate = vi.fn()
    render(<PublicArticleList onNavigate={onNavigate} />)

    await userEvent.click(await screen.findByText('Judul 1'))

    expect(onNavigate).toHaveBeenCalledWith('/posts/post-1')
  })

  it('filters by category', async () => {
    render(<PublicArticleList onNavigate={vi.fn()} />)
    await screen.findByText('Judul 1')

    await userEvent.click(await screen.findByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Bisnis' }))
    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: '', category: '' }))
  })

  it('searches as the user types', async () => {
    render(<PublicArticleList onNavigate={vi.fn()} />)
    await screen.findByText('Judul 1')

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')

    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))
  })

  it('shows an empty state', async () => {
    listPublicPosts.mockResolvedValue([])
    render(<PublicArticleList onNavigate={vi.fn()} />)

    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('shows errors from posts and categories', async () => {
    listPublicPosts.mockRejectedValue(new Error('gagal memuat'))
    listCategories.mockRejectedValue(new Error('kategori gagal'))
    render(<PublicArticleList onNavigate={vi.fn()} />)

    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
    expect(screen.getAllByRole('alert').map((n) => n.textContent).join(' ')).toMatch(/gagal/)
  })

  it('ignores a stale successful response that arrives late', async () => {
    let resolveFirst
    const first = new Promise((res) => (resolveFirst = res))
    listPublicPosts.mockReset()
    listPublicPosts.mockReturnValueOnce(first).mockResolvedValueOnce([post(5)])
    render(<PublicArticleList onNavigate={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x')
    expect(await screen.findByText('Judul 5')).toBeInTheDocument()

    resolveFirst([post(6)]) // permintaan pertama selesai paling akhir
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText('Judul 6')).toBeNull()
    expect(screen.getByText('Judul 5')).toBeInTheDocument()
  })

  it('ignores stale responses (success and failure)', async () => {
    const deferred = () => {
      let resolve, reject
      const promise = new Promise((res, rej) => ((resolve = res), (reject = rej)))
      return { promise, resolve, reject }
    }
    const first = deferred()
    const second = deferred()
    listPublicPosts.mockReset()
    listPublicPosts.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    render(<PublicArticleList onNavigate={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'x') // memicu permintaan kedua
    second.resolve([post(9)])
    expect(await screen.findByText('Judul 9')).toBeInTheDocument()

    first.reject(new Error('usang')) // respons pertama datang terlambat
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByRole('alert')).toBeNull()

    const third = deferred()
    listPublicPosts.mockReturnValueOnce(third.promise)
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'y')
    third.resolve([post(7)])
    expect(await screen.findByText('Judul 7')).toBeInTheDocument()
  })
})
