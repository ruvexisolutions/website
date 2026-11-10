"use client";

import React, { useState } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { CustomerProfile, Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Crown,
  Sparkles,
  Scissors,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  Save,
  CheckCircle2,
  FileText,
  User,
  Coffee,
  Heart,
  TrendingUp,
} from "lucide-react";

interface ClientFormulaModalProps {
  customer: any;
  invoices: any[];
  onClose: () => void;
  onUpdateFormula?: (customerId: string, newFormula: string) => void;
}

export function ClientFormulaModal({
  customer,
  invoices,
  onClose,
  onUpdateFormula,
}: ClientFormulaModalProps) {
  const { salon } = useRuvexi();
  const [formulaText, setFormulaText] = useState(customer.formulaNotes || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const customerInvoices = invoices.filter(
    (inv) =>
      inv.customerName.toLowerCase() === customer.name.toLowerCase() ||
      inv.customerPhone === customer.phone
  );

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFormula) {
      onUpdateFormula(customer.id, formulaText);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendWhatsAppReminder = () => {
    const text = encodeURIComponent(
      `Hello ${customer.name}! ✨ From ${salon?.name || "our salon"}: Your stylist ${customer.preferredStaff || "team"} was reviewing your hair profile and wanted to check in. Would you like to reserve your preferred chair this week?`
    );
    const phoneClean = customer.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phoneClean}?text=${text}`, "_blank");
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101010] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#27272A] w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col text-[#F8FAFC]">
        {/* Header with VIP Badge */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#080808] via-[#101010] to-[#151515] text-white border-b border-[#27272A] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#181818] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#FACC15]/30 flex items-center justify-center font-serif font-black text-2xl text-[#FACC15] shadow-xl shadow-black/50">
                {customer.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold tracking-tight text-[#F8FAFC]">{customer.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                      customer.vipTier === "Platinum VIP"
                        ? "bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40"
                        : "bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20"
                    }`}
                  >
                    <Crown className="w-3 h-3 fill-current" />
                    {customer.vipTier || "Gold VIP"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#A1A1AA]">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#FACC15]" /> {customer.phone}
                  </span>
                  <span className="text-[#3F3F46]">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#A1A1AA]" /> {customer.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action */}
            <button
              onClick={handleSendWhatsAppReminder}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {copiedWhatsApp ? "Opening WhatsApp..." : "WhatsApp Direct"}
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-[#27272A] text-xs">
            <div className="bg-[#151515] rounded-xl p-2.5 border border-[#27272A]">
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold tracking-wider">
                Lifetime Spend
              </span>
              <span className="text-base font-bold text-[#FACC15] font-mono">
                {formatCurrency(customer.totalSpent)}
              </span>
            </div>
            <div className="bg-[#151515] rounded-xl p-2.5 border border-[#27272A]">
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold tracking-wider">
                Total Visits
              </span>
              <span className="text-base font-bold text-[#F8FAFC] font-mono">
                {customer.visitsCount} times
              </span>
            </div>
            <div className="bg-[#151515] rounded-xl p-2.5 border border-[#27272A]">
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold tracking-wider">
                Loyalty Points
              </span>
              <span className="text-base font-bold text-amber-300 font-mono">
                {customer.loyaltyPoints} pts
              </span>
            </div>
            <div className="bg-[#151515] rounded-xl p-2.5 border border-[#27272A]">
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold tracking-wider">
                Rebooking Cycle
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                Every {customer.rebookingCadenceDays || 30}d
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Safety & Allergy Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-emerald-300">Skin Patch Test</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                    {customer.patchTestStatus || "Valid"}
                  </span>
                </div>
                <p className="text-emerald-400/80 mt-1">
                  {customer.patchTestDate ? `Tested on ${customer.patchTestDate}` : "Patch test pending or not recorded."}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-amber-300">Allergies &amp; Sensitivities</h4>
                <p className="text-amber-400/80 mt-1">
                  {customer.allergies || "No chemical allergies recorded."}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Formula Card */}
          <div className="bg-[#151515] rounded-2xl p-5 border border-[#27272A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FACC15]" />
                <h3 className="font-serif font-bold text-[#F8FAFC] text-sm">
                  Technical Color & Treatment Formula Card
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#A1A1AA]">
                Stylist: {customer.preferredStaff}
              </span>
            </div>

            <form onSubmit={handleSaveFormula} className="mt-3 space-y-3">
              <p className="text-xs text-[#A1A1AA]">
                Keep precision records of dyes, developer ratios, processing durations, and finishing serums for consistent results across chair visits.
              </p>

              <textarea
                rows={3}
                value={formulaText}
                onChange={(e) => setFormulaText(e.target.value)}
                placeholder="e.g. Roots: Wella KP 6/1 (30g) + 20 Vol (30g) • Balayage: Blondor + 20 Vol • Toner: Color Touch 9/16"
                className="w-full p-3.5 bg-[#080808] border border-[#27272A] rounded-xl text-xs font-mono font-medium focus:border-[#FACC15] focus:outline-none text-[#F8FAFC] placeholder-[#52525B]"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#71717A] italic">
                  Changes save to customer history record.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#E5B81D] hover:opacity-95 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savedSuccess ? "Saved!" : "Update Formula"}
                </button>
              </div>
            </form>
          </div>

          {/* Salon Concierge Notes & Preferences */}
          <div className="p-4 rounded-2xl bg-[#151515] border border-[#27272A] flex items-start gap-3">
            <Coffee className="w-5 h-5 text-[#FACC15] mt-0.5 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-[#F8FAFC]">Concierge & Beverage Preference</h4>
              <p className="text-[#A1A1AA] mt-0.5">{customer.notes}</p>
            </div>
          </div>

          {/* Visit History & Receipts */}
          <div>
            <h4 className="font-serif font-bold text-[#F8FAFC] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FACC15]" />
              Visit History & Receipts ({customerInvoices.length})
            </h4>

            {customerInvoices.length === 0 ? (
              <p className="text-xs text-[#A1A1AA] italic bg-[#151515] p-4 rounded-xl border border-[#27272A]">
                Last recorded service: {customer.lastService} on {customer.lastVisitDate}
              </p>
            ) : (
              <div className="space-y-2">
                {customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl border border-[#27272A] bg-[#151515] flex items-center justify-between text-xs hover:border-[#FACC15]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F8FAFC] font-mono">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] text-[11px] mt-0.5">
                        {inv.date} • {inv.items?.map((i: any) => i.name).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#FACC15] font-mono text-sm block">
                        {formatCurrency(inv.total)}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-medium">
                        via {inv.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080808] border-t border-[#27272A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] text-xs font-semibold rounded-xl border border-[#27272A] transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
