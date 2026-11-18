import { useCallback, useEffect, useState } from 'react'
import { getUser } from './helpers/apiHelper'
import useTheme from './hooks/useTheme'
import AdminDashboard from './features/admin/components/AdminDashboard'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import PublicArticleList from './features/blog/components/PublicArticleList'
import StickyNavbar from './features/blog/components/StickyNavbar'

const parseRoute = (path) => {
  if (path === '/' || path === '/public') return { name: 'home' }
  if (path.startsWith('/posts/')) {
    return { name: 'post', slug: decodeURIComponent(path.slice('/posts/'.length)) }
  }
  if (['/author', '/admin', '/login', '/register'].includes(path)) return { name: path.slice(1) }
  return { name: 'notfound' }
}

const redirectFor = (route, user) => {
  if ((route.name === 'author' || route.name === 'admin') && !user) return '/login'
  if (route.name === 'admin' && user.role !== 'admin') return '/'
  if ((route.name === 'login' || route.name === 'register') && user) return '/author'
  return null
}

/** Orkestrator SPA: routing berbasis path + popstate, navbar, sesi login. */
export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(getUser)
  const [path, setPath] = useState(() => window.location.pathname)
  const [loginOpen, setLoginOpen] = useState(false)

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (replace) window.history.replaceState(null, '', to)
    else window.history.pushState(null, '', to)
    setPath(to)
  }, [])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const route = parseRoute(path)
  const redirect = redirectFor(route, user)

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect, navigate])

  const handleAuthSuccess = (loggedIn) => {
    setUser(loggedIn)
    setLoginOpen(false)
    navigate('/author')
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/')
  }

  const dark = theme === 'dark'
  let page = null
  if (!redirect) {
    switch (route.name) {
      case 'home':
        page = <PublicArticleList onNavigate={navigate} />
        break
      case 'post':
        page = <PublicArticleDetail slug={route.slug} dark={dark} onNavigate={navigate} />
        break
      case 'author':
        page = <AuthorDashboard dark={dark} onNavigate={navigate} />
        break
      case 'admin':
        page = <AdminDashboard />
        break
      case 'login':
      case 'register':
        page = <AuthPage mode={route.name} onSuccess={handleAuthSuccess} onNavigate={navigate} />
        break
      default:
        page = (
          <div className="mx-auto mt-16 max-w-md text-center">
            <h1 className="text-3xl font-bold">404</h1>
            <p className="mt-2 text-slate-500">Halaman tidak ditemukan.</p>
            <button type="button" className="mt-4 font-semibold text-accent" onClick={() => navigate('/')}>
              Kembali ke beranda
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <StickyNavbar
        user={user}
        theme={theme}
        currentPath={path}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />
      <main>{page}</main>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleAuthSuccess} onNavigate={navigate} />
    </div>
  )
}
