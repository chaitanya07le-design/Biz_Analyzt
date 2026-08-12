import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  { id: '1', email: 'demo@bizanalyzt.com', password: 'demo123', name: 'Demo User' },
  { id: '2', email: 'admin@bizanalyzt.com', password: 'admin123', name: 'Admin User' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('biz_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...userWithoutPassword } = found
      setUser(userWithoutPassword)
      localStorage.setItem('biz_user', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('biz_user')
    localStorage.removeItem('biz_company')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
