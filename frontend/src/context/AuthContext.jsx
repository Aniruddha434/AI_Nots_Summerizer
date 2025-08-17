import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth:user')
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('auth:token'))

  useEffect(() => {
    if (user) localStorage.setItem('auth:user', JSON.stringify(user))
    else localStorage.removeItem('auth:user')
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem('auth:token', token)
    else localStorage.removeItem('auth:token')
  }, [token])

  const login = (data) => {
    setUser(data.user)
    setToken(data.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

