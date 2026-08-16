"use client";

import React from "react";
import { ArrowRight, Sparkles, Database, Layers, ShieldCheck, Zap, Code2, Globe } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center max-w-3xl mx-auto space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next.js 15+ &bull; Supabase Postgres &bull; Vercel Ready</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Modern Full-Stack <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            Web Application
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Production-grade architecture with server-side rendering, Supabase database, Row Level Security, instant auth, and 1-click Vercel deployment.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#demo"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Explore Live Demo</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </a>

          <a
            href="#setup-guide"
            className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <span>View Setup Guide</span>
          </a>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Next.js App Router</div>
              <div className="text-[10px] text-slate-400">React 19 & SSR</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Supabase DB</div>
              <div className="text-[10px] text-slate-400">PostgreSQL + RLS</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Secure Auth</div>
              <div className="text-[10px] text-slate-400">SSR Middleware</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Vercel Ready</div>
              <div className="text-[10px] text-slate-400">Global Edge CDN</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
