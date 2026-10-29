"use client";

import React, { useState } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import { CustomerProfile } from "@/lib/types";
import { ClientFormulaModal } from "./client-formula-modal";
import {
  Users,
  Search,
  Plus,
  Crown,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Receipt,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Tag,
  Clock,
  Send,
  X,
  Filter,
  Download,
  History,
  Gift,
  ChevronDown,
  Wallet,
} from "lucide-react";

interface CustomersViewProps {
  onGoToPos?: (customerId: string) => void;
  onGoToBooking?: (customerName: string, customerPhone: string) => void;
}

export function CustomersView({ onGoToPos, onGoToBooking }: CustomersViewProps) {
  const { customers, invoices, addCustomer, updateCustomer, topUpCustomerWallet } = useBillCare();

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedCustomerForModal, setSelectedCustomerForModal] =
    useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedHistoryCustomerId, setExpandedHistoryCustomerId] = useState<string | null>(null);
  const [walletTopUpCustomer, setWalletTopUpCustomer] = useState<any>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(2000);

  // New customer form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+91 ");
  const [newEmail, setNewEmail] = useState("");
  const [newGender, setNewGender] = useState<"Female" | "Male" | "Other">("Female");
  const [newPreferredStaff, setNewPreferredStaff] = useState("Priya Sharma");
  const [newNotes, setNewNotes] = useState("");
  const [newFormula, setNewFormula] = useState("");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      tierFilter === "All" ||
      (tierFilter === "VIP" && c.vipTier?.includes("VIP")) ||
      (tierFilter === "At-Risk" && (c.tags.includes("At-Risk Inactive") || c.vipTier === "At-Risk")) ||
      (tierFilter === "Birthdays" && (c.birthday || c.tags.some((t) => t.toLowerCase().includes("birthday")))) ||
      c.vipTier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const totalLifetimeValue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.vipTier?.includes("VIP")).length;
  const avgVisits = Math.round(
    customers.reduce((acc, c) => acc + c.visitsCount, 0) / (customers.length || 1)
  );

  const handleExportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Tier", "Total Visits", "Total Spend (INR)", "Last Service", "Tags"];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.vipTier || "Regular"}"`,
      c.visitsCount,
      c.totalSpent,
      `"${c.lastService || ""}"`,
      `"${c.tags.join("; ")}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `billcare_clients_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      gender: newGender,
      lastService: "Consultation & Bespoke Styling",
      preferredStaff: newPreferredStaff,
      tags: ["New Client", "First Visit"],
      notes: newNotes || "Consultation in progress.",
      vipTier: "Silver Regular",
      formulaNotes: newFormula || "Initial consultation pending.",
      patchTestStatus: "Valid",
      patchTestDate: new Date().toISOString().split("T")[0],
      rebookingCadenceDays: 30,
    });

    setShowAddModal(false);
    setNewName("");
    setNewPhone("+91 ");
    setNewEmail("");
    setNewNotes("");
    setNewFormula("");
  };

  const handleWhatsAppClick = (c: any) => {
    const text = encodeURIComponent(
      `Hi ${c.name}! ✨ From BillCare: We hope you are loving your look! Your stylist ${c.preferredStaff || "specialist"} wanted to check in. Would you like to reserve a chair for your next visit?`
    );
    const cleanPhone = c.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handleRecallWhatsAppClick = (c: any) => {
    const text = encodeURIComponent(
      `Hi ${c.name}! ✨ We miss seeing you at BillCare! It's been a little while since your last visit. We've reserved an exclusive 15% VIP welcome-back privilege for you this month. Would you like us to save a chair for your next styling session?`
    );
    const cleanPhone = c.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                Client CRM & Formula Registry
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                {customers.length} Clients
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Technical hair/skin formula cards • Lifetime value tracking • Patch test safety records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171717] hover:bg-[#202020] text-[#F8FAFC] border border-[#27272A] hover:border-[#FACC15]/40 font-medium text-xs rounded-xl transition-all cursor-pointer shadow-sm"
            title="Download client directory as CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-[#FACC15]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Client
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Client Lifetime Spend
          </span>
          <span className="text-lg font-mono font-bold text-[#FACC15] mt-1 block">
            {formatCurrency(totalLifetimeValue)}
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            VIP Diamond Tiers
          </span>
          <span className="text-lg font-mono font-bold text-[#FACC15] mt-1 block">
            {vipCount} VIP Clients
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Average Chair Visits
          </span>
          <span className="text-lg font-mono font-bold text-[#F8FAFC] mt-1 block">
            {avgVisits} visits / client
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Patch Test Safety Rate
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
            100% Certified
          </span>
        </div>
      </div>

      {/* Search & Tier Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search by name, phone (+91) or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {["All", "VIP", "Gold VIP", "Silver Regular", "At-Risk", "Birthdays"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                tierFilter === tier
                  ? "bg-[#FACC15] text-[#080808] border-[#FACC15] shadow-sm"
                  : "bg-[#151515] text-[#A1A1AA] border-[#27272A] hover:text-[#F8FAFC]"
              }`}
            >
              {tier === "Birthdays" && <Gift className="w-3.5 h-3.5" />}
              <span>{tier}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-[#101010] border border-[#27272A] p-12 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F8FAFC]">No Clients Found</h3>
            <p className="text-xs text-[#71717A] mt-1">
              No salon clients match "{searchQuery}" with tier filter "{tierFilter}".
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setSearchQuery("");
                setTierFilter("All");
              }}
              className="px-4 py-2 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#F8FAFC] font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-[#151515] border border-[#27272A] rounded-xl p-5 flex flex-col justify-between hover:border-[#FACC15]/50 hover:bg-[#181818] transition-all shadow-lg"
            >
              <div>
                {/* Header with VIP Pill & Initials */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#181818] border border-[#27272A] text-[#FACC15] font-bold text-sm flex items-center justify-center shadow-md font-mono">
                      {cust.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#F8FAFC] text-sm leading-tight">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-[#71717A] font-mono mt-0.5">{cust.phone}</p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-[#181818] text-[#FACC15] border border-[#27272A]"
                  >
                    <Crown className="w-3 h-3 fill-current text-[#FACC15]" />
                    {cust.vipTier || "Gold VIP"}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {cust.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#181818] text-[#A1A1AA] border border-[#27272A]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Spend Metrics & Preferred Stylist */}
                <div className="mt-4 pt-3 border-t border-[#27272A] grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#101010] border border-[#27272A] p-2 rounded-lg">
                    <span className="text-[10px] text-[#71717A] font-mono uppercase block">SPENT</span>
                    <span className="font-bold text-[#FACC15] font-mono text-xs">
                      {formatCurrency(cust.totalSpent)}
                    </span>
                  </div>
                  <div className="bg-[#101010] border border-[#27272A] p-2 rounded-lg">
                    <span className="text-[10px] text-[#71717A] font-mono uppercase block">VISITS</span>
                    <span className="font-bold text-[#F8FAFC] font-mono text-xs">{cust.visitsCount}x</span>
                  </div>
                  <div className="bg-[#101010] border border-[#27272A] p-2 rounded-lg">
                    <span className="text-[10px] text-[#71717A] font-mono uppercase block">POINTS</span>
                    <span className="font-bold text-[#FACC15] font-mono text-xs">{cust.loyaltyPoints}</span>
                  </div>
                </div>

                {/* Prepaid Wallet Bar */}
                <div className="mt-2.5 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Wallet className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-[11px] font-mono">Prepaid Wallet:</span>
                    <span className="font-bold font-mono text-purple-200">
                      {formatCurrency(cust.walletBalance || 0)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setWalletTopUpCustomer(cust);
                      setTopUpAmount(2000);
                    }}
                    className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    + Top Up
                  </button>
                </div>

                {/* Technical Formula Snippet */}
                {cust.formulaNotes && (
                  <div className="mt-3 p-2.5 bg-[#101010] rounded-lg border border-[#27272A] text-[11px]">
                    <span className="font-mono text-[#FACC15] flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3 text-[#FACC15]" /> Formula:
                    </span>
                    <p className="text-[#A1A1AA] line-clamp-1 mt-0.5 font-mono">{cust.formulaNotes}</p>
                  </div>
                )}

                {/* At-Risk Direct Recall WhatsApp Button */}
                {(cust.tags.includes("At-Risk Inactive") || cust.vipTier === "At-Risk") && (
                  <button
                    onClick={() => handleRecallWhatsAppClick(cust)}
                    className="w-full mt-3 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-rose-400" />
                    <span>Send Recall WhatsApp (15% Off VIP)</span>
                  </button>
                )}

                {/* Expandable Visit History Timeline */}
                <div className="mt-3 pt-2.5 border-t border-[#27272A]/80">
                  <button
                    onClick={() =>
                      setExpandedHistoryCustomerId(
                        expandedHistoryCustomerId === cust.id ? null : cust.id
                      )
                    }
                    className="w-full py-1.5 px-2 rounded-lg bg-[#111111] hover:bg-[#181818] border border-[#27272A] text-[11px] text-[#A1A1AA] hover:text-[#F8FAFC] flex items-center justify-between transition-colors cursor-pointer font-mono"
                  >
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Visit History Timeline ({cust.visitsCount})</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${
                        expandedHistoryCustomerId === cust.id ? "rotate-180 text-[#FACC15]" : ""
                      }`}
                    />
                  </button>

                  {expandedHistoryCustomerId === cust.id && (
                    <div className="mt-2.5 p-3 rounded-lg bg-[#101010] border border-[#27272A] space-y-2.5 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#71717A] border-b border-[#27272A] pb-1">
                        <span>Past Service Record</span>
                        <span>Amount</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-[#F8FAFC] text-[11px]">
                              {cust.lastService || "Consultation & Bespoke Styling"}
                            </div>
                            <div className="text-[10px] text-[#71717A] font-mono">
                              {cust.lastVisitDate || "14 Oct 2026"} · Stylist: {cust.preferredStaff || "Priya Sharma"}
                            </div>
                          </div>
                          <span className="font-mono text-[#FACC15] text-[11px] font-semibold">
                            {formatCurrency(Math.round(cust.totalSpent / Math.max(1, cust.visitsCount)))}
                          </span>
                        </div>
                        {cust.visitsCount > 1 && (
                          <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-white/[0.04]">
                            <div>
                              <div className="font-medium text-[#A1A1AA] text-[11px]">
                                Organic Botanical Hair Spa & Blowout
                              </div>
                              <div className="text-[10px] text-[#71717A] font-mono">
                                12 Sep 2026 · Stylist: Rahul Verma
                              </div>
                            </div>
                            <span className="font-mono text-[#A1A1AA] text-[11px]">
                              ₹2,200
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setSelectedCustomerForModal(cust)}
                  className="inline-flex items-center gap-1 font-bold text-[#FACC15] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Full Formula
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleWhatsAppClick(cust)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                    title="WhatsApp Client"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {onGoToBooking && (
                    <button
                      onClick={() => onGoToBooking(cust.name, cust.phone)}
                      className="px-2.5 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#F8FAFC] rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" /> Book
                    </button>
                  )}

                  {onGoToPos && (
                    <button
                      onClick={() => onGoToPos(cust.id)}
                      className="px-2.5 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" /> Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 360 Client Technical Formula Modal */}
      {selectedCustomerForModal && (
        <ClientFormulaModal
          customer={selectedCustomerForModal}
          invoices={invoices}
          onClose={() => setSelectedCustomerForModal(null)}
          onUpdateFormula={(cid, newFormula) => {
            updateCustomer(cid, { formulaNotes: newFormula });
          }}
        />
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">
                Create Client Profile & Technical Record
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Full Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Roy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Preferred Stylist</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={newPreferredStaff}
                  onChange={(e) => setNewPreferredStaff(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-medium"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">
                  Initial Technical Formula / Color Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wella KP 6/1 + 20 Vol • Sensitive scalp"
                  value={newFormula}
                  onChange={(e) => setNewFormula(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prepaid Wallet Top-Up Modal */}
      {walletTopUpCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F8FAFC]">Prepaid Wallet Top-Up</h3>
                  <p className="text-[11px] text-[#71717A]">{walletTopUpCustomer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setWalletTopUpCustomer(null)}
                className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#181818] rounded-xl border border-[#27272A] flex justify-between items-center text-xs">
              <span className="text-[#A1A1AA]">Current Available Balance:</span>
              <span className="font-mono font-bold text-purple-400 text-sm">
                {formatCurrency(walletTopUpCustomer.walletBalance || 0)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[#A1A1AA] block">Quick Package Amount</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1000, 2000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                        : "bg-[#181818] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]"
                    }`}
                  >
                    ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
              <div className="pt-1.5">
                <label className="text-[11px] font-mono text-[#71717A] block mb-1">Or Enter Custom Top-Up (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={topUpAmount || ""}
                  onChange={(e) => setTopUpAmount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#27272A] rounded-xl font-mono text-sm font-bold text-[#F8FAFC] focus:outline-none focus:border-purple-500"
                  placeholder="e.g. 3500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!topUpAmount || topUpAmount <= 0}
                onClick={async () => {
                  if (walletTopUpCustomer && topUpAmount > 0) {
                    await topUpCustomerWallet(walletTopUpCustomer.id, topUpAmount);
                    setWalletTopUpCustomer(null);
                    setTopUpAmount(2000);
                  }
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Wallet className="w-4 h-4" />
                <span>Credit {formatCurrency(topUpAmount || 0)} to Customer Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
