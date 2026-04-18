import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="h-full w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-inter selection:bg-primary/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="text-center px-6 z-10 max-w-2xl">
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-container border border-outline-variant/20 mb-10 group transition-all hover:border-primary/40 relative">
           <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100" />
           <span className="material-symbols-outlined text-5xl text-primary animate-in zoom-in spin-in-12 duration-1000">
            discovery_campaign
          </span>
        </div>

        <h1 className="text-8xl font-black text-on-surface mb-4 tracking-tighter animate-in slide-in-from-bottom-4 duration-700">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-on-surface mb-6 tracking-tight animate-in slide-in-from-bottom-6 duration-700 delay-100">
          Neural Pathway Not Found
        </h2>

        <p className="text-on-surface-variant/60 text-lg mb-10 max-w-md mx-auto leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-200">
          The knowledge segment you are searching for does not exist in our current cognitive index. It may have been relocated or purged.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Link
            href="/"
            className="px-8 py-3.5 bg-primary text-white dark:text-zinc-950 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/10 hover:shadow-primary/20 flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">west</span>
            Return to Nexus
          </Link>
          <Link
            href="/admin"
            className="px-8 py-3.5 bg-surface-container border border-outline-variant/20 text-on-surface rounded-2xl font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Control Center
          </Link>
        </div>
      </div>

      {/* Modern Grid Overlay (Subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20" />
    </div>
  );
}
