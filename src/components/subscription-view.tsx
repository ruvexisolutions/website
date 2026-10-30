"use client";

import React, { useState } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { billcareApi } from "@/lib/api-client";
import {
  Sparkles,
  Check,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  Building2,
  Receipt,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export function SubscriptionView() {
  const { salon, updateSalon, showToast } = useBillCare();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");

  const trialDaysLeft = typeof salon.trialDaysLeft === "number" ? salon.trialDaysLeft : 7;
  const isTrialActive = salon.isTrialActive !== false && salon.subscriptionStatus === "trial";
  const isPaidActive = salon.subscriptionStatus === "active";

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpaySubscription = async (plan: "pro" | "enterprise") => {
    setIsUpgrading(true);
    try {
      // 1. Create dedicated SaaS platform subscription order
      const orderData = await billcareApi.createSubscriptionOrder(plan);
      const isLive = orderData.is_live;
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && typeof (window as any).Razorpay !== "undefined" && isLive) {
        // 2. Open standard Razorpay Checkout modal
        const options = {
          key: orderData.key_id,
          amount: Math.round(orderData.amount * 100),
          currency: "INR",
          name: "BillCare Platform",
          description: `BillCare ${plan.toUpperCase()} Salon Software Subscription`,
          order_id: orderData.order_id,
          prefill: {
            name: orderData.manager_name || salon.name,
            email: orderData.manager_email || "",
            contact: orderData.manager_phone || "",
          },
          theme: {
            color: "#FACC15",
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await billcareApi.verifySubscriptionPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan,
              });

              updateSalon({
                subscriptionStatus: "active",
                subscriptionPlan: plan,
                isTrialActive: true,
              });
              showToast(`Payment successful! BillCare ${plan.toUpperCase()} subscription is now active.`, "success");
            } catch (err: any) {
              showToast(err.message || "Payment verification failed. Please contact support.", "error");
            }
          },
          modal: {
            ondismiss: function () {
              setIsUpgrading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback / Sandbox activation if live Razorpay keys are pending in backend .env
        const verifyRes = await billcareApi.verifySubscriptionPayment({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_sandbox",
          plan: plan,
        });

        updateSalon({
          subscriptionStatus: "active",
          subscriptionPlan: plan,
          isTrialActive: true,
        });
        showToast(
          orderData.notice
            ? `${orderData.notice} — Activated ${plan.toUpperCase()} successfully!`
            : `Successfully activated BillCare ${plan.toUpperCase()}! Full salon features unlocked.`,
          "success"
        );
      }
    } catch (err: any) {
      showToast(err.message || "Subscription upgrade failed. Please try again.", "error");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171717] via-[#121212] to-[#0A0A0A] border border-[#27272A] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isPaidActive ? "Active Subscription" : "7-Day Free Trial"}
              </span>
              <span className="text-xs text-[#71717A]">•</span>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Workspace: <span className="text-white font-medium">{salon.name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {isPaidActive
                ? `BillCare ${((salon.subscriptionPlan as string) || "PRO").toUpperCase()} Membership`
                : `${trialDaysLeft} Days Remaining in Free Receptionist Trial`}
            </h1>

            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
              {isPaidActive
                ? "Your salon has full operational authority including unlimited branch management, custom WhatsApp Cloud API integration, GST tax invoicing, and staff commission ledgers."
                : "During the 7-day trial, your Front Desk Receptionist has unlimited access to daily customer intake, appointment booking, chair allocations, and POS checkout."}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#1F1F23]/80 border border-[#2E2E35] rounded-2xl p-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#71717A] tracking-wider">
                Access State
              </div>
              <div className="text-base font-bold text-white">
                {isPaidActive ? "PRO UNLIMITED" : `${trialDaysLeft} Days Active`}
              </div>
              <div className="text-[11px] text-[#A1A1AA]">
                {isPaidActive ? "Renewal: Next billing cycle" : "Trial ends in 7 days UTC"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Feature Matrix (Permitted vs Restricted) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted Features */}
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Receptionist Trial Access</h3>
                <p className="text-[11px] text-[#71717A]">Active & ready for salon floor testing</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Included
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[#D4D4D8]">
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full customer CRM: intake, allergy tracking & visit history</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Walk-in check-in & calendar appointment management</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Salon floor chair assignments (Chairs 1–6) & stylist allocation</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Services & add-on selection with trusted backend price calculation</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>POS billing, GST auto-calculation, discounts & receipt printing</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Customer loyalty point crediting & visit counter increments</span>
            </li>
          </ul>
        </div>

        {/* Restricted Features (Manager Only / Paid Plan Required) */}
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Manager Restricted Settings</h3>
                <p className="text-[11px] text-[#71717A]">
                  {isPaidActive ? "Unlocked in active plan" : "Locked during 7-day trial"}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isPaidActive
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}>
              {isPaidActive ? "Unlocked" : "Locked in Trial"}
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[#A1A1AA]">
            <li className="flex items-center gap-2.5">
              {isPaidActive ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Multi-branch management & branch-specific isolation</span>
            </li>
            <li className="flex items-center gap-2.5">
              {isPaidActive ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Official GSTIN registration & legal tax ledger settings</span>
            </li>
            <li className="flex items-center gap-2.5">
              {isPaidActive ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Meta WhatsApp Cloud API embedded sender credentials</span>
            </li>
            <li className="flex items-center gap-2.5">
              {isPaidActive ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Advanced financial margin reporting & audit trail export</span>
            </li>
            <li className="flex items-center gap-2.5">
              {isPaidActive ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Stylist commission rate adjustment & wholesale purchase orders</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-tight">
            Choose Your Salon Operating Tier
          </h2>
          <p className="text-xs text-[#71717A]">
            Select a plan to unlock multi-branch expansion, verified WhatsApp receipts, and tax ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-200 relative ${
              selectedPlan === "pro"
                ? "bg-[#18181B] border-[#FACC15] shadow-2xl ring-1 ring-[#FACC15]"
                : "bg-[#121212] border-[#27272A] hover:border-[#3F3F46]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FACC15] font-bold">
                Professional Atelier
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                Most Popular
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-white">₹3,499</span>
                <span className="text-xs text-[#71717A]">/ month</span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Perfect for standalone luxury salons, aesthetic clinics, and high-volume studios.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#D4D4D8] mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15]" />
                <span>Up to 3 branch studios</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15]" />
                <span>Unlimited receptionist & manager logins</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15]" />
                <span>Official Meta WhatsApp Cloud API bill dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15]" />
                <span>GST auto-invoicing & quarterly compliance reports</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRazorpaySubscription("pro");
              }}
              disabled={isUpgrading}
              className="w-full py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isUpgrading && selectedPlan === "pro" ? (
                <span>Processing Razorpay Checkout...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Activate Pro with Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div
            onClick={() => setSelectedPlan("enterprise")}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-200 relative ${
              selectedPlan === "enterprise"
                ? "bg-[#18181B] border-[#FACC15] shadow-2xl ring-1 ring-[#FACC15]"
                : "bg-[#121212] border-[#27272A] hover:border-[#3F3F46]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                Enterprise Salon Chain
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Multi-City
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-white">₹8,999</span>
                <span className="text-xs text-[#71717A]">/ month</span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1">
                For salon chains, franchise networks, and multi-city beauty atelier groups.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#D4D4D8] mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Unlimited branch studios with RLS data isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Dedicated account manager & priority phone SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Centralized franchise royalty & commission settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Custom domain & white-label online booking widget</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRazorpaySubscription("enterprise");
              }}
              disabled={isUpgrading}
              className="w-full py-3 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpgrading && selectedPlan === "enterprise" ? (
                <span>Processing Razorpay Checkout...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Activate Enterprise with Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
