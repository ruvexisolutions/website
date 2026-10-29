"use client";

import React, { useState } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import { billcareApi } from "@/lib/api-client";
import {
  Users,
  Clock,
  Award,
  DollarSign,
  TrendingUp,
  UserPlus,
  Star,
  CheckCircle2,
  Coffee,
  LogOut,
  Phone,
  Sparkles,
  Percent,
  X,
  Edit2,
  Calendar,
  Crown,
  ShieldCheck,
  Scissors,
  Lock,
  Mail,
  Copy,
  Check,
  Headphones,
  ExternalLink,
} from "lucide-react";

export function StaffView() {
  const { user, salon, staff, toggleStaffStatus, updateStaffCommission, addStaffMember, showToast } = useBillCare();
  const isOwner = user?.role === "owner" || user?.role === "admin" || user?.role === "SALON_MANAGER";

  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(15);

  // Form State for new staff
  const [name, setName] = useState("");
  const [role, setRole] = useState("Master Hair Stylist");
  const [specialties, setSpecialties] = useState("Balayage, Keratin Therapy");
  const [phone, setPhone] = useState("+91 98");
  const [commissionRate, setCommissionRate] = useState(15);
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  );

  // Aggregated totals
  const totalTodayRevenue = staff.reduce((acc, s) => acc + (s.todayRevenue || s.todayEarnings || 0), 0);
  const totalCommissionPayout = staff.reduce((acc, s) => acc + (s.todayCommission || 0), 0);
  const clockedInCount = staff.filter((s) => s.status === "clocked_in" || s.isClockedIn).length;
  const onBreakCount = staff.filter((s) => s.status === "on_break").length;

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStaffMember({
      name,
      role,
      specialty: specialties.split(",").map((s) => s.trim()),
      phone,
      avatar,
      commissionRate,
      status: "clocked_in",
      clockInTime: "Just now",
    });

    setName("");
    setPhone("+91 98");
    setShowAddModal(false);
  };

  const handleSaveCommission = (id: string) => {
    updateStaffCommission(id, newCommissionRate);
    setEditingCommissionId(null);
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      showToast("Please provide a valid work email address", "error");
      return;
    }
    setIsInviting(true);
    try {
      const res = await billcareApi.createInvitation(inviteEmail.trim().toLowerCase());
      if (res.success && res.inviteUrl) {
        const fullUrl = typeof window !== "undefined"
          ? `${window.location.origin}${res.inviteUrl}`
          : res.inviteUrl;
        setGeneratedLink(fullUrl);
        showToast("Receptionist invite link generated successfully!", "success");
      } else {
        showToast(res.message || "Could not generate invitation", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to generate receptionist invite", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setHasCopied(true);
    showToast("Invite link copied to clipboard!", "success");
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">Staff & Stylists</h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                Attendance & Earnings
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Who is working today • Commission earnings • 1-tap clock in / out
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setInviteEmail("");
              setGeneratedLink(null);
              setShowInviteModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#151515] hover:bg-[#1E1E1E] text-[#FACC15] border border-[#FACC15]/30 hover:border-[#FACC15] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-[#FACC15]" /> Invite Receptionist
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add Stylist
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Working Right Now</span>
            <span className="p-2 bg-[#181818] text-emerald-400 rounded-lg border border-[#27272A]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#F8FAFC] mt-2">
            {clockedInCount} <span className="text-xs text-[#71717A]">/ {staff.length} Present</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            {onBreakCount} on break • {staff.length - clockedInCount - onBreakCount} off shift
          </p>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Today's Stylist Sales</span>
            <span className="p-2 bg-[#181818] text-[#FACC15] rounded-lg border border-[#27272A]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#FACC15] mt-2">{formatCurrency(totalTodayRevenue)}</div>
          <p className="text-[11px] text-[#A1A1AA] mt-1 font-mono">Services & products sold today</p>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Total Commission</span>
            <span className="p-2 bg-[#181818] text-[#FACC15] rounded-lg border border-[#27272A]">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#FACC15] mt-2">{formatCurrency(totalCommissionPayout)}</div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">Calculated from today's bills</p>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Client Reviews</span>
            <span className="p-2 bg-[#181818] text-[#FACC15] rounded-lg border border-[#27272A]">
              <Star className="w-4 h-4 fill-[#FACC15]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#F8FAFC] mt-2">4.88 ★</div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">100% verified customer feedbacks</p>
        </div>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="bg-[#151515] border border-[#27272A] p-12 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F8FAFC]">No Team Members Yet</h3>
            <p className="text-xs text-[#71717A] mt-1">
              Add your stylists, barbers, nail artists, and team to start tracking attendance and commissions.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Your First Team Member
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-[#151515] border border-[#27272A] rounded-xl p-5 flex flex-col justify-between hover:border-[#FACC15]/50 hover:bg-[#181818] transition-all shadow-lg"
          >
            <div>
              {/* Member Top Bar */}
              <div className="flex items-start gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#27272A] shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[#F8FAFC] truncate">{member.name}</h3>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        member.status === "clocked_in"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : member.status === "on_break"
                          ? "bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30"
                          : "bg-[#181818] text-[#71717A] border border-[#27272A]"
                      }`}
                    >
                      {member.status === "clocked_in" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {member.status === "on_break" && <Coffee className="w-3.5 h-3.5" />}
                      {member.status === "clocked_out" && <LogOut className="w-3.5 h-3.5" />}
                      {member.status === "clocked_in"
                        ? "Clocked In"
                        : member.status === "on_break"
                        ? "On Break"
                        : "Clocked Out"}
                    </span>
                  </div>
                  <p className="text-xs text-[#FACC15] font-bold mt-0.5">{member.role}</p>
                  <p className="text-[11px] text-[#71717A] font-mono flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-[#71717A]" /> {member.phone} •{" "}
                    <span className="text-[#FACC15] font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#FACC15] text-[#FACC15]" /> {member.rating}
                    </span>
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {(member.specialty || []).map((spec: any, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-medium bg-[#181818] text-[#A1A1AA] px-2.5 py-0.5 rounded-lg border border-[#27272A]"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Performance Stats Box */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3.5 bg-[#101010] rounded-xl border border-[#27272A] text-center">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-[#71717A] block tracking-wider">
                    Completed
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F8FAFC] mt-0.5 block">
                    {member.todayServicesCount || member.totalServicesCompleted || 0} sessions
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-[#71717A] block tracking-wider">
                    Attributed
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FACC15] mt-0.5 block">
                    {formatCurrency(member.todayRevenue || member.todayEarnings || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-[#71717A] block tracking-wider">
                    Commission
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                    {formatCurrency(member.todayCommission || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Shift Toggle & Commission Edit */}
            <div className="mt-5 pt-3.5 border-t border-[#27272A] flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {editingCommissionId === member.id ? (
                  <div className="flex items-center gap-1.5 bg-[#181818] border border-[#FACC15] rounded-xl p-1">
                    <input
                      type="number"
                      value={newCommissionRate}
                      onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                      className="w-12 text-xs font-mono font-bold text-[#F8FAFC] bg-transparent text-center focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#71717A]">%</span>
                    <button
                      onClick={() => handleSaveCommission(member.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-[#FACC15] text-[#080808] rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCommissionId(member.id);
                      setNewCommissionRate(member.commissionRate);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F8FAFC] font-mono font-bold bg-[#181818] px-2.5 py-1.5 rounded-xl border border-[#27272A] transition-all cursor-pointer"
                    title="Click to modify commission rate rule"
                  >
                    <Percent className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Rate: <b className="text-[#FACC15]">{member.commissionRate}%</b></span>
                    <Edit2 className="w-3 h-3 text-[#71717A]" />
                  </button>
                )}
              </div>

              {/* Status Switcher Button */}
              <button
                onClick={() => toggleStaffStatus(member.id)}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#181818] hover:bg-[#27272A] border border-[#27272A] text-[#F8FAFC] rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                Toggle Shift
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">Add New Team Specialist</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Menon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                  >
                    <option value="Senior Hair Stylist" className="bg-[#151515] text-[#F8FAFC]">Senior Hair Stylist</option>
                    <option value="Master Colorist" className="bg-[#151515] text-[#F8FAFC]">Master Colorist</option>
                    <option value="Senior Barber" className="bg-[#151515] text-[#F8FAFC]">Senior Barber</option>
                    <option value="Clinical Aesthetician" className="bg-[#151515] text-[#F8FAFC]">Clinical Aesthetician</option>
                    <option value="Nail Artiste" className="bg-[#151515] text-[#F8FAFC]">Nail Artiste</option>
                    <option value="Salon Receptionist" className="bg-[#151515] text-[#F8FAFC]">Salon Receptionist</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#FACC15] focus:outline-none focus:border-[#FACC15] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono font-medium"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Specialties (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Keratin, Balayage, Scalp Treatment"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Receptionist Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#F8FAFC] text-base">Invite Front Desk Receptionist</h3>
                  <p className="text-[11px] text-[#A1A1AA] font-mono">Binds staff strictly to {salon?.name || "your salon"}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setGeneratedLink(null);
                }}
                className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedLink ? (
              <form onSubmit={handleGenerateInvite} className="mt-4 space-y-4 text-xs">
                <div className="p-3 bg-[#151515] border border-[#27272A] rounded-xl text-[#A1A1AA] text-[11px] leading-relaxed">
                  Generate a single-use registration link. Upon opening, the receptionist will set their secure password and immediately gain front desk access locked exclusively to <strong className="text-[#FACC15]">{salon?.name}</strong>.
                </div>

                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Receptionist Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="receptionist@your-salon.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isInviting ? "Generating Link..." : "Create 1-Click Invite"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Invitation ready for <strong className="font-mono text-white">{inviteEmail}</strong></span>
                </div>

                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Single-Use Enrollment URL (Valid 48 Hours)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#FACC15] font-mono text-xs select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Hi! You have been invited to join ${salon?.name || "our salon"} as Front Desk Receptionist on BillCare. Please click this link to set your password and activate your account: ${generatedLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="py-2.5 bg-[#181818] hover:bg-[#222] border border-[#27272A] text-emerald-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Send on WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedLink(null);
                      setInviteEmail("");
                    }}
                    className="py-2.5 bg-[#181818] hover:bg-[#222] border border-[#27272A] text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" /> Invite Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
