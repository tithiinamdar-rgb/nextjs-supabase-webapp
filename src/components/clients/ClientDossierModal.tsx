'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  X, 
  User, 
  IndianRupee, 
  Camera, 
  Bell, 
  FileText, 
  CheckSquare, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Check, 
  RotateCcw, 
  Eye, 
  Calendar,
  Layers
} from 'lucide-react';
import { PaymentItem, PhotoReminderItem, TaskItem, NoteItem } from '@/types';

export default function ClientDossierModal() {
  const { 
    isClientDossierOpen, 
    setIsClientDossierOpen, 
    selectedClient, 
    setSelectedClient,
    allClientNames,
    payments, 
    photoReminders, 
    tasks, 
    notes,
    openQuickAdd,
    openPhotoReminderModal,
    openRecordPaymentModal,
    togglePhotoReminderComplete,
    toggleSubReminderComplete,
    toggleTaskComplete,
    snoozePhotoReminder
  } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'receipts' | 'reminders' | 'notes'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const clientName = selectedClient || allClientNames[0] || '';

  // Filter everything for this specific client
  const clientPayments = useMemo(() => {
    if (!clientName) return [];
    const q = clientName.toLowerCase();
    return payments.filter(p => !p.archived && p.clientName?.toLowerCase() === q);
  }, [clientName, payments]);

  const clientReceipts = useMemo(() => {
    if (!clientName) return [];
    const q = clientName.toLowerCase();
    return photoReminders.filter(pr => pr.clientName?.toLowerCase() === q || pr.title?.toLowerCase().includes(q));
  }, [clientName, photoReminders]);

  const clientTasks = useMemo(() => {
    if (!clientName) return [];
    const q = clientName.toLowerCase();
    return tasks.filter(t => t.clientName?.toLowerCase() === q || t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
  }, [clientName, tasks]);

  const clientNotes = useMemo(() => {
    if (!clientName) return [];
    const q = clientName.toLowerCase();
    return notes.filter(n => !n.archived && (n.clientName?.toLowerCase() === q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)));
  }, [clientName, notes]);

  // Aggregate totals
  const totalReceivables = clientPayments.filter(p => p.type === 'to_collect').reduce((sum, p) => sum + p.amount, 0);
  const collectedAmount = clientPayments.filter(p => p.type === 'to_collect').reduce((sum, p) => sum + p.amountCompleted, 0);
  const pendingReceivables = totalReceivables - collectedAmount;

  const totalPayables = clientPayments.filter(p => p.type === 'to_pay').reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = clientPayments.filter(p => p.type === 'to_pay').reduce((sum, p) => sum + p.amountCompleted, 0);
  const pendingPayables = totalPayables - paidAmount;

  if (!isClientDossierOpen || !clientName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Top Navigation & Client Selector Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* Client Selector Dropdown */}
                <select
                  value={clientName}
                  onChange={e => setSelectedClient(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-sm sm:text-base rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {allClientNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                  Client 360°
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Complete Invoices, Receipts, Reminders & Dossier</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => openPhotoReminderModal()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Receipt</span>
            </button>
            <button
              onClick={() => setIsClientDossierOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-slate-800/80 bg-slate-900/30 flex-shrink-0 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Invoiced</span>
            <span className="text-sm font-bold text-white block mt-0.5">₹{totalReceivables.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pending to Collect</span>
            <span className="text-sm font-bold text-emerald-400 block mt-0.5">₹{pendingReceivables.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Attached Receipts</span>
            <span className="text-sm font-bold text-amber-400 block mt-0.5">{clientReceipts.length} Photos</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Active Reminders</span>
            <span className="text-sm font-bold text-slate-300 block mt-0.5">
              {clientReceipts.reduce((acc, r) => acc + (r.remindersList?.filter(sub => !sub.completed).length || 1), 0)} Due
            </span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/60 bg-slate-900/40 flex-shrink-0">
          {[
            { id: 'all', label: `All Activity (${clientPayments.length + clientReceipts.length + clientTasks.length + clientNotes.length})` },
            { id: 'invoices', label: `Invoices & Payments (${clientPayments.length})` },
            { id: 'receipts', label: `Receipt Photos (${clientReceipts.length})` },
            { id: 'reminders', label: `Scheduled Reminders (${clientReceipts.length})` },
            { id: 'notes', label: `Notes & Deals (${clientNotes.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. INVOICES & PAYMENTS */}
          {(activeTab === 'all' || activeTab === 'invoices') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Invoices & Financial Records ({clientPayments.length})</span>
                </h3>
              </div>

              {clientPayments.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-3 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  No payment records registered for {clientName}.
                </p>
              ) : (
                clientPayments.map(p => {
                  const isCollect = p.type === 'to_collect';
                  const remaining = p.remainingAmount !== undefined ? p.remainingAmount : (p.amount - p.amountCompleted);

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`p-1.5 rounded-lg ${isCollect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isCollect ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{p.propertyName || p.description || 'Payment Record'}</p>
                          <span className="text-[10px] text-slate-500">Due: {p.dueDate} • Assigned: {p.assignedTo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-white block">₹{remaining.toLocaleString('en-IN')}</span>
                          {p.amountCompleted > 0 && (
                            <span className="text-[9px] text-slate-500">Paid: ₹{p.amountCompleted.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        {p.status !== 'Completed' && (
                          <button
                            onClick={() => openRecordPaymentModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                          >
                            Record
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. ATTACHED RECEIPTS & CHEQUE PHOTOS */}
          {(activeTab === 'all' || activeTab === 'receipts') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Receipts & Cheques Attached ({clientReceipts.length})</span>
                </h3>
              </div>

              {clientReceipts.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-3 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  No receipt photos clicked for {clientName} yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientReceipts.map(rec => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 items-center justify-between"
                    >
                      <div 
                        onClick={() => setLightboxImage(rec.imageUrl)}
                        className="w-14 h-14 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-700 cursor-pointer relative group"
                      >
                        <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate text-xs">{rec.title}</h4>
                        {rec.amount && <span className="text-[11px] font-bold text-amber-400 block">₹{rec.amount.toLocaleString('en-IN')}</span>}
                        <span className="text-[10px] text-slate-500 block">Due: {rec.reminderDate}</span>
                      </div>

                      <button
                        onClick={() => togglePhotoReminderComplete(rec.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          rec.status === 'Completed'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                        title="Toggle Complete"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. SCHEDULED REMINDERS & FOLLOW-UPS */}
          {(activeTab === 'all' || activeTab === 'reminders') && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Scheduled Reminders & Follow-up Checklist</span>
              </h3>

              {clientReceipts.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-3 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  No active reminders scheduled for {clientName}.
                </p>
              ) : (
                <div className="space-y-2">
                  {clientReceipts.map(rec => (
                    <div key={rec.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="font-bold text-white text-xs">{rec.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          rec.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {rec.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {rec.remindersList && rec.remindersList.length > 0 ? (
                          rec.remindersList.map(sub => (
                            <div
                              key={sub.id}
                              className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                                sub.completed ? 'bg-slate-950/40 border-slate-800/40 opacity-60' : 'bg-slate-950 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubReminderComplete(rec.id, sub.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                                    sub.completed ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-800'
                                  }`}
                                >
                                  {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <span className={sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                                  {sub.note || 'Follow-up'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500">📅 {sub.date}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between">
                            <span>Primary Due Date: {rec.reminderDate}</span>
                            <button
                              onClick={() => snoozePhotoReminder(rec.id, 1)}
                              className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                            >
                              +1 Day Snooze
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. NOTES & DEAL TERMS */}
          {(activeTab === 'all' || activeTab === 'notes') && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Notes & Deal Terms ({clientNotes.length})</span>
              </h3>

              {clientNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-3 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  No memos recorded for {clientName}.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientNotes.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <h4 className="font-bold text-white text-xs mb-1">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3"
          >
            <div className="flex justify-end">
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 flex items-center justify-center">
              <img src={lightboxImage} alt="Receipt" className="max-h-[65vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
