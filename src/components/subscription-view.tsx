"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useRuvexi } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";
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
  Copy,
  X,
  QrCode,
  Send,
} from "lucide-react";

export function SubscriptionView() {
  const { user, salon, updateSalon, showToast } = useRuvexi();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");
  const [razorpayConfigured, setRazorpayConfigured] = useState<boolean>(true);
  const [conciergeWhatsapp, setConciergeWhatsapp] = useState<string>("");
  const [conciergeUpiId, setConciergeUpiId] = useState<string>("");
  const [manualModalPlan, setManualModalPlan] = useState<"pro" | "enterprise" | null>(null);
  const [manualUtr, setManualUtr] = useState<string>("");
  const [manualQrUrl, setManualQrUrl] = useState<string>("");

  useEffect(() => {
    RuvexiApi.getSubscriptionStatus()
      .then((res) => {
        if (typeof res?.razorpayConfigured === "boolean") {
          setRazorpayConfigured(res.razorpayConfigured);
        }
        if (res?.conciergeWhatsapp) setConciergeWhatsapp(res.conciergeWhatsapp);
        if (res?.conciergeUpiId) setConciergeUpiId(res.conciergeUpiId);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!manualModalPlan || !conciergeUpiId) {
      setManualQrUrl("");
      return;
    }
    const amt = manualModalPlan === "enterprise" ? 8999 : 3499;
    const uri = `upi://pay?pa=${encodeURIComponent(conciergeUpiId)}&pn=${encodeURIComponent(
      "RUVEXI Solutions"
    )}&am=${amt.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`SUB-${salon.id.slice(-8)}`)}`;
    QRCode.toDataURL(uri, { width: 200, margin: 1 })
      .then(setManualQrUrl)
      .catch(() => setManualQrUrl(""));
  }, [manualModalPlan, conciergeUpiId, salon.id]);

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
    if (!razorpayConfigured) {
      setSelectedPlan(plan);
      setManualModalPlan(plan);
      return;
    }

    setIsUpgrading(true);
    try {
      // 1. Create dedicated SaaS platform subscription order
      const orderData = await RuvexiApi.createSubscriptionOrder(plan);
      const isLive = orderData.is_live;
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && typeof (window as any).Razorpay !== "undefined" && isLive) {
        // 2. Open standard Razorpay Checkout modal
        const options = {
          key: orderData.key_id,
          amount: Math.round(orderData.amount * 100),
          currency: "INR",
          name: "Ruvexi Platform",
          description: `Ruvexi ${plan.toUpperCase()} Salon Software Subscription`,
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
              const verifyRes = await RuvexiApi.verifySubscriptionPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan,
              });

              updateSalon({
                subscriptionStatus: "active",
                subscriptionPlan: plan,
                isTrialActive: false,
              });
              showToast(`Payment successful! Ruvexi ${plan.toUpperCase()} subscription is now active.`, "success");
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
        setManualModalPlan(plan);
      }
    } catch (err: any) {
      if (String(err?.message || "").toLowerCase().includes("not configured")) {
        setRazorpayConfigured(false);
        setManualModalPlan(plan);
      } else {
        showToast(err.message || "Subscription upgrade failed. Please try again.", "error");
      }
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSendManualRequest = () => {
    if (!manualModalPlan) return;
    const price = manualModalPlan === "enterprise" ? "₹8,999/mo" : "₹3,499/mo";
    const digits = (conciergeWhatsapp || "").replace(/[^0-9]/g, "");
    const cleanTarget = digits.length === 10 ? `91${digits}` : digits;
    const msg =
      `Hello RUVEXI Team,\n` +
      `Please activate my paid salon subscription:\n` +
      `• Salon Name: ${salon.name}\n` +
      `• Salon ID: ${salon.id}\n` +
      `• Owner Email: ${user?.email || salon.email || ""}\n` +
      `• Plan Requested: ${manualModalPlan.toUpperCase()} (${price})\n` +
      (manualUtr.trim() ? `• Payment UTR / Ref: ${manualUtr.trim()}\n` : "") +
      `\nThank you!`;

    window.open(
      cleanTarget
        ? `https://wa.me/${cleanTarget}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    showToast("Activation request opened in WhatsApp!", "success");
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
                ? `Ruvexi ${((salon.subscriptionPlan as string) || "PRO").toUpperCase()} Membership`
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
                {isPaidActive
                  ? "Plan: Paid Active"
                  : salon.trialEndsAt
                    ? `Ends ${new Date(salon.trialEndsAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                    : `${trialDaysLeft} days remaining`}
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
                  <span>{razorpayConfigured ? "Activate Pro with Razorpay" : "Activate Pro (Manual / UPI)"}</span>
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
                  <span>{razorpayConfigured ? "Activate Enterprise with Razorpay" : "Activate Enterprise (Manual / UPI)"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Plan Activation Modal (when Razorpay automated billing isn't active) */}
      {manualModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#27272A] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FACC15]">
                  Direct Salon Plan Activation
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  Activate {manualModalPlan === "enterprise" ? "Enterprise (₹8,999/mo)" : "Pro (₹3,499/mo)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualModalPlan(null)}
                className="p-1.5 rounded-lg bg-[#18181B] text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {conciergeUpiId && (
              <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] flex items-center gap-4">
                {manualQrUrl ? (
                  <img src={manualQrUrl} alt="Platform UPI QR" className="w-20 h-20 rounded-lg bg-white p-1 shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-[#18181B] flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-[#FACC15]" />
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="text-[11px] font-mono uppercase text-[#A1A1AA]">Pay via UPI</div>
                  <div className="text-xs font-mono font-bold text-white truncate">{conciergeUpiId}</div>
                  <div className="text-[11px] text-[#71717A]">
                    Amount: <span className="text-[#FACC15] font-mono font-bold">{manualModalPlan === "enterprise" ? "₹8,999" : "₹3,499"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Salon Name:</span>
                <span className="font-semibold text-white">{salon.name}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#71717A]">Salon ID:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(salon.id);
                    showToast("Salon ID copied!", "success");
                  }}
                  className="font-mono text-[#FACC15] inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{salon.id}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-[#A1A1AA] block">
                UPI UTR / Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={manualUtr}
                onChange={(e) => setManualUtr(e.target.value)}
                placeholder="e.g. 429108551234"
                className="w-full px-3.5 py-2.5 bg-[#0B0B0B] border border-[#27272A] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSendManualRequest}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-[#080808] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Activation Request on WhatsApp</span>
              </button>
              <p className="text-[11px] text-center text-[#71717A]">
                Once verified, your plan is activated immediately across all terminals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
