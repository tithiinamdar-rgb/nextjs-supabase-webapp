'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X,
  Check
} from 'lucide-react';
import { ChitItem, ChitStatus } from '@/types';

export default function ChitsView() {
  const { chits, openQuickAdd, updateChit, deleteChit } = usePartnerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc'>('newest');
  
  const [selectedChit, setSelectedChit] = useState<ChitItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editStatus, setEditStatus] = useState<ChitStatus>('Active');
  const [editDesc, setEditDesc] = useState('');

  const categories = ['Property Chit', 'Group Chit', 'Personal Chit', 'Escrow Advance'];

  const filteredChits = useMemo(() => {
    return chits.filter(c => {
      if (c.archived) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          c.title.toLowerCase().includes(q) ||
          c.referenceNumber.toLowerCase().includes(q) ||
          c.personName.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.amount.toString().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      return 0;
    });
  }, [chits, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleOpenEdit = (chit: ChitItem) => {
    setSelectedChit(chit);
    setEditTitle(chit.title);
    setEditAmount(chit.amount.toString());
    setEditPerson(chit.personName);
    setEditStatus(chit.status);
    setEditDesc(chit.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChit) return;
    await updateChit(selectedChit.id, {
      title: editTitle.trim(),
      amount: Number(editAmount),
      personName: editPerson.trim(),
      status: editStatus,
      description: editDesc.trim() || undefined,
    });
    setIsEditing(false);
    setSelectedChit(null);
  };

  const totalActiveCapital = chits
    .filter(c => c.status === 'Active' && !c.archived)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Chits Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track Running Chits and Financial Agreements</p>
        </div>
        <button
          onClick={() => openQuickAdd('chit')}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Chit Record</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Total Active Chit Capital</span>
          <span className="text-xl font-bold text-amber-400 block mt-1">₹{totalActiveCapital.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Running pools</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Active Chit Groups</span>
          <span className="text-xl font-bold text-white block mt-1">
            {chits.filter(c => c.status === 'Active' && !c.archived).length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Ongoing monthly commitments</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/80 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400 block">Matured / Closed</span>
          <span className="text-xl font-bold text-slate-400 block mt-1">
            {chits.filter(c => c.status === 'Matured' || c.status === 'Closed').length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Settled records</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chits by name, ref, or holder..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Matured">Matured</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Chits List */}
      <div className="space-y-2">
        {filteredChits.length === 0 ? (
          <div className="py-12 bg-[#0f172a] border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-500">No chit records found.</p>
          </div>
        ) : (
          filteredChits.map(chit => (
            <div
              key={chit.id}
              className="bg-[#0f172a] border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-xs">{chit.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono">
                      {chit.referenceNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {chit.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>👤 {chit.personName}</span>
                    <span>📂 {chit.category}</span>
                    <span>📅 Start: {chit.date}</span>
                    {chit.maturityDate && <span>⏳ Maturity: {chit.maturityDate}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <span className="text-xs font-bold text-white">
                  ₹{chit.amount.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(chit)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteChit(chit.id, true)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 text-xs transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditing && selectedChit && (
        <div 
          onClick={() => setIsEditing(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Edit Chit Record</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Chit Name</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Matured">Matured</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Person / Holder</label>
                <input
                  type="text"
                  required
                  value={editPerson}
                  onChange={e => setEditPerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
