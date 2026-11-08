"use client";

import React from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { getRoleConfig } from "@/lib/role-permissions";
import { Crown, Headphones } from "lucide-react";

interface RoleSwitcherProps {
  variant?: "pill" | "sidebar";
  onRoleSwitched?: (role: any) => void;
}

/**
 * Verified Role Badge: Displays the authenticated user's active role.
 * Role-switching buttons have been eliminated in accordance with production RBAC architecture.
 */
export function RoleSwitcher({ variant = "pill" }: RoleSwitcherProps) {
  const { user } = useRuvexi();
  const config = getRoleConfig(user?.role);
  const isManager = config.role === "SALON_MANAGER";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${config.badgeClasses}`}
      title={`Authenticated session role: ${config.label}`}
    >
      {isManager ? <Crown className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
      <span>{config.shortTitle}</span>
    </div>
  );
}
