import { apiRequest } from '../../../helpers/apiHelper'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

const data = async (path, options) => (await apiRequest(path, options)).data

// ---- publik
export const listCategories = () => data('/api/public/categories')

export const listPublicPosts = ({ q, category } = {}) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const query = params.toString()
  return data(query ? `/api/public/posts?${query}` : '/api/public/posts')
}

export const getPublicPost = (slug) => data(`/api/public/posts/${encodeURIComponent(slug)}`)

// ---- penulis
export const listMyPosts = () => data('/api/posts')
export const getMyStats = () => data('/api/posts/stats')
export const getMyPost = (id) => data(`/api/posts/${id}`)
export const createPost = (payload) => data('/api/posts', { method: 'POST', body: payload })
export const updatePost = (id, payload) => data(`/api/posts/${id}`, { method: 'PUT', body: payload })
export const togglePublish = (id) => data(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const deletePost = (id) => data(`/api/posts/${id}`, { method: 'DELETE' })
export const aiGenerate = (payload) => data('/api/posts/ai-generate', { method: 'POST', body: payload })
