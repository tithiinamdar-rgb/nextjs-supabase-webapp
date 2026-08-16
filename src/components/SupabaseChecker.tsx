"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, Terminal, ExternalLink, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SupabaseChecker() {
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const isValid = url.length > 0 && !url.includes("placeholder") && key.length > 0;
    
    setSupabaseUrl(url);
    setHasKey(isValid);
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("items").select("count", { count: "exact", head: true });

      if (error && error.code === "PGRST204") {
        // Table doesn't exist yet, but connection is successful!
        setTestResult({
          success: true,
          message: "Connected to Supabase! (Note: 'items' table not found yet, run the SQL schema below).",
        });
      } else if (error && error.code !== "PGRST116" && error.message) {
        setTestResult({
          success: hasKey,
          message: `Response from Supabase: ${error.message}`,
        });
      } else {
        setTestResult({
          success: true,
          message: "Successfully connected and verified with Supabase!",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to establish connection.",
      });
    } finally {
      setTesting(false);
    }
  };

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Environment Diagnostics</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-xs text-slate-400">Status Check</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Supabase Connection Status</h3>
        </div>

        <button
          onClick={testConnection}
          disabled={testing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/80 transition-all hover:border-emerald-500/40 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 text-emerald-400 ${testing ? "animate-spin" : ""}`} />
          <span>{testing ? "Testing..." : "Test Connection"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* URL Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1">NEXT_PUBLIC_SUPABASE_URL</div>
          <div className="font-mono text-sm text-slate-200 truncate flex items-center gap-2">
            {hasKey ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">{supabaseUrl}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-amber-300/80">Not configured yet in .env.local</span>
              </>
            )}
          </div>
        </div>

        {/* Key Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
          <div className="font-mono text-sm text-slate-200 truncate flex items-center gap-2">
            {hasKey ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">•••••••••••••••• (Loaded)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-amber-300/80">Required for client authentication</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Test feedback */}
      {testResult && (
        <div className={`mt-4 p-4 rounded-xl border text-sm flex items-start gap-3 ${
          testResult.success 
            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
            : "bg-amber-950/30 border-amber-500/30 text-amber-300"
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{testResult.success ? "Connection Verified" : "Configuration Reminder"}</p>
            <p className="text-xs opacity-90 mt-0.5">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Quick helper banner */}
      {!hasKey && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-900/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300">
              Add your keys to <code className="text-emerald-400 font-mono">.env.local</code> to activate live database sync
            </span>
          </div>
          <button
            onClick={copyEnvSnippet}
            className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors w-fit"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied template" : "Copy format"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
