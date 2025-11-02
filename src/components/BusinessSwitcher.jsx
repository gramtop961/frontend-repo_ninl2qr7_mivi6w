import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';

const BusinessSwitcher = ({ businesses, currentId, onAddBusiness, onSwitch }) => {
  const [name, setName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddBusiness(trimmed);
    setName('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold">Businesses</h2>
        </div>
        <span className="text-xs text-slate-500">Switch or add multiple businesses</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {businesses.map((b) => (
          <button
            key={b.id}
            onClick={() => onSwitch(b.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              currentId === b.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
            title={b.name}
          >
            {b.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New business name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>
    </div>
  );
};

export default BusinessSwitcher;
