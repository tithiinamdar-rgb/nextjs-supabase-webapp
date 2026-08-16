'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { X, IndianRupee, CreditCard } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/40">
          <div>
            <h3 className="font-bold text-white text-sm">
              Record {recordPaymentTarget.type === 'to_collect' ? 'Collection' : 'Payment'}
            </h3>
            <p className="text-[10px] text-slate-400">{recordPaymentTarget.clientName}</p>
          </div>
          <button
            onClick={closeRecordPaymentModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Target Info */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">Pending Balance</span>
              <span className="text-sm font-bold text-amber-400">₹{remaining.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              onClick={handleFullPaymentClick}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 cursor-pointer"
            >
              Pay Full Remaining
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              max={remaining}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Payment Mode</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS/NEFT)</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI / Online">UPI / Online</option>
              <option value="Cash">Cash</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Notes / Transaction Reference (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. HDFC Cheque #004128"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
            >
              <span>Confirm & Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
