"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { isLoggedIn, addNotification, tryRefreshToken } from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  useEffect(() => {
    if (!isLoggedIn()) {
      // Try to refresh - if refresh token (httpOnly cookie) is valid, we get a new access token
      tryRefreshToken().then((ok) => {
        if (!ok) router.replace("/login");
      });
    }
  }, []);

  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [trash, setTrash] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Audit Trace State
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeMsgIndex, setActiveMsgIndex] = useState(0);

  // Repository filters + bulk select
  const [repoSearch, setRepoSearch] = useState("");
  const [repoType, setRepoType] = useState<"all" | "file" | "manual">("all");
  const [repoPage, setRepoPage] = useState(1);
  const [repoTotal, setRepoTotal] = useState(0);
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());

  // Trash Filters + bulk select
  const [trashFilter, setTrashFilter] = useState("");
  const [trashType, setTrashType] = useState<"all" | "file" | "manual">("all");
  const [trashPage, setTrashPage] = useState(1);
  const [trashTotal, setTrashTotal] = useState(0);
  const [selectedTrash, setSelectedTrash] = useState<Set<number>>(new Set());

  const PAGE_SIZE = 15;

  // Suggestion inputs (config tab)
  const [suggestionInputs, setSuggestionInputs] = useState<string[]>([]);

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // Config Workflow State
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<any | null>(null);

  // Ingestion State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualQ, setManualQ] = useState("");
  const [manualA, setManualA] = useState("");
  const [synergy, setSynergy] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Ingest toast state: { type: 'success'|'skipped'|'restored'|'error', message: string }
  const [ingestToast, setIngestToast] = useState<{ type: 'success'|'skipped'|'restored'|'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
    if (tab !== "audit") {
      setSelectedSession(null);
      setSessionDetail([]);
    }
  }, [tab]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [sData, cData] = await Promise.all([
        api.getStats(),
        api.getConfig()
      ]);
      setStats(sData);
      setConfig(cData);
      // Populate suggestion inputs from saved config
      try {
        const savedSuggestions = JSON.parse(cData.suggested_questions || "[]");
        setSuggestionInputs(Array.isArray(savedSuggestions) ? savedSuggestions : []);
      } catch { setSuggestionInputs([]); }
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  // Audit Flow Logic
  const [auditFilter, setAuditFilter] = useState("");
  const [auditScope, setAuditScope] = useState<"all" | "admin" | "public">("all");
  const [auditSort, setAuditSort] = useState<"newest" | "oldest">("newest");
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [selectedAudit, setSelectedAudit] = useState<Set<string>>(new Set());
  const AUDIT_PAGE_SIZE = 15;

  const loadAuditSessions = async (page = 1, scope = auditScope, sort = auditSort, search = auditFilter) => {
    try {
      const res = await api.getSessions(false, scope, sort, page, AUDIT_PAGE_SIZE, search);
      setSessions(res.items || []);
      setAuditTotal(res.total || 0);
      setAuditPage(page);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const loadDocuments = async (page = 1, search = repoSearch, type = repoType) => {
    try {
      const res = await api.getDocuments(search, type === "all" ? undefined : type, page, PAGE_SIZE);
      setDocuments(res.items || []);
      setRepoTotal(res.total || 0);
      setRepoPage(page);
    } catch (e) {
      console.error("Failed to load documents", e);
    }
  };

  const loadTrash = async (page = 1, search = trashFilter, type = trashType) => {
    try {
      const res = await api.getTrash(search, page, PAGE_SIZE, type === "all" ? undefined : type);
      setTrash(res.items || []);
      setTrashTotal(res.total || 0);
      setTrashPage(page);
    } catch (e) {
      console.error("Failed to load trash", e);
    }
  };

  // Immediate Audit Loading (toggles)
  useEffect(() => { loadAuditSessions(1, auditScope, auditSort, auditFilter); }, [auditScope, auditSort]);

  // Debounced Audit Loading (search)
  useEffect(() => {
    const timer = setTimeout(() => loadAuditSessions(1, auditScope, auditSort, auditFilter), 300);
    return () => clearTimeout(timer);
  }, [auditFilter]);

  // Debounced Repository Loading
  useEffect(() => {
    const timer = setTimeout(() => loadDocuments(1, repoSearch, repoType), 300);
    return () => clearTimeout(timer);
  }, [repoSearch, repoType]);

  // Debounced Trash Loading
  useEffect(() => {
    const timer = setTimeout(() => loadTrash(1, trashFilter, trashType), 300);
    return () => clearTimeout(timer);
  }, [trashFilter, trashType]);

  const openAuditTrace = async (sess: any) => {
    setLoadingDetail(true);
    setSelectedSession(sess);
    setActiveMsgIndex(0);
    try {
      const res = await api.getSessionHistory(sess.id);
      setSessionDetail(res);
      if (res.length > 0) setActiveMsgIndex(res.length - 1);
    } catch (e) {
      console.error("Failed to fetch session detail", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    setIngestToast(null);
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("category", "General");
        xhr.open("POST", "http://localhost:8000/ingest");
        const token = typeof window !== "undefined" ? localStorage.getItem("oracle_token") : null;
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { resolve({ status: "success", message: "Upload complete." }); }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      const status = result.status || "success";
      if (status === "skipped") {
        setIngestToast({ type: "skipped", message: result.message });
        addNotification(result.message, "warning");
      } else if (status === "restored") {
        setIngestToast({ type: "restored", message: result.message });
        addNotification(result.message, "success");
      } else {
        setIngestToast({ type: "success", message: result.message });
        addNotification(`✓ ${result.message}`, "success");
      }
      setSelectedFile(null);
      setUploadProgress(0);
      refreshData();
    } catch (e) {
      setIngestToast({ type: "error", message: "Upload failed. Please check the file and try again." });
      addNotification("Document upload failed", "warning");
    } finally {
      setUploading(false);
    }
  };

  const handleManualIngest = async () => {
    if (!manualA) return;
    setIngestToast(null);
    const res = await api.ingestManual(manualTitle || "Manual Knowledge", manualQ, manualA);
    const status = res.status || "success";
    if (status === "skipped") {
      setIngestToast({ type: "skipped", message: res.message || "An identical entry already exists." });
      addNotification("Duplicate entry — already in knowledge base", "warning");
    } else if (status === "restored") {
      setIngestToast({ type: "restored", message: res.message || "Entry restored from trash." });
      addNotification("Entry restored from trash", "success");
    } else {
      setIngestToast({ type: "success", message: res.message || "Entry added successfully." });
      addNotification(`Manual entry '${manualTitle || manualQ || "Knowledge"}' added`, "success");
    }
    if (status !== "skipped") {
      setManualTitle("");
      setManualQ("");
      setManualA("");
      setSynergy([]);
    }
    refreshData();
  };

  const handleSoftDelete = async (id: number) => {
     await api.deleteDocument(id);
     setDeleteId(null);
     refreshData();
  };

  const handleConfigSave = async () => {
    if (!confirmConfig) return;
    try {
      await api.updateConfig({ [confirmConfig.key]: confirmConfig.value });
      setConfirmConfig(null);
      setEditingKey(null);
      refreshData();
    } catch (e) {
      alert("Failed to update config");
    }
  };

  const filteredAudit = sessions.filter(s =>
    s.title?.toLowerCase().includes(auditFilter.toLowerCase()) ||
    s.id?.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const filteredTrash = trash.filter(t => {
    const matchSearch = !trashFilter || t.filename?.toLowerCase().includes(trashFilter.toLowerCase());
    const matchType = trashType === "all" || t.source_type === trashType;
    return matchSearch && matchType;
  });

  const titles: Record<string, string> = {
    overview: "System Overview",
    docs: "Knowledge Repository",
    ingest: "Ingestion Center",
    audit: "Audit Archive",
    trash: "Trash & Archive",
    config: "System Parameters"
  };

  return (
    <div className="bg-background min-h-screen w-full selection:bg-primary/30">
      <TopBar />
      <Sidebar />
      {/* Content: offset by sidebar width + topbar height */}
      <main className="oracle-main-content mt-16 flex flex-col h-[calc(100vh-4rem)] bg-surface-dim relative overflow-y-auto custom-scrollbar">
          
          <div className={`p-8 space-y-12 max-w-7xl mx-auto w-full pb-32 ${selectedSession ? 'hidden' : 'block animate-in fade-in duration-500'}`}>
            <div className="flex flex-col gap-1">
              <h2 className="text-[3.5rem] leading-[1] font-black tracking-tighter text-on-surface">
                 {titles[tab] || "Admin Console"}
              </h2>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                 <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                   {loading ? 'Analyzing Infrastructure' : 'Infrastructure Ready'}
                 </p>
              </div>
            </div>

            {tab === "overview" && (
              <section className="space-y-10">

                {/* KPI grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="Active Documents" value={stats?.total_documents || 0} icon="description" color="text-primary" glow="bg-primary/10" />
                  <StatCard title="Vector Chunks" value={stats?.total_vector_chunks || 0} icon="hub" color="text-secondary" glow="bg-secondary/10" />
                  <StatCard title="Interactions" value={stats?.total_chats_handled || 0} icon="forum" color="text-tertiary" glow="bg-tertiary/10" />
                  <StatCard title="Archived" value={trash.length} icon="delete_sweep" color="text-error" glow="bg-error/10" />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Add Document", icon: "upload_file", href: "/admin?tab=ingest", color: "bg-primary/10 text-primary border-primary/20", desc: "Ingest a file or manual fact" },
                    { label: "View Audit Log", icon: "history_edu", href: "/admin?tab=audit", color: "bg-secondary/10 text-secondary border-secondary/20", desc: "Review all interactions" },
                    { label: "System Parameters", icon: "settings_input_component", href: "/admin?tab=config", color: "bg-tertiary/10 text-tertiary border-tertiary/20", desc: "Configure thresholds & prompts" },
                  ].map((a) => (
                    <a key={a.label} href={a.href} className={`flex items-center gap-4 p-5 rounded-2xl border ${a.color} hover:brightness-110 transition-all group`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-current/10">
                        <span className="material-symbols-outlined">{a.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{a.label}</p>
                        <p className="text-[11px] opacity-60 mt-0.5">{a.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Recent docs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-on-surface">Recent Knowledge Base Entries</h3>
                    <a href="/admin?tab=docs" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>
                  <Table items={documents.slice(0, 5)} onDelete={(id: any) => setDeleteId(id)} type="active" loading={loading} />
                </div>
              </section>
            )}

            {tab === "docs" && (
              <section className="space-y-6 animate-in fade-in duration-300">
                {/* filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                      placeholder="Search by filename..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center bg-surface-container rounded-xl p-1 gap-1">
                    {(["all", "file", "manual"] as const).map((t) => (
                      <button key={t} onClick={() => setRepoType(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                          repoType === t ? "bg-primary text-white dark:text-zinc-950 shadow" : "text-on-surface-variant hover:text-on-surface"
                        }`}>{t === "all" ? "All" : t === "file" ? "Files" : "Manual"}</button>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant/50 font-mono shrink-0">{repoTotal} items</p>
                </div>

                {/* Bulk action bar */}
                {selectedDocs.size > 0 && (
                  <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 animate-in fade-in duration-200">
                    <span className="text-sm font-bold text-primary">{selectedDocs.size} selected</span>
                    <button
                      onClick={async () => { await api.bulkDeleteDocuments(Array.from(selectedDocs) as number[]); setSelectedDocs(new Set()); addNotification(`${selectedDocs.size} documents archived`, "info"); refreshData(); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error text-xs font-bold rounded-xl hover:bg-error/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Archive Selected
                    </button>
                    <button onClick={() => setSelectedDocs(new Set())} className="ml-auto text-xs text-on-surface-variant hover:text-on-surface">
                      Clear selection
                    </button>
                  </div>
                )}

                {/* Table */}
                <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high/50 text-on-surface-variant text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-4 py-4">
                          <input type="checkbox" className="rounded"
                            checked={documents.length > 0 && documents.every(d => selectedDocs.has(d.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDocs(new Set(documents.map((d: any) => d.id)));
                              else setSelectedDocs(new Set());
                            }}
                          />
                        </th>
                        <th className="px-4 py-4">Filename</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Type</th>
                        <th className="px-4 py-4">Added</th>
                        <th className="px-4 py-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {documents.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 block mb-2">folder_open</span>
                          <p className="text-sm text-on-surface-variant/40">No documents match your filters</p>
                        </td></tr>
                      ) : documents.map((doc: any) => (
                        <tr key={doc.id} className={`group hover:bg-surface-container-high transition-all ${selectedDocs.has(doc.id) ? "bg-primary/5" : ""}`}>
                          <td className="px-4 py-3.5">
                            <input type="checkbox" className="rounded"
                              checked={selectedDocs.has(doc.id)}
                              onChange={(e) => {
                                const s = new Set(selectedDocs);
                                e.target.checked ? s.add(doc.id) : s.delete(doc.id);
                                setSelectedDocs(s);
                              }}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">{doc.source_type === "manual" ? "edit_note" : "description"}</span>
                              <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">{doc.filename}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-on-surface-variant">{doc.category}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg ${
                              doc.source_type === "manual" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                            }`}>{doc.source_type}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-on-surface-variant/60">{new Date(doc.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 text-right pr-6">
                            <button
                              onClick={() => setDeleteId(doc.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-error/10 text-error/70 hover:text-error transition-all material-symbols-outlined text-sm"
                            >delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {repoTotal > PAGE_SIZE && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant/50">
                      Page {repoPage} of {Math.ceil(repoTotal / PAGE_SIZE)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadDocuments(repoPage - 1)}
                        disabled={repoPage <= 1}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span> Prev
                      </button>
                      <button
                        onClick={() => loadDocuments(repoPage + 1)}
                        disabled={repoPage >= Math.ceil(repoTotal / PAGE_SIZE)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        Next <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === "ingest" && (
              <section className="space-y-10 animate-in fade-in duration-300">

                {/* Mode Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* --- File Upload --- */}
                  <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden flex flex-col">
                    <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">upload_file</span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-on-surface">Document Upload</h3>
                        <p className="text-[11px] text-on-surface-variant/60">Bulk-ingest files into the knowledge base</p>
                      </div>
                    </div>

                    <div className="flex-1 p-7 space-y-6">
                      {/* Drop zone */}
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                          selectedFile ? 'border-primary/60 bg-primary/5' : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container'
                        }`}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        {selectedFile ? (
                          <div className="space-y-2">
                            <span className="material-symbols-outlined text-primary text-4xl">description</span>
                            <p className="font-bold text-on-surface text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-on-surface-variant/60">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to ingest</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">cloud_upload</span>
                            <div>
                              <p className="font-semibold text-on-surface text-sm">Click to select a file</p>
                              <p className="text-xs text-on-surface-variant/50 mt-1">or drag and drop here</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accepted formats */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Accepted:</span>
                        {['PDF', 'DOCX', 'TXT'].map(f => (
                          <span key={f} className="text-[10px] font-black bg-surface-container-high border border-outline-variant/20 rounded-lg px-2 py-0.5 text-on-surface-variant">{f}</span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {selectedFile && (
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="px-4 py-2.5 text-xs font-bold text-on-surface-variant bg-surface-container rounded-xl hover:bg-surface-container-high transition-all"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={handleFileUpload}
                          disabled={!selectedFile || uploading}
                          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white dark:text-zinc-950 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale shadow-lg shadow-primary/20"
                        >
                          {uploading ? (
                            <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Processing...</>
                          ) : (
                            <><span className="material-symbols-outlined text-sm">memory</span> Embed Document</>
                          )}
                        </button>
                      </div>

                      {/* Upload progress */}
                      {uploading && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Embedding progress</span>
                            <span className="text-[10px] font-mono text-primary">{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-[10px] text-on-surface-variant/40">
                            {uploadProgress < 40 ? "Parsing & chunking document..." : uploadProgress < 80 ? "Generating embeddings..." : "Indexing vectors..."}
                          </p>
                        </div>
                      )}

                      {/* Upload result toast */}
                      {ingestToast && !uploading && (
                        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border animate-in fade-in duration-300 ${
                          ingestToast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : ingestToast.type === "skipped" ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : ingestToast.type === "restored" ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-error/10 border-error/30 text-error"
                        }`}>
                          <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">
                            {ingestToast.type === "success" ? "check_circle" : ingestToast.type === "skipped" ? "content_copy" : ingestToast.type === "restored" ? "restore" : "error"}
                          </span>
                          <p className="text-xs font-semibold leading-relaxed flex-1">{ingestToast.message}</p>
                          <button onClick={() => setIngestToast(null)} className="material-symbols-outlined text-sm opacity-60 hover:opacity-100 shrink-0">close</button>
                        </div>
                      )}

                      {/* What happens */}
                      <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10 flex gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-sm shrink-0 mt-0.5">info</span>
                        <p className="text-xs text-on-surface-variant/60 leading-relaxed">
                          The file will be parsed, split into ~800-token chunks, deduplicated via SHA-256, and embedded using Cohere. All chunks are stored in the vector database and become immediately searchable.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- Manual Knowledge Entry --- */}
                  <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden flex flex-col">
                    <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-lg">edit_note</span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-on-surface">Manual Knowledge Entry</h3>
                        <p className="text-[11px] text-on-surface-variant/60">Directly teach Oracle a specific fact or Q&A pair</p>
                      </div>
                    </div>

                    <div className="flex-1 p-7 space-y-5">

                      {/* How it works primer */}
                      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">lightbulb</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-on-surface">How this works</p>
                          <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                            You define what a user might ask and what Oracle should answer. Both the question and answer are embedded and stored, so Oracle can retrieve the correct answer when a similar question is asked.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Entry Title */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Entry Title <span className="text-on-surface-variant/30 normal-case tracking-normal font-normal">(internal label)</span></label>
                          <input
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30"
                            placeholder="e.g. Refund Policy, Office Hours, Product Pricing..."
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                          />
                        </div>

                        {/* Expected Question */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Expected User Question <span className="text-on-surface-variant/30 normal-case tracking-normal font-normal">(what the user might ask)</span></label>
                          <input
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30"
                            placeholder='e.g. "How do I request a refund?"'
                            value={manualQ}
                            onChange={(e) => setManualQ(e.target.value)}
                          />
                        </div>

                        {/* Official Answer */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Official Answer <span className="text-[10px] text-error/60 font-bold normal-case tracking-normal">*required</span></label>
                          <textarea
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm h-36 outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30"
                            placeholder='e.g. "Refunds can be requested within 30 days of purchase by contacting support@..."'
                            value={manualA}
                            onChange={(e) => setManualA(e.target.value)}
                          />
                          <p className="text-[10px] text-on-surface-variant/40">This is the exact text Oracle will use to answer the question. Write it clearly and completely.</p>
                        </div>
                      </div>

                      {/* Manual ingest result toast */}
                      {ingestToast && (
                        <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border animate-in fade-in duration-300 ${
                          ingestToast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : ingestToast.type === "skipped" ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : ingestToast.type === "restored" ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-error/10 border-error/30 text-error"
                        }`}>
                          <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">
                            {ingestToast.type === "success" ? "check_circle" : ingestToast.type === "skipped" ? "content_copy" : ingestToast.type === "restored" ? "restore" : "error"}
                          </span>
                          <p className="text-xs font-semibold leading-relaxed flex-1">{ingestToast.message}</p>
                          <button onClick={() => setIngestToast(null)} className="material-symbols-outlined text-sm opacity-60 hover:opacity-100 shrink-0">close</button>
                        </div>
                      )}

                      <button
                        onClick={handleManualIngest}
                        disabled={!manualA}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white dark:text-zinc-950 font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale shadow-lg shadow-primary/20"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Add to Knowledge Base
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "audit" && (
              <section className="space-y-6 animate-in fade-in duration-300">

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                  {/* Scope pills */}
                  <div className="flex items-center bg-surface-container rounded-xl p-1 gap-1">
                    {(["all", "admin", "public"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setAuditScope(s)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                          auditScope === s ? "bg-primary text-white dark:text-zinc-950 shadow" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center bg-surface-container rounded-xl p-1 gap-1">
                    {(["newest", "oldest"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setAuditSort(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                          auditSort === s ? "bg-primary text-white dark:text-zinc-950 shadow" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{s === "newest" ? "arrow_downward" : "arrow_upward"}</span>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                      placeholder="Search sessions..."
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                    />
                  </div>

                  {/* Count */}
                  <p className="text-xs text-on-surface-variant/50 font-mono shrink-0">
                    {auditTotal} total sessions
                  </p>
                </div>

                {/* Bulk bar */}
                {selectedAudit.size > 0 && (
                  <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 animate-in fade-in duration-200">
                    <span className="text-sm font-bold text-primary">{selectedAudit.size} selected</span>
                    <button
                      onClick={async () => { await api.bulkDeleteSessions(Array.from(selectedAudit) as string[]); setSelectedAudit(new Set()); addNotification(`${selectedAudit.size} sessions deleted`, "info"); loadAuditSessions(1, auditScope, auditSort); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error text-xs font-bold rounded-xl hover:bg-error/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span> Delete Selected
                    </button>
                    <button onClick={() => setSelectedAudit(new Set())} className="ml-auto text-xs text-on-surface-variant hover:text-on-surface">Clear</button>
                  </div>
                )}

                {/* Table */}
                <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high/50 text-on-surface-variant text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-4 py-4">
                          <input type="checkbox" className="rounded"
                            checked={sessions.length > 0 && sessions.every((s: any) => selectedAudit.has(s.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAudit(new Set(sessions.map((s: any) => s.id)));
                              else setSelectedAudit(new Set());
                            }}
                          />
                        </th>
                        <th className="px-4 py-4">Session</th>
                        <th className="px-4 py-4">Scope</th>
                        <th className="px-4 py-4 text-right pr-6">Last Updated</th>
                        <th className="px-4 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {sessions.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 block mb-2">search_off</span>
                          <p className="text-sm text-on-surface-variant/40">No sessions match your filters</p>
                        </td></tr>
                      ) : sessions.map((sess: any) => (
                        <tr key={sess.id} className={`group hover:bg-surface-container-high transition-all ${selectedAudit.has(sess.id) ? "bg-primary/5" : ""}`}>
                          <td className="px-4 py-4">
                            <input type="checkbox" className="rounded"
                              checked={selectedAudit.has(sess.id)}
                              onChange={(e) => {
                                const s = new Set(selectedAudit);
                                e.target.checked ? s.add(sess.id) : s.delete(sess.id);
                                setSelectedAudit(s);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-4 cursor-pointer" onClick={() => openAuditTrace(sess)}>
                            <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors block">
                              {sess.title === "New Conversation" ? `Chat · ${new Date(sess.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : sess.title}
                            </span>
                            <span className="text-[10px] font-mono text-on-surface-variant/30">{sess.id.slice(0, 12)}...</span>
                          </td>
                          <td className="px-4 py-4"><Badge label={sess.is_internal ? 'Admin' : 'Public'} color={sess.is_internal ? 'primary' : 'orange'} /></td>
                          <td className="px-4 py-4 text-right pr-6 text-[11px] font-bold text-on-surface-variant/60">{new Date(sess.updated_at).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={async (e) => { e.stopPropagation(); await api.deleteSession(sess.id); setSelectedAudit(s => { const n = new Set(s); n.delete(sess.id); return n; }); loadAuditSessions(auditPage, auditScope, auditSort); }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-error/10 text-error/70 hover:text-error transition-all material-symbols-outlined text-sm"
                            >delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditTotal > AUDIT_PAGE_SIZE && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant/50">
                      Page {auditPage} of {Math.ceil(auditTotal / AUDIT_PAGE_SIZE)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadAuditSessions(auditPage - 1)}
                        disabled={auditPage <= 1}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span> Prev
                      </button>
                      <button
                        onClick={() => loadAuditSessions(auditPage + 1)}
                        disabled={auditPage >= Math.ceil(auditTotal / AUDIT_PAGE_SIZE)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        Next <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === "trash" && (
              <section className="space-y-6 animate-in fade-in duration-300">

                {/* Trash filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                  <div className="flex items-center bg-surface-container rounded-xl p-1 gap-1">
                    {(["all", "file", "manual"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTrashType(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                          trashType === t ? "bg-error/80 text-white shadow" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {t === "all" ? "All" : t === "file" ? "Files" : "Manual"}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-sm">search</span>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-error/40 transition-all placeholder:text-on-surface-variant/40"
                      placeholder="Search archived items..."
                      value={trashFilter}
                      onChange={(e) => setTrashFilter(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant/50 font-mono shrink-0">{trashTotal} items</p>
                </div>

                {/* Trash bulk bar */}
                {selectedTrash.size > 0 && (
                  <div className="flex items-center gap-4 bg-error/10 border border-error/30 rounded-2xl px-5 py-3 animate-in fade-in duration-200">
                    <span className="text-sm font-bold text-error">{selectedTrash.size} selected</span>
                    <button
                      onClick={async () => {
                        for (const id of selectedTrash) await api.permanentDelete(id);
                        setSelectedTrash(new Set());
                        addNotification(`${selectedTrash.size} items permanently destroyed`, "warning");
                        refreshData();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-error/20 text-error text-xs font-bold rounded-xl hover:bg-error/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete_forever</span> Destroy Selected
                    </button>
                    <button onClick={() => setSelectedTrash(new Set())} className="ml-auto text-xs text-on-surface-variant hover:text-on-surface">Clear</button>
                  </div>
                )}

                {/* Empty state */}
                {trash.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">delete_sweep</span>
                    </div>
                    <p className="text-lg font-bold text-on-surface">Archive is empty</p>
                    <p className="text-sm text-on-surface-variant max-w-xs">
                      {trashFilter || trashType !== "all" ? "No items match your current filters." : "No documents have been archived. Items you delete from the knowledge base will appear here."}
                    </p>
                    {(trashFilter || trashType !== "all") && (
                      <button onClick={() => { setTrashFilter(""); setTrashType("all"); }} className="text-primary text-sm font-bold hover:underline">Clear filters</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trash.map((doc: any) => (
                      <div key={doc.id} className={`bg-surface-container-low border rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-error/20 transition-all group ${selectedTrash.has(doc.id) ? "border-error/30 bg-error/5" : "border-outline-variant/10"}`}>
                        <input type="checkbox" className="rounded shrink-0"
                          checked={selectedTrash.has(doc.id)}
                          onChange={(e) => {
                            const s = new Set(selectedTrash);
                            e.target.checked ? s.add(doc.id) : s.delete(doc.id);
                            setSelectedTrash(s);
                          }}
                        />
                        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-error text-lg">{doc.source_type === "manual" ? "edit_note" : "description"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">{doc.filename}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-error/60">{doc.source_type}</span>
                            <span className="text-[10px] text-on-surface-variant/40">Archived {doc.deleted_at ? new Date(doc.deleted_at).toLocaleDateString() : "—"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={async () => { await api.restoreDocument(doc.id); refreshData(); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-on-surface bg-surface-container rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">restore</span> Restore
                          </button>
                          <button
                            onClick={async () => { await api.permanentDelete(doc.id); refreshData(); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-error/80 bg-error/5 rounded-xl hover:bg-error/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete_forever</span> Destroy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {trashTotal > PAGE_SIZE && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant/50">
                      Page {trashPage} of {Math.ceil(trashTotal / PAGE_SIZE)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTrash(trashPage - 1)}
                        disabled={trashPage <= 1}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span> Prev
                      </button>
                      <button
                        onClick={() => loadTrash(trashPage + 1)}
                        disabled={trashPage >= Math.ceil(trashTotal / PAGE_SIZE)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        Next <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === "config" && (
              <section className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 max-w-6xl">

                  {/* Left: Core settings form (3/5 width) */}
                  <div className="xl:col-span-3 bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden">
                    <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">settings_input_component</span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-on-surface">System Parameters</h3>
                        <p className="text-[11px] text-on-surface-variant/60">AI persona, fallback behaviour, and search sensitivity</p>
                      </div>
                    </div>
                    {loading ? <div className="p-7"><Skeleton className="h-72 rounded-2xl" /></div> : (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const greeting = (form.querySelector("[name=greeting]") as HTMLTextAreaElement)?.value;
                        const fallback = (form.querySelector("[name=fallback]") as HTMLTextAreaElement)?.value;
                        const threshold = (form.querySelector("[name=threshold]") as HTMLInputElement)?.value;
                        const model = (form.querySelector("[name=grok_model]") as HTMLSelectElement)?.value;
                        await api.updateConfig({ 
                          greeting_message: greeting, 
                          fallback_message: fallback, 
                          similarity_threshold: threshold,
                          grok_model: model 
                        });
                        addNotification("System parameters saved", "success");
                        refreshData();
                      }} className="p-7 space-y-6">

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">AI Persona Greeting</label>
                          <textarea
                            name="greeting"
                            defaultValue={config?.greeting_message}
                            rows={3}
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:text-on-surface-variant/30"
                            placeholder="Hello! How can I help you today?"
                          />
                          <p className="text-[10px] text-on-surface-variant/40">This message is shown when a user first opens the chat.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Fallback Message</label>
                          <textarea
                            name="fallback"
                            defaultValue={config?.fallback_message}
                            rows={3}
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:text-on-surface-variant/30"
                            placeholder="I'm sorry, I couldn't find information on that."
                          />
                          <p className="text-[10px] text-on-surface-variant/40">Shown when no relevant documents are found in the knowledge base.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Semantic Threshold</label>
                            <span className="text-sm font-black text-primary" id="thresh-display">{config?.similarity_threshold || "0.5"}</span>
                          </div>
                          <input
                            type="range"
                            name="threshold"
                            min="0.1" max="0.9" step="0.05"
                            defaultValue={config?.similarity_threshold || "0.5"}
                            onInput={(e) => {
                              const el = document.getElementById("thresh-display");
                              if (el) el.textContent = (e.target as HTMLInputElement).value;
                            }}
                            className="w-full accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-on-surface-variant/40 font-mono">
                            <span>0.1 — Exact (Strict)</span>
                            <span>0.9 — Broad (Loose)</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant/40">Controls how closely a query must match a document (lower = stricter match required).</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Reasoning Engine (Grok)</label>
                          <div className="relative">
                            <select
                              name="grok_model"
                              defaultValue={config?.grok_model || "grok-3-auto"}
                              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 appearance-none transition-all cursor-pointer"
                            >
                              <option value="grok-3-auto">Grok-3 Auto — Automatic optimization</option>
                              <option value="grok-3-fast">Grok-3 Fast — High-speed processing</option>
                              <option value="grok-4">Grok-4 — Enterprise reasoning (Expert)</option>
                              <option value="grok-4-mini-thinking-tahoe">Grok-4 Mini (Thinking) — Deep cognitive analysis</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">unfold_more</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant/40">Select the cognitive model used for query analysis and response generation.</p>
                        </div>

                        <button
                          type="submit"
                          className="flex items-center gap-2 bg-primary text-white dark:text-zinc-950 px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          Save Parameters
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Right: Suggestions (2/5 width) */}
                  <div className="xl:col-span-2 bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden flex flex-col">
                    <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-lg">lightbulb</span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-on-surface">Chat Suggestions</h3>
                        <p className="text-[11px] text-on-surface-variant/60">Up to 5 questions shown in the chat</p>
                      </div>
                    </div>
                    <div className="flex-1 p-7 flex flex-col gap-5">
                      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm shrink-0">info</span>
                        <p className="text-xs text-on-surface-variant/70 leading-relaxed">These questions appear as clickable suggestions when a user opens the chat for the first time.</p>
                      </div>

                      <div className="space-y-3 flex-1">
                        {suggestionInputs.map((q, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-on-surface-variant/30 w-4 shrink-0">{i + 1}</span>
                            <input
                              value={q}
                              onChange={(e) => {
                                const next = [...suggestionInputs];
                                next[i] = e.target.value;
                                setSuggestionInputs(next);
                              }}
                              placeholder={`Suggestion ${i + 1}...`}
                              className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-xs outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all placeholder:text-on-surface-variant/30"
                            />
                            <button
                              onClick={() => setSuggestionInputs(suggestionInputs.filter((_, j) => j !== i))}
                              className="material-symbols-outlined text-error/50 hover:text-error text-sm p-1 rounded-lg hover:bg-error/10 transition-all"
                            >remove</button>
                          </div>
                        ))}

                        {suggestionInputs.length < 5 && (
                          <button
                            onClick={() => setSuggestionInputs([...suggestionInputs, ""])}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-outline-variant/30 rounded-xl py-2.5 text-xs text-on-surface-variant/50 hover:border-secondary/40 hover:text-secondary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> Add Suggestion
                          </button>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          const filtered = suggestionInputs.filter(s => s.trim());
                          await api.updateConfig({ suggested_questions: JSON.stringify(filtered) });
                          addNotification("Suggestions updated", "success");
                          refreshData();
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-white dark:text-zinc-950 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Save Suggestions
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Audit Trace Explorer (Modal-Free Full Workspace) */}
          {selectedSession && (
            <div className="flex-1 flex flex-col h-full bg-surface-dim overflow-hidden animate-in slide-in-from-right-8 duration-500">
               <div className="flex items-center justify-between px-8 py-5 bg-surface-container-low border-b border-outline-variant/10 shrink-0">
                  <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedSession(null)} className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"><span className="material-symbols-outlined leading-none">arrow_back</span><span className="text-sm uppercase tracking-widest">Return to Archive</span></button>
                     <div className="w-px h-6 bg-outline-variant/20" />
                     <div className="flex flex-col"><h2 className="text-sm font-black uppercase tracking-widest text-on-surface">{selectedSession.title}</h2><span className="text-[10px] font-mono text-zinc-500 opacity-60 uppercase">{selectedSession.is_internal ? 'Admin Terminal' : 'Public Environment'} Trace</span></div>
                  </div>
                  <div className="flex items-center gap-4"><span className="text-[10px] font-black text-zinc-500 opacity-50 uppercase tracking-[0.2em]">Transaction Verified</span><span className="material-symbols-outlined text-primary">verified</span></div>
               </div>

               <div className="flex-1 flex overflow-hidden">
                  <div className="w-80 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col shrink-0">
                     <div className="p-4 border-b border-outline-variant/5"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Session Timeline</p></div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loadingDetail ? <div className="p-4 space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> 
                        : sessionDetail.map((msg, idx) => (
                          <button key={idx} onClick={() => setActiveMsgIndex(idx)} className={`w-full p-4 flex flex-col gap-1 text-left border-b border-outline-variant/5 transition-all ${activeMsgIndex === idx ? 'bg-primary/10 border-r-2 border-r-primary shadow-inner' : 'hover:bg-surface-container'}`}>
                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <span className="text-xs font-bold text-on-surface line-clamp-1">{msg.query}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col min-w-0 bg-surface-dim overflow-y-auto custom-scrollbar">
                     {loadingDetail ? <div className="p-8 space-y-8"><Skeleton className="h-40 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div> 
                     : sessionDetail[activeMsgIndex] ? (
                        <div className="p-8 space-y-12 max-w-5xl mx-auto w-full">
                           <div className="space-y-6">
                              <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-xl">
                                 <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-lg">psychology</span></div><p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Subject Query</p></div>
                                 <p className="text-xl font-medium text-on-surface leading-normal">{sessionDetail[activeMsgIndex].query}</p>
                              </div>
                              <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 shadow-2xl relative">
                                 <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-lg">verified_user</span></div><p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Analysis Answer</p></div>
                                 <p className="text-on-surface-variant text-base leading-relaxed whitespace-pre-wrap">{sessionDetail[activeMsgIndex].answer}</p>
                              </div>
                           </div>
                           {sessionDetail[activeMsgIndex].context_used && sessionDetail[activeMsgIndex].context_used.length > 0 && (
                             <div className="space-y-6">
                                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 italic">Valid Evidence Context</p></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {sessionDetail[activeMsgIndex].context_used.map((src: any, ci: number) => (
                                      <div key={ci} className="bg-surface-container-high/15 p-6 rounded-3xl border border-outline-variant/10 hover:border-primary/40 transition-all group relative overflow-hidden">
                                         <div className="flex items-baseline justify-between mb-3">
                                            <span className="text-[10px] font-black text-primary uppercase">Vector 0{ci+1}</span>
                                            {src.score && <span className="text-[10px] font-mono text-zinc-500 font-bold">{(src.score * 100).toFixed(1)}% match</span>}
                                         </div>
                                         <p className="text-[11px] text-on-surface font-bold truncate mb-2 opacity-80">{src.filename || "Unknown Source"}</p>
                                         <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-4">
                                            "{typeof src.content === 'string' ? src.content : (typeof src === 'string' ? src : 'Relevance metadata exists, but text chunk not stored in legacy log.')}"
                                          </p>
                                      </div>
                                   ))}
                                </div>
                             </div>
                           )}
                        </div>
                     ) : null}
                  </div>
               </div>
            </div>
          )}
        </main>

      {/* Logic Overrides Modals */}
      <Modal isOpen={confirmConfig !== null} onClose={() => setConfirmConfig(null)} title="Confirm Logic Override">
         <div className="space-y-6">
            <p className="text-on-surface-variant text-sm leading-relaxed">You are about to modify a critical system parameter. This will affect all future AI generations and retrieval logic.</p>
            <div className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/10">
               <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2">{confirmConfig?.label}</p>
               <p className="text-sm font-bold text-on-surface truncate">{confirmConfig?.value}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
               <button onClick={() => setConfirmConfig(null)} className="px-6 py-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
               <button onClick={handleConfigSave} className="bg-primary text-on-primary px-10 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Confirm & Apply</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Knowledge Deletion">
        <p className="text-zinc-400 mb-8">Move this item to the Archive? You can restore it later.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-6 py-2 text-zinc-500 font-bold">Cancel</button>
          <button onClick={() => deleteId && handleSoftDelete(deleteId)} className="bg-error text-white px-8 py-2 rounded-xl font-bold">Confirm Archive</button>
        </div>
      </Modal>
    </div>
  );
}

function Table({ items, onDelete, onRestore, onPermanent, type, loading }: any) {
  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rouned-xl" />)}</div>;

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-surface-container-high/50 text-on-surface-variant text-[10px] uppercase font-black tracking-widest">
          <tr><th className="px-6 py-4">Title</th><th className="px-6 py-4 text-center">Source</th><th className="px-6 py-4 text-right pr-12">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/10">
          {items.map((doc: any) => (
            <tr key={doc.id} className="group hover:bg-surface-container-high transition-colors">
              <td className="px-6 py-5 text-sm font-medium text-on-surface">{doc.filename}</td>
              <td className="px-6 py-5 text-center text-[10px] font-black uppercase text-secondary tracking-widest">{doc.source_type}</td>
              <td className="px-6 py-5 text-right pr-12 opacity-80 group-hover:opacity-100 transition-opacity">
                {type === "active" ? (
                  <button onClick={() => onDelete(doc.id)} className="material-symbols-outlined text-lg hover:text-error">archive</button>
                ) : (
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onRestore(doc.id)} className="material-symbols-outlined text-lg hover:text-primary">restore</button>
                    <button onClick={() => onPermanent(doc.id)} className="material-symbols-outlined text-lg hover:text-error">delete_forever</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormalConfigField({ label, value, onEdit, onCancel, onSave, isEditing, type = "text" }: any) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value, isEditing]);

  return (
    <div className="space-y-4 group">
       <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</label>
          {!isEditing && <button onClick={onEdit} className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Edit Parameter</button>}
       </div>
       
       {isEditing ? (
         <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
            {type === "range" ? (
              <div className="flex items-center gap-4 bg-surface-container-high p-4 rounded-xl">
                 <input type="range" min="0.1" max="0.9" step="0.05" className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary" value={val} onChange={(e) => setVal(e.target.value)} />
                 <span className="text-xs font-mono text-primary font-bold">{val}</span>
              </div>
            ) : (
              <input className="w-full bg-surface-container-lowest border-2 border-primary/20 rounded-xl p-4 text-on-surface outline-none focus:border-primary transition-all" value={val} onChange={(e) => setVal(e.target.value)} />
            )}
            <div className="flex justify-end gap-3">
               <button onClick={onCancel} className="px-4 py-2 text-[10px] font-black text-zinc-500 tracking-widest uppercase">Cancel</button>
               <button onClick={() => onSave(val)} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-md">Apply Change</button>
            </div>
         </div>
       ) : (
         <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-outline-variant/10">
            <p className="text-sm font-medium text-on-surface-variant truncate">{val}</p>
         </div>
       )}
    </div>
  );
}

function Badge({ label, color }: any) {
  const colors = {
    primary: "text-primary border-primary/20 bg-primary/5",
    orange: "text-orange-500 border-orange-500/20 bg-orange-500/5"
  };
  return <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colors[color as keyof typeof colors]}`}>{label}</span>;
}

function StatCard({ title, value, icon, color, glow }: any) {
  return (
    <div className="bg-surface-container-low p-7 rounded-[2rem] border border-outline-variant/10 hover:bg-surface-container transition-all relative overflow-hidden group shadow-2xl">
      <div className={`absolute -right-4 -top-4 w-32 h-32 ${glow} rounded-full blur-3xl`} />
      <div className="relative z-10 flex justify-between items-start">
        <div><p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{title}</p><h3 className="text-5xl font-black text-on-surface tracking-tighter">{value}</h3></div>
        <div className={`w-12 h-12 ${glow} rounded-2xl flex items-center justify-center`}><span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span></div>
      </div>
    </div>
  );
}
