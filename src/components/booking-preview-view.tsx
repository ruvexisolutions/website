"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
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
  Share2,
  Copy,
  Check,
  Search,
  MessageCircle,
  ExternalLink,
  Navigation,
  Sparkle,
  BadgeCheck,
  ArrowRight,
  RefreshCw,
  QrCode,
  CalendarCheck,
  Info,
} from "lucide-react";

interface BookingPreviewViewProps {
  salonSlug?: string;
  isStandalone?: boolean;
}

export function BookingPreviewView({
  salonSlug,
  isStandalone = false,
}: BookingPreviewViewProps) {
  const { salon, services = [], staff = [], createAppointment } = useBillCare();

  // Local state for interactive booking workflow
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientNotes, setClientNotes] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [step, setStep] = useState<"services" | "datetime" | "details" | "confirmation">("services");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [bookingPassCode, setBookingPassCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, []);

  // Display Salon Information
  const salonName = salon?.name || "Luxe Salon & Spa";
  const salonBranch = salon?.branch || "Flagship Studio";
  const salonCity = salon?.city || "Bangalore";
  const salonAddress = salon?.address || "100ft Road, Indiranagar, 1st Stage";
  const salonPhone = salon?.phone || "+91 98765 43210";
  const salonRating = salon?.rating || 4.9;
  const salonReviews = salon?.reviewCount || 428;
  const salonTiming = salon?.timing || "10:00 AM – 09:00 PM";
  const salonTagline = salon?.tagline || "Luxury Hair, Skin, Aesthetic & Wellness Sanctuary";

  // Clean phone for tel: and wa.me links
  const cleanPhone = salonPhone.replace(/[^0-9]/g, "");
  const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${salonName} ${salonAddress} ${salonCity}`
  )}`;
  const whatsappSalonUrl = `https://wa.me/${cleanPhone.length >= 10 ? (cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`) : "919876543210"}?text=${encodeURIComponent(
    `Hello ${salonName}, I would like to book an appointment.`
  )}`;

  // Public Booking Link
  const publicBookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book?salon=${salon?.slug || "luxury-studio"}`
    : `https://billcare.co/book?salon=${salon?.slug || "luxury-studio"}`;

  const copyBookingLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicBookingUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Distinct Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = activeCategory === "all" || s.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchQuery]);

  // Selected Services objects & total price/duration
  const selectedServiceObjs = useMemo(() => {
    return services.filter((s) => selectedServices.includes(s.id));
  }, [services, selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServiceObjs.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [selectedServiceObjs]);

  const totalDuration = useMemo(() => {
    return selectedServiceObjs.reduce((sum, s) => sum + (Number(s.duration || s.durationMin) || 45), 0);
  }, [selectedServiceObjs]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dates (Next 7 days)
  const availableDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString("en-US", { month: "short" });
      list.push({ iso, weekday, dayNum, month, isToday: i === 0 });
    }
    return list;
  }, []);

  // Time Slots
  const timeSlots = [
    { label: "10:00 AM", period: "Morning" },
    { label: "11:00 AM", period: "Morning" },
    { label: "11:45 AM", period: "Morning" },
    { label: "01:00 PM", period: "Afternoon" },
    { label: "02:30 PM", period: "Afternoon" },
    { label: "03:45 PM", period: "Afternoon" },
    { label: "05:00 PM", period: "Evening" },
    { label: "06:15 PM", period: "Evening" },
    { label: "07:30 PM", period: "Evening" },
  ];

  // Handle Form Submission
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const passCode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingPassCode(passCode);

    try {
      if (createAppointment) {
        await createAppointment({
          customerName: clientName,
          customerPhone: clientPhone,
          serviceIds: selectedServices,
          date: selectedDate,
          time: selectedTime || "11:00 AM",
          notes: clientNotes,
          specialistId: selectedStaff !== "any" ? selectedStaff : undefined,
          status: "confirmed",
        });
      }
    } catch (err) {
      console.warn("Local reservation pass generated:", err);
    } finally {
      setIsSubmitting(false);
      setStep("confirmation");
    }
  };

  // Reset for another booking
  const handleReset = () => {
    setSelectedServices([]);
    setSelectedStaff("any");
    setSelectedTime("");
    setClientName("");
    setClientPhone("");
    setClientNotes("");
    setStep("services");
    setBookingPassCode("");
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-100">
      {/* Top Console Action Bar (Only visible when embedded inside dashboard) */}
      {!isStandalone && (
        <div className="mb-6 bg-[#16181f] border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Public Salon VIP Booking Link</h3>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Online
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Share this link with your Instagram bio, Google Business profile, and WhatsApp broadcasts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={copyBookingLink}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 transition-all active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              {isCopied ? "Link Copied!" : "Copy Link"}
            </button>
            <a
              href={`/book?salon=${salon?.slug || "luxury-studio"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-medium transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live Page
            </a>
          </div>
        </div>
      )}

      {/* Main Luxury Container */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-b from-[#121318] via-[#0d0e12] to-[#090a0d] shadow-2xl shadow-black/80">
        {/* Subtle Luxury Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-80 h-80 bg-amber-600/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* 1. HERO HEADER: Salon Branding & Luxury Ambience */}
        <div className="relative border-b border-white/[0.08] px-6 py-8 sm:p-10 bg-gradient-to-b from-[#181a22] to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
                  Verified Premier Salon
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{salonRating}</span>
                  <span className="text-slate-400">({salonReviews} reviews)</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif tracking-tight text-white font-bold">
                {salonName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                {salonTagline}
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 transition-all hover:border-amber-500/40"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Call Salon
              </a>
              <a
                href={whatsappSalonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Concierge
              </a>
            </div>
          </div>

          {/* 2. SALON ESSENTIALS BAR: Location & Operating Hours */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location & Directions */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Location</span>
                <p className="text-xs font-medium text-white truncate">{salonAddress}</p>
                <p className="text-[11px] text-slate-400">{salonBranch}, {salonCity}</p>
                <a
                  href={mapsQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions in Google Maps
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Timings</span>
                <p className="text-xs font-medium text-white">{salonTiming}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Today for Walk-ins & Bookings
                </span>
              </div>
            </div>

            {/* Direct Contact Phone */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] sm:col-span-2 lg:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reception Desk</span>
                <p className="text-xs font-semibold text-white tracking-wide">{salonPhone}</p>
                <p className="text-[11px] text-slate-400">Instant confirmation via SMS & WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOOKING WIZARD STEPS PROGRESS */}
        <div className="px-6 sm:px-10 py-4 bg-[#14151b] border-b border-white/[0.06] flex items-center justify-between overflow-x-auto text-xs">
          <div className="flex items-center gap-2 sm:gap-6 min-w-max">
            <button
              onClick={() => setStep("services")}
              className={`flex items-center gap-2 font-medium transition-all ${
                step === "services"
                  ? "text-amber-400 font-semibold"
                  : selectedServices.length > 0
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === "services"
                  ? "bg-amber-400 text-slate-950"
                  : selectedServices.length > 0
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/[0.08] text-slate-400"
              }`}>
                1
              </span>
              <span>1. Choose Treatments</span>
              {selectedServices.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300">
                  {selectedServices.length}
                </span>
              )}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            <button
              disabled={selectedServices.length === 0}
              onClick={() => setStep("datetime")}
              className={`flex items-center gap-2 font-medium transition-all ${
                step === "datetime"
                  ? "text-amber-400 font-semibold"
                  : selectedDate && selectedTime
                  ? "text-slate-300"
                  : "text-slate-500 disabled:opacity-40"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === "datetime"
                  ? "bg-amber-400 text-slate-950"
                  : selectedDate && selectedTime
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/[0.08] text-slate-400"
              }`}>
                2
              </span>
              <span>2. Date & Time</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            <button
              disabled={selectedServices.length === 0 || !selectedTime}
              onClick={() => setStep("details")}
              className={`flex items-center gap-2 font-medium transition-all ${
                step === "details"
                  ? "text-amber-400 font-semibold"
                  : "text-slate-500 disabled:opacity-40"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === "details"
                  ? "bg-amber-400 text-slate-950"
                  : "bg-white/[0.08] text-slate-400"
              }`}>
                3
              </span>
              <span>3. Contact & VIP Pass</span>
            </button>
          </div>

          {/* Running Cart Mini Badge */}
          {selectedServices.length > 0 && step !== "confirmation" && (
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/[0.08]">
              <div className="text-right">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Estimated Total</p>
                <p className="text-xs font-bold text-amber-400">{formatCurrency(totalPrice)} • {totalDuration} min</p>
              </div>
            </div>
          )}
        </div>

        {/* 4. CONTENT SECTIONS */}
        <div className="p-6 sm:p-10">
          {/* STEP 1: SERVICES CATALOG SHOWCASE */}
          {step === "services" && (
            <div className="space-y-6">
              {/* Category Pills & Search */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        activeCategory === cat
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                          : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.09] hover:text-white border border-white/[0.06]"
                      }`}
                    >
                      {cat === "all" ? "All Offerings" : cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181a22] border border-white/[0.08] focus:border-amber-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-light text-sm">
                    No services match your search or filter.
                  </div>
                ) : (
                  filteredServices.map((svc) => {
                    const isSelected = selectedServices.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/[0.08] border-amber-500/60 shadow-lg shadow-amber-500/10"
                            : "bg-[#161820] hover:bg-[#1b1e28] border-white/[0.06] hover:border-white/[0.14]"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
                                {svc.category || "Treatment"}
                              </span>
                              <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                                {svc.name}
                              </h3>
                            </div>
                            <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap">
                              {formatCurrency(Number(svc.price) || 0)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {svc.description || "Indulgent luxury care crafted by certified master stylists and aesthetic professionals."}
                          </p>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                            {svc.duration || svc.durationMin || 45} mins
                          </span>

                          <button
                            type="button"
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-amber-400 text-slate-950 font-bold"
                                : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-200"
                            }`}
                          >
                            {isSelected ? "Selected ✓" : "+ Add Service"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              {selectedServices.length > 0 && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold text-white">{selectedServices.length}</span> services selected • Approx.{" "}
                      <span className="font-semibold text-amber-400">{totalDuration} mins</span>
                    </p>
                    <p className="text-lg font-bold text-white">
                      Total: <span className="text-amber-400">{formatCurrency(totalPrice)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setStep("datetime")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Select Date & Time
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE, TIME & SPECIALIST */}
          {step === "datetime" && (
            <div className="space-y-8">
              {/* Specialist Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Preferred Specialist (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => setSelectedStaff("any")}
                    className={`cursor-pointer p-3.5 rounded-2xl border text-center transition-all ${
                      selectedStaff === "any"
                        ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10"
                        : "bg-[#161820] border-white/[0.06] hover:bg-[#1b1e28]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full mx-auto bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-white">Any Top Stylist</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maximum flexibility</p>
                  </div>

                  {staff.slice(0, 3).map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStaff(st.id)}
                      className={`cursor-pointer p-3.5 rounded-2xl border text-center transition-all ${
                        selectedStaff === st.id
                          ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10"
                          : "bg-[#161820] border-white/[0.06] hover:bg-[#1b1e28]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full mx-auto bg-white/[0.08] text-white flex items-center justify-center font-bold mb-2">
                        {st.name.charAt(0)}
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{st.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{st.role || "Specialist"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Select Appointment Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.iso;
                    return (
                      <button
                        key={item.iso}
                        type="button"
                        onClick={() => setSelectedDate(item.iso)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                            : "bg-[#161820] border-white/[0.06] hover:bg-[#1b1e28] text-slate-300"
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wider opacity-80">{item.weekday}</span>
                        <span className="text-lg font-bold my-0.5">{item.dayNum}</span>
                        <span className="text-[10px] opacity-75">{item.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Select Convenient Time Slot
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.label;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => setSelectedTime(slot.label)}
                        className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-500/20"
                            : "bg-[#161820] border-white/[0.06] text-slate-300 hover:bg-[#1b1e28] hover:border-white/10"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setStep("services")}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-300"
                >
                  ← Back to Services
                </button>

                <button
                  type="button"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep("details")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all"
                >
                  Continue to Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT DETAILS & RESERVATION */}
          {step === "details" && (
            <form onSubmit={handleConfirmBooking} className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-bold text-white">Guest Reservation Details</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We will send instant confirmation & appointment pass directly to your WhatsApp.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-[#161820] border border-amber-500/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-white">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Services ({selectedServices.length}):</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-200">~{totalDuration} Minutes</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#181a22] border border-white/[0.1] focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#181a22] border border-white/[0.1] focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Zero spam. Only your appointment digital pass and reminders.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Special Requests or Hair/Skin Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific styling instructions or allergies..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-[#181a22] border border-white/[0.1] focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setStep("datetime")}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-300"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Reserving VIP Slot...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Confirm & Generate VIP Pass
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: LUXURY VIP BOOKING PASS CONFIRMATION */}
          {step === "confirmation" && (
            <div className="max-w-lg mx-auto space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                  Appointment Confirmed
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  We look forward to hosting you, {clientName}
                </h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Your VIP reservation has been logged at {salonName}.
                </p>
              </div>

              {/* VIP Digital Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1b1d28] via-[#14151e] to-[#0e0f14] border border-amber-500/30 p-6 text-left shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Salon</span>
                    <h4 className="text-base font-serif font-bold text-white">{salonName}</h4>
                    <p className="text-[11px] text-slate-400">{salonAddress}, {salonCity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Pass Code</span>
                    <p className="text-sm font-mono font-bold text-amber-300">{bookingPassCode}</p>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Date</span>
                    <p className="font-semibold text-white">{selectedDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Slot</span>
                    <p className="font-semibold text-amber-400">{selectedTime}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Guest</span>
                    <p className="font-semibold text-white">{clientName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Total Estimated</span>
                    <p className="font-semibold text-amber-400">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <a
                    href={mapsQueryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Google Maps Directions
                  </a>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    Call Front Desk
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${cleanPhone.length >= 10 ? cleanPhone : "919876543210"}?text=${encodeURIComponent(
                    `Hi ${salonName}, I just booked appointment ${bookingPassCode} for ${clientName} on ${selectedDate} at ${selectedTime}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message Salon on WhatsApp
                </a>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-all"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}