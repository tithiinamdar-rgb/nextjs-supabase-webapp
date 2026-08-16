'use client';

import React from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Plus, 
  IndianRupee, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Search,
  Check
} from 'lucide-react';

export default function MainDashboard() {
  const { 
    activePartner, 
    setCurrentSection, 
    openQuickAdd, 
    setIsGlobalSearchOpen,
    setIsNotificationsOpen,
    metrics, 
    payments, 
    chits, 
    notes, 
    tasks,
    toggleTaskComplete,
    openRecordPaymentModal
  } = usePartnerStore();

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.dueDate <= todayStr && t.status !== 'Cancelled');
  const pinnedNotes = notes.filter(n => n.pinned && !n.archived);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                Real Estate Partner Portal
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{todayFormatted}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Good day, <span className="text-slate-900">{activePartner.name}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Shared partner summary for cashflows, running chits, active client deals, and today&apos;s site tasks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search (Ctrl+K)</span>
            </button>
            <button
              onClick={() => openQuickAdd()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              <span>+ Add Record</span>
            </button>
          </div>
        </div>

        {/* Priority KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div 
            onClick={() => setCurrentSection('payments')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              metrics.overduePaymentsCount > 0 
                ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300' 
                : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Overdue Payments</span>
              {metrics.overduePaymentsCount > 0 && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{metrics.overduePaymentsCount}</span>
              {metrics.overduePaymentsAmount > 0 && (
                <span className="text-xs text-rose-700 font-semibold">₹{metrics.overduePaymentsAmount.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>

          <div 
            onClick={() => setCurrentSection('payments')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Due Today</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1.5">
              <span className="text-xl font-bold text-slate-900">{metrics.dueTodayCount}</span>
              <span className="text-xs text-slate-500 ml-1.5">pending action</span>
            </div>
          </div>

          <div 
            onClick={() => setCurrentSection('tasks')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Tasks for Today</span>
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1.5">
              <span className="text-xl font-bold text-slate-900">{metrics.pendingTasksTodayCount}</span>
              <span className="text-xs text-slate-500 ml-1.5">to complete</span>
            </div>
          </div>

          <div 
            onClick={() => setCurrentSection('chits')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Active Chits</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1.5">
              <span className="text-xl font-bold text-slate-900">{metrics.activeChitsCount}</span>
              <span className="text-xs text-emerald-700 font-semibold ml-1.5">₹{(metrics.activeChitsTotal / 100000).toFixed(1)}L Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOUR MAJOR DASHBOARD SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. PAYMENTS SUMMARY CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Payments & Cashflows</h3>
                  <p className="text-xs text-slate-500">Receivables & Vendor Payables</p>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('payment_collect')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Quick Add Payment"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Money To Collect</span>
                </div>
                <span className="text-xl font-bold text-slate-900">₹{metrics.totalToCollect.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Pending client receivables</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center gap-1.5 text-xs text-rose-800 font-semibold mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Money To Pay</span>
                </div>
                <span className="text-xl font-bold text-slate-900">₹{metrics.totalToPay.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Vendor & registry dues</span>
              </div>
            </div>

            {/* Recent Payments Preview */}
            <div className="space-y-2 mb-4">
              {payments.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${p.type === 'to_collect' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{p.clientName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">{p.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">₹{(p.remainingAmount || p.amount).toLocaleString('en-IN')}</span>
                    {p.status !== 'Completed' && (
                      <button
                        onClick={() => openRecordPaymentModal(p)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Record
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('payments')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
          >
            <span>Open Full Payments View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 2. CHITS SUMMARY CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Chits Management</h3>
                  <p className="text-xs text-slate-500">Dedicated Financial & Escrow Records</p>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('chit')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Quick Add Chit"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-900 font-medium block">Total Active Chit Capital</span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5 block">₹{metrics.activeChitsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Running Chits</span>
                <span className="text-base font-bold text-amber-800">{metrics.activeChitsCount} Active</span>
              </div>
            </div>

            {/* Chits List Preview */}
            <div className="space-y-2 mb-4">
              {chits.slice(0, 3).map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{c.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-medium">{c.referenceNumber}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.personName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">₹{c.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-500">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('chits')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
          >
            <span>Open Full Chits View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3. DAILY TO-DO SUMMARY CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Daily To-Do Tasks</h3>
                  <p className="text-xs text-slate-500">Site Visits, Client Follow-ups & Registry</p>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('task')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Quick Add Task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Today's Tasks List */}
            <div className="space-y-2 mb-4">
              {todaysTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No pending tasks scheduled for today. Great job!
                </div>
              ) : (
                todaysTasks.slice(0, 4).map(t => {
                  const isDone = t.status === 'Completed';
                  return (
                    <div
                      key={t.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                        isDone 
                          ? 'bg-slate-50/60 border-slate-100 opacity-60' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskComplete(t.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            isDone 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'border-slate-300 hover:border-slate-600 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>{t.assignedTo}</span>
                            {t.dueTime && <span>• {t.dueTime}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        t.priority === 'High' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('tasks')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
          >
            <span>Open Full To-Do View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4. NOTES & DEALS SUMMARY CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Notes & Deal Folders</h3>
                  <p className="text-xs text-slate-500">Agreements, Client Terms & Meetings</p>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('note')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Quick Add Note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Pinned & Recent Notes */}
            <div className="space-y-2.5 mb-4">
              {notes.slice(0, 3).map(n => (
                <div
                  key={n.id}
                  onClick={() => setCurrentSection('notes')}
                  className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">{n.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold">{n.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('notes')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
          >
            <span>Open Full Notes View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
