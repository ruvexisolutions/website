"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function AuthButton({
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`w-full h-11 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 focus:ring-offset-2 focus:ring-offset-[#080808] active:translate-y-[0.5px] ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#080808]" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
