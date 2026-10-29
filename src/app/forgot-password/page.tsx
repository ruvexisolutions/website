"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { billcareApi } from "@/lib/api-client";
import { requestSupabasePasswordReset } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your work email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supaRes = await requestSupabasePasswordReset(normalizedEmail);
        if (supaRes.success) {
          setIsSubmitted(true);
        } else {
          setError(supaRes.error || "Unable to send reset email.");
        }
      } else {
        await billcareApi.forgotPassword(normalizedEmail);
        setIsSubmitted(true);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("Network")) {
        setError("Unable to reach the server. Please check your connection.");
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headline="Recover access."
      supportingText="We'll help you get back to managing your salon."
      imageSrc="/images/stylist-consultation.jpg"
      imageAlt="Salon stylist consultation"
    >
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-sm">
        {isSubmitted ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
                Check your inbox
              </h2>
              <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
                If an account exists for <span className="text-[#F8FAFC] font-medium">{email}</span>, we have sent a password reset link.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                className="w-full h-11 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Return to sign in
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="text-xs text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
              >
                Try another email
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
                Reset your password
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                Enter your email address and we&apos;ll send you a password reset link.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <AuthInput
                label="Work email"
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="you@yoursalon.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={error}
                icon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <div className="pt-2">
                <AuthButton isLoading={isLoading}>
                  Send Reset Link
                </AuthButton>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#27272A] text-center text-xs text-[#A1A1AA]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors focus:outline-none focus:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
