"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resentMessage, setResentMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    setResentMessage("");
    setResendError("");

    try {
      if (!email || !email.includes("@")) {
        setResendError("No email address provided in URL. Return to sign up or login to try again.");
        return;
      }
      if (!isSupabaseConfigured()) {
        setResendError("Email verification resend requires Supabase Auth to be configured.");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (error) {
        setResendError(error.message);
        return;
      }
      setResentMessage("Verification link sent! Please check your inbox and spam folder.");
    } catch (err: any) {
      setResendError(err?.message || "Unable to resend email right now. Please try again shortly.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-sm text-center">
      <div className="w-12 h-12 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] mx-auto flex items-center justify-center mb-5">
        <Mail className="w-6 h-6" />
      </div>

      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
          Verify your email
        </h2>
        <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
          Check your inbox for the verification link sent to{" "}
          <span className="text-[#F8FAFC] font-medium break-all">{email || "your email address"}</span>.
        </p>
      </div>

      {resendError && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{resendError}</span>
        </div>
      )}

      {resentMessage && (
        <div
          role="status"
          className="mb-5 p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resentMessage}</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full h-11 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
          <span>{isResending ? "Sending..." : "Resend verification email"}</span>
        </button>

        <Link
          href="/login"
          className="w-full h-11 bg-[#0B0B0B] hover:bg-[#161616] text-[#F8FAFC] border border-[#27272A] font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#A1A1AA]" />
          <span>Return to sign in</span>
        </Link>
      </div>

      <p className="text-xs text-[#71717A] mt-6 leading-relaxed">
        Didn&apos;t receive the email? Make sure to check your junk or spam folder.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthSplitLayout
      headline="Confirm your identity."
      supportingText="We ensure salon security and data compliance at every step."
      imageSrc="/images/spa-wellness.webp"
      imageAlt="Salon ambiance"
    >
      <Suspense
        fallback={
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-9 text-center text-[#A1A1AA] text-sm">
            Loading verification...
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthSplitLayout>
  );
}
