'use client';

import React, { useState } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const { setActivePartner, setIsAuthenticated } = usePartnerStore();
  const [email, setEmail] = useState('tithiinamdar@gmail.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try Supabase Auth
      if (supabase) {
        try {
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (!authError && data.user) {
            setActivePartner({
              id: data.user.id,
              name: 'Aashu Sharma',
              email: cleanEmail,
              initials: 'AS',
              role: 'Managing Partner',
            });
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch (sbErr) {
          console.log('Supabase direct auth attempt:', sbErr);
        }
      }

      // 2. Authorize pre-configured primary partner credentials
      if (
        (cleanEmail === 'tithiinamdar@gmail.com' && password === 'password') ||
        (cleanEmail === 'aashu@partnerdesk.local' && password === 'password')
      ) {
        setActivePartner({
          id: 'partner-aashu',
          name: 'Aashu Sharma',
          email: 'tithiinamdar@gmail.com',
          initials: 'AS',
          role: 'Managing Partner',
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } else if (
        cleanEmail === 'partner2@partnerdesk.local' && password === 'password'
      ) {
        setActivePartner({
          id: 'partner-2',
          name: 'Business Partner',
          email: 'partner2@partnerdesk.local',
          initials: 'BP',
          role: 'Associate Partner',
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } else {
        setError('Invalid email or password. Access is restricted to authorized partners.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-amber-100 selection:text-amber-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 p-3 mx-auto flex items-center justify-center shadow-md">
            <Building2 className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Aashu&apos;s App
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Private Real Estate Business Management Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Partner Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your authorized email & password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Authorized Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tithiinamdar@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Aashu&apos;s App</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice - No sign up */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private Internal Workspace • Public Registration Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
