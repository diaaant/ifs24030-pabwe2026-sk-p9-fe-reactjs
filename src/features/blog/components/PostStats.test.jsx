import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('defaults to zeros', () => {
    render(<PostStats />)

    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('0')
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('renders the three cards', () => {
    render(<PostStats stats={{ total: 5, total_terbit: 3, total_draf: 2 }} />)

    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('5')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Draf').nextSibling).toHaveTextContent('2')
  })
})
