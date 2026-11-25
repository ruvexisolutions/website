"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RuvexiLogo } from "@/components/brand/ruvexi-logo";
import {
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { RuvexiApi } from "@/lib/api-client";

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { setSession, showToast } = useRuvexi();
  const token = params?.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    isSalonLink?: boolean;
    email: string;
    salonName: string;
    salonId: string;
    branchId?: string;
    branchName?: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Flow State
  const [step, setStep] = useState<"details" | "verify_otp">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;

    async function checkToken() {
      setIsLoading(true);
      try {
        const data = await RuvexiApi.getInvitation(token);
        setInviteData(data);
        if (data.email) {
          setEmail(data.email);
        }
      } catch (err: any) {
        setError(err?.message || "Invitation link is invalid or has expired.");
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, [token]);

  // Handle Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Send OTP to Invited Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      showToast("Please enter your full name.", "error");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      showToast("Please enter a valid work email address.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await RuvexiApi.requestInvitationOtp(token, name.trim(), cleanEmail);
      if (res?.success) {
        setStep("verify_otp");
        setResendCooldown(30);
        if (res.dev_otp) {
          setDevOtp(res.dev_otp);
        }
        showToast(res.message || `Verification code sent to ${cleanEmail}`, "success");
      } else {
        showToast("Failed to send verification code. Please try again.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to send verification code. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    const cleanEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      const res = await RuvexiApi.requestInvitationOtp(token, name.trim(), cleanEmail);
      if (res?.success) {
        setResendCooldown(30);
        if (res.dev_otp) {
          setDevOtp(res.dev_otp);
        }
        showToast(res.message || "New verification code sent!", "success");
      }
    } catch (err: any) {
      showToast(err?.message || "Could not resend verification code.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Complete Enrollment
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      showToast("Please enter the complete 6-digit verification code.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const data = await RuvexiApi.acceptInvitation({
        token,
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        otp: cleanOtp,
      });

      if (data?.success) {
        if (data.user && data.salon) {
          setSession(data.user, data.salon, data.token);
        }
        showToast(data.message || "Account activated! Welcome to the Front Desk.", "success");
        router.push("/front-desk");
      } else {
        showToast(data?.detail || "Failed to verify invitation", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Verification failed. Please check the code and try again.", "error");
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
            <RuvexiLogo size="md" variant="light" showSubtitle={true} />
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
              <p className="text-xs text-[#71717A]">Verifying salon invitation...</p>
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
          ) : step === "details" ? (
            /* STEP 1: Details Form */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-center space-y-1 pb-2 border-b border-[#222226]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Receptionist Portal</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-white">
                  Join {inviteData?.salonName}
                </h2>
                {inviteData?.branchName && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#181818] border border-[#27272A] text-[#FACC15] text-[11px] font-mono font-medium">
                    <span>🏢 Studio Branch:</span>
                    <span className="text-white font-bold">{inviteData.branchName}</span>
                  </div>
                )}
                <p className="text-[11px] text-[#71717A] mt-1">
                  Create your personal front desk receptionist profile below.
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

              {/* Work Email Address (Editable so each staff member registers with their own email) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                  Your Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="receptionist@your-salon.com"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
                <span className="text-[10px] text-[#71717A] block">
                  Verification OTP code will be sent to this email.
                </span>
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
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Verify Email & Complete</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleVerifyAndComplete} className="space-y-5">
              <div className="text-center space-y-2 pb-2 border-b border-[#222226]">
                <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white">Verify Your Email</h2>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    We sent a 6-digit verification code to:
                    <br />
                    <span className="text-[#FACC15] font-semibold">{email}</span>
                  </p>
                </div>
              </div>

              {/* Dev helper notice if Resend is pending */}
              {devOtp && (
                <div className="p-3 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-xl text-center space-y-1">
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Test Environment Code</p>
                  <p className="text-lg font-mono font-bold text-[#FACC15] tracking-widest">{devOtp}</p>
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-4 py-3 text-center text-lg font-mono tracking-[0.5em] text-[#FACC15] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#71717A]">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex items-center gap-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isSubmitting}
                  className="flex items-center gap-1 text-[#FACC15] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.trim().length !== 6}
                className="w-full py-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying & Enrolling...</span>
                ) : (
                  <>
                    <span>Verify & Let Me In</span>
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
