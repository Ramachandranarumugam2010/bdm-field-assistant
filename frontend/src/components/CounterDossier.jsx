import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CounterDossier({
  counterData,
  checks,
  remarks,
  setRemarks,
  onToggleCheck,
  onCompleteVisit,
  onBack
}) {
  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalTasks = counterData.checklist.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Beat Overview
      </button>

      {/* Profile Dossier Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {counterData.outlet.outlet_code}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{counterData.outlet.outlet_name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {counterData.outlet.outlet_type} • {counterData.outlet.town}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credit Terms</span>
            <span className="text-sm font-bold text-slate-200">{counterData.outlet.credit_days}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Owner Contact</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{counterData.outlet.owner_name}</span>
            <span className="text-slate-400 block">{counterData.outlet.phone}</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Health</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">{counterData.outlet.status}</span>
            <span className="text-slate-400 block">Territory: {counterData.outlet.town}</span>
          </div>
        </div>

        {/* 6-Month Volume Run Rate */}
        <div className="mt-5 pt-4 border-t border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            6-Month iPhone Volume Run Rate (Units)
          </span>
          <div className="flex items-end justify-between gap-2 h-20 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            {counterData.billing_history.length > 0 ? (
              counterData.billing_history.map((b) => (
                <div key={b.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md transition-all"
                    style={{ height: `${Math.min(100, Math.max(15, b.units * 4))}%` }}
                    title={`${b.month}: ${b.units} units`}
                  />
                  <span className="text-[9px] text-slate-400">{b.month.split('-')[1]}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 text-center w-full my-auto">
                Zero billing history (Dormant Account)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5-Point Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            5-Point Action Checklist ({counterData.outlet.outlet_type})
          </h3>
          <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-500/20">
            {completedCount}/{totalTasks} Completed
          </span>
        </div>

        <div className="space-y-3">
          {counterData.checklist.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition cursor-pointer ${
                checks[item.id]
                  ? 'bg-blue-950/30 border-blue-500/40 text-slate-300'
                  : 'bg-slate-800/40 border-slate-800 text-slate-200 hover:bg-slate-800/70'
              }`}>
              <input
                type="checkbox"
                checked={!!checks[item.id]}
                onChange={() => onToggleCheck(item.id)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 w-4 h-4"
              />
              <span className={`text-xs leading-relaxed ${checks[item.id] ? 'line-through text-slate-400' : 'font-medium'}`}>
                {item.task}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
            Agreed Retailer Action & Next Order Commit
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Owner cleared ₹1.5L overdue payment; committed to 8 units iPhone 15 upon Friday delivery..."
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={onCompleteVisit}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Complete & Verify Visit
        </button>
      </div>
    </div>
  );
}