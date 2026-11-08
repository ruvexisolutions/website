"use client";

import React, { useState } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  Split,
  Calendar,
  Printer,
  FileSpreadsheet,
  Users,
  Percent,
  Download,
  Building2,
  Sparkles,
} from "lucide-react";

export function ReportsView() {
  const { salon, invoices, staff } = useRuvexi();

  const [dateFilter, setDateFilter] = useState<"Today" | "Week" | "Month">("Today");

  // Calculations
  const totalGrossRevenue = invoices.reduce((acc, inv) => acc + (inv.total || inv.grandTotal || 0), 0);
  const totalDiscounts = invoices.reduce((acc, inv) => acc + (inv.discount || inv.discountAmount || 0), 0);
  const totalGst = invoices.reduce((acc, inv) => acc + (inv.gstAmount || inv.taxAmount || 0), 0);

  // Service vs Product breakdown
  let totalServiceRevenue = 0;
  let totalRetailRevenue = 0;

  invoices.forEach((inv) => {
    inv.items?.forEach((item: any) => {
      const price = item.price || item.unitPrice || 0;
      const qty = item.quantity || 1;
      if (item.type === "service") {
        totalServiceRevenue += price * qty;
      } else {
        totalRetailRevenue += price * qty;
      }
    });
  });

  // Payment Breakdown
  const upiTotal = invoices
    .filter((inv) => inv.paymentMethod === "UPI")
    .reduce((acc, inv) => acc + inv.total, 0);
  const cardTotal = invoices
    .filter((inv) => inv.paymentMethod === "Card")
    .reduce((acc, inv) => acc + inv.total, 0);
  const cashTotal = invoices
    .filter((inv) => inv.paymentMethod === "Cash")
    .reduce((acc, inv) => acc + inv.total, 0);
  const splitTotal = invoices
    .filter((inv) => inv.paymentMethod === "Split")
    .reduce((acc, inv) => acc + inv.total, 0);

  const avgTicket = Math.round(totalGrossRevenue / (invoices.length || 1));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "InvoiceNumber,Date,Customer,PaymentMethod,Subtotal,Discount,GST,Total\n";
    const rows = invoices
      .map(
        (i) =>
          `"${i.invoiceNumber}","${i.date || ""}","${i.customerName}","${i.paymentMethod}",${i.subtotal},${i.discount || i.discountAmount || 0},${i.gstAmount || i.taxAmount || 0},${i.total || i.grandTotal || 0}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ruvexi_sales_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                Sales & Tax Intelligence
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                GST Ready
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Daily revenue ledger • Payment tender settlement • Staff commission distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#181818] border border-[#27272A] hover:bg-[#27272A] text-[#F8FAFC] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-md shadow-[#FACC15]/10 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Ledger
          </button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Gross Billed Revenue
          </span>
          <h3 className="text-2xl font-mono font-bold text-[#FACC15] mt-1">
            {formatCurrency(totalGrossRevenue)}
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last cycle
          </span>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Average Ticket Size
          </span>
          <h3 className="text-2xl font-mono font-bold text-[#F8FAFC] mt-1">
            {formatCurrency(avgTicket)}
          </h3>
          <span className="text-[11px] text-[#71717A] font-mono mt-2 block">
            Across {invoices.length} completed tickets
          </span>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Net GST Collected (5%)
          </span>
          <h3 className="text-2xl font-mono font-bold text-[#FACC15] mt-1">
            {formatCurrency(totalGst)}
          </h3>
          <span className="text-[11px] text-[#71717A] font-mono mt-2 block">
            CGST: {formatCurrency(Math.round(totalGst / 2))} • SGST:{" "}
            {formatCurrency(Math.round(totalGst / 2))}
          </span>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Total Privilege Vouchers
          </span>
          <h3 className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {formatCurrency(totalDiscounts)}
          </h3>
          <span className="text-[11px] text-[#71717A] font-mono mt-2 block">
            Customer retention promotions
          </span>
        </div>
      </div>

      {/* Two Column Section: Payment Mode Breakdown & Revenue Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Tender Settlement */}
        <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#FACC15]" />
            Payment Mode Settlement Distribution
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-xs">UPI & Dynamic QR</h4>
                  <span className="text-[11px] text-[#71717A] font-mono">0% Merchant Fee</span>
                </div>
              </div>
              <span className="font-mono font-bold text-[#FACC15] text-sm">
                {formatCurrency(upiTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-xs">Credit & Debit Cards</h4>
                  <span className="text-[11px] text-[#71717A] font-mono">Visa / Mastercard / RuPay</span>
                </div>
              </div>
              <span className="font-mono font-bold text-[#FACC15] text-sm">
                {formatCurrency(cardTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-xs">Physical Cash Register</h4>
                  <span className="text-[11px] text-[#71717A] font-mono">Counter Tender</span>
                </div>
              </div>
              <span className="font-mono font-bold text-[#FACC15] text-sm">
                {formatCurrency(cashTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Split className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8FAFC] text-xs">Multi-Tender Split Pay</h4>
                  <span className="text-[11px] text-[#71717A] font-mono">Combined Tenders</span>
                </div>
              </div>
              <span className="font-mono font-bold text-[#FACC15] text-sm">
                {formatCurrency(splitTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Mix: Salon Services vs Retail Products */}
        <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            Revenue Category Split
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#A1A1AA]">Salon Treatment Services</span>
                <span className="text-[#F8FAFC] font-mono">
                  {formatCurrency(totalServiceRevenue)} (88%)
                </span>
              </div>
              <div className="w-full bg-[#181818] h-2.5 rounded-full overflow-hidden border border-[#27272A]">
                <div className="bg-[#FACC15] h-full rounded-full w-[88%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#A1A1AA]">Retail Product Sales (Moroccanoil, Olaplex)</span>
                <span className="text-[#F8FAFC] font-mono">
                  {formatCurrency(totalRetailRevenue)} (12%)
                </span>
              </div>
              <div className="w-full bg-[#181818] h-2.5 rounded-full overflow-hidden border border-[#27272A]">
                <div className="bg-emerald-400 h-full rounded-full w-[12%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] text-xs">
              <h4 className="font-bold text-[#FACC15]">Retail Upsell Insight</h4>
              <p className="text-[#71717A] mt-1 leading-relaxed">
                Top performing salons maintain a 15–20% retail ratio. Encourage stylists to suggest take-home hair masks following chemical services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Commission Distribution Leaderboard */}
      <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-[#F8FAFC] text-base">
              Stylist & Artist Performance Leaderboard
            </h3>
            <p className="text-xs text-[#71717A]">
              Individual billings, assigned treatments, and credited commissions
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#FACC15] bg-[#181818] px-3 py-1 rounded-xl border border-[#27272A]">
            {staff.length} Artists Credited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] text-[#71717A] font-mono text-[11px] uppercase tracking-wider border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-4">Artist Name & Specialty</th>
                <th className="py-3 px-4">Services Done</th>
                <th className="py-3 px-4">Commission Rate</th>
                <th className="py-3 px-4 text-right">Today's Revenue</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {staff.map((st) => (
                <tr key={st.id} className="hover:bg-[#181818] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#27272A]"
                      />
                      <div>
                        <span className="font-bold text-[#F8FAFC] block">{st.name}</span>
                        <span className="text-[10px] text-[#71717A]">{st.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#A1A1AA]">
                    {st.todayServicesCount} treatments
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FACC15]">
                    {st.commissionRate}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F8FAFC]">
                    {formatCurrency(st.todayRevenue || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(st.todayCommission || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
