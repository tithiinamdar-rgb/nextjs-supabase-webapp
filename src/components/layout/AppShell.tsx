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
  ChevronDown
} from 'lucide-react';
import { NavigationSection } from '@/types';

// Modals & Pages
import LoginPage from '@/components/auth/LoginPage';
import QuickAddModal from '@/components/modals/QuickAddModal';
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row antialiased">
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 justify-between flex-shrink-0 min-h-screen sticky top-0 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 p-2 shadow-sm flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base tracking-tight leading-tight">
                Aashu&apos;s App
              </h2>
              <p className="text-[11px] text-amber-700 font-semibold tracking-wide">
                Real Estate Workspace
              </p>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => openQuickAdd()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 stroke-[2.5] group-hover:rotate-90 transition-transform" />
            <span>+ Add Record</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search</span>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-500">
                Ctrl+K
              </kbd>
            </button>
          </nav>
        </div>

        {/* User Profile Card & Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="relative">
            <button
              onClick={() => setIsPartnerMenuOpen(prev => !prev)}
              className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                  {activePartner.initials}
                </div>
                <div className="text-left truncate">
                  <span className="text-xs font-bold text-slate-900 block truncate">{activePartner.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{activePartner.role}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Partner Switcher Dropdown */}
            {isPartnerMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 animate-fadeIn z-50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-2 py-1 block">
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
                        ? 'bg-slate-100 text-slate-900 font-semibold' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
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
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                AA
              </div>
              <span className="font-bold text-slate-900 text-sm">Aashu&apos;s App</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Private Business Workspace</span>
              <span>•</span>
              <span className="text-slate-800 font-medium">Logged in: {activePartner.name}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Universal Search trigger */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Bell with unread badge */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Mobile / Tablet Quick Add */}
            <button
              onClick={() => openQuickAdd()}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Profile Avatar / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div 
                className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                title={`${activePartner.name} (${activePartner.email})`}
                onClick={() => setIsAuthModalOpen(true)}
              >
                {activePartner.initials}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content Container */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {currentSection === 'dashboard' && <MainDashboard />}
          {currentSection === 'payments' && <PaymentsView />}
          {currentSection === 'chits' && <ChitsView />}
          {currentSection === 'notes' && <NotesView />}
          {currentSection === 'tasks' && <TasksView />}
          {currentSection === 'settings' && <SettingsView />}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 flex items-center justify-around z-40 shadow-lg">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Global Modals */}
      <QuickAddModal />
      <GlobalSearchModal />
      <RecordPaymentModal />
      <NotificationsDrawer />
      <PartnerAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
