"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import Markdown from "@/components/chat/Markdown";

interface Source {
  doc_id: number;
  score: number;
  filename?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
  sources?: Source[];
}

function ChatContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const isGuest = searchParams.get("mode") === "guest";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load suggestions on mount
  useEffect(() => {
    api.getSuggestions()
      .then((d) => setSuggestions(d.suggestions || []))
      .catch(() => {});
  }, []);

  // Load session history when session changes
  useEffect(() => {
    setDynamicSuggestions([]); // Always flush dynamic suggestions on new session
    if (sessionId) {
      loadHistory(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  const loadHistory = async (id: string) => {
    setLoadingHistory(true);
    try {
      const data = await api.getSessionHistory(id);
      const msgList: Message[] = [];
      data.forEach((entry: any) => {
        msgList.push({ role: "user", content: entry.query });
        // context_used now stores [{doc_id, score, filename}] — use it directly
        const sources: Source[] = Array.isArray(entry.context_used) && entry.context_used.length > 0
          ? entry.context_used.filter((s: any) => s && typeof s.doc_id === "number")
          : [];
        msgList.push({ role: "ai", content: entry.answer, sources });
      });
      setMessages(msgList);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingHistory]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.query(userMsg, sessionId || undefined, true);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.answer, sources: res.sources || [] },
      ]);
      
      if (res.follow_ups && res.follow_ups.length > 0) {
        setDynamicSuggestions(res.follow_ups);
      } else {
        setDynamicSuggestions([]);
      }

      if (!sessionId && res.session_id) {
        window.history.replaceState(null, "", `/chat?session=${res.session_id}`);
      }
    } catch (e) {
      console.error("Query failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background w-full h-screen overflow-hidden selection:bg-primary/30">
      <TopBar />
      {!isGuest && <Sidebar />}

      <main className={`flex flex-col mt-16 h-[calc(100vh-4rem)] ${isGuest ? "max-w-4xl mx-auto" : "oracle-main-content"} bg-surface-dim relative`}>

        {/* ── Scrollable message list ── */}
        <div className="flex-1 overflow-y-auto oracle-scroll p-4 md:p-8 space-y-6">
          {loadingHistory ? (
            <div className="space-y-8 pt-4">
              <Skeleton className="h-20 w-3/4 rounded-2xl rounded-tl-none" />
              <Skeleton className="h-16 w-1/2 ml-auto rounded-2xl rounded-tr-none" />
              <Skeleton className="h-24 w-2/3 rounded-2xl rounded-tl-none" />
            </div>
          ) : messages.length === 0 ? (
            /* ── Empty state with suggested questions ── */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 pb-8">
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl text-primary">forum</span>
                </div>
                <p className="text-2xl font-black text-on-surface tracking-tight">How can Oracle help?</p>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto">Ask anything from the knowledge base or try one of these discovery prompts:</p>
              </div>

              <SuggestedQuestions 
                suggestions={suggestions} 
                onSelect={handleSend}
                limit={6}
              />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-lg ${
                  msg.role === "user"
                    ? "bg-primary-container text-on-primary-container rounded-tr-none"
                    : "bg-surface-container border border-outline-variant/20 rounded-tl-none text-on-surface overflow-hidden"
                }`}>
                  <Markdown content={msg.content} />

                  {/* ── Sources — now with real filenames ── */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                        Sources & Evidence
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((s, si) => (
                          <div
                            key={si}
                            className="bg-surface-container-high px-2.5 py-1 rounded-lg text-[10px] font-bold border border-outline-variant/20 flex items-center gap-1.5 text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[10px]">description</span>
                            <span className="truncate max-w-[140px]">
                              {s.filename ? s.filename.replace(/\.[^.]+$/, "") : `Doc #${s.doc_id}`}
                            </span>
                            <span className="opacity-50 font-normal">{(s.score * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* ── Contextual Suggestions ── */}
          {!loading && !loadingHistory && messages.length > 0 && (
            <div className="pt-4 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-3 ml-1">
                {dynamicSuggestions.length > 0 ? "Follow-up Questions" : "More Discovery"}
              </p>
              <SuggestedQuestions 
                suggestions={dynamicSuggestions}
                onSelect={handleSend}
                limit={3}
              />
            </div>
          )}

          {/* ── Thinking indicator ── */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-surface-container border border-outline-variant/20 rounded-2xl rounded-tl-none px-5 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* ── Input area ── */}
        <div className="shrink-0 px-4 md:px-8 py-4 border-t border-outline-variant/10 bg-surface-dim">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Oracle anything..."
              disabled={loading || loadingHistory}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 px-5 pr-16 text-on-surface placeholder:text-on-surface-variant/40 shadow-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all outline-none disabled:opacity-50 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || loadingHistory || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-white dark:text-zinc-950">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-white dark:text-zinc-950">send</span>
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-on-surface-variant/35 mt-2 uppercase tracking-wider">
            {isGuest ? "Powered by Oracle Enterprise Intelligence" : "Secured by Grok-3 Enterprise Logic · Vector-Verified Accuracy"}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>}>
      <ChatContent />
    </Suspense>
  );
}
