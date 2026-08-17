import React, { useState } from 'react';
import { X, Building2, MapPin, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function ClusterModal({ isOpen, onClose, clusters }) {
  const [selectedClusterIdx, setSelectedClusterIdx] = useState(0);

  if (!isOpen || !clusters || clusters.length === 0) return null;

  const currentCluster = clusters[selectedClusterIdx] || clusters[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Wall-Sharing Disambiguation Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                {clusters.length} coordinate clusters with overlapping GPS counters
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden flex-1">
          {/* Cluster List Sidebar */}
          <div className="p-3 overflow-y-auto max-h-48 md:max-h-[60vh] space-y-1.5 bg-slate-950/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
              Detected GPS Clusters
            </span>
            {clusters.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedClusterIdx(idx)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedClusterIdx === idx
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}>
                <div>
                  <div className="font-bold text-white text-[11px]">{c.town} Cluster #{idx + 1}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {c.lat}, {c.lng}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {c.count} Shops
                </span>
              </button>
            ))}
          </div>

          {/* Cluster Counter Details */}
          <div className="p-5 md:col-span-2 overflow-y-auto max-h-[60vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Cluster Disambiguation Trail
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {currentCluster.town} (GPS: {currentCluster.lat}, {currentCluster.lng})
                </h4>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                Tier Verification Active
              </span>
            </div>

            <div className="space-y-3">
              {currentCluster.outlets.map((shop) => (
                <div 
                  key={shop.code}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-blue-400 rounded border border-slate-700">
                      {shop.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      shop.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {shop.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-xs">{shop.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      Channel: <strong className="text-slate-300">{shop.type}</strong> • Owner: <strong className="text-slate-300">{shop.owner}</strong>
                    </p>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Distinct Checklist: <strong>{shop.type} Protocol</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unique Audit Signature
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition">
            Close Resolution View
          </button>
        </div>
      </div>
    </div>
  );
}