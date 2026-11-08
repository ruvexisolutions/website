"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import { RuvexiLogo } from "./brand/ruvexi-logo";
import { FrontDeskView } from "./front-desk-view";
import { SalonOwnerView } from "./salon-owner-view";
import { OverviewView } from "./overview-view";
import { PosView } from "./pos-view";
import { StaffView } from "./staff-view";
import { InventoryView } from "./inventory-view";
import { CrmFollowupsView } from "./crm-followups-view";
import { CalendarView } from "./calendar-view";
import { BookingPreviewView } from "./booking-preview-view";
import { CustomersView } from "./customers-view";
import { ServicesView } from "./services-view";
import { ReportsView } from "./reports-view";
import { SettingsView } from "./settings-view";
import { SubscriptionView } from "./subscription-view";
import { ZenotiEnterpriseModal } from "./zenoti-enterprise-modal";
import { RoleSwitcher } from "./role-switcher";
import { RolePermissionGuard } from "./role-permission-guard";
import { canAccessTab, getRoleConfig, DashboardTab, UserRole } from "@/lib/role-permissions";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Calendar,
  Globe,
  Building2,
  Menu,
  X,
  Clock,
  Scissors,
  BarChart3,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
  LogOut,
  Plus,
  Lock,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeft,
  AlertTriangle,
  ArrowUpRight,
  Command,
  ImagePlus,
} from "lucide-react";

export type TabType =
  | "frontdesk"
  | "owner"
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
  | "subscription";

const tabToPathMap: Record<TabType, string> = {
  frontdesk: "/front-desk",
  owner: "/owner",
  overview: "/overview",
  calendar: "/calendar",
  pos: "/pos",
  customers: "/customers",
  services: "/services",
  staff: "/staff",
  inventory: "/inventory",
  followups: "/whatsapp",
  reports: "/reports",
  booking: "/book",
  settings: "/settings",
  subscription: "/subscription",
};

interface DemoShellProps {
  initialTab?: TabType;
  initialSubTab?: string;
}

