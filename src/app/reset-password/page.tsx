"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { billcareApi } from "@/lib/api-client";
import { updateSupabasePassword } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
    if (score === 2) return { score: 2, label: "Medium", color: "bg-amber-400", text: "text-amber-300" };
    return { score: 3, label: "Strong", color: "bg-emerald-400", text: "text-emerald-400" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!token && !isSupabaseConfigured()) {
      setErrors({
        general: "Missing or invalid reset token. Please request a new password reset link.",
      });
      return;
    }

    if (!validate()) return;

    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supaRes = await updateSupabasePassword(newPassword);
        if (supaRes.success) {
          setIsSuccess(true);
        } else {
          setErrors({ general: supaRes.error || "Failed to update password." });
        }
      } else {
        await billcareApi.resetPassword({
          token,
          new_password: newPassword,
        });
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrors({
        general:
          err.message ||
          "Failed to update password. Your reset link may have expired. Please request a new one.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-sm">
      {isSuccess ? (
        <div className="text-center py-4 space-y-5">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
              Password updated
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/login"
              className="w-full h-11 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Sign In to Bill Care
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[#FACC15] font-mono text-[10px] mb-2">
              <span>Link valid for 60 minutes</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
              Create a new password
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
              Choose a strong password with at least 6 characters.
            </p>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed block">{errors.general}</span>
                <Link
                  href="/forgot-password"
                  className="inline-block text-[#FACC15] hover:underline font-medium"
                >
                  Request a new reset link →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <AuthInput
                label="New password"
                id="new-password"
                isPassword
                autoComplete="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                error={errors.newPassword}
                icon={<Lock className="w-4 h-4" />}
                required
                autoFocus
              />

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717A]">Password Strength</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1">
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 1 ? strength.color : "bg-[#27272A]"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 2 ? strength.color : "bg-[#27272A]"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 3 ? strength.color : "bg-[#27272A]"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <AuthInput
              label="Confirm new password"
              id="confirm-password"
              isPassword
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <AuthButton isLoading={isLoading}>
                Update Password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      headline="Security update."
      supportingText="Choose a secure password to protect your salon data."
      imageSrc="/images/stylist-consultation.jpg"
      imageAlt="Salon stylist"
    >
      <Suspense
        fallback={
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-9 text-center text-[#A1A1AA] text-sm">
            Loading reset form...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
