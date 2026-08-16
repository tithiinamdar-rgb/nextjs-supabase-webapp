'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Calendar, 
  IndianRupee, 
  AlertTriangle, 
  Phone, 
  Building2, 
  CheckCircle2, 
  CreditCard,
  Trash2,
  History
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

  // Filters State
  const [activeTab, setActiveTab] = useState<'all' | 'to_collect' | 'to_pay'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | '3days' | '7days' | '30days' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'amount_desc' | 'amount_asc'>('date_asc');
  
  // Selected Payment Details Modal
  const [viewingPayment, setViewingPayment] = useState<PaymentItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (p.archived) return false;

      // Tab filter
      if (activeTab === 'to_collect' && p.type !== 'to_collect') return false;
      if (activeTab === 'to_pay' && p.type !== 'to_pay') return false;

      // Partner filter
      if (selectedPartner !== 'all' && p.assignedTo !== selectedPartner && p.assignedTo !== 'Both Partners') return false;

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;

      // Timeframe filter
      if (timeframeFilter === 'today' && p.dueDate !== todayStr) return false;
      if (timeframeFilter === '3days' && (p.dueDate < todayStr || p.dueDate > in3Days)) return false;
      if (timeframeFilter === '7days' && (p.dueDate < todayStr || p.dueDate > in7Days)) return false;
      if (timeframeFilter === '30days' && (p.dueDate < todayStr || p.dueDate > in30Days)) return false;
      if (timeframeFilter === 'overdue' && (p.dueDate >= todayStr || p.status === 'Completed')) return false;

      // Search Query
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
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Cashflow Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track Money to Collect, Vendor Payables, and Partial Installments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('payment_pay')}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            + Pay Out
          </button>
          <button
            onClick={() => openQuickAdd('payment_collect')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            + Receive Payment
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>Money To Collect</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-slate-900">₹{metrics.totalToCollect.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Pending client receivables</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
            <span>Money To Pay</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-xl font-bold text-slate-900">₹{metrics.totalToPay.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Vendor & registry dues</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Overdue Amount</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-bold text-amber-700">
            ₹{(metrics.overduePaymentsAmount + metrics.overdueCollectionsAmount).toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Needs immediate follow-up</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
            <span>Collected This Month</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-slate-900">₹{metrics.collectedThisMonth.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Cleared in bank</span>
        </div>
      </div>

      {/* Main Filter & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({payments.filter(p => !p.archived).length})
            </button>
            <button
              onClick={() => setActiveTab('to_collect')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'to_collect' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              To Collect ({payments.filter(p => !p.archived && p.type === 'to_collect').length})
            </button>
            <button
              onClick={() => setActiveTab('to_pay')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'to_pay' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              To Pay ({payments.filter(p => !p.archived && p.type === 'to_pay').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client, project, amount..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Timeframe & Criteria Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Due Timeframe:</span>
          {[
            { id: 'all', label: 'All Due Dates' },
            { id: 'today', label: 'Due Today' },
            { id: '3days', label: 'Next 3 Days' },
            { id: '7days', label: 'Next 7 Days' },
            { id: '30days', label: 'Next 30 Days' },
            { id: 'overdue', label: '⚠️ Overdue Only' },
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframeFilter(tf.id as any)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                timeframeFilter === tf.id
                  ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tf.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedPartner}
              onChange={e => setSelectedPartner(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Partner: All</option>
              {partners.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="date_asc">Sort: Due Date (Earliest)</option>
              <option value="date_desc">Sort: Due Date (Latest)</option>
              <option value="amount_desc">Sort: Amount (High to Low)</option>
              <option value="amount_asc">Sort: Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Cards List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No payments match your active filters</p>
            <p className="text-xs text-slate-500 mt-1">Try changing the date range, status, or search keywords.</p>
          </div>
        ) : (
          filteredPayments.map(p => {
            const isCollect = p.type === 'to_collect';
            const remaining = p.remainingAmount !== undefined ? p.remainingAmount : (p.amount - p.amountCompleted);
            const isOverdue = p.dueDate < todayStr && p.status !== 'Completed';

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isOverdue
                    ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${
                      isCollect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isCollect ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{p.clientName}</h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                          p.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : p.status === 'Overdue' || isOverdue
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : p.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {isOverdue && p.status !== 'Completed' ? '⚠️ Overdue' : p.status}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          Assigned: {p.assignedTo}
                        </span>
                      </div>

                      {p.propertyName && (
                        <p className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.propertyName}</span>
                        </p>
                      )}

                      {p.description && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{p.description}</p>
                      )}

                      {p.notes && (
                        <p className="text-[11px] text-slate-500 italic">Note: {p.notes}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong className="text-slate-800">{p.dueDate}</strong>
                        </span>
                        {p.phone && (
                          <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-slate-800 font-medium hover:underline">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {p.phone}
                          </a>
                        )}
                        <span>Created by: {p.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Financials & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1 sm:justify-end">
                        <span className="text-xs text-slate-500">Total:</span>
                        <span className="text-lg font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {p.amountCompleted > 0 && (
                        <div className="text-xs text-emerald-700 font-medium">
                          Paid: ₹{p.amountCompleted.toLocaleString('en-IN')}
                        </div>
                      )}
                      
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        Balance Due: ₹{remaining.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => openRecordPaymentModal(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                          Record Pay
                        </button>
                      )}

                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkCompleted(p)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Mark Fully Completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setViewingPayment(p)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                        title="View Details & Transaction History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deletePayment(p.id, true)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Details & Transaction History Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{viewingPayment.clientName}</h3>
                <p className="text-xs text-slate-500">{viewingPayment.type === 'to_collect' ? 'Money to Collect (Receivable)' : 'Money to Pay (Payable)'}</p>
              </div>
              <button 
                onClick={() => setViewingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-1">Total</span>
                <span className="text-sm font-bold text-slate-900">₹{viewingPayment.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block mb-1">Paid</span>
                <span className="text-sm font-bold text-emerald-800">₹{(viewingPayment.amountCompleted || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] text-amber-900 block mb-1">Remaining</span>
                <span className="text-sm font-bold text-amber-900">₹{(viewingPayment.remainingAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Audit Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
              {viewingPayment.propertyName && <div><strong className="text-slate-900">Property / Project:</strong> {viewingPayment.propertyName}</div>}
              {viewingPayment.description && <div><strong className="text-slate-900">Description:</strong> {viewingPayment.description}</div>}
              {viewingPayment.notes && <div><strong className="text-slate-900">Notes:</strong> {viewingPayment.notes}</div>}
              <div><strong className="text-slate-900">Due Date:</strong> {viewingPayment.dueDate}</div>
              <div><strong className="text-slate-900">Created By:</strong> {viewingPayment.createdBy} on {new Date(viewingPayment.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Partial Payment Transactions History */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Transaction History ({viewingPayment.transactions?.length || 0})
              </h4>
              {(!viewingPayment.transactions || viewingPayment.transactions.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No partial transactions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewingPayment.transactions.map((tx, idx) => (
                    <div key={tx.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-800">₹{tx.amount.toLocaleString('en-IN')}</span>
                        <span className="text-slate-500 ml-2">via {tx.paymentMethod}</span>
                        {tx.notes && <p className="text-[11px] text-slate-600 mt-0.5">{tx.notes}</p>}
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <span>{tx.transactionDate}</span>
                        <p className="text-[10px]">by {tx.recordedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
