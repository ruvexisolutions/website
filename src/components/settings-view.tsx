"use client";

import React, { useState, useRef } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { getRoleConfig } from "@/lib/role-permissions";
import {
  Settings,
  Building2,
  Clock,
  Printer,
  CheckCircle2,
  Save,
  MessageSquare,
  Crown,
  Smartphone,
  QrCode,
  ImagePlus,
  Lock,
  Upload,
  X,
  Sliders,
  Banknote,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { billcareApi } from "@/lib/api-client";
import QRCode from "qrcode";
import { MetaEmbeddedSignupModal } from "./meta-embedded-signup-modal";
import { WhatsAppSettingsView } from "./whatsapp-settings-view";
import { DiscordBannerCustomizerModal } from "./booking/discord-banner-customizer-modal";
import { resolveSalonBannerStyle, DISCORD_BANNER_PRESETS } from "@/lib/banner-presets";
import { Sparkles, Palette } from "lucide-react";

interface SettingsViewProps {
  initialSubTab?: "general" | "whatsapp" | "financials";
}

export function SettingsView({ initialSubTab = "general" }: SettingsViewProps) {
  const { salon, updateSalonProfile, resetDemoData, user } = useBillCare();

  const roleConfig = getRoleConfig(user?.role);
  const canEditBusiness = roleConfig.capabilities.canEditSalonSettings;
  const canEditProfile = roleConfig.capabilities.canEditSalonProfile;

  const [activeTab, setActiveTab] = useState<"general" | "whatsapp" | "financials">(initialSubTab);

  const [name, setName] = useState(salon.name);
  const [tagline, setTagline] = useState(salon.tagline);
  const [branch, setBranch] = useState(salon.branch);
  const [address, setAddress] = useState(salon.address);
  const [phone, setPhone] = useState(salon.phone);
  const [email, setEmail] = useState(salon.email);
  const [gstin, setGstin] = useState(salon.gstin);
  const [upiId, setUpiId] = useState(salon.upiId || "");
  const [cashEnabled, setCashEnabled] = useState<boolean>(salon.paymentSettings?.cashEnabled ?? (salon as any).cashEnabled ?? true);
  const [upiEnabled, setUpiEnabled] = useState<boolean>(salon.paymentSettings?.upiEnabled ?? (salon as any).upiEnabled ?? false);
  const [upiPayeeName, setUpiPayeeName] = useState(salon.paymentSettings?.upiPayeeName || salon.name);
  const [paymentInstructions, setPaymentInstructions] = useState(salon.paymentSettings?.paymentInstructions || "");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState(salon.bankAccountName || salon.name);
  const [bankAccountNumber, setBankAccountNumber] = useState(salon.bankAccountNumber || "50200088991122");
  const [bankIfsc, setBankIfsc] = useState(salon.bankIfsc || "HDFC0001043");
  const [bankName, setBankName] = useState(salon.bankName || "HDFC Bank (Indiranagar Branch)");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Live UPI QR code generator for test verification
  React.useEffect(() => {
    if (upiId && upiId.includes("@")) {
      const testIntent = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(upiPayeeName || salon.name)}&cu=INR&tn=${encodeURIComponent("BillCare Test QR")}`;
      QRCode.toDataURL(testIntent, { width: 200, margin: 1 })
        .then(setPreviewQrUrl)
        .catch(() => setPreviewQrUrl(""));
    } else {
      setPreviewQrUrl("");
    }
  }, [upiId, upiPayeeName, salon.name]);

  const [logoPreview, setLogoPreview] = useState<string | null>((salon as any).logoUrl || null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [openTime, setOpenTime] = useState("09:30 AM");
  const [closeTime, setCloseTime] = useState("08:30 PM");
  const [gstRate, setGstRate] = useState("5%");
  const [printerWidth, setPrinterWidth] = useState("80mm (Standard POS)");
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [isMetaSignupOpen, setIsMetaSignupOpen] = useState(false);
  const [metaWabaStatus, setMetaWabaStatus] = useState<any>(salon.whatsapp || {
    status: "connected",
    displayNumber: salon.phone,
    verifiedName: salon.name,
    qualityRating: "GREEN",
    phoneNumberId: "10982348911029",
  });

  // Discord Banner & Brand Appearance State
  const [bannerPreset, setBannerPreset] = useState(salon.bannerPreset || "discord-blurple");
  const [bannerUrl, setBannerUrl] = useState(salon.bannerUrl || "");
  const [bannerGradient, setBannerGradient] = useState(salon.bannerGradient || "");
  const [accentColor, setAccentColor] = useState(salon.accentColor || "#FACC15");
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsSaving(true);

    try {
      if (canEditBusiness) {
        if (upiEnabled && (!upiId || !upiId.includes("@"))) {
          setPaymentError("A valid UPI ID (e.g., yoursalon@okhdfcbank) is required when UPI is enabled.");
          setIsSaving(false);
          return;
        }

        // Call backend payment settings endpoint
        await billcareApi.updatePaymentSettings({
          cashEnabled,
          upiEnabled,
          upiId: upiId.trim(),
          upiPayeeName: upiPayeeName.trim() || name,
          paymentInstructions: paymentInstructions.trim(),
          bankAccountName,
          bankAccountNumber,
          bankIfsc,
          bankName,
        });
      }

      updateSalonProfile({
        name,
        tagline,
        branch,
        address,
        phone,
        email,
        ...(canEditBusiness && {
          gstin,
          upiId: upiId.trim(),
          cashEnabled,
          upiEnabled,
          upiPayeeName,
          paymentInstructions,
          bankAccountName,
          bankAccountNumber,
          bankIfsc,
          bankName,
          paymentSettings: {
            cashEnabled,
            upiEnabled: Boolean(upiEnabled && upiId.trim()),
            isUpiConfigured: Boolean(upiId.trim()),
            upiId: upiId.trim(),
            upiPayeeName: upiPayeeName.trim() || name,
            paymentInstructions: paymentInstructions.trim(),
          }
        }),
        ...(logoPreview !== null && { logoUrl: logoPreview }),
        bannerPreset,
        bannerUrl,
        bannerGradient,
        accentColor,
      } as any);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setPaymentError(err.message || "Failed to update salon settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                Salon Settings
              </h1>
              {!canEditBusiness && (
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#60A5FA] border border-[#60A5FA]/30">
                  Brand &amp; Profile Access
                </span>
              )}
              {canEditBusiness && (
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                  Full Admin Access
                </span>
              )}
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              {canEditBusiness
                ? "Brand profile \u00b7 Tax & GSTIN compliance \u00b7 WhatsApp Cloud API credentials"
                : "Update your salon logo, name, tagline, address, and contact info."}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Settings Saved!
          </div>
        )}
      </div>

      {/* Settings Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "general"
              ? "bg-[#FACC15] text-[#080808] shadow-md shadow-[#FACC15]/10"
              : "bg-[#151515] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#27272A]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          General &amp; Brand
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "whatsapp"
              ? "bg-[#FACC15] text-[#080808] shadow-md shadow-[#FACC15]/10"
              : "bg-[#151515] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#27272A]"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          WhatsApp Integration
          {canEditBusiness ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Manager
            </span>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27272A] text-[#71717A]">
              Restricted
            </span>
          )}
        </button>
      </div>

      {activeTab === "whatsapp" ? (
        <WhatsAppSettingsView />
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Brand Identity (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Logo Upload */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#27272A]">
              <ImagePlus className="w-4 h-4 text-[#FACC15]" />
              Salon Logo
            </h3>
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Salon logo preview"
                    className="w-20 h-20 rounded-2xl object-cover border border-[#27272A] shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#1A1A0E] border border-[#FACC15]/20 flex items-center justify-center">
                    <span className="text-[#FACC15] font-black text-2xl leading-none select-none">
                      {(name || "S")
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Your salon logo appears on the Front Desk terminal, printed receipts, and WhatsApp messages.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#151515] border border-[#27272A] hover:border-[#FACC15]/50 rounded-xl text-xs font-medium text-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FACC15]" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3.5 py-2 bg-[#151515] border border-[#27272A] hover:border-rose-500/50 rounded-xl text-xs font-medium text-[#71717A] hover:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#4B4B52] font-mono">PNG, JPG, or WebP &middot; Max 2MB &middot; Square recommended</p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </div>

          {/* Discord-Style Salon Banner & Brand Appearance */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] flex-wrap gap-2">
              <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#5865F2]" />
                Salon Brand Banner &amp; Concierge Theme
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#5865F2] text-white font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Discord Nitro Style
                </span>
              </h3>
              <a
                href="/book"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#5865F2] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Preview Client Booking Page ↗</span>
              </a>
            </div>

            {/* Banner Preview Card */}
            <div className="space-y-3">
              <div
                className="h-32 sm:h-36 w-full rounded-xl relative overflow-hidden border border-[#27272A] shadow-lg flex flex-col justify-end p-4 transition-all"
                style={resolveSalonBannerStyle({ bannerPreset, bannerUrl, bannerGradient })}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between gap-3 text-white">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-white">{name}</h4>
                    <p className="text-xs text-slate-300 font-sans line-clamp-1">{tagline}</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow-md shrink-0"
                    style={{ backgroundColor: accentColor }}
                    title={`Brand accent: ${accentColor}`}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Customize your brand banner with 12 Discord themes, custom gradients, or high-res salon photos.
                </p>

                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(true)}
                  className="px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Customize Discord Banner</span>
                </button>
              </div>
            </div>
          </div>

          {/* Salon Identity */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#27272A]">
              <Building2 className="w-4 h-4 text-[#FACC15]" />
              Salon Identity &amp; Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Salon Brand Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Branch / Location</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Marketing Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Front-Desk Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#27272A]">
              <Clock className="w-4 h-4 text-[#FACC15]" />
              Operating Hours
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Salon Opens</label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Last Chair Closes</label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Business / Financial â€” Owner only */}
          {canEditBusiness ? (
            <>
              <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#27272A]">
                  <Crown className="w-4 h-4 text-[#FACC15]" />
                  Tax &amp; GSTIN Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Applicable Tax Slab</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                    >
                      <option value="5%" className="bg-[#151515] text-[#F8FAFC]">5% GST (Standard Salon)</option>
                      <option value="18%" className="bg-[#151515] text-[#F8FAFC]">18% GST (Luxury Aesthetics)</option>
                      <option value="0%" className="bg-[#151515] text-[#F8FAFC]">0% Exempt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Cash & Direct Salon UPI Payment Settings */}
              <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#FACC15]" />
                      Salon Customer Payment Methods
                    </h3>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Configure front-desk Cash counter and Direct-to-Salon UPI QR settlements.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Direct-to-Salon (Zero Gateway Fees)
                  </span>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Method Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cash Method Toggle */}
                  <div
                    onClick={() => setCashEnabled(!cashEnabled)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      cashEnabled
                        ? "bg-[#141414] border-emerald-500/40 shadow-sm"
                        : "bg-[#111111] border-[#27272A] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F8FAFC]">Cash at Front Desk</p>
                          <p className="text-[11px] text-[#71717A]">Counter collection & change return</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={cashEnabled}
                        onChange={() => {}}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* UPI Method Toggle */}
                  <div
                    onClick={() => setUpiEnabled(!upiEnabled)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      upiEnabled
                        ? "bg-[#141414] border-[#FACC15]/40 shadow-sm"
                        : "bg-[#111111] border-[#27272A] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F8FAFC]">Direct UPI QR Code</p>
                          <p className="text-[11px] text-[#71717A]">Customer scans counter QR directly</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={upiEnabled}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#FACC15] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* UPI Configuration Fields */}
                <div className="p-4 bg-[#141414] border border-[#27272A] rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#FACC15]" /> Salon UPI Destination (NPCI VPA)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#71717A]">
                      Format: username@psp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-mono text-[11px] text-[#A1A1AA] block">
                        Salon UPI ID / VPA <span className="text-[#FACC15]">*</span>
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yoursalon@okhdfcbank or 9845011223@paytm"
                        className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-mono font-bold text-[#FACC15]"
                      />
                      <p className="text-[10px] text-[#71717A]">
                        Payments go straight to your salon account. BillCare never touches customer funds.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[11px] text-[#A1A1AA] block">
                        Payee Display Name <span className="text-[#A1A1AA]">(Shown on UPI apps)</span>
                      </label>
                      <input
                        type="text"
                        value={upiPayeeName}
                        onChange={(e) => setUpiPayeeName(e.target.value)}
                        placeholder="e.g. Velvet Crown Atelier"
                        className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-bold text-[#F8FAFC]"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="font-mono text-[11px] text-[#A1A1AA] block">
                        Counter Payment Instructions for Staff
                      </label>
                      <input
                        type="text"
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        placeholder="e.g. Scan with any UPI app. Front desk verifies counter notification before confirming."
                        className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] text-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  {/* Live UPI QR Preview for Manager Verification */}
                  {previewQrUrl && (
                    <div className="p-3 bg-[#181818] border border-[#27272A] rounded-xl flex items-center gap-4">
                      <img src={previewQrUrl} alt="UPI QR Preview" className="w-20 h-20 bg-white p-1 rounded-lg shrink-0" />
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          Live QR Preview Validated
                        </span>
                        <p className="font-bold text-[#F8FAFC]">{upiPayeeName || salon.name}</p>
                        <p className="font-mono text-[11px] text-[#FACC15]">{upiId}</p>
                        <p className="text-[10px] text-[#71717A]">
                          Test scan this QR code with your UPI app to verify that your account receives payments correctly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Account Details */}
                <div className="pt-2 border-t border-[#27272A] space-y-3">
                  <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block">
                    Settlement Bank Account Records
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Account Holder Name</label>
                      <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold" />
                    </div>
                    <div>
                      <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Account Number</label>
                      <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono font-bold" />
                    </div>
                    <div>
                      <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Bank IFSC Code</label>
                      <input type="text" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#FACC15] focus:outline-none focus:border-[#FACC15] font-mono font-bold uppercase" />
                    </div>
                    <div>
                      <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Bank Name &amp; Branch</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#101010] border border-[#27272A] p-5 rounded-2xl flex items-start gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-[#4B4B52]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#A1A1AA]">Business &amp; Financial Settings</p>
                <p className="text-xs text-[#4B4B52] leading-relaxed mt-1">
                  GSTIN, tax slabs, UPI merchant destination, and bank settlement details are restricted to the Salon Manager. Contact your manager to update these.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WhatsApp, Hardware, Save */}
        <div className="space-y-6">
          {/* WhatsApp Cloud API */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#27272A]">
                <span className="text-[#71717A]">Verified Name:</span>
                <span className="font-bold text-[#F8FAFC]">{metaWabaStatus.verifiedName || salon.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#27272A]">
                <span className="text-[#71717A]">Sender Phone:</span>
                <span className="font-mono text-[#F8FAFC] font-bold">{metaWabaStatus.displayNumber || salon.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#27272A]">
                <span className="text-[#71717A]">Quality Rating:</span>
                <span className="font-bold text-emerald-400 font-mono">HIGH (Tier 2 &#10003;)</span>
              </div>
            </div>
            {canEditBusiness && (
              <button
                type="button"
                onClick={() => setActiveTab("whatsapp")}
                className="w-full py-2.5 px-3 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure WhatsApp Platform</span>
              </button>
            )}
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#F8FAFC] pt-1">
              <input
                type="checkbox"
                checked={autoSendWhatsApp}
                onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                className="rounded text-[#FACC15] focus:ring-[#FACC15]"
              />
              <span>Auto-dispatch receipts &amp; reminders</span>
            </label>
          </div>

          {/* POS Hardware */}
          <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-[#27272A]">
              <Printer className="w-4 h-4 text-[#FACC15]" /> POS Hardware &amp; Receipt
            </h3>
            <div className="text-xs space-y-3">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Thermal Paper Roll Width</label>
                <select
                  value={printerWidth}
                  onChange={(e) => setPrinterWidth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                >
                  <option value="80mm (Standard POS)" className="bg-[#151515] text-[#F8FAFC]">80mm (Standard Countertop POS)</option>
                  <option value="58mm (Mini Bluetooth)" className="bg-[#151515] text-[#F8FAFC]">58mm (Mini Portable Bluetooth)</option>
                  <option value="A4 / A5 (Full Sheet)" className="bg-[#151515] text-[#F8FAFC]">A4 / A5 (Full Laser Invoice)</option>
                </select>
              </div>
              <div className="p-3 bg-[#151515] rounded-xl border border-[#27272A] text-[11px] text-[#71717A] font-mono leading-relaxed">
                ESC/POS Bluetooth &amp; USB thermal printing compatible without drivers.
              </div>
            </div>
          </div>

          {/* Save / Reset */}
          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>

            {canEditBusiness && (
              <button
                type="button"
                onClick={resetDemoData}
                className="w-full py-2.5 px-4 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-rose-400 font-mono text-xs rounded-xl transition-all cursor-pointer"
              >
                Reset to Factory Baseline
              </button>
            )}
          </div>
        </div>
      </form>
      )}

      {canEditBusiness && (
        <MetaEmbeddedSignupModal
          isOpen={isMetaSignupOpen}
          onClose={() => setIsMetaSignupOpen(false)}
          salonName={salon.name}
          salonPhone={salon.phone}
          onSuccess={(updatedSalon) => {
            if (updatedSalon?.whatsapp) {
              setMetaWabaStatus(updatedSalon.whatsapp);
            }
            setIsMetaSignupOpen(false);
          }}
        />
      )}

      {/* Discord Banner Customizer Modal */}
      <DiscordBannerCustomizerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        salon={{
          name,
          tagline,
          logo: logoPreview || undefined,
          bannerPreset,
          bannerUrl,
          bannerGradient,
          accentColor,
          address,
        }}
        onSave={(updates) => {
          if (updates.name) setName(updates.name);
          if (updates.tagline) setTagline(updates.tagline);
          if (updates.bannerPreset !== undefined) setBannerPreset(updates.bannerPreset);
          if (updates.bannerUrl !== undefined) setBannerUrl(updates.bannerUrl);
          if (updates.bannerGradient !== undefined) setBannerGradient(updates.bannerGradient);
          if (updates.accentColor !== undefined) setAccentColor(updates.accentColor);

          updateSalonProfile({
            ...(updates.name && { name: updates.name }),
            ...(updates.tagline && { tagline: updates.tagline }),
            bannerPreset: updates.bannerPreset,
            bannerUrl: updates.bannerUrl,
            bannerGradient: updates.bannerGradient,
            accentColor: updates.accentColor,
          });
        }}
      />
    </div>
  );
}
