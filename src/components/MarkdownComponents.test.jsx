import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

describe('MarkdownEditor', () => {
  it('mounts Toast UI Editor with the initial value', () => {
    const { container } = render(<MarkdownEditor value="# Halo" onChange={() => {}} />)

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(container.querySelector('.toastui-editor-defaultUI')).toBeInTheDocument()
    expect(container.textContent).toContain('Halo')
  })

  it('pushes external value changes into the editor without echoing loops', () => {
    const onChange = vi.fn()
    const { rerender, container } = render(<MarkdownEditor value="satu" onChange={onChange} />)

    rerender(<MarkdownEditor value="dua" onChange={onChange} />)

    expect(container.textContent).toContain('dua')
    expect(onChange).toHaveBeenCalledWith('dua')
  })

  it('rebuilds with the dark theme', () => {
    const { rerender, container } = render(<MarkdownEditor value="x" onChange={() => {}} />)
    expect(container.querySelector('.toastui-editor-dark')).toBeNull()

    rerender(<MarkdownEditor value="x" onChange={() => {}} dark />)

    expect(container.querySelector('.toastui-editor-dark')).toBeInTheDocument()
  })
})

describe('MarkdownViewer', () => {
  it('renders markdown as HTML', () => {
    const { container } = render(<MarkdownViewer content={'## Judul\n\nIsi **tebal**'} />)

    expect(container.querySelector('h2')).toHaveTextContent('Judul')
    expect(container.querySelector('strong')).toHaveTextContent('tebal')
  })

  it('applies the dark class and re-renders on content change', () => {
    const { rerender, getByTestId } = render(<MarkdownViewer content="a" dark />)
    expect(getByTestId('markdown-viewer')).toHaveClass('toastui-editor-dark')

    rerender(<MarkdownViewer content="b" dark />)
    expect(getByTestId('markdown-viewer')).toHaveTextContent('b')
  })
})
