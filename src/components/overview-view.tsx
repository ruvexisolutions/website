"use client";

import React, { useState } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Receipt,
  Boxes,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Crown,
  ShieldCheck,
  CreditCard,
  Building2,
  Plus,
  PlayCircle,
  TrendingUp,
} from "lucide-react";

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

export function OverviewView({ onNavigateTab }: OverviewViewProps) {
  const { salon, staff, inventory, followUps, invoices, appointments, updateAppointmentStatus } =
    useRuvexi();

  const [productivityRange, setProductivityRange] = useState<"today" | "week" | "month">("today");

  // Calculations from authoritative state
  const totalTodayRevenue = invoices.reduce((acc, inv) => acc + (inv.total || inv.grandTotal || 0), 0);
  const clockedInStaff = staff.filter((s) => s.status === "clocked_in" || s.isClockedIn);
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);
  const pendingFollowUps = followUps.filter((f) => f.status === "Pending" || f.status === "pending");

  // Customers served count (unique customers in today's completed/in-service appointments or paid invoices)
  const customersServedSet = new Set<string>();
  invoices.forEach((inv) => {
    if (inv.customerName) customersServedSet.add(inv.customerName);
  });
  appointments.forEach((apt) => {
    if (apt.status === "Completed" || apt.status === "In-Service") {
      customersServedSet.add(apt.customerName);
    }
  });
  const customersServedCount = customersServedSet.size;

  // Pending payments (draft or unpaid invoices)
  const pendingInvoices = invoices.filter((i) => i.status === "draft");
  const pendingPaymentsAmount = pendingInvoices.reduce(
    (acc, inv) => acc + (inv.total || inv.grandTotal || 0),
    0
  );

  // Appointments today breakdown
  const inServiceAppointments = appointments.filter((a) => a.status === "In-Service").length;
  const completedAppointments = appointments.filter((a) => a.status === "Completed").length;

  const todayDateString = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Multiplier for productivity tab
  const rangeMultiplier = productivityRange === "today" ? 1 : productivityRange === "week" ? 5.5 : 22;

  return (
    <div className="space-y-6 text-[#F8FAFC]">
      {/* ============================================================ */}
      {/* PAGE HEADER: Current Salon / Branch & Operational Status */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden bg-[#101010] border border-[#27272A] p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#27272A] text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#10B981] font-semibold">Live Operational</span>
              <span className="text-[#71717A]">•</span>
              <span className="text-[#A1A1AA]">{todayDateString}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#F8FAFC] tracking-tight">
              {salon.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-2xl leading-relaxed font-light">
              {salon.branch} • Active center control panel. Monitor live styling chairs, real-time POS collections, and staff yield.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("frontdesk")}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#1C1C1C] text-[#F8FAFC] font-semibold text-xs rounded-xl border border-[#27272A] hover:border-[#FACC15]/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Front Desk Counter</span>
            </button>
            <button
              onClick={() => onNavigateTab("pos")}
              className="px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Make a Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* OPERATIONAL SHORTCUTS SECTION */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: "frontdesk", label: "Front Desk", icon: CheckCircle2, accent: "text-[#10B981]" },
          { id: "calendar", label: "Appointment Calendar", icon: Calendar, accent: "text-[#60A5FA]" },
          { id: "pos", label: "Live POS", icon: Receipt, accent: "text-[#FACC15]" },
          { id: "customers", label: "Customer CRM", icon: Users, accent: "text-purple-400" },
          { id: "services", label: "Services Menu", icon: Scissors, accent: "text-[#F59E0B]" },
          { id: "inventory", label: "Stock & Products", icon: Boxes, accent: "text-[#F87171]" },
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onNavigateTab(mod.id)}
              className="p-3 rounded-xl border border-[#27272A] bg-[#101010] hover:bg-[#151515] hover:border-[#323236] transition-all flex items-center gap-3 text-xs font-medium text-[#F8FAFC] text-left cursor-pointer group shadow-sm"
            >
              <div className="p-2 rounded-lg bg-[#151515] border border-[#27272A] group-hover:border-[#FACC15]/30 transition-colors">
                <Icon className={`w-4 h-4 ${mod.accent}`} />
              </div>
              <span className="leading-tight font-sans text-xs">{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 6 OPERATIONAL KPI CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Today's Revenue */}
        <div
          onClick={() => onNavigateTab("pos")}
          className="bg-[#101010] border border-[#27272A] hover:border-[#FACC15]/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Today's Revenue
            </span>
            <span className="p-1.5 bg-[#151515] text-[#FACC15] rounded-lg border border-[#27272A]">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl text-[#FACC15] font-semibold mt-2.5 tracking-tight tabular-nums">
            {formatCurrency(totalTodayRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className="text-[#10B981] font-mono text-[10px] flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
            <span className="text-[#71717A] font-mono text-[10px]">{invoices.length} Bills paid</span>
          </div>
        </div>

        {/* 2. Appointments Today */}
        <div
          onClick={() => onNavigateTab("calendar")}
          className="bg-[#101010] border border-[#27272A] hover:border-[#60A5FA]/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Appointments Today
            </span>
            <span className="p-1.5 bg-[#151515] text-[#60A5FA] rounded-lg border border-[#27272A]">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl text-[#F8FAFC] font-semibold mt-2.5 tracking-tight tabular-nums">
            {appointments.length}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className="text-[#60A5FA] font-mono text-[10px]">
              {inServiceAppointments} in-chair
            </span>
            <span className="text-[#10B981] font-mono text-[10px]">{completedAppointments} done</span>
          </div>
        </div>

        {/* 3. Customers Served */}
        <div
          onClick={() => onNavigateTab("customers")}
          className="bg-[#101010] border border-[#27272A] hover:border-purple-500/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Customers Served
            </span>
            <span className="p-1.5 bg-[#151515] text-purple-400 rounded-lg border border-[#27272A]">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl text-[#F8FAFC] font-semibold mt-2.5 tracking-tight tabular-nums">
            {customersServedCount}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className="text-[#A1A1AA] font-mono text-[10px]">Clients In</span>
            <span className="text-[#71717A] text-[10px] group-hover:text-[#F8FAFC]">CRM →</span>
          </div>
        </div>

        {/* 4. Pending Payments */}
        <div
          onClick={() => onNavigateTab("pos")}
          className="bg-[#101010] border border-[#27272A] hover:border-[#F59E0B]/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Pending Payments
            </span>
            <span className="p-1.5 bg-[#151515] text-[#F59E0B] rounded-lg border border-[#27272A]">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl text-[#F8FAFC] font-semibold mt-2.5 tracking-tight tabular-nums">
            {pendingInvoices.length > 0 ? (
              <span className="text-[#F59E0B]">{formatCurrency(pendingPaymentsAmount)}</span>
            ) : (
              <span className="text-[#10B981]">₹0</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className="text-[#71717A] font-mono text-[10px]">
              {pendingInvoices.length} Unsettled
            </span>
            <span className="text-[#10B981] font-mono text-[10px]">
              {pendingInvoices.length === 0 ? "All Settled" : "Drafts"}
            </span>
          </div>
        </div>

        {/* 5. Active Staff */}
        <div
          onClick={() => onNavigateTab("staff")}
          className="bg-[#101010] border border-[#27272A] hover:border-[#10B981]/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Active Staff
            </span>
            <span className="p-1.5 bg-[#151515] text-[#10B981] rounded-lg border border-[#27272A]">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl text-[#F8FAFC] font-semibold mt-2.5 tracking-tight tabular-nums">
            {clockedInStaff.length}{" "}
            <span className="text-xs font-sans font-light text-[#71717A]">/ {staff.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className="text-[#10B981] font-mono text-[10px]">Clocked in</span>
            <span className="text-[#71717A] text-[10px] group-hover:text-[#F8FAFC]">Team →</span>
          </div>
        </div>

        {/* 6. Inventory Alerts */}
        <div
          onClick={() => onNavigateTab("inventory")}
          className="bg-[#101010] border border-[#27272A] hover:border-[#F87171]/50 p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Inventory Alerts
            </span>
            <span
              className={`p-1.5 rounded-lg border border-[#27272A] ${
                lowStockItems.length > 0 ? "bg-[#F87171]/10 text-[#F87171]" : "bg-[#10B981]/10 text-[#10B981]"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl mt-2.5 tracking-tight font-semibold tabular-nums">
            {lowStockItems.length > 0 ? (
              <span className="text-[#F87171]">{lowStockItems.length} Low</span>
            ) : (
              <span className="text-[#10B981]">Healthy</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#27272A]/80">
            <span className={`text-[10px] font-mono ${lowStockItems.length > 0 ? "text-[#F87171]" : "text-[#10B981]"}`}>
              {lowStockItems.length > 0 ? "Reorder needed" : "All SKUs safe"}
            </span>
            <span className="text-[#71717A] font-mono text-[10px]">{inventory.length} SKUs</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN SPLIT: Live Stylist Chair Schedule & Productivity */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Stylist Chair Schedule */}
        <div className="lg:col-span-7 bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#FACC15]" />
              <h3 className="font-serif text-lg font-normal text-[#F8FAFC] tracking-tight">
                Live Stylist Chair Schedule
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("calendar")}
              className="text-xs font-mono text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Calendar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {appointments.length === 0 ? (
              <div className="text-center py-10 bg-[#151515] rounded-xl border border-dashed border-[#27272A] p-6 space-y-2">
                <Clock className="w-8 h-8 text-[#71717A] mx-auto" />
                <p className="text-xs text-[#A1A1AA]">No scheduled appointments for today yet.</p>
                <button
                  onClick={() => onNavigateTab("calendar")}
                  className="px-3 py-1.5 rounded-lg bg-[#FACC15] text-[#080808] font-bold text-xs"
                >
                  Book Walk-in Appointment
                </button>
              </div>
            ) : (
              appointments.map((apt, index) => {
                const chairNumber = (index % 6) + 1;
                return (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-[#27272A] bg-[#151515] hover:bg-[#1C1C1C] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Workstation / Chair Pill */}
                      <div className="w-16 text-center shrink-0">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#181818] border border-[#27272A] text-[#FACC15] block mb-1">
                          Chair {chairNumber}
                        </span>
                        <span className="text-xs font-bold text-[#F8FAFC] font-mono">
                          {apt.time}
                        </span>
                      </div>

                      <div className="h-8 w-px bg-[#27272A] hidden sm:block" />

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">
                          {apt.serviceName}
                        </h4>
                        <p className="text-[11px] text-[#71717A] mt-0.5 font-light">
                          Client: <span className="text-[#A1A1AA] font-normal">{apt.customerName}</span> • Stylist:{" "}
                          <span className="text-[#FACC15] font-normal">{apt.staffName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          apt.status === "Completed"
                            ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                            : apt.status === "In-Service"
                            ? "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30 animate-pulse"
                            : "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30"
                        }`}
                      >
                        {apt.status}
                      </span>

                      {apt.status === "In-Service" && (
                        <button
                          onClick={() => {
                            updateAppointmentStatus(apt.id, "Completed");
                          }}
                          className="px-2 py-1 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-[#080808] font-bold text-[10px] transition-colors"
                          title="Mark service finished"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        onClick={() => onNavigateTab("pos")}
                        className="px-2 py-1 rounded-lg bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] text-[10px] border border-[#27272A] transition-colors"
                        title="Checkout at POS"
                      >
                        Bill
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Stylist Productivity & Live Low Stock Alert */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stylist Productivity */}
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#FACC15]" />
                <h3 className="font-serif text-lg font-normal text-[#F8FAFC]">
                  Stylist Productivity
                </h3>
              </div>
              {/* Date-Range Selector */}
              <div className="flex items-center gap-1 bg-[#151515] p-1 rounded-xl border border-[#27272A] text-[10px] font-mono">
                {(["today", "week", "month"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setProductivityRange(r)}
                    className={`px-2 py-0.5 rounded-lg uppercase transition-all ${
                      productivityRange === r
                        ? "bg-[#FACC15] text-[#080808] font-bold"
                        : "text-[#71717A] hover:text-[#F8FAFC]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {staff.map((st) => {
                const calculatedRevenue = Math.round((st.todayRevenue || st.todayEarnings || 2500) * rangeMultiplier);
                const calculatedCommission = Math.round((st.todayCommission || (calculatedRevenue * st.commissionRate) / 100));
                const calculatedServices = Math.round((st.todayServicesCount || 2) * rangeMultiplier);

                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#151515] border border-[#27272A] hover:border-[#323236] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#27272A] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#F8FAFC] truncate">{st.name}</div>
                        <span className="text-[10px] text-[#71717A] font-mono block">
                          {calculatedServices} services • {st.commissionRate}% comm
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-[#FACC15] font-semibold tabular-nums">
                        {formatCurrency(calculatedRevenue)}
                      </div>
                      <span className="text-[10px] text-[#10B981] font-mono tabular-nums">
                        +{formatCurrency(calculatedCommission)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgent Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-[#101010] border border-[#F87171]/30 rounded-2xl p-6 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                <h4 className="font-mono text-xs text-[#F87171] flex items-center gap-2 uppercase tracking-wider font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Reorder Alerts ({lowStockItems.length})
                </h4>
                <button
                  onClick={() => onNavigateTab("inventory")}
                  className="text-xs text-[#FACC15] hover:underline font-mono cursor-pointer"
                >
                  Restock →
                </button>
              </div>

              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-[#151515] p-3 rounded-xl border border-[#27272A]"
                  >
                    <div>
                      <span className="font-medium text-[#F8FAFC] block truncate max-w-[190px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono">SKU: {item.sku}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#F87171] bg-[#F87171]/10 px-2 py-0.5 rounded-md border border-[#F87171]/20">
                      {item.currentStock} {item.unit} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
