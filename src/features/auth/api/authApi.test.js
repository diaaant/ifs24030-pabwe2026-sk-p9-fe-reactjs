import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../helpers/apiHelper', () => ({
  apiRequest: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}))

import { apiRequest, clearSession, setSession } from '../../../helpers/apiHelper'
import { getProfile, login, logout, register, updateProfile } from './authApi'

beforeEach(() => vi.clearAllMocks())

describe('authApi', () => {
  it('login stores the session and returns the user', async () => {
    apiRequest.mockResolvedValue({ data: { token: 'tok', user: { id: 1 } } })

    const user = await login('bob', 'pw')

    expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { username: 'bob', password: 'pw' } })
    expect(setSession).toHaveBeenCalledWith('tok', { id: 1 })
    expect(user).toEqual({ id: 1 })
  })

  it('register posts the payload and returns the created user', async () => {
    apiRequest.mockResolvedValue({ data: { id: 2 } })

    expect(await register('a', 'a@x.com', 'pw')).toEqual({ id: 2 })
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: { username: 'a', email: 'a@x.com', password: 'pw' },
    })
  })

  it('getProfile and updateProfile return data', async () => {
    apiRequest.mockResolvedValue({ data: { username: 'bob' } })

    expect(await getProfile()).toEqual({ username: 'bob' })
    expect(await updateProfile({ username: 'bob2' })).toEqual({ username: 'bob' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/auth/profile', { method: 'PUT', body: { username: 'bob2' } })
  })

  it('logout clears the session after a successful call', async () => {
    apiRequest.mockResolvedValue({ data: null })

    await logout()

    expect(apiRequest).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(clearSession).toHaveBeenCalled()
  })

  it('logout still clears the session when the server call fails', async () => {
    apiRequest.mockRejectedValue(new Error('expired'))

    await expect(logout()).resolves.toBeUndefined()
    expect(clearSession).toHaveBeenCalled()
  })
})
