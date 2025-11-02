import React from 'react';
import { Wallet, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">CashBook Pro</h1>
            <p className="text-xs text-slate-500">Simple bookkeeping for Indian businesses</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
