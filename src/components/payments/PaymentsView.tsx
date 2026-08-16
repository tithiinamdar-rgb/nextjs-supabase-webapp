'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Calendar, 
  IndianRupee, 
  Trash2,
  History,
  X,
  Plus,
  Camera,
  Eye,
  Check
} from 'lucide-react';
import { PaymentItem } from '@/types';

export default function PaymentsView() {
  const { 
    payments, 
    openQuickAdd, 
    openRecordPaymentModal, 
    openPhotoReminderModal,
    deletePayment,
    photoReminders
  } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'all' | 'to_collect' | 'to_pay'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  
  const [viewingPayment, setViewingPayment] = useState<PaymentItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (p.archived) return false;

      if (activeTab === 'to_collect' && p.type !== 'to_collect') return false;
      if (activeTab === 'to_pay' && p.type !== 'to_pay') return false;

      if (selectedPartner !== 'all' && p.assignedTo !== selectedPartner && p.assignedTo !== 'Both Partners') return false;
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;

      if (timeframeFilter === 'today' && p.dueDate !== todayStr) return false;
      if (timeframeFilter === '7days' && (p.dueDate < todayStr || p.dueDate > in7Days)) return false;
      if (timeframeFilter === '30days' && (p.dueDate < todayStr || p.dueDate > in30Days)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.clientName.toLowerCase().includes(q) ||
          (p.propertyName && p.propertyName.toLowerCase().includes(q)) ||
          p.amount.toString().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [payments, activeTab, selectedPartner, selectedStatus, timeframeFilter, searchQuery, todayStr, in7Days, in30Days]);

  // Find all receipts assigned to the client currently being viewed
  const clientReceipts = useMemo(() => {
    if (!viewingPayment) return [];
    const clientName = viewingPayment.clientName.toLowerCase();
    return photoReminders.filter(pr => pr.clientName?.toLowerCase() === clientName || pr.title?.toLowerCase().includes(clientName));
  }, [viewingPayment, photoReminders]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Payments & Cashflow</h1>
          <p className="text-xs text-slate-400 mt-0.5">Receivables, Vendor Dues & Client Attached Receipts</p>
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
            <span>New Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 w-full md:w-fit">
            {[
              { id: 'all', label: 'All Payments' },
              { id: 'to_collect', label: 'To Collect' },
              { id: 'to_pay', label: 'To Pay' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search client or property..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-2">
        {filteredPayments.length === 0 ? (
          <div className="py-12 bg-[#0f172a] border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-500">No payment records found.</p>
          </div>
        ) : (
          filteredPayments.map(payment => {
            const isCollect = payment.type === 'to_collect';
            const remaining = payment.remainingAmount !== undefined ? payment.remainingAmount : (payment.amount - payment.amountCompleted);
            const hasReceipts = photoReminders.some(pr => pr.clientName?.toLowerCase() === payment.clientName.toLowerCase());

            return (
              <div
                key={payment.id}
                className="bg-[#0f172a] border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-bold ${
                    isCollect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isCollect ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-xs">{payment.clientName}</h3>
                      {payment.propertyName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {payment.propertyName}
                        </span>
                      )}
                      {hasReceipts && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" />
                          <span>Receipt Attached</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>📅 Due: {payment.dueDate}</span>
                      <span>👤 {payment.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      ₹{remaining.toLocaleString('en-IN')}
                    </span>
                    {payment.amountCompleted > 0 && (
                      <span className="text-[10px] text-slate-500 block">
                        of ₹{payment.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {payment.status !== 'Completed' && (
                      <button
                        onClick={() => openRecordPaymentModal(payment)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                      >
                        Record
                      </button>
                    )}
                    <button
                      onClick={() => setViewingPayment(payment)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                      title="View Details & Receipts"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePayment(payment.id, true)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 text-xs transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILS / AUDIT & CLIENT ATTACHED RECEIPTS MODAL */}
      {viewingPayment && (
        <div 
          onClick={() => setViewingPayment(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-slate-100 my-6 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="font-bold text-white text-sm">{viewingPayment.clientName}</h3>
                <p className="text-xs text-slate-400">{viewingPayment.type === 'to_collect' ? 'Money to Collect' : 'Money to Pay'}</p>
              </div>
              <button
                onClick={() => setViewingPayment(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Total Amount</span>
                  <span className="font-bold text-white text-sm">₹{viewingPayment.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Remaining Balance</span>
                  <span className="font-bold text-amber-400 text-sm">₹{(viewingPayment.remainingAmount || viewingPayment.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Client Assigned Receipts Gallery */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Receipts & Cheque Photos ({clientReceipts.length})</span>
                </h4>

                {clientReceipts.length === 0 ? (
                  <p className="text-[11px] text-slate-500 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
                    No receipt images attached to this client yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {clientReceipts.map(rec => (
                      <div 
                        key={rec.id}
                        onClick={() => setLightboxImage(rec.imageUrl)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0">
                          <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate text-xs">
                          <span className="font-medium text-white truncate block">{rec.title}</span>
                          <span className="text-[10px] text-slate-500 block">Due: {rec.reminderDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction History */}
              {viewingPayment.transactions && viewingPayment.transactions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Payment History</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {viewingPayment.transactions.map(tx => (
                      <div key={tx.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between">
                        <div>
                          <span className="font-semibold text-white">₹{tx.amount.toLocaleString('en-IN')}</span>
                          <span className="text-slate-500 ml-2">({tx.paymentMethod})</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{tx.transactionDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  openRecordPaymentModal(viewingPayment);
                  setViewingPayment(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
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
