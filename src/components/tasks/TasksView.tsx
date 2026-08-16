'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  User, 
  FastForward,
  Check
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus } from '@/types';

export default function TasksView() {
  const { 
    tasks, 
    openQuickAdd, 
    updateTask, 
    deleteTask, 
    toggleTaskComplete, 
    moveTaskToTomorrow,
    partners 
  } = usePartnerStore();

  const [activeView, setActiveView] = useState<'today' | 'tomorrow' | 'week' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('High');
  const [editAssigned, setEditAssigned] = useState('Both Partners');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Pending');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Partner filter
      if (selectedPartner !== 'all' && t.assignedTo !== selectedPartner && t.assignedTo !== 'Both Partners') return false;

      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // View filter
      if (activeView === 'today') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
        if (t.dueDate !== todayStr) return false;
      } else if (activeView === 'tomorrow') {
        if (t.dueDate !== tomorrowStr || t.status === 'Completed') return false;
      } else if (activeView === 'week') {
        if (t.dueDate < todayStr || t.dueDate > in7Days || t.status === 'Completed') return false;
      } else if (activeView === 'upcoming') {
        if (t.dueDate <= todayStr || t.status === 'Completed') return false;
      } else if (activeView === 'overdue') {
        if (t.dueDate >= todayStr || t.status === 'Completed' || t.status === 'Cancelled') return false;
      } else if (activeView === 'completed') {
        if (t.status !== 'Completed') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, activeView, selectedPartner, selectedPriority, searchQuery, todayStr, tomorrowStr, in7Days]);

  const handleOpenEdit = (t: TaskItem) => {
    setEditingTask(t);
    setEditTitle(t.title);
    setEditDesc(t.description || '');
    setEditDueDate(t.dueDate);
    setEditDueTime(t.dueTime || '');
    setEditPriority(t.priority);
    setEditAssigned(t.assignedTo);
    setEditStatus(t.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: editTitle,
      description: editDesc,
      dueDate: editDueDate,
      dueTime: editDueTime,
      priority: editPriority,
      assignedTo: editAssigned,
      status: editStatus,
    });

    setEditingTask(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily To-Do & Task Scheduler</h1>
          <p className="text-xs text-slate-500 mt-0.5">Site Visits, Client Meetings, Registry Drafts & Follow-ups</p>
        </div>

        <button
          onClick={() => openQuickAdd('task')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-400 stroke-[2.5]" />
          + New Task
        </button>
      </div>

      {/* View Tabs & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        {/* Navigation Views */}
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none gap-1">
          {[
            { id: 'today', label: 'Today', count: tasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length },
            { id: 'tomorrow', label: 'Tomorrow', count: tasks.filter(t => t.dueDate === tomorrowStr && t.status !== 'Completed').length },
            { id: 'week', label: 'This Week', count: tasks.filter(t => t.dueDate >= todayStr && t.dueDate <= in7Days && t.status !== 'Completed').length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter(t => t.dueDate > todayStr && t.status !== 'Completed').length },
            { id: 'overdue', label: '⚠️ Overdue', count: tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length },
            { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length },
            { id: 'all', label: 'All Tasks', count: tasks.length },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === view.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{view.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeView === view.id ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {view.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPartner}
              onChange={e => setSelectedPartner(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Partner: All</option>
              {partners.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Priority: All</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">⚪ Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No tasks in this view</p>
            <p className="text-xs text-slate-500 mt-1">Add a new daily task with &ldquo;+ New Task&rdquo; to stay organized.</p>
          </div>
        ) : (
          filteredTasks.map(t => {
            const isDone = t.status === 'Completed';
            const isOverdue = t.dueDate < todayStr && !isDone;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone 
                    ? 'bg-slate-50/70 border-slate-200 opacity-60' 
                    : isOverdue
                    ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Left Task Content */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleTaskComplete(t.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      isDone 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'border-slate-300 hover:border-slate-600 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-semibold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.title}
                      </h3>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        t.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : t.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {t.category}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{t.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-700 font-bold' : ''}`}>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due: {t.dueDate}
                      </span>
                      {t.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {t.dueTime}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.assignedTo}
                      </span>
                      <span>Created by {t.createdBy}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {!isDone && (
                    <button
                      onClick={() => moveTaskToTomorrow(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Move to Tomorrow"
                    >
                      <FastForward className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tomorrow</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleSaveEdit} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Daily Task</h3>
              <button type="button" onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Task Title</label>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Time</label>
                <input
                  type="text"
                  value={editDueTime}
                  onChange={e => setEditDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Partner</label>
                <select
                  value={editAssigned}
                  onChange={e => setEditAssigned(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="Both Partners">Both Partners</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
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
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
