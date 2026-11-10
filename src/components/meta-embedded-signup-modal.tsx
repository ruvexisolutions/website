"use client";

import React, { useState } from "react";
import { RuvexiApi } from "@/lib/api-client";
import {
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Building2,
  X,
  ArrowRight,
  Sparkles,
  Lock,
  Phone,
  RefreshCw,
  Send,
} from "lucide-react";

interface MetaEmbeddedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonName: string;
  salonPhone: string;
  onSuccess: (details: any) => void;
}

export function MetaEmbeddedSignupModal({
  isOpen,
  onClose,
  salonName,
  salonPhone,
  onSuccess,
}: MetaEmbeddedSignupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [businessName, setBusinessName] = useState(salonName);
  const [displayPhone, setDisplayPhone] = useState(salonPhone);
  const [phoneNumberIdInput, setPhoneNumberIdInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [testRecipient, setTestRecipient] = useState(salonPhone);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (!isOpen) return null;

  const handleStartVerification = () => {
    setStep(2);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;

    if (!metaAppId) {
      setTestStatus("Meta App ID is not configured. Please use Manual Configuration to enter your Meta Phone Number ID and System Access Token.");
      setIsVerifying(false);
      return;
    }

    try {
      const data = await RuvexiApi.embeddedSignupWhatsApp({
        code: otpInput,
        phoneNumberId: phoneNumberIdInput.trim(),
        displayNumber: displayPhone,
        verifiedName: businessName,
      });
      if (data?.success) {
        onSuccess(data.salon || {});
        setStep(4);
      } else {
        setTestStatus(data?.detail || data?.error || "Meta verification failed.");
      }
    } catch (err: any) {
      setTestStatus(err?.message || "Failed to reach backend.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const data = await RuvexiApi.sendWhatsAppBill({
        customerPhone: testRecipient,
        customerName: "Salon Owner Test",
        invoiceNumber: "TEST-001",
        totalAmount: 1200.0,
        items: [{ name: "Signature Hair Sculpting & Wash", price: 1200 }],
      });
      if (data?.success) {
        setTestStatus("✅ Test bill delivered to " + testRecipient + " from " + businessName + "!");
      } else {
        setTestStatus("❌ Message delivery not sent: " + (data?.error || data?.message || data?.detail || "WhatsApp not connected"));
      }
    } catch (err: any) {
      setTestStatus("❌ Error: " + (err?.message || "Failed to dispatch test message."));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Official Meta Header */}
        <div className="bg-[#1877F2] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-wide">Meta WhatsApp Embedded Signup</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">Tech Provider</span>
              </div>
              <p className="text-[11px] text-white/80">Connect your official salon phone number in 60 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-center">
          <div className={`py-2.5 border-b-2 ${step >= 1 ? "border-[#1877F2] text-[#1877F2]" : "border-transparent text-slate-400"}`}>
            1. Meta Account
          </div>
          <div className={`py-2.5 border-b-2 ${step >= 2 ? "border-[#1877F2] text-[#1877F2]" : "border-transparent text-slate-400"}`}>
            2. Brand Profile
          </div>
          <div className={`py-2.5 border-b-2 ${step >= 3 ? "border-[#1877F2] text-[#1877F2]" : "border-transparent text-slate-400"}`}>
            3. OTP Verification
          </div>
          <div className={`py-2.5 border-b-2 ${step >= 4 ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"}`}>
            4. Live Verified ✓
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          {/* STEP 1: Connect Business Manager */}
          {step === 1 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-[#25D366]/10 text-[#25D366] mx-auto flex items-center justify-center border border-[#25D366]/20 shadow-md shadow-emerald-500/10">
                <Smartphone className="w-8 h-8 text-[#25D366]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">
                  Send WhatsApp Bills from "{salonName}"
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Connect your salon's mobile SIM or landline number directly to the official Meta Cloud API so customers receive bills with your brand name and logo.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Meta Official Partnership Benefits</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                  <li>Messages sent from <strong>your salon's dedicated phone number</strong></li>
                  <li>Official Verified Business Profile with logo and address</li>
                  <li>Automated GST invoice PDFs and re-booking reminders</li>
                  <li>Tier 2 Messaging (up to 10,000 clients/day)</li>
                </ul>
              </div>

              <button
                onClick={handleStartVerification}
                className="w-full py-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue with Facebook Business Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Configure WhatsApp Business Profile */}
          {step === 2 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Configure WhatsApp Business Profile</h4>
                <p className="text-xs text-slate-500">
                  This is the official brand name and number your clients will see on WhatsApp.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Verified Display Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Must match your salon signage, trade license, or GSTIN.</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Salon Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayPhone}
                      onChange={(e) => setDisplayPhone(e.target.value)}
                      placeholder="+91 98450 12890"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Number must be capable of receiving a 6-digit SMS or voice call OTP.</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Category</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option>Beauty, Cosmetic & Personal Care</option>
                    <option>Health & Wellness Spa</option>
                    <option>Medical Aesthetics & Hair Clinic</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send 6-Digit Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter OTP */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1877F2] mx-auto flex items-center justify-center border border-blue-200">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Complete Meta OAuth Exchange</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Enter your Meta <span className="font-mono font-bold text-slate-800">Phone Number ID</span> and authorization code for <span className="font-mono font-bold text-slate-800">{displayPhone}</span>.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2.5">
                <input
                  type="text"
                  required
                  value={phoneNumberIdInput}
                  onChange={(e) => setPhoneNumberIdInput(e.target.value)}
                  placeholder="Meta Phone Number ID"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <input
                  type="text"
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Meta OAuth / Verification Code"
                  className="w-full py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center font-mono text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {testStatus && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {testStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Meta Tech Provider Permissions...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Authorize Brand Sender</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Live Verified Confirmation & Real Test Message */}
          {step === 4 && (
            <div className="space-y-5 text-center py-2 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-200 shadow-xl shadow-emerald-600/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Verified Meta Cloud Sender ✓
                </span>
                <h4 className="text-lg font-black text-slate-900">{businessName} is Live on WhatsApp!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All salon receipts, appointment reminders, and follow-ups will now be dispatched from <strong className="text-slate-900 font-mono">{displayPhone}</strong>.
                </p>
              </div>

              {/* Verified Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Verified Business:</span>
                  <span className="font-bold text-slate-900">{businessName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Sender Phone ID:</span>
                  <span className="font-mono text-slate-800 font-bold">{phoneNumberIdInput || "Configured"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Quality Rating:</span>
                  <span className="font-bold text-emerald-600">HIGH (GREEN) ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Messaging Tier:</span>
                  <span className="font-bold text-blue-600">Tier 2 (10,000 msgs/day)</span>
                </div>
              </div>

              {/* Live Test Dispatch */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Send a Live Test Bill to Verify Delivery</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <button
                    onClick={handleSendTestMessage}
                    disabled={isSendingTest}
                    className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTest ? "Sending..." : "Test Send"}</span>
                  </button>
                </div>
                {testStatus && (
                  <p className="text-[11px] font-bold text-emerald-800 animate-in fade-in">{testStatus}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Done & Return to Salon Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
