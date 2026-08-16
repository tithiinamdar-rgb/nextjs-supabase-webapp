'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Copy, 
  Check,
  X
} from 'lucide-react';
import { NoteItem } from '@/types';

export default function NotesView() {
  const { notes, openQuickAdd, updateNote, deleteNote, togglePinNote } = usePartnerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Deals');
  const [editContent, setEditContent] = useState('');

  const standardCategories = ['All', 'Deals', 'Properties', 'Clients', 'Meetings', 'Important'];

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (n.archived) return false;
      if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags && n.tags.some(t => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleCopyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;
    await updateNote(selectedNote.id, {
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
    });
    setIsEditing(false);
    setSelectedNote(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Notes & Deals</h1>
          <p className="text-xs text-slate-400 mt-0.5">Meeting Memos, Land Deals & Key Contacts</p>
        </div>
        <button
          onClick={() => openQuickAdd('note')}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Categories */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {standardCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 bg-[#0f172a] border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-500">No notes recorded.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className={`bg-[#0f172a] border rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between ${
                note.pinned ? 'border-amber-500/40 bg-slate-900/90' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        note.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={note.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyNote(note)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Copy note"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white text-xs mb-1.5">{note.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-5">
                  {note.content}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>By {note.createdBy}</span>
                <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditing && selectedNote && (
        <div 
          onClick={() => setIsEditing(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Edit Note</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                >
                  {standardCategories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Content</label>
                <textarea
                  rows={5}
                  required
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none resize-none"
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
