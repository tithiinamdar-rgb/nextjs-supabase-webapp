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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Notifications & Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Mark all read
              </button>
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No active notifications or overdue reminders.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    n.read 
                      ? 'bg-slate-900/40 border-slate-800/40 opacity-60' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-xs">{n.title}</h4>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
