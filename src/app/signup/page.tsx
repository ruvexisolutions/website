"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBillCare } from "@/lib/billcare-context";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { Building2, User, Mail, Lock, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useBillCare();

  const [salonName, setSalonName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    salonName?: string;
    fullName?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      salonName?: string;
      fullName?: string;
      email?: string;
      password?: string;
    } = {};

    if (!salonName.trim()) {
      newErrors.salonName = "Please enter your salon name";
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your work email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Please enter a password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await signup(
        {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: "",
          password: password,
        },
        {
          name: salonName.trim(),
          city: "Bengaluru",
          category: "Hair Studio & Luxury Spa",
          chairs: 6,
          currency: "₹",
        }
      );

      if (res.requiresEmailVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }

      if (res.success) {
        router.push("/dashboard");
      } else {
        setErrors({ general: res.error || "Failed to create account. Please try again." });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "An unexpected error occurred during signup." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const res = await signInWithGoogle();
      if (!res.success && res.error) {
        setErrors({ general: res.error });
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Google sign-in could not be initiated." });
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headline="Your salon. Simplified."
      supportingText="Everything your salon needs, in one place."
      imageSrc="/images/hero-bg.jpg"
      imageAlt="Salon interior workstation"
    >
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Create your account
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1.5">
            Get your salon set up in minutes.
          </p>
        </div>

        {errors.general && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            label="Salon name"
            id="salon-name"
            placeholder="e.g. Aura Luxury Salon"
            value={salonName}
            onChange={(e) => {
              setSalonName(e.target.value);
              if (errors.salonName) setErrors((prev) => ({ ...prev, salonName: undefined }));
            }}
            error={errors.salonName}
            icon={<Building2 className="w-4 h-4" />}
            required
            autoFocus
          />

          <AuthInput
            label="Your full name"
            id="full-name"
            autoComplete="name"
            placeholder="e.g. Sunil Kumar"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
            icon={<User className="w-4 h-4" />}
            required
          />

          <AuthInput
            label="Work email"
            id="work-email"
            type="email"
            autoComplete="email"
            placeholder="you@yoursalon.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <AuthInput
            label="Password"
            id="password"
            isPassword
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="pt-2">
            <AuthButton isLoading={isLoading}>
              Create Account
            </AuthButton>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272A]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#101010] px-3 text-[#71717A] font-mono tracking-wider">
              Or sign up with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#202024] text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        <div className="mt-6 pt-5 border-t border-[#27272A] text-center text-xs text-[#A1A1AA]">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="text-[#FACC15] hover:text-[#EAB308] font-medium transition-colors focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
