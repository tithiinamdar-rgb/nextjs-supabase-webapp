'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { X, IndianRupee, CreditCard, FileText } from 'lucide-react';

export default function RecordPaymentModal() {
  const { 
    isRecordPaymentOpen, 
    closeRecordPaymentModal, 
    recordPaymentTarget, 
    recordPaymentTransaction,
  } = usePartnerStore();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer (RTGS/NEFT)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isRecordPaymentOpen || !recordPaymentTarget) return null;

  const remaining = recordPaymentTarget.remainingAmount !== undefined 
    ? recordPaymentTarget.remainingAmount 
    : (recordPaymentTarget.amount - recordPaymentTarget.amountCompleted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await recordPaymentTransaction(recordPaymentTarget.id, numAmount, method, notes);
      closeRecordPaymentModal();
      setAmount('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullPaymentClick = () => {
    setAmount(remaining.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              recordPaymentTarget.type === 'to_collect' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {recordPaymentTarget.type === 'to_collect' ? 'Receive Payment' : 'Record Pay-Out'}
              </h3>
              <p className="text-xs text-slate-500">{recordPaymentTarget.clientName}</p>
            </div>
          </div>
          <button 
            onClick={closeRecordPaymentModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="p-6 bg-slate-50/30 border-b border-slate-100 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Total Amount</span>
              <span className="text-sm font-bold text-slate-900">₹{recordPaymentTarget.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block mb-1">Already Paid</span>
              <span className="text-sm font-bold text-emerald-800">₹{(recordPaymentTarget.amountCompleted || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[11px] text-amber-900 block mb-1">Remaining Due</span>
              <span className="text-sm font-bold text-amber-900">₹{remaining.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {recordPaymentTarget.propertyName && (
            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">Project / Property:</strong> {recordPaymentTarget.propertyName}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">Transaction Amount (₹) *</label>
              <button
                type="button"
                onClick={handleFullPaymentClick}
                className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Pay Full Balance (₹{remaining.toLocaleString('en-IN')})
              </button>
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                required
                min="1"
                max={remaining > 0 ? remaining : undefined}
                placeholder="Enter amount paid/received"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base font-bold focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Method</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
              >
                <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS/NEFT)</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI / Online Transfer">UPI / Online Transfer</option>
                <option value="Cash Token">Cash Token</option>
                <option value="Demand Draft (DD)">Demand Draft (DD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Transaction Notes & Reference</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                rows={2}
                placeholder="e.g. UTR #1234567890, Cheque #004521 HDFC Bank..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeRecordPaymentModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
