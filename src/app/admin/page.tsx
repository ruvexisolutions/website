"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRuvexi } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Search,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Smartphone,
  Lock,
  Loader2,
  RefreshCw,
  Ban,
  Crown,
} from "lucide-react";

interface AdminSalonRecord {
  id: string;
  name: string;
  slug?: string;
  email?: string;
  ownerName: string;
  ownerPhone: string;
  city: string;
  chairs: number;
  subscriptionStatus: "active" | "trial" | "expired" | "suspended" | string;
  subscriptionPlan: string;
  trialDaysLeft?: number;
  totalGmv: number;
  customersCount: number;
}

const PLAN_PRICES: Record<string, number> = {
  pro: 3499,
  enterprise: 8999,
  free_trial: 0,
};

export default function AdminPage() {
  const { user, isAuthenticated, showToast } = useRuvexi();
  const isMasterAdmin = isAuthenticated && String(user?.role || "").toUpperCase() === "MASTER_ADMIN";

  const [salons, setSalons] = useState<AdminSalonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busySalonId, setBusySalonId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState<"All" | "Paid" | "Trial" | "Paused">("All");

  const loadSalons = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await RuvexiApi.adminGetSalons();
      setSalons(Array.isArray(res?.salons) ? res.salons : []);
    } catch (err: any) {
      setLoadError(err?.message || "Unable to fetch partner salons from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin) {
      loadSalons();
    }
  }, [isMasterAdmin]);

  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#101010] border border-[#27272A] rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FACC15] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Master Admin Authorization Required</h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              This console lets you manually activate paid salons, extend trials, and manage partner billing. Sign in with an account configured in{" "}
              <span className="text-[#FACC15] font-mono">MASTER_ADMIN_EMAILS</span> (or DB role{" "}
              <span className="text-[#FACC15] font-mono">MASTER_ADMIN</span>).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              href="/login"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-xs transition-colors"
            >
              Sign in as Master Admin
            </Link>
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] border border-[#27272A] font-medium text-xs transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalSalons = salons.length;
  const totalGMV = salons.reduce((acc, s) => acc + (s.totalGmv || 0), 0);
  const totalCustomers = salons.reduce((acc, s) => acc + (s.customersCount || 0), 0);
  const paidSalons = salons.filter((s) => s.subscriptionStatus === "active");
  const totalSubscriptionMrr = paidSalons.reduce(
    (acc, s) => acc + (PLAN_PRICES[(s.subscriptionPlan || "pro").toLowerCase()] ?? 3499),
    0
  );

  const filteredSalons = salons.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.city || "").toLowerCase().includes(q) ||
      (s.ownerName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);
    const st = String(s.subscriptionStatus || "").toLowerCase();
    const matchesPayment =
      filterPayment === "All" ||
      (filterPayment === "Paid" && st === "active") ||
      (filterPayment === "Trial" && st === "trial") ||
      (filterPayment === "Paused" && (st === "expired" || st === "suspended"));
    return matchesSearch && matchesPayment;
  });

  const handleActivatePlan = async (salonId: string, plan: "pro" | "enterprise") => {
    setBusySalonId(salonId);
    try {
      const res = await RuvexiApi.adminMarkSalonPaid(salonId, plan);
      if (res?.salon) {
        setSalons((prev) => prev.map((s) => (s.id === salonId ? { ...s, ...res.salon } : s)));
      }
      showToast(`Activated ${plan.toUpperCase()} subscription in PostgreSQL!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to activate salon plan.", "error");
    } finally {
      setBusySalonId(null);
    }
  };

  const handleSetStatus = async (
    salonId: string,
    status: "trial" | "suspended" | "expired",
    trialDays?: number
  ) => {
    setBusySalonId(salonId);
    try {
      const res = await RuvexiApi.adminSetSalonStatus(salonId, { status, trialDays });
      if (res?.salon) {
        setSalons((prev) => prev.map((s) => (s.id === salonId ? { ...s, ...res.salon } : s)));
      }
      showToast(
        status === "trial"
          ? `Trial extended by ${trialDays || 7} days.`
          : `Salon subscription marked ${status}.`,
        "info"
      );
    } catch (err: any) {
      showToast(err?.message || "Failed to update salon status.", "error");
    } finally {
      setBusySalonId(null);
    }
  };

  const handleSendPaymentReminder = (salon: AdminSalonRecord) => {
    const rawDigits = (salon.ownerPhone || "").replace(/[^0-9]/g, "");
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    if (!cleanPhone) {
      showToast("No valid phone number on file for this salon owner.", "error");
      return;
    }
    const fee = PLAN_PRICES[(salon.subscriptionPlan || "pro").toLowerCase()] || 3499;
    const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const payUrl = `${window.location.origin}/subscription`;
    const message = `Hello ${salon.ownerName}, this is a reminder from Ruvexi Solutions regarding ${salon.name}'s ${monthLabel} platform plan (${formatCurrency(
      fee
    )}). View upgrade options or request activation here: ${payUrl}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    showToast(`WhatsApp reminder opened for ${salon.ownerName}.`, "info");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F8FAFC] font-sans pb-16">
      <header className="border-b border-[#27272A] bg-[#101010]/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Ruvexi Manual Subscription &amp; Tenant Console</h1>
              <p className="text-[11px] text-[#71717A]">Activate Pro / Enterprise salons manually, extend trials, or pause accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadSalons}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/overview"
              className="px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] text-xs font-semibold"
            >
              Workspace Console
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {loadError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Registered Salons</span>
              <Building2 className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="text-2xl font-bold mt-2 font-mono">{totalSalons}</div>
            <p className="text-[11px] text-[#71717A] mt-1">{paidSalons.length} Active Paid Plans</p>
          </div>

          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Active Platform MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold mt-2 font-mono">{formatCurrency(totalSubscriptionMrr)}</div>
            <p className="text-[11px] text-[#71717A] mt-1">Manually &amp; Razorpay activated</p>
          </div>

          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Cumulative Partner GMV</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold mt-2 font-mono">{formatCurrency(totalGMV)}</div>
            <p className="text-[11px] text-[#71717A] mt-1">Settled POS &amp; UPI invoices</p>
          </div>

          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Total Client Profiles</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mt-2 font-mono">{totalCustomers.toLocaleString("en-IN")}</div>
            <p className="text-[11px] text-[#71717A] mt-1">Across all workspaces</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon name, ID, email, city, or owner..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#FACC15]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Paid", "Trial", "Paused"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterPayment(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  filterPayment === tab
                    ? "bg-[#FACC15] text-[#080808] border-[#FACC15]"
                    : "bg-[#101010] text-[#A1A1AA] border-[#27272A] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#101010] border border-[#27272A] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FACC15]" />
              Loading live salon records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#27272A] text-[11px] uppercase tracking-wider text-[#71717A] bg-[#0B0B0B]">
                    <th className="py-3.5 px-4">Salon &amp; Owner</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">GMV &amp; Clients</th>
                    <th className="py-3.5 px-4 text-right">Manual Billing Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E22] text-xs">
                  {filteredSalons.map((s) => {
                    const st = String(s.subscriptionStatus || "trial").toLowerCase();
                    const isPaid = st === "active";
                    const isSuspended = st === "suspended" || st === "expired";
                    const isBusy = busySalonId === s.id;
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-mono text-[#71717A]">{s.id}</span>
                          </div>
                          <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                            {s.city || "India"} • {s.chairs} Chairs • Owner: {s.ownerName} ({s.ownerPhone || s.email || "N/A"})
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono uppercase text-[11px] text-[#E4E4E7]">
                          {s.subscriptionPlan || "free_trial"}
                        </td>
                        <td className="py-4 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active Paid
                            </span>
                          ) : isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-medium">
                              <Ban className="w-3.5 h-3.5" /> {s.subscriptionStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
                              <Clock className="w-3.5 h-3.5" /> Trial ({s.trialDaysLeft ?? 0}d left)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-mono font-semibold text-white">{formatCurrency(s.totalGmv || 0)}</div>
                          <div className="text-[11px] text-[#71717A]">{s.customersCount || 0} clients</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {(!isPaid || s.subscriptionPlan !== "pro") && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleActivatePlan(s.id, "pro")}
                                className="px-2.5 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-[#080808] text-[11px] font-semibold cursor-pointer"
                              >
                                Activate Pro
                              </button>
                            )}
                            {(!isPaid || s.subscriptionPlan !== "enterprise") && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleActivatePlan(s.id, "enterprise")}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 text-purple-200 border border-purple-500/30 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Crown className="w-3 h-3" /> Enterprise
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSetStatus(s.id, "trial", 7)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] text-[11px] font-medium cursor-pointer"
                              title="Reset or extend 7-day trial"
                            >
                              +7d Trial
                            </button>
                            {st !== "suspended" && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleSetStatus(s.id, "suspended")}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-medium cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSendPaymentReminder(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Smartphone className="w-3 h-3" /> Remind
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSalons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-[#71717A]">
                        No salon workspaces match your current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
