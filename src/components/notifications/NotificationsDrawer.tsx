'use client';

import React from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { X, Bell, AlertTriangle, Calendar, CheckSquare, CheckCircle, ArrowRight } from 'lucide-react';

export default function NotificationsDrawer() {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    setCurrentSection
  } = usePartnerStore();

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    if (n.section) {
      setCurrentSection(n.section);
      setIsNotificationsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Notifications & Alerts</h3>
                <p className="text-xs text-slate-500">{notifications.filter(n => !n.read).length} unread reminders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline px-2 py-1 cursor-pointer"
              >
                Mark all read
              </button>
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-600 opacity-60" />
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No overdue payments or pending reminders for today.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    n.read 
                      ? 'bg-slate-50/50 border-slate-100 opacity-70' 
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-800 flex-shrink-0 mt-0.5 border border-amber-200">
                      {n.type === 'overdue' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : n.type === 'task_due' ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Calendar className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Click to view record</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-center text-slate-500">
            Automated internal reminders for Partner 1 & Partner 2
          </div>
        </div>
      </div>
    </div>
  );
}
