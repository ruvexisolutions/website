"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingPreviewView } from "@/components/booking-preview-view";
import Link from "next/link";
import { ArrowLeft, Home, Laptop, Sparkles } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const salonSlug = searchParams.get("salon") || undefined;

  return <BookingPreviewView salonSlug={salonSlug} isStandalone={true} />;
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 selection:bg-[#5865F2] selection:text-white">
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white bg-[#121316] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl border border-white/[0.1] transition-all shadow-lg"
        >
          <Laptop className="w-3.5 h-3.5 text-[#FACC15]" /> Back to Console
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white bg-[#121316] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl border border-white/[0.1] transition-all shadow-lg"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" /> BillCare Home
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto p-12 text-center text-slate-400 font-mono text-xs">
            Loading salon booking concierge...
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </div>
  );
}
