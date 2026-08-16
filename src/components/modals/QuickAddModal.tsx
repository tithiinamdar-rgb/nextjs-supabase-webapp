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
  IndianRupee,
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
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskAssigned, setTaskAssigned] = useState('Both Partners');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
  };

  const handleCreatePayment = async (type: PaymentType) => {
    if (!payClient.trim() || !payAmount) return;
    setIsSubmitting(true);
    try {
      await addPayment({
        type,
        clientName: payClient.trim(),
        propertyName: payProperty.trim() || undefined,
        amount: Number(payAmount),
        dueDate: payDueDate,
        description: payDescription.trim() || undefined,
        phone: payPhone.trim() || undefined,
        assignedTo: payAssigned,
        status: 'Upcoming',
        notes: payNotes.trim() || undefined,
        createdBy: activePartner.name,
      });
      setPayClient('');
      setPayProperty('');
      setPayAmount('');
      setPayDescription('');
      setPayPhone('');
      setPayNotes('');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChit = async () => {
    if (!chitTitle.trim() || !chitAmount) return;
    setIsSubmitting(true);
    try {
      await addChit({
        title: chitTitle.trim(),
        referenceNumber: chitRef.trim() || `CHT-${Math.floor(1000 + Math.random() * 9000)}`,
        personName: chitPerson.trim() || activePartner.name,
        amount: Number(chitAmount),
        date: chitDate,
        maturityDate: chitMaturity || undefined,
        category: chitCategory,
        description: chitDesc.trim() || undefined,
        status: 'Active',
        createdBy: activePartner.name,
      });
      setChitTitle('');
      setChitRef('');
      setChitPerson('');
      setChitAmount('');
      setChitDesc('');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await addNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        tags: noteTags ? noteTags.split(',').map(t => t.trim()) : [],
        pinned: notePinned,
        createdBy: activePartner.name,
      });
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setNotePinned(false);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await addTask({
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        dueDate: taskDueDate,
        dueTime: taskDueTime || undefined,
        priority: taskPriority,
        assignedTo: taskAssigned,
        category: 'General',
        status: 'Pending',
        createdBy: activePartner.name,
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueTime('');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/40">
          <div>
            <h2 className="text-sm font-bold text-white">Create New Entry</h2>
            <p className="text-[10px] text-slate-400">Add payment, chit, note, or task</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'payment_collect', label: 'Receive Payment', icon: ArrowDownLeft },
            { id: 'payment_pay', label: 'Pay Out', icon: ArrowUpRight },
            { id: 'chit', label: 'Chit Record', icon: Layers },
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'note', label: 'Note / Deal', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* 1. PAYMENTS FORM */}
          {(activeTab === 'payment_collect' || activeTab === 'payment_pay') && (
            <form onSubmit={e => { e.preventDefault(); handleCreatePayment(activeTab === 'payment_collect' ? 'to_collect' : 'to_pay'); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Party / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={payClient}
                    onChange={e => setPayClient(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={payDueDate}
                    onChange={e => setPayDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Property / Project (Optional)</label>
                  <input
                    type="text"
                    value={payProperty}
                    onChange={e => setPayProperty(e.target.value)}
                    placeholder="e.g. Plot #45 Green Valley"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Partner</label>
                  <select
                    value={payAssigned}
                    onChange={e => setPayAssigned(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Both Partners">Both Partners</option>
                    {partners.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={payPhone}
                    onChange={e => setPayPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save {activeTab === 'payment_collect' ? 'Receivable' : 'Payable'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. CHIT FORM */}
          {activeTab === 'chit' && (
            <form onSubmit={e => { e.preventDefault(); handleCreateChit(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chit Title *</label>
                  <input
                    type="text"
                    required
                    value={chitTitle}
                    onChange={e => setChitTitle(e.target.value)}
                    placeholder="e.g. 50L Commercial Chit"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chit Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={chitAmount}
                    onChange={e => setChitAmount(e.target.value)}
                    placeholder="5000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Person / Holder</label>
                  <input
                    type="text"
                    value={chitPerson}
                    onChange={e => setChitPerson(e.target.value)}
                    placeholder={activePartner.name}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={chitCategory}
                    onChange={e => setChitCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Property Chit">Property Chit</option>
                    <option value="Group Chit">Group Chit</option>
                    <option value="Personal Chit">Personal Chit</option>
                    <option value="Escrow Advance">Escrow Advance</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Chit Record</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. TASK FORM */}
          {activeTab === 'task' && (
            <form onSubmit={e => { e.preventDefault(); handleCreateTask(); }} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Site visit with client at 4 PM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. NOTE FORM */}
          {activeTab === 'note' && (
            <form onSubmit={e => { e.preventDefault(); handleCreateNote(); }} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. Sharma Deal Terms"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Enter deal terms, meeting notes, or client discussion..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
