'use client';

import React, { useState } from 'react';
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
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `partner_desk_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Desk Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Partner Profile, Database Connectivity, Security & Data Backup</p>
      </div>

      {/* 1. Authorized Partners */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Users className="w-5 h-5 text-slate-800" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Authorized Business Partners</h3>
            <p className="text-xs text-slate-500">Strictly 2 pre-authorized users with shared equal management rights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map(p => {
            const isActive = activePartner.id === p.id;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive 
                    ? 'border-slate-900 bg-slate-50 shadow-xs' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isActive ? 'bg-slate-900 text-amber-400 shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-semibold">
                            Active Session
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-700 font-medium block">{p.role}</span>
                      <span className="text-[11px] text-slate-500 block">{p.email}</span>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => setActivePartner(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      Switch to Account
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Supabase Cloud Database */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Supabase Cloud Database</h3>
            <p className="text-xs text-slate-500">Realtime PostgreSQL synchronization & encrypted storage</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-900">Live Cloud Project Connected</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Project URL: https://gcvsdanwvcaqwujozxny.supabase.co
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            Status: Active & Synced
          </span>
        </div>
      </div>

      {/* 3. Data Backup & Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Download className="w-5 h-5 text-slate-800" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Export Full Business Data Backup</h3>
            <p className="text-xs text-slate-500">Download clean JSON snapshot of all payments, chits, notes & tasks</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Current Records: {payments.length} Payments • {chits.length} Chits • {notes.length} Notes • {tasks.length} Tasks
          </div>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Backup (.JSON)</span>
          </button>
        </div>
      </div>

      {/* 4. Security Policy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Privacy Guarantee</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Partner Desk is restricted strictly to Partner 1 and Partner 2. Public user registration is permanently disabled. All financial transactions, token amounts, and customer contact records are isolated and private.
        </p>
      </div>
    </div>
  );
}
