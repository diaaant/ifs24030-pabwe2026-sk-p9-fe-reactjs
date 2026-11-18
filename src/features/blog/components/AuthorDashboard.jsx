import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconEdit, IconEye, IconPlus, IconSparkles, IconTrash } from '@tabler/icons-react'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'
import { createPost, deletePost, getMyPost, getMyStats, listMyPosts, togglePublish, updatePost } from '../api/blogApi'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import PostModal from '../modals/PostModal'
import PostStats from './PostStats'

/** Workspace penulis (full width): statistik, tabel artikel, kebab menu, toggle terbit. */
export default function AuthorDashboard({ dark, onNavigate }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(undefined)
  const [menuId, setMenuId] = useState(null)
  const [editor, setEditor] = useState(null) // { post } | null
  const [aiOpen, setAiOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([listMyPosts(), getMyStats()])
      setPosts(list)
      setStats(summary)
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openEdit = async (id) => {
    setMenuId(null)
    try {
      setEditor({ post: await getMyPost(id) })
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }

  const save = async (payload) => {
    if (editor.post.id) {
      await updatePost(editor.post.id, payload)
    } else {
      await createPost(payload)
    }
    setEditor(null)
    await showSuccessAlert('Artikel berhasil disimpan')
    await load()
  }

  const toggle = async (id) => {
    try {
      await togglePublish(id)
      await load()
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }

  const remove = async (post) => {
    setMenuId(null)
    if (!(await showConfirmDialog(`Hapus artikel "${post.title}"?`))) return
    try {
      await deletePost(post.id)
      await showSuccessAlert('Artikel dihapus')
      await load()
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }

  const applyDraft = (draft) => {
    setAiOpen(false)
    setEditor({ post: { ...draft, is_published: false } })
  }

  const menuItem = 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700'

  return (
    <section className="w-full space-y-6 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Workspace Penulis</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAiOpen(true)} className="flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent">
            <IconSparkles size={18} /> AI Generator
          </button>
          <button type="button" onClick={() => setEditor({ post: {} })} className="btn-accent flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
            <IconPlus size={18} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Terbit</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Belum ada artikel. Mulai menulis sekarang!
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={post.is_published}
                    aria-label={`Terbitkan ${post.title}`}
                    onClick={() => toggle(post.id)}
                    className={`relative h-6 w-11 rounded-full transition ${post.is_published ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${post.is_published ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">{formatDate(post.created_at)}</td>
                <td className="relative px-4 py-3 text-right">
                  <button type="button" aria-label={`Menu aksi ${post.title}`} onClick={() => setMenuId(menuId === post.id ? null : post.id)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <IconDotsVertical size={18} />
                  </button>
                  {menuId === post.id && (
                    <div role="menu" className="absolute right-4 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-lg dark:border-slate-700 dark:bg-slate-800">
                      {post.is_published && (
                        <button type="button" role="menuitem" className={menuItem} onClick={() => onNavigate(`/posts/${post.slug}`)}>
                          <IconEye size={16} /> Lihat
                        </button>
                      )}
                      <button type="button" role="menuitem" className={menuItem} onClick={() => openEdit(post.id)}>
                        <IconEdit size={16} /> Ubah
                      </button>
                      <button type="button" role="menuitem" className={`${menuItem} text-red-600`} onClick={() => remove(post)}>
                        <IconTrash size={16} /> Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && <PostModal post={editor.post} dark={dark} onClose={() => setEditor(null)} onSave={save} />}
      {aiOpen && <AiPostGeneratorModal dark={dark} onClose={() => setAiOpen(false)} onApply={applyDraft} />}
    </section>
  )
}
