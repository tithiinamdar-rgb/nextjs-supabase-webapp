'use client';

import React, { useState, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FastForward,
  Check,
  X,
  Camera
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus } from '@/types';

export default function TasksView() {
  const { 
    tasks, 
    openQuickAdd, 
    openPhotoReminderModal,
    updateTask, 
    deleteTask, 
    toggleTaskComplete, 
    moveTaskToTomorrow,
    partners 
  } = usePartnerStore();

  const [activeView, setActiveView] = useState<'today' | 'tomorrow' | 'week' | 'overdue' | 'completed' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('High');
  const [editAssigned, setEditAssigned] = useState('Both Partners');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Pending');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedPartner !== 'all' && t.assignedTo !== selectedPartner && t.assignedTo !== 'Both Partners') return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      if (activeView === 'today') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
        if (t.dueDate !== todayStr) return false;
      } else if (activeView === 'tomorrow') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
        if (t.dueDate !== tomorrowStr) return false;
      } else if (activeView === 'week') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
        if (t.dueDate < todayStr || t.dueDate > in7Days) return false;
      } else if (activeView === 'overdue') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
        if (t.dueDate >= todayStr) return false;
      } else if (activeView === 'completed') {
        if (t.status !== 'Completed') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, activeView, selectedPartner, selectedPriority, searchQuery, todayStr, tomorrowStr, in7Days]);

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate);
    setEditPriority(task.priority);
    setEditAssigned(task.assignedTo);
    setEditStatus(task.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: editTitle.trim(),
      dueDate: editDueDate,
      priority: editPriority,
      assignedTo: editAssigned,
      status: editStatus,
    });
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Daily To-Do Tasks</h1>
          <p className="text-xs text-slate-400 mt-0.5">Site Visits, Client Follow-ups & Reminders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPhotoReminderModal()}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snap Reminder</span>
          </button>
          <button
            onClick={() => openQuickAdd('task')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto w-full md:w-fit">
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'week', label: 'Next 7 Days' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeView === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-12 bg-[#0f172a] border border-slate-800/80 rounded-xl text-center">
            <p className="text-xs text-slate-500">No tasks in this view.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`bg-[#0f172a] border rounded-xl p-3.5 transition-all shadow-sm flex items-center justify-between gap-3 ${
                  isDone ? 'border-slate-800/40 opacity-60' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      isDone ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  {task.imageUrl && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                      <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="truncate">
                    <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-slate-600' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span>📅 {task.dueDate}</span>
                      <span>👤 {task.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    task.priority === 'High' ? 'bg-rose-950/60 text-rose-400 border border-rose-900/60' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {task.priority}
                  </span>

                  {!isDone && (
                    <button
                      onClick={() => moveTaskToTomorrow(task.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                      title="Move to tomorrow"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                    title="Edit task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 text-xs transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div 
          onClick={() => setEditingTask(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
