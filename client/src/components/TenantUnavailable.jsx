import React, { useState } from 'react';
import { 
  Building2, AlertTriangle, Globe, ArrowRight, 
  ExternalLink, Mail, ShieldAlert, RefreshCw, 
  Home, Compass, HelpCircle
} from 'lucide-react';

export default function TenantUnavailable({
  slug = '',
  reason = 'not_found',
  message = '',
  onRetry = null,
  onSwitchTenant = null
}) {
  const [targetSlug, setTargetSlug] = useState('');

  const isInactive = reason === 'inactive';
  const isSubdomain = typeof window !== 'undefined' && window.location.hostname.endsWith('.isomorphic.in');

  const handleNavigateNewSlug = (e) => {
    e.preventDefault();
    const clean = targetSlug.trim().toLowerCase();
    if (!clean) return;

    if (clean === 'admin') {
      window.location.href = 'https://admin.isomorphic.in';
      return;
    }

    if (isSubdomain) {
      window.location.href = `https://${clean}.isomorphic.in`;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('tenant', clean);
      window.location.href = url.toString();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#0F172A] flex flex-col justify-between p-4 md:p-8 font-sans select-none relative overflow-hidden">
      
      {/* Background Subtle Gradient & Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0A2240]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-[#E2DFD6]/70 relative z-10">
        <a 
          href="https://isomorphic.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 group cursor-pointer no-underline text-[#0A2240]"
        >
          <img 
            src="/isomorphic-icon.png" 
            alt="Isomorphic Logo" 
            className="w-7 h-7 object-contain rounded-xs group-hover:scale-105 transition-transform"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-serif font-bold text-xl tracking-tight">isomorphic</span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="https://isomorphic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#64748B] hover:text-[#0A2240] transition-colors flex items-center gap-1"
          >
            <span>Company Website</span>
            <ExternalLink size={12} />
          </a>
          <a
            href="https://admin.isomorphic.in"
            className="text-xs font-bold bg-[#0A2240] text-white px-3 py-1.5 rounded-sm hover:bg-[#07172C] transition-all shadow-2xs"
          >
            Admin Portal
          </a>
        </div>
      </header>

      {/* Center Content Card */}
      <main className="w-full max-w-2xl mx-auto my-auto py-10 relative z-10 flex flex-col items-center text-center">
        
        {/* Warning Icon Badge */}
        <div className="relative mb-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#FFF5EA] to-[#FDE8D0] border border-[#F5C791] flex items-center justify-center shadow-md">
            {isInactive ? (
              <ShieldAlert className="w-10 h-10 text-[#C25E00]" />
            ) : (
              <Building2 className="w-10 h-10 text-[#A04700]" />
            )}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <AlertTriangle size={14} />
          </div>
        </div>

        {/* Status Chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase mb-3 bg-amber-100/80 text-amber-900 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {isInactive ? 'Organization Deactivated' : 'Tenant Not Available'}
        </div>

        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0A2240] tracking-tight mb-3">
          {isInactive ? 'Workspace Is Currently Unavailable' : 'Organization Workspace Not Found'}
        </h1>

        {/* Requested Identifier Banner */}
        {slug && (
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2DFD6] rounded-md px-3.5 py-1.5 font-mono text-xs text-[#0A2240] shadow-2xs mb-4 max-w-full truncate">
            <Globe size={13} className="text-[#64748B] shrink-0" />
            <span className="text-[#64748B]">Requested Domain:</span>
            <span className="font-bold underline text-[#0A2240]">{slug}.isomorphic.in</span>
          </div>
        )}

        {/* Informative Explanation */}
        <p className="text-sm text-[#475569] max-w-lg leading-relaxed mb-8">
          {message || (isInactive 
            ? `The organization workspace for "${slug}" is temporarily inactive or suspended. Please contact your organization administrator to restore access.`
            : `We could not find an active workspace matching "${slug}". The organization slug may be mistyped, or the tenant has not been onboarded on Isomorphic AI yet.`
          )}
        </p>

        {/* Quick Actions Grid */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <a
            href="https://admin.isomorphic.in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A2240] text-white text-xs font-bold rounded-sm hover:bg-[#07172C] transition-all shadow-sm"
          >
            <Home size={14} />
            <span>Go to Admin Portal</span>
          </a>

          <a
            href="https://isomorphic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-sm hover:bg-[#F8FAFC] transition-all shadow-2xs"
          >
            <Compass size={14} />
            <span>Company Website</span>
          </a>

          <a
            href={`mailto:help@isomorphic.in?subject=Assistance%20Requested%20for%20Tenant%20Workspace:%20${encodeURIComponent(slug)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#475569] text-xs font-medium rounded-sm hover:text-[#0A2240] hover:bg-[#F8FAFC] transition-all shadow-2xs"
          >
            <Mail size={14} />
            <span>Contact Support</span>
          </a>
        </div>

        {/* Try Another Workspace Input */}
        <div className="w-full max-w-md bg-white border border-[#E2DFD6] rounded-md p-4 shadow-xs text-left">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-2 font-mono flex items-center justify-between">
            <span>Try Another Organization Slug</span>
            <span className="text-[10px] text-[#94A3B8] font-normal">e.g. onestop, iit, acme</span>
          </label>
          <form onSubmit={handleNavigateNewSlug} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={targetSlug}
                onChange={(e) => setTargetSlug(e.target.value)}
                placeholder="Enter organization slug..."
                className="w-full bg-[#FAF9F6] border border-[#CBD5E1] focus:border-[#0A2240] rounded-sm px-3 py-1.5 text-xs text-[#0F172A] font-mono outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!targetSlug.trim()}
              className="px-3 py-1.5 bg-[#0A2240] text-white text-xs font-bold rounded-sm hover:bg-[#07172C] disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Go</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 border-t border-[#E2DFD6]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B] relative z-10">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>© {new Date().getFullYear()} Isomorphic AI</span>
          <span>•</span>
          <span>All rights reserved</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Need help?</span>
          <a href="mailto:help@isomorphic.in" className="text-[#0A2240] font-bold hover:underline font-mono">
            help@isomorphic.in
          </a>
        </div>
      </footer>

    </div>
  );
}
