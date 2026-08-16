'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Calendar, 
  IndianRupee, 
  AlertTriangle, 
  Phone, 
  Building2, 
  CheckCircle2, 
  CreditCard,
  Trash2,
  History,
  X,
  Plus
} from 'lucide-react';
import { PaymentItem } from '@/types';

export default function PaymentsView() {
  const { 
    payments, 
    openQuickAdd, 
    openRecordPaymentModal, 
    updatePayment, 
    deletePayment,
    metrics, 
    partners 
  } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'all' | 'to_collect' | 'to_pay'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | '3days' | '7days' | '30days' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'amount_desc' | 'amount_asc'>('date_asc');
  
  const [viewingPayment, setViewingPayment] = useState<PaymentItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
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
      if (timeframeFilter === '3days' && (p.dueDate < todayStr || p.dueDate > in3Days)) return false;
      if (timeframeFilter === '7days' && (p.dueDate < todayStr || p.dueDate > in7Days)) return false;
      if (timeframeFilter === '30days' && (p.dueDate < todayStr || p.dueDate > in30Days)) return false;
      if (timeframeFilter === 'overdue' && (p.dueDate >= todayStr || p.status === 'Completed')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.clientName.toLowerCase().includes(q) ||
          (p.propertyName && p.propertyName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q)) ||
          p.amount.toString().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_asc') return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'date_desc') return b.dueDate.localeCompare(a.dueDate);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [payments, activeTab, selectedPartner, selectedStatus, timeframeFilter, searchQuery, sortBy, todayStr, in3Days, in7Days, in30Days]);

  const handleMarkCompleted = async (payment: PaymentItem) => {
    await updatePayment(payment.id, {
      status: 'Completed',
      amountCompleted: payment.amount,
      remainingAmount: 0
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Payments & Cashflows</h1>
          <p className="text-xs text-slate-400 mt-0.5">Receivables & Vendor Payables</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('payment_pay')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Pay Out</span>
          </button>
          <button
            onClick={() => openQuickAdd('payment_collect')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Receive Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Money To Collect</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">₹{metrics.totalToCollect.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pending client receivables</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Money To Pay</span>
          <span className="text-xl font-bold text-rose-400 block mt-1">₹{metrics.totalToPay.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Vendor dues</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Overdue Amount</span>
          <span className="text-xl font-bold text-amber-400 block mt-1">
            ₹{(metrics.overduePaymentsAmount + metrics.overdueCollectionsAmount).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pending action</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Collected This Month</span>
          <span className="text-xl font-bold text-white block mt-1">₹{metrics.collectedThisMonth.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Received payments</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 w-fit">
            {[
              { id: 'all', label: 'All Payments' },
              { id: 'to_collect', label: 'To Collect' },
              { id: 'to_pay', label: 'To Pay' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by party, property, phone, or amount..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <select
            value={timeframeFilter}
            onChange={e => setTimeframeFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Due Today</option>
            <option value="3days">Next 3 Days</option>
            <option value="7days">Next 7 Days</option>
            <option value="30days">Next 30 Days</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Due Today">Due Today</option>
            <option value="Overdue">Overdue</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none ml-auto"
          >
            <option value="date_asc">Date: Earliest First</option>
            <option value="date_desc">Date: Latest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
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
            const isToCollect = payment.type === 'to_collect';
            const remaining = payment.remainingAmount !== undefined ? payment.remainingAmount : (payment.amount - payment.amountCompleted);
            const isCompleted = payment.status === 'Completed';

            return (
              <div
                key={payment.id}
                className="bg-[#0f172a] border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isToCollect ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' : 'bg-rose-950/60 text-rose-400 border border-rose-900/60'
                  }`}>
                    {isToCollect ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-xs">{payment.clientName}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                        {payment.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      {payment.propertyName && <span>📍 {payment.propertyName}</span>}
                      <span>📅 Due: {payment.dueDate}</span>
                      <span>👤 {payment.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-white block">
                      ₹{remaining.toLocaleString('en-IN')}
                    </span>
                    {payment.amountCompleted > 0 && !isCompleted && (
                      <span className="text-[10px] text-slate-500 block">
                        ₹{payment.amountCompleted.toLocaleString('en-IN')} paid
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <button
                        onClick={() => openRecordPaymentModal(payment)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Record
                      </button>
                    )}
                    <button
                      onClick={() => setViewingPayment(payment)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                      title="View Details"
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

      {/* DETAILS / AUDIT MODAL */}
      {viewingPayment && (
        <div 
          onClick={() => setViewingPayment(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Total Amount</span>
                <span className="font-bold text-white text-sm">₹{viewingPayment.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Remaining</span>
                <span className="font-bold text-amber-400 text-sm">₹{(viewingPayment.remainingAmount || viewingPayment.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {viewingPayment.transactions && viewingPayment.transactions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Payment History</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
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

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
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
    </div>
  );
}
