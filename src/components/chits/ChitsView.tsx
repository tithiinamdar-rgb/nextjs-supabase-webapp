'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Layers, 
  Plus, 
  Search, 
  Calendar, 
  IndianRupee, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Clock
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

  const totalActiveCapital = useMemo(() => {
    return chits
      .filter(c => !c.archived && c.status === 'Active')
      .reduce((sum, c) => sum + c.amount, 0);
  }, [chits]);

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
      title: editTitle,
      amount: parseFloat(editAmount),
      personName: editPerson,
      status: editStatus,
      description: editDesc,
    });

    setIsEditing(false);
    setSelectedChit(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chits Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              Dedicated Financial System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent ledger for group auctions, property escrow chits, and capital pooling
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('chit')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          + New Chit Record
        </button>
      </div>

      {/* Summary Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold block mb-1">Total Active Chit Capital</span>
          <span className="text-2xl font-bold text-slate-900">₹{totalActiveCapital.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Total revolving pooled funds</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-600 font-semibold block mb-1">Active Accounts</span>
          <span className="text-2xl font-bold text-slate-900">
            {chits.filter(c => !c.archived && c.status === 'Active').length}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Currently running</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-600 font-semibold block mb-1">Matured / Completed</span>
          <span className="text-2xl font-bold text-slate-900">
            {chits.filter(c => !c.archived && (c.status === 'Matured' || c.status === 'Closed')).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Archived & closed chits</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, person, ref number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Category: All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Matured">Matured</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount_desc">Sort: Amount (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChits.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No chit records found</p>
            <p className="text-xs text-slate-500 mt-1">Click &ldquo;+ New Chit Record&rdquo; to add your first chit entry.</p>
          </div>
        ) : (
          filteredChits.map(c => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                          {c.referenceNumber}
                        </span>
                        <span className="text-xs text-slate-500">{c.category}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Chit Value / Pool</span>
                    <span className="text-lg font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Organized / Handled By</span>
                    <span className="text-xs font-bold text-slate-800">{c.personName}</span>
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {c.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Start: {c.date}
                  </span>
                  {c.maturityDate && (
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Matures: {c.maturityDate}
                    </span>
                  )}
                  <span>By: {c.createdBy}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedChit(c)}
                  className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Edit Chit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteChit(c.id, true)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Chit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chit Details Modal */}
      {selectedChit && !isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedChit.title}</h3>
                <span className="text-xs text-amber-900 font-mono font-semibold">{selectedChit.referenceNumber}</span>
              </div>
              <button onClick={() => setSelectedChit(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-900 block font-medium">Chit Value</span>
                <span className="text-xl font-bold text-slate-900">₹{selectedChit.amount.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-amber-200 text-amber-900 font-semibold">{selectedChit.status}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div><strong className="text-slate-900">Person / Fund Manager:</strong> {selectedChit.personName}</div>
              <div><strong className="text-slate-900">Category:</strong> {selectedChit.category}</div>
              <div><strong className="text-slate-900">Start Date:</strong> {selectedChit.date}</div>
              {selectedChit.maturityDate && <div><strong className="text-slate-900">Maturity Date:</strong> {selectedChit.maturityDate}</div>}
              {selectedChit.description && <div><strong className="text-slate-900">Terms & Details:</strong> {selectedChit.description}</div>}
              <div><strong className="text-slate-900">Created by:</strong> {selectedChit.createdBy} on {new Date(selectedChit.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(selectedChit)}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Chit
              </button>
              <button
                onClick={() => setSelectedChit(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {selectedChit && isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Chit Record</h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Chit Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as ChitStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Matured">Matured</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Person / Fund Manager</label>
              <input
                type="text"
                required
                value={editPerson}
                onChange={e => setEditPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description & Terms</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
