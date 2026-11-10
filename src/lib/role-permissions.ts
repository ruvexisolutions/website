export type UserRole =
  | "SALON_RECEPTIONIST"
  | "SALON_MANAGER"
  | "MASTER_ADMIN"
  | "receptionist"
  | "manager"
  | "owner"
  | "admin";

export type DashboardTab =
  | "frontdesk"
  | "overview"
  | "calendar"
  | "pos"
  | "customers"
  | "services"
  | "staff"
  | "inventory"
  | "followups"
  | "reports"
  | "booking"
  | "settings"
  | "subscription"
  | "owner";

export interface RoleConfig {
  role: "SALON_RECEPTIONIST" | "SALON_MANAGER";
  label: string;
  shortTitle: string;
  badge: string;
  badgeClasses: string;
  iconName: string;
  description: string;
  defaultTab: DashboardTab;
  allowedTabs: DashboardTab[];
  capabilities: {
    canViewBusinessAnalytics: boolean;
    canViewFinancialMargins: boolean;
    canViewTaxReports: boolean;
    canEditSalonSettings: boolean;
    canEditSalonProfile: boolean;
    canEditStaffCommissions: boolean;
    canManageStaffAttendance: boolean;
    canManageInventoryStock: boolean;
    canViewInventoryCost: boolean;
    canEditServices: boolean;
    canSendWhatsAppMarketing: boolean;
    canExportCrm: boolean;
    canCreateBilling: boolean;
    canManageBranches: boolean;
    canManageSubscription: boolean;
  };
}

export const ROLE_CONFIGS: Record<"SALON_RECEPTIONIST" | "SALON_MANAGER", RoleConfig> = {
  SALON_RECEPTIONIST: {
    role: "SALON_RECEPTIONIST",
    label: "Salon Receptionist",
    shortTitle: "Receptionist",
    badge: "Front Desk Operations",
    badgeClasses: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    iconName: "Headphones",
    description:
      "Handles customer intake, appointment scheduling, chair assignment, service selection, and POS checkout. Branch management, GST configuration, and WhatsApp credentials are restricted.",
    defaultTab: "frontdesk",
    allowedTabs: [
      "frontdesk",
      "calendar",
      "pos",
      "customers",
      "services",
      "staff",
      "booking",
    ],
    capabilities: {
      canViewBusinessAnalytics: false,
      canViewFinancialMargins: false,
      canViewTaxReports: false,
      canEditSalonSettings: false,
      canEditSalonProfile: false,
      canEditStaffCommissions: false,
      canManageStaffAttendance: false,
      canManageInventoryStock: false,
      canViewInventoryCost: false,
      canEditServices: false,
      canSendWhatsAppMarketing: false,
      canExportCrm: false,
      canCreateBilling: true,
      canManageBranches: false,
      canManageSubscription: false,
    },
  },

  SALON_MANAGER: {
    role: "SALON_MANAGER",
    label: "Salon Manager",
    shortTitle: "Manager",
    badge: "Salon Management",
    badgeClasses: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    iconName: "Crown",
    description:
      "Full salon management including services and pricing, staff schedules, branch configuration, inventory stock movements, GST settings, WhatsApp notifications, and business reports.",
    defaultTab: "overview",
    allowedTabs: [
      "overview",
      "frontdesk",
      "calendar",
      "pos",
      "customers",
      "services",
      "staff",
      "inventory",
      "followups",
      "reports",
      "booking",
      "settings",
      "subscription",
      "owner",
    ],
    capabilities: {
      canViewBusinessAnalytics: true,
      canViewFinancialMargins: true,
      canViewTaxReports: true,
      canEditSalonSettings: true,
      canEditSalonProfile: true,
      canEditStaffCommissions: true,
      canManageStaffAttendance: true,
      canManageInventoryStock: true,
      canViewInventoryCost: true,
      canEditServices: true,
      canSendWhatsAppMarketing: true,
      canExportCrm: true,
      canCreateBilling: true,
      canManageBranches: true,
      canManageSubscription: true,
    },
  },
};

export function normalizeRole(role?: string): "SALON_RECEPTIONIST" | "SALON_MANAGER" {
  const r = (role || "").trim().toUpperCase();
  if (r === "SALON_MANAGER" || r === "OWNER" || r === "MANAGER" || r === "ADMIN" || r === "MASTER_ADMIN") {
    return "SALON_MANAGER";
  }
  // Fail closed to least privilege (Receptionist) when role is missing or unrecognized
  return "SALON_RECEPTIONIST";
}

export function getRoleConfig(role?: string): RoleConfig {
  const normalized = normalizeRole(role);
  return ROLE_CONFIGS[normalized];
}

export function canAccessTab(role: string | undefined, tab: DashboardTab): boolean {
  const config = getRoleConfig(role);
  return config.allowedTabs.includes(tab);
}

export function getRequiredRoleForTab(tab: DashboardTab): string {
  switch (tab) {
    case "overview":
    case "owner":
    case "reports":
    case "inventory":
    case "followups":
    case "settings":
    case "subscription":
      return "Salon Manager";
    default:
      return "Salon Receptionist or Manager";
  }
}
