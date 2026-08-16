'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { Building2, ShieldCheck, X, Check } from 'lucide-react';
import { PartnerProfile } from '@/types';

interface PartnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (partner: PartnerProfile) => void;
}

export default function PartnerAuthModal({ isOpen, onClose, onLoginSuccess }: PartnerAuthModalProps) {
  const { partners, activePartner, setActivePartner } = usePartnerStore();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(activePartner.id);

  if (!isOpen) return null;

  const handleSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = partners.find(p => p.id === selectedPartnerId);
    if (!target) return;
    setActivePartner(target);
    if (onLoginSuccess) onLoginSuccess(target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 p-1.5 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Switch Partner</h2>
              <p className="text-[10px] text-slate-400">Aashu&apos;s App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Partner Select Form */}
        <form onSubmit={handleSwitch} className="space-y-3 text-xs">
          <div className="space-y-2">
            {partners.map(p => {
              const isSelected = selectedPartnerId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPartnerId(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {p.initials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.role}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Switch Active Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
