'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  Tag, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
} from 'lucide-react';
import { NoteItem } from '@/types';

export default function NotesView() {
  const { notes, openQuickAdd, updateNote, deleteNote, togglePinNote } = usePartnerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / View State
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Deals');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const standardCategories = [
    'All',
    'Deals',
    'Properties',
    'Clients',
    'Meetings',
    'Leads',
    'Important',
    'Personal',
    'Miscellaneous'
  ];

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => {
      if (!n.archived && n.tags) n.tags.forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (n.archived) return false;
      if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
      if (selectedTag !== 'All' && (!n.tags || !n.tags.includes(selectedTag))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pinned notes always first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, selectedCategory, selectedTag, searchQuery]);

  const handleCopyNote = (n: NoteItem) => {
    navigator.clipboard.writeText(`${n.title}\n\n${n.content}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (n: NoteItem) => {
    setSelectedNote(n);
    setEditTitle(n.title);
    setEditCategory(n.category);
    setEditContent(n.content);
    setEditTags(n.tags.join(', '));
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;

    const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean);

    await updateNote(selectedNote.id, {
      title: editTitle,
      category: editCategory,
      content: editContent,
      tags: tagsArr,
    });

    setIsEditing(false);
    setSelectedNote(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Notes & Deal Folders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Agreements, Client Terms, Negotiation Points, and Meeting Logs</p>
        </div>
        <button
          onClick={() => openQuickAdd('note')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-purple-400 stroke-[2.5]" />
          + New Note
        </button>
      </div>

      {/* Categories & Search Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords, agreements, client terms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {standardCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tag Filters if present */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-2 py-0.5 rounded-md text-[11px] cursor-pointer ${selectedTag === 'All' ? 'bg-slate-900 text-white font-medium' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2 py-0.5 rounded-md text-[11px] border transition-all cursor-pointer ${
                  selectedTag === t
                    ? 'bg-purple-50 border-purple-200 text-purple-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No notes found</p>
            <p className="text-xs text-slate-500 mt-1">Create your first deal note or meeting memo with &ldquo;+ New Note&rdquo;.</p>
          </div>
        ) : (
          filteredNotes.map(n => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group ${
                n.pinned ? 'border-amber-300/80 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    {n.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNote(n.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        n.pinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title={n.pinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyNote(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedId === n.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 
                  onClick={() => handleOpenEdit(n)}
                  className="font-bold text-slate-900 text-base mb-2 hover:text-purple-700 transition-colors cursor-pointer"
                >
                  {n.title}
                </h3>

                <p 
                  onClick={() => handleOpenEdit(n)}
                  className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap line-clamp-6 mb-3 cursor-pointer bg-slate-50/60 p-2.5 rounded-xl border border-slate-100"
                >
                  {n.content}
                </p>

                {/* Tags */}
                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {n.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {n.createdBy}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(n)}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
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

      {/* Edit Note Modal */}
      {selectedNote && isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Note / Deal Terms</h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Note Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
                >
                  {standardCategories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Content</label>
              <textarea
                rows={8}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-400"
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
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