export function DemoShell({ initialTab = "frontdesk", initialSubTab }: DemoShellProps) {
  const router = useRouter();
  const {
    user,
    salon,
    followUps,
    inventory,
    staff,
    invoices,
    customers,
    services,
    appointments,
    logout,
    isBackendConnected,
  } = useRuvexi();

  const userRole = ((user?.role as UserRole) || "owner");
  const roleConfig = getRoleConfig(userRole);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (canAccessTab(user?.role, initialTab)) return initialTab;
    return roleConfig.defaultTab;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(salon.branch || "Flagship Studio - Bandra West");
  const [isZenotiModalOpen, setIsZenotiModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Search & Notifications Popover States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync tab if user switches role to one that cannot access current tab
  useEffect(() => {
    if (!canAccessTab(user?.role, activeTab)) {
      setActiveTab(roleConfig.defaultTab);
    }
  }, [user?.role]);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K for command palette search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Strict Authentication Guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined" && tabToPathMap[tabId]) {
      window.history.pushState(null, "", tabToPathMap[tabId]);
    }
  };

  const totalTodayRevenue = invoices.reduce((acc, inv) => acc + (inv.total || inv.grandTotal || 0), 0);
  const clockedInStaffCount = staff.filter((s) => s.isClockedIn || s.status === "clocked_in").length;
  const pendingFollowUps = followUps.filter((f) => f.status === "pending" || f.status === "Pending").length;
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);
  const totalNotifications = lowStockItems.length + (pendingFollowUps > 0 ? 1 : 0);

  const handleGoToPosFromCalendar = (
    _customerName: string,
    _serviceName: string,
    _staffName: string
  ) => {
    handleSelectTab("pos");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isManager = roleConfig.role === "SALON_MANAGER";

  const navSections = isManager
    ? [
        {
          title: "MANAGEMENT",
          items: [
            {
              id: "overview" as TabType,
              label: "Business Overview",
              icon: LayoutDashboard,
              badge: null,
            },
            {
              id: "reports" as TabType,
              label: "Reports & Analytics",
              icon: BarChart3,
              badge: "P&L",
              badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
            },
          ],
        },
        {
          title: "SALON OPERATIONS",
          items: [
            {
              id: "frontdesk" as TabType,
              label: "Front Desk Counter",
              icon: CheckCircle2,
              badge: "Live",
              badgeColor: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
            },
            {
              id: "calendar" as TabType,
              label: "Appointment Calendar",
              icon: Calendar,
              badge: appointments.length > 0 ? `${appointments.length}` : null,
              badgeColor: "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30",
            },
            {
              id: "pos" as TabType,
              label: "POS Billing & Checkout",
              icon: Receipt,
              badge: "Quick",
              badgeColor: "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30",
            },
            {
              id: "customers" as TabType,
              label: "Customer CRM",
              icon: Users,
              badge: customers.length > 0 ? `${customers.length}` : null,
              badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
            },
            {
              id: "services" as TabType,
              label: "Services & Pricing",
              icon: Scissors,
              badge: null,
            },
            {
              id: "staff" as TabType,
              label: "Staff & Schedules",
              icon: Users,
              badge: clockedInStaffCount > 0 ? `${clockedInStaffCount} In` : null,
              badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
            },
            {
              id: "inventory" as TabType,
              label: "Stock & Products",
              icon: Boxes,
              badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : null,
              badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
            },
            {
              id: "followups" as TabType,
              label: "WhatsApp & Notifications",
              icon: MessageSquare,
              badge: pendingFollowUps > 0 ? `${pendingFollowUps}` : null,
              badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
            },
          ],
        },
        {
          title: "ADMINISTRATION",
          items: [
            {
              id: "settings" as TabType,
              label: "Salon Settings",
              icon: SettingsIcon,
              badge: null,
            },
            {
              id: "subscription" as TabType,
              label: "Subscription & Trial",
              icon: ShieldCheck,
              badge: salon.subscriptionStatus === "trial" ? "Trial" : "Pro",
              badgeColor: "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30",
            },
          ],
        },
      ]
    : [
        {
          title: "FRONT DESK OPERATIONS",
          items: [
            {
              id: "frontdesk" as TabType,
              label: "Front Desk Counter",
              icon: CheckCircle2,
              badge: "Live",
              badgeColor: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
            },
            {
              id: "calendar" as TabType,
              label: "Appointment Calendar",
              icon: Calendar,
              badge: appointments.length > 0 ? `${appointments.length}` : null,
              badgeColor: "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30",
            },
            {
              id: "pos" as TabType,
              label: "POS Billing & Checkout",
              icon: Receipt,
              badge: "Quick",
              badgeColor: "bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30",
            },
            {
              id: "customers" as TabType,
              label: "Customer CRM",
              icon: Users,
              badge: customers.length > 0 ? `${customers.length}` : null,
              badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
            },
            {
              id: "services" as TabType,
              label: "Services Catalog",
              icon: Scissors,
              badge: "View",
            },
            {
              id: "staff" as TabType,
              label: "Staff Availability",
              icon: Users,
              badge: clockedInStaffCount > 0 ? `${clockedInStaffCount} In` : null,
              badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
            },
          ],
        },
      ];

  const getActiveTabTitle = () => {
    for (const sec of navSections) {
      const found = sec.items.find((i) => i.id === activeTab);
      if (found) return found.label;
    }
    const tabTitles: Record<string, string> = {
      frontdesk: "Front Desk Counter",
      calendar: "Appointment Calendar",
      pos: "POS Billing & Checkout",
      customers: "Customer CRM",
      services: "Services & Pricing",
      staff: "Staff Availability",
      overview: "Daily Overview",
      owner: "Salon Owner View",
      inventory: "Stock & Products",
      followups: "WhatsApp Retention",
      reports: "Sales & Tax Reports",
      booking: "Online Booking Site",
      settings: "Salon Settings",
    };
    return tabTitles[activeTab] || "Front Desk Counter";
  };

  // Filter items for command palette search
  const filteredCustomersSearch = searchQuery.trim()
    ? customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    ).slice(0, 4)
    : [];

  const filteredServicesSearch = searchQuery.trim()
    ? services.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4)
    : [];

  const filteredInventorySearch = searchQuery.trim()
    ? inventory.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4)
    : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#151515] border border-[#27272A] flex items-center justify-center text-[#FACC15] mb-4 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#F8FAFC] mb-2">Access Restricted</h2>
        <p className="text-xs text-[#71717A] max-w-sm mb-6 leading-relaxed">
          Authentication is required to access the Ruvexi management operating system. Please sign in with your credentials.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-[#FACC15] text-[#080808] font-bold text-xs hover:bg-[#EAB308] transition-all shadow-md"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col font-sans text-[#F8FAFC] antialiased selection:bg-[#FACC15]/30 selection:text-[#F8FAFC]">
      <div className="flex-1 flex min-h-screen">
        {/* ============================================================ */}
        {/* DESKTOP SIDE NAVIGATION BAR */}
        {/* ============================================================ */}
        <aside
          className={`hidden lg:flex bg-[#101010] border-r border-[#27272A] flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl transition-all duration-200 ${isSidebarCollapsed ? "w-20" : "w-64 xl:w-72"
            }`}
        >
          {/* Top Brand & Branch Header */}
          <div className="p-4 border-b border-[#27272A] space-y-3.5">
            {/* Salon Brand Title with Ruvexi Logo & Collapse Toggle */}
            <div className="flex items-center justify-between">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                {isSidebarCollapsed ? (
                  (salon.logoUrl || salon.logo) ? (
                    <img
                      src={salon.logoUrl || salon.logo}
                      alt={salon.name}
                      className="w-9 h-9 rounded-xl object-cover border border-[#FACC15]/40 shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#151515] border border-[#27272A] flex items-center justify-center text-[#FACC15] font-black text-sm">
                      {salon.name ? salon.name.substring(0, 2).toUpperCase() : "BC"}
                    </div>
                  )
                ) : (
                  <RuvexiLogo size="sm" variant="light" showSubtitle={true} />
                )}
              </Link>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C] transition-colors"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4 text-[#FACC15]" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Active Salon Branch Card (when expanded) */}
            {!isSidebarCollapsed && (
              <div className="bg-[#151515] border border-[#27272A] rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                    Active Studio
                  </span>
                  {salon.branches && salon.branches.length > 1 && (
                    <button
                      onClick={() => setIsZenotiModalOpen(true)}
                      className="text-[9px] font-mono uppercase text-[#FACC15] bg-[#FACC15]/10 hover:bg-[#FACC15]/20 px-1.5 py-0.5 rounded border border-[#FACC15]/20 cursor-pointer transition-colors"
                      title="Switch Studio"
                    >
                      Switch
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {(salon.logoUrl || salon.logo) ? (
                    <img
                      src={salon.logoUrl || salon.logo}
                      alt={salon.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#FACC15]/40 shrink-0 bg-[#090909]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] font-bold text-xs shrink-0 font-serif">
                      {salon.name ? salon.name.substring(0, 2).toUpperCase() : "BC"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-[#F8FAFC] truncate font-sans">
                      {salon.name}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#A1A1AA] font-light">
                      <Building2 className="w-3 h-3 text-[#FACC15] shrink-0" />
                      <span className="truncate">{salon.city || selectedBranch}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick POS Checkout CTA */}
            <button
              onClick={() => handleSelectTab("pos")}
              className={`w-full py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FACC15]/40 ${
                isSidebarCollapsed ? "px-0" : "px-3"
              }`}
              title="Quick POS Checkout"
            >
              <Receipt className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Quick POS Bill</span>}
            </button>

            {/* Trial Status Pill (when expanded) */}
            {!isSidebarCollapsed && salon.subscriptionStatus === "trial" && (
              <div
                onClick={() => handleSelectTab("subscription")}
                className="cursor-pointer bg-[#FACC15]/10 border border-[#FACC15]/25 hover:border-[#FACC15] rounded-xl px-2.5 py-1.5 flex items-center justify-between transition-colors"
                title="7-Day Free Trial Active. Click to view subscription options."
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-ping" />
                  <span className="text-[11px] font-mono text-[#FACC15] font-semibold">
                    7-Day Trial: {typeof salon.trialDaysLeft === "number" ? salon.trialDaysLeft : 7}d left
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-[#FACC15]" />
              </div>
            )}
          </div>

          {/* Middle Nav Items (Receptionist Operations) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                    {section.title}
                  </div>
                )}
                <nav className="space-y-0.5">
                  {section.items.map((item: any) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.label}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                        } rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-[#171717] text-[#F8FAFC] border-l-2 border-[#FACC15] shadow-sm font-semibold"
                            : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#171717]/60"
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? "text-[#FACC15]" : "text-[#71717A]"
                            }`}
                          />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                              item.badgeColor || "bg-[#181818] text-[#A1A1AA] border-[#27272A]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Footer Info & Real Authenticated User Profile */}
          <div className="p-3 border-t border-[#27272A] bg-[#080808] space-y-2">
            {/* Authenticated User Card */}
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center p-1.5" : "justify-between p-2.5"
              } bg-[#151515] border border-[#27272A] rounded-xl shadow-sm`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FACC15] text-[#080808] flex items-center justify-center text-xs font-black shrink-0">
                  {user?.avatar || user?.name?.charAt(0) || "R"}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-[#F8FAFC] truncate">
                      {user?.name || roleConfig.shortTitle}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${roleConfig.badgeClasses}`}>
                        {roleConfig.shortTitle}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors cursor-pointer"
                  title="Sign out of Ruvexi"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Links (when expanded) */}
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between text-[11px] text-[#71717A] font-medium px-1">
                <Link
                  href="/book"
                  className="hover:text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
                  target="_blank"
                >
                  <Globe className="w-3 h-3 text-[#71717A]" />
                  <span>Client Site ↗</span>
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-[#FACC15] hover:text-[#EAB308] font-bold flex items-center gap-1 transition-colors"
                    title="Ruvexi Platform Super Admin Hub"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#FACC15]" />
                    <span>Super Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MOBILE DRAWER NAVIGATION */}
        {/* ============================================================ */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
            <div className="bg-[#101010] border-r border-[#27272A] text-[#F8FAFC] w-72 max-w-[85vw] h-full flex flex-col justify-between p-4 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <RuvexiLogo size="sm" variant="light" showSubtitle={true} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#151515] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Active Studio Card in Mobile Drawer */}
                <div className="bg-[#151515] border border-[#27272A] rounded-xl p-2.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                    Active Studio
                  </span>
                  <div className="font-medium text-xs text-[#F8FAFC] truncate font-sans">
                    {salon.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] font-light">
                    <Building2 className="w-3 h-3 text-[#FACC15] shrink-0" />
                    <span className="truncate">{salon.city || selectedBranch}</span>
                  </div>
                </div>

                {/* Quick POS Bill CTA in Mobile Drawer */}
                <button
                  onClick={() => {
                    handleSelectTab("pos");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Quick POS Bill</span>
                </button>

                {/* Mobile Receptionist Nav Items */}
                <div className="space-y-3 overflow-y-auto max-h-[50vh]">
                  {navSections.map((sec) => (
                    <div key={sec.title} className="space-y-1">
                      <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider font-mono">
                        {sec.title}
                      </div>
                      <div className="space-y-1">
                        {sec.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;

                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                handleSelectTab(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-[#171717] text-[#F8FAFC] border-l-2 border-[#FACC15]"
                                  : "text-[#A1A1AA] hover:bg-[#171717]/60 hover:text-[#F8FAFC]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className={`w-4 h-4 ${isActive ? "text-[#FACC15]" : "text-[#71717A]"}`} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#151515] text-[#A1A1AA] border border-[#27272A]">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom of Mobile Drawer */}
              <div className="pt-3 border-t border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1">
                  <span className="text-[#F8FAFC] font-medium">{user?.name || "Receptionist"}</span>
                  <Link
                    href="/book"
                    className="hover:text-[#F8FAFC] flex items-center gap-1 transition-colors"
                    target="_blank"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Client Site ↗</span>
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-[#F87171] hover:bg-[#F87171]/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN BODY AREA & TOP CONSOLE BAR */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
          {/* Mobile Menu Trigger (Floating on small screens when sidebar is hidden) */}
          <div className="lg:hidden fixed top-4 right-4 z-40">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-[#101010]/90 backdrop-blur-md border border-[#27272A] text-[#F8FAFC] shadow-lg hover:border-[#FACC15] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>


          {/* Main Module Content View guarded by Role-Based Feature Isolation */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
            {!canAccessTab(user?.role, activeTab) ? (
              <RolePermissionGuard
                tab={activeTab}
                tabLabel={getActiveTabTitle()}
                onNavigateToAllowedTab={(tab) => handleSelectTab(tab)}
              />
            ) : (
              <>
                {activeTab === "frontdesk" && (
                  <FrontDeskView
                    onNavigateTab={(tab) => handleSelectTab(tab as any)}
                    onGoToPosBilling={handleGoToPosFromCalendar}
                  />
                )}
                {activeTab === "owner" && <SalonOwnerView />}
                {activeTab === "overview" && <OverviewView onNavigateTab={(tab) => handleSelectTab(tab as any)} />}
                {activeTab === "calendar" && <CalendarView onGoToPosBilling={handleGoToPosFromCalendar} />}
                {activeTab === "pos" && <PosView />}
                {activeTab === "customers" && (
                  <CustomersView
                    onGoToPos={(_cid) => handleSelectTab("pos")}
                    onGoToBooking={(_name, _phone) => handleSelectTab("calendar")}
                  />
                )}
                {activeTab === "services" && <ServicesView />}
                {activeTab === "staff" && <StaffView />}
                {activeTab === "inventory" && <InventoryView />}
                {activeTab === "followups" && <CrmFollowupsView />}
                {activeTab === "reports" && <ReportsView />}
                {activeTab === "booking" && <BookingPreviewView />}
                {activeTab === "settings" && <SettingsView initialSubTab={(initialSubTab as any) || "general"} />}
                {activeTab === "subscription" && <SubscriptionView />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Command Search Modal (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-xl bg-[#151515] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-[#27272A] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#FACC15]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, services, stock or jump to tabs..."
                className="flex-1 bg-transparent border-0 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#1C1C1C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3 max-h-96 overflow-y-auto text-xs">
              {searchQuery.trim() === "" ? (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider px-2">
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "pos", label: "POS Billing", icon: Receipt },
                      { id: "calendar", label: "Appointment Calendar", icon: Calendar },
                      { id: "customers", label: "Customer CRM", icon: Users },
                      { id: "inventory", label: "Stock & Inventory", icon: Boxes },
                      { id: "reports", label: "Financial Reports", icon: BarChart3 },
                      { id: "followups", label: "WhatsApp Retention", icon: MessageSquare },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleSelectTab(item.id as TabType);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#181818] hover:bg-[#1C1C1C] border border-[#27272A] text-left text-[#F8FAFC] transition-colors"
                        >
                          <Icon className="w-4 h-4 text-[#FACC15]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomersSearch.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider px-2 mb-1">
                        Customers
                      </div>
                      {filteredCustomersSearch.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            handleSelectTab("customers");
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-xl hover:bg-[#1C1C1C] cursor-pointer flex items-center justify-between text-[#F8FAFC]"
                        >
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-[11px] text-[#71717A]">{c.phone}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] border border-[#27272A] text-[#FACC15]">
                            {c.vipTier || "Client"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredServicesSearch.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider px-2 mb-1">
                        Services
                      </div>
                      {filteredServicesSearch.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            handleSelectTab("services");
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-xl hover:bg-[#1C1C1C] cursor-pointer flex items-center justify-between text-[#F8FAFC]"
                        >
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-[11px] text-[#71717A]">{s.category} • {s.durationMinutes} mins</div>
                          </div>
                          <span className="font-mono text-[#FACC15]">
                            {formatCurrency(s.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredInventorySearch.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider px-2 mb-1">
                        Products & Stock
                      </div>
                      {filteredInventorySearch.map((i) => (
                        <div
                          key={i.id}
                          onClick={() => {
                            handleSelectTab("inventory");
                            setIsSearchOpen(false);
                          }}
                          className="p-2 rounded-xl hover:bg-[#1C1C1C] cursor-pointer flex items-center justify-between text-[#F8FAFC]"
                        >
                          <div>
                            <div className="font-semibold">{i.name}</div>
                            <div className="text-[11px] text-[#71717A]">SKU: {i.sku}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] border border-[#27272A] text-[#10B981]">
                            {i.currentStock} in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredCustomersSearch.length === 0 &&
                    filteredServicesSearch.length === 0 &&
                    filteredInventorySearch.length === 0 && (
                      <div className="text-center py-6 text-[#71717A]">
                        No matching results found for "{searchQuery}".
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-[#101010] border-t border-[#27272A] flex items-center justify-between text-[11px] text-[#71717A] px-4 font-mono">
              <span>Press ESC to close</span>
              <span>Ruvexi Command Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* Zenoti Enterprise Multi-Center & Clinical Suite Modal */}
      <ZenotiEnterpriseModal
        isOpen={isZenotiModalOpen}
        onClose={() => setIsZenotiModalOpen(false)}
        activeCenter={selectedBranch}
        onSelectCenter={(center) => setSelectedBranch(center)}
      />
    </div>
  );
}

export const DashboardShell = DemoShell;
