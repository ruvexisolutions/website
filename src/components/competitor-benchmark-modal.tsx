"use client";

import React from "react";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Crown,
} from "lucide-react";

interface CompetitorBenchmarkModalProps {
  onClose: () => void;
}

export function CompetitorBenchmarkModal({ onClose }: CompetitorBenchmarkModalProps) {
  const comparisonData = [
    {
      feature: "Marketplace Commission on New Clients",
      Ruvexi: "0% Commission (Keep 100%)",
      fresha: "20% cut on every new client",
      zenoti: "Custom Enterprise SLA",
      salonist: "Flat monthly rate",
      highlight: true,
    },
    {
      feature: "WhatsApp Business Cloud Automation",
      Ruvexi: "Built-in (Automated Reminders & Invoices)",
      fresha: "SMS only (charged per SMS)",
      zenoti: "SMS & Twilio add-on",
      salonist: "WhatsApp add-on package",
      highlight: true,
    },
    {
      feature: "Multi-Stylist Timeline Chair Matrix",
      Ruvexi: "Included (Drag, Drop & Live Sync)",
      fresha: "Included",
      zenoti: "Included (Complex grid)",
      salonist: "Included",
      highlight: false,
    },
    {
      feature: "Technical Formula & Skin Treatment Cards",
      Ruvexi: "Included (Hair Dyes, Developers, Peels)",
      fresha: "Basic notes only",
      zenoti: "Included",
      salonist: "Included in CRM",
      highlight: true,
    },
    {
      feature: "Indian GST & UPI / QR Split Tender POS",
      Ruvexi: "Native (CGST + SGST + Split UPI/Cash)",
      fresha: "Basic Card/Cash only (no Indian GST)",
      zenoti: "Indian Enterprise tier only",
      salonist: "Standard POS",
      highlight: true,
    },
    {
      feature: "Custom Branded Booking Domain",
      Ruvexi: "Yes (salon.Ruvexi.io / custom domain)",
      fresha: "No (fresha.com/your-salon)",
      zenoti: "Yes ($$$ high tier)",
      salonist: "Yes",
      highlight: false,
    },
    {
      feature: "Staff Commission & Performance Leaderboard",
      Ruvexi: "Built-in (Service % + Retail %)",
      fresha: "Included",
      zenoti: "Included",
      salonist: "Included",
      highlight: false,
    },
    {
      feature: "Full Data Privacy & Dedicated Multi-Tenant Storage",
      Ruvexi: "Isolated tenant partitions & full exports",
      fresha: "Locked inside marketplace network",
      zenoti: "Proprietary cloud lock-in",
      salonist: "Cloud database",
      highlight: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-2.5 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs tracking-wider uppercase mb-1">
            <Crown className="w-4 h-4 fill-emerald-400" />
            Global Salon Management Benchmark
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Ruvexi Solutions vs Market Platforms
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Built with the ergonomics of <b>Salonist</b> and <b>Fresha</b>, with zero marketplace fees, native WhatsApp automation, and lightning-fast GST & UPI billing.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-3.5 font-black text-slate-900 rounded-l-2xl">Platform Feature</th>
                <th className="p-3.5 font-black text-emerald-700 bg-emerald-50/80 border-x border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Ruvexi Solutions</span>
                  </div>
                </th>
                <th className="p-3.5 font-extrabold text-slate-700">Salonist.io</th>
                <th className="p-3.5 font-extrabold text-slate-700">Fresha</th>
                <th className="p-3.5 font-extrabold text-slate-700 rounded-r-2xl">Zenoti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    row.highlight ? "bg-emerald-50/20" : ""
                  }`}
                >
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      {row.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                      <span>{row.feature}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-black text-emerald-900 bg-emerald-50/50 border-x border-emerald-100 font-mono">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {row.Ruvexi}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{row.salonist}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{row.fresha}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{row.zenoti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <b>Enterprise Grade:</b> Next.js 14 App Router, Multi-Tenant Isolation, Tailwind CSS.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all self-end sm:self-auto cursor-pointer"
          >
            Got it, Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
