'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  IndianRupee, 
  Layers, 
  FileText, 
  CheckSquare, 
  Camera, 
  Plus, 
  Check, 
  RotateCcw,
  Eye,
  X,
  ArrowRight,
  User,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { PhotoReminderItem } from '@/types';

export default function MainDashboard() {
  const { 
    activePartner, 
    setCurrentSection, 
    openQuickAdd, 
    openPhotoReminderModal,
    metrics, 
    payments, 
    chits, 
    notes, 
    tasks,
    photoReminders,
    togglePhotoReminderComplete,
    toggleSubReminderComplete,
    snoozePhotoReminder,
    toggleTaskComplete,
    openRecordPaymentModal
  } = usePartnerStore();

  const [previewReminder, setPreviewReminder] = useState<PhotoReminderItem | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.dueDate <= todayStr && t.status !== 'Cancelled');
  const todaysPhotoReminders = photoReminders.filter(pr => pr.reminderDate <= todayStr && pr.status !== 'Completed');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <p className="text-xs font-medium text-slate-400">{todayFormatted}</p>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
            Welcome, {activePartner.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPhotoReminderModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Click Image of Receipt</span>
          </button>

          <button
            onClick={() => openQuickAdd()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-all border border-slate-700/80 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* 2. MINIMALIST 4 KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Money To Collect */}
        <div 
          onClick={() => setCurrentSection('payments')}
          className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Money To Collect</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            ₹{metrics.totalToCollect.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Receivables</span>
        </div>

        {/* Money To Pay */}
        <div 
          onClick={() => setCurrentSection('payments')}
          className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Money To Pay</span>
          <span className="text-xl font-bold text-rose-400 block mt-1">
            ₹{metrics.totalToPay.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Vendor dues</span>
        </div>

        {/* Active Chits */}
        <div 
          onClick={() => setCurrentSection('chits')}
          className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Active Chits</span>
          <span className="text-xl font-bold text-white block mt-1">
            ₹{metrics.activeChitsTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{metrics.activeChitsCount} Running</span>
        </div>

        {/* Today's Due Items */}
        <div 
          onClick={() => setCurrentSection('tasks')}
          className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Today&apos;s Due Items</span>
          <span className="text-xl font-bold text-amber-400 block mt-1">
            {metrics.dueTodayCount + todaysTasks.length + todaysPhotoReminders.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Scheduled today</span>
        </div>
      </div>

      {/* 3. TODAY'S PHOTO REMINDERS (IF ANY) */}
      {todaysPhotoReminders.length > 0 && (
        <div className="bg-[#0f172a] border border-amber-500/30 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Today&apos;s Receipts & Reminders ({todaysPhotoReminders.length})</span>
            </h2>
            <button
              onClick={() => openPhotoReminderModal()}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              + Click Image
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaysPhotoReminders.map(item => {
              const totalSub = item.remindersList?.length || 1;
              const completedSub = item.remindersList?.filter(r => r.completed).length || 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex gap-3 items-center justify-between"
                >
                  <div 
                    onClick={() => setPreviewReminder(item)}
                    className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-700 relative group"
                  >
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold truncate max-w-[120px]">
                        👤 {item.clientName || 'General'}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate mt-0.5">{item.title}</h4>
                    {item.amount && (
                      <span className="text-[11px] font-bold text-amber-400 block">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => snoozePhotoReminder(item.id, 1)}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] transition-colors cursor-pointer border border-slate-700"
                      title="Snooze +1 Day"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => togglePhotoReminderComplete(item.id)}
                      className="p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer"
                      title="Mark Complete"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FOUR CLEAN CORE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* PANEL 1: PAYMENTS */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 mb-2.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs">Payments</h3>
              </div>
              <button
                onClick={() => openQuickAdd('payment_collect')}
                className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No payment entries.</p>
              ) : (
                payments.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.type === 'to_collect' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="font-medium text-slate-200 truncate">{p.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-white">₹{(p.remainingAmount || p.amount).toLocaleString('en-IN')}</span>
                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => openRecordPaymentModal(p)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
                        >
                          Record
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('payments')}
            className="w-full mt-3 pt-2.5 border-t border-slate-800/60 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>View All Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 2: CHITS */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs">Chits</h3>
              </div>
              <button
                onClick={() => openQuickAdd('chit')}
                className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5">
              {chits.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No chit records.</p>
              ) : (
                chits.slice(0, 3).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-medium text-slate-200 block truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-500">{c.personName}</span>
                    </div>
                    <span className="font-bold text-white flex-shrink-0">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('chits')}
            className="w-full mt-3 pt-2.5 border-t border-slate-800/60 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>View All Chits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 3: TO DO TODAY */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 mb-2.5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs">To Do Today</h3>
              </div>
              <button
                onClick={() => openQuickAdd('task')}
                className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5">
              {todaysTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">All caught up for today.</p>
              ) : (
                todaysTasks.slice(0, 3).map(t => {
                  const isDone = t.status === 'Completed';
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          onClick={() => toggleTaskComplete(t.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                            isDone ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`font-medium truncate ${isDone ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">{t.priority}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('tasks')}
            className="w-full mt-3 pt-2.5 border-t border-slate-800/60 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 4: NOTES */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 mb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs">Notes & Deals</h3>
              </div>
              <button
                onClick={() => openQuickAdd('note')}
                className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No notes recorded.</p>
              ) : (
                notes.slice(0, 2).map(n => (
                  <div
                    key={n.id}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <h4 className="font-semibold text-slate-200 truncate">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('notes')}
            className="w-full mt-3 pt-2.5 border-t border-slate-800/60 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* FULL RECEIPT DETAILS & MULTIPLE REMINDERS MODAL */}
      {previewReminder && (
        <div 
          onClick={() => setPreviewReminder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-slate-100 my-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  Client: {previewReminder.clientName || 'General'}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{previewReminder.title}</h3>
                {previewReminder.amount && (
                  <p className="text-xs font-bold text-amber-400">₹{previewReminder.amount.toLocaleString('en-IN')}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewReminder(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attached Photo */}
            <div className="max-h-60 overflow-auto rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800/80">
              <img
                src={previewReminder.imageUrl}
                alt={previewReminder.title}
                className="max-h-56 w-auto object-contain rounded-lg"
              />
            </div>

            {/* Multiple Follow-up Reminders Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Scheduled Reminders & Follow-ups</h4>
              <div className="space-y-1.5">
                {previewReminder.remindersList && previewReminder.remindersList.length > 0 ? (
                  previewReminder.remindersList.map(sub => (
                    <div 
                      key={sub.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                        sub.completed ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleSubReminderComplete(previewReminder.id, sub.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                            sub.completed ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div>
                          <p className={`font-medium ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {sub.note || 'Follow-up reminder'}
                          </p>
                          <span className="text-[10px] text-slate-500">📅 {sub.date}</span>
                        </div>
                      </div>

                      {sub.completed && sub.completedAt && (
                        <span className="text-[9px] text-emerald-400 font-medium">
                          Done: {new Date(sub.completedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between">
                    <span>Due: {previewReminder.reminderDate}</span>
                    <span className="text-slate-400">{previewReminder.status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Status: <strong className={previewReminder.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}>{previewReminder.status}</strong>
              </span>

              <button
                onClick={() => {
                  togglePhotoReminderComplete(previewReminder.id);
                  setPreviewReminder(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewReminder.status === 'Completed'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {previewReminder.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed (Select Done)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
