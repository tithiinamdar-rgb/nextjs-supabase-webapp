'use client';

import React, { useState, useEffect } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Phone, 
  Building2, 
  User, 
  IndianRupee,
  Tag,
  Plus
} from 'lucide-react';
import { PaymentType, TaskPriority } from '@/types';

export default function QuickAddModal() {
  const { 
    isQuickAddOpen, 
    setIsQuickAddOpen, 
    quickAddDefaultTab,
    addPayment, 
    addChit, 
    addNote, 
    addTask,
    activePartner,
    partners 
  } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'payment_collect' | 'payment_pay' | 'chit' | 'note' | 'task'>(quickAddDefaultTab);

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddDefaultTab);
    }
  }, [isQuickAddOpen, quickAddDefaultTab]);

  // Payment State
  const [payClient, setPayClient] = useState('');
  const [payProperty, setPayProperty] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDueDate, setPayDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [payDescription, setPayDescription] = useState('');
  const [payPhone, setPayPhone] = useState('');
  const [payAssigned, setPayAssigned] = useState('Both Partners');
  const [payNotes, setPayNotes] = useState('');

  // Chit State
  const [chitTitle, setChitTitle] = useState('');
  const [chitRef, setChitRef] = useState('');
  const [chitPerson, setChitPerson] = useState('');
  const [chitAmount, setChitAmount] = useState('');
  const [chitDate, setChitDate] = useState(new Date().toISOString().split('T')[0]);
  const [chitMaturity, setChitMaturity] = useState('');
  const [chitCategory, setChitCategory] = useState('Property Chit');
  const [chitDesc, setChitDesc] = useState('');

  // Note State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Deals');
  const [noteTags, setNoteTags] = useState('');
  const [notePinned, setNotePinned] = useState(false);

  // Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('11:00 AM');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskAssigned, setTaskAssigned] = useState('Both Partners');
  const [taskCategory, setTaskCategory] = useState('Site Visit');

  if (!isQuickAddOpen) return null;

  const handleCreatePayment = async (e: React.FormEvent, type: PaymentType) => {
    e.preventDefault();
    if (!payClient || !payAmount) return;

    await addPayment({
      type,
      clientName: payClient,
      propertyName: payProperty || undefined,
      amount: parseFloat(payAmount),
      dueDate: payDueDate,
      description: payDescription || undefined,
      phone: payPhone || undefined,
      assignedTo: payAssigned,
      status: 'Upcoming',
      notes: payNotes || undefined,
      createdBy: activePartner.name,
    });

    resetForms();
    setIsQuickAddOpen(false);
  };

  const handleCreateChit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chitTitle || !chitPerson || !chitAmount) return;

    await addChit({
      title: chitTitle,
      referenceNumber: chitRef || `CHT-${Date.now().toString().slice(-4)}`,
      personName: chitPerson,
      amount: parseFloat(chitAmount),
      date: chitDate,
      maturityDate: chitMaturity || undefined,
      category: chitCategory,
      description: chitDesc || undefined,
      status: 'Active',
      createdBy: activePartner.name,
    });

    resetForms();
    setIsQuickAddOpen(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;

    const tagsArray = noteTags.split(',').map(t => t.trim()).filter(Boolean);

    await addNote({
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      tags: tagsArray,
      pinned: notePinned,
      createdBy: activePartner.name,
    });

    resetForms();
    setIsQuickAddOpen(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    await addTask({
      title: taskTitle,
      description: taskDesc || undefined,
      dueDate: taskDueDate,
      dueTime: taskDueTime || undefined,
      priority: taskPriority,
      assignedTo: taskAssigned,
      category: taskCategory,
      status: 'Pending',
      createdBy: activePartner.name,
    });

    resetForms();
    setIsQuickAddOpen(false);
  };

  const resetForms = () => {
    setPayClient('');
    setPayProperty('');
    setPayAmount('');
    setPayDescription('');
    setPayPhone('');
    setPayNotes('');
    setChitTitle('');
    setChitRef('');
    setChitPerson('');
    setChitAmount('');
    setChitDesc('');
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setNotePinned(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Quick Add to Partner Desk</h3>
              <p className="text-xs text-slate-500">Record an item instantly</p>
            </div>
          </div>
          <button 
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/30 overflow-x-auto scrollbar-none px-4 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('payment_collect')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === 'payment_collect'
                ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            To Collect (Receive)
          </button>
          <button
            onClick={() => setActiveTab('payment_pay')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === 'payment_pay'
                ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            To Pay (Expense)
          </button>
          <button
            onClick={() => setActiveTab('chit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === 'chit'
                ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Chit Record
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === 'task'
                ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            Daily Task
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === 'note'
                ? 'border-slate-900 text-slate-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            Note / Deal
          </button>
        </div>

        {/* Tab Forms Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* MONEY TO COLLECT */}
          {activeTab === 'payment_collect' && (
            <form onSubmit={(e) => handleCreatePayment(e, 'to_collect')} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Client / Person Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Singhal"
                      value={payClient}
                      onChange={e => setPayClient(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500000"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-semibold focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Property / Project Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. DLF Villa #42"
                      value={payProperty}
                      onChange={e => setPayProperty(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Due Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={payDueDate}
                      onChange={e => setPayDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={payPhone}
                      onChange={e => setPayPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Assigned Partner</label>
                  <select
                    value={payAssigned}
                    onChange={e => setPayAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                  >
                    <option value="Both Partners">Both Partners</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Description & Deal Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Token advance received via cheque, balance registry installment..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                >
                  Save Collection Record
                </button>
              </div>
            </form>
          )}

          {/* MONEY TO PAY */}
          {activeTab === 'payment_pay' && (
            <form onSubmit={(e) => handleCreatePayment(e, 'to_pay')} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Payee / Vendor / Party *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Cement Suppliers"
                      value={payClient}
                      onChange={e => setPayClient(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Amount to Pay (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-600" />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 150000"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-semibold focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Property / Project / Bill Ref</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Sunrise Arcade Site Work"
                      value={payProperty}
                      onChange={e => setPayProperty(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Payment Due Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={payDueDate}
                      onChange={e => setPayDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={payPhone}
                      onChange={e => setPayPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Assigned Partner</label>
                  <select
                    value={payAssigned}
                    onChange={e => setPayAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                  >
                    <option value="Both Partners">Both Partners</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Invoice Details & Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Raw material bill #204, verify weighbridge slip before bank transfer..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  Save Payable Record
                </button>
              </div>
            </form>
          )}

          {/* CHIT RECORD */}
          {activeTab === 'chit' && (
            <form onSubmit={handleCreateChit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Chit Title / Group Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50-Lakh Business Group Chit #A"
                    value={chitTitle}
                    onChange={e => setChitTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Total Chit Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000000"
                      value={chitAmount}
                      onChange={e => setChitAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Person / Organizer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shri Balaji Chit Fund / Vikas Gupta"
                    value={chitPerson}
                    onChange={e => setChitPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Chit / Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CHT-2026-08A"
                    value={chitRef}
                    onChange={e => setChitRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Category</label>
                  <select
                    value={chitCategory}
                    onChange={e => setChitCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  >
                    <option value="Property Chit">Property Chit</option>
                    <option value="Group Chit">Group Chit</option>
                    <option value="Personal Chit">Personal Chit</option>
                    <option value="Escrow Advance">Escrow Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={chitDate}
                    onChange={e => setChitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Maturity Date</label>
                  <input
                    type="date"
                    value={chitMaturity}
                    onChange={e => setChitMaturity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Description & Terms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monthly installment Rs. 2,00,000 for 25 months, 10th month auction scheduled..."
                  value={chitDesc}
                  onChange={e => setChitDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                >
                  Save Chit Record
                </button>
              </div>
            </form>
          )}

          {/* DAILY TASK */}
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site inspection with Dr. Sen at DLF Crest"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Due Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={taskDueTime}
                    onChange={e => setTaskDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">⚪ Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Assign Partner</label>
                  <select
                    value={taskAssigned}
                    onChange={e => setTaskAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  >
                    <option value="Both Partners">Both Partners</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Category</label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  >
                    <option value="Site Visit">Site Visit</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Legal / Registry">Legal / Registry</option>
                    <option value="Banking & Cheque">Banking & Cheque</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Task Description / Checklist</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pick up keys from guard room, bring project brochure..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}

          {/* NOTE / DEAL */}
          {activeTab === 'note' && (
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Terms for Commercial Lease Deal with Fortis"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Category / Folder</label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none"
                  >
                    <option value="Deals">Deals</option>
                    <option value="Properties">Properties</option>
                    <option value="Clients">Clients</option>
                    <option value="Meetings">Meetings</option>
                    <option value="Leads">Leads</option>
                    <option value="Important">Important</option>
                    <option value="Personal">Personal</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1.5">Tags (comma-separated)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Lease, Luxury, VIP, Sector 82"
                      value={noteTags}
                      onChange={e => setNoteTags(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1.5">Note Content & Details</label>
                <textarea
                  rows={4}
                  placeholder="Enter meeting notes, negotiation points, client contact details or agreement terms..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="note-pinned"
                  checked={notePinned}
                  onChange={e => setNotePinned(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
                <label htmlFor="note-pinned" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Pin this note to the top of dashboard
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
