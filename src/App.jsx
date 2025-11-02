import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import BusinessSwitcher from './components/BusinessSwitcher';
import Cashbook from './components/Cashbook';
import StaffManager from './components/StaffManager';

const uid = () => Math.random().toString(36).slice(2, 9);

function App() {
  const [businesses, setBusinesses] = useState(() => {
    const saved = localStorage.getItem('cb_businesses');
    if (saved) return JSON.parse(saved);
    return [{ id: 'default', name: 'My Business' }];
  });
  const [currentId, setCurrentId] = useState(() => {
    return localStorage.getItem('cb_currentId') || 'default';
  });
  const [transactionsMap, setTransactionsMap] = useState(() => {
    const saved = localStorage.getItem('cb_transactions');
    return saved ? JSON.parse(saved) : { default: [] };
  });
  const [staffMap, setStaffMap] = useState(() => {
    const saved = localStorage.getItem('cb_staff');
    return saved ? JSON.parse(saved) : { default: [] };
  });

  useEffect(() => {
    localStorage.setItem('cb_businesses', JSON.stringify(businesses));
  }, [businesses]);
  useEffect(() => {
    localStorage.setItem('cb_currentId', currentId);
  }, [currentId]);
  useEffect(() => {
    localStorage.setItem('cb_transactions', JSON.stringify(transactionsMap));
  }, [transactionsMap]);
  useEffect(() => {
    localStorage.setItem('cb_staff', JSON.stringify(staffMap));
  }, [staffMap]);

  const currentTransactions = useMemo(() => transactionsMap[currentId] || [], [transactionsMap, currentId]);
  const currentStaff = useMemo(() => staffMap[currentId] || [], [staffMap, currentId]);

  const handleAddBusiness = (name) => {
    const id = uid();
    const newBiz = { id, name };
    setBusinesses((prev) => [...prev, newBiz]);
    setTransactionsMap((prev) => ({ ...prev, [id]: [] }));
    setStaffMap((prev) => ({ ...prev, [id]: [] }));
    setCurrentId(id);
  };

  const handleSwitchBusiness = (id) => setCurrentId(id);

  const handleAddTransaction = (tx) => {
    setTransactionsMap((prev) => ({
      ...prev,
      [currentId]: [{ ...tx, id: uid() }, ...(prev[currentId] || [])],
    }));
  };

  const handleAddStaff = (member) => {
    setStaffMap((prev) => ({
      ...prev,
      [currentId]: [...(prev[currentId] || []), { ...member, id: uid() }],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <BusinessSwitcher
          businesses={businesses}
          currentId={currentId}
          onAddBusiness={handleAddBusiness}
          onSwitch={handleSwitchBusiness}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Cashbook
              transactions={currentTransactions}
              onAddTransaction={handleAddTransaction}
            />
          </div>
          <div className="lg:col-span-1">
            <StaffManager staff={currentStaff} onAddStaff={handleAddStaff} />
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Tip: Use the business pills above to set up multiple businesses. Add entries as Income or Expense, choose Cash or Bank to keep your passbook in sync, and download CSV/PDF reports anytime.
        </p>
      </main>
    </div>
  );
}

export default App;
