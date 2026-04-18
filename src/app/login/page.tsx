"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setToken, isLoggedIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Already logged in → go to admin
    if (isLoggedIn()) router.replace("/admin");
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Please fill in both fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // allows backend to set httpOnly cookie
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) throw new Error(data.detail || "No token returned");
      setToken(data.access_token, data.username, data.expires_in || 3600);
      // Set a cookie so Next.js middleware can check it
      document.cookie = `oracle_token=${data.access_token}; path=/; max-age=${data.expires_in || 3600}; SameSite=Lax`;
      router.replace("/admin");
    } catch (err: any) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Website
          </Link>
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/10">
            <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Oracle Admin</h1>
          <p className="text-sm text-on-surface-variant/70">Secure Intelligence Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-sm">person</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-11 pr-4 py-3.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-sm">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-11 pr-12 py-3.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all placeholder:text-on-surface-variant/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 hover:text-on-surface-variant transition-colors text-sm"
                >
                  {showPass ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">error</span>
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white dark:text-zinc-950 py-4 rounded-xl font-black text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Authenticating...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">login</span> Access Control Panel</>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">Secured by Oracle</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          <p className="text-center text-[10px] text-on-surface-variant/40 leading-relaxed">
            This portal is restricted to authorized administrators only.<br />
            All access attempts are logged and audited.
          </p>
        </div>
      </div>
    </div>
  );
}
