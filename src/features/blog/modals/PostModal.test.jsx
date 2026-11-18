import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

import PostModal from './PostModal'

const setup = (props = {}) => {
  const handlers = { onClose: vi.fn(), onSave: vi.fn().mockResolvedValue() }
  render(<PostModal post={{}} dark={false} {...handlers} {...props} />)
  return handlers
}

describe('PostModal', () => {
  it('creates an article with the entered values', async () => {
    const { onSave } = setup()
    const user = userEvent.setup()
    expect(screen.getByRole('dialog', { name: 'Tambah Artikel' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Judul'), 'Judul Baru')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await user.type(screen.getByLabelText(/Ringkasan/), 'Ringkas')
    await user.type(screen.getByLabelText(/gambar sampul/), 'https://img/c.png')
    await user.type(screen.getByTestId('editor'), 'Isi artikel')
    await user.click(screen.getByLabelText(/Terbitkan langsung/))
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(onSave).toHaveBeenCalledWith({
      title: 'Judul Baru',
      category: 'Bisnis',
      excerpt: 'Ringkas',
      content: 'Isi artikel',
      cover_image_path: 'https://img/c.png',
      is_published: true,
    })
  })

  it('prefills edit mode and hides the publish checkbox', () => {
    setup({ post: { id: 5, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'isi', cover_image_path: '' } })

    expect(screen.getByRole('dialog', { name: 'Ubah Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Opini')
    expect(screen.getByTestId('editor')).toHaveValue('isi')
    expect(screen.queryByLabelText(/Terbitkan langsung/)).toBeNull()
  })

  it('validates required fields', async () => {
    const { onSave } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Judul dan konten wajib diisi')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows save errors and lets the user retry', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('server menolak')).mockResolvedValueOnce()
    setup({ post: { title: 'T', content: 'C' }, onSave })
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('server menolak')
    expect(screen.getByRole('button', { name: 'Simpan' })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled()
  })

  it('closes from the X button and the Batal button', async () => {
    const { onClose } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
