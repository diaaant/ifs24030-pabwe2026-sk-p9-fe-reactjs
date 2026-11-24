const TOKEN_KEY = 'delcom_token'
const USER_KEY = 'delcom_user'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Pembungkus fetch: menyuntikkan Bearer token, mengirim body JSON, dan
 * mengurai respons standar {status, message, data}. Melempar Error
 * (dengan properti `status`) jika respons bukan sukses.
 */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const init = { method, headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init)

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = {}
  }

  if (!response.ok || payload.status !== 'success') {
    if (response.status === 401) clearSession()
    const error = new Error(payload.message || 'Terjadi kesalahan pada server')
    error.status = response.status
    throw error
  }
  return payload
}