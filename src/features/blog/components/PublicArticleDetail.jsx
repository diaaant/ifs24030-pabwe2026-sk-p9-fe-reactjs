import { useEffect, useState } from 'react'
import { IconArrowLeft, IconClock } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'
import { getPublicPost } from '../api/blogApi'

/** Halaman baca artikel (full width) dengan render Markdown & reading time. */
export default function PublicArticleDetail({ slug, dark, onNavigate }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicPost(slug)
      .then((data) => {
        setPost(data)
        setError('')
      })
      .catch((err) => setError(err.message))
  }, [slug])

  return (
    <article className="w-full px-4 py-8 sm:px-8">
      <button type="button" onClick={() => onNavigate('/')} className="mb-6 flex items-center gap-1 text-sm font-medium text-accent">
        <IconArrowLeft size={16} /> Kembali
      </button>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {post && (
        <>
          {post.cover_image_path && <img src={post.cover_image_path} alt={post.title} className="mb-6 max-h-96 w-full rounded-2xl object-cover" />}
          <span className="bg-accent-soft text-accent rounded-full px-3 py-1 text-xs font-semibold">{post.category}</span>
          <h1 className="mt-4 text-4xl font-extrabold">{post.title}</h1>
          <div className="mb-8 mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>Oleh {post.author.username}</span>
            <span>{formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1">
              <IconClock size={14} /> {post.reading_time} menit baca
            </span>
          </div>
          <MarkdownViewer content={post.content} dark={dark} />
        </>
      )}
    </article>
  )
}
