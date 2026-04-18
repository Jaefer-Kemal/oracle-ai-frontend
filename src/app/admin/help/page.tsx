"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const FAQ = [
  {
    category: "Getting Started",
    icon: "rocket_launch",
    color: "primary",
    items: [
      {
        q: "How do I add documents to the knowledge base?",
        a: "Navigate to Admin → Ingestion Center. You can upload PDF, DOCX, or TXT files for bulk ingestion, or use the Manual Fact Entry form to add specific Q&A pairs directly.",
      },
      {
        q: "How do I start a new conversation?",
        a: "Click the 'New Chat' button at the bottom of the left sidebar in the Knowledge workspace. Each conversation is given a unique Session ID and stored in the database.",
      },
      {
        q: "What file formats are supported?",
        a: "Oracle supports PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. Each file is automatically parsed, chunked into ~800-token segments, and vectorized using Cohere.",
      },
    ],
  },
  {
    category: "Security & Access",
    icon: "shield_lock",
    color: "primary",
    items: [
      {
        q: "How do I change my administrative password?",
        a: "Navigate to Admin → Settings. In the 'Security & Credentials' section, enter your current password followed by your new password (minimum 8 characters). The system uses Bcrypt hashing to secure your new credentials immediately.",
      },
      {
        q: "What happens if I forget my password?",
        a: "Currently, password resets must be performed by an individual with access to the server's environment variables or the AppSettings database table. Contact your system administrator or refer to the 'Safe Migration' section in the Technical Docs.",
      },
      {
        q: "How does the 'Self-Healing' login migration work?",
        a: "On your first login, Oracle uses the ADMIN_PASSWORD from your .env file. Once authenticated, it automatically hashes this password and stores it securely in the database. Subsequent logins check against the database, not the .env file.",
      },
    ],
  },
  {
    category: "Mobile Experience",
    icon: "smartphone",
    color: "secondary",
    items: [
      {
        q: "How do I navigate the platform on a mobile device?",
        a: "Oracle uses a responsive drawer system. Tap the Hamburger Menu (three horizontal lines) in the top-left corner to slide out the sidebar. Navigating between Knowledge, Console, and Docs is available inside this drawer.",
      },
      {
        q: "Where is the Sign Out button on mobile?",
        a: "Open the mobile sidebar drawer. Your profile information and the 'Sign Out' button are located at the very bottom of the drawer for quick access.",
      },
    ],
  },
  {
    category: "AI & Responses",
    icon: "auto_awesome",
    color: "secondary",
    items: [
      {
        q: "Why did Oracle return the fallback message instead of an answer?",
        a: "This means no document chunks in the knowledge base scored above the configured Similarity Threshold (default: 0.35) for your query. Try rephrasing the question or ensure relevant documents are ingested. You can adjust the threshold in Admin → System Parameters.",
      },
      {
        q: "Oracle gave me an answer but it seems inaccurate. What went wrong?",
        a: "Oracle is strictly context-bound — it only uses chunks retrieved from your knowledge base. If the ingested content is incorrect or outdated, the answer will reflect that. Update your knowledge base by ingesting corrected documents.",
      },
      {
        q: "Can I change the AI's persona or how it introduces itself?",
        a: "Yes. Go to Admin → System Parameters and edit the 'AI Persona Greeting' field. Changes take effect immediately after confirmation.",
      },
      {
        q: "How does Oracle prevent hallucination?",
        a: "The system uses a strict Context-Only constraint. Your configured fallback message is injected directly into the AI prompt. If no relevant context is found, the AI is commanded to output only that text — nothing more.",
      },
      {
        q: "Which Grok reasoning mode should I use?",
        a: "Use 'Fast' for quick, routine queries to save latency. Use 'Expert' (Grok-4) for complex, multi-layered reasoning. 'Thinking' mode is best for highly cognitive tasks requiring deep internal Monologue processing. 'Auto' balances these based on query length and history.",
      },
    ],
  },
  {
    category: "Administration",
    icon: "admin_panel_settings",
    color: "tertiary",
    items: [
      {
        q: "How do I restore a deleted document?",
        a: "Go to Admin → Trash & Archive. Soft-deleted documents are listed there. Click the restore icon to move them back to the active knowledge base.",
      },
      {
        q: "What's the difference between Admin and Public sessions?",
        a: "Admin sessions (is_internal: true) are created when using the Knowledge workspace and appear in the sidebar history. Public sessions are created by iframe/guest users and are visible only in the Audit Archive, not in the Admin sidebar.",
      },
      {
        q: "How do I view full conversation transcripts for audit purposes?",
        a: "Go to Admin → Audit Archive. Click any session row to open the Trace Explorer — a full-screen workspace showing the Q&A timeline, exact responses, and the vector evidence chunks that informed each answer.",
      },
      {
        q: "Can the similarity threshold be changed without restarting the server?",
        a: "Yes. The threshold is stored in the database and read at query time. Changing it in Admin → System Parameters takes effect on the next incoming query immediately.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    icon: "build",
    color: "error",
    items: [
      {
        q: "The backend returned 'Error: No response from generation engine.'",
        a: "This typically indicates a TLS or network issue with the Grok API. The system will automatically serve your configured Fallback Message. Check your GROK_API_KEY environment variable and network connectivity.",
      },
      {
        q: "Uploading a file returns an error. What should I check?",
        a: "Ensure the file is not password-protected and is under the size limit. Also verify your COHERE_API_KEY is valid and the backend server is running. Check the server logs for detailed error messages.",
      },
      {
        q: "The sidebar chat history is empty even after conversations.",
        a: "The sidebar only shows Admin sessions (is_internal: true). If you queried from a public iframe or guest mode, those sessions appear only in the Audit Archive, not the sidebar.",
      },
      {
        q: "CSS styles look broken or the theme toggle isn't working.",
        a: "Clear browser localStorage (key: oracle_theme) and reload. If the issue persists, ensure Tailwind 4 and the PostCSS plugin are installed correctly via npm install.",
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: "Documentation", href: "/docs", icon: "menu_book", desc: "Full technical reference" },
  { label: "Knowledge Base", href: "/chat", icon: "forum", desc: "Start a conversation" },
  { label: "Admin Console", href: "/admin", icon: "dashboard", desc: "Manage your system" },
  { label: "Ingestion Center", href: "/admin?tab=ingest", icon: "upload_file", desc: "Add new documents" },
  { label: "Audit Archive", href: "/admin?tab=audit", icon: "history_edu", desc: "Review interactions" },
  { label: "System Parameters", href: "/admin?tab=config", icon: "settings_input_component", desc: "Configure Oracle" },
];

const COLOR_MAP: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/10 text-secondary border-secondary/20",
  tertiary: "bg-tertiary/10 text-tertiary border-tertiary/20",
  error: "bg-error/10 text-error border-error/20",
};

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQ.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="bg-background w-full h-screen overflow-hidden selection:bg-primary/30">
      <TopBar />
      <Sidebar />

      {/* Full-height scrollable main under the topbar */}
      <main className="h-[calc(100vh-4rem)] mt-16 oracle-main-content overflow-y-auto oracle-scroll">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 space-y-16 pb-32">

          {/* Hero */}
          <header className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-2xl">help_outline</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Oracle Enterprise RAG</p>
                <p className="text-xs font-mono text-primary">Help & Support</p>
              </div>
            </div>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter leading-[1.05]">
              How can we<br />help you?
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
              Find answers to common questions, troubleshoot issues, or explore quick links to navigate the platform.
            </p>

            {/* Search */}
            <div className="relative max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Search help articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  close
                </button>
              )}
            </div>
          </header>

          {/* Quick links */}
          {!search && (
            <section className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/10">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Quick Navigation</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col gap-2 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 hover:border-primary/30 hover:bg-surface-container transition-all"
                  >
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
                    <p className="font-bold text-on-surface text-sm">{link.label}</p>
                    <p className="text-xs text-on-surface-variant">{link.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="space-y-10">
            {!search && (
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/10">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">quiz</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">Frequently Asked Questions</h2>
              </div>
            )}

            {search && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">search_off</span>
                <p className="text-lg font-semibold text-on-surface">No results found</p>
                <p className="text-sm text-on-surface-variant">Try a different search term or browse the full FAQ below.</p>
                <button onClick={() => setSearch("")} className="text-primary text-sm font-bold hover:underline mt-2">Clear search</button>
              </div>
            )}

            {filtered.map((cat) => (
              <div key={cat.category} className="space-y-3">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${COLOR_MAP[cat.color]}`}>
                    <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  </div>
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.15em]">{cat.category}</h3>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.category}-${idx}`;
                    const isOpen = openFaq === key;
                    return (
                      <div
                        key={key}
                        className={`bg-surface-container-low border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-primary/30 shadow-sm shadow-primary/5" : "border-outline-variant/10 hover:border-outline-variant/30"}`}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          className="w-full flex items-start justify-between px-6 py-5 text-left gap-4"
                        >
                          <span className="text-sm font-semibold text-on-surface leading-snug">{item.q}</span>
                          <span className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 mt-0.5 ${isOpen ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="pt-3 border-t border-outline-variant/10">
                              <p className="text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* Support escalation */}
          {!search && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 md:p-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">support_agent</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-on-surface">Still need help?</h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    If your issue is not covered above, review the full technical documentation or check the backend logs for detailed error information.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/docs" className="group flex items-center gap-3 bg-surface-container border border-outline-variant/10 rounded-2xl p-5 hover:border-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">menu_book</span>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Technical Documentation</p>
                    <p className="text-xs text-on-surface-variant">Architecture, API reference & config</p>
                  </div>
                </Link>
                <Link href="/admin?tab=audit" className="group flex items-center gap-3 bg-surface-container border border-outline-variant/10 rounded-2xl p-5 hover:border-primary/20 transition-all">
                  <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">history_edu</span>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Audit Log Explorer</p>
                    <p className="text-xs text-on-surface-variant">Review full interaction transcripts</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-high/40 rounded-xl p-4 border border-outline-variant/10">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">terminal</span>
                <p className="text-xs text-on-surface-variant font-mono">
                  Backend logs: <span className="text-primary">poetry run python main.py</span> — Check the console for detailed service errors.
                </p>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
