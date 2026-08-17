import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  ArrowUpDown, 
  Search, 
  Filter,
  Download,
  Printer,
  ChevronRight
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import ClusterModal from './ClusterModal';

export default function AdminDashboard({ auditStats, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('density');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);

  if (!auditStats) return null;

  const churnRate = ((auditStats.quiet_counters / auditStats.total_outlets) * 100).toFixed(1);

  const sortedTerritories = useMemo(() => {
    if (!auditStats.territory_breakdown) return [];

    let list = auditStats.territory_breakdown.map(t => ({
      ...t,
      density: t.total > 0 ? (t.quiet / t.total) * 100 : 0
    }));

    if (searchTerm.trim()) {
      list = list.filter(t => 
        t.territory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'density') comparison = a.density - b.density;
      else if (sortBy === 'quiet') comparison = a.quiet - b.quiet;
      else if (sortBy === 'active') comparison = a.active - b.active;
      else if (sortBy === 'total') comparison = a.total - b.total;
      else if (sortBy === 'name') comparison = a.territory.localeCompare(b.territory);

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [auditStats.territory_breakdown, searchTerm, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleExportTerritoryCSV = () => {
    const headers = {
      territory: 'Territory Name',
      total: 'Total Retail Universe',
      active: 'Active Billing (Jul 2026)',
      quiet: 'Quiet Accounts (Churn)',
      density: 'Dormancy Ratio (%)'
    };
    const exportData = sortedTerritories.map(t => ({
      ...t,
      density: t.density.toFixed(1)
    }));
    exportToCSV(`Executive_Territory_Audit_${new Date().toISOString().slice(0,10)}`, exportData, headers);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const clusterCount = auditStats.wall_sharing_clusters_count || auditStats.wall_sharing_clusters?.length || 20;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* 1. Header Card & Verification Status */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400 print:text-blue-600" />
            <h2 className="text-base font-extrabold text-white print:text-black uppercase tracking-wider">
              Territory Network Audit & Verification
            </h2>
          </div>
          
          {/* Action Buttons: Sync, Print PDF, and Export */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-indigo-400" /> Print / Save PDF
            </button>
            <button
              onClick={handleExportTerritoryCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Export CSV
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Sync Live DB
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 print:text-slate-600">
          Executive state-level network audit summary for Tamil Nadu (Generated on {new Date().toLocaleDateString()}).
        </p>

        {/* 2. KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 print:grid-cols-4 print:gap-2">
          <div className="bg-slate-950 print:bg-slate-100 p-4 rounded-2xl border border-slate-800 print:border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase tracking-wider block">Network Universe</span>
            <p className="text-3xl font-black text-white print:text-slate-900 mt-1">{auditStats.total_outlets}</p>
            <span className="text-xs text-slate-500">12 territories mapped</span>
          </div>

          <div className="bg-emerald-950/40 print:bg-emerald-50 p-4 rounded-2xl border border-emerald-500/30 print:border-emerald-300">
            <span className="text-[10px] font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wider block">Active Counters</span>
            <p className="text-3xl font-black text-emerald-400 print:text-emerald-700 mt-1">{auditStats.active_counters}</p>
            <span className="text-xs text-emerald-400/80 print:text-emerald-600">Billed in Jul 2026</span>
          </div>

          <div className="bg-rose-950/40 print:bg-rose-50 p-4 rounded-2xl border border-rose-500/30 print:border-rose-300">
            <span className="text-[10px] font-bold text-rose-400 print:text-rose-700 uppercase tracking-wider block">Dormant Churn</span>
            <p className="text-3xl font-black text-rose-400 print:text-rose-700 mt-1">{auditStats.quiet_counters}</p>
            <span className="text-xs text-rose-400/80 print:text-rose-600">{churnRate}% quiet counters</span>
          </div>

          <div className="bg-blue-950/40 print:bg-blue-50 p-4 rounded-2xl border border-blue-500/30 print:border-blue-300">
            <span className="text-[10px] font-bold text-blue-400 print:text-blue-700 uppercase tracking-wider block">Logged Audits</span>
            <p className="text-3xl font-black text-blue-400 print:text-blue-700 mt-1">{auditStats.total_logged_visits}</p>
            <span className="text-xs text-blue-400/80 print:text-blue-600">Historical beat logs</span>
          </div>
        </div>

        {/* 3. Interactive Wall-Sharing Alert Card */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 print:text-amber-700 font-bold">
              <AlertCircle className="w-4 h-4" />
              Wall-Sharing Disambiguation Engine
            </div>
            <p className="text-slate-300 print:text-slate-700 leading-relaxed text-[11px]">
              Identified <strong>{clusterCount} coordinate clusters</strong> with overlapping GPS counters (e.g. Madurai cluster OA0099, OA0169, OA0818). Verification is secured by distinct store-tier checklist logging.
            </p>
          </div>

          <button
            onClick={() => setIsClusterModalOpen(true)}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-sm print:hidden">
            Inspect Clusters ({clusterCount}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cluster Resolution Modal */}
      <ClusterModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        clusters={auditStats.wall_sharing_clusters}
      />

      {/* 4. Territory Performance Table with Dynamic Filters & Sorting */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl print:bg-white print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xs font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Territory Audit Breakdown ({sortedTerritories.length} Markets)
            </h3>
            <p className="text-[11px] text-slate-400 print:text-slate-600">Account dormancy distribution across Tamil Nadu</p>
          </div>

          {/* Filtering Controls (Hidden during print) */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search market..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs py-1.5 pl-8 pr-3 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
              <span className="px-2 text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Filter className="w-3 h-3" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 text-xs py-1 pr-2 rounded focus:outline-none cursor-pointer">
                <option value="density" className="bg-slate-900">Churn Density (%)</option>
                <option value="quiet" className="bg-slate-900">Quiet Accounts</option>
                <option value="active" className="bg-slate-900">Active Counters</option>
                <option value="total" className="bg-slate-900">Total Universe</option>
                <option value="name" className="bg-slate-900">Market Name</option>
              </select>
            </div>

            <button
              onClick={toggleSortOrder}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] uppercase font-bold">{sortOrder}</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs print:text-black">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 font-semibold">Territory</th>
                <th className="pb-3 font-semibold text-center">Total Counters</th>
                <th className="pb-3 font-semibold text-center">Active (Jul 2026)</th>
                <th className="pb-3 font-semibold text-center">Quiet Churn</th>
                <th className="pb-3 font-semibold text-right">Dormancy Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {sortedTerritories.length > 0 ? (
                sortedTerritories.map((t) => {
                  const ratio = t.density.toFixed(0);
                  return (
                    <tr key={t.territory} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-bold text-white print:text-black flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full print:hidden ${t.density > 65 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {t.territory}
                      </td>
                      <td className="py-3 text-center text-slate-300 print:text-slate-800 font-mono">{t.total}</td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-400 print:text-emerald-700">{t.active}</td>
                      <td className="py-3 text-center font-mono font-bold text-rose-400 print:text-rose-700">{t.quiet}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          Number(ratio) > 65 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 print:text-rose-700 print:border-none' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:text-emerald-700 print:border-none'
                        }`}>
                          {ratio}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No matching territories found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}