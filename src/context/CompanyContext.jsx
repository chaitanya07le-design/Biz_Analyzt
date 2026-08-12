import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const CompanyContext = createContext(null)

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('biz_company')
    if (stored) {
      setCompany(JSON.parse(stored))
    }
    
    api.getCompanies()
      .then((data) => {
        const mapped = data.map(c => ({
          id: c.CompanyID,
          name: c.Name,
          gstin: c.GSTIN,
          city: c.Address?.split(',')?.[1]?.trim() || c.Address?.split(' ')?.[1] || '',
          type: 'Trading',
          isActive: c.IsActive === 'TRUE',
        }));
        setCompanies(mapped);

        if (!stored && mapped.length > 0) {
          const first = mapped[0];
          setCompany(first);
          localStorage.setItem('biz_company', JSON.stringify(first));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const selectCompany = (comp) => {
    setCompany(comp)
    localStorage.setItem('biz_company', JSON.stringify(comp))
  }

  const clearCompany = () => {
    setCompany(null)
    localStorage.removeItem('biz_company')
  }

  return (
    <CompanyContext.Provider value={{ currentCompany: company, companies, selectCompany, clearCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider')
  }
  return context
}
