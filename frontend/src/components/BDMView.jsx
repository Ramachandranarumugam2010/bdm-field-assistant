import React from 'react';
import { Search, Building2, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';

export default function BdmBeatView({
  territory,
  beat,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onSelectCounter
}) {
  const quietCount = beat.filter(b => b.status === 'Quiet Account').length;
  const activeCount = beat.filter(b => b.status === 'Active').length;

  const filteredBeat = beat.filter(item => {
    const match = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (item.owner && item.owner.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter === 'quiet') return match && item.status === 'Quiet Account';
    if (statusFilter === 'active') return match && item.status === 'Active';
    return match;
  });

  return (
    <div className="space-y-6">
      {/* 1. KPI Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-500/10' 
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>{territory} Beat Total</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{beat.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Retail counters assigned</p>
        </div>

        <div 
          onClick={() => setStatusFilter('quiet')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'quiet' 
              ? 'bg-rose-950/50 border-rose-500 shadow-lg shadow-rose-950/40' 
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
          <div className="flex justify-between items-center text-rose-400 text-xs font-bold uppercase">
            <span>Quiet Churn Accounts</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{quietCount}</div>
          <p className="text-[11px] text-rose-300 mt-1">Requires immediate visit priority</p>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'active' 
              ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-950/40' 
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
          <div className="flex justify-between items-center text-emerald-400 text-xs font-bold uppercase">
            <span>Active Billing Accounts</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{activeCount}</div>
          <p className="text-[11px] text-emerald-300 mt-1">Regular run-rate reorders</p>
        </div>
      </div>

      {/* 2. Fast Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search counter by shop name, code (e.g. OA0099), or owner name..."
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* 3. Beat List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeat.map((c) => (
          <div
            key={c.code}
            onClick={() => onSelectCounter(c.code)}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/70 hover:bg-slate-800/50 transition cursor-pointer flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {c.code}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  c.status === 'Active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {c.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
                {c.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {c.type} • {c.owner || 'Owner'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Run-rate: <strong className="text-slate-200">{c.last_units} Units</strong> (₹{(c.last_val / 100000).toFixed(1)}L)
              </span>
              <span className="text-blue-400 font-bold group-hover:underline flex items-center gap-0.5">
                Counter Dossier <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}