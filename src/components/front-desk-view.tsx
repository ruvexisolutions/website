"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  PlayCircle,
  Receipt,
  Phone,
  Scissors,
  X,
  MessageSquare,
  Sparkles,
  Users,
  Search,
  Check,
  ChevronRight,
  ArrowRight,
  QrCode,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Heart,
  Tag,
  AlertCircle,
  Armchair,
  Filter,
  RotateCcw,
  Banknote,
  Wallet,
  Coffee,
  AlertTriangle,
  Crown,
  BellRing,
  Hourglass,
  ArrowUpDown,
} from "lucide-react";
import QRCode from "qrcode";

interface FrontDeskViewProps {
  onNavigateTab: (tab: string) => void;
  onGoToPosBilling?: (customerName: string, serviceName: string, staffName: string) => void;
}

export function FrontDeskView({ onNavigateTab, onGoToPosBilling }: FrontDeskViewProps) {
  const {
    salon,
    appointments,
    staff,
    services,
    customers,
    updateAppointmentStatus,
    bookAppointment,
    createInvoice,
    showToast,
    currentShift,
    openRegisterShift,
    closeRegisterShift,
    appendServiceToAppointment,
    sendChairReadyWhatsApp,
  } = useBillCare();

  // Shift Cash Drawer Modal
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [openingFloatInput, setOpeningFloatInput] = useState<number>(2000);
  const [countedCashInput, setCountedCashInput] = useState<number>(0);
  const [shiftNotesInput, setShiftNotesInput] = useState<string>("");

  // Mid-service In-Chair Add-on Modal
  const [inChairAddonApt, setInChairAddonApt] = useState<any>(null);
  const [addonServiceName, setAddonServiceName] = useState<string>("");
  const [addonStaffName, setAddonStaffName] = useState<string>("");

  // Multi-tender Split details
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [dynamicUpiQrUrl, setDynamicUpiQrUrl] = useState<string>("");

  // Active status filter for appointments
  const [filterStatus, setFilterStatus] = useState<"All" | "Waiting" | "In-Service" | "Ready for Billing" | "Completed">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChairDetail, setSelectedChairDetail] = useState<any>(null);

  // Step 1: Customer Enters Salon Modal (Old vs New Auto-Detect)
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [lookupInput, setLookupInput] = useState("");
  const [detectedCustomer, setDetectedCustomer] = useState<any>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Form Fields
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("+91 ");
  const [walkInService, setWalkInService] = useState(services[0]?.name || "Haircut");
  const [walkInStaff, setWalkInStaff] = useState(staff[0]?.name || "Priya Sharma");
  const [walkInChair, setWalkInChair] = useState<number>(1);

  // Step 2 & 3: Fill Services Taken for In-Chair Client Modal
  const [serviceModalApt, setServiceModalApt] = useState<any>(null);
  const [selectedServiceList, setSelectedServiceList] = useState<string[]>([]);

  // Step 4: Billing with QR & Split Pay Modal
  const [billingApt, setBillingApt] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"UPI" | "Cash" | "Split" | "Wallet">("UPI");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [finalBillAmount, setFinalBillAmount] = useState<number>(0);

  // Step 5: WhatsApp Thank You Confirmation Modal
  const [whatsappSentModal, setWhatsappSentModal] = useState<{
    customerName: string;
    phone: string;
    amount: number;
    services: string;
    messageText: string;
  } | null>(null);

  // Keyboard Shortcuts & Search Input Ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when user is typing in form inputs
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key.toLowerCase() === "n" && !showWalkInModal && !serviceModalApt && !billingApt) {
        e.preventDefault();
        setShowWalkInModal(true);
        setLookupInput("");
        setDetectedCustomer(null);
        setIsNewCustomer(false);
      } else if (e.key === "/" && !showWalkInModal && !serviceModalApt && !billingApt) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setShowWalkInModal(false);
        setServiceModalApt(null);
        setBillingApt(null);
        setSelectedChairDetail(null);
        setWhatsappSentModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWalkInModal, serviceModalApt, billingApt]);

  // Counts based on actual business rules
  const waitingVisits = useMemo(
    () => appointments.filter((a) => a.status === "Confirmed" || (a.status as string) === "waiting"),
    [appointments]
  );
  const inServiceVisits = useMemo(
    () => appointments.filter((a) => a.status === "In-Service" || (a.status as string) === "in_service"),
    [appointments]
  );
  const completedVisits = useMemo(
    () => appointments.filter((a) => a.status === "Completed" || (a.status as string) === "completed"),
    [appointments]
  );

  const waitingCount = waitingVisits.length;
  const inServiceCount = inServiceVisits.length;
  const completedCount = completedVisits.length;

  // Filtered appointments queue
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Map status filter
      let matchesStatus = true;
      if (filterStatus === "Waiting") {
        matchesStatus = apt.status === "Confirmed" || (apt.status as string) === "waiting";
      } else if (filterStatus === "In-Service") {
        matchesStatus = apt.status === "In-Service" || (apt.status as string) === "in_service";
      } else if (filterStatus === "Ready for Billing") {
        matchesStatus = apt.status === "In-Service";
      } else if (filterStatus === "Completed") {
        matchesStatus = apt.status === "Completed" || (apt.status as string) === "completed";
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        apt.customerName?.toLowerCase().includes(q) ||
        apt.customerPhone?.toLowerCase().includes(q) ||
        apt.serviceName?.toLowerCase().includes(q) ||
        apt.staffName?.toLowerCase().includes(q) ||
        apt.id?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, filterStatus, searchQuery]);

  // Total salon chairs configuration
  const totalChairs = salon.chairs || 6;

  // Chair assignment mapping
  const chairAssignments = useMemo(() => {
    const chairsList = [];
    for (let i = 1; i <= totalChairs; i++) {
      // Find in-service appointment allotted to this chair or index
      const activeApt = inServiceVisits[i - 1];
      const assignedStylist = activeApt ? activeApt.staffName : staff[i - 1]?.name || null;
      const isOccupied = !!activeApt;
      const isUnavailable = !staff[i - 1] && i > staff.length && !activeApt;

      chairsList.push({
        chairNumber: i,
        name: `Chair ${i}`,
        status: isOccupied ? ("Occupied" as const) : isUnavailable ? ("Unavailable" as const) : ("Available" as const),
        appointment: activeApt || null,
        stylist: assignedStylist,
      });
    }
    return chairsList;
  }, [totalChairs, inServiceVisits, staff]);

  const availableChairsCount = chairAssignments.filter((c) => c.status === "Available").length;
  const occupiedChairsCount = chairAssignments.filter((c) => c.status === "Occupied").length;

  // Busy staff names
  const busyStaffNames = inServiceVisits.map((a) => a.staffName);
  const freeStaff = staff.filter((s) => (s.status === "clocked_in" || s.isClockedIn) && !busyStaffNames.includes(s.name));

  // Feature 2: Stylist turns today based on in-service or completed appointments
  const stylistTurns = useMemo(() => {
    const turnsMap: Record<string, number> = {};
    staff.forEach((st) => {
      turnsMap[st.name] = 0;
    });
    appointments.forEach((apt) => {
      if (apt.status === "In-Service" || apt.status === "Completed") {
        turnsMap[apt.staffName] = (turnsMap[apt.staffName] || 0) + 1;
      }
    });
    return turnsMap;
  }, [staff, appointments]);

  // Fair Turn Recommendation: Clocked-in, currently free, and lowest turns today
  const nextUpStylist = useMemo(() => {
    if (freeStaff.length === 0) return staff[0]?.name || "House Stylist";
    const sorted = [...freeStaff].sort((a, b) => {
      const turnsA = stylistTurns[a.name] || 0;
      const turnsB = stylistTurns[b.name] || 0;
      return turnsA - turnsB;
    });
    return sorted[0]?.name || freeStaff[0]?.name;
  }, [freeStaff, stylistTurns, staff]);

  // Feature 3: Wait-Time Estimator based on active in-chair appointments
  const estimatedWaitMinutes = useMemo(() => {
    if (availableChairsCount > 0) return 0;
    if (inServiceVisits.length === 0) return 10;
    return Math.max(5, Math.min(45, Math.round(inServiceVisits.length * 12)));
  }, [availableChairsCount, inServiceVisits]);

  // Auto-detect customer as receptionist types phone or name
  const handleLookupChange = (val: string) => {
    setLookupInput(val);
    const query = val.trim().toLowerCase();

    if (!query) {
      setDetectedCustomer(null);
      setIsNewCustomer(false);
      setWalkInName("");
      setWalkInPhone("+91 ");
      return;
    }

    const cleanInput = query.replace(/[^0-9]/g, "");

    // Check if phone or name matches existing customer
    const match = customers.find((c) => {
      const cPhoneClean = c.phone.replace(/[^0-9]/g, "");
      const matchesPhone = cleanInput.length >= 4 && cPhoneClean.includes(cleanInput);
      const matchesName = c.name.toLowerCase().includes(query);
      return matchesPhone || matchesName;
    });

    if (match) {
      setDetectedCustomer(match);
      setIsNewCustomer(false);
      setWalkInName(match.name);
      setWalkInPhone(match.phone);
      if (match.preferredStaff) {
        setWalkInStaff(match.preferredStaff);
      }
    } else {
      setDetectedCustomer(null);
      setIsNewCustomer(true);
      if (/^[0-9+ ]+$/.test(val)) {
        setWalkInPhone(val.startsWith("+91 ") ? val : "+91 " + val.replace(/^\+91\s*/, ""));
      } else {
        setWalkInName(val);
      }
    }
  };

  // Receptionist clicks "Allot Chair & Begin" in Walk-In Modal
  const handleAllotChairAndBegin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      showToast("Please enter customer name", "warning");
      return;
    }

    const matchedService = services.find((s) => s.name === walkInService);
    const servicePrice = matchedService?.price || 1500;
    const matchedStaff = staff.find((s) => s.name === walkInStaff) || staff[0];

    const newAptData = {
      customerId: detectedCustomer?.id || "cst_" + Date.now(),
      customerName: walkInName.trim(),
      customerPhone: walkInPhone.trim(),
      serviceId: matchedService?.id || "srv_1",
      serviceName: walkInService,
      staffId: matchedStaff?.id || "stf_1",
      staffName: walkInStaff,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      endTime: "12:00",
      durationMinutes: matchedService?.durationMinutes || 45,
      price: servicePrice,
      status: "In-Service",
      notes: `Walk-in client seated at Chair ${walkInChair}`,
      chairNumber: walkInChair,
    };

    bookAppointment(newAptData);
    setShowWalkInModal(false);
    showToast(`${walkInName} seated at Chair ${walkInChair} with ${walkInStaff}!`);
  };

  // Quick seat a waiting customer directly from chair panel
  const handleQuickSeatWaiting = (chairNum: number) => {
    if (waitingVisits.length === 0) {
      showToast("No waiting customers in the queue.", "info");
      return;
    }
    const firstWaiting = waitingVisits[0];
    updateAppointmentStatus(firstWaiting.id, "In-Service");
    showToast(`${firstWaiting.customerName} seated at Chair ${chairNum}!`);
  };

  // Open "Fill Services Taken" Modal
  const handleOpenServicesModal = (apt: any) => {
    setServiceModalApt(apt);
    setSelectedServiceList([apt.serviceName]);
  };

  const handleToggleService = (srvName: string) => {
    if (selectedServiceList.includes(srvName)) {
      if (selectedServiceList.length > 1) {
        setSelectedServiceList(selectedServiceList.filter((s) => s !== srvName));
      }
    } else {
      setSelectedServiceList([...selectedServiceList, srvName]);
    }
  };

  // Save selected services and go directly to billing
  const handleSaveServicesAndProceedToBill = () => {
    if (!serviceModalApt) return;
    const totalCalc = selectedServiceList.reduce((acc, sName) => {
      const match = services.find((s) => s.name === sName);
      return acc + (match?.price || 1500);
    }, 0);

    const updatedApt = {
      ...serviceModalApt,
      serviceName: selectedServiceList.join(" + "),
      price: totalCalc,
    };

    setServiceModalApt(null);
    handleOpenBillingModal(updatedApt);
  };

  const [billingCustomer, setBillingCustomer] = useState<any>(null);

  // Open Billing Modal
  const handleOpenBillingModal = (apt: any) => {
    setBillingApt(apt);
    setFinalBillAmount(apt.price);
    setUpiAmount(apt.price);
    setCashAmount(0);
    setWalletAmount(0);
    setPayMethod("UPI");
    const cust = customers.find(
      (c) =>
        c.name.toLowerCase() === apt.customerName.toLowerCase() ||
        c.phone.replace(/[^0-9]/g, "") === apt.customerPhone.replace(/[^0-9]/g, "")
    );
    setBillingCustomer(cust || null);
  };

  // Generate dynamic counter UPI QR
  useEffect(() => {
    const effUpi = payMethod === "Split" ? upiAmount : payMethod === "UPI" ? finalBillAmount : 0;
    if (billingApt && effUpi > 0 && salon.upiId) {
      const vpa = salon.upiId.trim();
      const payeeName = salon.paymentSettings?.upiPayeeName || salon.name;
      const ref = `BC-FD-${Date.now().toString().slice(-6)}`;
      const uri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${effUpi.toFixed(2)}&cu=INR&tn=${encodeURIComponent(ref)}`;
      QRCode.toDataURL(uri, { width: 180, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } })
        .then(setDynamicUpiQrUrl)
        .catch(() => setDynamicUpiQrUrl(""));
    } else {
      setDynamicUpiQrUrl("");
    }
  }, [billingApt, payMethod, upiAmount, finalBillAmount, salon.upiId, salon.paymentSettings?.upiPayeeName, salon.name]);

  // Handle Split amounts
  const handleCashChange = (val: number) => {
    setCashAmount(val);
  };

  const handleUpiChange = (val: number) => {
    setUpiAmount(val);
  };

  const handleWalletChange = (val: number) => {
    setWalletAmount(val);
  };

  // Receptionist finishes bill & triggers WhatsApp Thank You
  const handleCompleteBillAndSendWhatsApp = () => {
    if (!billingApt) return;

    createInvoice({
      customerId: billingCustomer?.id,
      customerName: billingApt.customerName,
      customerPhone: billingApt.customerPhone,
      items: [
        {
          id: "item_1",
          name: billingApt.serviceName,
          type: "service",
          price: finalBillAmount,
          quantity: 1,
          staffId: billingApt.staffId,
          staffName: billingApt.staffName,
        },
      ],
      subtotal: finalBillAmount,
      discount: 0,
      gstAmount: Math.round(finalBillAmount * 0.05),
      total: finalBillAmount,
      paymentMethod: payMethod,
      splitDetails:
        payMethod === "Split"
          ? { cash: cashAmount, upi: upiAmount, wallet: walletAmount }
          : undefined,
      paymentBreakdown:
        payMethod === "Split"
          ? { cash: cashAmount, upi: upiAmount, wallet: walletAmount }
          : undefined,
      status: "paid",
    });

    updateAppointmentStatus(billingApt.id, "Completed");

    const cleanPhone = billingApt.customerPhone.replace(/[^0-9]/g, "");
    const feedbackUrl = `https://billcare.io/feedback?name=${encodeURIComponent(
      billingApt.customerName
    )}&phone=${encodeURIComponent(cleanPhone)}&staff=${encodeURIComponent(
      billingApt.staffName
    )}&service=${encodeURIComponent(billingApt.serviceName)}`;

    const messageText = `Hi ${billingApt.customerName}! ✨ Thank you for visiting ${salon.name} today.

🧾 Bill: ${formatCurrency(finalBillAmount)} received via ${payMethod} for ${billingApt.serviceName}.
💇 Stylist: ${billingApt.staffName}

⭐ How was your service by ${billingApt.staffName}?
Tap here to rate in 10 seconds & unlock a 10% return voucher:
👉 ${feedbackUrl}

We look forward to seeing you again soon! 💇‍♀️✨`;

    setWhatsappSentModal({
      customerName: billingApt.customerName,
      phone: cleanPhone || "919845012890",
      amount: finalBillAmount,
      services: billingApt.serviceName,
      messageText,
    });

    setBillingApt(null);
    showToast(`Payment of ${formatCurrency(finalBillAmount)} recorded! Ready for WhatsApp message.`);
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "";
    const clean = phone.trim();
    if (clean.length < 8) return clean;
    return clean.slice(0, 7) + "••••" + clean.slice(-2);
  };

  return (
    <div className="space-y-5 text-[#F8FAFC]">
      {/* ============================================================ */}
      {/* 1. COMPACT TOP BANNER (Reduced by ~25%) */}
      {/* ============================================================ */}
      <section
        aria-label="Front Desk Terminal Header"
        className="relative overflow-hidden bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl shadow-sm"
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/[0.03] rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Logo + Brand info */}
          <div className="flex items-center gap-4">
            {/* Salon Logo Space */}
            <div className="shrink-0">
              {(salon as any).logoUrl ? (
                <img
                  src={(salon as any).logoUrl}
                  alt={`${salon.name} logo`}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-[#27272A] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1A1A0E] border border-[#FACC15]/30 flex items-center justify-center shadow-md">
                  <span className="text-[#FACC15] font-black text-xl sm:text-2xl leading-none select-none">
                    {(salon.name || "S")
                      .split(" ")
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Brand text */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>RECEPTIONIST FLOOR TERMINAL</span>
              </div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#FACC15] leading-tight">
                {salon.name || "Your Salon"}
              </h1>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#A1A1AA]">
                Front Desk
              </p>
              <p className="text-xs sm:text-sm text-[#A1A1AA] font-normal max-w-xl">
                Manage arrivals, services, and checkout in one place.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              onClick={() => {
                setShowWalkInModal(true);
                setLookupInput("");
                setDetectedCustomer(null);
                setIsNewCustomer(false);
              }}
              className="px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FACC15]/40"
              title="Add Walk-in Customer (Press N)"
            >
              <Plus className="w-4 h-4 text-[#080808]" />
              <span>+ Add Walk-in Customer</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-black/15 text-[#080808] rounded border border-black/10 font-bold">
                N
              </kbd>
            </button>

            <button
              onClick={() => onNavigateTab("pos")}
              className="px-4 py-2.5 bg-[#171717] hover:bg-[#1E1E1E] text-[#F8FAFC] font-medium text-xs rounded-xl border border-[#27272A] hover:border-[#FACC15]/40 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FACC15]/20"
            >
              <Receipt className="w-4 h-4 text-[#FACC15]" />
              <span>Quick Bill</span>
            </button>

            {/* Feature 1: Shift Cash Drawer Handover */}
            <button
              onClick={() => {
                setShowShiftModal(true);
                if (currentShift) {
                  setCountedCashInput(currentShift.expectedCash);
                } else {
                  setOpeningFloatInput(2000);
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentShift
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
              }`}
              title="Open or Close Register Shift & Reconcile Cash"
            >
              <Banknote className="w-4 h-4" />
              <span>
                {currentShift
                  ? `Shift Open: ${formatCurrency(currentShift.expectedCash)}`
                  : "Open Shift Drawer"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL STATUS CARDS */}
      {/* ============================================================ */}
      <section aria-label="Operational Status Counters" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Waiting Card */}
        <div
          onClick={() => setFilterStatus(filterStatus === "Waiting" ? "All" : "Waiting")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setFilterStatus(filterStatus === "Waiting" ? "All" : "Waiting");
            }
          }}
          className={`bg-[#151515] p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all ${
            filterStatus === "Waiting"
              ? "border-[#60A5FA] bg-[#181818] ring-1 ring-[#60A5FA]/30"
              : "border-[#27272A] hover:border-[#3F3F46]"
          }`}
          title="Filter queue by waiting customers"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
              WAITING
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#F8FAFC] mt-2 tabular-nums">
            {waitingCount}
          </div>
          <p className="text-xs text-[#A1A1AA] font-normal mt-1">Ready to be seated</p>
        </div>

        {/* In Service Card */}
        <div
          onClick={() => setFilterStatus(filterStatus === "In-Service" ? "All" : "In-Service")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setFilterStatus(filterStatus === "In-Service" ? "All" : "In-Service");
            }
          }}
          className={`bg-[#151515] p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all ${
            filterStatus === "In-Service"
              ? "border-[#FACC15] bg-[#181818] ring-1 ring-[#FACC15]/30"
              : "border-[#27272A] hover:border-[#3F3F46]"
          }`}
          title="Filter queue by customers currently receiving services"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
              IN SERVICE
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] animate-pulse" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#FACC15] mt-2 tabular-nums">
            {inServiceCount}
          </div>
          <p className="text-xs text-[#A1A1AA] font-normal mt-1">Services in progress</p>
        </div>

        {/* Completed Today Card */}
        <div
          onClick={() => setFilterStatus(filterStatus === "Completed" ? "All" : "Completed")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setFilterStatus(filterStatus === "Completed" ? "All" : "Completed");
            }
          }}
          className={`bg-[#151515] p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all ${
            filterStatus === "Completed"
              ? "border-[#10B981] bg-[#181818] ring-1 ring-[#10B981]/30"
              : "border-[#27272A] hover:border-[#3F3F46]"
          }`}
          title="Filter queue by today's completed visits"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
              COMPLETED TODAY
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#10B981] mt-2 tabular-nums">
            {completedCount}
          </div>
          <p className="text-xs text-[#A1A1AA] font-normal mt-1">View completed visits</p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. MAIN DESK SPLIT: CUSTOMER QUEUE (70%) + CHAIR BOARD (30%) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left ~70%: Customer Queue (Dominant Work Area) */}
        <section aria-label="Customer Queue" className="lg:col-span-8 space-y-4">
          <div className="bg-[#151515] border border-[#27272A] p-5 sm:p-6 rounded-2xl space-y-4">
            {/* Queue Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
              <div>
                <h2 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">
                  Customer Queue
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Track arrivals, service progress, and checkout.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search customer, stylist (Press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-[#111111] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15]"
                />
                {!searchQuery && (
                  <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono bg-[#181818] text-[#71717A] rounded border border-[#27272A] pointer-events-none">
                    /
                  </kbd>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F8FAFC]"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {(["All", "Waiting", "In-Service", "Ready for Billing", "Completed"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    filterStatus === st
                      ? "bg-[#FACC15] text-[#080808] border-[#FACC15] font-semibold"
                      : "bg-[#111111] text-[#A1A1AA] border-[#27272A] hover:text-[#F8FAFC] hover:border-[#3F3F46]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Queue Rows */}
            {filteredAppointments.length === 0 ? (
              searchQuery || filterStatus !== "All" ? (
                /* Empty Filter Result State */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#27272A] text-[#71717A] mx-auto flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#F8FAFC]">No customers match this filter</h3>
                    <p className="text-xs text-[#A1A1AA]">Try adjusting your search query or reset the filter status.</p>
                  </div>
                  <button
                    onClick={() => {
                      setFilterStatus("All");
                      setSearchQuery("");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#27272A] text-xs text-[#FACC15] hover:bg-[#202020] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filter</span>
                  </button>
                </div>
              ) : (
                /* Empty Queue State */
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-[#27272A] text-[#FACC15] mx-auto flex items-center justify-center shadow-sm">
                    <Armchair className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-base font-semibold text-[#F8FAFC]">No customers in the queue</h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      Add a walk-in customer or check in an existing appointment to get started.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={() => setShowWalkInModal(true)}
                      className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      + Add Walk-in Customer
                    </button>
                    <button
                      onClick={() => onNavigateTab("calendar")}
                      className="px-4 py-2 bg-[#181818] hover:bg-[#202020] text-[#F8FAFC] border border-[#27272A] font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      View Appointments
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {filteredAppointments.map((apt) => {
                  const isInChair = apt.status === "In-Service" || (apt.status as string) === "in_service";
                  const isWaiting = apt.status === "Confirmed" || (apt.status as string) === "waiting";
                  const isDone = apt.status === "Completed" || (apt.status as string) === "completed";

                  return (
                    <div
                      key={apt.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        isInChair
                          ? "bg-[#171717] border-[#FACC15]/30 hover:border-[#FACC15]/50"
                          : isWaiting
                          ? "bg-[#171717] border-[#60A5FA]/30 hover:border-[#60A5FA]/50"
                          : "bg-[#141414] border-[#27272A] opacity-80"
                      }`}
                    >
                      {/* Left: Customer Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isInChair
                              ? "bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/25"
                              : isWaiting
                              ? "bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/25"
                              : "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25"
                          }`}
                        >
                          {isInChair ? (
                            <Scissors className="w-4 h-4 text-[#FACC15]" />
                          ) : isWaiting ? (
                            <Clock className="w-4 h-4 text-[#60A5FA]" />
                          ) : (
                            <Check className="w-4 h-4 text-[#10B981]" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-[#F8FAFC] truncate">
                              {apt.customerName}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isInChair
                                  ? "bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30"
                                  : isWaiting
                                  ? "bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30"
                                  : "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                              }`}
                            >
                              {isInChair ? "In Service" : isWaiting ? "Waiting" : "Completed"}
                            </span>
                            {isWaiting && (() => {
                              const waitIdx = waitingVisits.findIndex((w) => w.id === apt.id);
                              const estWait = availableChairsCount > 0 && waitIdx < availableChairsCount
                                ? 0
                                : Math.max(5, (waitIdx + 1) * 12);
                              return (
                                <span className="text-[10px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded border border-[#FACC15]/25 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#FACC15]" />
                                  {estWait === 0 ? "Chair Ready · Seat Now" : `Est. Wait: ~${estWait}m`}
                                </span>
                              );
                            })()}
                            <span className="text-[10px] text-[#71717A] font-mono">
                              {apt.notes?.includes("Walk-in") ? "Walk-in" : "Appointment"}
                            </span>
                          </div>

                          <div className="text-xs text-[#A1A1AA] flex flex-wrap items-center gap-1.5">
                            <span className="text-[#F8FAFC]">{apt.serviceName}</span>
                            <span>•</span>
                            <span>Stylist: <span className="text-[#F8FAFC] font-medium">{apt.staffName}</span></span>
                            <span>•</span>
                            <span className="font-mono text-[#FACC15]">{formatCurrency(apt.price)}</span>
                          </div>

                          <div className="text-[11px] text-[#71717A] flex items-center gap-2 font-mono">
                            <span>{maskPhone(apt.customerPhone)}</span>
                            <span>•</span>
                            <span>Arrival: {apt.time || "10:30 AM"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Contextual Operational Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* WAITING ACTION: Seat Customer & WhatsApp Buzz */}
                        {isWaiting && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => sendChairReadyWhatsApp(apt)}
                              className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Buzz client on WhatsApp: Your chair is ready!"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>{apt.buzzedAt ? `Buzzed (${apt.buzzedAt})` : "WhatsApp Buzz"}</span>
                            </button>

                            <button
                              onClick={() => {
                                updateAppointmentStatus(apt.id, "In-Service");
                                showToast(`${apt.customerName} seated in chair with ${apt.staffName}!`);
                              }}
                              className="px-3.5 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Seat Customer</span>
                            </button>
                          </div>
                        )}

                        {/* IN-SERVICE ACTIONS: Add-on, Manage Services & Generate Bill */}
                        {isInChair && (
                          <>
                            <button
                              onClick={() => {
                                setInChairAddonApt(apt);
                                setAddonServiceName(services[0]?.name || "");
                                setAddonStaffName(apt.staffName);
                              }}
                              className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Upsell / Append an extra service in-chair"
                            >
                              <Plus className="w-3.5 h-3.5 text-purple-400" />
                              <span>+ Add-on</span>
                            </button>

                            <button
                              onClick={() => handleOpenServicesModal(apt)}
                              className="px-3 py-1.5 bg-[#111111] hover:bg-[#1A1A1A] text-[#F8FAFC] border border-[#27272A] font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Add or update services performed"
                            >
                              <Scissors className="w-3.5 h-3.5 text-[#A1A1AA]" />
                              <span>Services</span>
                            </button>

                            <button
                              onClick={() => handleOpenBillingModal(apt)}
                              className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#0D9468] text-[#080808] font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#080808]" />
                              <span>Generate Bill</span>
                            </button>
                          </>
                        )}

                        {/* COMPLETED ACTIONS: View / Resend WhatsApp Receipt */}
                        {isDone && (
                          <button
                            onClick={() => {
                              const cleanPhone = apt.customerPhone.replace(/[^0-9]/g, "");
                              const msg = `Hi ${apt.customerName}! ✨ Thank you for visiting ${salon.name}. We hope you loved your styling by ${apt.staffName}! See you again soon! 💇‍♀️`;
                              window.open(
                                `https://wa.me/${cleanPhone || "919845012890"}?text=${encodeURIComponent(msg)}`,
                                "_blank"
                              );
                            }}
                            className="px-3 py-1.5 bg-[#111111] hover:bg-[#1A1A1A] text-[#10B981] font-mono text-xs rounded-lg border border-[#27272A] hover:border-[#10B981]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Receipt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right ~30%: Actionable Chair Availability Panel */}
        <aside aria-label="Chair Availability Board" className="lg:col-span-4 space-y-4">
          <div className="bg-[#151515] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">Chair Availability</h3>
                <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                  {availableChairsCount} Available · {occupiedChairsCount} Occupied · {totalChairs} Total
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111111] text-[#10B981] border border-[#27272A]">
                Live Floor
              </span>
            </div>

            {/* Chair Visual Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {chairAssignments.map((chair) => {
                const isAvail = chair.status === "Available";
                const isOcc = chair.status === "Occupied";

                return (
                  <div
                    key={chair.chairNumber}
                    onClick={() => {
                      if (isAvail && waitingVisits.length > 0) {
                        handleQuickSeatWaiting(chair.chairNumber);
                      } else {
                        setSelectedChairDetail(chair);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isOcc
                        ? "bg-[#171717] border-[#FACC15]/40 hover:border-[#FACC15]"
                        : isAvail
                        ? "bg-[#171717] border-[#10B981]/30 hover:border-[#10B981]"
                        : "bg-[#111111] border-[#27272A] opacity-60"
                    }`}
                    title={
                      isAvail && waitingVisits.length > 0
                        ? `Click to seat next waiting client at Chair ${chair.chairNumber}`
                        : `Chair ${chair.chairNumber}: ${chair.status}`
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Armchair
                          className={`w-3.5 h-3.5 ${
                            isOcc ? "text-[#FACC15]" : isAvail ? "text-[#10B981]" : "text-[#71717A]"
                          }`}
                        />
                        <span className="font-semibold text-xs text-[#F8FAFC]">
                          Chair #{chair.chairNumber}
                        </span>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOcc ? "bg-[#FACC15] animate-pulse" : isAvail ? "bg-[#10B981]" : "bg-[#71717A]"
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="text-[11px] leading-tight">
                      {isOcc ? (
                        <>
                          <div className="text-[#FACC15] font-medium truncate">
                            {chair.appointment?.customerName || "In Service"}
                          </div>
                          <div className="text-[#71717A] text-[10px] truncate mt-0.5">
                            Stylist: {chair.stylist || "Assigned"}
                          </div>
                        </>
                      ) : isAvail ? (
                        <>
                          <div className="text-[#10B981] font-medium">Available</div>
                          <div className="text-[#71717A] text-[10px] truncate mt-0.5">
                            {waitingVisits.length > 0 ? "Click to seat waiting" : "Ready for client"}
                          </div>
                        </>
                      ) : (
                        <div className="text-[#71717A]">Unavailable</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature 2: Fair Stylist Turn Queue & Floor Equity */}
            <div className="pt-2 border-t border-[#27272A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-[#FACC15]" /> Fair Turn Rotation
                </span>
                <span className="text-[9px] font-mono text-[#FACC15] bg-[#FACC15]/10 px-1.5 py-0.5 rounded border border-[#FACC15]/20">
                  Floor Equity
                </span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {staff.map((s) => {
                  const isBusy = busyStaffNames.includes(s.name);
                  const isClockedIn = s.status === "clocked_in" || s.isClockedIn;
                  const turns = stylistTurns[s.name] || 0;
                  const isNextUp = nextUpStylist === s.name && !isBusy && isClockedIn;

                  return (
                    <div
                      key={s.id}
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                        isNextUp
                          ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30"
                          : "bg-[#111111] border-[#27272A]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-[#181818] border border-[#27272A] flex items-center justify-center text-[10px] font-bold text-[#F8FAFC]">
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#F8FAFC] truncate text-[11px]">{s.name}</span>
                            {isNextUp && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                Next Up
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-[#71717A] truncate font-mono">
                            {turns} turns today • {s.specialty?.[0] || s.role}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isBusy ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                            In Service
                          </span>
                        ) : isClockedIn ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                            Available
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#71717A]">
                            Off Shift
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CUSTOMER ENTERS SALON (WALK-IN WORKFLOW) */}
      {/* ============================================================ */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">
                  Add Walk-in Customer
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Search existing customer or enter details to check in.
                </p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Search Existing Client */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1A1AA]">
                Customer Name or Phone Number
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="e.g. 9845012890 or Ananya..."
                  value={lookupInput}
                  onChange={(e) => handleLookupChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-[#27272A] rounded-xl text-xs font-medium text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  autoFocus
                />
              </div>
            </div>

            {/* Recognized Returning Client */}
            {detectedCustomer && (
              <div className="p-3.5 rounded-xl bg-[#111111] border border-[#10B981]/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-mono text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Returning Client Recognized</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    {detectedCustomer.visitsCount || detectedCustomer.totalVisits || 1} Past Visits
                  </span>
                </div>

                <div className="text-xs text-[#A1A1AA] space-y-2">
                  <div className="text-[#F8FAFC] font-medium">{detectedCustomer.name} • {detectedCustomer.phone}</div>
                  <div className="text-[11px] text-[#71717A]">
                    Preferred Stylist: <span className="text-[#FACC15]">{detectedCustomer.preferredStaff || "Priya Sharma"}</span>
                  </div>

                  {/* Feature 5: Health & Scalp Allergy Alert Banner */}
                  {(detectedCustomer.patchTestStatus !== "Valid" ||
                    detectedCustomer.formulaNotes?.toLowerCase().includes("allerg") ||
                    detectedCustomer.notes?.toLowerCase().includes("allerg") ||
                    detectedCustomer.formulaNotes?.toLowerCase().includes("sensit")) && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Health & Sensitivity Alert</span>
                        <span className="text-[11px] text-rose-200/90 leading-snug">
                          {detectedCustomer.formulaNotes || detectedCustomer.notes || "Check patch test validity before chemical service."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feature 5: VIP Membership & Prepaid Wallet Pill */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono">
                    {detectedCustomer.vipTier && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-bold">
                        <Crown className="w-3 h-3 text-purple-400" />
                        {detectedCustomer.vipTier} Member
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-purple-400" />
                      Wallet: {formatCurrency(detectedCustomer.walletBalance || 0)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#181818] text-[#FACC15] border border-[#27272A]">
                      Points: {detectedCustomer.loyaltyPoints || 0}
                    </span>
                  </div>

                  {/* Feature 5: Hospitality Preference */}
                  {detectedCustomer.notes && (
                    <div className="p-2 rounded-lg bg-[#181818] border border-[#27272A] text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Hospitality Note: <strong className="text-[#F8FAFC]">{detectedCustomer.notes}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Client Input Form */}
            {isNewCustomer && (
              <div className="p-3.5 rounded-xl bg-[#111111] border border-[#60A5FA]/40 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-[#60A5FA] font-mono text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>New Client Entry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#A1A1AA]">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Mehta"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#A1A1AA]">WhatsApp Phone *</label>
                    <input
                      type="text"
                      placeholder="+91 98..."
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Steps 2-4: Service, Stylist & Chair Selection */}
            <form onSubmit={handleAllotChairAndBegin} className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Service Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#A1A1AA]">Service</label>
                  <select
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#151515]">
                        {s.name} ({formatCurrency(s.price)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stylist Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#A1A1AA]">Stylist</label>
                  <select
                    value={walkInStaff}
                    onChange={(e) => setWalkInStaff(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  >
                    {staff.map((s) => {
                      const isFree = freeStaff.some((f) => f.id === s.id);
                      const isNext = s.name === nextUpStylist;
                      const turns = stylistTurns[s.name] || 0;
                      return (
                        <option key={s.id} value={s.name} className="bg-[#151515]">
                          {isNext ? "⭐ " : ""}{s.name} {isNext ? "(Next in Turn)" : isFree ? "• Free" : "• Busy"} ({turns} turns)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Chair Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#A1A1AA]">Chair Allotment</label>
                  <select
                    value={walkInChair}
                    onChange={(e) => setWalkInChair(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  >
                    {chairAssignments.map((c) => (
                      <option key={c.chairNumber} value={c.chairNumber} className="bg-[#151515]">
                        Chair #{c.chairNumber} ({c.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#111111] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!walkInName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Confirm Check-in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: MANAGE SERVICES TAKEN */}
      {/* ============================================================ */}
      {serviceModalApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">
                  Services Taken • {serviceModalApt.customerName}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Select all services provided during this appointment session.
                </p>
              </div>
              <button
                onClick={() => setServiceModalApt(null)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A1A1AA]">Available Services:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-0.5">
                {services.map((srv) => {
                  const isSelected = selectedServiceList.includes(srv.name);
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleToggleService(srv.name)}
                      className={`p-2.5 rounded-xl text-xs text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#181818] text-[#FACC15] border-[#FACC15] font-semibold"
                          : "bg-[#111111] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46]"
                      }`}
                    >
                      <span className="truncate">{srv.name}</span>
                      <span className="font-mono text-[11px] shrink-0 ml-1">
                        {formatCurrency(srv.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#111111] border border-[#27272A] flex items-center justify-between font-mono">
              <span className="text-xs text-[#A1A1AA]">Updated Session Total:</span>
              <span className="text-base text-[#FACC15] font-semibold">
                {formatCurrency(
                  selectedServiceList.reduce((acc, sName) => {
                    const match = services.find((s) => s.name === sName);
                    return acc + (match?.price || 1500);
                  }, 0)
                )}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
              <button
                onClick={() => setServiceModalApt(null)}
                className="px-3.5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#111111] rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveServicesAndProceedToBill}
                className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Proceed to Billing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: BILLING & CHECKOUT (UPI / CASH / SPLIT) */}
      {/* ============================================================ */}
      {billingApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">
                  Checkout • {billingApt.customerName}
                </h3>
                <p className="text-xs text-[#A1A1AA]">{billingApt.serviceName}</p>
              </div>
              <button
                onClick={() => setBillingApt(null)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#71717A] block uppercase font-mono tracking-wider">
                  Payable Amount
                </span>
                <span className="text-2xl font-semibold text-[#FACC15]">
                  {formatCurrency(finalBillAmount)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-mono border border-[#10B981]/30">
                GST Included
              </span>
            </div>

            {/* Shop QR Display with Dynamic QR support */}
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#27272A] flex flex-col sm:flex-row items-center gap-3.5">
              <div className="w-24 h-24 bg-white p-1.5 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-md">
                {dynamicUpiQrUrl ? (
                  <img src={dynamicUpiQrUrl} alt="Counter UPI QR" className="w-20 h-20 object-contain block" />
                ) : (
                  <>
                    <QrCode className="w-16 h-16 text-black" />
                    <span className="text-[7px] font-mono uppercase text-slate-800 font-bold">UPI QR</span>
                  </>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="font-semibold text-xs text-[#F8FAFC]">
                  {salon.name} Counter QR • {formatCurrency(payMethod === "Split" ? upiAmount : finalBillAmount)}
                </div>
                <div className="text-[11px] text-[#A1A1AA] font-mono">
                  UPI ID: {salon.upiId || `billcare.${salon.slug || "terminal"}@axisbank`}
                </div>
                <p className="text-[11px] text-[#10B981]">
                  Instant scan via Google Pay, PhonePe, Paytm, or BHIM.
                </p>
              </div>
            </div>

            {/* Feature 6: Payment Method Selector (UPI / Cash / Wallet / Split) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-[#A1A1AA]">Tender Type:</label>
                {billingCustomer && (
                  <span className="text-[10px] font-mono text-purple-300">
                    Wallet: {formatCurrency(billingCustomer.walletBalance || 0)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["UPI", "Cash", "Wallet", "Split"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPayMethod(method);
                      if (method === "UPI") {
                        setUpiAmount(finalBillAmount);
                        setCashAmount(0);
                        setWalletAmount(0);
                      } else if (method === "Cash") {
                        setCashAmount(finalBillAmount);
                        setUpiAmount(0);
                        setWalletAmount(0);
                      } else if (method === "Wallet") {
                        setWalletAmount(finalBillAmount);
                        setCashAmount(0);
                        setUpiAmount(0);
                      } else {
                        // Default 50/50 split or utilize available wallet
                        const availableW = billingCustomer?.walletBalance || 0;
                        if (availableW > 0) {
                          const wUse = Math.min(finalBillAmount, availableW);
                          setWalletAmount(wUse);
                          setUpiAmount(finalBillAmount - wUse);
                          setCashAmount(0);
                        } else {
                          setCashAmount(Math.round(finalBillAmount / 2));
                          setUpiAmount(finalBillAmount - Math.round(finalBillAmount / 2));
                          setWalletAmount(0);
                        }
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer border text-center ${
                      payMethod === method
                        ? "bg-[#FACC15] text-[#080808] border-[#FACC15] font-bold"
                        : "bg-[#111111] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Tender Check */}
            {payMethod === "Wallet" && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1 text-xs">
                <div className="flex justify-between items-center text-purple-200">
                  <span>Client Prepaid Balance:</span>
                  <span className="font-bold font-mono">
                    {formatCurrency(billingCustomer?.walletBalance || 0)}
                  </span>
                </div>
                {(billingCustomer?.walletBalance || 0) < finalBillAmount && (
                  <p className="text-[11px] text-rose-300 font-semibold">
                    ⚠️ Insufficient wallet balance. Needs {formatCurrency(finalBillAmount - (billingCustomer?.walletBalance || 0))} more. Switch to Split or Cash/UPI.
                  </p>
                )}
              </div>
            )}

            {/* Feature 6: Dynamic 3-Way Split Breakdown */}
            {payMethod === "Split" && (
              <div className="p-3.5 rounded-xl bg-[#111111] border border-[#FACC15]/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#FACC15] font-bold">
                    Multi-Tender Split Breakdown
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    cashAmount + upiAmount + walletAmount === finalBillAmount
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}>
                    {cashAmount + upiAmount + walletAmount === finalBillAmount
                      ? "✓ Balanced"
                      : `Diff: ${formatCurrency(finalBillAmount - (cashAmount + upiAmount + walletAmount))}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] font-mono block">Cash (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={cashAmount || ""}
                      onChange={(e) => handleCashChange(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#A1A1AA] font-mono block">UPI (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={upiAmount || ""}
                      onChange={(e) => handleUpiChange(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-purple-300 font-mono block">Wallet (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={billingCustomer?.walletBalance || 0}
                      value={walletAmount || ""}
                      onChange={(e) => handleWalletChange(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Quick Auto-balancer buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                  {billingCustomer && (billingCustomer.walletBalance || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const maxW = Math.min(finalBillAmount, billingCustomer.walletBalance || 0);
                        setWalletAmount(maxW);
                        setUpiAmount(Math.max(0, finalBillAmount - cashAmount - maxW));
                      }}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 cursor-pointer"
                    >
                      Max Wallet ({formatCurrency(billingCustomer.walletBalance || 0)})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setUpiAmount(Math.max(0, finalBillAmount - cashAmount - walletAmount))}
                    className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#202020] text-[#FACC15] border border-[#27272A] cursor-pointer"
                  >
                    Rest to UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmount(Math.max(0, finalBillAmount - upiAmount - walletAmount))}
                    className="px-2 py-0.5 rounded bg-[#181818] hover:bg-[#202020] text-emerald-400 border border-[#27272A] cursor-pointer"
                  >
                    Rest to Cash
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setBillingApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#111111] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteBillAndSendWhatsApp}
                disabled={
                  (payMethod === "Split" && cashAmount + upiAmount + walletAmount !== finalBillAmount) ||
                  (payMethod === "Wallet" && (billingCustomer?.walletBalance || 0) < finalBillAmount)
                }
                className="px-4 py-2 bg-[#10B981] hover:bg-[#0D9468] disabled:opacity-40 disabled:cursor-not-allowed text-[#080808] font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete & Send WhatsApp Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: WHATSAPP THANK YOU / RECEIPT CONFIRMATION */}
      {/* ============================================================ */}
      {whatsappSentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F8FAFC]">Visit Completed</h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Receipt generated • Chair released for next client
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappSentModal(null)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#10B981]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#10B981] font-mono text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Notification:</span>
              </div>
              <div className="p-3 bg-[#151515] rounded-xl text-xs text-[#F8FAFC] font-sans leading-relaxed whitespace-pre-line border border-[#27272A]">
                {whatsappSentModal.messageText}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
              <button
                onClick={() => setWhatsappSentModal(null)}
                className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#111111] rounded-xl cursor-pointer"
              >
                Done
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/${whatsappSentModal.phone}?text=${encodeURIComponent(
                      whatsappSentModal.messageText
                    )}`,
                    "_blank"
                  );
                  setWhatsappSentModal(null);
                }}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open in WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAIR DETAIL MODAL */}
      {selectedChairDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-[#FACC15]" />
                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  Chair #{selectedChairDetail.chairNumber} Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedChairDetail(null)}
                className="w-7 h-7 rounded-lg bg-[#111111] text-[#71717A] hover:text-[#F8FAFC] flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#27272A]">
                <span className="text-[#A1A1AA]">Status:</span>
                <span
                  className={`font-semibold ${
                    selectedChairDetail.status === "Occupied"
                      ? "text-[#FACC15]"
                      : selectedChairDetail.status === "Available"
                      ? "text-[#10B981]"
                      : "text-[#71717A]"
                  }`}
                >
                  {selectedChairDetail.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#27272A]">
                <span className="text-[#A1A1AA]">Assigned Stylist:</span>
                <span className="text-[#F8FAFC] font-medium">{selectedChairDetail.stylist || "None"}</span>
              </div>
              {selectedChairDetail.appointment && (
                <div className="flex justify-between py-1 border-b border-[#27272A]">
                  <span className="text-[#A1A1AA]">Current Client:</span>
                  <span className="text-[#FACC15] font-medium">
                    {selectedChairDetail.appointment.customerName}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedChairDetail(null)}
                className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#202020] text-xs font-medium rounded-lg text-[#F8FAFC] border border-[#27272A] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: SHIFT CASH DRAWER OPEN / CLOSE & HANDOVER (FEATURE 1) */}
      {/* ============================================================ */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F8FAFC]">
                    {currentShift ? "Register Shift Reconciliation" : "Open Front Desk Register Shift"}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA] font-mono">
                    {currentShift ? `Opened by ${currentShift.openedByName || "Front Desk"}` : "Start of day cash float"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!currentShift ? (
              /* OPEN SHIFT FORM */
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#111111] rounded-xl border border-[#27272A] space-y-1">
                  <span className="text-[#A1A1AA] block">Opening Cash Float</span>
                  <p className="text-[11px] text-[#71717A]">
                    Enter the physical petty cash placed in the register for change.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#A1A1AA]">Quick Float Amount (₹)</label>
                  <div className="grid grid-cols-4 gap-1.5 font-mono">
                    {[1000, 2000, 3000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setOpeningFloatInput(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          openingFloatInput === amt
                            ? "bg-[#FACC15] text-[#080808] border-[#FACC15]"
                            : "bg-[#111111] text-[#A1A1AA] border-[#27272A] hover:bg-[#181818]"
                        }`}
                      >
                        ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={openingFloatInput || ""}
                    onChange={(e) => setOpeningFloatInput(Number(e.target.value) || 0)}
                    placeholder="Enter Float"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#27272A] rounded-xl text-sm font-mono font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#71717A]">Opening Notes (Optional)</label>
                  <input
                    type="text"
                    value={shiftNotesInput}
                    onChange={(e) => setShiftNotesInput(e.target.value)}
                    placeholder="e.g. Morning opening shift verified by cashier"
                    className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await openRegisterShift(openingFloatInput, shiftNotesInput);
                    setShowShiftModal(false);
                    setShiftNotesInput("");
                  }}
                  className="w-full py-3 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Open Register Shift ({formatCurrency(openingFloatInput)})</span>
                </button>
              </div>
            ) : (
              /* CLOSE SHIFT RECONCILIATION */
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-[#111111] rounded-xl border border-[#27272A] space-y-2">
                  <div className="flex justify-between items-center text-[#A1A1AA]">
                    <span>Opening Float:</span>
                    <span className="font-mono font-bold text-[#F8FAFC]">{formatCurrency(currentShift.openingFloat)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#A1A1AA]">
                    <span>Cash Collected Today:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{formatCurrency(Math.max(0, currentShift.expectedCash - currentShift.openingFloat))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#27272A] flex justify-between items-center font-bold">
                    <span className="text-[#F8FAFC]">System Expected Drawer Total:</span>
                    <span className="font-mono text-sm text-[#FACC15]">{formatCurrency(currentShift.expectedCash)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#A1A1AA] block">Physical Cash Counted in Drawer (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={countedCashInput || ""}
                    onChange={(e) => setCountedCashInput(Number(e.target.value) || 0)}
                    placeholder="Count physical cash notes"
                    className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#27272A] rounded-xl text-base font-mono font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                {/* Real-time Variance Badge */}
                {(() => {
                  const variance = countedCashInput - currentShift.expectedCash;
                  return (
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono font-bold ${
                        variance === 0
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : variance < 0
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      }`}
                    >
                      <span>Cash Variance:</span>
                      <span>
                        {variance === 0
                          ? "✓ Exact Match (Balanced)"
                          : variance < 0
                          ? `Shortage: -${formatCurrency(Math.abs(variance))}`
                          : `Overage: +${formatCurrency(variance)}`}
                      </span>
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#71717A]">Closing / Handover Notes</label>
                  <input
                    type="text"
                    value={shiftNotesInput}
                    onChange={(e) => setShiftNotesInput(e.target.value)}
                    placeholder="e.g. Evening drawer handover to next shift"
                    className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await closeRegisterShift(countedCashInput, shiftNotesInput);
                    setShowShiftModal(false);
                    setShiftNotesInput("");
                  }}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reconcile & Close Register Shift</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: MID-SERVICE IN-CHAIR ADD-ON (FEATURE 4) */}
      {/* ============================================================ */}
      {inChairAddonApt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#27272A] text-[#F8FAFC] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F8FAFC]">Add In-Chair Service</h3>
                  <p className="text-[11px] text-[#A1A1AA]">{inChairAddonApt.customerName} • In Service</p>
                </div>
              </div>
              <button
                onClick={() => setInChairAddonApt(null)}
                className="w-8 h-8 rounded-xl bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-[#F8FAFC] border border-[#27272A] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#111111] rounded-xl border border-[#27272A] space-y-1 text-xs">
              <span className="text-[#71717A] uppercase font-mono text-[10px]">Current Session:</span>
              <div className="flex justify-between items-center text-[#F8FAFC] font-medium">
                <span>{inChairAddonApt.serviceName}</span>
                <span className="font-mono text-[#FACC15]">{formatCurrency(inChairAddonApt.price)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[#A1A1AA]">Select Add-on Service to Append</label>
                <select
                  value={addonServiceName}
                  onChange={(e) => setAddonServiceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name} className="bg-[#151515]">
                      {s.name} (+{formatCurrency(s.price)} • {s.durationMinutes || 30}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#A1A1AA]">Stylist Attribution</label>
                <select
                  value={addonStaffName}
                  onChange={(e) => setAddonStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.name} className="bg-[#151515]">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const srv = services.find((s) => s.name === addonServiceName) || services[0];
                return (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between font-mono">
                    <span className="text-purple-300">New Combined Total:</span>
                    <span className="font-bold text-purple-200 text-sm">
                      {formatCurrency(inChairAddonApt.price + (srv?.price || 0))}
                    </span>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  const srv = services.find((s) => s.name === addonServiceName) || services[0];
                  if (srv) {
                    appendServiceToAppointment(inChairAddonApt.id, {
                      name: srv.name,
                      price: srv.price,
                      durationMinutes: srv.durationMinutes || 30,
                      staffName: addonStaffName || inChairAddonApt.staffName,
                    });
                    setInChairAddonApt(null);
                  }
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Append to Active Chair Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
