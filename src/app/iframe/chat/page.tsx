"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import Markdown from "@/components/chat/Markdown";

const LS_SESSION_KEY = "oracle_guest_session";
const LS_HISTORY_KEY = "oracle_guest_history";
const LS_SUGGESTIONS_KEY = "oracle_dynamic_suggestions";

interface Msg { role: "user" | "assistant"; content: string; }

export default function IframeChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Session management - Persist ID only to allow resuming chat
    let currentSid = localStorage.getItem(LS_SESSION_KEY);
    if (!currentSid) {
      currentSid = crypto.randomUUID();
      localStorage.setItem(LS_SESSION_KEY, currentSid);
    }
    setSessionId(currentSid);

    // Initial load: Attempt Local Cache first, then sync with DB
    const init = async () => {
      let activeSid = currentSid;
      
      // Load from cache for instant feedback
      const localHistory = localStorage.getItem(LS_HISTORY_KEY);
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          if (parsed.length > 0) setMessages(parsed);
        } catch (e) {
          console.warn("History cache corrupted");
        }
      }

      // Load dynamic suggestions from cache
      const localSuggestions = localStorage.getItem(LS_SUGGESTIONS_KEY);
      if (localSuggestions) {
        try {
          const parsed = JSON.parse(localSuggestions);
          if (Array.isArray(parsed)) setDynamicSuggestions(parsed);
        } catch (e) {
          console.warn("Suggestions cache corrupted");
        }
      }

      try {
        const [greetData, historyData] = await Promise.all([
          api.getGreeting(),
          api.getSessionHistory(activeSid!, true)
        ]);
        
        const greeting: Msg = { role: "assistant", content: greetData.greeting };
        const dbMsgs: Msg[] = Array.isArray(historyData) ? historyData.flatMap((h: any) => [
          { role: "user", content: h.query },
          { role: "assistant", content: h.answer }
        ]) : [];
        
        const finalMsgs = dbMsgs.length > 0 ? [greeting, ...dbMsgs] : [greeting];
        
        // Strict Sync: Only overwrite if we found something or it is a fresh session
        setMessages(finalMsgs);
        localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(finalMsgs));
      } catch (err) {
        console.error("Critical History Sync Failure:", err);
      }
    };

    init();
    api.getSuggestions().then((d) => setSuggestions(d.suggestions || [])).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Local state update + Cache persistence
  const setLocalMessages = (msgs: Msg[]) => {
    setMessages(msgs);
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(msgs));
  };

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");

    const history = messages.slice(1).reduce<{q: string, a: string}[]>((acc, m, i, arr) => {
      if (m.role === "user" && arr[i+1]?.role === "assistant") {
        acc.push({ q: m.content, a: arr[i+1].content });
      }
      return acc;
    }, []);

    const newMsgs: Msg[] = [...messages, { role: "user", content: msg }];
    setLocalMessages(newMsgs);
    setLoading(true);

    try {
      const res = await api.query(msg, sessionId, false, history);
      setLocalMessages([...newMsgs, { role: "assistant", content: res.answer || "I couldn't generate an answer." }]);
      
      // Update session ID if it changed or was newly generated
      if (res.session_id && res.session_id !== sessionId) {
        setSessionId(res.session_id);
        localStorage.setItem(LS_SESSION_KEY, res.session_id);
      }

      if (res.follow_ups && res.follow_ups.length > 0) {
        setDynamicSuggestions(res.follow_ups);
        localStorage.setItem(LS_SUGGESTIONS_KEY, JSON.stringify(res.follow_ups));
      } else {
        setDynamicSuggestions([]);
        localStorage.removeItem(LS_SUGGESTIONS_KEY);
      }
    } catch {
      setLocalMessages([...newMsgs, { role: "assistant", content: "Sorry, I couldn't connect to the server." }]);
      setDynamicSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    const newSid = crypto.randomUUID();
    localStorage.setItem(LS_SESSION_KEY, newSid);
    localStorage.removeItem(LS_HISTORY_KEY);
    localStorage.removeItem(LS_SUGGESTIONS_KEY);
    setSessionId(newSid);
    setDynamicSuggestions([]);
    api.getGreeting().then((d) => setLocalMessages([{ role: "assistant", content: d.greeting }])).catch(() => setLocalMessages([]));
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden font-sans selection:bg-primary/30">
      {/* Header */}
      <div className="bg-surface-container-low border-b border-outline-variant/20 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">bolt</span>
          </div>
          <span className="font-black text-sm text-on-surface">Oracle Assistant</span>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          <span className="material-symbols-outlined text-xs">add</span> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto oracle-scroll p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-white dark:text-zinc-950 rounded-tr-none"
                : "bg-surface-container border border-outline-variant/20 text-on-surface rounded-tl-none overflow-hidden"
            }`}>
              <Markdown content={msg.content} />
            </div>
          </div>
        ))}

        {/* Suggestion Logic: Starters only at absolute beginning, Follow-ups during conversation */}
        {!loading && (
          <div className="pt-2">
            <SuggestedQuestions 
              suggestions={messages.length <= 1 ? suggestions : dynamicSuggestions}
              onSelect={handleSend}
              limit={messages.length <= 1 ? 5 : 3}
              className="px-1"
            />
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container border border-outline-variant/20 rounded-xl rounded-tl-none px-3.5 py-2.5 flex gap-1">
              {[0,1,2].map(x => <span key={x} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: `${x*0.15}s`}} />)}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-outline-variant/10 bg-surface-dim flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything..."
          disabled={loading}
          className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-3.5 py-2.5 bg-primary text-white dark:text-zinc-950 rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </div>
  );
}
