'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Users, 
  Search, 
  IndianRupee, 
  Camera, 
  Bell, 
  ArrowRight, 
  ChevronRight,
  Plus
} from 'lucide-react';

export default function ClientsView() {
  const { 
    allClientNames, 
    payments, 
    photoReminders, 
    openClientDossier,
    openPhotoReminderModal,
    openQuickAdd
  } = usePartnerStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate stats per client
  const clientsData = useMemo(() => {
    return allClientNames.map(name => {
      const q = name.toLowerCase();
      const clientPayments = payments.filter(p => !p.archived && p.clientName?.toLowerCase() === q);
      const clientReceipts = photoReminders.filter(pr => pr.clientName?.toLowerCase() === q || pr.title?.toLowerCase().includes(q));

      const totalReceivable = clientPayments.filter(p => p.type === 'to_collect').reduce((s, p) => s + p.amount, 0);
      const collected = clientPayments.filter(p => p.type === 'to_collect').reduce((s, p) => s + p.amountCompleted, 0);
      const pendingCollect = totalReceivable - collected;

      const activeRemindersCount = clientReceipts.reduce((acc, r) => acc + (r.remindersList?.filter(sub => !sub.completed).length || (r.status !== 'Completed' ? 1 : 0)), 0);

      return {
        name,
        paymentsCount: clientPayments.length,
        receiptsCount: clientReceipts.length,
        pendingCollect,
        totalReceivable,
        activeRemindersCount,
      };
    }).filter(c => {
      if (searchQuery.trim()) {
        return c.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    }).sort((a, b) => b.pendingCollect - a.pendingCollect);
  }, [allClientNames, payments, photoReminders, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clients Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Select any client to see their 360° invoices, receipts, and reminders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPhotoReminderModal()}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Click Image of Receipt</span>
          </button>
          <button
            onClick={() => openQuickAdd('payment_collect')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Client Entry</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search client directory..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {clientsData.length} Registered Clients
        </span>
      </div>

      {/* Clients Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {clientsData.length === 0 ? (
          <div className="col-span-full py-12 bg-[#0f172a] border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-500">No clients match your search.</p>
          </div>
        ) : (
          clientsData.map(client => (
            <div
              key={client.name}
              onClick={() => openClientDossier(client.name)}
              className="bg-[#0f172a] border border-slate-800/80 hover:border-amber-500/60 rounded-xl p-4 transition-all shadow-sm cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                        {client.name}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        {client.paymentsCount} Transactions Recorded
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Pending Collect</span>
                    <span className="font-bold text-emerald-400 block mt-0.5">
                      ₹{client.pendingCollect.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Receipt Photos</span>
                    <span className="font-bold text-amber-400 block mt-0.5">
                      {client.receiptsCount} Attached
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-slate-500" />
                  <span>{client.activeRemindersCount} Active Reminders</span>
                </span>
                <span className="text-amber-400 font-semibold text-[10px] flex items-center gap-1">
                  <span>View 360° Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
