import React from 'react';

export function KickLogo({ className = "w-6 h-6", color = "#53FC18" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 15H35V42L62 15H88L58 48L90 85H64L41 54V85H15V15Z"
        fill={color}
      />
    </svg>
  );
}

export function KickBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#53FC18]/15 border border-[#53FC18]/40 shadow-[0_0_15px_rgba(83,252,24,0.2)] ${className}`}>
      <KickLogo className="w-4 h-4" color="#53FC18" />
      <span className="font-black text-[#53FC18] text-xs uppercase tracking-wider">KICK AUTH</span>
    </div>
  );
}
