'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Search, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  FileText, 
  CheckSquare, 
} from 'lucide-react';
import { NavigationSection } from '@/types';

export default function GlobalSearchModal() {
  const { 
    isGlobalSearchOpen, 
    setIsGlobalSearchOpen, 
    setCurrentSection,
    payments, 
    chits, 
    notes, 
    tasks,
  } = usePartnerStore();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { payments: [], chits: [], notes: [], tasks: [] };
    const q = query.toLowerCase();

    const matchedPayments = payments.filter(p => 
      !p.archived && (
        p.clientName.toLowerCase().includes(q) ||
        (p.propertyName && p.propertyName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        p.amount.toString().includes(q)
      )
    );

    const matchedChits = chits.filter(c => 
      !c.archived && (
        c.title.toLowerCase().includes(q) ||
        c.referenceNumber.toLowerCase().includes(q) ||
        c.personName.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      )
    );

    const matchedNotes = notes.filter(n => 
      !n.archived && (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
    );

    const matchedTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.assignedTo.toLowerCase().includes(q)
    );

    return {
      payments: matchedPayments,
      chits: matchedChits,
      notes: matchedNotes,
      tasks: matchedTasks,
    };
  }, [query, payments, chits, notes, tasks]);

  if (!isGlobalSearchOpen) return null;

  const totalResults = 
    searchResults.payments.length + 
    searchResults.chits.length + 
    searchResults.notes.length + 
    searchResults.tasks.length;

  const handleNavigate = (section: NavigationSection) => {
    setCurrentSection(section);
    setIsGlobalSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search payments, chits, notes, and tasks..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white cursor-pointer mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => { setIsGlobalSearchOpen(false); setQuery(''); }}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Type anything to search across all business records.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching records found for &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Payments */}
              {searchResults.payments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Payments ({searchResults.payments.length})
                  </span>
                  {searchResults.payments.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleNavigate('payments')}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {p.type === 'to_collect' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className="font-medium text-white">{p.clientName}</span>
                      </div>
                      <span className="font-bold text-white">₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chits */}
              {searchResults.chits.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Chits ({searchResults.chits.length})
                  </span>
                  {searchResults.chits.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleNavigate('chits')}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium text-white">{c.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({c.referenceNumber})</span>
                      </div>
                      <span className="font-bold text-white">₹{c.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {searchResults.tasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Tasks ({searchResults.tasks.length})
                  </span>
                  {searchResults.tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleNavigate('tasks')}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-white">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">📅 {t.dueDate}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {searchResults.notes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Notes ({searchResults.notes.length})
                  </span>
                  {searchResults.notes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNavigate('notes')}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-white">{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{n.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
