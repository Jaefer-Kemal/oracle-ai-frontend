"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { getAvatar, setAvatar, AVATARS, getUsername, addNotification } from "@/lib/auth";
import { api } from "@/lib/api";

const PROVIDERS = [
  { id: "grok", name: "Grok (xAI)", icon: "psychology" },
  { id: "gemini", name: "Gemini (Google)", icon: "auto_awesome" },
  { id: "g4f", name: "GPT Fallback (g4f)", icon: "robot_2" },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [avatar, setAvatarState] = useState(AVATARS[0]);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // AI Config States
  const [activeProvider, setActiveProvider] = useState("grok");
  const [fallbackChain, setFallbackChain] = useState<string[]>(["grok", "gemini"]);
  const [gemini1psid, setGemini1psid] = useState("");
  const [gemini1psidts, setGemini1psidts] = useState("");
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAvatarState(getAvatar());
    const u = getUsername() || "admin";
    setUsername(u);
    setDisplayName(u);
    fetchAiConfig();
  }, []);

  const fetchAiConfig = async () => {
    try {
      const config = await api.getConfig();
      if (config) {
        setActiveProvider(config.active_provider || "grok");
        try {
          const chain = JSON.parse(config.fallback_chain || '["grok", "gemini"]');
          setFallbackChain(chain);
        } catch {
          setFallbackChain(["grok", "gemini"]);
        }
        setGemini1psid(config.gemini_1psid || "");
        setGemini1psidts(config.gemini_1psidts || "");
      }
    } catch (err) {
      console.error("Failed to fetch AI config", err);
    }
  };

  if (!mounted) return null;

  const handleAvatarSave = (a: string) => {
    setAvatar(a);
    setAvatarState(a);
    addNotification("Avatar updated", "success");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    
    // 1. Local Validation
    if (newPass && newPass !== confirmPass) { setError("Passwords do not match."); return; }
    if (newPass && newPass.length < 6) { setError("New password must be at least 8 characters."); return; }
    if (newPass && !currentPass) { setError("Current password is required to make security changes."); return; }

    setSaving(true);
    try {
      // 2. Local Storage Updates (Display Name)
      localStorage.setItem("oracle_display_name", displayName);

      // 3. API Call (Password Change)
      if (newPass) {
        const res = await api.changePassword(currentPass, newPass);
        if (res.status === "success") {
          addNotification("Password updated successfully", "success");
          setSuccess("Profile and password updated successfully.");
          setCurrentPass(""); setNewPass(""); setConfirmPass("");
        } else {
          setError(res.detail || "Failed to update password. Verify your current password.");
        }
      } else {
        addNotification("Profile settings updated", "success");
        setSuccess("Settings saved successfully.");
      }
    } catch {
      setError("Critical server error while saving settings.");
    } finally { setSaving(false); }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiSaving(true);
    try {
      await api.updateConfig({
        active_provider: activeProvider,
        fallback_chain: JSON.stringify(fallbackChain),
        gemini_1psid: gemini1psid,
        gemini_1psidts: gemini1psidts,
      });
      addNotification("AI configuration updated", "success");
    } catch {
      addNotification("Failed to update AI config", "error");
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen w-full">
      <TopBar />
      <Sidebar />
      <main className="oracle-main-content mt-16 h-[calc(100vh-4rem)] bg-surface-dim overflow-y-auto oracle-scroll p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Account Settings</h2>
            <p className="text-sm text-on-surface-variant/60 mt-1">Manage your profile, avatar, and security credentials</p>
          </div>

          {/* Avatar card */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden">
            <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">face</span>
              </div>
              <div>
                <h3 className="text-base font-black text-on-surface">Profile Avatar</h3>
                <p className="text-[11px] text-on-surface-variant/60">Choose your display avatar</p>
              </div>
            </div>
            <div className="p-7 space-y-5">
              <div className="flex items-center gap-6">
                {/* Current avatar large */}
                <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center text-5xl border border-outline-variant/20">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface mb-3">Select an avatar</p>
                  <div className="flex gap-3">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => handleAvatarSave(a)}
                        className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                          avatar === a
                            ? "ring-2 ring-primary bg-primary/10 scale-110 shadow-lg"
                            : "bg-surface-container hover:bg-surface-container-high hover:scale-105"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile + Password card */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden">
            <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-lg">security</span>
              </div>
              <div>
                <h3 className="text-base font-black text-on-surface">Security & Identity</h3>
                <p className="text-[11px] text-on-surface-variant/60">Update your display name and password</p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="p-7 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your name"
                />
              </div>

              {/* Password section */}
              <div className="pt-2 border-t border-outline-variant/10 space-y-4">
                <p className="text-xs font-bold text-on-surface-variant/70">Change Password <span className="text-on-surface-variant/40 font-normal">(leave blank to keep current)</span></p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">New Password</label>
                    <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Confirm New</label>
                    <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              {error && <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-error text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{error}</div>}
              {success && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span>{success}</div>}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white dark:text-zinc-950 px-8 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {saving ? <><span className="material-symbols-outlined animate-spin text-sm">refresh</span>Saving...</> : <><span className="material-symbols-outlined text-sm">save</span>Save Changes</>}
              </button>
            </form>
          </div>

          {/* AI Configuration Section */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden">
            <div className="px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">settings_suggest</span>
              </div>
              <div>
                <h3 className="text-base font-black text-on-surface">AI Provider Configuration</h3>
                <p className="text-[11px] text-on-surface-variant/60">Manage primary engines and fallback orchestration</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveAiConfig} className="p-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Provider */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Primary Provider</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveProvider(p.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          activeProvider === p.id 
                            ? "bg-primary/10 border-primary shadow-sm" 
                            : "bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant/30"
                        }`}
                      >
                        <span className={`material-symbols-outlined ${activeProvider === p.id ? "text-primary" : "text-on-surface-variant"}`}>
                          {p.icon}
                        </span>
                        <span className={`text-sm font-bold ${activeProvider === p.id ? "text-primary" : "text-on-surface"}`}>
                          {p.name}
                        </span>
                        {activeProvider === p.id && (
                          <span className="material-symbols-outlined ml-auto text-primary text-sm">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fallback chain (Simplified) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Fallback Hierarchy</label>
                  <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] text-on-surface-variant/40 italic">System will attempt providers in this order if failures occur:</p>
                    <div className="space-y-2">
                        {fallbackChain.map((id, idx) => (
                           <div key={id} className="flex items-center gap-3 bg-surface-container/30 px-4 py-2 rounded-xl text-sm font-bold text-on-surface border border-outline-variant/5">
                              <span className="text-[10px] text-primary w-4">{idx + 1}</span>
                              {PROVIDERS.find(p => p.id === id)?.name || id}
                           </div>
                        ))}
                        <p className="text-[9px] text-on-surface-variant/40 mt-4 px-2">Order is managed by internal priority logic.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies Configuration */}
              <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">cookie</span>
                  <p className="text-xs font-bold text-on-surface-variant/70">Provider Session Tokens (Manual Update)</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Gemini __Secure-1PSID</label>
                    <textarea
                      value={gemini1psid}
                      onChange={(e) => setGemini1psid(e.target.value)}
                      rows={1}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-[11px] font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Gemini __Secure-1PSIDTS</label>
                    <textarea
                      value={gemini1psidts}
                      onChange={(e) => setGemini1psidts(e.target.value)}
                      rows={1}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-[11px] font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-on-surface-variant/40 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Updates require valid session cookies to take effect on GCP.
                </p>
                <button
                    type="submit"
                    disabled={aiSaving}
                    className="flex items-center gap-2 bg-secondary text-white dark:text-zinc-950 px-8 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-secondary/20"
                >
                    {aiSaving ? <><span className="material-symbols-outlined animate-spin text-sm">refresh</span>Syncing...</> : <><span className="material-symbols-outlined text-sm">sync</span>Update AI Config</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
