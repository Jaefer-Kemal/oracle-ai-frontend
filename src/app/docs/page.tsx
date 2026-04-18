"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const VERSION = "2.4.0";

const STACK = [
  { label: "Embedding", value: "Cohere embed-english-v3.0", icon: "hub" },
  { label: "Generation", value: "Grok-3 Auto", icon: "auto_awesome" },
  { label: "Vector Store", value: "PGVector (Neon)", icon: "storage" },
  { label: "Database", value: "PostgreSQL + SQLAlchemy", icon: "database" },
  { label: "API Layer", value: "FastAPI + Uvicorn", icon: "api" },
  { label: "Frontend", value: "Next.js 16 · Tailwind 4", icon: "code" },
];

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "stack", label: "Tech Stack", icon: "layers" },
  { id: "ingestion", label: "Data Ingestion", icon: "upload_file" },
  { id: "querying", label: "Semantic Querying", icon: "search_insights" },
  { id: "audit", label: "Audit & Governance", icon: "history_edu" },
  { id: "config", label: "System Configuration", icon: "settings_input_component" },
  { id: "api", label: "API Reference", icon: "data_object" },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState("overview");
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      sectionRefs.current[id] = el;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { root: mainRef.current, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el || !mainRef.current) return;
    const offset = el.offsetTop - 32;
    mainRef.current.scrollTo({ top: offset, behavior: "smooth" });
  };

  return (
    <div className="bg-background w-full h-screen overflow-hidden selection:bg-primary/30">
      <TopBar noSidebar />

      <div className="flex h-[calc(100vh-4rem)] mt-16">
        {/* Doc nav sidebar — replaces the main app sidebar on this page */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest oracle-scroll overflow-y-auto py-8 px-3 gap-1">
          {/* Brand */}
          <div className="px-3 mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-1">Oracle RAG</p>
            <p className="text-xs font-mono text-primary">Documentation · v{VERSION}</p>
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 px-3 mb-2">Contents</p>

          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm w-full ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-base shrink-0 ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="mt-auto pt-8 px-3 border-t border-outline-variant/10 space-y-2">
            <Link href="/help" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">help_outline</span> Help & Support
            </Link>
            <Link href="/chat" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">forum</span> Knowledge Base
            </Link>
          </div>
        </aside>

        {/* Scrollable doc body — IntersectionObserver root */}
        <main ref={mainRef} className="flex-1 overflow-y-auto oracle-scroll">
          <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 space-y-20 pb-32">

            {/* Hero */}
            <header className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Oracle Enterprise RAG</p>
                  <p className="text-xs font-mono text-primary">v{VERSION}</p>
                </div>
              </div>
              <h1 className="text-5xl font-black text-on-surface tracking-tighter leading-[1.05]">
                System<br />Documentation
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                A complete technical reference for the Oracle RAG platform — covering ingestion pipelines, semantic retrieval, admin governance, and API integration.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/chat" className="flex items-center gap-2 bg-primary text-white dark:text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-sm">chat</span>Open Knowledge Base
                </Link>
                <Link href="/admin" className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-all">
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>Admin Console
                </Link>
              </div>
            </header>

            {/* Overview */}
            <section id="overview" className="space-y-6 scroll-mt-8">
              <SectionHead icon="dashboard" title="System Overview" />
              <Prose>
                Oracle is a production-grade <strong>Retrieval-Augmented Generation (RAG)</strong> platform designed for enterprise knowledge management. It allows administrators to ingest structured and unstructured documents, which are then vectorized and stored in a PostgreSQL pgvector database.
              </Prose>
              <Prose>
                When a user submits a query, the system performs a cosine-similarity search over the vector store, retrieves the most relevant document chunks, and passes them as grounding context to the Grok-3 generation engine. The AI is strictly instructed to answer <em>only</em> from the provided context — preventing hallucinations and ensuring factual accuracy.
              </Prose>
              <InfoBox icon="shield" color="primary" title="Hallucination Prevention">
                Oracle injects the system-configured <strong>Fallback Message</strong> directly into the AI prompt. If a query has no relevant context chunks above the similarity threshold, the AI is commanded to output only that fallback string — nothing from its internal training.
              </InfoBox>
            </section>

            {/* Tech Stack */}
            <section id="stack" className="space-y-6 scroll-mt-8">
              <SectionHead icon="layers" title="Technology Stack" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {STACK.map((item) => (
                  <div key={item.label} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 hover:border-primary/20 hover:bg-surface-container transition-all group">
                    <span className="material-symbols-outlined text-primary text-2xl mb-3 block group-hover:scale-110 transition-transform">{item.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Ingestion */}
            <section id="ingestion" className="space-y-6 scroll-mt-8">
              <SectionHead icon="upload_file" title="Data Ingestion Pipeline" />
              <Prose>
                The ingestion pipeline converts raw documents into searchable vector representations through a multi-stage process:
              </Prose>
              <ol className="space-y-4">
                {[
                  { n: "01", title: "Upload & Parse", body: "Supported formats: PDF (via pypdf), DOCX (via python-docx), and plain TXT. Raw text is extracted and normalized." },
                  { n: "02", title: "Chunking", body: "Text is split into semantic chunks of ~800 tokens with 50-token overlap. Overlap ensures that key context spanning chunk boundaries is preserved." },
                  { n: "03", title: "Deduplication", body: "Each chunk is SHA-256 hashed. Duplicate chunks are silently skipped — preventing redundant embeddings and ensuring a clean vector store." },
                  { n: "04", title: "Embedding", body: "Cohere embed-english-v3.0 generates 1024-dimensional dense vectors for each unique chunk. Batching (96 chunks/request) respects API rate limits." },
                  { n: "05", title: "Indexing", body: "Both the vector (float array) and raw text are stored in PostgreSQL with pgvector. Document metadata (filename, source type, created_at) is linked via foreign key." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 list-none">
                    <span className="text-2xl font-black text-primary/30 font-mono leading-none shrink-0">{step.n}</span>
                    <div>
                      <p className="font-bold text-on-surface mb-1">{step.title}</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Querying */}
            <section id="querying" className="space-y-6 scroll-mt-8">
              <SectionHead icon="search_insights" title="Semantic Querying" />
              <Prose>
                Every user query follows the RAG pipeline: embed → retrieve → generate.
              </Prose>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "hub", title: "Embed Query", body: "The query is embedded using the same Cohere model as the documents, ensuring vectors exist in the same semantic space." },
                  { icon: "manage_search", title: "Vector Search", body: "Cosine similarity is computed against all indexed chunks. Only chunks exceeding the configured Similarity Threshold are passed as context." },
                  { icon: "auto_awesome", title: "Generate Answer", body: "Grok-3 receives the retrieved chunks as grounding context and generates a concise (100–200 word) professional answer." },
                ].map((item) => (
                  <div key={item.title} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    </div>
                    <p className="font-bold text-on-surface">{item.title}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              <InfoBox icon="tune" color="secondary" title="Similarity Threshold">
                Configured in <strong>Admin → System Parameters</strong>. Default: <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary text-xs font-mono">0.35</code>. Lower = stricter (fewer, more relevant chunks). Higher = broader retrieval.
              </InfoBox>
            </section>

            {/* Audit */}
            <section id="audit" className="space-y-6 scroll-mt-8">
              <SectionHead icon="history_edu" title="Audit & Governance" />
              <Prose>
                Every interaction is persisted in the database with full provenance: the query, the generated answer, the context chunks used, and session metadata.
              </Prose>
              <div className="space-y-4">
                {[
                  { icon: "badge", title: "Session Categorization", body: "Sessions are tagged as Admin (is_internal: true) or Public (is_internal: false). Admin sessions appear in the Knowledge workspace sidebar. Public sessions are only visible in the Audit Archive." },
                  { icon: "history_edu", title: "Trace Explorer", body: "The Audit tab provides a full Trace Explorer: a chronological timeline sidebar, a Q&A replay stage, and a vector evidence gallery showing the exact chunks that informed each answer." },
                  { icon: "delete_sweep", title: "Soft Delete / Restore", body: "Documents can be soft-deleted (moved to Archive) or permanently destroyed. Archived documents are excluded from vector search context until restored by an admin." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface mb-1">{item.title}</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Config */}
            <section id="config" className="space-y-6 scroll-mt-8">
              <SectionHead icon="settings_input_component" title="System Configuration" />
              <Prose>
                Managed through <strong>Admin → System Parameters</strong>. All changes require a <em>Confirm Logic Override</em> modal to prevent accidental modifications.
              </Prose>
              <div className="overflow-hidden rounded-2xl border border-outline-variant/10">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-high/60">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Parameter</th>
                      <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Default</th>
                      <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {[
                      { key: "greeting_message", default: "Hello! How can I help?", desc: "AI persona greeting shown on first load." },
                      { key: "fallback_message", default: "I don't have information on that.", desc: "Returned verbatim when no relevant context is found. Injected directly into the AI prompt." },
                      { key: "similarity_threshold", default: "0.35", desc: "Cosine similarity cutoff. Chunks below this score are discarded before generation." },
                    ].map((row) => (
                      <tr key={row.key} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-primary font-bold">{row.key}</td>
                        <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{row.default}</td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant leading-relaxed">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="space-y-6 scroll-mt-8">
              <SectionHead icon="data_object" title="API Reference" />
              <Prose>
                The Oracle backend exposes a RESTful API at <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary text-xs font-mono">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>. Interactive docs at <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary text-xs font-mono">/docs</code> (Swagger UI).
              </Prose>
              <div className="space-y-4">
                {[
                  { method: "POST", path: "/query", desc: "Submit a user query. Returns the AI-generated answer, session ID, sources, and latency.", body: '{\n  "input": "string",\n  "session_id": "uuid?",\n  "is_internal": true\n}' },
                  { method: "GET", path: "/sessions", desc: "List all sessions. Use ?internal_only=true to filter admin workspace sessions.", body: null },
                  { method: "GET", path: "/sessions/{id}", desc: "Get full interaction history (query, answer, context_used) for a session.", body: null },
                  { method: "POST", path: "/ingest/file", desc: "Upload a PDF, DOCX, or TXT file for ingestion into the vector store.", body: "multipart/form-data" },
                  { method: "POST", path: "/ingest/manual", desc: "Manually ingest a Q&A fact pair.", body: '{\n  "title": "string",\n  "question": "string",\n  "answer": "string"\n}' },
                  { method: "GET", path: "/admin/config", desc: "Retrieve all system configuration key-value pairs.", body: null },
                  { method: "POST", path: "/admin/config", desc: "Update one or more system config parameters.", body: '{\n  "key": "value"\n}' },
                ].map((ep) => (
                  <div key={ep.path} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg font-mono ${ep.method === "POST" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>{ep.method}</span>
                      <code className="text-sm font-mono text-on-surface font-bold">{ep.path}</code>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-sm text-on-surface-variant">{ep.desc}</p>
                      {ep.body && (
                        <pre className="bg-surface-container text-xs text-primary font-mono p-4 rounded-xl overflow-x-auto oracle-scroll leading-relaxed">{ep.body}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/10">
      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      </div>
      <h2 className="text-2xl font-black text-on-surface tracking-tight">{title}</h2>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-on-surface-variant leading-relaxed">{children}</p>;
}

function InfoBox({ icon, color, title, children }: { icon: string; color: string; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    primary: "bg-primary/5 border-primary/20 text-primary",
    secondary: "bg-secondary/5 border-secondary/20 text-secondary",
  };
  return (
    <div className={`border rounded-2xl p-5 flex gap-4 ${colors[color]}`}>
      <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-bold text-sm mb-1">{title}</p>
        <p className="text-sm leading-relaxed text-on-surface-variant">{children}</p>
      </div>
    </div>
  );
}
