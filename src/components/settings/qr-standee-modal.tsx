"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RuvexiLogo } from "@/components/brand/ruvexi-logo";
import { Download, Printer, QrCode, Star, Calendar, Sparkles, X } from "lucide-react";

interface QRStandeeGeneratorModalProps {
  salon: {
    name: string;
    slug?: string;
    upiId?: string;
    upiPayeeName?: string;
    city?: string;
  };
  onClose: () => void;
}

export function QRStandeeGeneratorModal({ salon, onClose }: QRStandeeGeneratorModalProps) {
  const [upiQr, setUpiQr] = useState<string>("");
  const [bookingQr, setBookingQr] = useState<string>("");
  const [reviewQr, setReviewQr] = useState<string>("");

  const upiId = salon.upiId || "ruvexi.atelier@icici";
  const payee = salon.upiPayeeName || salon.name;
  const bookingUrl = `https://ruvexisolutions.com/book/${salon.slug || "flagship"}`;
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${salon.slug || "ruvexi"}`;

  useEffect(() => {
    // 1. Generate UPI Payment QR
    const upiIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}&cu=INR`;
    QRCode.toDataURL(upiIntent, { width: 300, margin: 1 }).then(setUpiQr);

    // 2. Generate Booking QR
    QRCode.toDataURL(bookingUrl, { width: 300, margin: 1 }).then(setBookingQr);

    // 3. Generate Google Review QR
    QRCode.toDataURL(googleReviewUrl, { width: 300, margin: 1 }).then(setReviewQr);
  }, [upiId, payee, bookingUrl, googleReviewUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#FACC15]" />
              <span>Acrylic Tabletop QR Standee Generator</span>
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Printable high-resolution A5 acrylic counter stand for payments, bookings & Google reviews.
            </p>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standee Preview (A5 Ratio) */}
        <div className="flex justify-center">
          <div
            id="printable-standee"
            className="w-[320px] bg-gradient-to-b from-[#141416] via-[#0D0D0E] to-[#09090B] border-2 border-[#FACC15]/40 rounded-3xl p-6 text-center text-white shadow-2xl relative select-none"
            style={{ minHeight: "460px" }}
          >
            {/* Corner Luxury Ornaments */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#FACC15]/60" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#FACC15]/60" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#FACC15]/60" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#FACC15]/60" />

            {/* Brand Logo */}
            <div className="flex justify-center mb-3">
              <RuvexiLogo size="sm" variant="light" showSubtitle={true} />
            </div>

            <h3 className="font-serif font-bold text-lg text-[#F8FAFC] tracking-tight">
              {salon.name}
            </h3>
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono">
              Luxury Atelier & Spa • {salon.city || "Bengaluru"}
            </p>

            {/* Main Primary Counter QR: UPI Payment */}
            <div className="my-5 p-3.5 bg-white rounded-2xl shadow-xl inline-block border-4 border-[#FACC15]/80">
              {upiQr ? (
                <img src={upiQr} alt="UPI Payment QR" className="w-40 h-40 object-contain mx-auto" />
              ) : (
                <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-xs text-black">Generating...</div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-xs text-[#FACC15] uppercase tracking-wider block font-mono">
                Scan to Pay Any UPI App
              </span>
              <p className="text-[10px] text-[#71717A] font-mono">
                Google Pay • PhonePe • Paytm • BHIM ({upiId})
              </p>
            </div>

            {/* Secondary Dual QRs: Self-Book & Google Review */}
            <div className="mt-5 pt-4 border-t border-[#27272A] grid grid-cols-2 gap-3">
              {/* Google Reviews */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2.5 flex flex-col items-center">
                {reviewQr && <img src={reviewQr} alt="Google Review QR" className="w-14 h-14 bg-white p-1 rounded-lg" />}
                <span className="text-[9px] font-bold text-white mt-1.5 flex items-center gap-1 font-mono">
                  <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" /> Review Us
                </span>
                <span className="text-[8px] text-[#71717A]">Rate 5-Stars</span>
              </div>

              {/* Online Self Booking */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2.5 flex flex-col items-center">
                {bookingQr && <img src={bookingQr} alt="Booking QR" className="w-14 h-14 bg-white p-1 rounded-lg" />}
                <span className="text-[9px] font-bold text-white mt-1.5 flex items-center gap-1 font-mono">
                  <Calendar className="w-2.5 h-2.5 text-emerald-400" /> Book Again
                </span>
                <span className="text-[8px] text-[#71717A]">Self-Serve Slot</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#27272A]/50 text-[9px] text-[#71717A] tracking-wider font-mono">
              Powered by RUVEXI SOLUTIONS Salon OS
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#181818] hover:bg-[#202020] text-sm text-[#A1A1AA] hover:text-white rounded-xl border border-[#27272A] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-[#FACC15]/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Counter Standee (A5)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

