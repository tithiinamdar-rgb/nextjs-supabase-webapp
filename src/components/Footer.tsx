import React from "react";
import { Zap, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-300">NextPulse Stack</span>
          <span>&mdash; Built with Next.js, Supabase & Vercel</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Next.js Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Supabase Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://vercel.com/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Vercel Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
