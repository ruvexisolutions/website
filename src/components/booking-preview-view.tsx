"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { resolveSalonBannerStyle } from "@/lib/banner-presets";
import {
  Sparkles,
  Scissors,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  Star,
  MapPin,
  Crown,
  Copy,
  Check,
  Search,
  MessageCircle,
  ExternalLink,
  Navigation,
  BadgeCheck,
  ArrowRight,
  RefreshCw,
  X,
  Plus,
  AlertCircle,
  User,
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
    salon: ctxSalon,
    services: ctxServices = [],
    staff: ctxStaff = [],
    isAuthenticated,
    refreshWorkspace,
    showToast,
  } = useRuvexi();

  const [pickedSlug, setPickedSlug] = useState<string>("");
  const [directorySalons, setDirectorySalons] = useState<any[]>([]);
  const [publicSalon, setPublicSalon] = useState<any>(null);
  const [publicServices, setPublicServices] = useState<any[]>([]);
  const [publicStaff, setPublicStaff] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Array<{ staffId?: string; staffName?: string; startTime?: string; endTime?: string }>>([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState<boolean>(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

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
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, []);

  const targetSlug = salonSlug || pickedSlug || (!isStandalone ? ctxSalon?.slug || "" : "");

  // Load salon directory when public user opens /book without ?salon=
  useEffect(() => {
    if (!isStandalone || salonSlug || pickedSlug) return;
    let active = true;
    setIsLoadingRemote(true);
    setRemoteError(null);
    RuvexiApi.getPublicSalons()
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res?.salons) ? res.salons : [];
        setDirectorySalons(list);
        if (list.length === 1 && list[0]?.slug) {
          setPickedSlug(list[0].slug);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (isAuthenticated && ctxSalon?.slug) {
          setPickedSlug(ctxSalon.slug);
        } else {
          setRemoteError(err?.message || "Unable to load salon booking directory.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingRemote(false);
      });
    return () => {
      active = false;
    };
  }, [isStandalone, salonSlug, pickedSlug, isAuthenticated, ctxSalon?.slug]);

  // Load public salon details, bookable services, staff, and open slots for selectedDate
  useEffect(() => {
    if (!targetSlug) return;
    if (!isStandalone && isAuthenticated && !salonSlug) return;
    let active = true;
    setIsLoadingRemote(true);
    setRemoteError(null);
    RuvexiApi.getPublicSalon(targetSlug, selectedDate || undefined)
      .then((res) => {
        if (!active) return;
        if (res?.salon) setPublicSalon(res.salon);
        if (Array.isArray(res?.services)) setPublicServices(res.services);
        if (Array.isArray(res?.staff)) setPublicStaff(res.staff);
        if (Array.isArray(res?.bookedSlots)) setBookedSlots(res.bookedSlots);
      })
      .catch((err) => {
        if (!active) return;
        setRemoteError(err?.message || "Studio booking page could not be found.");
      })
      .finally(() => {
        if (active) setIsLoadingRemote(false);
      });
    return () => {
      active = false;
    };
  }, [targetSlug, selectedDate, isStandalone, isAuthenticated, salonSlug]);

  const salon = publicSalon || ctxSalon;
  const services = publicSalon ? publicServices : ctxServices;
  const staff = publicSalon ? publicStaff : ctxStaff;

  const salonName = salon?.name || "RUVEXI Studio";
  const salonBranch = salon?.branch || "Flagship Studio";
  const salonCity = salon?.city || "";
  const salonAddress = salon?.address || "Salon Address";
  const salonPhone = salon?.phone || "";
  const salonRating = salon?.rating || 4.9;
  const salonReviews = salon?.reviewCount || 0;
  const salonTiming = salon?.timing || "10:00 AM – 09:00 PM";
  const salonTagline = salon?.tagline || "Bespoke Hair, Skin & Wellness Sanctuary";
  const heroStyle = resolveSalonBannerStyle(salon || {});
  const customLogo =
    salon?.logoUrl &&
    salon.logoUrl !== "/logo.png" &&
    salon.logoUrl !== "/images/ruvexi-logo.png"
      ? salon.logoUrl
      : null;

  const cleanPhoneDigits = salonPhone.replace(/\D/g, "");
  const waSalonDigits =
    cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}` : cleanPhoneDigits;

  const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${salonName} ${salonAddress} ${salonCity}`
  )}`;
  const whatsappSalonUrl = waSalonDigits
    ? `https://wa.me/${waSalonDigits}?text=${encodeURIComponent(
        `Hello ${salonName}, I would like to book an appointment.`
      )}`
    : undefined;

  const activeBookingSlug = salon?.slug || targetSlug || "studio";
  const publicBookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/${activeBookingSlug}`
      : `https://ruvexi.netlify.app/book/${activeBookingSlug}`;

  const copyBookingLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicBookingUrl);
      setIsCopied(true);
      showToast?.("Booking link copied to clipboard!", "success");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        activeCategory === "all" || s.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchQuery]);

  const selectedServiceObjs = useMemo(
    () => services.filter((s) => selectedServices.includes(s.id)),
    [services, selectedServices]
  );

  const totalPrice = useMemo(
    () => selectedServiceObjs.reduce((sum, s) => sum + (Number(s.price) || 0), 0),
    [selectedServiceObjs]
  );

  const totalDuration = useMemo(
    () =>
      selectedServiceObjs.reduce(
        (sum, s) => sum + (Number(s.durationMinutes || s.duration || s.durationMin) || 45),
        0
      ),
    [selectedServiceObjs]
  );

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const availableDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        iso: d.toISOString().split("T")[0],
        weekday: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return list;
  }, []);

  const timeGroups = [
    {
      label: "Morning",
      slots: ["10:00 AM", "10:45 AM", "11:30 AM"],
    },
    {
      label: "Afternoon",
      slots: ["12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    {
      label: "Evening",
      slots: ["04:45 PM", "06:00 PM", "07:15 PM", "08:00 PM"],
    },
  ];

  const parseTime12hTo24hMinutes = (raw: string) => {
    const m = raw.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
    if (!m) return 11 * 60;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const mer = m[3];
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return h * 60 + min;
  };

  const isSlotBooked = (slotLabel: string) => {
    if (!bookedSlots.length) return false;
    const slotStart = parseTime12hTo24hMinutes(slotLabel);
    const slotEnd = slotStart + (totalDuration || 45);
    return bookedSlots.some((b) => {
      if (selectedStaff !== "any" && b.staffId && b.staffId !== selectedStaff) return false;
      const bStart = parseTime12hTo24hMinutes(b.startTime || "11:00");
      const bEnd = parseTime12hTo24hMinutes(b.endTime || "11:45");
      return slotStart < bEnd && slotEnd > bStart;
    });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientName.trim()) {
      setFormError("Please enter your full name to reserve the appointment.");
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, "").length < 10) {
      setFormError("Please enter a valid 10-digit WhatsApp / mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const slugForBooking = salon?.slug || targetSlug;
      if (isStandalone || publicSalon) {
        if (!slugForBooking) {
          throw new Error("Please select a salon before confirming your appointment.");
        }
        const res = await RuvexiApi.createPublicBooking(slugForBooking, {
          customerName: clientName.trim(),
          customerPhone: clientPhone.trim(),
          serviceIds: selectedServices,
          serviceId: selectedServices[0] || "",
          serviceName: selectedServiceObjs.map((s) => s.name).join(" + ") || "Salon Treatment",
          date: selectedDate,
          startTime: selectedTime || "11:00 AM",
          time: selectedTime || "11:00 AM",
          notes: clientNotes.trim(),
          staffId: selectedStaff !== "any" ? selectedStaff : staff[0]?.id || "any",
          staffName: staff.find((s) => s.id === selectedStaff)?.name || "Senior Specialist",
          price: totalPrice,
          durationMinutes: totalDuration,
        });
        setBookingPassCode(res.bookingCode || `RX-${Math.floor(100000 + Math.random() * 900000)}`);
        if (isAuthenticated && refreshWorkspace) {
          refreshWorkspace();
        }
      } else {
        const created = await RuvexiApi.createAppointment({
          customerName: clientName.trim(),
          customerPhone: clientPhone.trim(),
          serviceId: selectedServices[0] || "",
          serviceName: selectedServiceObjs.map((s) => s.name).join(" + ") || "Salon Treatment",
          date: selectedDate,
          startTime: selectedTime || "11:00 AM",
          time: selectedTime || "11:00 AM",
          notes: clientNotes.trim(),
          staffId: selectedStaff !== "any" ? selectedStaff : staff[0]?.id || "",
          staffName: staff.find((s) => s.id === selectedStaff)?.name || "Senior Specialist",
          status: "Confirmed",
          price: totalPrice,
          durationMinutes: totalDuration,
        });
        setBookingPassCode(`RX-${String(created?.id || "").slice(-6).toUpperCase() || Math.floor(100000 + Math.random() * 900000)}`);
        refreshWorkspace?.();
      }
      setStep("confirmation");
    } catch (err: any) {
      setFormError(err?.message || "Could not complete booking. Please try another time slot or retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedServices([]);
    setSelectedStaff("any");
    setSelectedTime("");
    setClientName("");
    setClientPhone("");
    setClientNotes("");
    setFormError(null);
    setStep("services");
    setBookingPassCode("");
  };

  const selectedStylistLabel =
    selectedStaff === "any"
      ? "Any Available Specialist"
      : staff.find((s) => s.id === selectedStaff)?.name || "Specialist";

  return (
    <div className="w-full max-w-6xl mx-auto font-sans text-[#F8FAFC] space-y-6 pb-20 lg:pb-8">
      {/* Top Share Bar when viewed inside Manager Console */}
      {!isStandalone && (
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#F8FAFC] text-sm">Public Client Booking Page</h3>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Online
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Clients see your live theme banner, logo, treatments, and open chair slots here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={copyBookingLink}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A] transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#A1A1AA]" />}
              {isCopied ? "Link Copied!" : "Copy Booking Link"}
            </button>
            <a
              href={`/book/${activeBookingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] transition-all shadow-lg shadow-[#FACC15]/10"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live Page
            </a>
          </div>
        </div>
      )}

      {/* Directory picker when visiting /book without a specific salon slug */}
      {isStandalone && !targetSlug && (
        <div className="bg-[#101010] border border-[#27272A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div>
            <h2 className="text-xl font-serif font-bold text-white">Choose a Partner Salon</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">Select a luxury salon studio below to view live services and reserve an appointment.</p>
          </div>
          {isLoadingRemote ? (
            <div className="py-12 text-center text-xs text-[#A1A1AA]">Loading available salons...</div>
          ) : remoteError ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{remoteError}</div>
          ) : directorySalons.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717A]">No salons have published online booking yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {directorySalons.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPickedSlug(s.slug)}
                  className="text-left p-5 rounded-2xl bg-[#151515] hover:bg-[#1A1A1D] border border-[#27272A] hover:border-[#FACC15] transition-all space-y-2 cursor-pointer"
                >
                  <div className="text-sm font-bold text-white">{s.name}</div>
                  <div className="text-xs text-[#A1A1AA]">{s.city || s.branch || "Studio"}</div>
                  <div className="text-[11px] font-mono text-[#FACC15] pt-1">Book Online →</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isStandalone && targetSlug && remoteError && !publicSalon && (
        <div className="bg-[#101010] border border-rose-500/30 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Booking Page Unavailable</h2>
          <p className="text-xs text-[#A1A1AA]">{remoteError}</p>
        </div>
      )}

      {!(isStandalone && (!targetSlug || (Boolean(remoteError) && !publicSalon))) && (
        <>
          {/* 1. DYNAMIC STUDIO HERO BANNER CARD */}
          <div className="bg-[#101010] border border-[#27272A] rounded-3xl overflow-hidden shadow-2xl">
        {/* Salon Custom Banner Cover */}
        <div
          className="h-44 sm:h-52 w-full relative flex items-end p-6 sm:p-8"
          style={heroStyle}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/45 to-black/20" />

          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Salon Logo Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#101010] border-2 border-[#27272A] shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {customLogo ? (
                  <img src={customLogo} alt={salonName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#FACC15]">
                    {salonName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                    <BadgeCheck className="w-3 h-3" /> Verified Studio
                  </span>
                  {salonRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/50 text-[#F8FAFC] border border-white/10">
                      <Star className="w-3 h-3 fill-[#FACC15] text-[#FACC15]" />
                      <span>{salonRating}</span>
                      {salonReviews > 0 && <span className="text-[#A1A1AA]">({salonReviews})</span>}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  {salonName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">{salonTagline}</p>
              </div>
            </div>

            {/* Direct Concierge Contact Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {cleanPhoneDigits && (
                <a
                  href={`tel:${cleanPhoneDigits}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#181818]/90 hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A] transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Call</span>
                </a>
              )}
              {whatsappSalonUrl && (
                <a
                  href={whatsappSalonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Studio Quick Metadata Strip */}
        <div className="px-6 sm:px-8 py-4 bg-[#121212] border-t border-[#27272A] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#A1A1AA]">
            <MapPin className="w-4 h-4 text-[#FACC15] shrink-0" />
            <div className="min-w-0">
              <span className="text-[#F8FAFC] font-medium truncate block">
                {salonAddress}{salonCity ? `, ${salonCity}` : ""}
              </span>
              <a
                href={mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#FACC15] hover:underline inline-flex items-center gap-1"
              >
                <Navigation className="w-2.5 h-2.5" /> Directions
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[#A1A1AA]">
            <Clock className="w-4 h-4 text-[#FACC15] shrink-0" />
            <div>
              <span className="text-[#F8FAFC] font-medium block">{salonTiming}</span>
              <span className="text-[11px] text-emerald-400">Accepting online bookings</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[#A1A1AA]">
            <Phone className="w-4 h-4 text-[#FACC15] shrink-0" />
            <div>
              <span className="text-[#F8FAFC] font-mono font-semibold block">
                {salonPhone || salonBranch}
              </span>
              <span className="text-[11px] text-[#71717A]">Zero booking fees • Pay at studio</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STEP PROGRESS INDICATOR */}
      {step !== "confirmation" && (
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-2 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          {[
            { id: "services", num: 1, label: "Choose Treatments", disabled: false },
            {
              id: "datetime",
              num: 2,
              label: "Stylist, Date & Time",
              disabled: selectedServices.length === 0,
            },
            {
              id: "details",
              num: 3,
              label: "Guest Details",
              disabled: selectedServices.length === 0 || !selectedTime,
            },
          ].map((item) => {
            const isActive = step === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => setStep(item.id as any)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-[#FACC15] text-[#080808] font-bold shadow-sm"
                    : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#181818]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive ? "bg-[#080808] text-[#FACC15]" : "bg-[#181818] border border-[#27272A]"
                  }`}
                >
                  {item.num}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. MAIN WORKSPACE: STEP CONTENT + STICKY APPOINTMENT SUMMARY */}
      {step === "confirmation" ? (
        <div className="max-w-xl mx-auto bg-[#101010] border border-[#27272A] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#FACC15] font-bold">
              Reservation Confirmed
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">
              We look forward to hosting you, {clientName}
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Your chair at <b className="text-white">{salonName}</b> is reserved.
            </p>
          </div>

          {/* Booking Pass Card */}
          <div className="rounded-2xl bg-[#151515] border border-[#27272A] p-5 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717A] block">Salon</span>
                <span className="text-sm font-serif font-bold text-white">{salonName}</span>
                <span className="text-[11px] text-[#A1A1AA] block">{salonAddress}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#FACC15] block">Pass Code</span>
                <span className="text-sm font-mono font-bold text-[#FACC15]">{bookingPassCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717A] block">Date &amp; Slot</span>
                <span className="font-semibold text-white">{selectedDate} • {selectedTime}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717A] block">Specialist</span>
                <span className="font-semibold text-white">{selectedStylistLabel}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717A] block">Treatments</span>
                <span className="font-semibold text-white">
                  {selectedServiceObjs.map((s) => s.name).join(", ")}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717A] block">Estimated Total</span>
                <span className="font-mono font-bold text-[#FACC15]">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs">
              <a
                href={mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#FACC15] hover:underline font-medium"
              >
                <Navigation className="w-3.5 h-3.5" /> Directions
              </a>
              {cleanPhoneDigits && (
                <a
                  href={`tel:${cleanPhoneDigits}`}
                  className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-white"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FACC15]" /> {salonPhone}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {waSalonDigits && (
              <a
                href={`https://wa.me/${waSalonDigits}?text=${encodeURIComponent(
                  `Hi ${salonName}, I just booked appointment ${bookingPassCode} for ${clientName} (${selectedServiceObjs.map((s) => s.name).join(", ")}) on ${selectedDate} at ${selectedTime}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-[#080808] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Send Confirmation to Salon WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-5 py-3 rounded-xl text-xs font-semibold bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A] transition-all cursor-pointer"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLS: STEP CONTENT */}
          <div className="lg:col-span-8 bg-[#101010] border border-[#27272A] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl">
            {step === "services" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#F8FAFC]">Select Services</h2>
                    <p className="text-xs text-[#71717A]">Tap one or more treatments to add to your session</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="text"
                      placeholder="Search treatments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#151515] border border-[#27272A] focus:border-[#FACC15] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-[#FACC15] text-[#080808] font-bold"
                          : "bg-[#151515] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#27272A]"
                      }`}
                    >
                      {cat === "all" ? "All Treatments" : cat}
                    </button>
                  ))}
                </div>

                {/* Treatment Cards */}
                {filteredServices.length === 0 ? (
                  <div className="py-12 text-center bg-[#151515] border border-dashed border-[#27272A] rounded-2xl space-y-2">
                    <Scissors className="w-8 h-8 text-[#71717A] mx-auto" />
                    <p className="text-xs text-[#A1A1AA]">
                      {services.length === 0
                        ? "No services added to the studio catalog yet."
                        : "No services match your current filter."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredServices.map((svc) => {
                      const isSelected = selectedServices.includes(svc.id);
                      const dur = Number(svc.durationMinutes || svc.duration || svc.durationMin) || 45;
                      return (
                        <div
                          key={svc.id}
                          onClick={() => toggleService(svc.id)}
                          className={`group cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? "bg-[#FACC15]/10 border-[#FACC15] shadow-md shadow-[#FACC15]/5"
                              : "bg-[#151515] hover:bg-[#181818] border-[#27272A] hover:border-[#3F3F46]"
                          }`}
                        >
                          <div className="space-y-2">
                            {svc.imageUrl && (
                              <div className="h-28 rounded-xl overflow-hidden border border-[#27272A] bg-[#101010]">
                                <img
                                  src={svc.imageUrl}
                                  alt={svc.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FACC15]">
                                  {svc.category || "Treatment"}
                                </span>
                                <h3 className="text-sm font-bold text-[#F8FAFC] leading-snug">
                                  {svc.name}
                                </h3>
                              </div>
                              <span className="text-sm font-mono font-bold text-[#FACC15] shrink-0">
                                {formatCurrency(Number(svc.price) || 0)}
                              </span>
                            </div>

                            {svc.description && (
                              <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                                {svc.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2.5 border-t border-[#27272A] flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-[#A1A1AA] font-mono text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
                              {dur} min
                            </span>

                            <span
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                                isSelected
                                  ? "bg-[#FACC15] text-[#080808]"
                                  : "bg-[#181818] text-[#F8FAFC] border border-[#27272A]"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3 h-3" /> Selected
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> Add
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === "datetime" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#F8FAFC]">Pick Specialist, Date &amp; Time</h2>
                    <p className="text-xs text-[#71717A]">Choose your preferred chair time slot</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("services")}
                    className="text-xs text-[#A1A1AA] hover:text-white underline cursor-pointer"
                  >
                    Edit Services
                  </button>
                </div>

                {/* Stylists */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    1. Select Specialist
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStaff("any")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedStaff === "any"
                          ? "bg-[#FACC15]/10 border-[#FACC15]"
                          : "bg-[#151515] border-[#27272A] hover:border-[#3F3F46]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FACC15]/15 text-[#FACC15] flex items-center justify-center mb-2">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-[#F8FAFC]">Any Specialist</p>
                      <p className="text-[10px] text-[#71717A]">Fastest slot</p>
                    </button>

                    {staff.slice(0, 7).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStaff(st.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedStaff === st.id
                            ? "bg-[#FACC15]/10 border-[#FACC15]"
                            : "bg-[#151515] border-[#27272A] hover:border-[#3F3F46]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center font-bold text-xs mb-2">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-bold text-[#F8FAFC] truncate">{st.name}</p>
                        <p className="text-[10px] text-[#71717A] truncate">{st.role || "Stylist"}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    2. Select Date
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {availableDates.map((item) => {
                      const isSelected = selectedDate === item.iso;
                      return (
                        <button
                          key={item.iso}
                          type="button"
                          onClick={() => setSelectedDate(item.iso)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center cursor-pointer ${
                            isSelected
                              ? "bg-[#FACC15] text-[#080808] font-bold border-[#FACC15]"
                              : "bg-[#151515] border-[#27272A] hover:border-[#3F3F46] text-[#A1A1AA]"
                          }`}
                        >
                          <span className="text-[10px] uppercase">{item.weekday}</span>
                          <span className="text-base font-bold font-mono">{item.dayNum}</span>
                          <span className="text-[10px]">{item.month}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grouped Time Slots */}
                <div className="space-y-3">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    3. Select Time Slot
                  </label>
                  <div className="space-y-3">
                    {timeGroups.map((group) => (
                      <div key={group.label} className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[#71717A] uppercase">{group.label}</span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {group.slots.map((slot) => {
                            const isSelected = selectedTime === slot;
                            const taken = isSlotBooked(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={taken}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2.5 px-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                                  taken
                                    ? "bg-[#101010] border-[#1F1F23] text-[#52525B] line-through cursor-not-allowed"
                                    : isSelected
                                      ? "bg-[#FACC15] text-[#080808] border-[#FACC15] font-bold cursor-pointer"
                                      : "bg-[#151515] border-[#27272A] text-[#F8FAFC] hover:border-[#FACC15]/50 cursor-pointer"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (
              <form id="booking-guest-form" onSubmit={handleConfirmBooking} noValidate className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#F8FAFC]">Your Contact Details</h2>
                    <p className="text-xs text-[#71717A]">Used solely for your booking confirmation &amp; chair reminders</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("datetime")}
                    className="text-xs text-[#A1A1AA] hover:text-white underline cursor-pointer"
                  >
                    Change Slot
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#A1A1AA] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#151515] border border-[#27272A] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#A1A1AA] mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-[#151515] border border-[#27272A] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-mono text-[11px] uppercase text-[#A1A1AA] mb-1">
                    Styling Notes or Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Allergies, preferred product brand, or look inspiration..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-[#151515] border border-[#27272A] focus:border-[#FACC15] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] focus:outline-none resize-none"
                  />
                </div>
              </form>
            )}
          </div>

          {/* RIGHT 4 COLS: STICKY BOOKING SUMMARY CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 bg-[#101010] border border-[#27272A] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-base text-[#F8FAFC]">Your Booking Summary</h3>
              <span className="text-xs font-mono text-[#FACC15]">
                {selectedServices.length} item{selectedServices.length === 1 ? "" : "s"}
              </span>
            </div>

            {selectedServiceObjs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#71717A] border border-dashed border-[#27272A] rounded-2xl">
                Select at least one treatment on the left to build your visit.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {selectedServiceObjs.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3 bg-[#151515] border border-[#27272A] rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#F8FAFC] truncate">{svc.name}</div>
                      <div className="text-[10px] font-mono text-[#71717A]">
                        {Number(svc.durationMinutes || svc.duration || 45)} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-[#FACC15]">
                        {formatCurrency(Number(svc.price) || 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className="p-1 text-[#71717A] hover:text-rose-400 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Slot Summary */}
            {(selectedDate || selectedTime) && selectedServices.length > 0 && (
              <div className="p-3 bg-[#151515] border border-[#27272A] rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FACC15]" /> Stylist
                  </span>
                  <span className="text-[#F8FAFC] font-medium truncate max-w-[150px]">
                    {selectedStylistLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FACC15]" /> Date &amp; Time
                  </span>
                  <span className="text-[#F8FAFC] font-mono text-[11px]">
                    {selectedDate} {selectedTime ? `• ${selectedTime}` : "(Select slot)"}
                  </span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-[#27272A] space-y-1.5">
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Estimated Duration</span>
                <span className="font-mono">{totalDuration} mins</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#F8FAFC]">Total Estimate</span>
                <span className="text-xl font-mono font-bold text-[#FACC15]">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Primary Step Action */}
            {step === "services" && (
              <button
                type="button"
                disabled={selectedServices.length === 0}
                onClick={() => setStep("datetime")}
                className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Choose Date &amp; Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === "datetime" && (
              <button
                type="button"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep("details")}
                className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{selectedTime ? "Enter Guest Details" : "Select a Time Slot"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === "details" && (
              <button
                type="submit"
                form="booking-guest-form"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-60 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reserving Chair...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Reservation</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
