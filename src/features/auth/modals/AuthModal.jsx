import { IconX } from '@tabler/icons-react'
import { AuthForm } from '../components/AuthPage'

/** Modal popup login (input wajib: login-username, login-password, login-submit). */
export default function AuthModal({ open, onClose, onSuccess, onNavigate }) {
  if (!open) return null

  const goRegister = () => {
    onClose()
    onNavigate('/register')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Masuk">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Masuk</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        <div className="p-6">
          <AuthForm mode="login" onSuccess={onSuccess} onNavigate={onNavigate} />
          <p className="mt-4 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <button type="button" className="font-semibold text-accent" onClick={goRegister}>
              Daftar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
