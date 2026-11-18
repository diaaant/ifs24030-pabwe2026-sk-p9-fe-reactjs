import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import useInput from '../../../hooks/useInput'
import { CATEGORIES } from '../api/blogApi'

const EMPTY = { title: '', category: 'Umum', excerpt: '', content: '', cover_image_path: '' }

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/**
 * Modal full screen penulisan artikel. `post` berisi nilai awal (artikel yang
 * diubah, draf AI, atau objek kosong). Bila `post.id` ada berarti mode ubah.
 */
export default function PostModal({ post, dark, onClose, onSave }) {
  const initial = { ...EMPTY, ...post }
  const isEdit = Boolean(initial.id)

  const [title, onTitle] = useInput(initial.title)
  const [category, onCategory] = useInput(initial.category)
  const [excerpt, onExcerpt] = useInput(initial.excerpt)
  const [cover, onCover] = useInput(initial.cover_image_path)
  const [publish, onPublish] = useInput(false)
  const [content, setContent] = useState(initial.content)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi')
      return
    }
    setError('')
    setSaving(true)
    try {
      await onSave({ title, category, excerpt, content, cover_image_path: cover, is_published: publish })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2" role="dialog" aria-modal="true" aria-label={isEdit ? 'Ubah Artikel' : 'Tambah Artikel'}>
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? 'Ubah Artikel' : 'Tambah Artikel'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="post-title" className="mb-1 block text-sm font-medium">
                Judul
              </label>
              <input id="post-title" className={fieldClass} value={title} onChange={onTitle} />
            </div>
            <div>
              <label htmlFor="post-category" className="mb-1 block text-sm font-medium">
                Kategori
              </label>
              <select id="post-category" className={fieldClass} value={category} onChange={onCategory}>
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" className="mb-1 block text-sm font-medium">
              Ringkasan (excerpt)
            </label>
            <textarea id="post-excerpt" rows={2} className={fieldClass} value={excerpt} onChange={onExcerpt} />
          </div>
          <div>
            <label htmlFor="post-cover" className="mb-1 block text-sm font-medium">
              URL gambar sampul
            </label>
            <input id="post-cover" className={fieldClass} value={cover} onChange={onCover} placeholder="https://..." />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Konten (Markdown)</span>
            <MarkdownEditor value={content} onChange={setContent} dark={dark} height="420px" />
          </div>
          {!isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={publish} onChange={onPublish} /> Terbitkan langsung
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-slate-800 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-500 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Batal
          </button>
          <button type="button" onClick={submit} disabled={saving} className="btn-accent rounded-lg px-5 py-2 text-sm font-semibold">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
