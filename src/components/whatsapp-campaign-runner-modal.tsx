"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  X,
  Play,
  SkipForward,
  RotateCcw,
  Users,
  ExternalLink,
  ChevronRight,
  Filter,
  Copy,
  Check,
} from "lucide-react";
import { CustomerProfile } from "@/lib/types";

interface WhatsAppCampaignRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  salonName?: string;
  salonSlug?: string;
}

const CAMPAIGN_PRESETS = [
  {
    title: "✨ We Miss You (20% Off)",
    text: "Dear {name}, we miss seeing you at {salon}! ✨ Here is a special 20% privilege off on your next Hair Spa or Styling this week. Book your priority slot here: {booking_link}",
  },
  {
    title: "💆 Weekend Hair Spa & Glow",
    text: "Hi {name}! Treat yourself this weekend at {salon}. Relax with our premium Hair Spa & Aesthetics packages. Reserve your appointment online: {booking_link} - See you soon!",
  },
  {
    title: "🎉 Festive Special Offer",
    text: "Festival greetings from {salon}! 🌟 Celebrate with our exclusive festive makeover packages designed especially for you, {name}. Book today: {booking_link}",
  },
  {
    title: "⭐ Review & Feedback",
    text: "Dear {name}, thank you for choosing {salon}! We hope you loved your recent visit. Could you take 30 seconds to share your review? Reply right here or visit {booking_link}. Have a beautiful day!",
  },
];

