import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import InfoBar from './components/InfoBar'
import Footer from './components/Footer'

function App() {
  const [token, setToken] = useState(localStorage.getItem('cb_token') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cb_user')) } catch { return null }
  })

  const handleAuth = (t, u) => {
    setToken(t); setUser(u)
  }

  const logout = () => {
    const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
    fetch(`${API}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).finally(()=>{
      localStorage.removeItem('cb_token'); localStorage.removeItem('cb_user')
      setToken(''); setUser(null)
    })
  }

  useEffect(()=>{
    if (token && user) {
      localStorage.setItem('cb_token', token)
      localStorage.setItem('cb_user', JSON.stringify(user))
    }
  }, [token, user])

  return (
    <div className="min-h-screen flex flex-col">
      <InfoBar />
      <div className="flex-1">
        {!token ? <Auth onAuth={handleAuth} /> : <Dashboard token={token} user={user} onLogout={logout} />}
      </div>
      <Footer />
    </div>
  )
}

export default App
