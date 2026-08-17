import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Smartphone, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { fetchBDMs, fetchBeat, fetchCounter, submitVisit, fetchAudit } from './api';
import BdmBeatView from './components/BdmBeatView';
import CounterDossier from './components/CounterDossier';
import AdminDashboard from './components/AdminDashboard';
import ExecutiveCharts from './components/ExecutiveCharts';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bdms, setBdms] = useState([]);
  const [selectedBdm, setSelectedBdm] = useState('BDM002');
  const [beat, setBeat] = useState([]);
  const [territory, setTerritory] = useState('Madurai');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activeCounterCode, setActiveCounterCode] = useState(null);
  const [counterData, setCounterData] = useState(null);
  const [checks, setChecks] = useState({});
  const [remarks, setRemarks] = useState('');

  const [auditStats, setAuditStats] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [banner, setBanner] = useState('');

  // Initial load: Fetch BDMs and Audit stats
  useEffect(() => {
    fetchBDMs().then(data => {
      if (data && data.length > 0) {
        setBdms(data);
        setSelectedBdm(data[1]?.bdm_code || data[0].bdm_code);
      }
    });
    loadAuditStats();
  }, []);

  // Fetch beat when selected BDM changes
  useEffect(() => {
    if (selectedBdm) {
      fetchBeat(selectedBdm).then(data => {
        setBeat(data.beat || []);
        setTerritory(data.territory || '');
        setActiveCounterCode(null);
      });
    }
  }, [selectedBdm]);

  const loadAuditStats = async () => {
    setAuditLoading(true);
    try {
      const res = await fetchAudit();
      setAuditStats(res);
    } catch (err) {
      console.error("Failed to load audit:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSelectCounter = (code) => {
    fetchCounter(code).then(data => {
      setCounterData(data);
      setActiveCounterCode(code);
      setChecks({});
      setRemarks('');
      navigate('/');
    });
  };

  const handleToggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCompleteVisit = async () => {
    const payload = {
      bdm_code: selectedBdm,
      outlet_code: activeCounterCode,
      remarks: remarks || "Counter beat audit completed.",
      checklist_responses: checks
    };

    const res = await submitVisit(payload);
    if (res.status === 'success') {
      setBanner(`Visit verified & logged for ${counterData.outlet.outlet_name}!`);
      loadAuditStats();
      setTimeout(() => {
        setBanner('');
        setActiveCounterCode(null);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div 
              className="flex items-center gap-2.5 cursor-pointer" 
              onClick={() => { setActiveCounterCode(null); navigate('/'); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  FieldBeat TN 
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Apple BDM
                  </span>
                </h1>
                <p className="text-xs text-slate-400">820 Retail Outlets • Tamil Nadu Distribution</p>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
              <button
                onClick={() => { setActiveCounterCode(null); navigate('/'); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                BDM
              </button>
              <button
                onClick={() => navigate('/admin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                Audit
              </button>
              <button
                onClick={() => navigate('/visuals')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${location.pathname === '/visuals' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                Visuals
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {location.pathname === '/' && !activeCounterCode && (
              <div className="relative flex-1 sm:w-72">
                <select
                  value={selectedBdm}
                  onChange={(e) => setSelectedBdm(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer">
                  {bdms.map(b => (
                    <option key={b.bdm_code} value={b.bdm_code} className="bg-slate-900">
                      {b.name} — {b.territory} ({b.bdm_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* URL Route Switchers */}
            <div className="hidden md:flex bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
              <button
                onClick={() => { setActiveCounterCode(null); navigate('/'); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                  location.pathname === '/' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                BDM Beat Flow
              </button>
              <button
                onClick={() => navigate('/admin')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                  location.pathname === '/admin' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                Executive Audit
              </button>
              <button
                onClick={() => navigate('/visuals')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname === '/visuals' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                <BarChart3 className="w-3.5 h-3.5" />
                Dynamic Visuals
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Routed Area */}
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 flex-1">
        {banner && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-3 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            {banner}
          </div>
        )}

        {auditLoading && (
          <div className="mb-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-blue-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Syncing live territory data from SQLite...
          </div>
        )}

        <Routes>
          {/* 1. Root Route: BDM Beat & Counter Dossier */}
          <Route path="/" element={
            activeCounterCode && counterData ? (
              <CounterDossier
                counterData={counterData}
                checks={checks}
                remarks={remarks}
                setRemarks={setRemarks}
                onToggleCheck={handleToggleCheck}
                onCompleteVisit={handleCompleteVisit}
                onBack={() => setActiveCounterCode(null)}
              />
            ) : (
              <BdmBeatView
                territory={territory}
                beat={beat}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onSelectCounter={handleSelectCounter}
              />
            )
          } />

          {/* 2. Dedicated /admin Route */}
          <Route path="/admin" element={
            auditStats && (
              <AdminDashboard 
                auditStats={auditStats} 
                onRefresh={loadAuditStats} 
              />
            )
          } />

          {/* 3. Dedicated /visuals Route */}
          <Route path="/visuals" element={
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Dynamic Network Analytics
                  </h3>
                  <p className="text-xs text-slate-400">Live multi-dimensional charts rendered straight from SQLite.</p>
                </div>
                <button
                  onClick={loadAuditStats}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Live Data
                </button>
              </div>

              {auditStats && <ExecutiveCharts stats={auditStats} />}
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}