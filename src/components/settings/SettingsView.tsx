'use client';

import React from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Users, 
  Database, 
  ShieldCheck, 
  Download, 
} from 'lucide-react';

export default function SettingsView() {
  const { 
    partners, 
    activePartner, 
    setActivePartner, 
    payments, 
    chits, 
    notes, 
    tasks,
    photoReminders,
    isSupabaseConnected 
  } = usePartnerStore();

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      activePartner,
      payments,
      chits,
      notes,
      tasks,
      photoReminders
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aashus_app_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-3xl text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Settings & Workspace</h1>
        <p className="text-xs text-slate-400 mt-0.5">Partner Profile, Database Connectivity & Data Backup</p>
      </div>

      {/* 1. Authorized Partners */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">Authorized Business Partners</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {partners.map(p => {
            const isCurrent = activePartner.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePartner(p)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent 
                    ? 'bg-slate-900 border-amber-500/60 shadow-sm' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {p.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{p.name}</h4>
                    <p className="text-[10px] text-slate-400">{p.role}</p>
                    <p className="text-[10px] text-slate-500">{p.email}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Supabase Cloud Sync */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">Cloud Database & Storage</h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-medium text-white block">Supabase Realtime Sync</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Encrypted real-time synchronization between both partners</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold">
            Connected
          </span>
        </div>
      </div>

      {/* 3. Security & Backup */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-white text-xs">Security & Backup</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-medium text-white block">Export Complete Business Backup</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Download all payments, chits, notes, and tasks as JSON</span>
          </div>
          <button
            onClick={handleExportData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer w-fit"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
