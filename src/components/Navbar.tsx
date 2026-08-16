"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Database, Layers, Sparkles, ShieldCheck, ArrowUpRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [hasSupabaseKeys, setHasSupabaseKeys] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );
    setHasSupabaseKeys(isConfigured);

    if (isConfigured) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user || null);
      });
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Zap className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              NextPulse <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Stack</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#demo" className="hover:text-emerald-400 transition-colors">Database Demo</a>
          <a href="#setup-guide" className="hover:text-emerald-400 transition-colors">Setup Guide</a>
          <a href="#schema" className="hover:text-emerald-400 transition-colors">SQL Schema</a>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase Status indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            hasSupabaseKeys 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
              : "bg-amber-950/40 text-amber-300 border-amber-500/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasSupabaseKeys ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{hasSupabaseKeys ? "Supabase Connected" : "Supabase: Env Needed"}</span>
          </div>

          <a 
            href="#demo"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <span>Live Playground</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
