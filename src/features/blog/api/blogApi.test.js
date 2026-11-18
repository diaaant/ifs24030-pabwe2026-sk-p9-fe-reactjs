import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

import { apiRequest } from '../../../helpers/apiHelper'
import * as api from './blogApi'

beforeEach(() => {
  vi.clearAllMocks()
  apiRequest.mockResolvedValue({ data: 'DATA' })
})

describe('blogApi', () => {
  it('exposes the six categories', () => {
    expect(api.CATEGORIES).toHaveLength(6)
  })

  it('public endpoints', async () => {
    expect(await api.listCategories()).toBe('DATA')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/categories', undefined)

    await api.listPublicPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts', undefined)

    await api.listPublicPosts({ q: 'go lang' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?q=go+lang', undefined)

    await api.listPublicPosts({ category: 'Bisnis' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?category=Bisnis', undefined)

    await api.listPublicPosts({ q: 'a', category: 'Umum' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?q=a&category=Umum', undefined)

    await api.getPublicPost('hello world')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts/hello%20world', undefined)
  })

  it('author endpoints', async () => {
    await api.listMyPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts', undefined)
    await api.getMyStats()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/stats', undefined)
    await api.getMyPost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', undefined)
    await api.createPost({ a: 1 })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts', { method: 'POST', body: { a: 1 } })
    await api.updatePost(3, { a: 2 })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'PUT', body: { a: 2 } })
    await api.togglePublish(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH' })
    await api.deletePost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'DELETE' })
    await api.aiGenerate({ topic: 't' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/ai-generate', { method: 'POST', body: { topic: 't' } })
  })
})
