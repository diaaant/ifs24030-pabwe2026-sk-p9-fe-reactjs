import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, clearSession, getToken, getUser, setSession } from './apiHelper'

const mockFetch = (status, payload, { jsonFails = false } = {}) => {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jsonFails ? () => Promise.reject(new Error('bad json')) : () => Promise.resolve(payload),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('session storage', () => {
  it('stores, reads and clears token and user', () => {
    setSession('tok', { id: 1, username: 'a' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ id: 1, username: 'a' })

    clearSession()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('returns null for corrupted user JSON', () => {
    localStorage.setItem('delcom_user', '{broken')
    expect(getUser()).toBeNull()
  })
})

describe('apiRequest', () => {
  it('GETs without auth header or body by default', async () => {
    const fetchMock = mockFetch(200, { status: 'success', data: [1] })

    const result = await apiRequest('/api/x')

    expect(result.data).toEqual([1])
    const [path, init] = fetchMock.mock.calls[0]
    expect(path).toBe('/api/x')
    expect(init.method).toBe('GET')
    expect(init.headers.Authorization).toBeUndefined()
    expect(init.body).toBeUndefined()
  })

  it('sends bearer token and JSON body', async () => {
    setSession('tok', { id: 1 })
    const fetchMock = mockFetch(201, { status: 'success' })

    await apiRequest('/api/x', { method: 'POST', body: { a: 1 } })

    const init = fetchMock.mock.calls[0][1]
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"a":1}')
  })

  it('throws server message and status on failure', async () => {
    mockFetch(404, { status: 'fail', message: 'Tidak ada' })

    await expect(apiRequest('/api/x')).rejects.toMatchObject({ message: 'Tidak ada', status: 404 })
  })

  it('throws when HTTP is ok but payload status is not success', async () => {
    mockFetch(200, { status: 'fail', message: 'Ditolak' })

    await expect(apiRequest('/api/x')).rejects.toThrow('Ditolak')
  })

  it('uses a fallback message when the body is not JSON', async () => {
    mockFetch(500, null, { jsonFails: true })

    await expect(apiRequest('/api/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('clears the session on 401', async () => {
    setSession('tok', { id: 1 })
    mockFetch(401, { status: 'fail', message: 'Expired' })

    await expect(apiRequest('/api/x')).rejects.toThrow('Expired')
    expect(getToken()).toBeNull()
  })
})
