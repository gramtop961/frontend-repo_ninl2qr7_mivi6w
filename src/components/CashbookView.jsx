import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function CashbookView({ token, business, cashbook }){
  const [transactions, setTransactions] = useState([])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('cash')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [categories, setCategories] = useState([])

  const fetcher = async (path, options={}) => {
    const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` } })
    const data = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(data.detail || 'Request failed')
    return data
  }

  useEffect(()=>{
    (async()=>{
      try{
        const tx = await fetcher(`/cashbooks/${cashbook._id}/transactions`)
        setTransactions(tx)
        const cats = await fetcher(`/businesses/${business._id}/categories`)
        setCategories(cats)
      } catch(e){ console.error(e)}
    })()
  }, [cashbook._id, business._id])

  const addTx = async (e) => {
    e.preventDefault()
    const payload = { date: new Date(date).toISOString(), type, amount: parseFloat(amount), mode, category_id: categoryId || null, notes }
    await fetcher(`/cashbooks/${cashbook._id}/transactions`, { method:'POST', body: JSON.stringify(payload) })
    const tx = await fetcher(`/cashbooks/${cashbook._id}/transactions`)
    setTransactions(tx)
    setAmount(''); setNotes('')
  }

  const balance = transactions.reduce((acc, t)=> acc + (t.type==='income'? t.amount : -t.amount), cashbook.opening_balance || 0)

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">{cashbook.name}</h2>
        <div className="text-sm text-slate-600">Balance: <span className="font-semibold text-slate-900">₹{balance.toFixed(2)}</span></div>
      </div>
      <form onSubmit={addTx} className="grid md:grid-cols-6 gap-2 mb-4">
        <input type="date" className="border rounded-md px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} required/>
        <select className="border rounded-md px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="number" step="0.01" className="border rounded-md px-3 py-2" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} required/>
        <select className="border rounded-md px-3 py-2" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="upi">UPI</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
        </select>
        <select className="border rounded-md px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
          <option value="">No Category</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input className="border rounded-md px-3 py-2" placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)}/>
        <button className="md:col-span-6 bg-slate-900 text-white py-2 rounded-md">Add Entry</button>
      </form>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Mode</th>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-left px-3 py-2">Amount</th>
              <th className="text-left px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t._id} className="border-b">
                <td className="px-3 py-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{t.type}</td>
                <td className="px-3 py-2">{t.mode}</td>
                <td className="px-3 py-2">{(categories.find(c=>c._id===t.category_id)?.name) || '-'}</td>
                <td className={`px-3 py-2 ${t.type==='income'?'text-green-700':'text-red-700'}`}>₹{t.amount.toFixed(2)}</td>
                <td className="px-3 py-2">{t.notes || ''}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr><td colSpan="6" className="px-3 py-6 text-center text-slate-500">No transactions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
