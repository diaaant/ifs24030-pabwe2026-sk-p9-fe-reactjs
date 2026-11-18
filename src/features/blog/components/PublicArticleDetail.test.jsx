import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content, dark }) => <div data-testid="viewer" data-dark={String(dark)}>{content}</div>,
}))

import { getPublicPost } from '../api/blogApi'
import PublicArticleDetail from './PublicArticleDetail'

const article = {
  title: 'Belajar Go',
  category: 'Teknologi',
  content: '## Isi',
  reading_time: 4,
  published_at: '2026-08-17T00:00:00Z',
  author: { username: 'alice' },
  cover_image_path: '',
}

beforeEach(() => vi.clearAllMocks())

describe('PublicArticleDetail', () => {
  it('renders the article with markdown content', async () => {
    getPublicPost.mockResolvedValue(article)
    render(<PublicArticleDetail slug="belajar-go" dark onNavigate={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Belajar Go' })).toBeInTheDocument()
    expect(screen.getByText('Oleh alice')).toBeInTheDocument()
    expect(screen.getByText(/4 menit baca/)).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('## Isi')
    expect(screen.getByTestId('viewer')).toHaveAttribute('data-dark', 'true')
    expect(screen.queryByRole('img')).toBeNull()
    expect(getPublicPost).toHaveBeenCalledWith('belajar-go')
  })

  it('renders the cover image when present', async () => {
    getPublicPost.mockResolvedValue({ ...article, cover_image_path: 'https://img/c.png' })
    render(<PublicArticleDetail slug="a" onNavigate={vi.fn()} />)

    expect(await screen.findByRole('img')).toHaveAttribute('src', 'https://img/c.png')
  })

  it('shows an error when the article is missing', async () => {
    getPublicPost.mockRejectedValue(new Error('post not found'))
    render(<PublicArticleDetail slug="x" onNavigate={vi.fn()} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('post not found')
  })

  it('goes back and refetches when the slug changes', async () => {
    getPublicPost.mockResolvedValue(article)
    const onNavigate = vi.fn()
    const { rerender } = render(<PublicArticleDetail slug="a" onNavigate={onNavigate} />)
    await screen.findByText('Belajar Go')

    rerender(<PublicArticleDetail slug="b" onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: /Kembali/ }))

    expect(getPublicPost).toHaveBeenCalledWith('b')
    expect(onNavigate).toHaveBeenCalledWith('/')
  })
})
