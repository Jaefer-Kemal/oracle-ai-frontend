"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getAvatar, setAvatar, AVATARS,
  getNotifications, markAllRead, addNotification, Notification,
  clearToken, getUsername, isLoggedIn,
} from "@/lib/auth";

export default function TopBar({ noSidebar = false }: { noSidebar?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [avatar, setAvatarState] = React.useState(AVATARS[0]);
  const [username, setUsernameState] = React.useState<string | null>(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("oracle_theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setAvatarState(getAvatar());
    setUsernameState(getUsername());
    setNotifications(getNotifications());

    // Close dropdowns on outside click
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("oracle_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleAvatarSelect = (a: string) => {
    setAvatar(a);
    setAvatarState(a);
  };

  const handleLogout = () => {
    clearToken();
    document.cookie = "oracle_token=; path=/; max-age=0";
    router.replace("/login");
  };

  const openNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
    if (!showNotifications) {
      markAllRead();
      setNotifications(getNotifications().map((n) => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { label: "Knowledge", href: "/admin/chat", active: pathname.includes("/admin/chat") || pathname === "/chat" },
    { label: "Console", href: "/admin", active: pathname === "/admin" || pathname.startsWith("/admin?") },
    { label: "Docs", href: "/admin/docs", active: pathname.includes("/admin/docs") },
    { label: "Help", href: "/admin/help", active: pathname.includes("/admin/help") },
  ];

  if (!mounted) return null;

  const loggedIn = isLoggedIn();

  return (
    <header className={`nav-shell fixed top-0 right-0 z-50 border-b shell-border flex justify-between items-center px-4 md:px-6 h-16 shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ${noSidebar ? "left-0" : "left-[var(--topbar-left)]"}`}>
      {/* Left: brand + nav */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Hamburger (Mobile/Tablet only) */}
        {!noSidebar && (
          <button
            onClick={() => window.dispatchEvent(new Event("toggle-oracle-sidebar"))}
            className="oracle-mobile-only shrink-0 p-2 hover:bg-surface-container rounded-lg material-symbols-outlined nav-text transition-all active:scale-90"
          >
            menu
          </button>
        )}
        
        <Link 
          href={loggedIn ? "/admin" : "/"} 
          className={`text-xl font-black nav-text tracking-tighter hover:text-primary transition-colors flex items-center gap-2 shrink-0 ${noSidebar ? "" : "lg:hidden"}`}
        >
          Oracle AI
        </Link>
        {loggedIn && (
          <nav className="hidden lg:flex items-center gap-5 h-full">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold transition-all pb-0.5 ${
                  item.active ? "text-primary border-b-2 border-primary" : "nav-text-muted hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Home / Public Link */}
        <Link
          href="/"
          title="Return to Homepage"
          className="p-2.5 nav-hover border shell-border transition-all rounded-xl nav-icon active:scale-95 material-symbols-outlined"
        >
          home
        </Link>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 bg-surface-container-high/60 hover:bg-primary/10 border shell-border transition-all rounded-xl text-primary active:scale-95 material-symbols-outlined"
        >
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </button>

        {loggedIn && (
          <>
            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={openNotifications}
                className="relative p-2.5 nav-hover border shell-border transition-all rounded-xl nav-icon active:scale-95 material-symbols-outlined"
              >
                notifications
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                    <p className="text-sm font-black text-on-surface">Notifications</p>
                    <button onClick={() => { markAllRead(); setNotifications(getNotifications().map(n => ({...n, read: true}))); }} className="text-[10px] text-primary font-bold hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto oracle-scroll divide-y divide-outline-variant/10">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 block mb-2">notifications_none</span>
                        <p className="text-xs text-on-surface-variant/40">No notifications yet</p>
                      </div>
                    ) : notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 ${!n.read ? "bg-primary/5" : ""}`}>
                        <span className={`material-symbols-outlined text-sm shrink-0 mt-0.5 ${n.type === "success" ? "text-emerald-500" : n.type === "warning" ? "text-amber-500" : "text-primary"}`}>
                          {n.type === "success" ? "check_circle" : n.type === "warning" ? "warning" : "info"}
                        </span>
                        <div>
                          <p className="text-xs text-on-surface leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-on-surface-variant/40 mt-0.5">{new Date(n.time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Avatar */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="w-9 h-9 rounded-xl border shell-border bg-surface-container-high flex items-center justify-center text-lg hover:ring-2 hover:ring-primary/30 transition-all active:scale-95"
              >
                {avatar}
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-5 py-4 border-b border-outline-variant/10">
                    <p className="font-black text-sm text-on-surface">{username || "Admin"}</p>
                    <p className="text-[10px] text-on-surface-variant/50">Oracle Administrator</p>
                  </div>

                  {/* Avatar selector */}
                  <div className="px-5 py-3 border-b border-outline-variant/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mb-2">Select Avatar</p>
                    <div className="flex gap-2">
                      {AVATARS.map((a) => (
                        <button
                          key={a}
                          onClick={() => handleAvatarSelect(a)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                            avatar === a ? "ring-2 ring-primary bg-primary/10" : "hover:bg-surface-container hover:scale-110"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/admin?tab=config"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">settings</span>
                      System Parameters
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/10 text-error transition-all text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!loggedIn && (
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-white dark:text-zinc-950 rounded-xl text-sm font-bold hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-sm">login</span>
            Admin Login
          </Link>
        )}
      </div>
    </header>
  );
}
