"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RuvexiApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { playPaymentAlertSound } from "@/lib/audio-alerts";
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  ExternalLink,
  RefreshCw,
  Clock,
  Lock,
  X,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface UpiCounterQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: string;
  amount: number;
  customerName: string;
  customerPhone?: string;
  invoiceNumber: string;
  salonName: string;
  upiId?: string;
  isSplitPayment?: boolean;
  totalBillAmount?: number;
  cashCollected?: number;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
  onPaymentSuccess: (details: {
    paymentMethod: string;
    transactionRef: string;
    paidAmount: number;
  }) => void;
}

export function UpiCounterQrModal({
  isOpen,
  onClose,
  invoiceId,
  amount,
  customerName,
  customerPhone,
  invoiceNumber,
  salonName,
  upiId = "",
  isSplitPayment = false,
  totalBillAmount,
  cashCollected,
  bankDetails,
  onPaymentSuccess,
}: UpiCounterQrModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "bank">("qr");
  const [loading, setLoading] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [upiIntent, setUpiIntent] = useState<string>("");
  const [merchantVpa, setMerchantVpa] = useState<string>((upiId || "").trim());
  const [gatewayQrId, setGatewayQrId] = useState<string>("");
  const [isAutoPolling, setIsAutoPolling] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [staffConfirmedFunds, setStaffConfirmedFunds] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [manualUtr, setManualUtr] = useState<string>("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"pending" | "success" | "failed">("pending");
  const [confirmedRef, setConfirmedRef] = useState<string>("");

  const cleanConfiguredVpa = (upiId || "").trim();
  const hasBankDetails = Boolean(bankDetails?.accountNumber?.trim() && bankDetails?.ifsc?.trim());

  const fetchQrCode = async () => {
    setLoading(true);
    setPaymentState("pending");
    setStaffConfirmedFunds(false);
    setErrorBanner(null);
    setGatewayQrId("");
    setIsAutoPolling(false);

    if (!cleanConfiguredVpa) {
      setQrDataUrl("");
      setUpiIntent("");
      setMerchantVpa("");
      setLoading(false);
      return;
    }

    try {
      // 1. Check if Razorpay zero-webhook polling QR is available on server
      try {
        const autoRes = await RuvexiApi.createAutoVerifyQr({ amount, invoiceNumber });
        if (autoRes?.auto_verify_supported && autoRes?.qr_id && autoRes?.image_url) {
          setGatewayQrId(autoRes.qr_id);
          setIsAutoPolling(true);
          setQrDataUrl(autoRes.image_url);
          setMerchantVpa(cleanConfiguredVpa);
          setLoading(false);
          setTimeLeft(300);
          return;
        }
      } catch {
        // Direct VPA flow below
      }

      // 2. Ask authenticated backend for verified VPA intent, or construct locally for salon's configured VPA
      let targetVpa = cleanConfiguredVpa;
      let intent = "";
      let serverQr = "";

      try {
        const res = await RuvexiApi.generateUpiQr({ amount, invoiceNumber });
        if (res?.merchantVpa) targetVpa = res.merchantVpa;
        if (res?.upiIntent) intent = res.upiIntent;
        if (res?.qrDataUrl) serverQr = res.qrDataUrl;
      } catch {
        // Fallback strictly uses the salon's own configured VPA — never a hardcoded demo VPA
      }

      if (!intent) {
        const amtStr = amount.toFixed(2);
        const encodedName = encodeURIComponent(salonName);
        const note = encodeURIComponent(`Invoice ${invoiceNumber}`);
        intent = `upi://pay?pa=${encodeURIComponent(targetVpa)}&pn=${encodedName}&tr=${encodeURIComponent(invoiceNumber)}&am=${amtStr}&cu=INR&tn=${note}`;
      }

      setMerchantVpa(targetVpa);
      setUpiIntent(intent);

      if (serverQr) {
        setQrDataUrl(serverQr);
      } else {
        const generated = await QRCode.toDataURL(intent, {
          width: 280,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(generated);
      }
    } catch (err: any) {
      setErrorBanner(err?.message || "Failed to generate UPI QR.");
    } finally {
      setLoading(false);
      setTimeLeft(300);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPaymentState("pending");
      fetchQrCode();
    }
  }, [isOpen, amount, invoiceNumber, upiId]);

  // Zero-webhook server polling (runs every 3s ONLY when a gateway single-use QR is active)
  useEffect(() => {
    if (!isOpen || !isAutoPolling || !gatewayQrId || paymentState !== "pending") return;

    const poller = setInterval(async () => {
      try {
        const pollRes = await RuvexiApi.pollPaymentStatus(gatewayQrId);
        if (pollRes?.paid) {
          const ref = pollRes.utr || pollRes.payment_id || gatewayQrId;
          setConfirmedRef(ref);
          setPaymentState("success");
          setIsAutoPolling(false);
          playPaymentAlertSound("success");
        }
      } catch {
        // Ignore transient poll glitches
      }
    }, 3000);

    return () => clearInterval(poller);
  }, [isOpen, isAutoPolling, gatewayQrId, paymentState]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || paymentState !== "pending" || !cleanConfiguredVpa) {
      if (timeLeft === 0 && paymentState === "pending" && cleanConfiguredVpa) {
        setPaymentState("failed");
        playPaymentAlertSound("failure");
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentState("failed");
          playPaymentAlertSound("failure");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft, paymentState, cleanConfiguredVpa]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyUpi = () => {
    if (!merchantVpa) return;
    navigator.clipboard.writeText(merchantVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmPayment = async () => {
    setErrorBanner(null);
    if (!staffConfirmedFunds) {
      setErrorBanner("Please verify funds arrived in the salon's UPI / Bank app and check the confirmation box.");
      return;
    }

    setIsVerifying(true);
    const txnRef = manualUtr.trim() || `UPI-${Date.now().toString().slice(-8)}`;
    try {
      if (invoiceId) {
        await RuvexiApi.confirmPayment(invoiceId, {
          paymentMethod: "UPI",
          explicitVerification: true,
          bankReference: manualUtr.trim() || undefined,
          notes: "Manual counter verification confirmed via UPI terminal",
        });
      }
      setConfirmedRef(txnRef);
      setPaymentState("success");
      playPaymentAlertSound("success");
    } catch (err: any) {
      setErrorBanner(err?.message || "Payment verification failed. Please check UTR reference.");
      playPaymentAlertSound("failure");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#101010] text-[#F8FAFC] rounded-3xl shadow-2xl border border-[#27272A] flex flex-col">
        {/* Countertop Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#080808] border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/25 flex items-center justify-center text-[#FACC15]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-[#F8FAFC] tracking-wide">
                  Dynamic UPI Payment Terminal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                  {isAutoPolling ? "Auto-Polling" : "Direct UPI QR"}
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                {salonName} • {invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#27272A] bg-[#080808] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "qr"
                ? "bg-gradient-to-r from-[#FACC15] to-[#E5B81D] text-slate-950 font-bold shadow-md shadow-[#FACC15]/15"
                : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#181818]"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Dynamic UPI QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bank")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "bank"
                ? "bg-gradient-to-r from-[#FACC15] to-[#E5B81D] text-slate-950 font-bold shadow-md shadow-[#FACC15]/15"
                : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#181818]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank Account / IMPS</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {paymentState === "success" ? (
            <div className="py-6 px-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  {isAutoPolling ? "Gateway Poll Verified" : "Staff Verified Receipt"}
                </span>
                <h3 className="text-3xl font-serif font-black text-white mt-1">
                  {formatCurrency(amount)}
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Credited to {salonName} • Ref: {confirmedRef}
                </p>
              </div>

              <div className="p-3 bg-[#151515] border border-[#27272A] rounded-2xl w-full text-xs text-left space-y-2">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span>Customer:</span>
                  <span className="text-white font-semibold">{customerName}</span>
                </div>
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span>Payment Tender:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeTab === "qr" ? "UPI / Dynamic QR" : "Bank Transfer"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onPaymentSuccess({
                    paymentMethod: activeTab === "qr" ? "UPI / Dynamic QR" : "Bank Transfer / IMPS",
                    transactionRef: confirmedRef,
                    paidAmount: amount,
                  });
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Complete Bill &amp; Open Invoice
              </button>
            </div>
          ) : paymentState === "failed" ? (
            <div className="py-6 px-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                  QR Session Timed Out
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  Payment Window Expired
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs leading-relaxed">
                  No confirmation recorded for {formatCurrency(amount)} within the 5-minute window. Generate a fresh QR to retry.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentState("pending");
                    fetchQrCode();
                  }}
                  className="py-3 px-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New QR</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-3 rounded-xl bg-[#181818] hover:bg-[#27272A] text-white border border-[#27272A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Close / Cash</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Locked Banner */}
              <div className="bg-[#151515] p-4 rounded-2xl border border-[#27272A] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#A1A1AA] block uppercase tracking-wider">
                    {isSplitPayment ? "Remaining UPI Balance (Locked)" : "Total Payable Amount (Locked)"}
                  </span>
                  <div className="text-3xl font-serif font-black text-white font-mono tracking-tight flex items-baseline gap-2 mt-0.5">
                    <span className="text-[#FACC15]">{formatCurrency(amount)}</span>
                    {isSplitPayment && totalBillAmount && (
                      <span className="text-xs text-[#A1A1AA] font-normal">
                        (Total: {formatCurrency(totalBillAmount)})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] flex flex-wrap items-center gap-2 mt-1">
                    <span>Client: <b className="text-[#F8FAFC]">{customerName}</b> {customerPhone ? `(${customerPhone})` : ""}</span>
                    {isSplitPayment && cashCollected !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        Cash: {formatCurrency(cashCollected)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[11px] font-bold">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
              </div>

              {errorBanner && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorBanner}</span>
                </div>
              )}

              {activeTab === "qr" ? (
                !cleanConfiguredVpa ? (
                  <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2.5">
                    <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
                    <h4 className="text-sm font-bold text-[#F8FAFC]">Business UPI ID Not Configured</h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      For your protection, UPI QRs are disabled until the Salon Manager enters your real Business UPI ID in Settings → Payments.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* QR Container */}
                    <div className="relative mx-auto w-60 h-60 bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center justify-center border-4 border-[#27272A]">
                      {loading ? (
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-8 h-8 text-[#080808] animate-spin" />
                          <span className="text-xs font-bold text-slate-600">Generating Secure UPI QR...</span>
                        </div>
                      ) : qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Dynamic UPI QR Code"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-600 font-bold">Unable to generate QR</p>
                        </div>
                      )}
                    </div>

                    {/* Merchant VPA Box */}
                    <div className="flex items-center justify-between p-3 bg-[#151515] rounded-2xl border border-[#27272A] text-xs">
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#71717A] block font-semibold">Salon Receiving UPI ID:</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs truncate block">{merchantVpa}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2.5 py-1.5 rounded-xl bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUpi ? "Copied" : "Copy ID"}</span>
                        </button>

                        {upiIntent && (
                          <a
                            href={upiIntent}
                            className="px-2.5 py-1.5 rounded-xl bg-[#FACC15]/15 hover:bg-[#FACC15]/25 text-[#FACC15] border border-[#FACC15]/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>App</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Countdown & Auto-Poll Status */}
                    <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {isAutoPolling ? "Auto-checking gateway status • " : "Session expires in: "}
                        <b className={timeLeft < 60 ? "text-rose-400" : "text-[#F8FAFC]"}>
                          {formatTimer(timeLeft)}
                        </b>
                      </span>
                      <button
                        type="button"
                        onClick={fetchQrCode}
                        className="text-[11px] text-[#FACC15] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh QR
                      </button>
                    </div>
                  </div>
                )
              ) : !hasBankDetails ? (
                <div className="p-5 bg-[#151515] border border-[#27272A] rounded-2xl text-center space-y-2">
                  <Building2 className="w-7 h-7 text-[#71717A] mx-auto" />
                  <p className="text-xs font-bold text-[#F8FAFC]">Bank Account Details Not Configured</p>
                  <p className="text-[11px] text-[#71717A]">
                    Add your salon&apos;s Bank Account Number and IFSC in Settings to display IMPS/NEFT details here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-[#151515] rounded-2xl border border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#71717A] block font-semibold">Account Holder Name</span>
                      <span className="font-bold text-[#F8FAFC]">{bankDetails?.accountName || salonName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField(bankDetails?.accountName || salonName, "name")}
                      className="p-1.5 rounded-lg bg-[#181818] text-[#A1A1AA] hover:text-white cursor-pointer"
                    >
                      {copiedField === "name" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-3 bg-[#151515] rounded-2xl border border-[#27272A] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#71717A] block font-semibold">Account Number</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{bankDetails?.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyField(bankDetails?.accountNumber || "", "acc")}
                      className="p-1.5 rounded-lg bg-[#181818] text-[#A1A1AA] hover:text-white cursor-pointer"
                    >
                      {copiedField === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#151515] rounded-2xl border border-[#27272A] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#71717A] block font-semibold">IFSC Code</span>
                        <span className="font-mono font-bold text-[#FACC15]">{bankDetails?.ifsc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyField(bankDetails?.ifsc || "", "ifsc")}
                        className="p-1.5 rounded-lg bg-[#181818] text-[#A1A1AA] hover:text-white cursor-pointer"
                      >
                        {copiedField === "ifsc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-3 bg-[#151515] rounded-2xl border border-[#27272A]">
                      <span className="text-[10px] text-[#71717A] block font-semibold">Bank &amp; Branch</span>
                      <span className="font-bold text-[#F8FAFC] truncate block">
                        {bankDetails?.bankName || "Configured Bank"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === "qr" ? Boolean(cleanConfiguredVpa) : hasBankDetails) && (
                <>
                  {/* UTR Reference */}
                  <div className="pt-2 border-t border-[#27272A]">
                    <label className="text-[11px] font-bold text-[#A1A1AA] block mb-1">
                      12-Digit UPI UTR / Bank Reference (Recommended)
                    </label>
                    <input
                      type="text"
                      value={manualUtr}
                      onChange={(e) => setManualUtr(e.target.value)}
                      placeholder="e.g. 423489110294 (duplicate UTRs blocked by server)"
                      className="w-full px-3 py-2 bg-[#080808] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>

                  {/* Mandatory Staff Confirmation Checkbox */}
                  <label className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={staffConfirmedFunds}
                      onChange={(e) => setStaffConfirmedFunds(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#FACC15] rounded cursor-pointer shrink-0"
                    />
                    <span className="text-amber-100 leading-relaxed">
                      I have checked the salon&apos;s UPI/Bank app or soundbox and confirm <b>{formatCurrency(amount)}</b> has arrived.
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isVerifying || !staffConfirmedFunds}
                      className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 disabled:cursor-not-allowed text-[#080808] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {isSplitPayment
                              ? `Confirm Cash (${formatCurrency(cashCollected || 0)}) + UPI (${formatCurrency(amount)})`
                              : `Confirm ${formatCurrency(amount)} Received`}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-3 bg-[#181818] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white font-semibold text-xs rounded-xl border border-[#27272A] transition-all cursor-pointer"
                    >
                      Cancel / Switch Payment Method
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
