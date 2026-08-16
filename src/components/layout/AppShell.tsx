'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  LayoutDashboard, 
  IndianRupee, 
  Layers, 
  FileText, 
  CheckSquare, 
  Search, 
  Settings, 
  Plus, 
  Bell, 
  LogOut, 
  Building2, 
  ShieldCheck, 
  ChevronDown,
  Camera
} from 'lucide-react';
import { NavigationSection } from '@/types';

// Modals & Pages
import LoginPage from '@/components/auth/LoginPage';
import QuickAddModal from '@/components/modals/QuickAddModal';
import PhotoReminderModal from '@/components/modals/PhotoReminderModal';
import GlobalSearchModal from '@/components/modals/GlobalSearchModal';
import RecordPaymentModal from '@/components/modals/RecordPaymentModal';
import NotificationsDrawer from '@/components/notifications/NotificationsDrawer';
import PartnerAuthModal from '@/components/auth/PartnerAuthModal';

// Views
import MainDashboard from '@/components/dashboard/MainDashboard';
import PaymentsView from '@/components/payments/PaymentsView';
import ChitsView from '@/components/chits/ChitsView';
import NotesView from '@/components/notes/NotesView';
import TasksView from '@/components/tasks/TasksView';
import SettingsView from '@/components/settings/SettingsView';

export default function AppShell() {
  const { 
    isAuthenticated,
    logout,
    currentSection, 
    setCurrentSection, 
    activePartner, 
    setActivePartner,
    partners, 
    openQuickAdd, 
    isPhotoReminderModalOpen,
    setIsPhotoReminderModalOpen,
    openPhotoReminderModal,
    setIsGlobalSearchOpen,
    setIsNotificationsOpen,
    unreadNotificationsCount 
  } = usePartnerStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);

  // If not authenticated, force the clean, password-only Login Page!
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const navItems: { id: NavigationSection; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payments', label: 'Payments', icon: IndianRupee },
    { id: 'chits', label: 'Chits', icon: Layers },
    { id: 'notes', label: 'Notes & Deals', icon: FileText },
    { id: 'tasks', label: 'Daily To-Do', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0b0f17] border-r border-slate-800/80 p-4 justify-between flex-shrink-0 min-h-screen sticky top-0">
        <div className="space-y-5">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 p-1.5 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-tight leading-tight">
                Aashu&apos;s App
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Real Estate Workspace
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => openPhotoReminderModal()}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Snap Reminder</span>
            </button>

            <button
              onClick={() => openQuickAdd()}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700/60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold shadow-xs border border-slate-700/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search</span>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400">
                Ctrl+K
              </kbd>
            </button>
          </nav>
        </div>

        {/* User Profile Card & Switcher */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="relative">
            <button
              onClick={() => setIsPartnerMenuOpen(prev => !prev)}
              className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {activePartner.initials}
                </div>
                <div className="text-left truncate">
                  <span className="text-xs font-bold text-white block truncate">{activePartner.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{activePartner.role}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {/* Partner Switcher Dropdown */}
            {isPartnerMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-[#0f172a] border border-slate-800 rounded-xl shadow-xl p-1.5 space-y-1 animate-fadeIn z-50">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold px-2 py-1 block">
                  Switch Partner Account
                </span>
                {partners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePartner(p);
                      setIsPartnerMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activePartner.id === p.id 
                        ? 'bg-slate-800 text-white font-semibold' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>{p.name} ({p.role})</span>
                    {activePartner.id === p.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#090d16]">
        {/* Top Header Bar */}
        <header className="h-14 px-6 border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs">
                AA
              </div>
              <span className="font-bold text-white text-sm">Aashu&apos;s App</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace</span>
              <span>•</span>
              <span className="text-slate-200 font-medium">{activePartner.name}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Snap reminder button */}
            <button
              onClick={() => openPhotoReminderModal()}
              className="p-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Snap & Set Reminder"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Snap</span>
            </button>

            {/* Universal Search trigger */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Bell with unread badge */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Mobile Quick Add */}
            <button
              onClick={() => openQuickAdd()}
              className="md:hidden p-1.5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Logout icon */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer ml-1"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Section Content Container */}
        <div className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          {currentSection === 'dashboard' && <MainDashboard />}
          {currentSection === 'payments' && <PaymentsView />}
          {currentSection === 'chits' && <ChitsView />}
          {currentSection === 'notes' && <NotesView />}
          {currentSection === 'tasks' && <TasksView />}
          {currentSection === 'settings' && <SettingsView />}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0b0f17]/95 backdrop-blur-md border-t border-slate-800 px-2 flex items-center justify-around z-40">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Global Modals */}
      <QuickAddModal />
      <PhotoReminderModal isOpen={isPhotoReminderModalOpen} onClose={() => setIsPhotoReminderModalOpen(false)} />
      <GlobalSearchModal />
      <RecordPaymentModal />
      <NotificationsDrawer />
      <PartnerAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
