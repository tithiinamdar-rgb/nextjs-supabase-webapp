"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, ExternalLink, Database, Globe, Rocket, Shield, Key } from "lucide-react";

export default function SetupGuide() {
  const [activeTab, setActiveTab] = useState<"supabase" | "vercel" | "schema">("supabase");
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  const sqlSchemaCode = `-- 1. Create Public User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text,
  email text
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);

create policy "Users can update their own profile."
  on public.profiles for update using ((select auth.uid()) = id);

-- 2. Sample Items Table for the App
create table if not exists public.items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  category text default 'General',
  status text default 'active' check (status in ('active', 'pending', 'completed')),
  user_id uuid references auth.users(id) on delete cascade
);

alter table public.items enable row level security;

create policy "Items are viewable by everyone"
  on public.items for select using (true);

create policy "Authenticated users can create items"
  on public.items for insert to authenticated with check (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyGitCommands = () => {
    navigator.clipboard.writeText(`git init\ngit add .\ngit commit -m "Initial commit with Next.js & Supabase"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USER/YOUR_REPO.git\ngit push -u origin main`);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  return (
    <section id="setup-guide" className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
          <Rocket className="h-3.5 w-3.5" />
          <span>Interactive Onboarding & Deployment</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Setup & Deployment Guide
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Follow these 3 simple steps to connect Supabase and deploy your production web app on Vercel.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("supabase")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "supabase"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Database className="h-4 w-4" />
          <span>1. Supabase Setup</span>
        </button>

        <button
          onClick={() => setActiveTab("schema")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "schema"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>2. SQL Schema & RLS</span>
        </button>

        <button
          onClick={() => setActiveTab("vercel")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "vercel"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>3. Vercel Deployment</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
        {activeTab === "supabase" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 1: Create Supabase Project & Get API Keys</h3>
                <p className="text-xs text-slate-400 mt-1">Takes ~2 minutes on Supabase free tier</p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <ol className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white">Create a New Project:</strong> Log in at{" "}
                  <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com</a>{" "}
                  and click <em>"New Project"</em>. Choose your region and set a database password.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white">Copy API Credentials:</strong> Go to{" "}
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs text-emerald-300">Project Settings → API</span>.
                  You will find:
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-slate-400 text-xs font-mono">
                    <li>Project URL (e.g. <span className="text-slate-300">https://xyzcompany.supabase.co</span>)</li>
                    <li>anon / public key (e.g. <span className="text-slate-300">eyJh...</span>)</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white">Save in Local Environment:</strong> Open the file{" "}
                  <code className="text-emerald-400 font-mono">.env.local</code> in this project and paste your keys:
                  <pre className="mt-2 p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
                  </pre>
                </div>
              </li>
            </ol>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 2: Run SQL Schema in Supabase</h3>
                <p className="text-xs text-slate-400 mt-1">Sets up tables, automatic user triggers, and Row Level Security (RLS)</p>
              </div>
              <button
                onClick={copySql}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Open the <strong>SQL Editor</strong> in your Supabase dashboard, paste this script and click <strong>Run</strong>:
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300/90 font-mono text-xs border border-slate-800 max-h-72 overflow-y-auto">
              {sqlSchemaCode}
            </pre>
          </div>
        )}

        {activeTab === "vercel" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 3: Push to GitHub & Deploy to Vercel</h3>
                <p className="text-xs text-slate-400 mt-1">Automatic continuous deployment on every git push</p>
              </div>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
              >
                <span>Deploy to Vercel</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <strong className="text-white block mb-1">1. Push code to your GitHub repository:</strong>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
git init
git add .
git commit -m "Initial commit with Next.js & Supabase"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
                  </pre>
                  <button
                    onClick={copyGitCommands}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    {copiedGit ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <strong className="text-white block mb-1">2. Import into Vercel:</strong>
                <p className="text-xs text-slate-400">
                  Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com/new</a>, select your GitHub repo, and under <strong>Environment Variables</strong> add:
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                    NEXT_PUBLIC_SUPABASE_URL
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
                <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>That's it! Vercel will build and give you a live production HTTPS URL automatically.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
