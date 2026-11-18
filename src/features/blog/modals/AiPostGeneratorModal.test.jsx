import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/blogApi', async (importOriginal) => ({
  ...(await importOriginal()),
  aiGenerate: vi.fn(),
}))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

import { aiGenerate } from '../api/blogApi'
import AiPostGeneratorModal from './AiPostGeneratorModal'

const draft = {
  title: 'Artikel AI',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi AI',
  sources: [{ title: 'Sumber 1', url: 'https://s1' }],
}

const setup = () => {
  const handlers = { onClose: vi.fn(), onApply: vi.fn() }
  render(<AiPostGeneratorModal dark={false} {...handlers} />)
  return handlers
}

beforeEach(() => vi.clearAllMocks())

describe('AiPostGeneratorModal', () => {
  it('requires a topic', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Generate Artikel' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Topik wajib diisi')
    expect(aiGenerate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Gunakan Draf' })).toBeDisabled()
  })

  it('generates a draft with sources and applies it', async () => {
    aiGenerate.mockResolvedValue(draft)
    const { onApply } = setup()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Topik artikel'), 'Golang')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await user.click(screen.getByLabelText(/Search Engine/)) // matikan web search
    await user.click(screen.getByRole('button', { name: 'Generate Artikel' }))

    expect(aiGenerate).toHaveBeenCalledWith({ topic: 'Golang', category: 'Teknologi', include_web_search: false })
    expect(await screen.findByRole('heading', { name: 'Artikel AI' })).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('## Isi AI')
    expect(screen.getByRole('link', { name: 'Sumber 1' })).toHaveAttribute('href', 'https://s1')

    await user.click(screen.getByRole('button', { name: 'Gunakan Draf' }))
    expect(onApply).toHaveBeenCalledWith(draft)
  })

  it('hides the sources section when there are none', async () => {
    aiGenerate.mockResolvedValue({ ...draft, sources: [] })
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')

    await userEvent.click(screen.getByRole('button', { name: 'Generate Artikel' }))

    await screen.findByRole('heading', { name: 'Artikel AI' })
    expect(screen.queryByText('Sumber rujukan')).toBeNull()
  })

  it('shows the loading label and API errors', async () => {
    let reject
    aiGenerate.mockReturnValue(new Promise((_, r) => (reject = r)))
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'x')

    await userEvent.click(screen.getByRole('button', { name: 'Generate Artikel' }))
    expect(screen.getByRole('button', { name: 'Menghasilkan...' })).toBeDisabled()

    reject(new Error('AI request failed'))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI request failed')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Generate Artikel' })).not.toBeDisabled())
  })

  it('closes from the X and Batal buttons', async () => {
    const { onClose } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
