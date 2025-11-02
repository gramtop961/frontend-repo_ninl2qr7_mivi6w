import { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      localStorage.setItem('cb_token', data.token)
      localStorage.setItem('cb_user', JSON.stringify(data.user))
      onAuth(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2 text-center">Cashbook Pro</h1>
        <p className="text-slate-500 mb-6 text-center">Sign {mode === 'login' ? 'in' : 'up'} to manage your books</p>
        <div className="flex mb-4 bg-slate-100 rounded-lg overflow-hidden">
          <button className={`flex-1 py-2 ${mode==='login'?'bg-white shadow text-slate-900':'text-slate-600'}`} onClick={()=>setMode('login')}>Login</button>
          <button className={`flex-1 py-2 ${mode==='register'?'bg-white shadow text-slate-900':'text-slate-600'}`} onClick={()=>setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" required/>
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" required/>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" required/>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 disabled:opacity-50">{loading? 'Please wait...' : (mode==='login'?'Login':'Create account')}</button>
        </form>
      </div>
    </div>
  )
}
