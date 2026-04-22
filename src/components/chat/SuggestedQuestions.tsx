"use client";

import React, { useState, useEffect } from "react";

interface SuggestedQuestionsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  className?: string;
  limit?: number;
}

const LS_KEY = "oracle_used_suggestions";

export default function SuggestedQuestions({ suggestions, onSelect, className = "", limit = 10 }: SuggestedQuestionsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (q: string) => {
    onSelect(q);
  };

  const remaining = suggestions.slice(0, limit);
  if (!mounted || remaining.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`}>
      {remaining.map((q, i) => (
        <button
          key={i}
          onClick={() => handleSelect(q)}
          className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-xs font-medium text-on-surface hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap shadow-sm"
        >
          <span className="material-symbols-outlined text-sm text-on-surface-variant/50 group-hover:text-primary transition-colors">
            lightbulb
          </span>
          {q}
        </button>
      ))}
    </div>
  );
}
