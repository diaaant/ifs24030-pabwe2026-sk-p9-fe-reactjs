import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { showSuccessAlert } from '../../../helpers/toolsHelper'
import { login, register } from '../api/authApi'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/** Form login / registrasi yang dipakai oleh AuthPage dan AuthModal. */
export function AuthForm({ mode, onSuccess, onNavigate }) {
  const isLogin = mode === 'login'
  const prefix = isLogin ? 'login' : 'register'
  const [username, onUsername] = useInput()
  const [email, onEmail] = useInput()
  const [password, onPassword] = useInput()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        onSuccess(await login(username, password))
      } else {
        await register(username, email, password)
        await showSuccessAlert('Registrasi berhasil, silakan login')
        onNavigate('/login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={`${prefix}-username`} className="mb-1 block text-sm font-medium">
          Username
        </label>
        <input id={`${prefix}-username`} className={inputClass} value={username} onChange={onUsername} autoComplete="username" />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="register-email" type="email" className={inputClass} value={email} onChange={onEmail} autoComplete="email" />
        </div>
      )}
      <div>
        <label htmlFor={`${prefix}-password`} className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id={`${prefix}-password`}
          type="password"
          className={inputClass}
          value={password}
          onChange={onPassword}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
      </div>
      <button id={`${prefix}-submit`} type="submit" disabled={loading} className="btn-accent w-full rounded-lg px-4 py-2 text-sm font-semibold">
        {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
      </button>
    </form>
  )
}

/** Halaman autentikasi mandiri (/login dan /register). */
export default function AuthPage({ mode, onSuccess, onNavigate }) {
  const isLogin = mode === 'login'

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-6 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Buat Akun Penulis'}</h1>
      <AuthForm mode={mode} onSuccess={onSuccess} onNavigate={onNavigate} />
      <p className="mt-6 text-center text-sm text-slate-500">
        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <button type="button" className="font-semibold text-accent" onClick={() => onNavigate(isLogin ? '/register' : '/login')}>
          {isLogin ? 'Daftar' : 'Masuk'}
        </button>
      </p>
    </div>
  )
}
