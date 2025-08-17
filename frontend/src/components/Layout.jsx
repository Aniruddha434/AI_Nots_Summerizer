import { Link, useLocation } from 'react-router-dom'
import { FileText, History, Brain } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: Brain, current: location.pathname === '/' },
    { name: 'History', href: '/history', icon: History, current: location.pathname === '/history' },
  ]

  // Check if current page is an auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  // For auth pages, return minimal layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // Regular layout for other pages
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="transition-transform hover:scale-105">
                  <Logo />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        item.current
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">Hi, {user.name}</span>
                  <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">Login</Link>
                  <Link to="/signup" className="text-sm text-primary-600">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 TextSummarizer. Powered by AI.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
