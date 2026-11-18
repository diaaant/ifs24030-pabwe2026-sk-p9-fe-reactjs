import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }))

import { apiRequest } from '../../../helpers/apiHelper'
import { listPosts, listUserPosts, listUsers } from './adminApi'

beforeEach(() => {
  vi.clearAllMocks()
  apiRequest.mockResolvedValue({ data: [1] })
})

describe('adminApi', () => {
  it('calls the admin endpoints', async () => {
    expect(await listUsers()).toEqual([1])
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users')

    await listPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/posts')

    await listUserPosts(4)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users/4/posts')
  })
})
