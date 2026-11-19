"use client";

import React, { useState, useRef } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import {
  Building2,
  Armchair,
  Phone,
  Mail,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ImagePlus,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Clock,
  IndianRupee,
  PartyPopper,
  UserPlus,
  Compass,
} from "lucide-react";

interface OwnerOnboardingModalProps {
  onComplete: (action?: "register_customer" | "explore") => void;
}

const CHAIR_PRESETS = [4, 6, 8, 12, 16];
const SERVICE_CATEGORIES = [
  "Hair",
  "Beard & Grooming",
  "Skin & Spa",
  "Hair Spa",
  "Facial",
  "Massage",
  "Nails",
];
const DURATION_PRESETS = [15, 30, 45, 60, 90];

export function OwnerOnboardingModal({ onComplete }: OwnerOnboardingModalProps) {
  const { salon, user, updateSalonProfile, addService, showToast } = useRuvexi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Salon & Branch Details
  const [salonName, setSalonName] = useState(salon?.name || "");
  const [branchName, setBranchName] = useState(salon?.branch || "Main Studio");
  const [chairs, setChairs] = useState<number>(salon?.chairs || 6);
  const [businessPhone, setBusinessPhone] = useState(salon?.phone || user?.phone || "");
  const [businessEmail, setBusinessEmail] = useState(salon?.email || user?.email || "");
  const [city, setCity] = useState(salon?.city || "");
  const [address, setAddress] = useState(salon?.address || "");
  const [logoUrl, setLogoUrl] = useState(salon?.logoUrl || "");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Step 2: Billing & Payout Setup
  const [upiId, setUpiId] = useState(salon?.upiId || "");
  const [upiPayeeName, setUpiPayeeName] = useState(salon?.upiPayeeName || salon?.name || "");
  const [gstin, setGstin] = useState(salon?.gstin || "");
  const [paymentInstructions, setPaymentInstructions] = useState(
    salon?.paymentInstructions || "Direct UPI payment accepted. Scan and verify on screen."
  );

  // Step 3: First Service Setup
  const [serviceName, setServiceName] = useState("Signature Haircut & Styling");
  const [serviceCategory, setServiceCategory] = useState("Hair");
  const [servicePrice, setServicePrice] = useState<number | string>(450);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [serviceDescription, setServiceDescription] = useState("Professional hair sculpt, wash and blow-dry styling");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, or WebP) for your salon logo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 240;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setLogoUrl(canvas.toDataURL("image/webp", 0.85));
        } else {
          setLogoUrl(dataUrl);
        }
        setError(null);
      };
      img.onerror = () => setLogoUrl(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = (): boolean => {
    setError(null);
    if (!salonName.trim()) {
      setError("Please enter your Salon / Studio name.");
      return false;
    }
    if (!branchName.trim()) {
      setError("Please enter your first branch name (e.g. Main Studio).");
      return false;
    }
    if (!businessPhone.trim() || businessPhone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid business phone number.");
      return false;
    }
    if (!businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) {
      setError("Please enter a valid business email address.");
      return false;
    }
    if (!city.trim() || !address.trim()) {
      setError("Please enter your city and full salon street address.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError(null);
    const cleanUpi = upiId.trim();
    if (!cleanUpi || !cleanUpi.includes("@")) {
      setError("A valid UPI ID (e.g. salonname@upi or 9876543210@ybl) is required for billing.");
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setError(null);
    if (!serviceName.trim()) {
      setError("Please enter a name for your first service.");
      return false;
    }
    const priceNum = Number(servicePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid service price in ₹.");
      return false;
    }
    if (!serviceDuration || serviceDuration < 5) {
      setError("Please enter a valid service duration (minimum 5 minutes).");
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      if (!upiPayeeName) setUpiPayeeName(salonName.trim());
      setStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleFinishOnboarding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep3()) return;

    setIsSaving(true);
    setError(null);

    try {
      const cleanName = salonName.trim();
      const cleanBranch = branchName.trim();
      const cleanCity = city.trim();
      const cleanAddress = address.trim();
      const cleanPhone = businessPhone.trim();
      const cleanEmail = businessEmail.trim().toLowerCase();
      const cleanUpi = upiId.trim();
      const cleanPayee = upiPayeeName.trim() || cleanName;
      const cleanGstin = gstin.trim();
      const cleanInstructions = paymentInstructions.trim();
      const chairCount = Math.max(1, Math.min(100, Number(chairs)));

      // 1. Save Salon & Branch Profile with UPI settings
      const saveResult = await updateSalonProfile({
        name: cleanName,
        branch: cleanBranch,
        chairs: chairCount,
        phone: cleanPhone,
        email: cleanEmail,
        city: cleanCity,
        address: cleanAddress,
        upiId: cleanUpi,
        upiPayeeName: cleanPayee,
        upiEnabled: true,
        cashEnabled: true,
        paymentInstructions: cleanInstructions,
        gstin: cleanGstin,
        ...(logoUrl ? { logoUrl, logo: logoUrl } : {}),
      });

      if (saveResult && !saveResult.success) {
        setError(saveResult.error || "Failed to save salon details. Please retry.");
        setIsSaving(false);
        return;
      }

      // 2. Add First Service to Catalog
      addService({
        name: serviceName.trim(),
        category: serviceCategory,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        description: serviceDescription.trim(),
        isActive: true,
        isOnlineBookable: true,
      });

      // 3. Mark Onboarding Complete locally
      if (typeof window !== "undefined") {
        if (salon?.id) {
          localStorage.setItem(`Ruvexi_onboarded_${salon.id}`, "true");
        }
        localStorage.removeItem("Ruvexi_needs_onboarding");
      }

      showToast(`🎉 ${cleanName} is ready for billing!`, "success");
      // Advance to step 4: Celebration screen
      setStep(4);
    } catch (err: any) {
      setError(err?.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-slate-100">
        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="space-y-3 pb-3 border-b border-[#27272A]">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
              <span className="text-[#FACC15] font-bold">
                Step {step} of 3: {step === 1 ? "Studio & First Branch" : step === 2 ? "Billing & Payout Setup" : "Add First Service"}
              </span>
              <span>{step === 1 ? "33%" : step === 2 ? "66%" : "100%"} Complete</span>
            </div>
            <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#FACC15] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Studio & First Branch Setup */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/30 text-[10px] font-mono font-bold text-[#FACC15] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>First-Time Studio Setup</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#F8FAFC]">
                Set Up Your Salon & First Branch
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Enter your core salon identity and primary outlet details.
              </p>
            </div>

            {/* Salon Name & Logo */}
            <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="shrink-0 flex items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#101010] border border-dashed border-[#27272A] flex items-center justify-center overflow-hidden relative group">
                    {logoUrl ? (
                      <>
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-white hover:bg-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <ImagePlus className="w-7 h-7 text-[#71717A]" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:hidden px-3 py-1.5 bg-[#181818] border border-[#27272A] rounded-lg text-[11px] font-semibold text-[#FACC15]"
                  >
                    Upload Logo
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Salon / Studio Name *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aura Luxury Hair & Spa"
                      value={salonName}
                      onChange={(e) => setSalonName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-sm font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>

                  <div className="hidden sm:flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-lg text-[11px] font-semibold text-[#FACC15] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{logoUrl ? "Change Logo" : "Upload Logo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((p) => !p)}
                      className="px-2.5 py-1.5 text-[11px] text-[#A1A1AA] hover:text-[#F8FAFC] cursor-pointer"
                    >
                      {showUrlInput ? "Hide URL" : "Paste URL"}
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>

              {showUrlInput && (
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              )}
            </div>

            {/* First Branch Name & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#151515] border border-[#27272A] rounded-2xl space-y-1.5">
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>First Branch / Outlet Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flagship Studio / Chikmagalur"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div className="p-3.5 bg-[#151515] border border-[#27272A] rounded-2xl space-y-1.5">
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Chairs / Stations *</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={chairs || ""}
                    onChange={(e) => setChairs(Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 bg-[#101010] border border-[#27272A] rounded-xl text-xs font-mono font-bold text-[#FACC15] focus:outline-none focus:border-[#FACC15]"
                  />
                  <div className="flex flex-wrap gap-1">
                    {CHAIR_PRESETS.slice(0, 3).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setChairs(preset)}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border cursor-pointer ${
                          chairs === preset
                            ? "bg-[#FACC15] text-[#080808] border-[#FACC15]"
                            : "bg-[#101010] text-[#A1A1AA] border-[#27272A]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Business Email *</span>
                </label>
                <input
                  type="email"
                  placeholder="contact@yoursalon.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            {/* Location */}
            <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-2.5">
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Outlet Location & Street Address *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City (e.g. Chikmagalur)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
                <input
                  type="text"
                  placeholder="Street / Area / Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="sm:col-span-2 w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="w-full py-3 px-5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FACC15]/10"
              >
                <span>Continue to Billing & Payout Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Billing & Payout Setup */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <QrCode className="w-3 h-3" />
                <span>Direct Settlement Configuration</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#F8FAFC]">
                Billing & Payout Details
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Set up your UPI ID so customer payments credit directly into your salon account at 0% platform fee.
              </p>
            </div>

            {/* UPI ID - Mandatory */}
            <div className="p-4 bg-[#151515] border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Salon UPI ID (Required for Invoices) *</span>
                </label>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  100% Direct Settlement
                </span>
              </div>

              <input
                type="text"
                placeholder="e.g. yoursalon@okaxis or 8296294666@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#101010] border border-[#27272A] rounded-xl text-sm font-mono font-bold text-emerald-300 placeholder-[#71717A] focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                This UPI ID is rendered as a dynamic QR code on all printed thermal receipts and WhatsApp invoices. Customers scan & pay directly to you.
              </p>
            </div>

            {/* UPI Payee Name */}
            <div>
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Account / Payee Name (Appears on GPay / PhonePe)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. OLG Professional Unisex Salon"
                value={upiPayeeName}
                onChange={(e) => setUpiPayeeName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            {/* GSTIN (Optional) */}
            <div>
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <span>GSTIN Number (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            {/* Payment Instructions */}
            <div>
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <span>Checkout Payment Note</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cash, UPI, and Cards accepted at front desk"
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="flex-1 py-3 px-5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FACC15]/10"
              >
                <span>Continue to Add First Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Add Your First Service */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleFinishOnboarding} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Scissors className="w-3 h-3" />
                <span>Menu Catalog Requirement</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#F8FAFC]">
                Add Your First Service
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Add at least one service so your front desk POS can immediately bill walk-in customers.
              </p>
            </div>

            <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-3.5">
              {/* Service Name */}
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Scissors className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Service Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Haircut & Wash"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-sm font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span>Category *</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setServiceCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        serviceCategory === cat
                          ? "bg-[#FACC15] text-[#080808] border-[#FACC15] font-bold"
                          : "bg-[#101010] text-[#A1A1AA] border-[#27272A] hover:border-[#FACC15]/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <IndianRupee className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Price (₹) *</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    placeholder="450"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-sm font-mono font-bold text-[#FACC15] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Duration (Minutes) *</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={5}
                      step={5}
                      required
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(Number(e.target.value))}
                      className="w-20 px-2.5 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs font-mono font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                    <div className="flex gap-1">
                      {DURATION_PRESETS.slice(1, 4).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setServiceDuration(d)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border cursor-pointer ${
                            serviceDuration === d
                              ? "bg-[#FACC15] text-[#080808] border-[#FACC15] font-bold"
                              : "bg-[#101010] text-[#A1A1AA] border-[#27272A]"
                          }`}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <span>Service Description (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the service"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-5 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-60 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FACC15]/10"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? "Saving Studio Setup..." : "Complete Setup & Launch"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Ready For Billing Notification & Register First Customer */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="py-4 space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Celebration Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/10">
              <PartyPopper className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Billing!</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#F8FAFC] tracking-tight">
                You're Ready for Billing!
              </h2>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                Your first branch, direct UPI settlements, and initial service catalog are successfully linked. Register your first customer on Ruvexi to create your first invoice!
              </p>
            </div>

            {/* Quick Summary Pill Card */}
            <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#27272A]/60">
                <span className="text-[#A1A1AA]">Salon & Branch:</span>
                <span className="font-bold text-[#F8FAFC]">{salonName} ({branchName})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#27272A]/60">
                <span className="text-[#A1A1AA]">Direct UPI:</span>
                <span className="font-mono font-bold text-emerald-400">{upiId}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#A1A1AA]">First Service:</span>
                <span className="font-bold text-[#FACC15]">{serviceName} • ₹{servicePrice}</span>
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => onComplete("register_customer")}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FACC15] to-amber-400 hover:from-amber-400 hover:to-amber-500 text-[#080808] font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-[#FACC15]/20 transition-all hover:scale-[1.01]"
              >
                <UserPlus className="w-5 h-5 text-black" />
                <span>Register Your First Customer</span>
              </button>

              <button
                type="button"
                onClick={() => onComplete("explore")}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
