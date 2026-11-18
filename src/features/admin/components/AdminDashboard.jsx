import { useEffect, useState } from 'react'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper'
import { listPosts, listUserPosts, listUsers } from '../api/adminApi'

/** Panel admin (full width): ringkasan pengguna & arsip seluruh artikel. */
export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([listUsers(), listPosts()])
      .then(([userList, postList]) => {
        setUsers(userList)
        setPosts(postList)
      })
      .catch((err) => showErrorAlert(err.message))
  }, [])

  const showUser = async (user) => {
    try {
      setPosts(await listUserPosts(user.id))
      setSelected(user)
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }

  const showAll = async () => {
    try {
      setPosts(await listPosts())
      setSelected(null)
    } catch (err) {
      await showErrorAlert(err.message)
    }
  }

  const names = new Map(users.map((user) => [user.id, user.username]))
  const totalPosts = users.reduce((sum, user) => sum + user.total_posts, 0)
  const totalPublished = users.reduce((sum, user) => sum + user.published_posts, 0)

  const cards = [
    { label: 'Total Pengguna', value: users.length },
    { label: 'Total Artikel', value: totalPosts },
    { label: 'Total Terbit', value: totalPublished },
  ]

  return (
    <section className="w-full space-y-6 px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold">Panel Admin</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-accent">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Artikel</th>
              <th className="px-4 py-3">Terbit</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.total_posts}</td>
                <td className="px-4 py-3">{user.published_posts}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => showUser(user)} className="text-sm font-semibold text-accent">
                    Lihat Artikel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{selected ? `Artikel ${selected.username}` : 'Semua Artikel'}</h2>
        {selected && (
          <button type="button" onClick={showAll} className="text-sm font-semibold text-accent">
            Tampilkan semua
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Tidak ada artikel.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{names.get(post.user_id)}</td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3">{post.is_published ? 'Terbit' : 'Draf'}</td>
                <td className="px-4 py-3">{formatDate(post.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
