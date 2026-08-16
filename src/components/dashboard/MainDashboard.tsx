'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  FileText, 
  CheckSquare, 
  IndianRupee, 
  Camera, 
  Plus, 
  Check, 
  RotateCcw,
  Eye,
  X,
  ArrowRight
} from 'lucide-react';

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
    snoozePhotoReminder,
    toggleTaskComplete,
    openRecordPaymentModal
  } = usePartnerStore();

  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; amount?: number } | null>(null);

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
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* 1. CLEAN EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-medium text-slate-400">{todayFormatted}</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Welcome, {activePartner.name}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openPhotoReminderModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>Snap Reminder</span>
          </button>

          <button
            onClick={() => openQuickAdd()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* 2. MINIMALIST KEY METRICS (4 CLEAN TILES) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* To Collect */}
        <div 
          onClick={() => setCurrentSection('payments')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Money To Collect</span>
          <span className="text-xl font-bold text-emerald-600 block mt-1">
            ₹{metrics.totalToCollect.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Receivables</span>
        </div>

        {/* To Pay */}
        <div 
          onClick={() => setCurrentSection('payments')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Money To Pay</span>
          <span className="text-xl font-bold text-rose-600 block mt-1">
            ₹{metrics.totalToPay.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Vendor dues</span>
        </div>

        {/* Active Chits */}
        <div 
          onClick={() => setCurrentSection('chits')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Active Chits</span>
          <span className="text-xl font-bold text-slate-900 block mt-1">
            ₹{metrics.activeChitsTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{metrics.activeChitsCount} Running</span>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => setCurrentSection('tasks')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Today&apos;s Due Items</span>
          <span className="text-xl font-bold text-slate-900 block mt-1">
            {metrics.dueTodayCount + todaysTasks.length + todaysPhotoReminders.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Pending today</span>
        </div>
      </div>

      {/* 3. TODAY'S PHOTO REMINDERS (IF ANY DUE) */}
      {todaysPhotoReminders.length > 0 && (
        <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Today&apos;s Photo Reminders ({todaysPhotoReminders.length})</span>
            </h2>
            <button
              onClick={() => openPhotoReminderModal()}
              className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              + Snap New
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaysPhotoReminders.map(item => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center justify-between"
              >
                <div 
                  onClick={() => setPreviewImage({ src: item.imageUrl, title: item.title, amount: item.amount })}
                  className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-300 relative group"
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                  {item.amount && (
                    <span className="text-[11px] font-bold text-emerald-700 block">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => snoozePhotoReminder(item.id, 1)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium transition-colors cursor-pointer"
                    title="Snooze +1 Day"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => togglePhotoReminderComplete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium transition-colors cursor-pointer"
                    title="Mark Done"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FOUR CLEAN CORE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* PANEL 1: PAYMENTS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Payments</h3>
              </div>
              <button
                onClick={() => openQuickAdd('payment_collect')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No payment entries yet.</p>
              ) : (
                payments.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.type === 'to_collect' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-medium text-slate-800 truncate">{p.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-slate-900">₹{(p.remainingAmount || p.amount).toLocaleString('en-IN')}</span>
                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => openRecordPaymentModal(p)}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
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
            className="w-full mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between cursor-pointer"
          >
            <span>View All Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 2: CHITS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Chits</h3>
              </div>
              <button
                onClick={() => openQuickAdd('chit')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {chits.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No chit records yet.</p>
              ) : (
                chits.slice(0, 3).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-medium text-slate-800 block truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-400">{c.personName}</span>
                    </div>
                    <span className="font-bold text-slate-900 flex-shrink-0">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('chits')}
            className="w-full mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between cursor-pointer"
          >
            <span>View All Chits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 3: TO DO TODAY */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">To Do Today</h3>
              </div>
              <button
                onClick={() => openQuickAdd('task')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {todaysTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">All caught up for today.</p>
              ) : (
                todaysTasks.slice(0, 3).map(t => {
                  const isDone = t.status === 'Completed';
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          onClick={() => toggleTaskComplete(t.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                            isDone ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`font-medium truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{t.priority}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('tasks')}
            className="w-full mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 4: NOTES */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Notes & Deals</h3>
              </div>
              <button
                onClick={() => openQuickAdd('note')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No notes recorded yet.</p>
              ) : (
                notes.slice(0, 2).map(n => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <h4 className="font-semibold text-slate-900 truncate">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentSection('notes')}
            className="w-full mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between cursor-pointer"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* FULL-SCREEN IMAGE LIGHTBOX */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewImage.title}</h3>
                {previewImage.amount && (
                  <p className="text-xs font-bold text-emerald-600">₹{previewImage.amount.toLocaleString('en-IN')}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-50 flex items-center justify-center">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