export function WhatsAppCampaignRunnerModal({
  isOpen,
  onClose,
  customers,
  salonName = "OLG Hair Saloon",
  salonSlug = "olg-hair-saloon",
}: WhatsAppCampaignRunnerModalProps) {
  // Step 1: Config | Step 2: Running Queue | Step 3: Finished
  const [step, setStep] = useState<"config" | "runner" | "done">("config");
  const [targetFilter, setTargetFilter] = useState<"all" | "vip" | "inactive">("all");
  const [templateText, setTemplateText] = useState(CAMPAIGN_PRESETS[0].text);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter clients
  const targetClients = useMemo(() => {
    return customers.filter((c) => {
      const digits = (c.phone || "").replace(/\D/g, "");
      if (digits.length < 10) return false;

      if (targetFilter === "vip") {
        return (c.vipTier || c.membership || "").toLowerCase().includes("vip") ||
          (c.vipTier || c.membership || "").toLowerCase().includes("gold") ||
          (c.vipTier || c.membership || "").toLowerCase().includes("platinum");
      }
      if (targetFilter === "inactive") {
        // Less than 2 visits or spend < 1000
        return (c.visitsCount || c.totalVisits || 1) <= 1;
      }
      return true;
    });
  }, [customers, targetFilter]);

  if (!isOpen) return null;

  const currentClient = targetClients[currentIndex];
  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${salonSlug}`
    : `https://ruvexi.com/book/${salonSlug}`;

  // Helper to format message with placeholders
  const formatMessageForClient = (client?: any) => {
    if (!client) return "";
    const name = client.name || "Valued Client";
    return templateText
      .replace(/{name}/g, name)
      .replace(/{salon}/g, salonName)
      .replace(/{booking_link}/g, bookingUrl);
  };

  const handleOpenWhatsAppAndNext = () => {
    if (!currentClient) return;

    const rawPhone = currentClient.phone || "";
    const digits = rawPhone.replace(/\D/g, "");
    const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
    const personalizedText = formatMessageForClient(currentClient);

    // Open WhatsApp Web / Universal URI
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    setSentCount((prev) => prev + 1);
    advanceRunner();
  };

  const handleSkip = () => {
    setSkippedCount((prev) => prev + 1);
    advanceRunner();
  };

  const advanceRunner = () => {
    if (currentIndex + 1 >= targetClients.length) {
      setStep("done");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleStartRunner = () => {
    setCurrentIndex(0);
    setSentCount(0);
    setSkippedCount(0);
    setStep("runner");
  };

  const handleReset = () => {
    setStep("config");
    setCurrentIndex(0);
    setSentCount(0);
    setSkippedCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c0e0d] border border-emerald-500/30 shadow-2xl p-6 my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">1-Click WhatsApp Campaign Runner</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  100% Free • No Meta API
                </span>
              </div>
              <p className="text-xs text-white/50">Personalize with client name and dispatch directly via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CONFIGURATION */}
        {step === "config" && (
          <div className="py-4 space-y-4">
            {/* Target Audience Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Select Audience ({targetClients.length} clients with valid mobile)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetFilter("all")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    targetFilter === "all"
                      ? "bg-emerald-500/15 border-emerald-500 text-white"
                      : "bg-[#121513] border-white/5 text-white/60 hover:border-white/20"
                  }`}
                >
                  <span className="block font-bold text-white">All Clients</span>
                  <span className="text-[11px] text-white/50">
                    {customers.filter((c) => (c.phone || "").replace(/\D/g, "").length >= 10).length} Available
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetFilter("vip")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    targetFilter === "vip"
                      ? "bg-emerald-500/15 border-emerald-500 text-white"
                      : "bg-[#121513] border-white/5 text-white/60 hover:border-white/20"
                  }`}
                >
                  <span className="block font-bold text-white">VIP Clients</span>
                  <span className="text-[11px] text-white/50">Gold / Platinum Tier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetFilter("inactive")}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    targetFilter === "inactive"
                      ? "bg-emerald-500/15 border-emerald-500 text-white"
                      : "bg-[#121513] border-white/5 text-white/60 hover:border-white/20"
                  }`}
                >
                  <span className="block font-bold text-white">Re-Engagement</span>
                  <span className="text-[11px] text-white/50">1-Visit Clients</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Quick Salon Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CAMPAIGN_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTemplateText(p.text)}
                    className="p-2 rounded-xl bg-[#121513] hover:bg-[#161a17] border border-white/5 hover:border-emerald-500/30 text-left transition-all text-xs"
                  >
                    <span className="font-semibold text-white block truncate">{p.title}</span>
                    <span className="text-[10px] text-white/40 line-clamp-1 mt-0.5">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Text Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Message Template
                </label>
                <div className="flex gap-1.5 text-[10px] text-white/40">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-emerald-400">{"{name}"}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-emerald-400">{"{salon}"}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-emerald-400">{"{booking_link}"}</span>
                </div>
              </div>
              <textarea
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={4}
                className="w-full bg-[#121513] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/60 leading-relaxed font-sans"
              />
            </div>

            {/* First Client Live Preview */}
            <div className="p-3 rounded-xl bg-[#141815] border border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Sample Live Preview for First Client ({targetClients[0]?.name || "Priya"}):
              </span>
              <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed font-sans">
                {formatMessageForClient(targetClients[0])}
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={targetClients.length === 0 || !templateText.trim()}
                onClick={handleStartRunner}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Runner ({targetClients.length} Clients)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE RUNNER QUEUE */}
        {step === "runner" && currentClient && (
          <div className="py-4 space-y-4">
            {/* Progress Header */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">
                  Client {currentIndex + 1} of {targetClients.length}
                </span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(((currentIndex) / targetClients.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIndex + 1) / targetClients.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Client Card */}
            <div className="p-4 rounded-xl bg-[#121513] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Recipient</span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentClient.name}</h3>
                <span className="text-xs font-mono text-emerald-400">{currentClient.phone}</span>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-semibold block mb-1">
                  {currentClient.vipTier || "Regular"}
                </span>
                <span className="text-[11px] text-white/40">Visits: {currentClient.visitsCount || 1}</span>
              </div>
            </div>

            {/* Ready-to-Send Message Bubble */}
            <div className="p-4 rounded-xl bg-[#142318] border border-emerald-500/30 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Pre-composed WhatsApp Text:
              </span>
              <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed">
                {formatMessageForClient(currentClient)}
              </p>
            </div>

            {/* Instructions */}
            <p className="text-[11px] text-white/40 text-center">
              Tapping <strong>"Send on WhatsApp & Next"</strong> opens the chat with text ready. Hit Send in WhatsApp, then return here to advance!
            </p>

            {/* Runner Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip Client
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppAndNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send on WhatsApp & Next ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FINISHED SUMMARY */}
        {step === "done" && (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Campaign Run Completed!</h3>
              <p className="text-xs text-white/60 mt-1">Your personalized WhatsApp messages were queued and dispatched</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="p-3 rounded-xl bg-[#121513] border border-white/5">
                <span className="text-2xl font-bold text-emerald-400">{sentCount}</span>
                <p className="text-[11px] text-white/50 mt-0.5">Dispatched</p>
              </div>
              <div className="p-3 rounded-xl bg-[#121513] border border-white/5">
                <span className="text-2xl font-bold text-white/40">{skippedCount}</span>
                <p className="text-[11px] text-white/50 mt-0.5">Skipped</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                Run Another Campaign
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
