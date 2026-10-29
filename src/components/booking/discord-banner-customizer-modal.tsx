"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  DISCORD_BANNER_PRESETS,
  BRAND_ACCENT_COLORS,
  BannerPreset,
  resolveSalonBannerStyle,
} from "@/lib/banner-presets";
import {
  Sparkles,
  Palette,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Sliders,
  Paintbrush,
  Crown,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Building2,
  HelpCircle,
  Eye,
  Zap,
} from "lucide-react";

interface DiscordBannerCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: {
    name: string;
    tagline?: string;
    logo?: string;
    logoUrl?: string;
    bannerPreset?: string;
    bannerUrl?: string;
    bannerGradient?: string;
    accentColor?: string;
    address?: string;
  };
  onSave: (updates: {
    name?: string;
    tagline?: string;
    bannerPreset?: string;
    bannerUrl?: string;
    bannerGradient?: string;
    accentColor?: string;
  }) => void;
}

export function DiscordBannerCustomizerModal({
  isOpen,
  onClose,
  salon,
  onSave,
}: DiscordBannerCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "gradient" | "image" | "brand">("presets");

  // Local draft state for real-time live preview
  const [selectedPreset, setSelectedPreset] = useState<string>(salon.bannerPreset || "discord-blurple");
  const [bannerUrl, setBannerUrl] = useState<string>(salon.bannerUrl || "");
  const [bannerGradient, setBannerGradient] = useState<string>(salon.bannerGradient || "");
  const [accentColor, setAccentColor] = useState<string>(salon.accentColor || "#FACC15");
  const [brandName, setBrandName] = useState<string>(salon.name || "BillCare Premier Atelier");
  const [tagline, setTagline] = useState<string>(
    salon.tagline || "Bespoke Styling, Organic Hair Therapy & Modern Skin Wellness"
  );

  // Gradient customizer controls
  const [gradColor1, setGradColor1] = useState<string>("#5865F2");
  const [gradColor2, setGradColor2] = useState<string>("#eb459e");
  const [gradAngle, setGradAngle] = useState<number>(135);
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [hasMesh, setHasMesh] = useState<boolean>(true);

  // Image upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(salon.bannerPreset || "discord-blurple");
      setBannerUrl(salon.bannerUrl || "");
      setBannerGradient(salon.bannerGradient || "");
      setAccentColor(salon.accentColor || "#FACC15");
      setBrandName(salon.name || "BillCare Premier Atelier");
      setTagline(salon.tagline || "Bespoke Styling, Organic Hair Therapy & Modern Skin Wellness");
    }
  }, [isOpen, salon]);

  if (!isOpen) return null;

  // Calculate live preview style
  const draftSalon = {
    bannerPreset: selectedPreset,
    bannerUrl,
    bannerGradient,
  };
  const liveBannerStyle = resolveSalonBannerStyle(draftSalon);

  const handleApplyPreset = (preset: BannerPreset) => {
    setSelectedPreset(preset.id);
    setBannerGradient("");
    setBannerUrl("");
    if (preset.accentColor) {
      setAccentColor(preset.accentColor);
    }
  };

  const handleUpdateCustomGradient = (
    c1 = gradColor1,
    c2 = gradColor2,
    angle = gradAngle,
    type = gradType
  ) => {
    let gradString = "";
    if (type === "linear") {
      gradString = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    } else {
      gradString = `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`;
    }
    setBannerGradient(gradString);
    setSelectedPreset("");
    setBannerUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBannerUrl(dataUrl);
      setSelectedPreset("");
      setBannerGradient("");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    onSave({
      name: brandName.trim(),
      tagline: tagline.trim(),
      bannerPreset: selectedPreset,
      bannerUrl: bannerUrl.trim(),
      bannerGradient: bannerGradient.trim(),
      accentColor,
    });
    onClose();
  };

  const handleResetDefault = () => {
    setSelectedPreset("discord-blurple");
    setBannerUrl("");
    setBannerGradient("");
    setAccentColor("#5865F2");
    setBrandName(salon.name || "BillCare Premier Atelier");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#111214] text-[#DBDEE1] rounded-2xl border border-[#27272A] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#18191C] border-b border-[#27272A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Customize Salon Brand &amp; Banner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#5865F2] text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" /> Discord Nitro Style
                </span>
              </div>
              <p className="text-xs text-[#949BA4]">
                Choose curated Discord themes, custom gradients, or brand artwork for your respected salon booking page.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#949BA4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Real-time Interactive Discord Profile Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#949BA4]">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Eye className="w-3.5 h-3.5 text-[#5865F2]" /> Live Discord-Style Preview
              </span>
              <span className="text-[11px] text-[#949BA4]">Real-time Client Booking View</span>
            </div>

            <div className="rounded-2xl border border-[#27272A] bg-[#1e1f22] overflow-hidden shadow-2xl">
              {/* Dynamic Banner Header */}
              <div
                className="h-36 sm:h-44 w-full relative transition-all duration-300 overflow-hidden"
                style={liveBannerStyle}
              >
                {/* Subtle dark gradient overlay at bottom for crystal clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f22] via-transparent to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" /> Boost Level 3
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md text-white shadow-lg border"
                    style={{
                      backgroundColor: `${accentColor}33`,
                      borderColor: accentColor,
                      color: accentColor,
                    }}
                  >
                    Respected Salon
                  </span>
                </div>
              </div>

              {/* Profile Card Body */}
              <div className="px-5 pb-5 pt-0 relative">
                {/* Overlapping Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-3 gap-3">
                  <div className="relative">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111214] border-4 border-[#1e1f22] overflow-hidden shadow-2xl flex items-center justify-center relative transition-transform duration-300 hover:scale-105"
                      style={{ boxShadow: `0 0 25px ${accentColor}30` }}
                    >
                      <img
                        src={salon.logo || salon.logoUrl || "/images/billcare-logo.png"}
                        alt={brandName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // fallback monogram
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-white bg-slate-900 -z-10">
                        {brandName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* Discord Online status indicator */}
                    <div
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#23A55A] border-4 border-[#1e1f22] flex items-center justify-center"
                      title="Salon Open & Taking Bookings"
                    />
                  </div>

                  {/* Quick Preview Action Button */}
                  <div className="flex items-center gap-2">
                    <div
                      className="px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-black shadow-md transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span>Book Treatment</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Brand Name & Tagline */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                      {brandName}
                    </h4>
                    <ShieldCheck className="w-5 h-5 text-[#5865F2] shrink-0" />
                  </div>
                  <p className="text-xs text-[#949BA4] mt-0.5 line-clamp-1 font-sans">
                    {tagline}
                  </p>
                  <p className="text-[11px] text-[#B5BAC1] font-mono mt-1 flex items-center gap-2">
                    <span>📍 {salon.address || "Bengaluru & Mumbai"}</span>
                    <span>·</span>
                    <span className="text-[#FACC15] font-bold">⭐ 4.95 (428 reviews)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Customization */}
          <div className="flex items-center gap-1.5 border-b border-[#27272A] pb-2 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab("presets")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "presets"
                  ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20"
                  : "bg-[#18191C] text-[#949BA4] hover:text-white hover:bg-[#232428]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discord Nitro Themes ({DISCORD_BANNER_PRESETS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("gradient")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "gradient"
                  ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20"
                  : "bg-[#18191C] text-[#949BA4] hover:text-white hover:bg-[#232428]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Gradients</span>
            </button>

            <button
              onClick={() => setActiveTab("image")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "image"
                  ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20"
                  : "bg-[#18191C] text-[#949BA4] hover:text-white hover:bg-[#232428]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Upload / Custom Image</span>
            </button>

            <button
              onClick={() => setActiveTab("brand")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === "brand"
                  ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20"
                  : "bg-[#18191C] text-[#949BA4] hover:text-white hover:bg-[#232428]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Brand Identity &amp; Colors</span>
            </button>
          </div>

          {/* TAB 1: Discord Nitro Presets */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#949BA4]">
                <span>Click any theme to apply it instantly to your live booking header.</span>
                <span className="font-mono text-[#5865F2]">100% Responsive &amp; Optimized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {DISCORD_BANNER_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id && !bannerGradient && !bannerUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`group relative rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#5865F2] bg-[#232428] ring-2 ring-[#5865F2]/40 shadow-xl"
                          : "border-[#27272A] bg-[#18191C] hover:border-[#5865F2]/50 hover:bg-[#1e1f22]"
                      }`}
                    >
                      {/* Preset Banner Mini Swatch */}
                      <div
                        className="h-20 w-full rounded-lg mb-2.5 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] border border-white/10"
                        style={{
                          background: preset.background,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {preset.isNitroStyle && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-[#FACC15] flex items-center gap-1 font-bold">
                            <Sparkles className="w-2.5 h-2.5" /> Nitro
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute inset-0 bg-[#5865F2]/30 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#5865F2] text-white flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white text-xs tracking-tight">
                            {preset.name}
                          </h5>
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.accentColor }}
                            title={`Accent color: ${preset.accentColor}`}
                          />
                        </div>
                        <p className="text-[11px] text-[#949BA4] mt-1 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {/* Category tag */}
                      <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#B5BAC1]">
                        <span>{preset.category}</span>
                        <span className="text-[#5865F2] font-bold">
                          {isSelected ? "Active" : "Select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Gradients */}
          {activeTab === "gradient" && (
            <div className="space-y-5 bg-[#18191C] p-5 rounded-2xl border border-[#27272A]">
              <div>
                <h4 className="text-sm font-bold text-white">Discord Gradient Studio</h4>
                <p className="text-xs text-[#949BA4] mt-0.5">
                  Mix your salon brand colors with smooth angle transitions and mesh effects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Color 1 */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4]">
                    Start Gradient Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={gradColor1}
                      onChange={(e) => {
                        setGradColor1(e.target.value);
                        handleUpdateCustomGradient(e.target.value, gradColor2, gradAngle, gradType);
                      }}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#27272A] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={gradColor1}
                      onChange={(e) => {
                        setGradColor1(e.target.value);
                        handleUpdateCustomGradient(e.target.value, gradColor2, gradAngle, gradType);
                      }}
                      className="flex-1 px-3 py-2 bg-[#1e1f22] border border-[#27272A] rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Color 2 */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4]">
                    End Gradient Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={gradColor2}
                      onChange={(e) => {
                        setGradColor2(e.target.value);
                        handleUpdateCustomGradient(gradColor1, e.target.value, gradAngle, gradType);
                      }}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#27272A] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={gradColor2}
                      onChange={(e) => {
                        setGradColor2(e.target.value);
                        handleUpdateCustomGradient(gradColor1, e.target.value, gradAngle, gradType);
                      }}
                      className="flex-1 px-3 py-2 bg-[#1e1f22] border border-[#27272A] rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Angle Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#949BA4]">Gradient Angle</span>
                  <span className="text-white font-bold">{gradAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={gradAngle}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setGradAngle(val);
                    handleUpdateCustomGradient(gradColor1, gradColor2, val, gradType);
                  }}
                  className="w-full h-2 bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                />
              </div>

              {/* Popular Swatches */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <span className="text-[11px] font-mono text-[#949BA4]">Quick Color Swatches:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { c1: "#5865F2", c2: "#eb459e", label: "Blurple Rose" },
                    { c1: "#18140c", c2: "#f6d285", label: "Imperial Gold" },
                    { c1: "#064e3b", c2: "#10b981", label: "Emerald Oasis" },
                    { c1: "#311042", c2: "#06b6d4", label: "Cyberpunk" },
                    { c1: "#0f172a", c2: "#38bdf8", label: "Skyline" },
                    { c1: "#4c1535", c2: "#fb7185", label: "Velvet Quartz" },
                  ].map((swatch) => (
                    <button
                      key={swatch.label}
                      type="button"
                      onClick={() => {
                        setGradColor1(swatch.c1);
                        setGradColor2(swatch.c2);
                        handleUpdateCustomGradient(swatch.c1, swatch.c2, gradAngle, gradType);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1e1f22] hover:bg-[#27272A] border border-[#27272A] text-white flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${swatch.c1}, ${swatch.c2})` }}
                      />
                      <span>{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Upload / Custom Image */}
          {activeTab === "image" && (
            <div className="space-y-5 bg-[#18191C] p-5 rounded-2xl border border-[#27272A]">
              <div>
                <h4 className="text-sm font-bold text-white">Upload Salon Banner Artwork</h4>
                <p className="text-xs text-[#949BA4] mt-0.5">
                  Upload high-resolution photography of your salon interior, styling stations, or custom Discord banner graphic.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#27272A] hover:border-[#5865F2] bg-[#1e1f22]/50 hover:bg-[#1e1f22] p-6 rounded-2xl text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] flex items-center justify-center mx-auto shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click to Upload Banner Image</p>
                  <p className="text-xs text-[#949BA4] mt-1 font-mono">
                    Supports JPG, PNG, WEBP, GIF (Recommended 1920 × 480 px, max 5MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4]">
                  Or Paste External Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bannerUrl}
                    onChange={(e) => {
                      setBannerUrl(e.target.value);
                      setSelectedPreset("");
                      setBannerGradient("");
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#1e1f22] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#5e646d] focus:border-[#5865F2] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (bannerUrl.trim()) {
                        setSelectedPreset("");
                        setBannerGradient("");
                      }
                    }}
                    className="px-4 py-2.5 bg-[#232428] hover:bg-[#2b2d31] text-white text-xs font-mono font-bold rounded-xl border border-[#27272A] transition-all cursor-pointer"
                  >
                    Load URL
                  </button>
                </div>
              </div>

              {/* Pre-packaged Salon Photos */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <span className="text-[11px] font-mono text-[#949BA4]">Curated Photography Presets:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: "Luxury Studio", path: "/images/hero-showcase.jpg" },
                    { name: "Spa Sanctuary", path: "/images/spa-wellness.jpg" },
                    { name: "Stylist Lounge", path: "/images/stylist-consultation.jpg" },
                    { name: "Atelier Ambience", path: "/images/hero-bg.jpg" },
                  ].map((presetImg) => (
                    <div
                      key={presetImg.name}
                      onClick={() => {
                        setBannerUrl(presetImg.path);
                        setSelectedPreset("");
                        setBannerGradient("");
                      }}
                      className="group p-1.5 rounded-xl border border-[#27272A] bg-[#1e1f22] hover:border-[#5865F2] cursor-pointer transition-all text-center"
                    >
                      <img
                        src={presetImg.path}
                        alt={presetImg.name}
                        className="w-full h-14 object-cover rounded-lg mb-1"
                      />
                      <span className="text-[11px] font-mono text-[#DBDEE1] block truncate">
                        {presetImg.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Brand Identity & Colors */}
          {activeTab === "brand" && (
            <div className="space-y-5 bg-[#18191C] p-5 rounded-2xl border border-[#27272A]">
              <div>
                <h4 className="text-sm font-bold text-white">Respected Brand Identity &amp; Accent Tint</h4>
                <p className="text-xs text-[#949BA4] mt-0.5">
                  Update your salon brand title, tagline, and signature accent color that highlights booking buttons, calendar slots, and badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4]">
                    Salon Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1e1f22] border border-[#27272A] rounded-xl text-xs text-white font-bold focus:border-[#5865F2] focus:outline-none"
                    placeholder="e.g. BillCare Premier Atelier"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4]">
                    Brand Tagline / Bio
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1e1f22] border border-[#27272A] rounded-xl text-xs text-white focus:border-[#5865F2] focus:outline-none"
                    placeholder="e.g. Bespoke Styling, Organic Hair Therapy & Modern Skin Wellness"
                  />
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                <label className="text-xs font-mono uppercase tracking-wider text-[#949BA4] flex items-center justify-between">
                  <span>Brand Accent Theme Color</span>
                  <span className="font-bold text-white">{accentColor}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRAND_ACCENT_COLORS.map((col) => {
                    const isSelected = accentColor.toLowerCase() === col.hex.toLowerCase();
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setAccentColor(col.hex)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-white bg-[#232428] ring-2 ring-white/20"
                            : "border-[#27272A] bg-[#1e1f22] hover:bg-[#27272A]"
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full shadow-md shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: col.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                        <span className="text-xs font-mono font-medium text-white truncate">
                          {col.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#18191C] border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-xs font-mono text-[#949BA4] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Discord Default
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#232428] hover:bg-[#2b2d31] text-[#DBDEE1] hover:text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl shadow-lg shadow-[#5865F2]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply &amp; Save Brand Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
