"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BillCareLogo } from "@/components/brand/billcare-logo";
import { ShieldCheck, UserCheck, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBillCare } from "@/lib/billcare-context";

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { setSession, showToast } = useBillCare();
  const token = params?.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    email: string;
    salonName: string;
    salonId: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function checkToken() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/invitations/${token}`);
        if (res.ok) {
          const data = await res.json();
          setInviteData(data);
        } else {
          const err = await res.json();
          setError(err.detail || "Invitation link is invalid or has expired.");
        }
      } catch {
        setError("Unable to reach authentication server. Please check your network connection.");
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      showToast("Please provide your name and a secure password", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          phone,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user && data.salon) {
          setSession(data.user, data.salon, data.token);
        }
        showToast(data.message || "Account registered successfully!", "success");
        router.push("/front-desk");
      } else {
        showToast(data.detail || "Failed to accept invitation", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-[#FACC15]/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <BillCareLogo size="md" variant="light" showSubtitle={true} />
          </div>
          <p className="text-xs text-[#71717A] tracking-wide font-mono uppercase">
            Receptionist Enrollment Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121212] border border-[#27272A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#71717A]">Verifying your salon invitation...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Invalid Invitation</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{error}</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-2 border-b border-[#222226]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Invitation</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-white">
                  Join {inviteData?.salonName}
                </h2>
                <p className="text-xs text-[#71717A]">
                  Enrolling as: <span className="text-white font-medium">{inviteData?.email}</span>
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
                <span className="text-[10px] text-[#71717A] block">Minimum 6 characters</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <span>Complete Enrollment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#71717A]">
          Already have account access?{" "}
          <Link href="/login" className="text-[#FACC15] hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
