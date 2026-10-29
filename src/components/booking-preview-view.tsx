"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import {
  DISCORD_BANNER_PRESETS,
  RESPECTED_SALONS,
  RespectedSalonProfile,
  resolveSalonBannerStyle,
  findRespectedSalonBySlug,
} from "@/lib/banner-presets";
import { DiscordBannerCustomizerModal } from "./booking/discord-banner-customizer-modal";
import {
  Sparkles,
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Star,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Heart,
  Crown,
  Building2,
  Award,
  Palette,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  Zap,
  ExternalLink,
  MessageCircle,
  QrCode,
  Flame,
  Layers,
} from "lucide-react";

interface BookingPreviewViewProps {
  salonSlug?: string;
  isStandalone?: boolean;
}

export function BookingPreviewView({
  salonSlug,
  isStandalone = false,
}: BookingPreviewViewProps) {
  const {
    salon: currentContextSalon,
    services: contextServices,
    staff: contextStaff,
    bookAppointment,
    updateSalonProfile,
    showToast,
  } = useBillCare();

  // Selected respected salon: check if matching salon exists in RESPECTED_SALONS, or fallback to context salon
  const matchedPresetSalon = useMemo(() => {
    if (salonSlug) {
      return findRespectedSalonBySlug(salonSlug);
    }
    return undefined;
  }, [salonSlug]);

  const [activeSalonSlug, setActiveSalonSlug] = useState<string>(
    matchedPresetSalon?.slug || currentContextSalon.slug || "billcare-atelier"
  );

  // Switchable respected salon profile
  const activeSalon = useMemo(() => {
    const fromRegistry = RESPECTED_SALONS.find((s) => s.slug === activeSalonSlug);
    if (fromRegistry) {
      // If the active registry salon matches the context salon slug, overlay user's custom changes
      if (fromRegistry.slug === currentContextSalon.slug) {
        return {
          ...fromRegistry,
          ...currentContextSalon,
          name: currentContextSalon.name || fromRegistry.name,
          tagline: currentContextSalon.tagline || fromRegistry.tagline,
          bannerPreset: currentContextSalon.bannerPreset || fromRegistry.bannerPreset,
          bannerUrl: currentContextSalon.bannerUrl ?? fromRegistry.bannerUrl,
          bannerGradient: currentContextSalon.bannerGradient ?? fromRegistry.bannerGradient,
          accentColor: currentContextSalon.accentColor || fromRegistry.accentColor,
        };
      }
      return fromRegistry;
    }
    // Fallback to current context salon
    return {
      ...currentContextSalon,
      bannerPreset: currentContextSalon.bannerPreset || "discord-blurple",
      accentColor: currentContextSalon.accentColor || "#FACC15",
      tagline: currentContextSalon.tagline || "Bespoke Styling, Organic Hair Therapy & Modern Skin Wellness",
      badges: currentContextSalon.badges || ["👑 Official Flagship", "✨ Verified Atelier", "💎 Boost Level 3"],
      services: contextServices.length > 0 ? contextServices : RESPECTED_SALONS[0].services,
      staff: contextStaff.length > 0 ? contextStaff : RESPECTED_SALONS[0].staff,
    };
  }, [activeSalonSlug, currentContextSalon, contextServices, contextStaff]);

  // Available services & staff for this respective salon
  const availableServices = useMemo(() => {
    if (activeSalon.services && activeSalon.services.length > 0) {
      return activeSalon.services;
    }
    if (contextServices.length > 0) return contextServices;
    return RESPECTED_SALONS[0].services;
  }, [activeSalon, contextServices]);

  const availableStaff = useMemo(() => {
    if (activeSalon.staff && activeSalon.staff.length > 0) {
      return activeSalon.staff;
    }
    if (contextStaff.length > 0) return contextStaff;
    return RESPECTED_SALONS[0].staff;
  }, [activeSalon, contextStaff]);

  // Stepper state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    availableServices[0]?.id || ""
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    availableStaff[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>("Tomorrow, Oct 13");
  const [selectedTime, setSelectedTime] = useState<string>("11:30 AM");

  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");

  // Discord Banner Customizer Modal state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync initial selection when availableServices / availableStaff change
  useEffect(() => {
    if (availableServices.length > 0 && !availableServices.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(availableServices[0].id);
    }
  }, [availableServices, selectedServiceId]);

  useEffect(() => {
    if (availableStaff.length > 0 && !availableStaff.some((st) => st.id === selectedStaffId)) {
      setSelectedStaffId(availableStaff[0].id);
    }
  }, [availableStaff, selectedStaffId]);

  const selectedService =
    availableServices.find((s) => s.id === selectedServiceId) || availableServices[0];
  const selectedStaff =
    availableStaff.find((s) => s.id === selectedStaffId) || availableStaff[0];

  // Accent color from active salon
  const accentColor = activeSalon.accentColor || "#FACC15";

  // Filtered services
  const filteredServices = useMemo(() => {
    return availableServices.filter((srv) => {
      const matchCat = selectedCategory === "All" || srv.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [availableServices, selectedCategory, searchQuery]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    availableServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [availableServices]);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const refCode = "BC-" + Math.floor(100000 + Math.random() * 900000);
    setConfirmationCode(refCode);

    bookAppointment({
      customerName: clientName,
      customerPhone: clientPhone,
      serviceName: selectedService.name,
      staffName: selectedStaff.name,
      staffId: selectedStaff.id,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      source: "Online Booking",
    });

    // Auto-dispatch Meta WhatsApp booking pass
    fetch("/api/v1/whatsapp/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerPhone: clientPhone,
        customerName: clientName,
        salonName: activeSalon.name,
        serviceName: selectedService.name,
        staffName: selectedStaff.name,
        dateTime: `${selectedDate} at ${selectedTime}`,
        bookingCode: refCode,
      }),
    }).catch((err) => console.warn("WhatsApp reminder notice:", err));

    setConfirmed(true);
    showToast(`Appointment confirmed at ${activeSalon.name}! WhatsApp pass dispatched.`, "success");
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://billcare.io";
    const shareUrl = `${origin}/book/${activeSalon.slug || "atelier"}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      showToast(`Copied ${activeSalon.name} direct booking link!`, "info");
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSaveBanner = (updates: {
    name?: string;
    tagline?: string;
    bannerPreset?: string;
    bannerUrl?: string;
    bannerGradient?: string;
    accentColor?: string;
  }) => {
    updateSalonProfile(updates);
    showToast("✨ Salon brand & Discord banner updated successfully!", "success");
  };

  // Resolve active banner style
  const bannerStyle = resolveSalonBannerStyle(activeSalon);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-100 pb-12">
      {/* Top Salon Navigation Bar / Brand Switcher */}
      <div className="bg-[#121316] text-[#F8FAFC] p-4 sm:p-5 rounded-2xl shadow-xl border border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold border flex items-center gap-1 shadow-sm"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                borderColor: `${accentColor}40`,
              }}
            >
              <Crown className="w-3 h-3" /> Respected Salon Concierge
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#18191C] text-slate-400 border border-[#27272A]">
              0% Marketplace Fee
            </span>
          </div>

          <h2 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            {activeSalon.name}
          </h2>
          <p className="text-xs text-[#949BA4] font-mono">
            Direct Concierge:{" "}
            <span className="underline font-bold" style={{ color: accentColor }}>
              {activeSalon.slug || "salon"}.billcare.io
            </span>
          </p>
        </div>

        {/* Respected Salon Quick Switcher & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10 w-full md:w-auto">
          {/* Respected Salon Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-[#18191C] px-3 py-2 rounded-xl border border-[#27272A] text-xs font-mono text-[#DBDEE1]">
            <Building2 className="w-3.5 h-3.5 text-[#949BA4]" />
            <span className="text-[#949BA4] text-[11px] hidden sm:inline">Salon:</span>
            <select
              value={activeSalonSlug}
              onChange={(e) => {
                setActiveSalonSlug(e.target.value);
                setStep(1);
                setConfirmed(false);
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {RESPECTED_SALONS.map((s) => (
                <option key={s.slug} value={s.slug} className="bg-[#18191C] text-white">
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Copy Direct Link */}
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-[#18191C] hover:bg-[#232428] text-xs font-mono text-white rounded-xl border border-[#27272A] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Copy shareable client booking link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#949BA4]" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Discord Banner Customizer Trigger Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02]"
            style={{
              backgroundColor: accentColor,
              color: "#080808",
            }}
          >
            <Palette className="w-3.5 h-3.5 text-[#080808]" />
            <span>Customize Banner</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-black/20 text-[#080808]">
              Nitro
            </span>
          </button>
        </div>
      </div>

      {/* Branded Salon Profile Card with Discord-Style Choosable Banner */}
      <div className="rounded-2xl overflow-hidden border border-[#27272A] bg-[#111214] shadow-2xl">
        {/* DISCORD-STYLE HERO COVER BANNER */}
        <div
          className="h-56 sm:h-64 md:h-72 relative transition-all duration-500 overflow-hidden group"
          style={bannerStyle}
        >
          {/* Subtle gradient darkening at bottom for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/40 to-transparent pointer-events-none" />

          {/* Top banner badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Reservations Active
              </span>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#FACC15] border border-[#FACC15]/30 items-center gap-1 shadow-lg">
                <Zap className="w-3 h-3 fill-[#FACC15]" /> Discord Boost Level 3
              </span>
            </div>

            {/* Quick edit banner hover button on banner (Discord Profile style) */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-xs font-mono border border-white/20 transition-all flex items-center gap-1.5 shadow-xl cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#FACC15]" />
              <span className="hidden sm:inline font-bold">Edit Salon Banner</span>
            </button>
          </div>

          {/* Bottom Banner Info: Salon details */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
            {/* Salon Logo Avatar + Title */}
            <div className="flex items-end gap-4">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-[#111214] border-4 border-[#111214] overflow-hidden shadow-2xl relative shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: `0 0 30px ${accentColor}40` }}
              >
                <img
                  src={activeSalon.logo || activeSalon.logoUrl || "/images/billcare-logo.png"}
                  alt={activeSalon.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#23A55A] border-3 border-[#111214]"
                  title="Salon Open · Accepting Walk-ins & Bookings"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    {activeSalon.name}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-[#5865F2] shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-[#DBDEE1] line-clamp-1 font-sans">
                  {activeSalon.tagline}
                </p>
                <p className="text-[11px] sm:text-xs text-[#949BA4] flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span className="line-clamp-1">{activeSalon.address}</span>
                </p>
              </div>
            </div>

            {/* Rating & Verified Review Badge */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <div className="bg-[#18191C]/90 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-[#27272A] text-center shadow-xl">
                <div
                  className="text-xs font-mono font-bold flex items-center justify-center gap-1"
                  style={{ color: accentColor }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{activeSalon.rating || 4.95}</span>
                </div>
                <div className="text-[10px] text-[#949BA4] font-mono mt-0.5">
                  {activeSalon.reviewCount || 428} Verified Reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discord Banner Quick Presets Strip */}
        <div className="bg-[#18191C] px-4 py-2.5 border-b border-[#27272A] flex items-center justify-between gap-3 text-xs font-mono overflow-x-auto">
          <div className="flex items-center gap-2 text-[#949BA4] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#5865F2]" />
            <span className="hidden sm:inline font-bold text-white">Discord Themes:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {DISCORD_BANNER_PRESETS.slice(0, 6).map((preset) => {
              const isActive = activeSalon.bannerPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    updateSalonProfile({
                      bannerPreset: preset.id,
                      bannerGradient: "",
                      bannerUrl: "",
                      accentColor: preset.accentColor,
                    });
                    showToast(`Applied ${preset.name} theme!`, "info");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isActive
                      ? "border-white bg-[#232428] text-white font-bold ring-1 ring-white/30"
                      : "border-[#27272A] bg-[#111214] text-[#949BA4] hover:text-white hover:bg-[#232428]"
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span>{preset.name.split(" ")[0]}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="text-[11px] text-[#5865F2] hover:underline font-bold px-2 py-1 shrink-0 cursor-pointer"
            >
              More Themes (12) →
            </button>
          </div>
        </div>

        {/* Booking Wizard Content */}
        <div className="p-4 sm:p-8 md:p-10">
          {!confirmed ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Stepper Progress */}
              <div className="flex items-center justify-between max-w-lg mx-auto text-xs font-mono uppercase tracking-wider text-[#71717A] px-1 border-b border-[#27272A] pb-4">
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    step >= 1 ? "font-bold text-white" : ""
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 1 ? "text-[#080808]" : "bg-[#18191C] text-[#71717A]"
                    }`}
                    style={step >= 1 ? { backgroundColor: accentColor } : {}}
                  >
                    1
                  </span>
                  <span>1. Treatment</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#27272A]" />
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    step >= 2 ? "font-bold text-white" : ""
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 2 ? "text-[#080808]" : "bg-[#18191C] text-[#71717A]"
                    }`}
                    style={step >= 2 ? { backgroundColor: accentColor } : {}}
                  >
                    2
                  </span>
                  <span>2. Master Artist</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#27272A]" />
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    step >= 3 ? "font-bold text-white" : ""
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= 3 ? "text-[#080808]" : "bg-[#18191C] text-[#71717A]"
                    }`}
                    style={step >= 3 ? { backgroundColor: accentColor } : {}}
                  >
                    3
                  </span>
                  <span>3. Schedule &amp; Pass</span>
                </div>
              </div>

              {/* Step 1: Select Service */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                        Curated Treatment Menu
                      </h3>
                      <p className="text-xs text-[#949BA4]">
                        Select the bespoke treatment you wish to reserve at {activeSalon.name}
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-[#949BA4] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search treatments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#18191C] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] focus:border-[#5865F2] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? "text-[#080808] shadow-md"
                              : "bg-[#18191C] text-[#949BA4] hover:text-white border border-[#27272A]"
                          }`}
                          style={isActive ? { backgroundColor: accentColor } : {}}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredServices.map((srv) => {
                      const isSelected = selectedServiceId === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between border ${
                            isSelected
                              ? "bg-[#18191C] shadow-xl"
                              : "bg-[#141518] border-[#27272A] hover:border-[#383A40] hover:bg-[#18191C]/60"
                          }`}
                          style={
                            isSelected
                              ? {
                                  borderColor: accentColor,
                                  boxShadow: `0 0 20px ${accentColor}15`,
                                }
                              : {}
                          }
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span
                                className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold"
                                style={{
                                  backgroundColor: `${accentColor}15`,
                                  color: accentColor,
                                  borderColor: `${accentColor}30`,
                                }}
                              >
                                {srv.category}
                              </span>
                              <span className="text-xs text-[#949BA4] font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#949BA4]" /> {srv.durationMinutes} mins
                              </span>
                            </div>
                            <h4 className="font-bold text-[#F8FAFC] text-sm mt-3">{srv.name}</h4>
                            <p className="text-xs text-[#949BA4] mt-1 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                            <span
                              className="text-base font-mono font-bold"
                              style={{ color: accentColor }}
                            >
                              {formatCurrency(srv.price)}
                            </span>
                            <span
                              className={`text-xs font-mono uppercase tracking-wider font-bold ${
                                isSelected ? "" : "text-[#71717A]"
                              }`}
                              style={isSelected ? { color: accentColor } : {}}
                            >
                              {isSelected ? "✓ Selected" : "Select"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-7 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                      style={{
                        backgroundColor: accentColor,
                        color: "#080808",
                      }}
                    >
                      <span>Continue to Artist Selection</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Stylist */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                        Select Master Specialist
                      </h3>
                      <p className="text-xs text-[#949BA4]">
                        Choose the artist you want dedicated to your appointment session
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-mono hover:underline cursor-pointer"
                      style={{ color: accentColor }}
                    >
                      ← Change Treatment
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableStaff.map((st) => {
                      const isSelected = selectedStaffId === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStaffId(st.id)}
                          className={`p-5 rounded-xl transition-all cursor-pointer flex items-center gap-4 border ${
                            isSelected
                              ? "bg-[#18191C] shadow-xl"
                              : "bg-[#141518] border-[#27272A] hover:border-[#383A40] hover:bg-[#18191C]/60"
                          }`}
                          style={
                            isSelected
                              ? {
                                  borderColor: accentColor,
                                  boxShadow: `0 0 20px ${accentColor}15`,
                                }
                              : {}
                          }
                        >
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#27272A] shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-[#F8FAFC] text-sm">{st.name}</h4>
                            <p className="text-xs text-[#949BA4] font-mono">{st.role}</p>
                            <div
                              className="text-[11px] font-mono flex items-center gap-1 mt-1 font-bold"
                              style={{ color: accentColor }}
                            >
                              <Star className="w-3 h-3 fill-current" />
                              <span>{st.rating} Verified Master</span>
                            </div>
                            {st.specialty && (
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {st.specialty.slice(0, 2).map((sp) => (
                                  <span
                                    key={sp}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111214] text-[#DBDEE1] border border-[#27272A]"
                                  >
                                    {sp}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div
                            className="text-sm font-mono font-bold"
                            style={isSelected ? { color: accentColor } : { color: "#27272A" }}
                          >
                            {isSelected ? "✓" : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3 bg-[#18191C] hover:bg-[#27272A] text-[#DBDEE1] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#27272A] cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-7 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                      style={{
                        backgroundColor: accentColor,
                        color: "#080808",
                      }}
                    >
                      <span>Continue to Time Slot</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Date, Time & WhatsApp Digital Pass */}
              {step === 3 && (
                <form onSubmit={handleConfirmBooking} className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                        Select Date &amp; Time
                      </h3>
                      <p className="text-xs text-[#949BA4]">
                        Real-time chair calendar slot locking at {activeSalon.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-mono hover:underline cursor-pointer"
                      style={{ color: accentColor }}
                    >
                      ← Change Artist
                    </button>
                  </div>

                  {/* Date pills */}
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-xs font-mono">
                    {[
                      "Today, Oct 12",
                      "Tomorrow, Oct 13",
                      "Wed, Oct 14",
                      "Thu, Oct 15",
                      "Fri, Oct 16",
                      "Sat, Oct 17",
                    ].map((d) => {
                      const isSelected = selectedDate === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? "text-[#080808] font-bold shadow-lg"
                              : "bg-[#18191C] text-[#949BA4] border border-[#27272A] hover:text-[#F8FAFC]"
                          }`}
                          style={isSelected ? { backgroundColor: accentColor } : {}}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-xs font-mono">
                    {[
                      "10:00 AM",
                      "11:30 AM",
                      "01:00 PM",
                      "02:30 PM",
                      "04:00 PM",
                      "05:30 PM",
                      "07:00 PM",
                      "08:15 PM",
                    ].map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={`py-3 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                            isSelected
                              ? "text-[#080808] font-bold shadow-md"
                              : "bg-[#18191C] text-[#949BA4] border-[#27272A] hover:text-[#F8FAFC]"
                          }`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: accentColor,
                                  borderColor: accentColor,
                                }
                              : {}
                          }
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary Box */}
                  <div className="p-5 bg-[#18191C] rounded-xl border border-[#27272A] text-xs space-y-2">
                    <div className="flex justify-between font-bold text-[#F8FAFC] text-sm">
                      <span>{selectedService.name}</span>
                      <span className="font-mono" style={{ color: accentColor }}>
                        {formatCurrency(selectedService.price)}
                      </span>
                    </div>
                    <div className="text-[#949BA4] flex items-center justify-between font-mono">
                      <span>
                        Specialist:{" "}
                        <strong className="text-[#F8FAFC] font-bold">{selectedStaff.name}</strong>
                      </span>
                      <span style={{ color: accentColor }}>
                        {selectedDate} at {selectedTime}
                      </span>
                    </div>
                    <div className="text-[#71717A] text-[11px] pt-2 border-t border-[#27272A] font-mono">
                      Location: {activeSalon.address}
                    </div>
                  </div>

                  {/* Client Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-mono text-[#949BA4] text-[11px] block mb-1.5 uppercase tracking-wider">
                        Client Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shalini Roy"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#18191C] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:border-[#5865F2] focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[#949BA4] text-[11px] block mb-1.5 uppercase tracking-wider">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98450..."
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#18191C] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:border-[#5865F2] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 bg-[#18191C] hover:bg-[#27272A] text-[#DBDEE1] font-bold text-xs uppercase tracking-wider rounded-xl border border-[#27272A] cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                      style={{
                        backgroundColor: accentColor,
                        color: "#080808",
                      }}
                    >
                      <span>Confirm &amp; Reserve Chair</span>
                      <CheckCircle2 className="w-4 h-4 text-[#080808]" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Booking Confirmed State */
            <div className="text-center py-10 space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border inline-block mb-2"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                    borderColor: `${accentColor}40`,
                  }}
                >
                  Pass Ref: #{confirmationCode || "BC-789211"}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                  Reservation Confirmed!
                </h2>
                <p className="text-xs text-[#949BA4] mt-1 leading-relaxed">
                  Thank you, <strong className="text-white">{clientName}</strong>! Your seat has been reserved at{" "}
                  <strong className="text-white">{activeSalon.name}</strong>. A digital booking pass and WhatsApp reminder has been dispatched to{" "}
                  <strong className="font-mono text-white">{clientPhone}</strong>.
                </p>
              </div>

              {/* Digital Pass Ticket Card */}
              <div className="p-6 bg-[#18191C] rounded-2xl border border-[#27272A] text-xs text-left space-y-3 shadow-2xl relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none opacity-20"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div>
                    <h5 className="font-bold text-white text-sm">{activeSalon.name}</h5>
                    <span className="text-[10px] text-[#949BA4] font-mono">{activeSalon.branch}</span>
                  </div>
                  <div
                    className="p-2 rounded-xl bg-black/40 border border-white/10"
                    title="Digital Pass Barcode"
                  >
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="font-bold text-[#F8FAFC] text-sm">{selectedService.name}</div>
                  <div className="text-[#949BA4] font-mono flex items-center justify-between">
                    <span>
                      Specialist: <strong className="text-white">{selectedStaff.name}</strong>
                    </span>
                    <span className="font-bold font-mono" style={{ color: accentColor }}>
                      {formatCurrency(selectedService.price)}
                    </span>
                  </div>
                  <div className="font-mono font-bold" style={{ color: accentColor }}>
                    🗓️ {selectedDate} at {selectedTime}
                  </div>
                  <div className="text-[#71717A] text-[11px] pt-2 border-t border-[#27272A] font-mono">
                    📍 {activeSalon.address}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setConfirmed(false);
                    setStep(1);
                    setClientName("");
                    setClientPhone("");
                  }}
                  className="w-full sm:w-auto px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                  style={{
                    backgroundColor: accentColor,
                    color: "#080808",
                  }}
                >
                  Book Another Appointment
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-5 py-3 bg-[#18191C] hover:bg-[#232428] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl border border-[#27272A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Salon Link</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discord Banner Customizer Modal */}
      <DiscordBannerCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        salon={activeSalon}
        onSave={handleSaveBanner}
      />
    </div>
  );
}
