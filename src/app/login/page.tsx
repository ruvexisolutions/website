"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRuvexi } from "@/lib/ruvexi-context";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  requestSupabaseEmailOtp,
  verifySupabaseEmailOtp,
  signInWithGoogle,
} from "@/lib/supabase/auth";
import {
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Crown,
  Headphones,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { salon, login, setSession, showToast } = useRuvexi();

  const [authMode, setAuthMode] = useState<"manager" | "receptionist">("manager");
  const [managerLoginType, setManagerLoginType] = useState<"password" | "otp">("password");

  // Manager States
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Receptionist States
  const [receptionistEmail, setReceptionistEmail] = useState("");
  const [receptionistPassword, setReceptionistPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    managerEmail?: string;
    managerPassword?: string;
    otp?: string;
    receptionistEmail?: string;
    receptionistPassword?: string;
    general?: string;
  }>({});

  // 1. Manager: Sign in with Password
  const handleManagerPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const normalized = managerEmail.toLowerCase().trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setErrors({ managerEmail: "Please enter a valid work email address" });
      return;
    }
    if (!managerPassword) {
      setErrors({ managerPassword: "Password is required" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(normalized, managerPassword);
      if (res.success) {
        showToast("Signed in to Manager Console!", "success");
        router.push("/overview");
        return;
      }
      setErrors({ general: res.error || "Authentication failed. Please verify credentials." });
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to sign in. Please verify credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Manager: Request Email OTP
  const handleRequestEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});
    const normalized = managerEmail.toLowerCase().trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setErrors({ managerEmail: "Please enter a valid work email address" });
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supaRes = await requestSupabaseEmailOtp(normalized);
        if (supaRes.success) {
          setOtpSent(true);
          showToast(supaRes.message, "info");
        } else {
          setErrors({ general: supaRes.error || "Failed to dispatch verification email. Please check credentials or sign in with password." });
        }
      } else {
        setErrors({ general: "Email OTP service is not configured. Please sign in with your account password." });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Unable to send login code. Please sign in with password." });
    } finally {
      setIsLoading(false);
      setOtpCooldown(30);
      const timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // 3. Manager: Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!otp || otp.trim().length < 6) {
      setErrors({ otp: "Please enter the 6-digit verification code" });
      return;
    }

    setIsLoading(true);
    const normalized = managerEmail.toLowerCase().trim();

    try {
      if (isSupabaseConfigured()) {
        const supaRes = await verifySupabaseEmailOtp(normalized, otp);
        if (supaRes.success && supaRes.user && supaRes.salon) {
          setSession(supaRes.user, { ...salon, ...supaRes.salon } as any, supaRes.token);
          showToast(`Welcome back, ${supaRes.user.name}! (Salon Manager)`, "success");
          router.push("/overview");
          return;
        }
        setErrors({ general: supaRes.error || "Invalid or expired verification code." });
      } else {
        setErrors({ general: "Email verification service is not active. Please sign in with password." });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Verification failed. Please enter the correct code." });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Receptionist: Email & Password Sign In
  const handleReceptionistLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const normalized = receptionistEmail.toLowerCase().trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setErrors({ receptionistEmail: "Please enter a valid work email address" });
      return;
    }
    if (!receptionistPassword) {
      setErrors({ receptionistPassword: "Password is required" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(normalized, receptionistPassword);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem("Ruvexi_remember_email", normalized);
        }
        showToast("Signed in to Front Desk!", "success");
        router.push("/front-desk");
        return;
      }
      setErrors({ general: res.error || "Invalid receptionist credentials." });
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to sign in. Please verify credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Sign in with Google (OAuth)
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const res = await signInWithGoogle();
      if (res.success && res.user && res.salon) {
        setSession(res.user, { ...salon, ...res.salon } as any, res.token);
        showToast(`Welcome back, ${res.user.name}!`, "success");
        router.push("/overview");
        return;
      }
      if (!res.success && res.error) {
        setErrors({ general: res.error });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Google sign-in could not be initiated." });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headline="Salon Operating System."
      supportingText="Sign in to manage your salon."
      imageSrc="/images/spa-wellness.webp"
      imageAlt="Luxury salon front desk"
    >
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl p-7 sm:p-9 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Welcome Back
            </h2>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-semibold">
              Salon Management Platform
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1.5">
            Sign in to manage your salon
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#18181B] border border-[#27272A] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode("manager");
              setErrors({});
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${authMode === "manager"
                ? "bg-[#22C55E] text-black shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Salon Manager</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("receptionist");
              setErrors({});
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${authMode === "receptionist"
                ? "bg-[#22C55E] text-black shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Receptionist Login</span>
          </button>
        </div>

        {errors.general && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#F87171] flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errors.general}</span>
          </div>
        )}

        {/* MODE 1: MANAGER AUTH */}
        {authMode === "manager" ? (
          managerLoginType === "password" ? (
            /* Manager Password Login */
            <form onSubmit={handleManagerPasswordLogin} className="space-y-4">
              <AuthInput
                label="Email or Mobile Number"
                id="manager-email-pwd"
                type="text"
                placeholder="Email or Mobile Number"
                value={managerEmail}
                onChange={(e) => {
                  setManagerEmail(e.target.value);
                  if (errors.managerEmail) setErrors((prev) => ({ ...prev, managerEmail: undefined }));
                }}
                error={errors.managerEmail}
                icon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <div>
                <AuthInput
                  label="Password"
                  id="manager-password"
                  isPassword
                  placeholder="••••••••"
                  value={managerPassword}
                  onChange={(e) => {
                    setManagerPassword(e.target.value);
                    if (errors.managerPassword) setErrors((prev) => ({ ...prev, managerPassword: undefined }));
                  }}
                  error={errors.managerPassword}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="flex items-center justify-between mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setManagerLoginType("otp");
                      setErrors({});
                    }}
                    className="text-[#22C55E] hover:text-[#16A34A] font-medium cursor-pointer"
                  >
                    Sign in with Email OTP code instead
                  </button>

                  <Link
                    href="/forgot-password"
                    className="text-[#22C55E] hover:text-[#16A34A] font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <AuthButton isLoading={isLoading}>
                  Sign In →
                </AuthButton>
              </div>
            </form>
          ) : (
            /* Manager OTP Login */
            !otpSent ? (
              <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <AuthInput
                    label="Manager Work Email"
                    id="manager-email-otp"
                    type="email"
                    placeholder="director@salon.com"
                    value={managerEmail}
                    onChange={(e) => {
                      setManagerEmail(e.target.value);
                      if (errors.managerEmail) setErrors((prev) => ({ ...prev, managerEmail: undefined }));
                    }}
                    error={errors.managerEmail}
                    icon={<Mail className="w-4 h-4" />}
                    required
                    autoFocus
                  />
                  <span className="text-[11px] text-[#71717A] block">
                    A 6-digit one-time passcode will be delivered to your registered email.
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setManagerLoginType("password");
                      setErrors({});
                    }}
                    className="text-[#22C55E] hover:text-[#16A34A] font-medium cursor-pointer"
                  >
                    ← Sign in with password
                  </button>
                </div>

                <div className="pt-2">
                  <AuthButton isLoading={isLoading}>
                    Send Login Code to Email
                  </AuthButton>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[#A1A1AA]">
                      Code sent to <span className="text-white font-medium">{managerEmail}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                    }}
                    className="text-[11px] font-mono text-[#22C55E] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1.5">
                  <AuthInput
                    label="Enter 6-Digit Email Code"
                    id="manager-otp"
                    type="text"
                    maxLength={6}
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                    }}
                    error={errors.otp}
                    icon={<KeyRound className="w-4 h-4" />}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A]">
                  <button
                    type="button"
                    onClick={() => {
                      setManagerLoginType("password");
                      setOtpSent(false);
                      setErrors({});
                    }}
                    className="text-[#A1A1AA] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    Use password instead
                  </button>
                  <button
                    type="button"
                    disabled={otpCooldown > 0 || isLoading}
                    onClick={() => handleRequestEmailOtp()}
                    className="text-[#22C55E] hover:underline font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="pt-2">
                  <AuthButton isLoading={isLoading}>
                    Verify & Sign In to Manager Console
                  </AuthButton>
                </div>
              </form>
            )
          )
        ) : (
          /* MODE 2: RECEPTIONIST EMAIL + PASSWORD */
          <form onSubmit={handleReceptionistLogin} className="space-y-4 animate-in fade-in duration-150">
            <AuthInput
              label="Email or Mobile Number"
              id="receptionist-email"
              type="text"
              placeholder="Email or Mobile Number"
              value={receptionistEmail}
              onChange={(e) => {
                setReceptionistEmail(e.target.value);
                if (errors.receptionistEmail) setErrors((prev) => ({ ...prev, receptionistEmail: undefined }));
              }}
              error={errors.receptionistEmail}
              icon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <div>
              <AuthInput
                label="Password"
                id="receptionist-password"
                isPassword
                placeholder="••••••••"
                value={receptionistPassword}
                onChange={(e) => {
                  setReceptionistPassword(e.target.value);
                  if (errors.receptionistPassword) setErrors((prev) => ({ ...prev, receptionistPassword: undefined }));
                }}
                error={errors.receptionistPassword}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between mt-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#A1A1AA] hover:text-[#F8FAFC]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#0B0B0B] border border-[#27272A] text-[#22C55E] focus:ring-[#22C55E] cursor-pointer accent-[#22C55E]"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[#22C55E] hover:text-[#16A34A] font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <AuthButton isLoading={isLoading}>
                Sign In →
              </AuthButton>
            </div>
          </form>
        )}

        {/* OR DIVIDER */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272A]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#101010] px-3 text-[#71717A] font-mono tracking-wider">
              or
            </span>
          </div>
        </div>

        {/* SIGN IN WITH GOOGLE */}
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

        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-[#27272A] text-center text-xs text-[#A1A1AA]">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-[#22C55E] hover:text-[#16A34A] font-semibold inline-flex items-center gap-1 ml-1"
          >
            Create Account <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
