"use client";

import React, { useState, useMemo } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";
import { InvoiceItem, Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { InvoiceModal } from "./invoice-modal";
import { ClientFormulaModal } from "./client-formula-modal";
import {
  CreditCard,
  QrCode,
  Banknote,
  Split,
  Plus,
  Minus,
  Trash2,
  Search,
  Sparkles,
  ShoppingBag,
  Scissors,
  CheckCircle2,
  Tag,
  Receipt,
  User,
  Phone,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Percent,
  Crown,
  Zap,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Wallet,
  Maximize2,
} from "lucide-react";
import QRCode from "qrcode";
import { playPaymentAlertSound } from "@/lib/audio-alerts";

export function PosView({ activeBranch }: { activeBranch?: string } = {}) {
  const { salon, user, staff, services, inventory, customers, invoices, createInvoice, showToast } = useRuvexi();

  const [branches, setBranches] = useState<any[]>([]);
  React.useEffect(() => {
    RuvexiApi.getBranches()
      .then((list: any[]) => {
        if (Array.isArray(list)) setBranches(list);
      })
      .catch(() => {});
  }, []);

  const resolvedBranch = React.useMemo(() => {
    const target = (user as any)?.branchId || activeBranch || salon.branch;
    if (!target || branches.length === 0) return null;
    return (
      branches.find(
        (b) =>
          b.id === target ||
          b.name === target ||
          b.code === target
      ) || null
    );
  }, [branches, user, activeBranch, salon.branch]);

  // Selected tab: "terminal" or "history"
  const [activeSubTab, setActiveSubTab] = useState<"terminal" | "history">("terminal");

  // Cart state
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [customCustomerName, setCustomCustomerName] = useState<string>("");
  const [customCustomerPhone, setCustomCustomerPhone] = useState<string>("");
  const [isWalkIn, setIsWalkIn] = useState<boolean>(false);

  // Filter & Search
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [itemTypeTab, setItemTypeTab] = useState<"services" | "retail">("services");

  // Dynamic Categories from Services Catalog
  const availableCategories = useMemo<string[]>(() => {
    const defaultOrder = [
      "All",
      "Waxing",
      "Hair",
      "Beard & Grooming",
      "Hair Colour",
      "Nails",
      "Skin & Spa",
      "Threading",
      "Hair Spa",
      "Massage",
      "Facial",
    ];
    const srvCats = Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[];
    const extra = srvCats.filter((c: string) => !defaultOrder.includes(c));
    return [...defaultOrder.filter((c: string) => c === "All" || srvCats.includes(c)), ...extra];
  }, [services]);

  // Payment, Tip & Discount
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountMode, setDiscountMode] = useState<"percent" | "amount">("percent");
  const [discountInput, setDiscountInput] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountMessage, setDiscountMessage] = useState<string>("");
  // Payment & Dynamic Checkout States
  const branchUpiId = (resolvedBranch?.upiId || "").trim();
  const effectiveUpiId = branchUpiId || (salon.upiId || "").trim();
  const effectivePayeeName =
    (branchUpiId ? resolvedBranch?.upiPayeeName : null) ||
    salon.paymentSettings?.upiPayeeName ||
    salon.name;

  const isCashAvailable = salon.paymentSettings?.cashEnabled ?? (salon as any).cashEnabled ?? true;
  const isUpiConfigured = Boolean(effectiveUpiId);
  const isUpiAvailable = Boolean(
    isUpiConfigured &&
      (branchUpiId ? true : (salon.paymentSettings?.upiEnabled ?? (salon as any).upiEnabled ?? false))
  );

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">(isUpiAvailable ? "UPI" : "CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const [upiIntentUri, setUpiIntentUri] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [showQrPopup, setShowQrPopup] = useState<boolean>(false);
  const [upiConfirmedByStaff, setUpiConfirmedByStaff] = useState<boolean>(false);
  const [manualUtr, setManualUtr] = useState<string>("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [tipMode, setTipMode] = useState<"percent" | "amount">("percent");
  const [tipInput, setTipInput] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [redeemLoyalty, setRedeemLoyalty] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Active view modal for completed invoice
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const loyaltyDiscount = redeemLoyalty && selectedCustomer ? Math.min(Math.floor(selectedCustomer.loyaltyPoints / 2), 500) : 0;
  const totalDiscount = appliedDiscount + loyaltyDiscount;
  const gstAmount = 0; // Tax removed - clean billing without GST
  const grandTotal = Math.max(0, subtotal - totalDiscount + tipAmount);

  // Sync default customer once context hydrates
  React.useEffect(() => {
    if (!selectedCustomerId && !isWalkIn && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId, isWalkIn]);

  // Consume optional prefill from Calendar / Customer CRM
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("Ruvexi_pos_prefill");
      if (!raw) return;
      sessionStorage.removeItem("Ruvexi_pos_prefill");
      const parsed = JSON.parse(raw) as {
        customerName?: string;
        serviceName?: string;
        staffName?: string;
      };
      if (parsed.customerName) {
        const foundCust = customers.find(
          (c) => c.name.toLowerCase() === parsed.customerName?.toLowerCase()
        );
        if (foundCust) {
          setIsWalkIn(false);
          setSelectedCustomerId(foundCust.id);
        } else {
          setIsWalkIn(true);
          setCustomCustomerName(parsed.customerName);
        }
      }
      if (parsed.serviceName) {
        const matchedSrv = services.find((s) =>
          parsed.serviceName!.toLowerCase().includes(s.name.toLowerCase())
        );
        const matchedStaff = staff.find(
          (st) => st.name.toLowerCase() === (parsed.staffName || "").toLowerCase()
        );
        if (matchedSrv) {
          setCart([
            {
              id: matchedSrv.id,
              name: matchedSrv.name,
              price: matchedSrv.price,
              quantity: 1,
              type: "service",
              staffId: matchedStaff?.id || staff[0]?.id,
              staffName: matchedStaff?.name || parsed.staffName || staff[0]?.name,
            },
          ]);
        }
      }
    } catch {}
  }, [customers, services, staff]);

  // Sync selected method if one is disabled
  React.useEffect(() => {
    if (!isUpiAvailable && paymentMethod === "UPI") {
      setPaymentMethod("CASH");
    }
  }, [isUpiAvailable, paymentMethod]);

  // Set default cash tendered to grandTotal when cart changes
  React.useEffect(() => {
    if (grandTotal > 0 && (cashTendered === 0 || cashTendered < grandTotal)) {
      setCashTendered(grandTotal);
    }
  }, [grandTotal]);

  // Generate dynamic UPI intent & QR Code
  React.useEffect(() => {
    if (isUpiAvailable && effectiveUpiId && grandTotal > 0) {
      const vpa = effectiveUpiId;
      const payeeName = effectivePayeeName;
      const invoiceRef = `RVX-INV-${Date.now().toString().slice(-6)}`;
      const intent = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoiceRef)}`;
      setUpiIntentUri(intent);
      QRCode.toDataURL(intent, {
        width: 240,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" }
      })
        .then(setUpiQrDataUrl)
        .catch(() => setUpiQrDataUrl(""));
    } else {
      setUpiIntentUri("");
      setUpiQrDataUrl("");
    }
  }, [isUpiAvailable, effectiveUpiId, effectivePayeeName, grandTotal]);

  // Custom Item Modal
  const [showCustomItemModal, setShowCustomItemModal] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>("");
  const [customItemPrice, setCustomItemPrice] = useState<number>(500);
  const [customItemType, setCustomItemType] = useState<"service" | "product">("service");
  const [customItemStaffId, setCustomItemStaffId] = useState<string>("");

  // Cart Operations
  const addToCart = (
    item: { id: string; name: string; price: number; type: "service" | "product" },
    preferredStaffId?: string
  ) => {
    const defaultStaff = staff.find((s) => s.status === "clocked_in") || staff[0];
    const staffId = preferredStaffId || defaultStaff?.id || "staff_house";
    const staffName = staff.find((s) => s.id === staffId)?.name || "House";

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.staffId === staffId);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.staffId === staffId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          type: item.type,
          price: item.price,
          quantity: 1,
          staffId,
          staffName,
        },
      ];
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      alert("Please enter a custom charge name or service description.");
      return;
    }
    const defaultStaff = staff.find((s) => s.id === customItemStaffId) || staff.find((s) => s.status === "clocked_in") || staff[0];
    const sId = defaultStaff?.id || "staff_house";
    const sName = defaultStaff?.name || "House";

    const customId = `custom_${Date.now()}`;
    setCart((prev) => [
      ...prev,
      {
        id: customId,
        name: customItemName.trim(),
        type: customItemType,
        price: Number(customItemPrice) || 0,
        quantity: 1,
        staffId: sId,
        staffName: sName,
      },
    ]);

    setCustomItemName("");
    setCustomItemPrice(500);
    setShowCustomItemModal(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item, idx) => {
          if (idx !== index) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean) as InvoiceItem[];
    });
  };

  const updateItemStaff = (index: number, newStaffId: string) => {
    const sName = staff.find((s) => s.id === newStaffId)?.name || "House";
    setCart((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, staffId: newStaffId, staffName: sName } : item))
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Recalculate custom discount dynamically when cart subtotal or discount inputs change
  React.useEffect(() => {
    const raw = parseFloat(discountInput);
    if (!discountInput.trim() || Number.isNaN(raw) || raw <= 0 || subtotal <= 0) {
      setAppliedDiscount(0);
      setDiscountCode("");
      setDiscountMessage("");
      return;
    }
    if (discountMode === "percent") {
      const pct = Math.min(100, Math.max(0, raw));
      const disc = Math.min(subtotal, Math.round((subtotal * pct) / 100));
      setAppliedDiscount(disc);
      setDiscountCode(`${pct}% Off`);
      setDiscountMessage(`✓ ${pct}% custom discount applied (-${formatCurrency(disc)})`);
    } else {
      const amt = Math.min(subtotal, Math.round(raw));
      setAppliedDiscount(amt);
      setDiscountCode("Custom ₹");
      setDiscountMessage(`✓ ${formatCurrency(amt)} custom discount applied`);
    }
  }, [subtotal, discountMode, discountInput]);

  // Recalculate custom tip dynamically when cart subtotal or tip inputs change
  React.useEffect(() => {
    const raw = parseFloat(tipInput);
    if (!tipInput.trim() || Number.isNaN(raw) || raw <= 0 || subtotal <= 0) {
      setTipAmount(0);
      return;
    }
    if (tipMode === "percent") {
      const pct = Math.min(100, Math.max(0, raw));
      setTipAmount(Math.round((subtotal * pct) / 100));
    } else {
      setTipAmount(Math.round(raw));
    }
  }, [subtotal, tipMode, tipInput]);

  const handleCheckout = (asPending: boolean = false) => {
    setCheckoutError(null);
    if (cart.length === 0) {
      setCheckoutError("Cart is empty! Please select at least one service or retail product.");
      return;
    }

    if (paymentMethod === "CASH") {
      if (cashTendered < grandTotal) {
        setCheckoutError(`Insufficient cash received. Final payable amount is ${formatCurrency(grandTotal)}, but only ${formatCurrency(cashTendered)} was entered. Change cannot be negative.`);
        return;
      }
      finalizeCheckout("CASH", {
        amountReceived: cashTendered,
        changeGiven: Math.max(0, cashTendered - grandTotal),
        status: "paid",
      });
    } else if (paymentMethod === "UPI") {
      if (asPending) {
        finalizeCheckout("UPI", {
          status: "pending",
          transactionReference: manualUtr.trim() || undefined,
        });
        return;
      }

      if (!upiConfirmedByStaff) {
        setCheckoutError("Payment verification required: Please check the counter UPI app/SMS notification to verify receipt of funds, then check the confirmation box below.");
        return;
      }

      const trimmedUtr = manualUtr.trim();
      if (trimmedUtr && invoices.some((inv) => (inv.paymentReference || "").toLowerCase() === trimmedUtr.toLowerCase())) {
        setCheckoutError(`Duplicate UTR / Bank Reference "${trimmedUtr}" detected! This reference has already been used on a previous invoice.`);
        return;
      }

      finalizeCheckout("UPI", {
        status: "paid",
        transactionReference: trimmedUtr || undefined,
        explicitVerification: true,
      });
    }
  };

  const finalizeCheckout = (method: "CASH" | "UPI", extraDetails: any = {}) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const customerName = isWalkIn ? customCustomerName || "Walk-in Guest" : selectedCustomer?.name || "Guest";
      const customerPhone = isWalkIn ? customCustomerPhone || "" : selectedCustomer?.phone || "";

      const pointsEarned = Math.round(grandTotal * 0.05);
      const redeemedPts = redeemLoyalty ? loyaltyDiscount : 0;
      const balancePoints = Math.max(
        0,
        (selectedCustomer?.loyaltyPoints || 0) + pointsEarned - redeemedPts
      );

      const primaryCartStaff = cart.find((i) => i.staffId || i.staffName);
      const resolvedStaffId = primaryCartStaff?.staffId || staff[0]?.id || "";
      const resolvedStaffName = primaryCartStaff?.staffName || staff[0]?.name || "";

      const status = extraDetails.status || "paid";
      const amountReceived = extraDetails.amountReceived ?? (method === "CASH" ? cashTendered : grandTotal);
      const changeGiven = extraDetails.changeGiven ?? (method === "CASH" ? Math.max(0, cashTendered - grandTotal) : 0);
      const txnRef = extraDetails.transactionReference || (method === "CASH" ? `BC-CASH-${Date.now().toString().slice(-6)}` : `BC-UPI-${Date.now().toString().slice(-6)}`);

      const newInvoice = createInvoice({
        branchId: resolvedBranch?.id || (user as any)?.branchId || undefined,
        customerId: isWalkIn ? "cst_walkin" : selectedCustomer?.id,
        customerName,
        customerPhone,
        staffId: resolvedStaffId,
        staffName: resolvedStaffName,
        items: cart,
        subtotal,
        discount: appliedDiscount,
        discountAmount: appliedDiscount,
        loyaltyPointsRedeemed: redeemedPts,
        tipAmount,
        taxPercent: 0,
        gstAmount: 0,
        cgst: 0,
        sgst: 0,
        total: grandTotal,
        grandTotal,
        paymentMethod: method,
        status: status,
        amountReceived,
        changeGiven,
        paymentReference: txnRef,
        transactionReference: txnRef,
        notes: txnRef ? `${method} Ref: ${txnRef}` : undefined,
        loyaltyPointsEarned: pointsEarned,
        loyaltyPointsBalance: balancePoints,
      } as any);

      // Reset checkout form
      setCart([]);
      setDiscountInput("");
      setAppliedDiscount(0);
      setTipInput("");
      setTipAmount(0);
      setRedeemLoyalty(false);
      setDiscountCode("");
      setDiscountMessage("");
      setCashTendered(0);
      setUpiConfirmedByStaff(false);
      setManualUtr("");

      // Instant Receptionist Soundbox Notice
      if (status === "paid") {
        playPaymentAlertSound("success");
        showToast(`Payment of ${formatCurrency(grandTotal)} confirmed via ${method}!`, "success");
      }

      // Open Printable/Viewable Invoice Modal
      setActiveInvoice(newInvoice);
    } catch (err: any) {
      playPaymentAlertSound("failure");
      setCheckoutError(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(catalogSearch.toLowerCase()) || s.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Retail Inventory
  const filteredRetailProducts = inventory
    .filter((inv) => inv.usageType === "Retail Sale" || inv.retailPrice)
    .filter((inv) => inv.name.toLowerCase().includes(catalogSearch.toLowerCase()) || (inv.brand?.toLowerCase().includes(catalogSearch.toLowerCase()) ?? false));

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tab Switcher */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">Point of Sale & Register</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Rapid multi-item counter billing • Stylist commission attribution • GST split compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#181818] p-1.5 rounded-xl border border-[#27272A]">
          <button
            onClick={() => setActiveSubTab("terminal")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "terminal"
                ? "bg-[#FACC15] text-[#080808] shadow-sm"
                : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
          >
            Counter Terminal
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === "history"
                ? "bg-[#FACC15] text-[#080808] shadow-sm"
                : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
          >
            <span>Bill Ledger</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${activeSubTab === "history" ? "bg-[#080808] text-[#FACC15]" : "bg-[#27272A] text-[#A1A1AA]"}`}>
              {invoices.length}
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === "terminal" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Catalog of Services & Retail Products */}
          <div className="lg:col-span-7 space-y-4">
            {/* Catalog Filter Controls */}
            <div className="bg-[#101010] border border-[#27272A] p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search services or retail products (e.g. Balayage, Olaplex, HydraFacial)..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#27272A] flex-1 sm:flex-initial">
                    <button
                      onClick={() => setItemTypeTab("services")}
                      className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${itemTypeTab === "services"
                          ? "bg-[#FACC15] text-[#080808] shadow-sm"
                          : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                        }`}
                    >
                      <Scissors className="w-3.5 h-3.5" /> Treatments ({services.length})
                    </button>
                    <button
                      onClick={() => setItemTypeTab("retail")}
                      className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${itemTypeTab === "retail"
                          ? "bg-[#FACC15] text-[#080808] shadow-sm"
                          : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                        }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Retail ({inventory.filter((i) => i.usageType === "Retail Sale").length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCustomItemModal(true)}
                    className="px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-[#181818] hover:bg-[#27272A] text-[#FACC15] border border-[#FACC15]/30 shadow-xs cursor-pointer shrink-0"
                    title="Add manual custom service or sudden product add-on"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Custom</span>
                  </button>
                </div>
              </div>

              {itemTypeTab === "services" && (
                <div className="space-y-2 pt-1 border-t border-[#27272A]/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono uppercase tracking-wider font-semibold text-[#FACC15] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#FACC15]" />
                      Select Category
                    </span>
                    <span className="text-[#A1A1AA] text-[10px] font-mono">
                      {categoryFilter === "All" ? `${services.length} services in catalog` : `${filteredServices.length} services in ${categoryFilter}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {availableCategories.map((cat: string) => {
                      const count = cat === "All" ? services.length : services.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${categoryFilter === cat
                              ? "bg-[#FACC15] text-[#080808] shadow-sm font-extrabold"
                              : "bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#27272A]"
                            }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${categoryFilter === cat ? "bg-[#080808]/20 text-[#080808]" : "bg-[#27272A] text-[#71717A]"
                              }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Catalog Grid */}
            <div className="max-h-[620px] overflow-y-auto pr-1 space-y-3">
              {itemTypeTab === "services" ? (
                <>
                  {categoryFilter !== "All" && (
                    <div className="flex items-center justify-between bg-[#151515] border border-[#27272A] px-3.5 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F8FAFC]">{categoryFilter}</span>
                        <span className="text-[11px] text-[#A1A1AA]">({filteredServices.length} services)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCategoryFilter("All")}
                        className="text-[11px] font-mono text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Categories</span>
                      </button>
                    </div>
                  )}

                  {categoryFilter === "All" && !catalogSearch && (
                    <div className="bg-[#101010] border border-[#27272A] p-3.5 rounded-2xl space-y-2 mb-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
                        <span>Select a Category to Browse</span>
                        <span className="text-[#FACC15]">{availableCategories.filter((c: string) => c !== "All").length} Categories</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {availableCategories
                          .filter((c: string) => c !== "All")
                          .map((cat: string) => {
                            const count = services.filter((s) => s.category === cat).length;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setCategoryFilter(cat)}
                                className="bg-[#161616] hover:bg-[#1f1f1f] border border-[#27272A] hover:border-[#FACC15]/40 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
                              >
                                <div className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#FACC15] transition-colors truncate">
                                  {cat}
                                </div>
                                <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                                  {count} {count === 1 ? "service" : "services"}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {filteredServices.length === 0 ? (
                  <div className="bg-[#101010] border border-[#27272A] p-12 rounded-2xl text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center mx-auto">
                      <Scissors className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif font-bold text-[#F8FAFC] text-sm">No treatments found</h4>
                    <p className="text-xs text-[#71717A]">
                      No salon service matches "{catalogSearch}" in {categoryFilter === "All" ? "any category" : categoryFilter}.
                    </p>
                    <button
                      onClick={() => {
                        setCatalogSearch("");
                        setCategoryFilter("All");
                      }}
                      className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Reset Catalog Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredServices.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => addToCart({ id: srv.id, name: srv.name, price: srv.price, type: "service" })}
                        className="bg-[#151515] border border-[#27272A] group p-4 rounded-xl hover:border-[#FACC15]/50 hover:bg-[#181818] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                              {srv.category}
                            </span>
                            <span className="text-xs text-[#71717A] font-mono flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#71717A]" /> {srv.durationMinutes}m
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#F8FAFC] mt-2.5 group-hover:text-[#FACC15] transition-colors leading-snug">
                            {srv.name}
                          </h4>
                          <p className="text-xs text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                          <span className="text-base font-extrabold text-[#FACC15] font-mono">
                            {formatCurrency(srv.price)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FACC15] group-hover:translate-x-1 transition-transform">
                            <Plus className="w-3.5 h-3.5" /> Add
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </>
              ) : filteredRetailProducts.length === 0 ? (
                <div className="bg-[#101010] border border-[#27272A] p-12 rounded-2xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#27272A] text-emerald-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-[#F8FAFC] text-sm">No retail products found</h4>
                  <p className="text-xs text-[#71717A]">
                    No retail take-home items matched "{catalogSearch}".
                  </p>
                  <button
                    onClick={() => setCatalogSearch("")}
                    className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredRetailProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if ((prod.currentStock || 0) <= 0) {
                          showToast(`"${prod.name}" is out of stock. Restock in Inventory first.`, "error");
                          return;
                        }
                        addToCart({
                          id: prod.id,
                          name: `${prod.name} (${prod.brand})`,
                          price: prod.retailPrice || prod.costPrice * 1.5,
                          type: "product",
                        });
                      }}
                      className={`bg-[#151515] border border-[#27272A] group p-4 rounded-xl transition-all flex flex-col justify-between ${
                        (prod.currentStock || 0) <= 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-emerald-500/50 hover:bg-[#181818] cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-emerald-400 border border-[#27272A]">
                            {prod.brand}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${prod.currentStock <= prod.minThreshold
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-[#181818] text-[#A1A1AA] border border-[#27272A]"
                              }`}
                          >
                            Stock: {prod.currentStock} {prod.unit}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F8FAFC] mt-2.5 group-hover:text-emerald-400 transition-colors leading-snug">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-[#71717A] font-mono mt-1">SKU: {prod.sku}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                        <span className="text-base font-extrabold text-[#FACC15] font-mono">
                          {formatCurrency(prod.retailPrice || prod.costPrice * 1.5)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                          <Plus className="w-3.5 h-3.5" /> Add Retail
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Floating Mobile Cart Bar */}
          {cart.length > 0 && (
            <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30 bg-[#101010] text-[#F8FAFC] p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-[#27272A] animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#FACC15] flex items-center justify-center font-bold text-xs text-[#080808]">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#71717A] block uppercase tracking-wider">
                    Cart Total
                  </span>
                  <span className="font-extrabold text-sm text-[#FACC15] font-mono">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("pos-checkout-drawer")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 bg-[#FACC15] text-[#080808] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span>Checkout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right Side: Active Cart & Boutique Checkout Drawer */}
          <div id="pos-checkout-drawer" className="lg:col-span-5 space-y-4">
            <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              {/* Customer Selector with VIP Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FACC15]" /> Client Details
                  </label>
                  <button
                    onClick={() => setIsWalkIn(!isWalkIn)}
                    className="text-xs text-[#FACC15] hover:underline font-bold"
                  >
                    {isWalkIn ? "Pick Registered Client" : "+ New Walk-In Client"}
                  </button>
                </div>

                {isWalkIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Guest Name (e.g. Shalini)"
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="px-3.5 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (e.g. 98450...)"
                      value={customCustomerPhone}
                      onChange={(e) => setCustomCustomerPhone(e.target.value)}
                      className="px-3.5 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#151515] text-[#F8FAFC]">
                          {c.name} ({c.phone}) - {c.loyaltyPoints} Pts
                        </option>
                      ))}
                    </select>

                    {selectedCustomer && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs bg-[#151515] p-3 rounded-xl border border-[#27272A]">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#F8FAFC]">
                              <Crown className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                              <span>{selectedCustomer.vipTier || "VIP Tier Member"}</span>
                            </div>
                            <span className="text-[11px] text-[#71717A] font-mono">
                              Total Spent: <b className="text-[#F8FAFC]">{formatCurrency(selectedCustomer.totalSpent)}</b> • Visits: <b className="text-[#F8FAFC]">{selectedCustomer.visitsCount}</b>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowFormulaModal(true)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#FACC15] bg-[#181818] border border-[#FACC15]/30 rounded-lg hover:bg-[#FACC15]/10 shadow-xs flex items-center gap-1 cursor-pointer"
                              title="View Hair & Skin Technical Formula Card"
                            >
                              <Sparkles className="w-3 h-3 text-[#FACC15]" /> Formula
                            </button>
                            <span className="text-xs font-mono font-bold text-[#FACC15] bg-[#181818] border border-[#27272A] px-2.5 py-1 rounded-lg">
                              {selectedCustomer.loyaltyPoints} Pts
                            </span>
                          </div>
                        </div>

                        {selectedCustomer.loyaltyPoints >= 100 && (
                          <label className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] bg-[#181818] p-2.5 rounded-xl border border-[#27272A] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={redeemLoyalty}
                              onChange={(e) => setRedeemLoyalty(e.target.checked)}
                              className="rounded text-[#FACC15] focus:ring-[#FACC15]"
                            />
                            <span>
                              Redeem points for discount:{" "}
                              <b className="text-[#FACC15] font-mono">
                                -{formatCurrency(Math.min(Math.floor(selectedCustomer.loyaltyPoints / 2), 500))} off
                              </b>
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
                    Invoice Order Items ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-400 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8 bg-[#151515] rounded-xl border border-dashed border-[#27272A] text-[#71717A]">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#71717A]/50" />
                    <p className="text-xs font-bold text-[#F8FAFC]">Cart is empty</p>
                    <p className="text-[11px] text-[#71717A]">Click any treatment or product on the left to add</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#151515] p-3 rounded-xl border border-[#27272A] flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-[#F8FAFC]">{item.name}</div>
                            <span className="text-[10px] text-[#71717A] font-mono">{formatCurrency(item.price)} each</span>
                          </div>
                          <div className="text-xs font-mono font-bold text-[#FACC15]">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>

                        {/* Stylist Selector & Quantity controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#71717A] font-semibold">Artist:</span>
                            <select
                              value={item.staffId}
                              onChange={(e) => updateItemStaff(idx, e.target.value)}
                              className="text-[11px] font-bold bg-[#181818] border border-[#27272A] rounded-lg px-2 py-0.5 text-[#F8FAFC] focus:outline-none"
                            >
                              {staff.length === 0 ? (
                                <option value="staff_house" className="bg-[#151515] text-[#F8FAFC]">
                                  House Stylist
                                </option>
                              ) : (
                                staff.map((s) => (
                                  <option key={s.id} value={s.id} className="bg-[#151515] text-[#F8FAFC]">
                                    {s.name} ({s.commissionRate}%)
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-[#181818] border border-[#27272A] rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(idx, -1)}
                                className="p-1.5 text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#27272A] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-[#F8FAFC] font-mono">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(idx, 1)}
                                className="p-1.5 text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#27272A] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(idx)}
                              className="p-1 text-[#71717A] hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Owner Discount (% or ₹) */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
                    Custom Discount:
                  </span>
                  {appliedDiscount > 0 && (
                    <button
                      type="button"
                      onClick={() => setDiscountInput("")}
                      className="text-[11px] font-bold text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-[#27272A] bg-[#181818] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDiscountMode("percent")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                        discountMode === "percent"
                          ? "bg-[#FACC15] text-[#080808]"
                          : "text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode("amount")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                        discountMode === "amount"
                          ? "bg-[#FACC15] text-[#080808]"
                          : "text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      ₹
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={discountMode === "percent" ? 100 : undefined}
                    step="any"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder={discountMode === "percent" ? "Enter discount % (e.g. 15)" : "Enter discount ₹ (e.g. 250)"}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#181818] border border-[#27272A] text-xs text-[#F8FAFC] placeholder:text-[#71717A] font-mono focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
                {discountMessage && (
                  <p className="text-xs text-emerald-400 font-bold">{discountMessage}</p>
                )}
              </div>

              {/* Stylist Gratuity & Tip Selector (Custom % or ₹) */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" /> Stylist Tip (Optional)
                  </span>
                  {tipAmount > 0 && (
                    <span className="font-bold text-[#FACC15] font-mono">
                      +{formatCurrency(tipAmount)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTipInput("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all font-mono shrink-0 ${
                      !tipInput || tipAmount === 0
                        ? "bg-[#FACC15] text-[#080808] border-[#FACC15] shadow-sm"
                        : "bg-[#181818] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]"
                    }`}
                  >
                    No Tip
                  </button>
                  <div className="flex rounded-lg border border-[#27272A] bg-[#181818] p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTipMode("percent")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                        tipMode === "percent"
                          ? "bg-[#FACC15] text-[#080808]"
                          : "text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipMode("amount")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all ${
                        tipMode === "amount"
                          ? "bg-[#FACC15] text-[#080808]"
                          : "text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      ₹
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={tipMode === "percent" ? 100 : undefined}
                    step="any"
                    value={tipInput}
                    onChange={(e) => setTipInput(e.target.value)}
                    placeholder={tipMode === "percent" ? "Tip % (optional)" : "Tip ₹ (optional)"}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#181818] border border-[#27272A] text-xs text-[#F8FAFC] placeholder:text-[#71717A] font-mono focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="bg-[#151515] p-4 rounded-xl border border-[#27272A] space-y-2 text-xs">
                <div className="flex justify-between text-[#A1A1AA] font-medium">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#F8FAFC] font-mono">{formatCurrency(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({discountCode}):</span>
                    <span className="font-mono">- {formatCurrency(appliedDiscount)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-purple-400 font-bold">
                    <span>Points Discount:</span>
                    <span className="font-mono">- {formatCurrency(loyaltyDiscount)}</span>
                  </div>
                )}

                {tipAmount > 0 && (
                  <div className="flex justify-between text-[#FACC15] font-bold">
                    <span>Stylist Tip:</span>
                    <span className="font-mono">+{formatCurrency(tipAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#27272A] flex justify-between text-sm font-extrabold text-[#F8FAFC]">
                  <span>Total to Pay:</span>
                  <span className="text-[#FACC15] text-lg font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Error Banner */}
              {checkoutError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{checkoutError}</span>
                </div>
              )}

              {/* STEP 2: Select a Payment Method (2 Selectable Cards) */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  Step 2: Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CASH CARD */}
                  <div
                    onClick={() => {
                      if (isCashAvailable) {
                        setPaymentMethod("CASH");
                        setCheckoutError(null);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${paymentMethod === "CASH"
                        ? "bg-[#181818] border-[#FACC15] ring-1 ring-[#FACC15] shadow-lg shadow-[#FACC15]/5"
                        : "bg-[#121212] border-[#27272A] hover:border-[#3F3F46] opacity-80"
                      } ${!isCashAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Banknote className="w-5 h-5" />
                      </div>
                      {paymentMethod === "CASH" && (
                        <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#080808] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#F8FAFC]">Cash</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          Counter
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-0.5 leading-tight">
                        Customer pays at the salon counter.
                      </p>
                    </div>
                  </div>

                  {/* UPI QR CARD */}
                  <div
                    onClick={() => {
                      if (isUpiAvailable) {
                        setPaymentMethod("UPI");
                        setCheckoutError(null);
                        if (grandTotal > 0) {
                          setShowQrPopup(true);
                        }
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${paymentMethod === "UPI"
                        ? "bg-[#181818] border-[#FACC15] ring-1 ring-[#FACC15] shadow-lg shadow-[#FACC15]/5"
                        : "bg-[#121212] border-[#27272A] hover:border-[#3F3F46] opacity-80"
                      } ${isUpiAvailable
                        ? "cursor-pointer"
                        : "opacity-40 cursor-not-allowed border-dashed"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
                        <QrCode className="w-5 h-5" />
                      </div>
                      {paymentMethod === "UPI" ? (
                        <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#080808] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : !isUpiAvailable ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Unavailable
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#F8FAFC]">UPI QR</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FACC15]/20 text-[#FACC15]">
                          Direct
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-0.5 leading-tight">
                        Customer scans and pays using a UPI app.
                      </p>
                    </div>
                  </div>
                </div>

                {!isUpiAvailable && (
                  <div className="p-2.5 bg-[#141414] border border-[#27272A] rounded-xl text-[11px] text-[#A1A1AA] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      UPI QR is currently disabled or unconfigured. Salon Manager can configure the salon UPI ID in{" "}
                      <span className="text-[#FACC15] font-semibold">Settings → Salon Customer Payment Methods</span>.
                    </span>
                  </div>
                )}
              </div>

              {/* STEP 3: Dynamically Render Selected Flow */}
              {/* FLOW A: CASH COLLECTION */}
              {paymentMethod === "CASH" && (
                <div className="p-4 bg-[#141414] border border-[#27272A] rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-400" /> Cash Collection Counter
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FACC15]">
                      Bill: {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F8FAFC] block">
                      Amount Received from Guest (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#71717A]">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={cashTendered || ""}
                        onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                        placeholder={String(grandTotal)}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#181818] border border-[#27272A] rounded-xl font-mono text-base font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      />
                    </div>
                  </div>

                  {/* Quick Tender Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCashTendered(grandTotal)}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-[#181818] hover:bg-[#27272A] text-[#FACC15] rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                    >
                      Exact ({formatCurrency(grandTotal)})
                    </button>
                    {[500, 1000, 2000].map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setCashTendered(note)}
                        className="px-2.5 py-1.5 text-xs font-mono font-bold bg-[#181818] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#F8FAFC] rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                      >
                        ₹{note}
                      </button>
                    ))}
                    {[100, 500].map((add) => (
                      <button
                        key={`add-${add}`}
                        type="button"
                        onClick={() => setCashTendered((prev) => prev + add)}
                        className="px-2.5 py-1.5 text-xs font-mono font-bold bg-[#181818] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#F8FAFC] rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                      >
                        +{add}
                      </button>
                    ))}
                  </div>

                  {/* Real-time Change Calculator */}
                  <div className="p-3 bg-[#181818] border border-[#27272A] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider block">
                        Change to Return
                      </span>
                      <span className={`text-base font-mono font-black ${cashTendered >= grandTotal ? "text-emerald-400" : "text-amber-400"}`}>
                        {formatCurrency(Math.max(0, cashTendered - grandTotal))}
                      </span>
                    </div>
                    {cashTendered < grandTotal && (
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        Due: {formatCurrency(grandTotal - cashTendered)}
                      </span>
                    )}
                    {cashTendered >= grandTotal && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Balanced
                      </span>
                    )}
                  </div>

                  {/* Confirm Cash Payment Action */}
                  <button
                    type="button"
                    onClick={() => handleCheckout(false)}
                    disabled={cart.length === 0 || cashTendered < grandTotal || isSubmitting}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#080808] font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isSubmitting
                        ? "Recording Cash Payment..."
                        : `Confirm Cash Payment (${formatCurrency(grandTotal)})`}
                    </span>
                  </button>
                </div>
              )}

              {/* FLOW B: DYNAMIC UPI QR SCAN & MANUAL COUNTER CONFIRMATION */}
              {paymentMethod === "UPI" && (
                <div className="p-4 bg-[#141414] border border-[#27272A] rounded-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#FACC15]" /> Direct Salon UPI QR
                      </span>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        Payee: <span className="text-[#F8FAFC] font-semibold">{effectivePayeeName}</span>
                        {branchUpiId && resolvedBranch?.name && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#FACC15]/15 text-[#FACC15] text-[9px] font-mono">
                            {resolvedBranch.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#FACC15]">
                        Exact: {formatCurrency(grandTotal)}
                      </span>
                      {upiQrDataUrl && (
                        <button
                          type="button"
                          onClick={() => setShowQrPopup(true)}
                          className="px-2.5 py-1 rounded-lg bg-[#FACC15]/15 hover:bg-[#FACC15]/25 border border-[#FACC15]/40 text-[#FACC15] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Pop-up QR</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Centered QR Display (clickable to pop out) */}
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    {upiQrDataUrl ? (
                      <button
                        type="button"
                        onClick={() => setShowQrPopup(true)}
                        title="Click to open large customer-facing QR pop-up"
                        className="group relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02]"
                      >
                        <img src={upiQrDataUrl} alt="Salon UPI QR Code" className="w-48 h-48 block" />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5" /> Pop-up
                        </span>
                      </button>
                    ) : (
                      <div className="w-48 h-48 bg-[#181818] border border-[#27272A] rounded-2xl flex flex-col items-center justify-center text-[#71717A] p-4 text-center">
                        <QrCode className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-mono">Generating dynamic UPI QR...</span>
                      </div>
                    )}

                    {/* VPA and Copy / Open buttons */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-[#181818] border border-[#27272A] rounded-xl text-xs font-mono font-bold text-[#FACC15]">
                        {effectiveUpiId}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (effectiveUpiId) {
                            navigator.clipboard.writeText(effectiveUpiId);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs text-[#A1A1AA] hover:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                      {upiIntentUri && (
                        <a
                          href={upiIntentUri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs text-[#A1A1AA] hover:text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open App</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Verification Warning Rule Banner */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Counter Payment Verification Rule</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      Generating or scanning this QR code does NOT confirm payment. Receptionist must verify that funds were credited in the salon&apos;s receiving UPI or bank app before confirming.
                    </p>
                  </div>

                  {/* Optional Bank Reference / UTR */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-[#A1A1AA] block">
                      Customer Bank Reference / UTR (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualUtr}
                      onChange={(e) => setManualUtr(e.target.value)}
                      placeholder="e.g. 423981102948 or UPI Ref"
                      className="w-full px-3 py-2 bg-[#181818] border border-[#27272A] rounded-xl text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>

                  {/* Explicit Receptionist Confirmation Checkbox */}
                  <label className="p-3 bg-[#181818] border border-[#27272A] rounded-xl flex items-start gap-3 cursor-pointer hover:border-[#3F3F46] transition-colors">
                    <input
                      type="checkbox"
                      checked={upiConfirmedByStaff}
                      onChange={(e) => setUpiConfirmedByStaff(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#FACC15] rounded cursor-pointer shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#F8FAFC] block">
                        I confirm that payment of {formatCurrency(grandTotal)} was received in the salon&apos;s UPI account.
                      </span>
                      <span className="text-[10px] text-[#71717A]">
                        Recorded as manually verified with staff timestamp for financial audit.
                      </span>
                    </div>
                  </label>

                  {/* UPI Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCheckout(false)}
                      disabled={cart.length === 0 || !upiConfirmedByStaff || isSubmitting}
                      className="w-full py-3 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-40 disabled:cursor-not-allowed text-[#080808] font-extrabold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? "Confirming..." : "Confirm UPI Payment"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCheckout(true)}
                      disabled={cart.length === 0 || isSubmitting}
                      className="w-full py-3 px-4 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Save as Pending Bill</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Bill History Tab */
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-[#F8FAFC] text-lg">Invoices & Daily Billing Ledger</h3>
              <p className="text-xs text-[#71717A]">Official GST compliant receipt records</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-[#181818] border border-[#27272A] rounded-xl text-[#FACC15]">
              {invoices.length} Bills Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151515] text-[#71717A] font-mono uppercase tracking-wider text-[11px] border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Service & Product Breakdown</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#FACC15]">{inv.invoiceNumber}</td>
                    <td className="py-4 px-4 text-[#A1A1AA] font-mono">{inv.date}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#F8FAFC]">{inv.customerName}</div>
                      <span className="text-[11px] text-[#71717A] font-mono">{inv.customerPhone}</span>
                    </td>
                    <td className="py-4 px-4 text-[#A1A1AA] max-w-xs truncate font-medium">
                      {inv.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#181818] text-[#F8FAFC] border border-[#27272A]">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-extrabold text-[#FACC15] font-mono text-sm">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FACC15] bg-[#181818] hover:bg-[#27272A] border border-[#27272A] rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          salon={salon}
          onClose={() => setActiveInvoice(null)}
          onPaymentConfirmed={(updated) => {
            setActiveInvoice(updated);
          }}
        />
      )}

      {/* Quick Custom Charge Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#F8FAFC]">Quick Custom Charge</h3>
                  <p className="text-[11px] text-[#71717A]">Add-on service or impromptu retail item</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="p-1.5 text-[#71717A] hover:text-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1A1AA] block">Item / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Extra Styling Addon, Bridal Pinning, Special Serum"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#181818] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#A1A1AA] block">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#181818] border border-[#27272A] rounded-xl text-[#FACC15] font-bold font-mono focus:outline-none focus:border-[#FACC15]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#A1A1AA] block">Classification</label>
                  <select
                    value={customItemType}
                    onChange={(e) => setCustomItemType(e.target.value as "service" | "product")}
                    className="w-full px-3 py-2.5 text-xs bg-[#181818] border border-[#27272A] rounded-xl text-[#F8FAFC] font-bold focus:outline-none focus:border-[#FACC15]"
                  >
                    <option value="service">Treatment (Service)</option>
                    <option value="product">Retail Shelf (Product)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1A1AA] block">Attributed Stylist / Staff</label>
                <select
                  value={customItemStaffId}
                  onChange={(e) => setCustomItemStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#181818] border border-[#27272A] rounded-xl text-[#F8FAFC] font-bold focus:outline-none focus:border-[#FACC15]"
                >
                  <option value="">Default (First Clocked-in Staff)</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role} • {s.commissionRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="flex-1 py-2.5 px-3 text-xs font-bold text-[#A1A1AA] bg-[#181818] hover:bg-[#27272A] rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="flex-1 py-2.5 px-3 text-xs font-bold text-[#080808] bg-[#FACC15] hover:bg-[#EAB308] rounded-xl transition-all shadow-md shadow-[#FACC15]/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart ({formatCurrency(customItemPrice)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOMER-FACING UPI QR POP-UP MODAL */}
      {showQrPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowQrPopup(false)}
        >
          <div
            className="w-full max-w-sm bg-[#121212] border border-[#27272A] rounded-3xl shadow-2xl overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header with Salon Name */}
            <div className="px-6 pt-5 pb-4 bg-[#181818] border-b border-[#27272A] relative">
              <button
                type="button"
                onClick={() => setShowQrPopup(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                aria-label="Close QR Pop-up"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#FACC15]">
                Scan &amp; Pay via UPI
              </span>
              <h3 className="text-xl font-extrabold text-[#F8FAFC] mt-1 tracking-tight">
                {effectivePayeeName}
              </h3>
              {(resolvedBranch?.name || salon.city) && (
                <p className="text-xs text-[#71717A] mt-0.5">{resolvedBranch?.name || salon.city}</p>
              )}
            </div>

            {/* Bill Amount + Large QR */}
            <div className="p-6 space-y-4">
              <div className="inline-flex flex-col items-center px-5 py-2 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FACC15]/80">
                  Total Bill Amount
                </span>
                <span className="text-3xl font-black font-mono text-[#FACC15] tracking-tight">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="flex justify-center">
                {upiQrDataUrl ? (
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <img src={upiQrDataUrl} alt="Salon Payment QR" className="w-60 h-60 block" />
                  </div>
                ) : (
                  <div className="w-60 h-60 bg-[#181818] border border-[#27272A] rounded-2xl flex flex-col items-center justify-center text-[#71717A]">
                    <QrCode className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-mono">Generating QR...</span>
                  </div>
                )}
              </div>

              {effectiveUpiId && (
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#181818] border border-[#27272A] text-xs font-mono font-bold text-[#F8FAFC]">
                    {effectiveUpiId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(effectiveUpiId || "");
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-[#71717A]">
                GPay • PhonePe • Paytm • BHIM • Any UPI App
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrPopup(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUpiConfirmedByStaff(true);
                    setShowQrPopup(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-[#080808] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment Received</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
