import { apiRequest, clearSession, setSession } from '../../../helpers/apiHelper'

export async function login(username, password) {
  const { data } = await apiRequest('/api/auth/login', { method: 'POST', body: { username, password } })
  setSession(data.token, data.user)
  return data.user
}

export async function register(username, email, password) {
  const { data } = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: { username, email, password },
  })
  return data
}

export async function getProfile() {
  const { data } = await apiRequest('/api/auth/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await apiRequest('/api/auth/profile', { method: 'PUT', body: payload })
  return data
}

/** Logout selalu menghapus sesi lokal, meskipun panggilan ke server gagal. */
export async function logout() {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  } catch {
    // token mungkin sudah kedaluwarsa; sesi lokal tetap dibersihkan
  } finally {
    clearSession()
  }
}
