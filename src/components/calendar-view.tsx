"use client";

import React, { useState } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import { Appointment, CustomerProfile } from "@/lib/types";
import { ClientFormulaModal } from "./client-formula-modal";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Phone,
  Scissors,
  X,
  Crown,
  Grid3X3,
  Columns,
  CalendarDays,
  Search,
  AlertTriangle,
  Send,
  UserCheck,
} from "lucide-react";

interface CalendarViewProps {
  onGoToPosBilling?: (customerName: string, serviceName: string, staffName: string) => void;
}

export function CalendarView({ onGoToPosBilling }: CalendarViewProps) {
  const {
    appointments,
    staff,
    services,
    customers,
    invoices,
    updateCustomer,
    updateAppointmentStatus,
    bookAppointment,
    sendWhatsAppReminder,
  } = useBillCare();

  // View state: "day" (timeline matrix), "week" (7-day column view), or "cards"
  const [viewMode, setViewMode] = useState<"day" | "week" | "cards">("day");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<any>(null);
  const [activeFormulaCustomer, setActiveFormulaCustomer] = useState<CustomerProfile | null>(null);
  const [bookingConflictError, setBookingConflictError] = useState<string | null>(null);

  // New appointment form state
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("+91 98");
  const [serviceName, setServiceName] = useState(services[0]?.name || "Keratin Treatment");
  const [staffName, setStaffName] = useState(staff[0]?.name || "Priya Sharma");
  const [timeSlot, setTimeSlot] = useState("02:00 PM");
  const [bookingNotes, setBookingNotes] = useState("");

  // Date Navigation State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formattedDateHeader = selectedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timelineHours = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
  ];

  // Filtering appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStaff = selectedStaffFilter === "All" || apt.staffName === selectedStaffFilter;
    const matchesStatus = selectedStatusFilter === "All" || apt.status === selectedStatusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerPhone.includes(searchQuery) ||
      apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const srv = services.find((s) => s.name === apt.serviceName);
    const matchesCategory =
      selectedCategoryFilter === "All" || (srv && srv.category === selectedCategoryFilter);

    return matchesStaff && matchesStatus && matchesSearch && matchesCategory;
  });

  // Double Booking Prevention
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConflictError(null);

    if (!custName.trim()) {
      setBookingConflictError("Please provide a valid client name.");
      return;
    }

    // Check if staff already has an active appointment in the selected hour slot
    const hasConflict = appointments.some(
      (a) =>
        a.staffName === staffName &&
        a.time === timeSlot &&
        a.status !== "Cancelled"
    );

    if (hasConflict) {
      setBookingConflictError(
        `Double-booking conflict: ${staffName} is already occupied at ${timeSlot}. Please choose a different stylist or time slot.`
      );
      return;
    }

    const srv = services.find((s) => s.name === serviceName);
    const st = staff.find((s) => s.name === staffName);

    bookAppointment({
      customerName: custName,
      customerPhone: custPhone,
      serviceName,
      staffName,
      staffId: st?.id || staff[0].id,
      time: timeSlot,
      durationMinutes: srv?.durationMinutes || 60,
      price: srv?.price || 2000,
      source: "Front Desk Booking",
      notes: bookingNotes,
    });

    setShowBookModal(false);
    setCustName("");
    setCustPhone("+91 98");
    setBookingNotes("");
  };

  const handleOpenFormulaCard = (customerName: string) => {
    const found = customers.find(
      (c) => c.name.toLowerCase() === customerName.toLowerCase()
    );

    if (found) {
      setActiveFormulaCustomer(found as any);
    } else {
      setActiveFormulaCustomer({
        id: "temp_" + Date.now(),
        name: customerName,
        phone: "+91 98000 00000",
        email: "guest@luxehaven.in",
        gender: "Female",
        visitsCount: 1,
        totalSpent: 3000,
        loyaltyPoints: 50,
        lastVisitDate: "Today",
        lastService: "Salon Treatment",
        preferredStaff: staff[0].name,
        tags: ["First Visit", "Formula Card Pending"],
        notes: "First time consultation at Luxe Haven.",
        formulaNotes: "Patch test pending. Consultation in progress.",
        patchTestStatus: "Valid",
      });
    }
  };

  const getAppointmentForSlotAndStaff = (slotTime: string, stName: string) => {
    const slotHourPrefix = slotTime.split(":")[0];
    const slotPeriod = slotTime.slice(-2);

    return filteredAppointments.find((apt) => {
      if (apt.staffName !== stName) return false;
      const aptHourPrefix = apt.time.split(":")[0];
      const aptPeriod = apt.time.slice(-2);
      return aptHourPrefix === slotHourPrefix && aptPeriod === slotPeriod;
    });
  };

  const visibleStaff =
    selectedStaffFilter === "All"
      ? staff
      : staff.filter((s) => s.name === selectedStaffFilter);

  return (
    <div className="space-y-6 text-[#F8FAFC]">
      {/* ============================================================ */}
      {/* HEADER & TOP CONTROLS */}
      {/* ============================================================ */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-medium text-[#F8FAFC] tracking-tight">
                Appointment Calendar & Chair Schedule
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                Live Roster
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Multi-stylist timeline matrix • Real-time status transitions • Double-booking prevention
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#151515] p-1 rounded-xl border border-[#27272A] text-xs">
            <button
              onClick={() => setViewMode("day")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "day"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Day Timeline
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "week"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Week View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "cards"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Card List
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-[#151515] p-1 rounded-xl border border-[#27272A] text-xs">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C] rounded-lg transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="font-mono text-xs font-semibold px-2 py-1 text-[#F8FAFC] hover:text-[#FACC15] transition-colors"
              title="Jump to Today"
            >
              {formattedDateHeader}
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C] rounded-lg transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            id="calendar-new-appointment-btn"
            onClick={() => {
              setBookingConflictError(null);
              setShowBookModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER BAR: Staff, Status, Category & Search */}
      {/* ============================================================ */}
      <div className="bg-[#101010] border border-[#27272A] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search by Customer / Phone */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]/50 w-44 sm:w-56"
            />
          </div>

          {/* Stylist Filter */}
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-[#151515] border border-[#27272A] text-xs text-[#F8FAFC] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#FACC15]/50"
          >
            <option value="All">All Stylists ({staff.length})</option>
            {staff.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#151515] border border-[#27272A] text-xs text-[#F8FAFC] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#FACC15]/50"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In-Service">In-Service</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Status Legend Pills */}
        <div className="flex items-center gap-3 text-xs font-mono font-medium">
          <span className="flex items-center gap-1.5 text-[#60A5FA]">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" /> Confirmed
          </span>
          <span className="flex items-center gap-1.5 text-[#FACC15]">
            <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" /> In Chair
          </span>
          <span className="flex items-center gap-1.5 text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Completed
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VIEW MODE 1: DAY TIMELINE MATRIX */}
      {/* ============================================================ */}
      {viewMode === "day" && (
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <div className={visibleStaff.length === 1 ? "min-w-full" : "min-w-[850px]"}>
              {/* Columns Header (Stylists) */}
              <div
                className="grid bg-[#151515] border-b border-[#27272A] text-xs sticky top-0 z-20"
                style={{
                  gridTemplateColumns: `90px repeat(${visibleStaff.length}, minmax(180px, 1fr))`,
                }}
              >
                <div className="p-3 font-mono font-semibold text-[#71717A] uppercase tracking-wider text-xs flex items-center justify-center border-r border-[#27272A] sticky left-0 z-30 bg-[#151515]">
                  Time
                </div>
                {visibleStaff.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 border-r border-[#27272A] last:border-r-0 flex items-center justify-between gap-2 bg-[#151515]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-[#27272A] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#F8FAFC] truncate">{st.name}</h4>
                        <span className="text-[10px] text-[#71717A] block truncate">
                          {st.role}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        st.status === "clocked_in" ? "bg-[#10B981]" : "bg-[#FACC15]"
                      }`}
                      title={st.status}
                    />
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="divide-y divide-[#27272A]">
                {timelineHours.map((hour) => (
                  <div
                    key={hour}
                    className="grid min-h-[96px] transition-colors"
                    style={{
                      gridTemplateColumns: `90px repeat(${visibleStaff.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    {/* Time Label Column (Sticky) */}
                    <div className="p-2 sm:p-3 font-mono text-[#71717A] text-xs bg-[#101010]/95 border-r border-[#27272A] flex items-start justify-center pt-3.5 sticky left-0 z-10 backdrop-blur-sm">
                      {hour}
                    </div>

                    {/* Staff Columns for this Hour */}
                    {visibleStaff.map((st) => {
                      const apt = getAppointmentForSlotAndStaff(hour, st.name);

                      return (
                        <div
                          key={st.id}
                          className="p-2 border-r border-[#27272A] last:border-r-0 relative group hover:bg-[#151515]/40 transition-colors flex flex-col justify-center"
                        >
                          {apt ? (
                            <div
                              onClick={() => setSelectedAppointmentForDetail(apt)}
                              className={`p-3 rounded-xl border transition-all shadow-sm cursor-pointer ${
                                apt.status === "Completed"
                                  ? "bg-[#10B981]/10 border-[#10B981]/30 hover:border-[#10B981]/50 text-[#F8FAFC]"
                                  : apt.status === "In-Service"
                                  ? "bg-[#FACC15]/10 border-[#FACC15]/40 text-[#F8FAFC] ring-1 ring-[#FACC15]/30 hover:ring-[#FACC15]/60"
                                  : "bg-[#151515] border-[#27272A] hover:border-[#60A5FA]/40 text-[#F8FAFC]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#101010] border border-[#27272A] text-[#F8FAFC]">
                                  {apt.time}
                                </span>
                                <span
                                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border ${
                                    apt.status === "Completed"
                                      ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30"
                                      : apt.status === "In-Service"
                                      ? "bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/30 animate-pulse"
                                      : "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30"
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </div>

                              <h5 className="font-semibold text-xs text-[#F8FAFC] leading-snug line-clamp-1">
                                {apt.customerName}
                              </h5>
                              <p className="text-[11px] text-[#A1A1AA] line-clamp-1 mt-0.5">
                                {apt.serviceName}
                              </p>

                              <div className="mt-2 pt-2 border-t border-[#27272A] flex items-center justify-between text-xs">
                                <span className="font-mono text-[#FACC15] font-semibold tabular-nums">
                                  {formatCurrency(apt.price)}
                                </span>

                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleOpenFormulaCard(apt.customerName)}
                                    className="p-1 hover:bg-[#1C1C1C] rounded-lg text-[#FACC15] transition-colors border border-[#27272A]"
                                    title="View Technical Formula Card"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>

                                  {onGoToPosBilling && (
                                    <button
                                      onClick={() =>
                                        onGoToPosBilling(
                                          apt.customerName,
                                          apt.serviceName,
                                          apt.staffName
                                        )
                                      }
                                      className="px-2 py-0.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] rounded-lg text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <Receipt className="w-3 h-3" /> Pay
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setStaffName(st.name);
                                setTimeSlot(hour);
                                setBookingConflictError(null);
                                setShowBookModal(true);
                              }}
                              className="w-full h-16 rounded-xl border border-dashed border-[#27272A] hover:border-[#FACC15]/40 text-[#71717A] hover:text-[#FACC15] flex items-center justify-center gap-1 text-[11px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Reserve
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW MODE 2: WEEK COLUMN VIEW */}
      {/* ============================================================ */}
      {viewMode === "week" && (
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, idx) => {
              const isToday = idx === 1; // demo highlight
              const dayAppointments = filteredAppointments.filter((_, aIdx) => aIdx % 7 === idx);

              return (
                <div
                  key={dayName}
                  className={`p-3.5 rounded-xl border ${
                    isToday
                      ? "bg-[#151515] border-[#FACC15]/40 shadow-sm"
                      : "bg-[#101010] border-[#27272A]"
                  } space-y-3 min-h-[360px] flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                      <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
                        {dayName}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayAppointments.length === 0 ? (
                        <p className="text-[11px] text-[#71717A] italic py-4 text-center">
                          No bookings
                        </p>
                      ) : (
                        dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointmentForDetail(apt)}
                            className="p-2 rounded-lg bg-[#151515] hover:bg-[#1C1C1C] border border-[#27272A] cursor-pointer text-xs space-y-1 transition-all"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="text-[#FACC15]">{apt.time}</span>
                              <span
                                className={`px-1 rounded text-[9px] ${
                                  apt.status === "Completed"
                                    ? "text-[#10B981]"
                                    : "text-[#60A5FA]"
                                }`}
                              >
                                {apt.status}
                              </span>
                            </div>
                            <div className="font-medium text-[#F8FAFC] truncate">
                              {apt.customerName}
                            </div>
                            <div className="text-[10px] text-[#71717A] truncate">
                              {apt.serviceName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowBookModal(true);
                    }}
                    className="w-full py-1.5 rounded-lg border border-dashed border-[#27272A] hover:border-[#FACC15]/40 text-[#71717A] hover:text-[#FACC15] text-[10px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Slot
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW MODE 3: CARD LIST VIEW */}
      {/* ============================================================ */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => setSelectedAppointmentForDetail(apt)}
              className="p-5 rounded-2xl bg-[#101010] border border-[#27272A] hover:border-[#FACC15]/40 transition-all cursor-pointer space-y-3.5 shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-[#151515] border border-[#27272A] font-mono text-xs text-[#FACC15]">
                  {apt.time}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    apt.status === "Completed"
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                      : apt.status === "In-Service"
                      ? "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30 animate-pulse"
                      : "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30"
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#F8FAFC] group-hover:text-[#FACC15] transition-colors">
                  {apt.customerName}
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#71717A]" />
                  {apt.customerPhone}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Service</span>
                  <span className="text-[#F8FAFC] font-medium">{apt.serviceName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Stylist</span>
                  <span className="text-[#FACC15] font-medium">{apt.staffName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                <span className="font-mono text-sm text-[#FACC15] font-bold tabular-nums">
                  {formatCurrency(apt.price)}
                </span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => sendWhatsAppReminder(apt)}
                    className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#1C1C1C] border border-[#27272A] transition-colors"
                    title="Send WhatsApp Reminder"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenFormulaCard(apt.customerName)}
                    className="p-1.5 rounded-lg text-[#FACC15] hover:bg-[#1C1C1C] border border-[#27272A]"
                    title="Formula Card"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  {onGoToPosBilling && (
                    <button
                      onClick={() =>
                        onGoToPosBilling(
                          apt.customerName,
                          apt.serviceName,
                          apt.staffName
                        )
                      }
                      className="px-3 py-1 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-lg transition-all"
                    >
                      Checkout
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* APPOINTMENT DETAILS DRAWER / MODAL */}
      {/* ============================================================ */}
      {selectedAppointmentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#151515] border border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#FACC15]" />
                <h3 className="font-serif text-lg font-medium text-[#F8FAFC]">
                  Appointment Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointmentForDetail(null)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#101010] border border-[#27272A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A] font-mono uppercase text-[10px]">Client</span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                      selectedAppointmentForDetail.status === "Completed"
                        ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                        : "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30"
                    }`}
                  >
                    {selectedAppointmentForDetail.status}
                  </span>
                </div>
                <div className="text-base font-semibold text-[#F8FAFC]">
                  {selectedAppointmentForDetail.customerName}
                </div>
                <div className="text-[#A1A1AA] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                  {selectedAppointmentForDetail.customerPhone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#101010] border border-[#27272A]">
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Service</span>
                  <span className="text-xs font-semibold text-[#F8FAFC] block mt-0.5">
                    {selectedAppointmentForDetail.serviceName}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101010] border border-[#27272A]">
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Stylist</span>
                  <span className="text-xs font-semibold text-[#FACC15] block mt-0.5">
                    {selectedAppointmentForDetail.staffName}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101010] border border-[#27272A]">
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Time Slot</span>
                  <span className="text-xs font-mono font-semibold text-[#F8FAFC] block mt-0.5">
                    {selectedAppointmentForDetail.time}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101010] border border-[#27272A]">
                  <span className="text-[10px] text-[#71717A] uppercase font-mono block">Ticket Price</span>
                  <span className="text-xs font-mono font-bold text-[#FACC15] block mt-0.5">
                    {formatCurrency(selectedAppointmentForDetail.price)}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#71717A]">
                  Operational State Transition
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointmentForDetail.id, "In-Service");
                      setSelectedAppointmentForDetail(null);
                    }}
                    className="p-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] border border-[#27272A] text-[#FACC15] font-semibold text-center transition-colors"
                  >
                    Start In-Chair
                  </button>
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointmentForDetail.id, "Completed");
                      setSelectedAppointmentForDetail(null);
                    }}
                    className="p-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] border border-[#27272A] text-[#10B981] font-semibold text-center transition-colors"
                  >
                    Mark Done
                  </button>
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointmentForDetail.id, "Cancelled");
                      setSelectedAppointmentForDetail(null);
                    }}
                    className="p-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] border border-[#27272A] text-[#F87171] font-semibold text-center transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenFormulaCard(selectedAppointmentForDetail.customerName)}
                  className="px-3 py-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] text-[#FACC15] border border-[#27272A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Formula Notes</span>
                </button>

                <button
                  onClick={() => {
                    sendWhatsAppReminder(selectedAppointmentForDetail);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Send 1-Click WhatsApp Appointment Reminder"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Send Reminder</span>
                </button>
              </div>

              {onGoToPosBilling && (
                <button
                  onClick={() => {
                    const apt = selectedAppointmentForDetail;
                    setSelectedAppointmentForDetail(null);
                    onGoToPosBilling(apt.customerName, apt.serviceName, apt.staffName);
                  }}
                  className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Send to POS Billing</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* NEW APPOINTMENT MODAL WITH DOUBLE-BOOKING CHECK */}
      {/* ============================================================ */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#151515] border border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#FACC15]" />
                <h3 className="font-serif text-lg font-medium text-[#F8FAFC]">
                  Book New Appointment
                </h3>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConflictError && (
              <div className="p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingConflictError}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alia Bhatt"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                    Select Service
                  </label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({formatCurrency(s.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                    Assigned Stylist
                  </label>
                  <select
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  >
                    {staff.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                >
                  {timelineHours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#71717A] block mb-1">
                  Consultation Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needs patch test / Prefer ammonia-free color"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101010] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div className="pt-3 border-t border-[#27272A] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Formula Modal */}
      {activeFormulaCustomer && (
        <ClientFormulaModal
          customer={activeFormulaCustomer}
          invoices={invoices}
          onClose={() => setActiveFormulaCustomer(null)}
          onUpdateFormula={(cid, formula) => {
            updateCustomer(cid, { formulaNotes: formula });
            setActiveFormulaCustomer(null);
          }}
        />
      )}
    </div>
  );
}
