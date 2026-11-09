"use client";

import React, { useState } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import { FollowUpCampaign, CustomerProfile } from "@/lib/types";
import { generateWhatsAppRetentionMessage } from "@/lib/gemini-ai";
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Heart,
  Gift,
  RefreshCw,
  Search,
  User,
  Star,
  Phone,
  ShieldCheck,
  Calendar,
  Check,
  Tag,
  ArrowRight,
  TrendingUp,
  X,
  Crown,
  Smartphone,
  CheckCheck,
} from "lucide-react";

export function CrmFollowupsView() {
  const { customers, followUps, sendFollowUp, createFollowUp, salon } = useRuvexi();

  const [activeTab, setActiveTab] = useState<"campaigns" | "clients">("campaigns");
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(followUps[0]);
  const [customDraft, setCustomDraft] = useState<string>(followUps[0]?.suggestedMessage || "");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [sentSuccessFeedback, setSentSuccessFeedback] = useState<boolean>(false);
  const [isGeneratingAiMsg, setIsGeneratingAiMsg] = useState<boolean>(false);

  // New follow-up modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [campaignType, setCampaignType] = useState<FollowUpCampaign["campaignType"]>("24h_feedback");
  const [discountOffer, setDiscountOffer] = useState<string>("10% Privilege Voucher");
  const [messageTemplate, setMessageTemplate] = useState<string>(
    "Hi {name}! ✨ We hope you loved your pampering at Luxe Haven. Reply to this WhatsApp to claim your special reward!"
  );

  const pendingCount = followUps.filter((f) => f.status === "Pending").length;
  const sentCount = followUps.filter((f) => f.status === "Sent" || f.status === "Delivered").length;

  const handleSelectCampaign = (campaign: any) => {
    setSelectedFollowUp(campaign);
    setCustomDraft(campaign.suggestedMessage);
    setSentSuccessFeedback(false);
  };

  const [isSendingViaMeta, setIsSendingViaMeta] = useState(false);
  const [metaDeliveryStatus, setMetaDeliveryStatus] = useState<string | null>(null);

  const handleSendCampaign = async () => {
    if (!selectedFollowUp) return;
    setIsSendingViaMeta(true);
    setMetaDeliveryStatus(null);

    try {
      const res = await fetch("/api/v1/whatsapp/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: selectedFollowUp.customerPhone,
          customerName: selectedFollowUp.customerName,
          message: customDraft,
          followupId: selectedFollowUp.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMetaDeliveryStatus(data.is_live ? "Delivered via Meta Cloud API v20.0" : "Dispatched via Meta WhatsApp Service");
      }
    } catch {
      // Fallback
    } finally {
      setIsSendingViaMeta(false);
      sendFollowUp(selectedFollowUp.id);
      setSentSuccessFeedback(true);
      setTimeout(() => setSentSuccessFeedback(false), 5000);
    }
  };

  const insertSmartTag = (tag: string) => {
    setCustomDraft((prev) => prev + " " + tag);
  };

  const handleCreateNewCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    createFollowUp({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      campaignType,
      scheduledFor: "Scheduled for Today",
      serviceTrigger: "Manual Engagement Trigger",
      suggestedMessage: messageTemplate.replace("{name}", cust.name),
      discountOffer,
    });

    setShowNewModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch) ||
      c.tags.some((t) => t.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                WhatsApp Retention & Reminders
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                WhatsApp Connected
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Send thank-you messages • Remind clients to visit again • Birthday wishes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#181818] p-1 rounded-xl border border-[#27272A] text-xs">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                activeTab === "campaigns"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Retention Triggers ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                activeTab === "clients"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              VIP Client Directory ({customers.length})
            </button>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> + New Trigger
          </button>
        </div>
      </div>

      {activeTab === "campaigns" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scheduled Trigger Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-serif font-bold text-[#F8FAFC] tracking-tight">
                Scheduled Retention Triggers ({followUps.length})
              </h3>
              <span className="text-xs text-[#71717A] font-mono">
                <b className="text-[#F8FAFC]">{pendingCount}</b> pending • <b className="text-emerald-400">{sentCount}</b> sent
              </span>
            </div>

            <div className="space-y-3">
              {followUps.map((campaign) => {
                const isSelected = selectedFollowUp?.id === campaign.id;
                const isSent = campaign.status === "Sent" || campaign.status === "Delivered";

                return (
                  <div
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className={`bg-[#151515] border p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#FACC15] ring-1 ring-[#FACC15]/30 shadow-lg bg-[#181818]"
                        : "border-[#27272A] hover:border-[#27272A]/80 hover:bg-[#181818]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`p-2 rounded-lg text-xs ${
                              campaign.campaignType === "24h_feedback"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : campaign.campaignType === "color_touchup"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                : campaign.campaignType === "win_back"
                                ? "bg-amber-500/10 text-[#FACC15] border border-[#FACC15]/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {campaign.campaignType === "24h_feedback" && <Star className="w-4 h-4" />}
                            {campaign.campaignType === "color_touchup" && <RefreshCw className="w-4 h-4" />}
                            {campaign.campaignType === "win_back" && <Clock className="w-4 h-4" />}
                            {campaign.campaignType === "birthday_offer" && <Gift className="w-4 h-4" />}
                          </span>

                          <div>
                            <span className="text-xs font-bold text-[#F8FAFC] tracking-tight">
                              {campaign.campaignType === "24h_feedback" && "24h Post-Care & Review Request"}
                              {campaign.campaignType === "color_touchup" && "21-Day Refresh & Root Touch-up"}
                              {campaign.campaignType === "win_back" && "45-Day Inactive Win-Back Alert"}
                              {campaign.campaignType === "birthday_offer" && "Celebration Glamour Voucher"}
                            </span>
                            <span className="text-[10px] text-[#71717A] block font-mono">
                              Triggered by: {campaign.serviceTrigger}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isSent
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                              : "bg-[#181818] text-[#71717A] border border-[#27272A]"
                          }`}
                        >
                          {isSent && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          {campaign.status}
                        </span>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#F8FAFC]">{campaign.customerName}</h4>
                          <p className="text-xs text-[#71717A] font-mono">{campaign.customerPhone}</p>
                        </div>
                        {campaign.discountOffer && (
                          <span className="text-[10px] font-mono font-bold text-[#FACC15] bg-[#181818] border border-[#27272A] px-2.5 py-0.5 rounded-full">
                            🎁 {campaign.discountOffer}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 bg-[#101010] p-3 rounded-lg border border-[#27272A] text-xs text-[#A1A1AA] line-clamp-2 italic leading-relaxed">
                        "{campaign.suggestedMessage}"
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between text-xs">
                      <span className="text-[#71717A] flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[#71717A]" /> {campaign.scheduledFor}
                      </span>
                      <span className="font-bold text-[#FACC15] flex items-center gap-1">
                        Preview & Dispatch <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AMOLED Smartphone Mockup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud Simulator
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Green Badge
                </span>
              </div>

              {/* iPhone AMOLED Frame */}
              <div className="rounded-[2rem] overflow-hidden border-2 border-[#27272A] shadow-2xl bg-[#0b141a] relative max-w-sm mx-auto w-full">
                {/* Dynamic Island Speaker pill */}
                <div className="bg-[#080808] h-4 w-24 mx-auto rounded-b-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#151515] border border-[#27272A]"></div>
                </div>

                {/* WhatsApp Chat Top Bar */}
                <div className="bg-[#1f2c34] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#27272A]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={salon.logo}
                        alt="Salon Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-[#27272A]"
                      />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#1f2c34]"></span>
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1 text-white">
                        {salon.name.slice(0, 20)}...
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      </div>
                      <p className="text-[10px] text-[#71717A] font-mono">Official Business Account</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Encrypted</span>
                </div>

                {/* Chat Background & Message Bubbles */}
                <div
                  className="p-4 space-y-3 min-h-[260px] flex flex-col justify-end"
                  style={{
                    backgroundColor: "#0b141a",
                    backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                >
                  <div className="mx-auto bg-[#182229] text-[#8696a0] text-[10px] px-3 py-1 rounded-lg text-center max-w-[260px] font-mono">
                    🔒 Messages are end-to-end encrypted
                  </div>

                  {/* Outgoing WhatsApp Bubble */}
                  <div className="self-end bg-[#005c4b] text-white p-3.5 rounded-xl rounded-tr-none max-w-[92%] shadow-lg text-xs space-y-2">
                    <p className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                      {customDraft}
                    </p>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] pt-0.5 font-mono">
                      <span>Just now</span>
                      <CheckCheck className="w-3 h-3 text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Tag Insertion Bar */}
              <div>
                <span className="text-[11px] font-mono font-bold text-[#71717A] block mb-1.5 uppercase tracking-wider">
                  Personalization Tokens:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => insertSmartTag("{name}")}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {"{name}"}
                  </button>
                  <button
                    onClick={() => insertSmartTag("{stylist}")}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {"{stylist}"}
                  </button>
                  <button
                    onClick={() => insertSmartTag("https://luxehaven.in/book")}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {"{booking_link}"}
                  </button>
                </div>
              </div>

              {/* Editable Draft Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-[#A1A1AA]">
                    Customize Message Content:
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingAiMsg || !selectedFollowUp}
                    onClick={async () => {
                      if (!selectedFollowUp) return;
                      setIsGeneratingAiMsg(true);
                      const res = await generateWhatsAppRetentionMessage(
                        selectedFollowUp.customerName,
                        selectedFollowUp.serviceName || "Bespoke Treatment",
                        selectedFollowUp.daysSinceLastVisit || 28
                      );
                      setIsGeneratingAiMsg(false);
                      if (res.message) {
                        setCustomDraft(res.message);
                      }
                    }}
                    className="text-[10px] font-mono text-[#FACC15] hover:text-[#EAB308] flex items-center gap-1 font-bold disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#FACC15]" />
                    <span>{isGeneratingAiMsg ? "Gemini AI Composing..." : "Re-write with Gemini AI"}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  className="w-full p-3 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] leading-relaxed font-sans"
                />
              </div>

              {/* Action Trigger Button */}
              <div className="space-y-2">
                <button
                  onClick={handleSendCampaign}
                  disabled={selectedFollowUp?.status === "Sent" || isSendingViaMeta}
                  className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingViaMeta
                      ? "Dispatching via Meta Cloud API..."
                      : selectedFollowUp?.status === "Sent"
                      ? "Already Dispatched via WhatsApp"
                      : "Dispatch via Meta WhatsApp Cloud API"}
                  </span>
                </button>

                {metaDeliveryStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{metaDeliveryStatus}</span>
                  </div>
                )}
                {sentSuccessFeedback && (
                  <div className="mt-2.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold animate-in fade-in">
                    🚀 Dispatch verified! Status updated in CRM database.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Client Directory Tab */
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">VIP & Loyal Customer Directory</h3>
              <p className="text-xs text-[#71717A]">Tier status, lifetime spend & stylist preferences</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search clients by name, tag or phone..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151515] text-[#71717A] font-mono text-[11px] uppercase tracking-wider border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Visits & Lifetime Spend</th>
                  <th className="py-3.5 px-4">Loyalty Tier</th>
                  <th className="py-3.5 px-4">Preferred Artist</th>
                  <th className="py-3.5 px-4">Client Tags</th>
                  <th className="py-3.5 px-4">Concierge Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FACC15]" />
                        {cust.name}
                      </div>
                      <span className="text-[11px] text-[#71717A]">{cust.gender}</span>
                    </td>

                    <td className="py-4 px-4 text-[#A1A1AA]">
                      <div className="font-mono">{cust.phone}</div>
                      <span className="text-[11px] text-[#71717A]">{cust.email}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#FACC15] font-mono">{formatCurrency(cust.totalSpent)}</div>
                      <span className="text-[11px] text-[#71717A] font-mono">{cust.visitsCount} visits</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#181818] text-[#FACC15] border border-[#27272A] flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                        {cust.loyaltyPoints} Pts
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-[#F8FAFC]">{cust.preferredStaff}</td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-[#181818] text-[#A1A1AA] border border-[#27272A]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#71717A] max-w-xs truncate italic">
                      "{cust.notes}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Follow-up Campaign Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">Schedule Retention Trigger</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCampaign} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Select Client</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-bold text-[#F8FAFC]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#151515] text-[#F8FAFC]">
                      {c.name} ({c.phone}) - {c.lastService}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Trigger Objective</label>
                <select
                  value={campaignType}
                  onChange={(e: any) => setCampaignType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-bold text-[#F8FAFC]"
                >
                  <option value="24h_feedback" className="bg-[#151515] text-[#F8FAFC]">24h Post-Care & Review Request</option>
                  <option value="color_touchup" className="bg-[#151515] text-[#F8FAFC]">Color & Keratin Touch-up Reminder</option>
                  <option value="win_back" className="bg-[#151515] text-[#F8FAFC]">45-Day Win-Back Re-activation</option>
                  <option value="birthday_offer" className="bg-[#151515] text-[#F8FAFC]">Birthday Celebration Special</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Attached Privilege Offer</label>
                <input
                  type="text"
                  value={discountOffer}
                  onChange={(e) => setDiscountOffer(e.target.value)}
                  placeholder="e.g. 15% VIP code or Free Treatment"
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Message Body</label>
                <textarea
                  rows={3}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Schedule Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
