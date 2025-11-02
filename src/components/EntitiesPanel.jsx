import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function EntitiesPanel({ token, business }){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('income')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffRole, setStaffRole] = useState('staff')
  const [staff, setStaff] = useState([])

  const fetcher = async (path, options={}) => {
    const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` } })
    const data = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(data.detail || 'Request failed')
    return data
  }

  useEffect(()=>{
    (async()=>{
      try {
        const cats = await fetcher(`/businesses/${business._id}/categories`)
        setCategories(cats)
        const st = await fetcher(`/businesses/${business._id}/staff`)
        setStaff(st)
      } catch (e) { console.error(e) }
    })()
  }, [business._id])

  const addCategory = async (e) => {
    e.preventDefault()
    const cat = await fetcher(`/businesses/${business._id}/categories`, { method:'POST', body: JSON.stringify({ name, type }) })
    setCategories([cat, ...categories]); setName(''); setType('income')
  }

  const addStaff = async (e) => {
    e.preventDefault()
    const mem = await fetcher(`/businesses/${business._id}/staff`, { method:'POST', body: JSON.stringify({ email: staffEmail, role: staffRole }) })
    setStaff([mem, ...staff]); setStaffEmail(''); setStaffRole('staff')
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">{business.name} • Settings</h2>
        <Settings className="w-4 h-4 text-slate-500"/>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Categories</h3>
          <form onSubmit={addCategory} className="flex gap-2 mb-3">
            <input className="flex-1 border rounded-md px-3 py-2" placeholder="Category name" value={name} onChange={e=>setName(e.target.value)} required/>
            <select className="border rounded-md px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button className="bg-slate-900 text-white px-3 rounded-md">Add</button>
          </form>
          <ul className="space-y-1 max-h-40 overflow-auto">
            {categories.map(c => (
              <li key={c._id} className="text-sm px-3 py-2 border rounded-md flex items-center justify-between">
                <span>{c.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${c.type==='income'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{c.type}</span>
              </li>
            ))}
            {!categories.length && <p className="text-sm text-slate-500">No categories yet</p>}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Team</h3>
          <form onSubmit={addStaff} className="flex gap-2 mb-3">
            <input className="flex-1 border rounded-md px-3 py-2" placeholder="Invite by email (must be registered)" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} required/>
            <select className="border rounded-md px-3 py-2" value={staffRole} onChange={e=>setStaffRole(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
            <button className="bg-slate-900 text-white px-3 rounded-md">Add</button>
          </form>
          <ul className="space-y-1 max-h-40 overflow-auto">
            {staff.map(s => (
              <li key={s._id} className="text-sm px-3 py-2 border rounded-md flex items-center justify-between">
                <span>{s.email || s.user_id}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{s.role}</span>
              </li>
            ))}
            {!staff.length && <p className="text-sm text-slate-500">No team members</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}
