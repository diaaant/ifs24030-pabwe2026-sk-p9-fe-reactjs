import { describe, expect, it, vi } from 'vitest'

vi.mock('./App.jsx', () => ({ default: () => <p>app-root</p> }))

describe('main', () => {
  it('mounts the app into #root', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('./main.jsx')

    await vi.waitFor(() => expect(document.getElementById('root')).toHaveTextContent('app-root'))
  })
})
