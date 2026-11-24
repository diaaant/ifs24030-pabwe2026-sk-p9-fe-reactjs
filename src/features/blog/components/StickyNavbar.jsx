import { useState } from 'react'
import { IconMenu2, IconMoon, IconPencil, IconSun, IconX } from '@tabler/icons-react'

function NavLink({ path, current, onNavigate, children }) {
  return (
    <a
      href={path}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(path)
      }}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        current === path ? 'bg-accent-soft text-accent' : 'text-slate-600 hover:text-accent dark:text-slate-300'
      }`}
    >
      {children}
    </a>
  )
}

/** Navbar atas sticky (tanpa sidebar) dengan menu hamburger untuk mobile. */
export default function StickyNavbar({ user, theme, currentPath, onNavigate, onToggleTheme, onLogin, onLogout }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-8">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/')
          }}
          className="flex items-center gap-2 text-lg font-bold text-accent"
        >
          <IconPencil size={22} /> Delcom Blog
        </a>

        <nav
          aria-label="Navigasi utama"
          className={`${open ? 'flex' : 'hidden'} order-last w-full flex-col gap-1 md:order-none md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-end`}
        >
          <NavLink path="/" current={currentPath} onNavigate={onNavigate}>
            Beranda
          </NavLink>
          {user && (
            <NavLink path="/author" current={currentPath} onNavigate={onNavigate}>
              Workspace
            </NavLink>
          )}
          {user && user.role === 'admin' && (
            <NavLink path="/admin" current={currentPath} onNavigate={onNavigate}>
              Admin
            </NavLink>
          )}
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400"
            >
              Keluar ({user.username})
            </button>
          ) : (
            <>
              <button type="button" onClick={onLogin} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                Masuk
              </button>
              <NavLink path="/register" current={currentPath} onNavigate={onNavigate}>
                Daftar
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <button type="button" aria-label="Ganti tema" onClick={onToggleTheme} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
          <button type="button" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-slate-600 md:hidden dark:text-slate-300">
            {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}