"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Activity,
  Database,
  Search,
  ArrowUpRight,
  Laptop,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Sparkles,
  Users,
  Send,
  ExternalLink,
  Crown,
  Calendar,
  Smartphone,
  Check,
} from "lucide-react";

interface SalonPartnerData {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  city: string;
  tier: "Enterprise" | "Growth" | "Starter";
  chairs: number;
  monthlySubscriptionFee: number;
  subscriptionStatus: "Paid" | "Due Soon" | "Overdue";
  paidDate?: string;
  dueDate?: string;
  monthlyGmv: number;
  appointmentsCount: number;
  // Improvement metrics with Ruvexi Solutions
  revenueGrowthPct: number;
  noShowReduction: string;
  retentionIncreasePct: number;
  hoursSavedWeekly: number;
  improvementVerdict: "Strong Improvement" | "Steady Growth" | "Onboarding";
}

export default function AdminPage() {
  const router = useRouter();
  const { updateSalonProfile, showToast } = useRuvexi();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState<"All" | "Paid" | "Pending">("All");

  // Sample real salon partners that opted for Ruvexi
  const [salonPartners, setSalonPartners] = useState<SalonPartnerData[]>([
    {
      id: "sln_01",
      name: "Luxe Haven Salon & Aesthetic Spa",
      ownerName: "Sunil Kumar",
      ownerPhone: "+91 98450 12890",
      city: "Bengaluru (Indiranagar)",
      tier: "Enterprise",
      chairs: 6,
      monthlySubscriptionFee: 4999,
      subscriptionStatus: "Paid",
      paidDate: "02 Oct 2026",
      monthlyGmv: 742000,
      appointmentsCount: 680,
      revenueGrowthPct: 34,
      noShowReduction: "22% → 3.5%",
      retentionIncreasePct: 48,
      hoursSavedWeekly: 18,
      improvementVerdict: "Strong Improvement",
    },
    {
      id: "sln_02",
      name: "Velvet Mane Studio & Color Bar",
      ownerName: "Rohit Malhotra",
      ownerPhone: "+91 98200 44120",
      city: "Mumbai (Bandra West)",
      tier: "Enterprise",
      chairs: 8,
      monthlySubscriptionFee: 4999,
      subscriptionStatus: "Paid",
      paidDate: "04 Oct 2026",
      monthlyGmv: 918000,
      appointmentsCount: 820,
      revenueGrowthPct: 29,
      noShowReduction: "19% → 4.0%",
      retentionIncreasePct: 42,
      hoursSavedWeekly: 22,
      improvementVerdict: "Strong Improvement",
    },
    {
      id: "sln_03",
      name: "Urban Gentlemen Grooming Club",
      ownerName: "Vikram Sethi",
      ownerPhone: "+91 98110 55320",
      city: "Delhi NCR (Connaught Place)",
      tier: "Growth",
      chairs: 4,
      monthlySubscriptionFee: 2999,
      subscriptionStatus: "Overdue",
      dueDate: "08 Oct 2026 (5 days overdue)",
      monthlyGmv: 385000,
      appointmentsCount: 410,
      revenueGrowthPct: 21,
      noShowReduction: "25% → 5.2%",
      retentionIncreasePct: 35,
      hoursSavedWeekly: 14,
      improvementVerdict: "Steady Growth",
    },
    {
      id: "sln_04",
      name: "Serene Ayurvedic Wellness Resort",
      ownerName: "Dr. Ananya Nair",
      ownerPhone: "+91 98470 33410",
      city: "Kochi (Fort Kochi)",
      tier: "Enterprise",
      chairs: 10,
      monthlySubscriptionFee: 4999,
      subscriptionStatus: "Paid",
      paidDate: "01 Oct 2026",
      monthlyGmv: 1140000,
      appointmentsCount: 950,
      revenueGrowthPct: 38,
      noShowReduction: "18% → 2.8%",
      retentionIncreasePct: 52,
      hoursSavedWeekly: 26,
      improvementVerdict: "Strong Improvement",
    },
    {
      id: "sln_05",
      name: "Glow & Chrome Nail Lounge",
      ownerName: "Neha Reddy",
      ownerPhone: "+91 98660 77810",
      city: "Hyderabad (Jubilee Hills)",
      tier: "Starter",
      chairs: 3,
      monthlySubscriptionFee: 1999,
      subscriptionStatus: "Due Soon",
      dueDate: "16 Oct 2026 (in 3 days)",
      monthlyGmv: 215000,
      appointmentsCount: 290,
      revenueGrowthPct: 18,
      noShowReduction: "20% → 6.0%",
      retentionIncreasePct: 30,
      hoursSavedWeekly: 10,
      improvementVerdict: "Steady Growth",
    },
    {
      id: "sln_06",
      name: "Noir Hair Atelier & Spa",
      ownerName: "Tanya Sen",
      ownerPhone: "+91 98451 99200",
      city: "Bengaluru (Lavelle Road)",
      tier: "Growth",
      chairs: 5,
      monthlySubscriptionFee: 2999,
      subscriptionStatus: "Paid",
      paidDate: "05 Oct 2026",
      monthlyGmv: 492000,
      appointmentsCount: 490,
      revenueGrowthPct: 26,
      noShowReduction: "21% → 4.2%",
      retentionIncreasePct: 39,
      hoursSavedWeekly: 15,
      improvementVerdict: "Strong Improvement",
    },
  ]);

  // Aggregate Platform Numbers
  const totalSalons = salonPartners.length;
  const totalGMV = salonPartners.reduce((acc, s) => acc + s.monthlyGmv, 0);
  const totalAppointments = salonPartners.reduce((acc, s) => acc + s.appointmentsCount, 0);
  const paidThisMonthCount = salonPartners.filter((s) => s.subscriptionStatus === "Paid").length;
  const overdueCount = salonPartners.filter((s) => s.subscriptionStatus === "Overdue").length;
  const dueSoonCount = salonPartners.filter((s) => s.subscriptionStatus === "Due Soon").length;
  const totalSubscriptionCollected = salonPartners
    .filter((s) => s.subscriptionStatus === "Paid")
    .reduce((acc, s) => acc + s.monthlySubscriptionFee, 0);

  // Filter salons
  const filteredSalons = salonPartners.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment =
      filterPayment === "All" ||
      (filterPayment === "Paid" && s.subscriptionStatus === "Paid") ||
      (filterPayment === "Pending" && (s.subscriptionStatus === "Overdue" || s.subscriptionStatus === "Due Soon"));
    return matchesSearch && matchesPayment;
  });

  // Action: Mark Salon Subscription as Paid
  const handleMarkAsPaid = (salonId: string) => {
    setSalonPartners((prev) =>
      prev.map((s) =>
        s.id === salonId
          ? {
              ...s,
              subscriptionStatus: "Paid",
              paidDate: "Today (Manual Confirmation)",
            }
          : s
      )
    );
    showToast("Subscription marked as Paid for this month!");
  };

  // Action: Send WhatsApp Payment Reminder to Salon Owner
  const handleSendPaymentReminder = (salon: SalonPartnerData) => {
    const cleanPhone = salon.ownerPhone.replace(/[^0-9]/g, "");
    const message = `Hello ${salon.ownerName}, this is a reminder from Ruvexi regarding ${salon.name}'s monthly subscription fee of ${formatCurrency(
      salon.monthlySubscriptionFee
    )} for October 2026. Please complete the settlement via this link: https://Ruvexi.io/pay/${salon.id}. Thank you for partnering with Ruvexi.`;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    showToast(`WhatsApp payment reminder sent to ${salon.ownerName}!`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 font-sans selection:bg-slate-900 selection:text-white pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-950">
                  RUVEXI PLATFORM OWNER
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Manage all partner salons, track subscriptions, and monitor salon growth
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/front-desk"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Receptionist View</span>
            </Link>
            <Link
              href="/owner"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Salon Owner View</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SaaS Platform Control • Live Fleet</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Partner Salons & Subscription Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                See all salons that opted for Ruvexi, whether they paid this month's subscription, their numbers, and how much they improved with our software.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-2 rounded-2xl">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Subscription Collected
                </span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {formatCurrency(totalSubscriptionCollected)} / month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Platform Stats in Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="luxury-card p-5 rounded-3xl border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Salons Opted In
              </span>
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-950 mt-2 font-mono">
              {totalSalons} Salons
            </div>
            <p className="text-xs text-blue-600 font-bold mt-1">100% active on cloud</p>
          </div>

          <div className="luxury-card p-5 rounded-3xl border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                This Month Subscriptions
              </span>
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-2 font-mono">
              {paidThisMonthCount} Paid / {overdueCount + dueSoonCount} Pending
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {overdueCount > 0 ? `${overdueCount} overdue payment` : "All payments current"}
            </p>
          </div>

          <div className="luxury-card p-5 rounded-3xl border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Platform GMV
              </span>
              <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-950 mt-2 font-mono">
              {formatCurrency(totalGMV)}
            </div>
            <p className="text-xs text-purple-600 font-bold mt-1">Client sales processed</p>
          </div>

          <div className="luxury-card p-5 rounded-3xl border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Appointments Handled
              </span>
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-950 mt-2 font-mono">
              {totalAppointments.toLocaleString()} Bookings
            </div>
            <p className="text-xs text-amber-700 font-bold mt-1">Across all salon chairs</p>
          </div>
        </div>

        {/* Salons List Table with Subscriptions and Improvement Stats */}
        <div className="luxury-card p-6 rounded-3xl space-y-5 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                All Salons Opted into Ruvexi
              </h2>
              <p className="text-xs text-slate-500">
                Check subscription payment status and how each salon improved with our software.
              </p>
            </div>

            {/* Search & Payment filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search salon or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFilterPayment("All")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterPayment === "All" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  All ({salonPartners.length})
                </button>
                <button
                  onClick={() => setFilterPayment("Paid")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterPayment === "Paid" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Paid ({paidThisMonthCount})
                </button>
                <button
                  onClick={() => setFilterPayment("Pending")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterPayment === "Pending" ? "bg-white text-rose-800 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Pending ({overdueCount + dueSoonCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Salon Partner</th>
                  <th className="py-3.5 px-4">Monthly Subscription</th>
                  <th className="py-3.5 px-4">Did They Pay This Month?</th>
                  <th className="py-3.5 px-4">Stats in Numbers</th>
                  <th className="py-3.5 px-4">Did They Improve With Ruvexi?</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSalons.map((salon) => {
                  const isPaid = salon.subscriptionStatus === "Paid";
                  const isOverdue = salon.subscriptionStatus === "Overdue";
                  const isDueSoon = salon.subscriptionStatus === "Due Soon";

                  return (
                    <tr key={salon.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Salon details */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-950 text-xs">{salon.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{salon.city}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Owner: <strong>{salon.ownerName}</strong> ({salon.ownerPhone}) • {salon.chairs} Chairs
                        </div>
                      </td>

                      {/* Subscription fee */}
                      <td className="py-4 px-4">
                        <div className="font-black text-slate-950 font-mono text-sm">
                          {formatCurrency(salon.monthlySubscriptionFee)}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">
                          {salon.tier} Plan
                        </div>
                      </td>

                      {/* Did they pay this month subscription or not? */}
                      <td className="py-4 px-4">
                        {isPaid && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Paid for October
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Paid on {salon.paidDate}
                            </div>
                          </div>
                        )}

                        {isOverdue && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Not Paid • Overdue!
                            </span>
                            <div className="text-[10px] text-rose-600 font-semibold">
                              {salon.dueDate}
                            </div>
                          </div>
                        )}

                        {isDueSoon && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Due Soon
                            </span>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {salon.dueDate}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Stats in numbers */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 font-mono">
                          {formatCurrency(salon.monthlyGmv)} GMV
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {salon.appointmentsCount} appointments handled
                        </div>
                      </td>

                      {/* Did they improve with our service or not? */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-emerald-700">
                              +{salon.revenueGrowthPct}% Revenue Growth
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {salon.improvementVerdict}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600">
                            • No-shows dropped: <strong>{salon.noShowReduction}</strong>
                          </div>
                          <div className="text-[10px] text-slate-600">
                            • Repeat client rate: <strong>+{salon.retentionIncreasePct}%</strong>
                          </div>
                          <div className="text-[10px] text-blue-700 font-semibold">
                            • Front desk saved: ~{salon.hoursSavedWeekly} hrs/week
                          </div>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid ? (
                            <>
                              <button
                                onClick={() => handleSendPaymentReminder(salon)}
                                className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1"
                                title="Send UPI payment link to owner on WhatsApp"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>Remind on WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(salon.id)}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all"
                              >
                                Mark Paid
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                updateSalonProfile({
                                  name: salon.name,
                                  branch: `${salon.city} Branch`,
                                });
                                showToast(`Loaded ${salon.name} workspace!`);
                                router.push("/front-desk");
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1"
                            >
                              <span>Open Salon</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
