"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Sample chat to show in the hero
const DEMO_MESSAGES = [
  { role: "assistant", content: "Hello! I'm Oracle. How can I help you today?" },
  { role: "user", content: "What is your return policy?" },
  { role: "assistant", content: "Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging. Contact support@company.com to initiate a return." },
  { role: "user", content: "How long does shipping take?" },
  { role: "assistant", content: "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout." },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("oracle_theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("oracle_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) return null;

  const features = [
    { icon: "hub", title: "Vector Intelligence", desc: "Semantic search over your knowledge base with Cohere embeddings and cosine similarity retrieval.", color: "text-primary bg-primary/10 border-primary/20" },
    { icon: "psychology", title: "Grok-3 Reasoning", desc: "Enterprise-grade AI generation with strict context boundaries — hallucinations are architecturally eliminated.", color: "text-secondary bg-secondary/10 border-secondary/20" },
    { icon: "shield", title: "Audit Trail", desc: "Every conversation is logged, traceable, and inspectable. Full transparency into AI decision-making.", color: "text-tertiary bg-tertiary/10 border-tertiary/20" },
    { icon: "bolt", title: "Instant Ingestion", desc: "Upload PDFs, DOCX, or TXT files. Auto-chunk, deduplicate by SHA-256, and embed in seconds.", color: "text-error bg-error/10 border-error/20" },
  ];

  const stats = [
    { value: "1024d", label: "Embed-v4.0 Engine" },
    { value: "Grok-3", label: "AI Engine" },
    { value: "SHA-256", label: "Deduplication" },
    { value: "<2s", label: "Avg. Response" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden overflow-y-auto oracle-scroll">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/20 px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tighter text-on-surface hover:text-primary transition-colors">
          Oracle AI
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </button>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant/20 rounded-xl text-sm font-bold text-on-surface hover:border-primary/40 transition-all"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/2 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left: copy */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/20 rounded-full pl-2 pr-5 py-1.5 shadow-xl">
              <div className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full animate-pulse">LIVE</div>
              <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/80">Enterprise RAG Stratum v2.4</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.95] lg:max-w-xl">
                Knowledge<br />
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] bg-clip-text text-transparent italic">Perfected.</span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg font-medium opacity-90">
                Oracle transforms fragmented enterprise data into a singular, high-fidelity intelligence layer — powered by vector search and Grok-3 reasoning.
              </p>
            </div>

            <div className="flex flex-wrap gap-5">
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-3 bg-primary text-white dark:text-zinc-950 px-8 py-4.5 rounded-2xl font-black text-base hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/40 group"
              >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">auto_awesome</span>
                Engage Assistant
              </button>
              <Link href="/login" className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/20 px-8 py-4.5 rounded-2xl font-black text-on-surface hover:border-primary/40 transition-all active:scale-95">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                Admin Portal
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-6 pt-8 border-t border-outline-variant/10">
              {stats.map((s) => (
                <div key={s.label} className="space-y-1">
                  <p className="text-3xl font-black text-primary tracking-tighter">{s.value}</p>
                  <p className="text-[11px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-black leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Demo chat mockup */}
          <div className="relative perspective-[2000px] hidden lg:block">
            <div className="absolute -inset-10 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[4rem] blur-[80px] opacity-40 animate-pulse" />
            <div className="relative bg-surface-container-low border border-outline-variant/20 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-0 transition-all duration-700">
              {/* Fake browser bar */}
              <div className="bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/10 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400/80 shadow-sm" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80 shadow-sm" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 shadow-sm" />
                </div>
                <div className="flex-1 mx-6 bg-surface-container-highest/50 rounded-xl px-4 py-1.5 text-xs text-on-surface-variant/40 font-mono tracking-tight text-center">
                  oracle.intelligence.stratosphere
                </div>
              </div>
              {/* Demo conversation */}
              <div className="p-8 space-y-6 bg-surface-dim/50 min-h-[420px]">
                {DEMO_MESSAGES.slice(0, 3).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-[15px] leading-relaxed shadow-lg ${
                      msg.role === "user"
                        ? "bg-primary text-white dark:text-zinc-950 rounded-tr-none font-bold"
                        : "bg-surface-container-low border border-outline-variant/10 text-on-surface rounded-tl-none font-medium"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              {/* Fake input bar */}
              <div className="px-6 py-5 border-t border-outline-variant/10 flex gap-3 bg-surface-container/60">
                <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-3 text-sm text-on-surface-variant/40 italic flex items-center justify-between">
                  <span>Inquiring documents...</span>
                  <span className="material-symbols-outlined text-xs animate-spin text-primary">circle_notifications</span>
                </div>
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white dark:text-zinc-950 text-xl font-bold">send</span>
                </div>
              </div>
            </div>
            {/* Verified badge */}
            <div className="absolute bottom-6 -right-6 bg-surface-container-highest border border-outline-variant/20 text-emerald-400 text-xs font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transform hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-base animate-pulse">verified</span> 
              <span>SOC-2 READINESS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-12 border-y border-outline-variant/10 bg-surface-container-low/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative">
          <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_40s_linear_infinite] md:justify-center">
            {["NEXT.JS / TS", "GROK-3 CORE", "PGVECTOR", "COHERE EMBED", "BCRYPT SECURE", "SHA-256 DEDUP"].map((tech) => (
              <span key={tech} className="text-xl font-black text-on-surface-variant/20 tracking-[0.2em]">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="inline-flex flex-col">
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary mb-2">Architecture</h2>
                <div className="h-0.5 w-12 bg-primary opacity-30" />
              </div>
              <h3 className="text-4xl font-black text-on-surface leading-tight tracking-tighter">Built for<br />Certainty.</h3>
              <p className="text-on-surface-variant/80 font-medium leading-relaxed">
                Oracle was designed from the ground up to eliminate the volatility of traditional generative AI, replacing placeholders with high-fidelity document evidence.
              </p>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] p-10 space-y-6 hover:border-primary/30 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-3xl">shield_lock</span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-black text-on-surface">Secure by Design</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed opacity-70 font-medium italic">
                    Administrative credentials are never stored in plain text. Every session is unique, JWT-protected, and Bcrypt-hashed for zero-compromise security.
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] p-10 space-y-6 hover:border-secondary/30 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-3xl">history_edu</span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-black text-on-surface">Switchable Intelligence</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed opacity-70 font-medium italic">
                    Hot-swap between <strong>Fast</strong>, <strong>Expert</strong>, and <strong>Thinking</strong> modes in real-time to balance speed and reasoning depth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface-dim relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 border-b border-outline-variant/10 pb-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-on-surface tracking-tighter">Unified Intelligence.</h2>
              <p className="text-on-surface-variant max-w-xl font-medium">Standardized components engineered for accuracy, traceability, and high-velocity performance.</p>
            </div>
            <Link href="/login" className="px-8 py-4 bg-surface-container-high border border-outline-variant/20 rounded-2xl font-black text-sm text-on-surface hover:border-primary/40 transition-all shrink-0">
              View Specs
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-container-low border border-outline-variant/10  rounded-[2.5rem] p-8 space-y-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all group hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${f.color}`}>
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-on-surface text-lg leading-tight">{f.title}</h3>
                  <p className="text-[13px] text-on-surface-variant/70 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section with high contrast */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="relative max-w-4xl mx-auto text-center px-8 space-y-10">
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-on-surface tracking-tighter leading-tight">Ready to deploy<br />your Stratum?</h2>
            <p className="text-xl text-on-surface-variant/80 font-medium max-w-2xl mx-auto">Upload your documents, define your knowledge boundaries, and engage the intelligence in minutes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-white dark:text-zinc-950 px-10 py-5 rounded-2xl font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined font-bold">rocket_launch</span>
              Launch Console
            </Link>
            <button
               onClick={() => setChatOpen(true)}
               className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-surface-container-high border border-outline-variant/20 px-10 py-5 rounded-2xl font-black text-lg text-on-surface hover:border-primary/40 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined">forum</span>
              Live Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-variant/10 py-8 text-center">
        <p className="text-xs text-on-surface-variant/40">© 2026 Oracle AI · Powered by Cohere + Grok-3 · Built for Enterprise</p>
      </footer>

      {/* ── Floating Chat Bubble ── */}
      {/* Bubble button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-gradient-to-br from-primary via-secondary to-primary bg-[length:200%_200%] animate-[gradient_4s_ease_infinite] px-5 py-4 rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-white dark:text-zinc-950 font-bold text-sm"
          style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--primary) 100%)" }}
        >
          <span className="material-symbols-outlined text-xl">forum</span>
          <span className="hidden sm:inline">Chat with Oracle</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
        </button>
      )}

      {/* Chat panel */}
      {chatOpen && (
        <div className={`fixed z-50 bottom-6 right-6 transition-all duration-300 shadow-2xl shadow-black/30 rounded-3xl overflow-hidden border border-outline-variant/20 bg-background ${chatExpanded ? "w-[min(600px,calc(100vw-3rem))] h-[min(700px,calc(100vh-5rem))]" : "w-[min(400px,calc(100vw-3rem))] h-[min(560px,calc(100vh-5rem))]"}`}>
          {/* Chat header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white dark:text-zinc-950 text-lg">auto_awesome</span>
              <div>
                <p className="text-white dark:text-zinc-950 font-black text-sm leading-tight">Oracle Assistant</p>
                <p className="text-white/70 dark:text-zinc-950/70 text-[10px]">Powered by Grok-3 Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setChatExpanded(!chatExpanded)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors material-symbols-outlined text-white dark:text-zinc-950 text-sm">
                {chatExpanded ? "close_fullscreen" : "open_in_full"}
              </button>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors material-symbols-outlined text-white dark:text-zinc-950 text-sm">
                close
              </button>
            </div>
          </div>
          <iframe
            src="/iframe/chat"
            className="w-full border-0"
            style={{ height: "calc(100% - 56px)" }}
            title="Oracle Chat"
          />
        </div>
      )}
    </div>
  );
}
