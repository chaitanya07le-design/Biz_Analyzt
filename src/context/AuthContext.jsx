import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// NOTE: Placeholder for the deployed W-Validate-Token webhook URL.
// Replace this value after publishing the workflow in Pucho Studio.
const VALIDATE_TOKEN_WEBHOOK = 'https://studio.pucho.ai/api/v1/webhooks/Onp1HprhM9TiiDSRXfaDL';

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

  // Standard password login
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

  /**
   * Magic-link login. Calls W-Validate-Token to check the token server-side
   * before creating any session. The session data (email, role, companyId)
   * comes entirely from the workflow response — nothing is read from the URL.
   */
  const loginWithToken = async (token) => {
    try {
      const res = await fetch(VALIDATE_TOKEN_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        return { success: false, error: 'Validation service unavailable. Please try again later.' }
      }

      const data = await res.json()

      if (!data.valid) {
        return {
          success: false,
          error: data.reason || 'This invitation link is invalid or has been revoked.',
        }
      }

      // Build the user session from workflow response only — not from URL params
      const invitedUser = {
        id: `invited_${data.email}`,
        email: data.email,
        name: data.email.split('@')[0],
        role: data.role,
        companyId: data.companyId,
        loginMethod: 'magic_link',
      }

      setUser(invitedUser)
      localStorage.setItem('biz_user', JSON.stringify(invitedUser))

      // Pre-select the company from the invitation so CompanySelection is skipped
      if (data.companyId) {
        localStorage.setItem('biz_company_id', data.companyId)
      }

      return { success: true, companyId: data.companyId }
    } catch (err) {
      console.error('[AuthContext] loginWithToken error:', err)
      return { success: false, error: 'Unable to validate invitation. Check your connection and try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('biz_user')
    localStorage.removeItem('biz_company')
    localStorage.removeItem('biz_company_id')
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, logout, loading }}>
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
