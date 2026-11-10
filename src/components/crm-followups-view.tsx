"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRuvexi, Customer, Invoice, Appointment } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { FollowUpCampaign } from "@/lib/types";
import { generateWhatsAppRetentionMessage } from "@/lib/gemini-ai";
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Gift,
  RefreshCw,
  Search,
  User,
  Star,
  ShieldCheck,
  Calendar,
  Tag,
  ArrowRight,
  X,
  Crown,
  Smartphone,
  CheckCheck,
  Receipt,
  Copy,
  ExternalLink,
} from "lucide-react";

type TemplateKind = "bill" | "appointment" | "offer" | "feedback";

function toWhatsAppDigits(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function buildTemplateMessage(params: {
  kind: TemplateKind;
  customer: Customer;
  salonName: string;
  salonPhone?: string;
  salonAddress?: string;
  salonCity?: string;
  invoice?: Invoice | null;
  appointment?: Appointment | null;
  offerHeadline?: string;
}): string {
  const {
    kind,
    customer,
    salonName,
    salonPhone,
    salonAddress,
    salonCity,
    invoice,
    appointment,
    offerHeadline,
  } = params;

  const clientName = customer.name || "Valued Guest";
  const studio = salonName || "Our Salon";
  const locationLine = [salonAddress, salonCity].filter(Boolean).join(", ");
  const contactLine = salonPhone ? `Call/WhatsApp: ${salonPhone}` : "";

  if (kind === "bill") {
    if (invoice) {
      const itemsText =
        invoice.items && invoice.items.length > 0
          ? invoice.items
              .map((itm) => {
                const unit = Number(itm.price ?? itm.unitPrice ?? 0);
                const qty = Number(itm.quantity || 1);
                return `• ${itm.name}${qty > 1 ? ` x${qty}` : ""} — ${formatCurrency(unit * qty)}`;
              })
              .join("\n")
          : `• ${customer.lastService || "Salon Services"} — ${formatCurrency(invoice.total || invoice.grandTotal || 0)}`;

      const amountPaid = formatCurrency(invoice.total || invoice.grandTotal || invoice.subtotal || 0);
      const payMode = invoice.paymentMethod || "Paid";
      const invDate = invoice.date || invoice.createdAt?.slice(0, 10) || "Today";

      return [
        `Hi ${clientName}, thank you for visiting *${studio}*! ✨`,
        ``,
        `🧾 *Digital Bill Receipt*`,
        `Invoice: ${invoice.invoiceNumber}`,
        `Date: ${invDate}`,
        ``,
        `*Services / Items:*`,
        itemsText,
        ``,
        `💰 *Amount Paid:* ${amountPaid} (${payMode})`,
        ``,
        `We loved pampering you and hope to see you again soon!`,
        locationLine ? `📍 ${locationLine}` : "",
        contactLine ? `📞 ${contactLine}` : "",
      ]
        .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
        .join("\n")
        .trim();
    }

    const fallbackService = customer.lastService || "Salon Treatment";
    const fallbackAmount = customer.totalSpent > 0 ? formatCurrency(customer.totalSpent) : "₹0";
    return [
      `Hi ${clientName}, thank you for visiting *${studio}*! ✨`,
      ``,
      `🧾 *Visit & Payment Summary*`,
      `• Service: ${fallbackService}`,
      `💰 *Amount Paid:* ${fallbackAmount}`,
      ``,
      `Thank you for choosing *${studio}*! Let us know anytime you'd like to book your next visit.`,
      locationLine ? `📍 ${locationLine}` : "",
      contactLine ? `📞 ${contactLine}` : "",
    ]
      .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
      .join("\n")
      .trim();
  }

  if (kind === "appointment") {
    if (appointment) {
      const serviceText = appointment.serviceName || customer.lastService || "Salon Session";
      const slotText = [appointment.date, appointment.time].filter(Boolean).join(" at ") || "Confirmed Slot";
      const stylistText = appointment.staffName || customer.preferredStaff || "Senior Stylist";
      const priceText = appointment.price ? formatCurrency(appointment.price) : "";

      return [
        `Hi ${clientName}, your appointment with *${studio}* is confirmed! 🗓️✨`,
        ``,
        `📅 *Appointment Details*`,
        `• Service: ${serviceText}`,
        `• Time: ${slotText}`,
        `• Stylist: ${stylistText}`,
        priceText ? `• Estimated Total: ${priceText}` : "",
        ``,
        locationLine ? `📍 Location: ${locationLine}` : "",
        `Reply here if you need to reschedule. We look forward to welcoming you at *${studio}*!`,
      ]
        .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
        .join("\n")
        .trim();
    }

    return [
      `Hi ${clientName}, greetings from *${studio}*! 🗓️✨`,
      ``,
      `Would you like to schedule your next *${customer.lastService || "salon & spa"}* session with us?`,
      customer.preferredStaff ? `Your preferred stylist *${customer.preferredStaff}* has slots open this week.` : "",
      ``,
      locationLine ? `📍 ${locationLine}` : "",
      contactLine ? `📞 ${contactLine}` : "",
      `Reply with your preferred date & time and we'll reserve your chair right away!`,
    ]
      .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
      .join("\n")
      .trim();
  }

  if (kind === "offer") {
    const deal = offerHeadline?.trim() || "20% OFF on your next Hair or Skin ritual";
    return [
      `Hi ${clientName}! ✨ Special privilege from *${studio}*`,
      ``,
      `🎁 *Exclusive Offer Just For You:*`,
      `${deal}`,
      customer.loyaltyPoints > 0 ? `⭐ You also have *${customer.loyaltyPoints} Loyalty Points* ready to redeem!` : "",
      customer.lastService ? `💆 Recommended next care after your *${customer.lastService}*.` : "",
      ``,
      `Show this WhatsApp message at the front desk to redeem your privilege.`,
      locationLine ? `📍 ${locationLine}` : "",
      contactLine ? `📞 ${contactLine}` : "",
    ]
      .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
      .join("\n")
      .trim();
  }

  // feedback
  return [
    `Hi ${clientName}! 💛 Thank you for visiting *${studio}*${customer.lastService ? ` for your *${customer.lastService}*` : ""}.`,
    ``,
    `How are you loving the look and feel? Your feedback means the world to our team!`,
    `Reply on this chat with a quick rating (1-5 ⭐) or any thoughts for *${studio}*.`,
    contactLine ? `📞 ${contactLine}` : "",
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n")
    .trim();
}

export function CrmFollowupsView() {
  const {
    customers,
    followUps,
    invoices,
    appointments,
    sendFollowUp,
    createFollowUp,
    salon,
    showToast,
  } = useRuvexi();

  const [activeTab, setActiveTab] = useState<"direct" | "campaigns" | "clients">("direct");

  // Direct WhatsApp (No API needed) state
  const [composerSearch, setComposerSearch] = useState<string>("");
  const [selectedDirectCustomerId, setSelectedDirectCustomerId] = useState<string>(customers[0]?.id || "");
  const [templateKind, setTemplateKind] = useState<TemplateKind>("bill");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [offerText, setOfferText] = useState<string>("20% OFF on your next Hair or Skin treatment");
  const [directMessage, setDirectMessage] = useState<string>("");

  // Campaigns / Automated Triggers state
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(followUps[0]);
  const [customDraft, setCustomDraft] = useState<string>(followUps[0]?.suggestedMessage || "");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [sentSuccessFeedback, setSentSuccessFeedback] = useState<boolean>(false);
  const [isGeneratingAiMsg, setIsGeneratingAiMsg] = useState<boolean>(false);
  const [isSendingViaMeta, setIsSendingViaMeta] = useState(false);
  const [metaDeliveryStatus, setMetaDeliveryStatus] = useState<string | null>(null);

  // New follow-up modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [campaignType, setCampaignType] = useState<FollowUpCampaign["campaignType"]>("24h_feedback");
  const [discountOffer, setDiscountOffer] = useState<string>("10% Privilege Voucher");
  const [messageTemplate, setMessageTemplate] = useState<string>(
    `Hi {name}! ✨ We hope you loved your pampering at ${salon.name}. Reply to this WhatsApp to claim your special reward!`
  );

  // Keep a valid customer selected once hydrated
  useEffect(() => {
    if (!selectedDirectCustomerId && customers.length > 0) {
      setSelectedDirectCustomerId(customers[0].id);
    }
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedDirectCustomerId, selectedCustomerId]);

  const directCustomer = useMemo(
    () => customers.find((c) => c.id === selectedDirectCustomerId) || customers[0] || null,
    [customers, selectedDirectCustomerId]
  );

  const customerInvoices = useMemo(() => {
    if (!directCustomer) return [];
    const targetDigits = toWhatsAppDigits(directCustomer.phone);
    return invoices.filter(
      (inv) =>
        inv.customerId === directCustomer.id ||
        (inv.customerName && inv.customerName.toLowerCase() === directCustomer.name.toLowerCase()) ||
        (targetDigits && toWhatsAppDigits(inv.customerPhone) === targetDigits)
    );
  }, [invoices, directCustomer]);

  const customerAppointments = useMemo(() => {
    if (!directCustomer) return [];
    const targetDigits = toWhatsAppDigits(directCustomer.phone);
    return appointments.filter(
      (apt) =>
        apt.customerId === directCustomer.id ||
        (apt.customerName && apt.customerName.toLowerCase() === directCustomer.name.toLowerCase()) ||
        (targetDigits && toWhatsAppDigits(apt.customerPhone) === targetDigits)
    );
  }, [appointments, directCustomer]);

  const activeInvoice = useMemo(() => {
    if (customerInvoices.length === 0) return null;
    return customerInvoices.find((i) => i.id === selectedInvoiceId) || customerInvoices[0];
  }, [customerInvoices, selectedInvoiceId]);

  const activeAppointment = useMemo(() => {
    if (customerAppointments.length === 0) return null;
    return customerAppointments.find((a) => a.id === selectedAppointmentId) || customerAppointments[0];
  }, [customerAppointments, selectedAppointmentId]);

  // Reset selected invoice/appointment when switching customer
  useEffect(() => {
    setSelectedInvoiceId(customerInvoices[0]?.id || "");
    setSelectedAppointmentId(customerAppointments[0]?.id || "");
  }, [directCustomer?.id]);

  // Auto-fill WhatsApp message whenever customer, template, invoice, appointment, offer, or salon details change
  useEffect(() => {
    if (!directCustomer) {
      setDirectMessage("");
      return;
    }
    const generated = buildTemplateMessage({
      kind: templateKind,
      customer: directCustomer,
      salonName: salon.name,
      salonPhone: salon.phone,
      salonAddress: salon.address,
      salonCity: salon.city,
      invoice: activeInvoice,
      appointment: activeAppointment,
      offerHeadline: offerText,
    });
    setDirectMessage(generated);
  }, [
    directCustomer,
    templateKind,
    activeInvoice,
    activeAppointment,
    offerText,
    salon.name,
    salon.phone,
    salon.address,
    salon.city,
  ]);

  const directWhatsAppDigits = toWhatsAppDigits(directCustomer?.phone);

  const handleOpenDirectWhatsApp = (phone?: string, text?: string) => {
    const digits = toWhatsAppDigits(phone);
    if (!digits) {
      showToast("Selected customer does not have a valid phone number.", "error");
      return;
    }
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text || "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("WhatsApp message copied to clipboard!", "success");
    } catch {
      showToast("Could not copy automatically — please select and copy the text.", "info");
    }
  };

  const composerFilteredCustomers = useMemo(() => {
    const q = composerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.lastService || "").toLowerCase().includes(q)
    );
  }, [customers, composerSearch]);

  const pendingCount = followUps.filter((f) => String(f.status || "").toLowerCase() === "pending").length;
  const sentCount = followUps.filter((f) =>
    ["sent", "delivered"].includes(String(f.status || "").toLowerCase())
  ).length;

  const handleSelectCampaign = (campaign: any) => {
    setSelectedFollowUp(campaign);
    setCustomDraft(campaign.suggestedMessage);
    setSentSuccessFeedback(false);
  };

  const handleSendCampaign = async () => {
    if (!selectedFollowUp) return;
    setIsSendingViaMeta(true);
    setMetaDeliveryStatus(null);

    try {
      const data = await RuvexiApi.sendWhatsAppCampaign({
        customerPhone: selectedFollowUp.customerPhone,
        customerName: selectedFollowUp.customerName,
        message: customDraft,
        followupId: selectedFollowUp.id,
      });
      if (data?.success) {
        setMetaDeliveryStatus(
          data.is_live
            ? "Delivered live via Meta Cloud API"
            : "Dispatched via Sandbox WhatsApp Mode"
        );
        sendFollowUp(selectedFollowUp.id);
        setSentSuccessFeedback(true);
        setTimeout(() => setSentSuccessFeedback(false), 5000);
      } else {
        setMetaDeliveryStatus(
          data?.error ||
            data?.message ||
            "Meta Cloud API is not connected. Use Open Directly in WhatsApp above."
        );
      }
    } catch (err: any) {
      setMetaDeliveryStatus(
        err?.message || "Failed to reach Meta Cloud API. Use Open Directly in WhatsApp above."
      );
    } finally {
      setIsSendingViaMeta(false);
    }
  };

  const insertSmartTag = (tag: string) => {
    setCustomDraft((prev) => prev + " " + tag);
  };

  const handleCreateNewCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    createFollowUp({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      campaignType,
      scheduledFor: "Scheduled for Today",
      serviceTrigger: "Manual Engagement Trigger",
      suggestedMessage: messageTemplate.replace("{name}", cust.name),
      discountOffer,
    });

    setShowNewModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch) ||
      c.tags.some((t) => t.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shadow-lg shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                WhatsApp Messaging &amp; Templates
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                1-Click WhatsApp Ready • No API Required
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Pick any customer • Auto-fill previous bill, booking, or offers with {salon.name} • Open directly on WhatsApp
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap bg-[#181818] p-1 rounded-xl border border-[#27272A] text-xs">
            <button
              onClick={() => setActiveTab("direct")}
              className={`px-3.5 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "direct"
                  ? "bg-[#25D366] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Direct WhatsApp Templates
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-3.5 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "campaigns"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Retention Triggers ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-3.5 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "clients"
                  ? "bg-[#FACC15] text-[#080808] shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Client Directory ({customers.length})
            </button>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> New Trigger
          </button>
        </div>
      </div>

      {activeTab === "direct" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Picker + Template Picker */}
          <div className="lg:col-span-5 space-y-5">
            {/* Step 1: Select Customer */}
            <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#FACC15] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Select Customer</span>
                </h3>
                <span className="text-[11px] font-mono text-[#71717A]">{customers.length} in database</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search by customer name or mobile..."
                  value={composerSearch}
                  onChange={(e) => setComposerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              {composerFilteredCustomers.length === 0 ? (
                <div className="p-6 text-center bg-[#151515] border border-dashed border-[#27272A] rounded-xl text-xs text-[#71717A]">
                  No customers found. Add a customer in Front Desk or Customers first.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {composerFilteredCustomers.map((cust) => {
                    const isSelected = directCustomer?.id === cust.id;
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => setSelectedDirectCustomerId(cust.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#181818] border-[#25D366] ring-1 ring-[#25D366]/30"
                            : "bg-[#151515] border-[#27272A] hover:border-[#3F3F46]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#F8FAFC] truncate flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            {cust.visitsCount > 0 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101010] border border-[#27272A] text-[#FACC15]">
                                {cust.visitsCount}x
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[#A1A1AA] mt-0.5">{cust.phone || "No phone"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-[#FACC15]">
                            {formatCurrency(cust.totalSpent || 0)}
                          </div>
                          <div className="text-[10px] text-[#71717A] truncate max-w-[110px]">
                            {cust.lastService || "Client"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select Template */}
            <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-[#FACC15] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>2. Choose Message Template</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: "bill" as TemplateKind,
                    label: "Previous Bill",
                    desc: "Services & amount paid",
                    icon: Receipt,
                  },
                  {
                    id: "appointment" as TemplateKind,
                    label: "Appointment",
                    desc: "Slot, service & stylist",
                    icon: Calendar,
                  },
                  {
                    id: "offer" as TemplateKind,
                    label: "Special Offer",
                    desc: "Discount & loyalty pts",
                    icon: Gift,
                  },
                  {
                    id: "feedback" as TemplateKind,
                    label: "Review & Care",
                    desc: "Post-visit check-in",
                    icon: Star,
                  },
                ].map((tpl) => {
                  const Icon = tpl.icon;
                  const active = templateKind === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateKind(tpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? "bg-[#FACC15]/10 border-[#FACC15] text-[#F8FAFC]"
                          : "bg-[#151515] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Icon className={`w-4 h-4 ${active ? "text-[#FACC15]" : "text-[#71717A]"}`} />
                        <span>{tpl.label}</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] mt-1">{tpl.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Contextual Record Pickers */}
              {templateKind === "bill" && customerInvoices.length > 0 && (
                <div className="pt-2 border-t border-[#27272A]">
                  <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">
                    Auto-filled from Previous Bill ({customerInvoices.length} found):
                  </label>
                  <select
                    value={activeInvoice?.id || ""}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                  >
                    {customerInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-[#151515]">
                        {inv.invoiceNumber} • {formatCurrency(inv.total || inv.grandTotal || 0)} ({inv.date || inv.createdAt?.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {templateKind === "appointment" && customerAppointments.length > 0 && (
                <div className="pt-2 border-t border-[#27272A]">
                  <label className="text-[11px] font-mono text-[#A1A1AA] block mb-1">
                    Auto-filled from Booking ({customerAppointments.length} found):
                  </label>
                  <select
                    value={activeAppointment?.id || ""}
                    onChange={(e) => setSelectedAppointmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                  >
                    {customerAppointments.map((apt) => (
                      <option key={apt.id} value={apt.id} className="bg-[#151515]">
                        {apt.serviceName} • {apt.time} ({apt.staffName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {templateKind === "offer" && (
                <div className="pt-2 border-t border-[#27272A] space-y-2">
                  <label className="text-[11px] font-mono text-[#A1A1AA] block">
                    Customize Offer Headline:
                  </label>
                  <input
                    type="text"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="e.g. 20% OFF on Keratin & Hair Spa"
                    className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "20% OFF on your next Hair or Skin treatment",
                      "Flat ₹500 OFF on Spa & Facial rituals",
                      "Complimentary Hair Wash & Blowdry with any Haircut",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOfferText(preset)}
                        className="px-2 py-1 rounded-lg bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#FACC15] cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Auto-filled Preview + Direct wa.me Dispatch */}
          <div className="lg:col-span-7 bg-[#101010] border border-[#27272A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#25D366]" />
                  <span>3. Review &amp; Send Directly on WhatsApp</span>
                </h3>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  Automatically opens that customer&apos;s WhatsApp chat with everything filled in
                </p>
              </div>
              {directCustomer && (
                <div className="px-3 py-1.5 rounded-xl bg-[#151515] border border-[#27272A] text-xs font-mono flex items-center gap-2 w-fit">
                  <span className="text-[#A1A1AA]">To:</span>
                  <span className="text-[#25D366] font-bold">
                    {directCustomer.name} ({directCustomer.phone || "No number"})
                  </span>
                </div>
              )}
            </div>

            {!directCustomer ? (
              <div className="py-12 text-center text-xs text-[#71717A]">
                Select a customer from the left to generate their personalized WhatsApp message.
              </div>
            ) : (
              <>
                {/* WhatsApp Bubble Preview */}
                <div
                  className="rounded-2xl border border-[#27272A] p-4 sm:p-5 space-y-3"
                  style={{
                    backgroundColor: "#0b141a",
                    backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#8696a0] font-mono border-b border-white/10 pb-2">
                    <span className="font-bold text-white">{salon.name}</span>
                    <span>wa.me/{directWhatsAppDigits || "—"}</span>
                  </div>

                  <div className="ml-auto bg-[#005c4b] text-white p-3.5 rounded-xl rounded-tr-none max-w-lg shadow-lg">
                    <p className="whitespace-pre-line text-xs leading-relaxed font-sans">{directMessage}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#d1d5db]/70 mt-1.5 font-mono">
                      <span>Ready to send</span>
                      <CheckCheck className="w-3 h-3 text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* Editable Message Box */}
                <div>
                  <label className="text-[11px] font-mono font-bold text-[#A1A1AA] block mb-1.5 uppercase tracking-wider">
                    Edit Message Before Sending (Auto-Filled):
                  </label>
                  <textarea
                    rows={8}
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    className="w-full p-3.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#25D366] leading-relaxed font-sans"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(directMessage)}
                    className="sm:w-44 py-3 px-4 bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] font-bold text-xs rounded-xl border border-[#27272A] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#FACC15]" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    type="button"
                    disabled={!directWhatsAppDigits || !directMessage.trim()}
                    onClick={() => handleOpenDirectWhatsApp(directCustomer.phone, directMessage)}
                    className="flex-1 py-3 px-5 bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-[#080808] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      Open in WhatsApp ({directCustomer.phone || "No Number"})
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : activeTab === "campaigns" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scheduled Trigger Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-serif font-bold text-[#F8FAFC] tracking-tight">
                Scheduled Retention Triggers ({followUps.length})
              </h3>
              <span className="text-xs text-[#71717A] font-mono">
                <b className="text-[#F8FAFC]">{pendingCount}</b> pending •{" "}
                <b className="text-emerald-400">{sentCount}</b> sent
              </span>
            </div>

            <div className="space-y-3">
              {followUps.map((campaign) => {
                const isSelected = selectedFollowUp?.id === campaign.id;
                const isSent = campaign.status === "Sent" || campaign.status === "Delivered";

                return (
                  <div
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className={`bg-[#151515] border p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#FACC15] ring-1 ring-[#FACC15]/30 shadow-lg bg-[#181818]"
                        : "border-[#27272A] hover:border-[#27272A]/80 hover:bg-[#181818]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`p-2 rounded-lg text-xs ${
                              campaign.campaignType === "24h_feedback"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : campaign.campaignType === "color_touchup"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                : campaign.campaignType === "win_back"
                                ? "bg-amber-500/10 text-[#FACC15] border border-[#FACC15]/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {campaign.campaignType === "24h_feedback" && <Star className="w-4 h-4" />}
                            {campaign.campaignType === "color_touchup" && <RefreshCw className="w-4 h-4" />}
                            {campaign.campaignType === "win_back" && <Clock className="w-4 h-4" />}
                            {campaign.campaignType === "birthday_offer" && <Gift className="w-4 h-4" />}
                          </span>

                          <div>
                            <span className="text-xs font-bold text-[#F8FAFC] tracking-tight">
                              {campaign.campaignType === "24h_feedback" && "24h Post-Care & Review Request"}
                              {campaign.campaignType === "color_touchup" && "21-Day Refresh & Root Touch-up"}
                              {campaign.campaignType === "win_back" && "45-Day Inactive Win-Back Alert"}
                              {campaign.campaignType === "birthday_offer" && "Celebration Glamour Voucher"}
                            </span>
                            <span className="text-[10px] text-[#71717A] block font-mono">
                              Triggered by: {campaign.serviceTrigger}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isSent
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                              : "bg-[#181818] text-[#71717A] border border-[#27272A]"
                          }`}
                        >
                          {isSent && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          {campaign.status}
                        </span>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#F8FAFC]">{campaign.customerName}</h4>
                          <p className="text-xs text-[#71717A] font-mono">{campaign.customerPhone}</p>
                        </div>
                        {campaign.discountOffer && (
                          <span className="text-[10px] font-mono font-bold text-[#FACC15] bg-[#181818] border border-[#27272A] px-2.5 py-0.5 rounded-full">
                            🎁 {campaign.discountOffer}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 bg-[#101010] p-3 rounded-lg border border-[#27272A] text-xs text-[#A1A1AA] line-clamp-2 italic leading-relaxed">
                        &ldquo;{campaign.suggestedMessage}&rdquo;
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between text-xs">
                      <span className="text-[#71717A] flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[#71717A]" /> {campaign.scheduledFor}
                      </span>
                      <span className="font-bold text-[#FACC15] flex items-center gap-1">
                        Preview &amp; Dispatch <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AMOLED Smartphone Mockup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> WhatsApp Preview
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {salon.name}
                </span>
              </div>

              {/* iPhone AMOLED Frame */}
              <div className="rounded-[2rem] overflow-hidden border-2 border-[#27272A] shadow-2xl bg-[#0b141a] relative max-w-sm mx-auto w-full">
                <div className="bg-[#080808] h-4 w-24 mx-auto rounded-b-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#151515] border border-[#27272A]"></div>
                </div>

                {/* WhatsApp Chat Top Bar */}
                <div className="bg-[#1f2c34] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#27272A]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={salon.logo || salon.logoUrl || "/images/ruvexi-logo.png"}
                        alt="Salon Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-[#27272A]"
                      />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#1f2c34]"></span>
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1 text-white">
                        {salon.name.slice(0, 22)}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      </div>
                      <p className="text-[10px] text-[#71717A] font-mono">Official Salon Account</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Encrypted</span>
                </div>

                {/* Chat Background & Message Bubbles */}
                <div
                  className="p-4 space-y-3 min-h-[240px] flex flex-col justify-end"
                  style={{
                    backgroundColor: "#0b141a",
                    backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                >
                  <div className="mx-auto bg-[#182229] text-[#8696a0] text-[10px] px-3 py-1 rounded-lg text-center max-w-[260px] font-mono">
                    🔒 Messages are end-to-end encrypted
                  </div>

                  {/* Outgoing WhatsApp Bubble */}
                  <div className="self-end bg-[#005c4b] text-white p-3.5 rounded-xl rounded-tr-none max-w-[92%] shadow-lg text-xs space-y-2">
                    <p className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                      {customDraft}
                    </p>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] pt-0.5 font-mono">
                      <span>Just now</span>
                      <CheckCheck className="w-3 h-3 text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Tag Insertion Bar */}
              <div>
                <span className="text-[11px] font-mono font-bold text-[#71717A] block mb-1.5 uppercase tracking-wider">
                  Personalization Tokens:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => insertSmartTag("{name}")}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {"{name}"}
                  </button>
                  <button
                    onClick={() => insertSmartTag("{stylist}")}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {"{stylist}"}
                  </button>
                  <button
                    onClick={() => insertSmartTag(salon.name)}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#FACC15] rounded-lg text-[10px] font-mono cursor-pointer"
                  >
                    + {salon.name}
                  </button>
                </div>
              </div>

              {/* Editable Draft Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-[#A1A1AA]">
                    Customize Message Content:
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingAiMsg || !selectedFollowUp}
                    onClick={async () => {
                      if (!selectedFollowUp) return;
                      setIsGeneratingAiMsg(true);
                      const res = await generateWhatsAppRetentionMessage(
                        selectedFollowUp.customerName,
                        selectedFollowUp.serviceName || "Bespoke Treatment",
                        selectedFollowUp.daysSinceLastVisit || 28
                      );
                      setIsGeneratingAiMsg(false);
                      if (res.message) {
                        setCustomDraft(res.message);
                      }
                    }}
                    className="text-[10px] font-mono text-[#FACC15] hover:text-[#EAB308] flex items-center gap-1 font-bold disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#FACC15]" />
                    <span>{isGeneratingAiMsg ? "Gemini AI Composing..." : "Re-write with Gemini AI"}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  className="w-full p-3 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] leading-relaxed font-sans"
                />
              </div>

              {/* Action Trigger Buttons */}
              <div className="space-y-2">
                {selectedFollowUp && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenDirectWhatsApp(selectedFollowUp.customerPhone, customDraft);
                      sendFollowUp(selectedFollowUp.id);
                    }}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-[#080808] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Directly in WhatsApp ({selectedFollowUp.customerPhone})</span>
                  </button>
                )}

                <button
                  onClick={handleSendCampaign}
                  disabled={
                    String(selectedFollowUp?.status || "").toLowerCase() === "sent" ||
                    isSendingViaMeta ||
                    !selectedFollowUp
                  }
                  className="w-full py-3 px-4 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingViaMeta
                      ? "Dispatching via Meta Cloud API..."
                      : String(selectedFollowUp?.status || "").toLowerCase() === "sent"
                      ? "Already Dispatched via WhatsApp"
                      : "Dispatch via Meta WhatsApp Cloud API"}
                  </span>
                </button>

                {metaDeliveryStatus && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-center gap-2 animate-in fade-in ${
                      metaDeliveryStatus.toLowerCase().includes("delivered") ||
                      metaDeliveryStatus.toLowerCase().includes("dispatched")
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{metaDeliveryStatus}</span>
                  </div>
                )}
                {sentSuccessFeedback && (
                  <div className="mt-2.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold animate-in fade-in">
                    Dispatch verified! Status updated in CRM database.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Client Directory Tab */
        <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">VIP &amp; Loyal Customer Directory</h3>
              <p className="text-xs text-[#71717A]">Click WhatsApp on any customer to auto-fill their bill, booking, or offer</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search clients by name, tag or phone..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151515] text-[#71717A] font-mono text-[11px] uppercase tracking-wider border-b border-[#27272A]">
                <tr>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Visits &amp; Lifetime Spend</th>
                  <th className="py-3.5 px-4">Loyalty Tier</th>
                  <th className="py-3.5 px-4">Preferred Artist</th>
                  <th className="py-3.5 px-4">Direct WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FACC15]" />
                        {cust.name}
                      </div>
                      <span className="text-[11px] text-[#71717A]">{cust.gender}</span>
                    </td>

                    <td className="py-4 px-4 text-[#A1A1AA]">
                      <div className="font-mono">{cust.phone}</div>
                      <span className="text-[11px] text-[#71717A]">{cust.email}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#FACC15] font-mono">{formatCurrency(cust.totalSpent)}</div>
                      <span className="text-[11px] text-[#71717A] font-mono">{cust.visitsCount} visits</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#181818] text-[#FACC15] border border-[#27272A] flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                        {cust.loyaltyPoints} Pts
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-[#F8FAFC]">{cust.preferredStaff || "Any Stylist"}</td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDirectCustomerId(cust.id);
                          setActiveTab("direct");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Compose &amp; Send</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Follow-up Campaign Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">Schedule Retention Trigger</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCampaign} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Select Client</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-bold text-[#F8FAFC]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#151515] text-[#F8FAFC]">
                      {c.name} ({c.phone}) - {c.lastService}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Trigger Objective</label>
                <select
                  value={campaignType}
                  onChange={(e: any) => setCampaignType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl focus:outline-none focus:border-[#FACC15] font-bold text-[#F8FAFC]"
                >
                  <option value="24h_feedback" className="bg-[#151515] text-[#F8FAFC]">24h Post-Care &amp; Review Request</option>
                  <option value="color_touchup" className="bg-[#151515] text-[#F8FAFC]">Color &amp; Keratin Touch-up Reminder</option>
                  <option value="win_back" className="bg-[#151515] text-[#F8FAFC]">45-Day Win-Back Re-activation</option>
                  <option value="birthday_offer" className="bg-[#151515] text-[#F8FAFC]">Birthday Celebration Special</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Attached Privilege Offer</label>
                <input
                  type="text"
                  value={discountOffer}
                  onChange={(e) => setDiscountOffer(e.target.value)}
                  placeholder="e.g. 15% VIP code or Free Treatment"
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Message Body</label>
                <textarea
                  rows={3}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Schedule Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
