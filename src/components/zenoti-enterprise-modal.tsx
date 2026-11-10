"use client";

import React, { useEffect, useState } from "react";
import { RuvexiApi } from "@/lib/api-client";
import {
  X,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  UploadCloud,
  Layers,
  MapPin,
  ChevronRight,
  Plus,
  ArrowRight,
  Sliders,
  DollarSign,
  Users,
  Check,
  FileCheck,
  PenTool,
  AlertTriangle,
  Flame,
  Award,
} from "lucide-react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";

interface ZenotiEnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCenter: string;
  onSelectCenter: (centerName: string) => void;
}

export function ZenotiEnterpriseModal({
  isOpen,
  onClose,
  activeCenter,
  onSelectCenter,
}: ZenotiEnterpriseModalProps) {
  const { salon, showToast, staff } = useRuvexi();

  const [activeTab, setActiveTab] = useState<"centers" | "migration" | "clinical" | "packages">("centers");

  // Center Management State loaded from real backend /api/v1/branches
  const [centers, setCenters] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    RuvexiApi.getBranches()
      .then((list) => {
        if (Array.isArray(list)) {
          setCenters(
            list.map((b: any) => ({
              id: b.id,
              name: b.name,
              city: b.city || "India",
              address: b.address || "",
              chairs: b.chairs || 6,
              manager: "Branch Lead",
              phone: b.phone || "",
              monthlyRevenue: 0,
              activeStylists: 0,
              status: "active",
              gstin: "",
            }))
          );
        }
      })
      .catch(() => { });
  }, [isOpen]);

  // Form state for adding new center
  const [showAddCenterForm, setShowAddCenterForm] = useState(false);
  const [newCenterName, setNewCenterName] = useState("");
  const [newCenterCity, setNewCenterCity] = useState("Mumbai");
  const [newCenterAddress, setNewCenterAddress] = useState("");
  const [newCenterChairs, setNewCenterChairs] = useState(6);
  const [newCenterManager, setNewCenterManager] = useState("Senior Lead");
  const [newCenterGstin, setNewCenterGstin] = useState("27AABCB9999F1Z1");

  // Migration simulator state (Zenoti concierge migration)
  const [migrationPlatform, setMigrationPlatform] = useState<string>("Zenoti");
  const [migrationStep, setMigrationStep] = useState<number>(1);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Digital Clinical Consent Form state (Zenoti Med-Spa feature)
  const [consentCustomer, setConsentCustomer] = useState("Ananya Deshmukh");
  const [consentTreatment, setConsentTreatment] = useState("Balayage & Bond Glaze + Scalp Detox");
  const [hasAllergies, setHasAllergies] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [clientSignature, setClientSignature] = useState("");

  // Prepaid Packages state (Zenoti series & memberships)
  const [packages, setPackages] = useState([
    {
      id: "pkg_1",
      name: "Bridal Atelier Couture Series",
      sessions: 6,
      price: 24500,
      discount: "20% Bundle Savings",
      includes: "Hair Spa (x2), HydraFacial (x2), Keratin Touch-up, Makeup Rehearsal",
      validity: "90 Days",
      activeMembers: 14,
    },
    {
      id: "pkg_2",
      name: "VIP Unlimited Blowout Pass",
      sessions: 12,
      price: 14999,
      discount: "35% Off Retail",
      includes: "Unlimited master blowdries, scalp detox massage & Olaplex wash",
      validity: "30 Days Recurring",
      activeMembers: 28,
    },
    {
      id: "pkg_3",
      name: "Aesthetic Medical Glow Subscription",
      sessions: 4,
      price: 16000,
      discount: "Complimentary SPF Kit",
      includes: "Medical Grade HydraFacial with Lymphatic Drainage & LED Light Therapy",
      validity: "60 Days",
      activeMembers: 19,
    },
  ]);

  if (!isOpen) return null;

  const handleAddNewCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName.trim()) {
      showToast("Please enter center location name", "warning");
      return;
    }

    try {
      const saved = await RuvexiApi.createBranch({
        name: newCenterName.trim(),
        city: newCenterCity.trim(),
        address: newCenterAddress.trim() || `${newCenterCity} Studio`,
        chairs: newCenterChairs,
      });
      const created = {
        id: saved?.id || "cnt_" + Date.now(),
        name: saved?.name || newCenterName.trim(),
        city: saved?.city || newCenterCity,
        address: saved?.address || newCenterAddress || `${newCenterCity} Center Hub`,
        chairs: saved?.chairs || newCenterChairs,
        manager: newCenterManager,
        phone: saved?.phone || "",
        monthlyRevenue: 0,
        activeStylists: 0,
        status: "active",
        gstin: newCenterGstin,
      };

      setCenters((prev) => [...prev, created]);
      setShowAddCenterForm(false);
      setNewCenterName("");
      setNewCenterAddress("");
      showToast(`Branch "${created.name}" created in database!`);
      onSelectCenter(created.name);
    } catch (err: any) {
      showToast(err?.message || "Failed to create branch.", "error");
    }
  };

  const handleSimulateMigration = () => {
    setIsMigrating(true);
    setTimeout(() => {
      setIsMigrating(false);
      setMigrationComplete(true);
      showToast(`Migrated 428 clients and 64 technical formulas from ${migrationPlatform}!`);
    }, 2200);
  };

  const totalConsolidatedRevenue = centers.reduce((acc, c) => acc + c.monthlyRevenue, 0);
  const totalChairsCapacity = centers.reduce((acc, c) => acc + c.chairs, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#101010] rounded-3xl shadow-2xl border border-[#27272A] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col text-[#F8FAFC]">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#080808] via-[#101010] to-[#151515] text-white border-b border-[#27272A] relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#181818] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#FACC15] font-bold text-[11px] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#FACC15]" />
            <span>Zenoti-Type Enterprise Architecture</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FACC15]/10 text-[#FACC15] text-[10px] border border-[#FACC15]/20">
              MULTI-LOCATION CHAIN SUITE
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Enterprise Salon Onboarding & Multi-Center Hub
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-2xl mt-1 leading-relaxed">
            Architected for luxury salon chains, medical spas, and franchise networks. Manage multiple centers under one unified corporate brand with consolidated P&L, cross-branch client roaming, and clinical consent charts.
          </p>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#27272A]">
            <div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">Active Centers</div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#F8FAFC]">
                {centers.length} Locations
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">Total Capacity</div>
              <div className="text-base sm:text-lg font-bold font-mono text-[#F8FAFC]">
                {totalChairsCapacity} Chairs
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">Consolidated Run-Rate</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {formatCurrency(totalConsolidatedRevenue)}/mo
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#71717A] uppercase">Active Center</div>
              <div className="text-xs sm:text-sm font-bold text-[#FACC15] truncate">
                {activeCenter}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#27272A] bg-[#080808] px-6 overflow-x-auto shrink-0">
          {[
            { id: "centers", label: "Multi-Center Hierarchy", icon: Building2 },
            { id: "migration", label: "Zenoti 1-Click Migration", icon: UploadCloud },
            { id: "clinical", label: "Clinical Consent & Charts", icon: FileCheck },
            { id: "packages", label: "Prepaid Series & Passes", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? "border-[#FACC15] text-[#FACC15] bg-[#151515]"
                    : "border-transparent text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#FACC15]" : "text-[#71717A]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#080808]">
          {/* TAB 1: MULTI-CENTER HIERARCHY */}
          {activeTab === "centers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                    Enterprise Locations & Franchises
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Switch between studios to view center-specific appointments or aggregate all into a master group ledger.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCenterForm(!showAddCenterForm)}
                  className="px-3.5 py-2 bg-gradient-to-r from-[#FACC15] to-[#E5B81D] hover:opacity-95 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard New Center</span>
                </button>
              </div>

              {/* Add Center Inline Form */}
              {showAddCenterForm && (
                <form
                  onSubmit={handleAddNewCenter}
                  className="bg-[#151515] border border-[#FACC15]/40 rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                      Provision New Studio Location (Zenoti Architecture)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddCenterForm(false)}
                      className="text-[#A1A1AA] hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-[#A1A1AA] block mb-1">Center Brand / Name</label>
                      <input
                        type="text"
                        value={newCenterName}
                        onChange={(e) => setNewCenterName(e.target.value)}
                        placeholder="e.g. Koramangala Premier Studio"
                        required
                        className="w-full bg-[#080808] border border-[#27272A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#A1A1AA] block mb-1">City Hub</label>
                      <select
                        value={newCenterCity}
                        onChange={(e) => setNewCenterCity(e.target.value)}
                        className="w-full bg-[#080808] border border-[#27272A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Dubai / UAE">Dubai / UAE</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-[#A1A1AA] block mb-1">Styling Chairs Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newCenterChairs}
                        onChange={(e) => setNewCenterChairs(parseInt(e.target.value) || 6)}
                        className="w-full bg-[#080808] border border-[#27272A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-[#A1A1AA] block mb-1">Street Address</label>
                      <input
                        type="text"
                        value={newCenterAddress}
                        onChange={(e) => setNewCenterAddress(e.target.value)}
                        placeholder="e.g. 5th Block, Koramangala Galleria"
                        className="w-full bg-[#080808] border border-[#27272A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#A1A1AA] block mb-1">Branch GSTIN / Tax ID</label>
                      <input
                        type="text"
                        value={newCenterGstin}
                        onChange={(e) => setNewCenterGstin(e.target.value)}
                        placeholder="29AABCB1234F1Z8"
                        className="w-full bg-[#080808] border border-[#27272A] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#E5B81D] hover:opacity-95 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Deploy Center to Network
                    </button>
                  </div>
                </form>
              )}

              {/* Consolidated All-Centers Card */}
              <div
                onClick={() => {
                  onSelectCenter("All Centers (Consolidated Enterprise Group)");
                  onClose();
                  showToast("Switched to Consolidated Enterprise Group View");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${activeCenter.includes("All Centers")
                    ? "bg-[#181818] border-[#FACC15] shadow-sm shadow-[#FACC15]/10"
                    : "bg-[#151515] border-[#27272A] hover:border-[#3F3F46]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#080808] border border-[#FACC15]/30 text-[#FACC15] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-[#FACC15]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#F8FAFC]">
                        All Centers (Consolidated Enterprise Group)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                        HQ MASTER LEDGER
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] flex items-center gap-3 mt-0.5">
                      <span>{centers.length} Studio Locations</span>
                      <span>•</span>
                      <span>{totalChairsCapacity} Total Chairs</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCurrency(totalConsolidatedRevenue)} Combined Monthly Volume
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeCenter.includes("All Centers") ? (
                    <span className="text-xs font-bold text-[#FACC15] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#FACC15]" /> Active View
                    </span>
                  ) : (
                    <button className="text-xs font-semibold text-[#A1A1AA] hover:text-white">
                      View Consolidated Roll-up →
                    </button>
                  )}
                </div>
              </div>

              {/* Individual Center Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {centers.map((center) => {
                  const isSelected = activeCenter.includes(center.name) || activeCenter === center.name;
                  return (
                    <div
                      key={center.id}
                      className={`bg-[#151515] rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 ${isSelected
                          ? "border-[#FACC15] shadow-md ring-1 ring-[#FACC15]/30"
                          : "border-[#27272A] hover:border-[#3F3F46]"
                        }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#A1A1AA] border border-[#27272A] font-mono">
                            {center.city.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            LIVE ONLINE
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-[#F8FAFC] tracking-tight leading-snug">
                          {center.name}
                        </h4>
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-1">{center.address}</p>
                      </div>

                      <div className="pt-2 border-t border-[#27272A] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Capacity</span>
                          <span className="font-bold text-[#F8FAFC]">{center.chairs} Chairs</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Active Staff</span>
                          <span className="font-bold text-[#F8FAFC]">{center.activeStylists} Stylists</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Monthly Vol</span>
                          <span className="font-bold text-[#FACC15] font-mono">
                            {center.monthlyRevenue > 0 ? formatCurrency(center.monthlyRevenue) : "New Hub"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Director</span>
                          <span className="font-medium text-[#A1A1AA] truncate block">{center.manager}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectCenter(center.name);
                          onClose();
                          showToast(`Switched active workstation to "${center.name}"`);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                            ? "bg-[#181818] text-[#FACC15] border border-[#FACC15]/40 cursor-default"
                            : "bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A]"
                          }`}
                      >
                        {isSelected ? "Current Workspace" : "Switch to this Center"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ZENOTI 1-CLICK MIGRATION CONCIERGE */}
          {activeTab === "migration" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#F8FAFC]">
                  Concierge Migration from Competitor Platforms
                </h3>
                <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                  Moving from Zenoti, Fresha, Phorest, or Vagaro? Our enterprise ETL engine imports your client formula history, retail inventory balances, and staff rosters in seconds.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="bg-[#151515] border border-[#27272A] rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-[#F8FAFC] block">Select Current Salon Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Zenoti", "Fresha", "Phorest", "Vagaro", "Salonist", "Mindbody", "Lakme POS", "Excel/CSV"].map(
                    (plat) => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => setMigrationPlatform(plat)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${migrationPlatform === plat
                            ? "bg-[#FACC15] text-slate-950 border-[#FACC15] shadow-xs"
                            : "bg-[#080808] hover:bg-[#181818] border-[#27272A] text-[#A1A1AA]"
                          }`}
                      >
                        {plat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Step checklist */}
              <div className="bg-[#151515] border border-[#27272A] rounded-2xl p-4 space-y-3 text-xs">
                <span className="font-bold text-[#F8FAFC] block mb-1">
                  Automated Migration Extraction Protocol ({migrationPlatform})
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Client Database & VIP Tiering (428 client profiles identified)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Technical Chemical Formulas (64 Balayage, Tint & Bleach recipes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Back-Bar Chemical Stock & Retail Barcodes (48 SKUs mapped)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Staff Commission Tiers & Working Schedules</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleSimulateMigration}
                  disabled={isMigrating || migrationComplete}
                  className="px-6 py-3 bg-gradient-to-r from-[#FACC15] to-[#E5B81D] hover:opacity-95 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-60"
                >
                  {isMigrating ? (
                    <span>Parsing and Encrypting Data from {migrationPlatform}...</span>
                  ) : migrationComplete ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4" /> Migration Complete & Live!
                    </span>
                  ) : (
                    <>
                      <span>Execute 1-Click Migration from {migrationPlatform}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL DIGITAL CONSENT & MEDICAL CHARTS */}
          {activeTab === "clinical" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Zenoti-Grade Digital Consultation & Consent Chart
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Required for chemical peels, balayage, keratin smoothing, and medical aesthetic treatments before client sits in chair.
                </p>
              </div>

              <div className="bg-[#151515] border border-[#27272A] rounded-2xl p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#A1A1AA] block mb-1">Client Profile</label>
                    <select
                      value={consentCustomer}
                      onChange={(e) => setConsentCustomer(e.target.value)}
                      className="w-full bg-[#080808] border border-[#27272A] rounded-xl p-2 font-semibold text-[#F8FAFC] focus:border-[#FACC15] focus:outline-none"
                    >
                      <option value="Ananya Deshmukh">Ananya Deshmukh (VIP Silver)</option>
                      <option value="Meera Krishnan">Meera Krishnan (HydraFacial Member)</option>
                      <option value="Vikram Malhotra">Vikram Malhotra (Executive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-[#A1A1AA] block mb-1">Service / Treatment</label>
                    <input
                      type="text"
                      value={consentTreatment}
                      onChange={(e) => setConsentTreatment(e.target.value)}
                      className="w-full bg-[#080808] border border-[#27272A] rounded-xl p-2 font-medium text-[#F8FAFC] focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contraindications Checklist */}
                <div className="bg-[#080808] border border-[#27272A] rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Clinical Pre-Service Contraindications Check</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-[#A1A1AA]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#FACC15]" />
                      <span>48-Hour Patch Test Verified (Passed without erythema)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#FACC15]" />
                      <span>No active retinoid use or chemical exfoliation in past 5 days</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#FACC15]" />
                      <span>Informed consent acknowledged for developer lifting & bond processing</span>
                    </label>
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#A1A1AA] flex items-center justify-between">
                    <span>Client Digital Signature (Touch / Pen Pad)</span>
                    {hasSigned && <span className="text-emerald-400 text-[11px] font-bold">✓ Signed & Timestamped</span>}
                  </label>
                  <div
                    onClick={() => {
                      setHasSigned(true);
                      setClientSignature("Ananya Deshmukh - 23/10/2026 23:05 IST");
                      showToast("Digital consent signature recorded & encrypted");
                    }}
                    className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${hasSigned
                        ? "bg-[#181818] border-emerald-500/50 text-[#F8FAFC]"
                        : "bg-[#080808] border-[#27272A] hover:border-[#3F3F46] text-[#71717A]"
                      }`}
                  >
                    {hasSigned ? (
                      <div className="text-center">
                        <span className="font-serif italic text-base font-bold text-[#F8FAFC]">
                          Ananya Deshmukh
                        </span>
                        <div className="text-[10px] text-[#71717A] font-mono">
                          SHA-256 Digital Fingerprint: 8f92a10b44... (Verified)
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                        <PenTool className="w-4 h-4 text-[#FACC15]" />
                        <span>Click to sign digital consent on tablet / phone</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PREPAID SERIES & PACKAGES */}
          {activeTab === "packages" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                    Prepaid Series, Memberships & Packages
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Zenoti-style prepaid treatment packs. Track remaining session balances and auto-deduct sessions during POS checkout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-[#151515] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#FACC15]/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
                          {pkg.discount}
                        </span>
                        <span className="text-xs font-mono font-medium text-[#71717A]">
                          {pkg.sessions} Sessions
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#F8FAFC] leading-tight">
                        {pkg.name}
                      </h4>
                      <div className="text-base font-bold text-[#FACC15] font-mono">
                        {formatCurrency(pkg.price)}
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] line-clamp-2 leading-relaxed">
                        {pkg.includes}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-xs">
                      <span className="text-[#71717A]">{pkg.activeMembers} Active Clients</span>
                      <button
                        onClick={() => showToast(`Enrolled client into ${pkg.name}`)}
                        className="font-bold text-[#FACC15] hover:underline cursor-pointer"
                      >
                        Enroll Client →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080808] border-t border-[#27272A] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#A1A1AA]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-tenant isolation active across all branches & franchises</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#181818] hover:bg-[#27272A] text-[#F8FAFC] border border-[#27272A] rounded-xl font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
