import { useEffect, useState } from 'react'
import { Plus, Building2, Wallet } from 'lucide-react'
import EntitiesPanel from './EntitiesPanel'
import CashbookView from './CashbookView'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuthedFetch(token) {
  return async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(data.detail || 'Request failed')
    return data
  }
}

export default function Dashboard({ token, user, onLogout }) {
  const authedFetch = useAuthedFetch(token)
  const [businesses, setBusinesses] = useState([])
  const [bizName, setBizName] = useState('')
  const [gstin, setGstin] = useState('')
  const [address, setAddress] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)

  const [cashbooks, setCashbooks] = useState([])
  const [cbName, setCbName] = useState('')
  const [cbMode, setCbMode] = useState('cash')
  const [cbOpening, setCbOpening] = useState(0)
  const [selectedCashbook, setSelectedCashbook] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const list = await authedFetch('/businesses')
        setBusinesses(list)
        if (list[0]) {
          setSelectedBusiness(list[0])
        }
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!selectedBusiness) return
      try {
        const list = await authedFetch(`/businesses/${selectedBusiness._id}/cashbooks`)
        setCashbooks(list)
        if (list[0]) setSelectedCashbook(list[0])
      } catch (e) { console.error(e) }
    })()
  }, [selectedBusiness])

  const createBusiness = async (e) => {
    e.preventDefault()
    const b = await authedFetch('/businesses', { method: 'POST', body: JSON.stringify({ name: bizName, gstin, address }) })
    setBusinesses([b, ...businesses])
    setBizName(''); setGstin(''); setAddress('')
    setSelectedBusiness(b)
  }

  const createCashbook = async (e) => {
    e.preventDefault()
    if (!selectedBusiness) return
    const cb = await authedFetch(`/businesses/${selectedBusiness._id}/cashbooks`, { method: 'POST', body: JSON.stringify({ name: cbName, default_mode: cbMode, opening_balance: Number(cbOpening)||0 }) })
    setCashbooks([cb, ...cashbooks])
    setCbName(''); setCbOpening(0); setCbMode('cash')
    setSelectedCashbook(cb)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-slate-700"/>
          <h1 className="font-semibold text-slate-800">Cashbook Pro</h1>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user?.name}</span>
            <button onClick={onLogout} className="px-3 py-1 rounded-md border hover:bg-slate-100">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4"/>
              <h2 className="font-medium">Businesses</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {businesses.map(b => (
                <button key={b._id} onClick={()=>setSelectedBusiness(b)} className={`w-full text-left px-3 py-2 rounded-md ${selectedBusiness?._id===b._id?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>{b.name}</button>
              ))}
              {!businesses.length && <p className="text-sm text-slate-500">No businesses yet</p>}
            </div>
            <form onSubmit={createBusiness} className="mt-4 space-y-2">
              <input className="w-full border rounded-md px-3 py-2" placeholder="New business name" value={bizName} onChange={e=>setBizName(e.target.value)} required/>
              <input className="w-full border rounded-md px-3 py-2" placeholder="GSTIN (optional)" value={gstin} onChange={e=>setGstin(e.target.value)}/>
              <input className="w-full border rounded-md px-3 py-2" placeholder="Address (optional)" value={address} onChange={e=>setAddress(e.target.value)}/>
              <button className="w-full bg-slate-900 text-white py-2 rounded-md">Add Business</button>
            </form>
          </div>

          {!!selectedBusiness && (
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4"/>
                <h2 className="font-medium">Cashbooks</h2>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {cashbooks.map(cb => (
                  <button key={cb._id} onClick={()=>setSelectedCashbook(cb)} className={`w-full text-left px-3 py-2 rounded-md ${selectedCashbook?._id===cb._id?'bg-slate-900 text-white':'hover:bg-slate-100'}`}>{cb.name}</button>
                ))}
                {!cashbooks.length && <p className="text-sm text-slate-500">No cashbooks yet</p>}
              </div>
              <form onSubmit={createCashbook} className="mt-4 space-y-2">
                <input className="w-full border rounded-md px-3 py-2" placeholder="New cashbook name" value={cbName} onChange={e=>setCbName(e.target.value)} required/>
                <div className="flex gap-2">
                  <select className="flex-1 border rounded-md px-3 py-2" value={cbMode} onChange={e=>setCbMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="upi">UPI</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                  </select>
                  <input className="w-32 border rounded-md px-3 py-2" type="number" step="0.01" placeholder="Opening" value={cbOpening} onChange={e=>setCbOpening(e.target.value)} />
                </div>
                <button className="w-full bg-slate-900 text-white py-2 rounded-md">Add Cashbook</button>
              </form>
            </div>
          )}
        </aside>

        <section className="md:col-span-3 space-y-4">
          {selectedBusiness && <EntitiesPanel token={token} business={selectedBusiness} />}
          {selectedCashbook && <CashbookView token={token} business={selectedBusiness} cashbook={selectedCashbook} />}
        </section>
      </main>
    </div>
  )
}
