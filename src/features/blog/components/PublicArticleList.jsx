import { useEffect, useRef, useState } from 'react'
import { IconClock, IconSearch } from '@tabler/icons-react'
import { formatDate } from '../../../helpers/toolsHelper'
import { listCategories, listPublicPosts } from '../api/blogApi'

/** Beranda galeri artikel publik: pencarian real-time + filter kategori. */
export default function PublicArticleList({ onNavigate }) {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const latest = useRef(0)

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    const requestId = ++latest.current
    setLoading(true)
    listPublicPosts({ q: query, category })
      .then((data) => {
        if (requestId !== latest.current) return // abaikan respons usang
        setPosts(data)
        setError('')
      })
      .catch((err) => {
        if (requestId === latest.current) setError(err.message)
      })
      .finally(() => {
        if (requestId === latest.current) setLoading(false)
      })
  }, [query, category])

  const pill = (active) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium ${
      active ? 'btn-accent border-transparent' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
    }`

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Artikel Terbaru</h1>
      <p className="mb-6 text-slate-500">Bacaan terkini dari para penulis Delcom Blog.</p>

      <div className="relative mb-4">
        <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          aria-label="Cari artikel"
          placeholder="Cari artikel..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button type="button" aria-pressed={category === ''} className={pill(category === '')} onClick={() => setCategory('')}>
          Semua
        </button>
        {categories.map((name) => (
          <button key={name} type="button" aria-pressed={category === name} className={pill(category === name)} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {loading && <p className="text-slate-500">Memuat artikel...</p>}
      {!loading && posts.length === 0 && <p className="text-slate-500">Belum ada artikel yang cocok.</p>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            onClick={() => onNavigate(`/posts/${post.slug}`)}
          >
            {post.cover_image_path && <img src={post.cover_image_path} alt={post.title} className="h-40 w-full object-cover" />}
            <div className="p-5">
              <span className="bg-accent-soft text-accent rounded-full px-3 py-1 text-xs font-semibold">{post.category}</span>
              <h2 className="mt-3 text-lg font-bold">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {post.author.username} · {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <IconClock size={14} /> {post.reading_time} menit baca
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
