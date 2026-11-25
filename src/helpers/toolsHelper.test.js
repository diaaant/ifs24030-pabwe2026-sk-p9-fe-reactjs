import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

import Swal from 'sweetalert2'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from './toolsHelper'

beforeEach(() => Swal.fire.mockReset())

describe('formatDate', () => {
  it('returns a dash for empty values', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('formats ISO dates in Indonesian', () => {
    expect(formatDate('2026-08-17T10:00:00Z')).toMatch(/17.*2026/)
  })
})

describe('alerts', () => {
  it('shows success and error dialogs', async () => {
    await showSuccessAlert('Tersimpan')
    await showErrorAlert('Gagal')

    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: 'success', text: 'Tersimpan' }))
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: 'error', text: 'Gagal' }))
  })

  it('resolves the confirm dialog result', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await showConfirmDialog('Hapus?')).toBe(true)

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await showConfirmDialog('Hapus?')).toBe(false)
  })
})