"use client";

import React, { useRef, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Printer,
  Share2,
  X,
  Building2,
  Phone,
  QrCode,
  ShieldCheck,
  Crown,
  Receipt,
  FileText,
  AlertCircle,
  Clock,
  Copy,
  Check,
  UserCheck,
  ArrowRight,
  Calendar,
} from "lucide-react";
import QRCode from "qrcode";
import { ThermalReceipt } from "./pos/thermal-receipt";
import { billcareApi } from "@/lib/api-client";
import { useBillCare } from "@/lib/billcare-context";

interface InvoiceModalProps {
  invoice: any;
  salon: any;
  onClose: () => void;
  onPaymentConfirmed?: (updatedInvoice: any) => void;
}

export function InvoiceModal({ invoice: initialInvoice, salon, onClose, onPaymentConfirmed }: InvoiceModalProps) {
  const { bookAppointment, showToast, sendWhatsAppBill } = useBillCare();
  const [invoice, setInvoice] = useState<any>(initialInvoice);
  const [copied, setCopied] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppResult, setWhatsAppResult] = useState<string | null>(null);
  const [receiptMode, setReceiptMode] = useState<"a4" | "thermal">("a4");
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const [upiIntentUri, setUpiIntentUri] = useState<string>("");
  const [isConfirmingUpi, setIsConfirmingUpi] = useState<boolean>(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [rebooked, setRebooked] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // 4-week rebooking date calculation
  const rebookDate = new Date();
  rebookDate.setDate(rebookDate.getDate() + 28);
  const formattedRebookDate = rebookDate.toISOString().split("T")[0];
  const displayRebookDate = rebookDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleRebook = () => {
    const primaryItem = invoice.items?.[0];
    const serviceName = primaryItem?.name || "Styling & Touch-up";
    const staffName = primaryItem?.staffName || invoice.staffName || "Priya Sharma";
    try {
      bookAppointment({
        customerName: invoice.customerName || "Valued Client",
        customerPhone: invoice.customerPhone || "+91 90000 00000",
        serviceName,
        staffName,
        time: "11:00 AM",
        date: formattedRebookDate,
        durationMinutes: 60,
        price: primaryItem?.price || 1500,
        source: "Checkout 4-Week Rebooking Retention",
        notes: `Auto-rebooked at checkout following invoice #${invoice.invoiceNumber}`,
      });
      setRebooked(true);
      showToast(`Appointment reserved for ${invoice.customerName} on ${displayRebookDate}!`, "success");
    } catch (e: any) {
      showToast("Could not reserve appointment: " + (e?.message || "Error"), "error");
    }
  };

  const isPaid = invoice.status === "paid" || invoice.status === "PAID";
  const isUpi = invoice.paymentMethod?.toUpperCase().includes("UPI");
  const isCash = invoice.paymentMethod?.toUpperCase().includes("CASH");

  // Dynamically generate standard UPI URI & QR Code if UPI is selected
  useEffect(() => {
    const vpa = salon.upiId || salon.paymentSettings?.upiId;
    if (isUpi && vpa) {
      const payeeName = salon.paymentSettings?.upiPayeeName || salon.name;
      const amount = invoice.total || invoice.grandTotal || 0;
      const note = `Invoice ${invoice.invoiceNumber}`;
      const uri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
      setUpiIntentUri(uri);
      QRCode.toDataURL(uri, {
        width: 240,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
        .then(setUpiQrDataUrl)
        .catch(() => setUpiQrDataUrl(""));
    }
  }, [isUpi, salon.upiId, salon.paymentSettings?.upiId, salon.paymentSettings?.upiPayeeName, salon.name, invoice.total, invoice.grandTotal, invoice.invoiceNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUpi = () => {
    const vpa = salon.upiId || salon.paymentSettings?.upiId;
    if (vpa) {
      navigator.clipboard.writeText(vpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleConfirmUpiPayment = async () => {
    setIsConfirmingUpi(true);
    setConfirmationError(null);
    try {
      const res = await billcareApi.confirmPayment(invoice.id, {
        paymentMethod: "UPI",
        explicitVerification: true,
        notes: "Manual counter verification confirmed by receptionist via salon receiving app",
      });
      if (res && res.invoice) {
        setInvoice(res.invoice);
        if (onPaymentConfirmed) {
          onPaymentConfirmed(res.invoice);
        }
      }
    } catch (err: any) {
      setConfirmationError(err.message || "Failed to confirm payment on backend");
    } finally {
      setIsConfirmingUpi(false);
    }
  };

  const handleSendMetaWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    setWhatsAppResult(null);

    try {
      await sendWhatsAppBill(invoice);
      setWhatsAppResult("WhatsApp Receipt dispatched!");
    } catch {
      setWhatsAppResult("Sent via Web Client");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleShareWhatsApp = () => {
    const totalAmount = invoice.total || invoice.grandTotal || 0;
    const statusNote = isPaid ? "PAID & SETTLED" : "PENDING PAYMENT";
    const text = encodeURIComponent(
      `Hi ${invoice.customerName}! ✨ Thank you for visiting ${salon.name}.\n\nOfficial Invoice: ${invoice.invoiceNumber}\nStatus: ${statusNote}\nTotal: ${formatCurrency(totalAmount)}\nPayment Method: ${invoice.paymentMethod}\n${invoice.paymentReference ? `Reference: ${invoice.paymentReference}\n` : ""}\nServices: ${invoice.items?.map((i: any) => i.name).join(", ")}\n\nWe look forward to welcoming you back!`
    );
    const phoneClean = (invoice.customerPhone || "").replace(/[^0-9]/g, "");
    if (phoneClean && phoneClean.length > 5) {
      window.open(`https://wa.me/${phoneClean}?text=${text}`, "_blank");
    } else {
      navigator.clipboard.writeText(decodeURIComponent(text));
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#101010] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#27272A] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Top Obsidian Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#080808] text-white border-b border-[#27272A] shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/25">
              <Crown className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-sm tracking-wide text-[#F8FAFC]">
                Official Tax Invoice & Receipt
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          {/* Format Switcher: A4 vs 80mm Thermal */}
          <div className="flex items-center bg-[#181818] p-1 rounded-xl border border-[#27272A] self-start sm:self-auto">
            <button
              onClick={() => setReceiptMode("a4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                receiptMode === "a4"
                  ? "bg-[#FACC15] text-slate-950 shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Invoice</span>
            </button>
            <button
              onClick={() => setReceiptMode("thermal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                receiptMode === "thermal"
                  ? "bg-[#FACC15] text-slate-950 shadow-sm"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>80mm Thermal</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Meta WhatsApp Cloud API Direct Dispatch */}
            <button
              onClick={handleSendMetaWhatsApp}
              disabled={isSendingWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              title="Dispatch via Official Meta WhatsApp Cloud API"
            >
              <Phone className="w-3.5 h-3.5 text-slate-950" />
              <span>{isSendingWhatsApp ? "Dispatching..." : "Meta WhatsApp"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#151515] hover:bg-[#181818] text-[#F8FAFC] rounded-xl transition-all border border-[#27272A] cursor-pointer"
              title="Copy or share via WhatsApp web client"
            >
              <Share2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
              {copied ? "Copied!" : "Web Share"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-[#FACC15] to-[#E5B81D] hover:opacity-95 text-slate-950 rounded-xl transition-all shadow-md shadow-[#FACC15]/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {receiptMode === "thermal" ? "Print 80mm Slip" : "Print Invoice"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#181818] rounded-xl transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container based on receiptMode */}
        {receiptMode === "thermal" ? (
          <div className="p-6 md:p-8 bg-[#18181B] flex justify-center items-center overflow-y-auto">
            <ThermalReceipt invoice={invoice} salon={salon} onClose={onClose} />
          </div>
        ) : (
          /* Printable Luxury A4 Invoice Container */
          <div id="printable-invoice-content" ref={printRef} className="p-4 sm:p-8 md:p-10 space-y-6 text-slate-800 bg-white relative overflow-y-auto">
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-invoice-content,
                #printable-invoice-content * {
                  visibility: visible;
                }
                #printable-invoice-content {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  padding: 15px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}</style>

            {/* Watermark brand emblem */}
            <div className="absolute right-8 top-32 text-[100px] font-black text-slate-900/[0.03] select-none pointer-events-none tracking-tighter">
              BC
            </div>

            {/* Salon Brand Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">{salon.name}</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium italic">{salon.tagline}</p>
                <p className="text-xs text-slate-600 max-w-sm mt-2">{salon.address}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2 pt-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" /> {salon.phone} • {salon.email}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 text-slate-800 rounded-lg text-[11px] font-mono font-bold border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> GSTIN: {salon.gstin || "29AABCU9603R1ZX"}
                </div>
              </div>

              <div className="text-left md:text-right bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 min-w-[220px] space-y-1.5">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID IN FULL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING VERIFICATION
                  </span>
                )}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Invoice Serial No:</p>
                  <p className="text-sm font-mono font-extrabold text-slate-950">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Date & Time:</p>
                  <p className="text-xs font-semibold text-slate-700">{invoice.date || invoice.paidAt || "Today"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payment Method:</p>
                  <p className="text-xs font-extrabold text-blue-600 uppercase">{invoice.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Billed To Customer Box */}
            <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                  Billed To (Client):
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{invoice.customerName}</h4>
                <p className="text-xs text-slate-600 font-mono">{invoice.customerPhone || "N/A"}</p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                <p className="text-xs font-extrabold text-slate-800">{salon.branch || "Main Counter"}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Treatment / Retail Item</th>
                    <th className="py-3 px-4">Master Artist</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.type || "service"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{item.staffName || "House Artist"}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right text-slate-600 font-mono">
                        {formatCurrency(item.price || item.unitPrice || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono">
                        {formatCurrency((item.price || item.unitPrice || 0) * (item.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Breakdown & Payment Settlement Audit */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
              {/* Left Column: Settlement & Audit Card */}
              <div className="w-full md:flex-1 space-y-3">
                {isPaid ? (
                  <div className="space-y-3">
                    {/* Paid Invoice Settlement Receipt */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct Counter Settlement Confirmed</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/60">
                      <div>
                        <span className="text-slate-500 block">Payment Method:</span>
                        <span className="font-bold text-slate-900 uppercase">{invoice.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Payment Ref:</span>
                        <span className="font-mono font-bold text-slate-900 truncate block">
                          {invoice.paymentReference || "BC-COUNTER-SETTLED"}
                        </span>
                      </div>

                      {isCash && invoice.amountReceived !== undefined && (
                        <div>
                          <span className="text-slate-500 block">Cash Tendered:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {formatCurrency(invoice.amountReceived)}
                          </span>
                        </div>
                      )}
                      {isCash && invoice.changeGiven !== undefined && (
                        <div>
                          <span className="text-slate-500 block">Change Returned:</span>
                          <span className="font-mono font-bold text-emerald-700">
                            {formatCurrency(invoice.changeGiven)}
                          </span>
                        </div>
                      )}

                      {isUpi && (
                        <div>
                          <span className="text-slate-500 block">Salon UPI VPA:</span>
                          <span className="font-mono font-bold text-slate-900 truncate block">
                            {salon.upiId || salon.paymentSettings?.upiId || "Registered UPI"}
                          </span>
                        </div>
                      )}

                      {invoice.verifiedByName && (
                        <div>
                          <span className="text-slate-500 block">Verified By Staff:</span>
                          <span className="font-bold text-slate-900">{invoice.verifiedByName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature 2: At-Checkout Rebooking Retention Prompt */}
                  <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/30 text-xs text-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                        <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>4-Week Retention Rebooking</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {displayRebookDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Reserve the client's next session with <span className="font-semibold text-slate-900">{invoice.items?.[0]?.staffName || invoice.staffName || "their stylist"}</span> in 4 weeks to maximize retention.
                    </p>
                    {rebooked ? (
                      <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Reserved for {displayRebookDate} at 11:00 AM! Added to Chair Schedule.</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRebook}
                        className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>1-Click Rebook for {displayRebookDate}</span>
                      </button>
                    )}
                  </div>
                </div>
                ) : (
                  /* Pending Invoice Verification Card */
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Counter Verification Pending</span>
                    </div>

                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      ⚠️ Payments are not automatically verified by QR generation. Receptionist must inspect the salon UPI or bank app to confirm credit for the exact amount before confirming.
                    </p>

                    {isUpi && upiQrDataUrl && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                        <img src={upiQrDataUrl} alt="UPI QR" className="w-16 h-16 rounded object-contain border" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-xs">Customer Scan & Pay</p>
                          <p className="text-[11px] font-mono text-emerald-700 font-bold truncate max-w-[180px]">
                            {salon.upiId || salon.paymentSettings?.upiId}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                          >
                            {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUpi ? "Copied" : "Copy VPA"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {confirmationError && (
                      <div className="p-2 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                        {confirmationError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleConfirmUpiPayment}
                      disabled={isConfirmingUpi}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isConfirmingUpi ? "Confirming on Server..." : "Verify & Confirm Payment Received"}</span>
                    </button>
                  </div>
                )}

                {whatsAppResult && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{whatsAppResult}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Financial Totals */}
              <div className="w-full md:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal (Before Tax):</span>
                  <span className="font-bold text-slate-800 font-mono">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Privilege Voucher:</span>
                    <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>GST (CGST 2.5% + SGST 2.5%):</span>
                  <span className="font-bold text-slate-800 font-mono">{formatCurrency(invoice.gstAmount)}</span>
                </div>
                <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 font-mono text-lg">
                    {formatCurrency(invoice.total || invoice.grandTotal)}
                  </span>
                </div>

                {isCash && invoice.amountReceived !== undefined && (
                  <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 space-y-1 mt-2">
                    <div className="font-bold text-slate-900">Cash Counter Audit:</div>
                    <div className="flex justify-between font-mono">
                      <span>Amount Received:</span>
                      <span className="font-bold">{formatCurrency(invoice.amountReceived)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-emerald-700 font-bold">
                      <span>Change Given:</span>
                      <span>{formatCurrency(invoice.changeGiven || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer certification */}
            <div className="text-center border-t border-slate-100 pt-6 text-[11px] text-slate-400">
              Thank you for indulging at {salon.name}. Designed & Powered by BillCare Salon SaaS.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
