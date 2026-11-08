"use client";

import React from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { getRoleConfig, getRequiredRoleForTab, DashboardTab } from "@/lib/role-permissions";
import { ShieldAlert, ArrowLeft, Lock, KeyRound } from "lucide-react";

interface RolePermissionGuardProps {
  tab: DashboardTab;
  tabLabel: string;
  onNavigateToAllowedTab?: (tab: DashboardTab) => void;
}

export function RolePermissionGuard({ tab, tabLabel, onNavigateToAllowedTab }: RolePermissionGuardProps) {
  const { user } = useRuvexi();
  const currentConfig = getRoleConfig(user?.role);
  const requiredRole = getRequiredRoleForTab(tab);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#151515] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 space-y-6 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Role-Based Access Control
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
              Access Restricted: {tabLabel}
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
              This module contains administrative business settings restricted to{" "}
              <span className="text-amber-300 font-semibold">{requiredRole}</span> accounts.
            </p>
          </div>

          {/* Role Comparison Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-[#0A0A0C] border border-[#222226] rounded-xl p-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                Your Current Role
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${currentConfig.badgeClasses}`}>
                  {currentConfig.label}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                Required Role
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  {requiredRole}
                </span>
              </div>
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="bg-[#181818]/60 border border-[#27272A]/80 rounded-xl p-3.5 text-left text-xs text-[#A1A1AA] space-y-2">
            <div className="font-medium text-white flex items-center gap-1.5 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Permission Notice</span>
            </div>
            <p className="text-[12px] text-[#A1A1AA] leading-relaxed">
              Ruvexi enforces strict isolation between daily Front Desk Receptionist workflows and Salon Manager business administration. If you require access to this section, please contact your salon manager.
            </p>
          </div>

          {/* Return Action */}
          {onNavigateToAllowedTab && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => onNavigateToAllowedTab(currentConfig.defaultTab)}
                className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to {currentConfig.label === "Salon Receptionist" ? "Front Desk" : "Dashboard"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
