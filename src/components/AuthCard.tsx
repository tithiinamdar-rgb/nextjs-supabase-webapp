"use client";

import React, { useState, useEffect } from "react";
import { Lock, Mail, User, LogIn, LogOut, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage(null);

    const hasKeys = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (!hasKeys) {
      // Demo simulated state
      setTimeout(() => {
        setUser({ email, id: "simulated-user-" + Date.now() });
        setMessage({
          type: "success",
          text: `Demo auth simulated for ${email}! (Add Supabase keys to connect live).`,
        });
        setLoading(false);
      }, 500);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Registration initiated! Check your inbox for confirmation email.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Successfully logged in!",
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Authentication error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const hasKeys = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (hasKeys) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setMessage({ type: "success", text: "Signed out successfully." });
  };

  return (
    <div className="w-full max-w-md mx-auto glass-panel rounded-2xl p-6 sm:p-7 border border-slate-800 relative">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Supabase Auth</h3>
            <p className="text-[11px] text-slate-400">JWT & Session Protected</p>
          </div>
        </div>

        {user && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            Active Session
          </span>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Logged in as:</div>
            <div className="font-mono text-sm text-white font-medium truncate mt-0.5">{user.email}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">ID: {user.id}</div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-3.5">
          <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                !isSignUp ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                isSignUp ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <LogIn className="h-4 w-4 stroke-[2.5]" />
            <span>{loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}</span>
          </button>
        </form>
      )}

      {message && (
        <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
          message.type === "success" 
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
            : "bg-rose-950/40 border-rose-500/30 text-rose-300"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
