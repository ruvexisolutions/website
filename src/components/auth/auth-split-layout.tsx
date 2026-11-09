"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RuvexiLogo } from "@/components/brand/ruvexi-logo";

interface AuthSplitLayoutProps {
  headline: string;
  supportingText: string;
  imageSrc?: string;
  imageAlt?: string;
  children: React.ReactNode;
}

export function AuthSplitLayout({
  headline,
  supportingText,
  imageSrc = "/images/spa-wellness.webp",
  imageAlt = "Luxury salon interior",
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#FACC15]/20 selection:text-[#FACC15]">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Minimal Brand Panel (Desktop) */}
        <aside className="hidden lg:flex lg:w-1/2 xl:w-[48%] bg-[#0B0B0B] border-r border-[#27272A] p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle accent backdrop glow */}
          <div
            className="absolute top-1/3 left-1/4 w-[420px] h-[320px] bg-[#FACC15]/[0.025] blur-[140px] pointer-events-none"
            aria-hidden="true"
          />

          {/* Brand Logo Header */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90"
              aria-label="RUVEXI homepage"
            >
              <RuvexiLogo size="md" variant="light" showSubtitle={true} />
            </Link>
          </div>

          {/* Editorial / Value Proposition (Lifted upward) */}
          <div className="relative z-10 mt-8 xl:mt-12 mb-auto max-w-md space-y-6">
            <div className="space-y-2.5">
              <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-[#F8FAFC] leading-snug">
                {headline}
              </h1>
              <p className="text-sm xl:text-base text-[#A1A1AA] font-normal leading-relaxed">
                {supportingText}
              </p>
            </div>

            {/* Restrained luxury visual */}
            {imageSrc && (
              <div className="relative w-full h-56 xl:h-64 rounded-xl overflow-hidden border border-[#27272A] bg-[#101010] shadow-sm">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1280px) 45vw, 40vw"
                  className="object-cover brightness-[0.78] contrast-[1.05]"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* Left Footer: Minimal brand indicator */}
          <div className="relative z-10 pt-6 text-xs text-[#71717A] flex items-center justify-between">
            <span>© {new Date().getFullYear()} RUVEXI Technologies Inc.</span>
            <span className="font-mono text-[11px] tracking-wider text-[#71717A]">B2B SALON OS</span>
          </div>
        </aside>

        {/* Right Column: Form Container */}
        <main className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative">
          {/* Mobile Top Brand Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 border-b border-[#27272A]/80 mb-6">
            <Link href="/" className="inline-flex items-center" aria-label="RUVEXI homepage">
              <RuvexiLogo size="sm" variant="light" showSubtitle={true} />
            </Link>
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              Salon OS
            </span>
          </div>

          {/* Form Content (Lifted upward to match left side) */}
          <div className="w-full max-w-[420px] mx-auto mt-4 lg:mt-8 xl:mt-12 mb-auto py-2">
            {children}
          </div>

          {/* Legal / Policy Links Footer */}
          <footer className="w-full max-w-[420px] mx-auto pt-8 border-t border-[#27272A]/60 flex items-center justify-between text-xs text-[#71717A]">
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-[#A1A1AA] transition-colors focus:outline-none focus:underline"
              >
                Privacy Policy
              </Link>
              <span>·</span>
              <Link
                href="/terms"
                className="hover:text-[#A1A1AA] transition-colors focus:outline-none focus:underline"
              >
                Terms of Service
              </Link>
            </div>
            <span className="text-[11px] text-[#71717A]">Secure 256-bit SSL</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
