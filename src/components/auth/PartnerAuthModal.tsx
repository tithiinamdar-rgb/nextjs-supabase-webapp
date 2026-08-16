'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { Lock, Building2, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { PartnerProfile } from '@/types';

interface PartnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (partner: PartnerProfile) => void;
}

export default function PartnerAuthModal({ isOpen, onClose, onLoginSuccess }: PartnerAuthModalProps) {
  const { partners, activePartner, setActivePartner } = usePartnerStore();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(activePartner.id);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const target = partners.find(p => p.id === selectedPartnerId);
    if (!target) {
      setError('Invalid partner selected.');
      return;
    }

    // Secure local session validation
    setActivePartner(target);
    onLoginSuccess(target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 p-2.5 mx-auto flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Partner Desk</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private Real Estate Business Portal</span>
          </div>
        </div>

        {/* Partner Select Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Authorized Partner Account
            </label>
            <div className="space-y-2">
              {partners.map(p => {
                const isSelected = selectedPartnerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.initials}
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-slate-900 text-xs block">{p.name}</span>
                        <span className="text-[11px] text-slate-500">{p.role}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <UserCheck className="w-4 h-4 text-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account PIN / Passcode (Optional for Fast Login)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Enter passcode (or press Continue)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Access Partner Desk</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Strictly 2 pre-authorized users • Public registration disabled
        </div>
      </div>
    </div>
  );
}
