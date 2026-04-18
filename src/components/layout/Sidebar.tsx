"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken, getUsername, getAvatar } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  
  const [sessions, setSessions] = useState<{id: string, title: string}[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile/Tablet drawer state

  const isChat = pathname === "/admin/chat" || pathname === "/chat";
  const isAdminDashboard = pathname.startsWith("/admin") && pathname !== "/admin/chat";
  const isMisc = pathname.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    loadSessions();

    const handleToggle = () => {
      // Toggle drawer unconditionally since the trigger button is hidden by CSS on desktop
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("toggle-oracle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-oracle-sidebar", handleToggle);
  }, [pathname]);

  // Close drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions(false, "all", "newest", 1, 10);
      setSessions(data.items || []);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const handleNewChat = () => {
    localStorage.removeItem("oracle_used_suggestions");
    window.dispatchEvent(new Event("oracle-reset"));
    router.push(`/admin/chat?session=${crypto.randomUUID()}`);
  };

  const adminNav = [
    { id: "overview", label: "Overview", icon: "dashboard", href: "/admin" },
    { id: "docs", label: "Repository", icon: "description", href: "/admin?tab=docs" },
    { id: "ingest", label: "Ingestion", icon: "upload_file", href: "/admin?tab=ingest" },
    { id: "audit", label: "Audit Logs", icon: "history_edu", href: "/admin?tab=audit" },
    { id: "trash", label: "Trash", icon: "delete_sweep", href: "/admin?tab=trash" },
    { id: "config", label: "System", icon: "settings_input_component", href: "/admin?tab=config" },
    { id: "settings", label: "Settings", icon: "manage_accounts", href: "/admin/settings" },
  ];

  const mainNavOnMobile = [
    { label: "Knowledge", href: "/admin/chat", icon: "forum" },
    { label: "Console", href: "/admin", icon: "terminal" },
    { label: "Docs", href: "/admin/docs", icon: "menu_book" },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop (Mobile/Tablet) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] oracle-mobile-only animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-16 bottom-0 flex-col border-r shell-border py-6 flex-shrink-0 z-[60] transition-all duration-300 transform overflow-y-auto oracle-scroll bg-background ${
        isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 w-64"
      }`}>
        {/* Branding (Mobile only) */}
        <div className="px-6 mb-8 flex items-center gap-3 oracle-mobile-only">
          <div className="w-8 h-8 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined text-on-primary-container text-lg">auto_awesome</span>
          </div>
          <h2 className="text-base font-bold nav-text leading-tight">Oracle AI</h2>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto oracle-scroll space-y-1">
          {/* Main sections on Mobile */}
          <div className="oracle-mobile-only space-y-1 mb-6 border-b shell-border pb-4 w-full">
            <p className="px-4 text-[10px] nav-text-muted uppercase tracking-widest font-black mb-2">Navigation</p>
            {mainNavOnMobile.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href ? "bg-primary/10 text-primary font-bold" : "nav-text-muted nav-hover"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          {isAdminDashboard ? (
            /* Admin dashboard nav (Overview, Repo, Ingest, etc.) */
            adminNav.map((item) => {
              const active =
                (item.href === "/admin/settings" && pathname === "/admin/settings") ||
                (item.href.includes("?tab=") && tab === item.id) ||
                (item.id === "overview" && !searchParams.get("tab") && pathname === "/admin");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-xl group ${
                    active
                      ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                      : "nav-text-muted nav-hover"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl ${active ? "text-primary" : "nav-icon group-hover:text-primary transition-colors"}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })
          ) : (
            /* Chat / other pages: show Recent Conversations */
            <>
              {/* Link back to admin if on misc pages */}
              {isMisc && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2.5 mb-2 text-on-surface-variant/70 hover:text-primary rounded-xl hover:bg-primary/5 nav-text-muted nav-hover text-sm font-medium transition-all"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Admin Console
                </Link>
              )}

              <p className="px-4 text-[10px] nav-text-muted uppercase tracking-widest font-black mb-3 mt-2">Recent Conversations</p>
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant/20 block mb-1">chat_bubble_outline</span>
                    <p className="text-[11px] text-on-surface-variant/40">No conversations yet</p>
                  </div>
                ) : sessions.slice(0, 10).map((session) => {
                  const isActive = searchParams.get("session") === session.id;
                  return (
                    <Link
                      key={session.id}
                      href={`/admin/chat?session=${session.id}`}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 cursor-pointer rounded-xl group text-sm ${
                        isActive
                          ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                          : "nav-text-muted nav-hover"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm nav-icon group-hover:text-primary transition-colors shrink-0">chat_bubble</span>
                      <span className="truncate">{session.title || "New Chat"}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* New Chat button */}
        <div className="px-4 mt-4">
          <button
            onClick={handleNewChat}
            className="w-full py-3 bg-primary-container text-on-primary-container text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-primary-container/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="mt-4 px-4 py-4 border-t shell-border space-y-1">
          <Link href="/admin/docs" className="flex items-center gap-3 px-4 py-2 nav-text-muted nav-hover rounded-xl text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-lg nav-icon">menu_book</span>
            <span>Documentation</span>
          </Link>
          <Link href="/admin/help" className="flex items-center gap-3 px-4 py-2 nav-text-muted nav-hover rounded-xl text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-lg nav-icon">help_outline</span>
            <span>Help</span>
          </Link>
          
          {/* Mobile Profile & Logout */}
          <div className="oracle-mobile-only pt-4 mt-4 border-t shell-border space-y-1 w-full">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20">
                {getAvatar()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{getUsername() || "Admin"}</p>
                <p className="text-[10px] text-on-surface-variant/60">Administrator</p>
              </div>
            </div>
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 nav-text-muted nav-hover rounded-xl text-sm font-medium transition-colors">
              <span className="material-symbols-outlined text-lg nav-icon">settings</span>
              <span>Account Settings</span>
            </Link>
            <button 
              onClick={() => {
                clearToken();
                document.cookie = "oracle_token=; path=/; max-age=0";
                router.replace("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-error/80 hover:bg-error/5 rounded-xl text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
