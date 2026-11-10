"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { formatCurrency } from "@/lib/utils";
import { Printer, Download, Share2, Copy, Check, QrCode, Scissors } from "lucide-react";

export interface ThermalReceiptProps {
  invoice: {
    invoiceNumber: string;
    date?: string;
    customerName: string;
    customerPhone?: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      type?: "service" | "product";
      staffName?: string;
    }>;
    subtotal: number;
    discount?: number;
    gstAmount?: number;
    tipAmount?: number;
    total: number;
    paymentMethod: string;
    amountReceived?: number;
    changeGiven?: number;
    verifiedByName?: string;
    paymentReference?: string;
    status?: string;
    paidAt?: string;
    splitDetails?: {
      cash?: number;
      upi?: number;
      card?: number;
      tendered?: number;
      change?: number;
    };
    loyaltyPointsEarned?: number;
    loyaltyPointsBalance?: number;
  };
  salon: {
    name: string;
    branch?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    upiId?: string;
  };
  onClose?: () => void;
}

export function ThermalReceipt({ invoice, salon, onClose }: ThermalReceiptProps) {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReceipt = () => {
    const lines = [
      `==============================`,
      `       ${salon.name.toUpperCase()}       `,
      `   ${salon.branch || "Flagship Salon"}   `,
      `Ph: ${salon.phone || "+91 98765 43210"}`,
      `GSTIN: ${salon.gstin || "29AABCU9603R1ZX"}`,
      `==============================`,
      `Bill No: ${invoice.invoiceNumber}`,
      `Date: ${invoice.date || new Date().toLocaleString("en-IN")}`,
      `Client: ${invoice.customerName} (${invoice.customerPhone || "N/A"})`,
      `------------------------------`,
      `QTY  ITEM           RATE   AMT`,
      `------------------------------`,
      ...invoice.items.map(
        (i) =>
          `${String(i.quantity).padEnd(4)}${i.name.slice(0, 14).padEnd(15)}${String(i.price).padEnd(6)}${i.price * i.quantity}`
      ),
      `------------------------------`,
      `Subtotal:      ${formatCurrency(invoice.subtotal)}`,
      invoice.discount ? `Discount:     -${formatCurrency(invoice.discount)}` : null,
      `CGST (2.5%):   ${formatCurrency(Math.round((invoice.gstAmount || 0) / 2))}`,
      `SGST (2.5%):   ${formatCurrency(Math.round((invoice.gstAmount || 0) / 2))}`,
      invoice.tipAmount ? `Stylist Tip:   ${formatCurrency(invoice.tipAmount)}` : null,
      `TOTAL AMOUNT:  ${formatCurrency(invoice.total)}`,
      `Payment:       ${invoice.paymentMethod}`,
      `==============================`,
      ` Thank You for Indulging with Us! `,
      `    Powered by Ruvexi Solutions  `,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cgst = Math.round((invoice.gstAmount || 0) / 2);
  const sgst = (invoice.gstAmount || 0) - cgst;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Action Toolbar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl no-print text-xs shadow-lg">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print 80mm Slip</span>
        </button>

        <button
          onClick={handleCopyTextReceipt}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Raw Slip"}</span>
        </button>
      </div>

      {/* 80mm ESC/POS Thermal Receipt Paper Simulation */}
      <div
        ref={receiptRef}
        id="thermal-receipt-printable"
        className="w-[80mm] max-w-full bg-[#FCFDFD] text-[#111827] font-mono text-[12px] leading-tight p-4 shadow-2xl rounded-sm border border-slate-300 relative select-text"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          letterSpacing: "-0.2px",
        }}
      >
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #thermal-receipt-printable,
            #thermal-receipt-printable * {
              visibility: visible !important;
            }
            #thermal-receipt-printable {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 4mm !important;
              box-shadow: none !important;
              border: none !important;
              background: #fff !important;
              color: #000 !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
          }
        `}</style>

        {/* Paper top serrated cut illusion */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_2px,#e2e8f0_2px)] bg-[length:6px_4px] no-print" />

        {/* Header */}
        <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400">
          <div className="text-[16px] font-black tracking-wider uppercase text-black">
            {salon.name}
          </div>
          {salon.branch && (
            <div className="text-[11px] font-bold text-slate-700">
              * {salon.branch} Branch *
            </div>
          )}
          {salon.address && (
            <div className="text-[10px] text-slate-600 max-w-[90%] mx-auto leading-3">
              {salon.address}
            </div>
          )}
          <div className="text-[10px] text-slate-600">
            TEL: {salon.phone || "+91 98765 43210"}
          </div>
          <div className="text-[10px] font-bold text-slate-800">
            GSTIN: {salon.gstin || "29AABCU9603R1ZX"}
          </div>
          <div className="text-[9px] uppercase font-bold text-slate-500 pt-0.5">
            SAC: 9997 (Salon & Beauty Services)
          </div>
        </div>

        {/* Invoice Info */}
        <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-slate-400">
          <div className="flex justify-between">
            <span className="font-bold">INVOICE:</span>
            <span className="font-bold text-black">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE:</span>
            <span>{invoice.date || new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <div className="flex justify-between">
            <span>CLIENT:</span>
            <span className="font-bold truncate max-w-[130px]">{invoice.customerName}</span>
          </div>
          {invoice.customerPhone && (
            <div className="flex justify-between">
              <span>PHONE:</span>
              <span>{invoice.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>PAYMENT:</span>
            <span className="font-bold uppercase text-emerald-800">{invoice.paymentMethod}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-2 border-b border-dashed border-slate-400">
          <div className="flex justify-between text-[10px] font-bold pb-1 text-slate-600 border-b border-dotted border-slate-300">
            <span className="w-8">QTY</span>
            <span className="flex-1 text-left">ITEM / STYLIST</span>
            <span className="w-12 text-right">RATE</span>
            <span className="w-14 text-right">AMOUNT</span>
          </div>

          <div className="pt-1.5 space-y-1.5">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="w-8 font-bold">{item.quantity}x</span>
                  <span className="flex-1 font-bold text-black truncate pr-1">
                    {item.name}
                  </span>
                  <span className="w-12 text-right text-slate-600">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="w-14 text-right font-black">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                {item.staffName && item.staffName !== "House" && (
                  <div className="text-[9px] text-slate-500 pl-8 italic">
                    By: {item.staffName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="py-2 text-[11px] space-y-1 border-b border-dashed border-slate-400">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>

          {invoice.discount ? (
            <div className="flex justify-between font-bold text-emerald-800">
              <span>Discount / Voucher:</span>
              <span>- {formatCurrency(invoice.discount)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-[10px] text-slate-600">
            <span>CGST (2.5%):</span>
            <span>{formatCurrency(cgst)}</span>
          </div>

          <div className="flex justify-between text-[10px] text-slate-600">
            <span>SGST (2.5%):</span>
            <span>{formatCurrency(sgst)}</span>
          </div>

          {invoice.tipAmount ? (
            <div className="flex justify-between text-[10px] text-slate-700">
              <span>Stylist Gratuity / Tip:</span>
              <span>{formatCurrency(invoice.tipAmount)}</span>
            </div>
          ) : null}

          <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between text-[14px] font-black text-black">
            <span>NET PAYABLE:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {/* Payment Settlement & Audit Breakdown */}
        <div className="py-1.5 text-[10px] space-y-0.5 border-b border-dashed border-slate-400 bg-slate-50 px-1 my-1">
          <div className="flex justify-between font-bold text-slate-800">
            <span>PAYMENT METHOD:</span>
            <span className="uppercase">{invoice.paymentMethod}</span>
          </div>
          {invoice.amountReceived !== undefined && (
            <div className="flex justify-between">
              <span>Cash Received:</span>
              <span className="font-bold">{formatCurrency(invoice.amountReceived)}</span>
            </div>
          )}
          {invoice.changeGiven !== undefined && invoice.changeGiven > 0 && (
            <div className="flex justify-between font-bold text-emerald-800">
              <span>Change Returned:</span>
              <span>{formatCurrency(invoice.changeGiven)}</span>
            </div>
          )}
          {invoice.paymentReference && (
            <div className="flex justify-between">
              <span>Ref / Txn ID:</span>
              <span className="font-mono text-[9px] truncate max-w-[140px]">{invoice.paymentReference}</span>
            </div>
          )}
          {invoice.verifiedByName && (
            <div className="flex justify-between">
              <span>Confirmed By:</span>
              <span>{invoice.verifiedByName}</span>
            </div>
          )}
          <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
            <span>Settlement:</span>
            <span className={invoice.status === "paid" ? "font-bold text-emerald-700 uppercase" : "font-bold text-amber-700 uppercase"}>
              {invoice.status === "paid" ? "PAID • COUNTER VERIFIED" : "PENDING VERIFICATION"}
            </span>
          </div>
        </div>

        {/* Split Tender Details if applicable */}
        {invoice.splitDetails && (
          <div className="py-1.5 text-[10px] space-y-0.5 border-b border-dashed border-slate-400 bg-slate-50 px-1 my-1">
            <div className="font-bold text-slate-700">TENDER BREAKDOWN:</div>
            {invoice.splitDetails.cash !== undefined && (
              <div className="flex justify-between">
                <span>Cash Received:</span>
                <span>{formatCurrency(invoice.splitDetails.cash)}</span>
              </div>
            )}
            {invoice.splitDetails.upi !== undefined && (
              <div className="flex justify-between">
                <span>UPI Transfer:</span>
                <span>{formatCurrency(invoice.splitDetails.upi)}</span>
              </div>
            )}
            {invoice.splitDetails.card !== undefined && (
              <div className="flex justify-between">
                <span>POS Card Swipe:</span>
                <span>{formatCurrency(invoice.splitDetails.card)}</span>
              </div>
            )}
            {invoice.splitDetails.tendered !== undefined && (
              <div className="flex justify-between font-bold">
                <span>Cash Tendered:</span>
                <span>{formatCurrency(invoice.splitDetails.tendered)}</span>
              </div>
            )}
            {invoice.splitDetails.change !== undefined && (
              <div className="flex justify-between font-bold text-emerald-800">
                <span>Change Returned:</span>
                <span>{formatCurrency(invoice.splitDetails.change)}</span>
              </div>
            )}
          </div>
        )}

        {/* Loyalty Points Section */}
        {(invoice.loyaltyPointsEarned || invoice.loyaltyPointsBalance) && (
          <div className="py-1.5 text-[10px] text-center border-b border-dashed border-slate-400 bg-amber-500/10 my-1 rounded px-1">
            <span className="font-bold text-amber-900">★ Ruvexi PRIVILEGE REWARDS ★</span>
            <div className="flex justify-around text-[10px] text-amber-950 font-bold mt-0.5">
              {invoice.loyaltyPointsEarned && (
                <span>Earned Today: +{invoice.loyaltyPointsEarned} pts</span>
              )}
              {invoice.loyaltyPointsBalance && (
                <span>Total Balance: {invoice.loyaltyPointsBalance} pts</span>
              )}
            </div>
          </div>
        )}

        {/* Dynamic QR Code & Scan to Pay / Verify E-Receipt */}
        <DynamicReceiptQr
          upiId={salon.upiId}
          salonName={salon.name}
          total={invoice.total}
          invoiceNumber={invoice.invoiceNumber}
        />

        {/* Deterministic Invoice Code Strip */}
        <div className="pt-2 text-center">
          <div className="inline-flex items-center gap-[2px] h-7 bg-white px-2 py-0.5 border border-slate-200">
            {invoice.invoiceNumber.split("").map((ch, i) => (
              <div
                key={i}
                className="bg-black h-full"
                style={{ width: `${(ch.charCodeAt(0) % 3) + 1.2}px` }}
              />
            ))}
          </div>
          <div className="text-[9px] font-mono text-slate-500 tracking-widest pt-0.5">
            *{invoice.invoiceNumber}*
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 pb-1 text-center text-[10px] text-slate-600 border-t border-dotted border-slate-400 mt-2 space-y-0.5">
          <div className="font-bold text-black">*** THANK YOU FOR VISITING ***</div>
          <div className="text-[9px] text-slate-500">
            Verified Digital GST Receipt
          </div>
          <div className="text-[8px] text-slate-400 pt-1">
            Software by Ruvexi Solutions Salon OS
          </div>
        </div>

        {/* Bottom serrated cut illusion */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_2px,#e2e8f0_2px)] bg-[length:6px_4px] no-print" />
      </div>
    </div>
  );
}

function DynamicReceiptQr({
  upiId,
  salonName,
  total,
  invoiceNumber,
}: {
  upiId?: string;
  salonName: string;
  total: number;
  invoiceNumber: string;
}) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    const payload = upiId
      ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(salonName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoiceNumber)}`
      : `RUVEXI-RECEIPT|${invoiceNumber}|${salonName}|${total.toFixed(2)}`;
    QRCode.toDataURL(payload, { width: 120, margin: 1 })
      .then((url) => setQrSrc(url))
      .catch(() => {});
  }, [upiId, salonName, total, invoiceNumber]);

  return (
    <div className="pt-2 text-center space-y-1.5">
      <div className="inline-block p-1 bg-white border border-slate-300 rounded shadow-2xs">
        {qrSrc ? (
          <img src={qrSrc} alt="Receipt QR Code" className="w-20 h-20 mx-auto" />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center text-[9px] text-slate-400">QR</div>
        )}
      </div>
      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
        {upiId ? "Scan to Pay / Verify E-Receipt" : "Scan to Verify E-Receipt"}
      </div>
      {upiId && (
        <div className="text-[10px] font-mono font-bold text-slate-700">
          UPI: {upiId}
        </div>
      )}
    </div>
  );
}
