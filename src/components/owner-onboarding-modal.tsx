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
} from "lucide-react";

interface OwnerOnboardingModalProps {
  onComplete: () => void;
}

const CHAIR_PRESETS = [4, 6, 8, 12, 16];

export function OwnerOnboardingModal({ onComplete }: OwnerOnboardingModalProps) {
  const { salon, user, updateSalonProfile, showToast } = useRuvexi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialName =
    salon?.name && !salon.name.endsWith("'s Salon & Spa") && !salon.name.endsWith("'s Atelier")
      ? salon.name
      : "";

  const initialPhone =
    salon?.phone && salon.phone !== "+91 98000 00000" && salon.phone !== "+91 98450 11223"
      ? salon.phone
      : "";

  const initialAddress =
    salon?.address &&
    salon.address !== "Suite 401, Crescent Galleria, Indiranagar" &&
    salon.address !== "Suite 401, Crescent Galleria, Indiranagar, Bengaluru"
      ? salon.address
      : "";

  const initialCity = salon?.city && salon.city !== "Mumbai & Bengaluru" ? salon.city : "";

  const initialLogo =
    salon?.logoUrl &&
    salon.logoUrl !== "/logo.png" &&
    salon.logoUrl !== "/images/ruvexi-logo.png"
      ? salon.logoUrl
      : "";

  const [salonName, setSalonName] = useState(initialName || salon?.name || "");
  const [logoUrl, setLogoUrl] = useState(initialLogo);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [chairs, setChairs] = useState<number>(salon?.chairs || 6);
  const [businessPhone, setBusinessPhone] = useState(initialPhone || user?.phone || "");
  const [businessEmail, setBusinessEmail] = useState(salon?.email || user?.email || "");
  const [city, setCity] = useState(initialCity);
  const [address, setAddress] = useState(initialAddress);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!salonName.trim()) {
      setError("Please enter your Salon / Studio name.");
      return;
    }
    if (!chairs || Number(chairs) < 1 || Number(chairs) > 100) {
      setError("Please enter a valid styling chair capacity between 1 and 100.");
      return;
    }
    if (!businessPhone.trim() || businessPhone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid business phone number.");
      return;
    }
    if (!businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail.trim())) {
      setError("Please enter a valid business email address.");
      return;
    }
    if (!city.trim() || !address.trim()) {
      setError("Please enter both your city and full salon location / street address.");
      return;
    }

    setIsSaving(true);
    try {
      const cleanName = salonName.trim();
      const cleanCity = city.trim();
      const cleanAddress = address.trim();
      const cleanPhone = businessPhone.trim();
      const cleanEmail = businessEmail.trim().toLowerCase();
      const chairCount = Math.max(1, Math.min(100, Number(chairs)));

      updateSalonProfile({
        name: cleanName,
        chairs: chairCount,
        phone: cleanPhone,
        email: cleanEmail,
        city: cleanCity,
        address: cleanAddress,
        branch: `${cleanCity} Studio`,
        ...(logoUrl ? { logoUrl, logo: logoUrl } : {}),
      });

      if (typeof window !== "undefined") {
        if (salon?.id) {
          localStorage.setItem(`Ruvexi_onboarded_${salon.id}`, "true");
        }
        localStorage.removeItem("Ruvexi_needs_onboarding");
      }

      showToast(`${cleanName} setup complete! Welcome to RUVEXI.`, "success");
      onComplete();
    } catch (err: any) {
      setError(err?.message || "Failed to save studio details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="pb-4 border-b border-[#27272A] space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/30 text-[10px] font-mono font-bold text-[#FACC15] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>First-Time Studio Setup</span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#F8FAFC] tracking-tight">
            Set Up Your Salon Profile
          </h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Tell us a few essential details about your salon. These appear on GST invoices,
            WhatsApp receipts, front-desk chairs, and your client booking page.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Salon Name & Logo Row */}
          <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo Upload Box */}
              <div className="shrink-0 flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-[#101010] border border-dashed border-[#27272A] flex items-center justify-center overflow-hidden relative group">
                  {logoUrl ? (
                    <>
                      <img
                        src={logoUrl}
                        alt="Salon logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl("")}
                        title="Remove logo"
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <ImagePlus className="w-7 h-7 text-[#71717A]" />
                  )}
                </div>

                <div className="space-y-1.5 sm:hidden">
                  <div className="font-bold text-[#F8FAFC]">Salon Logo</div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-lg text-[11px] font-semibold text-[#FACC15] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Salon Name *</span>
                  </label>
                  <input
                    type="text"
                    required
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
                    className="px-3 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-lg text-[11px] font-semibold text-[#FACC15] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{logoUrl ? "Change Logo" : "Upload Salon Logo"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((prev) => !prev)}
                    className="px-2.5 py-1.5 text-[11px] text-[#A1A1AA] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    {showUrlInput ? "Hide URL" : "Or paste logo URL"}
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
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/your-salon-logo.png"
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            )}
          </div>

          {/* Chair Capacity */}
          <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Chair Capacity *</span>
              </label>
              <span className="text-[10px] font-mono text-[#71717A]">
                Styling stations / beds
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                required
                value={chairs || ""}
                onChange={(e) => setChairs(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-sm font-mono font-bold text-[#FACC15] focus:outline-none focus:border-[#FACC15]"
              />
              <div className="flex flex-wrap gap-1.5">
                {CHAIR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setChairs(preset)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                      chairs === preset
                        ? "bg-[#FACC15] text-[#080808] border-[#FACC15]"
                        : "bg-[#101010] text-[#A1A1AA] border-[#27272A] hover:border-[#FACC15]/50 hover:text-[#F8FAFC]"
                    }`}
                  >
                    {preset} Chairs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Business Contact: Number & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Business Number *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Business Email *</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. contact@yoursalon.com"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-medium text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>
          </div>

          {/* Location: City & Full Address */}
          <div className="p-4 bg-[#151515] border border-[#27272A] rounded-2xl space-y-3">
            <label className="font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Salon Location *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="City (e.g. Bengaluru)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-xs font-bold text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Street address / Area (e.g. 100ft Road, Indiranagar)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-5 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-60 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? "Saving Studio Setup..." : "Complete Studio Setup & Launch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

