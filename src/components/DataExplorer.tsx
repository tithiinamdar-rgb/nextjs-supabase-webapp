"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Clock, Database, Sparkles, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "pending" | "completed";
  created_at?: string;
}

const SAMPLE_INITIAL_ITEMS: Item[] = [
  {
    id: "demo-1",
    title: "Launch Marketing Landing Page",
    description: "Build high-converting Next.js hero section with responsive CTA buttons.",
    category: "Design",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "demo-2",
    title: "Supabase Authentication Setup",
    description: "Configured magic links and OAuth provider redirects for seamless user logins.",
    category: "Auth",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "demo-3",
    title: "Connect Vercel CI/CD Pipeline",
    description: "Enable automatic previews for GitHub Pull Requests with preview environment variables.",
    category: "DevOps",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

export default function DataExplorer() {
  const [items, setItems] = useState<Item[]>(SAMPLE_INITIAL_ITEMS);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Feature");
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const supabase = createClient();

  const fetchItems = async () => {
    setLoading(true);
    const hasKeys = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (!hasKeys) {
      setLoading(false);
      setIsLiveConnected(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data as Item[]);
        setIsLiveConnected(true);
      } else if (!error && data && data.length === 0) {
        // Connected but empty table
        setItems([]);
        setIsLiveConnected(true);
      }
    } catch (e) {
      console.log("Supabase table query fallback mode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const newItem: Item = {
      id: "local-" + Date.now(),
      title: title.trim(),
      description: description.trim() || "Created via live playground",
      category,
      status: "active",
      created_at: new Date().toISOString(),
    };

    const hasKeys = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (hasKeys) {
      try {
        const { data, error } = await supabase
          .from("items")
          .insert([
            {
              title: newItem.title,
              description: newItem.description,
              category: newItem.category,
              status: newItem.status,
            },
          ])
          .select();

        if (error) {
          setStatusMessage(`Supabase notice: ${error.message} (Added to local state)`);
          setItems([newItem, ...items]);
        } else if (data && data[0]) {
          setStatusMessage("Item successfully written to Supabase database!");
          setItems([data[0] as Item, ...items]);
        }
      } catch (err: any) {
        setItems([newItem, ...items]);
      }
    } else {
      setItems([newItem, ...items]);
      setStatusMessage("Item added in preview mode (Connect Supabase in .env.local to persist)");
    }

    setTitle("");
    setDescription("");
    setLoading(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteItem = async (id: string) => {
    setItems(items.filter((item) => item.id !== id));

    const hasKeys = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );

    if (hasKeys && !id.startsWith("local-") && !id.startsWith("demo-")) {
      try {
        await supabase.from("items").delete().eq("id", id);
      } catch (e) {}
    }
  };

  return (
    <div id="demo" className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <Database className="h-3.5 w-3.5" />
          <span>Interactive Database & Realtime Demo</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Next.js + Supabase Data Explorer
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base">
          Add items, perform queries, and see live data management in action with Postgres and Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Create New Record</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">public.items</span>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build User Settings Page"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details, notes or description..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="Feature">Feature</option>
                <option value="Design">Design</option>
                <option value="Auth">Auth</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>{loading ? "Saving..." : "Add to Database"}</span>
            </button>
          </form>

          {statusMessage && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Records View */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Database Records</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {items.length} records
              </span>
            </div>
            <button
              onClick={fetchItems}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800">
              <Database className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-medium">No items found yet</p>
              <p className="text-slate-500 text-xs mt-1">Add your first item using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-xl p-4 border border-slate-800/90 hover:border-slate-700/80 transition-all group flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{item.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-medium border border-slate-700/60">
                        {item.category}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        item.status === "completed"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                          : item.status === "pending"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-500/20"
                          : "bg-sky-950/60 text-sky-400 border border-sky-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                    {item.created_at && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete item"
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
