"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none oracle-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative group my-4">
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                     className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all active:scale-95"
                     title="Copy code"
                   >
                     <span className="material-symbols-outlined text-sm">content_copy</span>
                   </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl !bg-zinc-950 !mt-0 !mb-0 border border-outline-variant/20 shadow-2xl"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold text-[0.9em]" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return <div className="overflow-x-auto my-4 rounded-xl border border-outline-variant/20"><table className="w-full text-sm">{children}</table></div>;
          },
          thead({ children }) {
            return <thead className="bg-surface-container-high border-b border-outline-variant/20">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-3 text-left font-black tracking-tight text-on-surface uppercase text-[10px]">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 border-b border-outline-variant/10 text-on-surface-variant">{children}</td>;
          },
          h1: ({ children }) => <h1 className="text-xl font-black mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-black mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-black mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed last:mb-0">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
