import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function ExecutiveCharts({ stats }) {
  const [metric, setMetric] = useState('units');

  if (!stats) return null;

  const territoryData = stats.territory_breakdown || [];
  const monthlyTrend = stats.monthly_trend || [];
  const storeTypes = stats.store_types || [];

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Territory Active vs Quiet Distribution */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Territory Beat Distribution ({territoryData.length} Markets)
            </h4>
            <p className="text-[11px] text-slate-400">Comparing Active Accounts vs Quiet Dormancy across Tamil Nadu</p>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 self-start sm:self-auto">
            Live DB Sync
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={territoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis 
                dataKey="territory" 
                angle={-35} 
                textAnchor="end" 
                interval={0} 
                stroke="#64748b" 
                tick={{ fontSize: 10 }} 
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="active" name="Active Billing" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quiet" name="Quiet Churn" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Dynamic 6-Month Volume / Revenue Run Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Statewide Run-Rate (6-Month Trend)
              </h4>
              <p className="text-[11px] text-slate-400">Tracking aggregate sales across 820 counters</p>
            </div>

            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setMetric('units')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${metric === 'units' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                Units
              </button>
              <button
                onClick={() => setMetric('revenue_cr')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${metric === 'revenue_cr' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                ₹ Cr
              </button>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDyn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(val) => metric === 'revenue_cr' ? `₹${val} Cr` : `${val} Units`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={metric} 
                  name={metric === 'revenue_cr' ? 'Gross Revenue' : 'Volume Sold'}
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorDyn)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Dynamic Store Tier Mix */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
              Live Outlet Classification (820 Counters)
            </h4>
            <p className="text-[11px] text-slate-400 mb-2">Checklists customized per tier</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storeTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {storeTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            {storeTypes.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}