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
      t.category.toLowerCase().includes(q) ||
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

  const handleSelectResult = (section: NavigationSection) => {
    setCurrentSection(section);
    setIsGlobalSearchOpen(false);
  };

  const totalResults = 
    searchResults.payments.length + 
    searchResults.chits.length + 
    searchResults.notes.length + 
    searchResults.tasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search payments, clients, properties, chits, notes, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm md:text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded-md">
            ESC
          </kbd>
          <button 
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 sm:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query.trim() && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Universal Partner Search</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Type any client name, project name, chit number, note keyword, or task to find it instantly.
              </p>
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by client name, project name, or chit reference number.</p>
            </div>
          )}

          {/* PAYMENTS RESULTS */}
          {searchResults.payments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Payments & Receivables ({searchResults.payments.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.payments.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectResult('payments')}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        p.type === 'to_collect' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {p.type === 'to_collect' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{p.clientName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">{p.status}</span>
                        </div>
                        <p className="text-xs text-slate-500">{p.propertyName || p.description || 'Payment record'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">₹{p.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500">Due {p.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHITS RESULTS */}
          {searchResults.chits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Chit Records ({searchResults.chits.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.chits.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectResult('chits')}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{c.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-mono font-semibold">{c.referenceNumber}</span>
                        </div>
                        <p className="text-xs text-slate-500">{c.personName} • {c.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">₹{c.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES RESULTS */}
          {searchResults.notes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Notes & Deals ({searchResults.notes.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.notes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleSelectResult('notes')}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-slate-900">{n.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-semibold">{n.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 pl-6">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS RESULTS */}
          {searchResults.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Daily Tasks ({searchResults.tasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectResult('tasks')}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className={`text-sm font-semibold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {t.title}
                        </span>
                        <p className="text-xs text-slate-500">{t.assignedTo} • Due {t.dueDate}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Click any item to open directly</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
