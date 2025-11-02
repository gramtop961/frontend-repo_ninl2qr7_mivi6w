import React, { useMemo, useRef } from 'react';
import { Plus, FileSpreadsheet, FileDown, Banknote } from 'lucide-react';

const Cashbook = ({ transactions, onAddTransaction }) => {
  const formRef = useRef(null);
  const reportRef = useRef(null);

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((a, b) => a + Number(b.amount || 0), 0);

    const bankIncome = transactions
      .filter((t) => t.type === 'Income' && t.mode === 'Bank')
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    const bankExpense = transactions
      .filter((t) => t.type === 'Expense' && t.mode === 'Bank')
      .reduce((a, b) => a + Number(b.amount || 0), 0);

    const cashIncome = income - bankIncome;
    const cashExpense = expense - bankExpense;

    return {
      income,
      expense,
      cashBalance: cashIncome - cashExpense,
      bankBalance: bankIncome - bankExpense,
      net: income - expense,
    };
  }, [transactions]);

  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    const payload = {
      date: fd.get('date') || new Date().toISOString().slice(0, 10),
      type: fd.get('type'),
      mode: fd.get('mode'),
      amount: Number(fd.get('amount') || 0),
      party: fd.get('party') || '',
      note: fd.get('note') || '',
    };
    if (!payload.amount || !payload.type) return;
    onAddTransaction(payload);
    formRef.current.reset();
  };

  const downloadCSV = () => {
    const header = ['Date','Type','Mode','Amount','Party','Note'];
    const rows = transactions.map(t => [t.date, t.type, t.mode, t.amount, t.party, t.note]);
    const csv = [header, ...rows].map(r => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashbook-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const content = reportRef.current?.innerHTML || '';
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; padding: 24px; }
        h1 { font-size: 20px; margin: 0 0 16px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f1f5f9; text-align: left; }
      </style>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Cashbook Report</title>${styles}</head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-white">
          <p className="text-xs text-slate-500">Total Income</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">₹{summary.income.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 rounded-xl border bg-white">
          <p className="text-xs text-slate-500">Total Expense</p>
          <p className="text-2xl font-semibold text-rose-600 mt-1">₹{summary.expense.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 rounded-xl border bg-white">
          <p className="text-xs text-slate-500">Cash Balance</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">₹{summary.cashBalance.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 rounded-xl border bg-white">
          <p className="text-xs text-slate-500">Bank Balance</p>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">₹{summary.bankBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Add Entry */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold">Add Entry</h3>
          </div>
        </div>
        <form ref={formRef} onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input name="date" type="date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select name="type" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <select name="mode" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
          <input name="amount" type="number" min="0" step="0.01" placeholder="Amount" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="party" type="text" placeholder="Customer/Supplier" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <div className="md:col-span-6 flex gap-3">
            <input name="note" type="text" placeholder="Note (optional)" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Bank Passbook */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold">Bank Passbook</h3>
          </div>
          <span className="text-xs text-slate-500">Balance: ₹{summary.bankBalance.toLocaleString('en-IN')}</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Party</th>
                <th className="text-left p-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => t.mode === 'Bank').map((t, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.type}</td>
                  <td className={`p-2 ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>₹{Number(t.amount).toLocaleString('en-IN')}</td>
                  <td className="p-2">{t.party}</td>
                  <td className="p-2">{t.note}</td>
                </tr>
              ))}
              {transactions.filter(t => t.mode === 'Bank').length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-slate-500">No bank entries yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Transactions + Report */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Transactions</h3>
          <div className="flex items-center gap-2">
            <button onClick={downloadCSV} className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </button>
            <button onClick={printPDF} className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
              <FileDown className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
        <div ref={reportRef}>
          <h1 className="hidden">Cashbook Report</h1>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Mode</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Party</th>
                  <th className="text-left p-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{t.date}</td>
                    <td className="p-2">{t.type}</td>
                    <td className="p-2">{t.mode}</td>
                    <td className={`p-2 ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>₹{Number(t.amount).toLocaleString('en-IN')}</td>
                    <td className="p-2">{t.party}</td>
                    <td className="p-2">{t.note}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-slate-500">No entries yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cashbook;
