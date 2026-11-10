"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingPreviewView } from "@/components/booking-preview-view";
import Link from "next/link";
import { ShieldCheck, Sparkles, Building2, Lock } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const salonSlug = searchParams.get("salon") || undefined;

  return <BookingPreviewView salonSlug={salonSlug} isStandalone={true} />;
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 selection:bg-[#FACC15] selection:text-[#080808]">
      {/* Top Client Brand & Trust Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Ruvexi Concierge</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 border-l border-white/[0.1] pl-2">
            <Lock className="w-3 h-3 text-[#FACC15]/80" />
            Verified Direct Booking
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-[#FACC15] transition-colors"
          >
            Salon Staff Login
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto p-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
            Loading luxury salon concierge...
          </div>
        }
      >
        <BookingContent />
      </Suspense>

      {/* Subtle Trust Footer */}
      <div className="max-w-6xl mx-auto mt-10 text-center text-[11px] text-slate-500 font-mono flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#FACC15]/80" />
        <span>Direct appointment booking with zero booking fees • Instant WhatsApp confirmation</span>
      </div>
    </div>
  );
}