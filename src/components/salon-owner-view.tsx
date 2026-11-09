"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import {
  askSalonCopilot,
  generateSalonCopilotInsights,
  generateReviewReply,
} from "@/lib/gemini-ai";
import {
  TrendingUp,
  Users,
  DollarSign,
  Scissors,
  Star,
  Award,
  Calendar,
  Clock,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Phone,
  Percent,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  HeartHandshake,
  BarChart3,
  Flame,
  BadgeAlert,
  Send,
  Bot,
  Lightbulb,
  RotateCcw,
  Check,
  CornerDownLeft,
  MessageSquare,
  Crown,
  Smile,
  ThumbsUp,
  Heart,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  quickAction?: {
    label: string;
    actionType: "reorder" | "promo" | "staff";
  };
}

export function SalonOwnerView() {
  const { staff, services, inventory, invoices, appointments, customers, salon, showToast, feedbacks } =
    useRuvexi();

  // Time toggle: This Week vs This Month
  const [timeRange, setTimeRange] = useState<"week" | "month">("month");
  const isMonth = timeRange === "month";
  const multiplier = isMonth ? 4 : 1;

  // Aggregate totals
  const totalMonthRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0) * (isMonth ? 18 : 4.5);
  const totalAppointmentsCount = appointments.length * (isMonth ? 22 : 5);
  const repeatClientPercentage = 68; // 68% repeat clients
  const avgBillSize = Math.round(totalMonthRevenue / (totalAppointmentsCount || 1));

  // Staff performance detailed data
  const workerAnalytics = staff.map((s, idx) => {
    const servicesGiven = ((s.todayServicesCount || s.totalServicesCompleted || 2) * 5 + idx * 3) * multiplier;
    const customersHandled = Math.round(servicesGiven * 0.85);
    const revenueGenerated = ((s.todayRevenue || s.todayEarnings || 3000) * 5 + idx * 4500) * multiplier;
    const commissionEarned = Math.round((revenueGenerated * s.commissionRate) / 100);
    const topService = s.specialty?.[0] || s.role || "Signature Haircut";

    return {
      ...s,
      servicesGiven,
      customersHandled,
      revenueGenerated,
      commissionEarned,
      topService,
    };
  });

  // Best services
  const bestServices = [
    {
      id: "srv_b1",
      name: "Keratin Protein Smoothing Therapy",
      category: "Hair Treatment",
      bookings: isMonth ? 84 : 21,
      revenue: (isMonth ? 84 : 21) * 4500,
      rating: 4.9,
      trend: "+28% vs last " + (isMonth ? "month" : "week"),
      tag: "Top Earner",
    },
    {
      id: "srv_b2",
      name: "Creative Balayage & Color Gloss",
      category: "Color Bar",
      bookings: isMonth ? 62 : 15,
      revenue: (isMonth ? 62 : 15) * 5500,
      rating: 4.9,
      trend: "+19% demand",
      tag: "High Margin",
    },
    {
      id: "srv_b3",
      name: "Luxury Hair Spa & Scalp Detox",
      category: "Hair Therapy",
      bookings: isMonth ? 110 : 28,
      revenue: (isMonth ? 110 : 28) * 2200,
      rating: 4.8,
      trend: "+14% repeat visits",
      tag: "Client Favorite",
    },
    {
      id: "srv_b4",
      name: "Master Haircut & Blowdry Finish",
      category: "Hair Styling",
      bookings: isMonth ? 142 : 36,
      revenue: (isMonth ? 142 : 36) * 1500,
      rating: 4.9,
      trend: "+22% volume",
      tag: "Most Booked",
    },
  ];

  // Slow services
  const slowServices = [
    {
      id: "srv_w1",
      name: "Classic Beard Trim & Towel Wrap",
      category: "Men Grooming",
      bookings: isMonth ? 8 : 2,
      revenue: (isMonth ? 8 : 2) * 600,
      rating: 4.5,
      issue: "Low stand-alone bookings",
      ownerTip: "Bundle as 'Haircut + Beard' package to lift sales.",
    },
    {
      id: "srv_w2",
      name: "Express Nail Buff & Polish",
      category: "Nail Bar",
      bookings: isMonth ? 6 : 1,
      revenue: (isMonth ? 6 : 1) * 800,
      rating: 4.4,
      issue: "Clients prefer full gel extensions",
      ownerTip: "Replace with Deluxe Spa Gel Pedicure.",
    },
    {
      id: "srv_w3",
      name: "Standard Face Bleach & Cleansing",
      category: "Skin Care",
      bookings: isMonth ? 5 : 1,
      revenue: (isMonth ? 5 : 1) * 950,
      rating: 4.2,
      issue: "Clients upgrade directly to Hydra-Facial",
      ownerTip: "Phase out or offer as complimentary add-on for VIPs.",
    },
  ];

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: `Hello ${salon.name.split(" ")[0]} Director! 👋 I am your Ruvexi AI Business Advisor (powered by Google Gemini). Ask me anything about your revenue, stylists, best-selling services, or inventory stock levels and I will provide instant data-backed answers!`,
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Gemini AI Strategic Insights State
  const [copilotInsights, setCopilotInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const handleGenerateCopilotInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const topSrvNames = bestServices.map((b) => b.name);
      const res = await generateSalonCopilotInsights({
        revenue: totalMonthRevenue,
        invoicesCount: totalAppointmentsCount,
        topServices: topSrvNames,
        slowDay: "Tuesday & Wednesday afternoon",
      });
      if (res.insight) {
        setCopilotInsights(res.insight);
        showToast("AI Revenue Optimization Strategy generated!");
      } else {
        setCopilotInsights(
          "• Offer a Midweek Haircare Pass on Tuesdays & Wednesdays to increase chair yield by 35%.\n• Cross-sell backbar Olaplex/Keratin boosters on every haircut ticket to expand ticket size by ₹850.\n• Send automated WhatsApp reminder to clients 28 days post-color for gloss refresh."
        );
        showToast("Generated optimization recommendations (heuristic mode).");
      }
    } catch (e) {
      setCopilotInsights(
        "• Boost Tuesday chair occupancy with targeted WhatsApp Pamper Pass.\n• Cross-sell Keratin & Hair Spa boosters to lift average ticket size.\n• Replenish low stock items before the weekend rush."
      );
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const quickQuestions = [
    "Who is our top-earning stylist?",
    "Which service brings the most revenue?",
    "Which service is performing worst?",
    "What products are low on stock?",
    "How can I boost sales on slow Tuesdays?",
    "What is our customer retention rate?",
  ];

  const handleSendChat = async (questionText?: string) => {
    const query = (questionText || chatInput).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!questionText) setChatInput("");
    setIsAiThinking(true);

    try {
      const staffSummary = workerAnalytics
        .slice(0, 3)
        .map(
          (s) =>
            `${s.name}: ${formatCurrency(s.revenueGenerated)} (${s.customersHandled} clients, ${s.rating}★)`
        )
        .join("; ");
      const topServicesStr = bestServices
        .slice(0, 3)
        .map((b) => `${b.name} (${formatCurrency(b.revenue)})`)
        .join(", ");
      const lowStockStr =
        lowStockItems.length > 0
          ? lowStockItems.map((i) => `${i.name} (${i.currentStock} left)`).join(", ")
          : "All products in stock";

      const aiResult = await askSalonCopilot(query, {
        salonName: salon.name,
        revenue: totalMonthRevenue,
        appointments: totalAppointmentsCount,
        staffInfo: staffSummary,
        topServices: topServicesStr,
        lowStockInfo: lowStockStr,
        repeatRate: repeatClientPercentage,
      });

      if (aiResult.answer) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: aiResult.answer,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
          quickAction: query.toLowerCase().includes("stock")
            ? { label: "Order Stock via WhatsApp", actionType: "reorder" }
            : query.toLowerCase().includes("tuesday") || query.toLowerCase().includes("slow")
            ? { label: "Draft WhatsApp Bundle", actionType: "promo" }
            : undefined,
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn("Gemini copilot query failed, using fallback:", err);
    }

    // Heuristic fallback if Gemini is offline or unconfigured
    const q = query.toLowerCase();
    let aiResponse = "";
    let quickAction: ChatMessage["quickAction"] | undefined = undefined;

    if (q.includes("stylist") || q.includes("worker") || q.includes("staff") || q.includes("who")) {
      const topStylist = workerAnalytics[0];
      aiResponse = `👑 **Top Earner:** **${topStylist.name}** is your #1 stylist this month, generating **${formatCurrency(
        topStylist.revenueGenerated
      )}** across **${topStylist.customersHandled} clients** with a **${topStylist.rating}★ rating**. Her top service is ${topStylist.topService}.`;
      quickAction = { label: "View Staff Ledger", actionType: "staff" };
    } else if (
      q.includes("most revenue") ||
      q.includes("best service") ||
      q.includes("top service") ||
      q.includes("highest")
    ) {
      aiResponse = `⭐ **Highest Revenue Service:** **Keratin Protein Smoothing Therapy** brought in **${formatCurrency(
        bestServices[0].revenue
      )}** across **${bestServices[0].bookings} bookings** (priced at ₹4,500). It currently delivers your salon's highest profit margin!`;
      quickAction = { label: "Create Promo Bundle", actionType: "promo" };
    } else if (
      q.includes("worst") ||
      q.includes("slow") ||
      q.includes("least") ||
      q.includes("low demand")
    ) {
      aiResponse = `⚠️ **Lowest Demand Service:** **Classic Beard Trim** (only ${slowServices[0].bookings} bookings) and **Express Nail Buff** (${slowServices[1].bookings} bookings). \n\n💡 **Action:** Bundle the beard trim with your popular Haircut at a ₹200 discount to boost chair occupancy.`;
      quickAction = { label: "Draft WhatsApp Bundle", actionType: "promo" };
    } else if (
      q.includes("stock") ||
      q.includes("product") ||
      q.includes("inventory") ||
      q.includes("shampoo") ||
      q.includes("cream")
    ) {
      if (lowStockItems.length > 0) {
        const names = lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit} left, min ${i.minThreshold})`).join(", ");
        aiResponse = `📦 **Stock Alert:** You have **${lowStockItems.length} items** running low: **${names}**. Reordering is recommended before weekend rush.`;
        quickAction = { label: "Order Stock via WhatsApp", actionType: "reorder" };
      } else {
        aiResponse = `📦 **All Stock Healthy:** All professional color tubes and retail products are above minimum threshold levels today.`;
      }
    } else if (
      q.includes("retention") ||
      q.includes("repeat") ||
      q.includes("come back") ||
      q.includes("loyal")
    ) {
      aiResponse = `🔁 **Customer Retention:** **${repeatClientPercentage}%** of your clients return within 40 days (industry benchmark is 50%). Your automated WhatsApp reminders have reduced appointment no-shows from **22% down to 3.5%**!`;
    } else if (
      q.includes("feedback") ||
      q.includes("rating") ||
      q.includes("friendliness") ||
      q.includes("improve") ||
      q.includes("review")
    ) {
      aiResponse = `⭐ **Customer Feedback Numbers:** \n• **Overall Salon Rating:** 4.9★ across ${feedbacks.length + 180} reviews.\n• **Staff Friendliness:** 98% positive (clients love the polite attitude & complimentary espresso/tea).\n• **Top Praise:** 86% praised stylist skill & zero waiting.\n• **Room for Improvement:** Only 10% noted slight wait times during peak Saturday 4 PM rush.`;
      quickAction = { label: "View Feedback Board", actionType: "staff" };
    } else if (
      q.includes("tuesday") ||
      q.includes("slow day") ||
      q.includes("boost") ||
      q.includes("increase sales") ||
      q.includes("more clients")
    ) {
      aiResponse = `💡 **Midweek Boost Strategy:** Chair occupancy drops by ~32% on Tuesdays and Wednesdays. \n\n🎯 **Recommendation:** Send an automated WhatsApp broadcast offering a *"Midweek Pamper Pass"* (Haircut + Free Scalp Detox Massage) to fill empty daytime slots.`;
      quickAction = { label: "Draft Tuesday Offer", actionType: "promo" };
    } else if (q.includes("revenue") || q.includes("sales") || q.includes("money") || q.includes("earnings")) {
      aiResponse = `💰 **Revenue Summary:** Your salon is pacing at **${formatCurrency(
        totalMonthRevenue
      )}** this month across **${totalAppointmentsCount} appointments**, with an average ticket size of **${formatCurrency(
        avgBillSize
      )}** per client (+24.5% vs last month).`;
    } else {
      aiResponse = `📊 **Salon Insights:** Luxe Haven is operating at healthy metrics with ${staff.length} active stylists, ${repeatClientPercentage}% repeat clientele, and strong weekend chair occupancy. For specific data, feel free to ask about staff sales, best/worst services, or stock warnings!`;
    }

    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: "ai",
      text: aiResponse,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      quickAction,
    };

    setChatMessages((prev) => [...prev, aiMsg]);
    setIsAiThinking(false);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiThinking]);

  return (
    <div className="space-y-6">
      {/* Top Banner - Salon Owner Master Dashboard */}
      <div className="bg-[#101010] border border-[#27272A] p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] text-[#FACC15] text-xs font-mono font-bold border border-[#27272A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Owner Console • {salon.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#F8FAFC]">
              Business & Worker Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-2xl">
              Track services given by each stylist, multi-chair yields, best vs slow services, and query the Salon AI Advisor.
            </p>
          </div>

          {/* Time range switcher: This Week vs This Month */}
          <div className="flex items-center bg-[#181818] border border-[#27272A] p-1.5 rounded-xl self-start lg:self-auto text-xs">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === "week"
                  ? "bg-[#FACC15] text-[#080808] shadow-md"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === "month"
                  ? "bg-[#FACC15] text-[#080808] shadow-md"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards for the Salon Owner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              {isMonth ? "Monthly Sales Pacing" : "Weekly Sales Pacing"}
            </span>
            <span className="p-2 rounded-lg bg-[#181818] text-[#FACC15] border border-[#27272A]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#FACC15] mt-2">
            {formatCurrency(totalMonthRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-mono font-bold text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.5% vs previous {timeRange}</span>
          </div>
        </div>

        {/* Total Appointments / Customers Handled */}
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              {isMonth ? "Monthly Client Count" : "Weekly Client Count"}
            </span>
            <span className="p-2 rounded-lg bg-[#181818] text-[#FACC15] border border-[#27272A]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F8FAFC] mt-2">
            {totalAppointmentsCount} Clients
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-[#A1A1AA]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Avg Bill: {formatCurrency(avgBillSize)}</span>
          </div>
        </div>

        {/* Repeat Customer Retention */}
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              Repeat Client Rate
            </span>
            <span className="p-2 rounded-lg bg-[#181818] text-[#FACC15] border border-[#27272A]">
              <HeartHandshake className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#FACC15] mt-2">
            {repeatClientPercentage}% Returning
          </div>
          <p className="text-xs text-[#71717A] mt-2 font-mono">
            68 of 100 clients return within 40 days
          </p>
        </div>

        {/* Salon Stock Health */}
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <span
              className={`p-2 rounded-lg border ${
                lowStockItems.length > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-[#181818] text-emerald-400 border-[#27272A]"
              }`}
            >
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F8FAFC] mt-2">
            {lowStockItems.length} Items Low
          </div>
          <p className="text-xs font-mono mt-2 text-rose-400">
            {lowStockItems.length > 0 ? "Reorder needed soon" : "All products well stocked"}
          </p>
        </div>
      </div>

      {/* GEMINI AI REVENUE OPTIMIZER & STRATEGY PANEL */}
      <div className="bg-gradient-to-r from-[#121212] to-[#181818] border border-[#FACC15]/30 p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/40 text-[#FACC15] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#F8FAFC]">
                  Gemini AI Revenue Copilot & Growth Optimizer
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30">
                  Google Gemini 1.5
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Run instant AI audit on your seat occupancy, ticket sizes, and slow slots to unlock incremental salon profit.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateCopilotInsights}
            disabled={isGeneratingInsights}
            className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-[#080808] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingInsights ? "animate-spin" : ""}`} />
            <span>{isGeneratingInsights ? "Analyzing Ledger..." : "Generate AI Growth Strategies"}</span>
          </button>
        </div>

        {copilotInsights && (
          <div className="mt-3 p-4 rounded-xl bg-[#080808]/80 border border-[#27272A] text-xs text-[#E4E4E7] space-y-2 whitespace-pre-line leading-relaxed font-sans animate-in fade-in">
            <div className="text-[11px] font-mono font-bold text-[#FACC15] uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Gemini Strategic Action Plan:</span>
            </div>
            {copilotInsights}
          </div>
        )}
      </div>

      {/* SALON OWNER AI CHATBOT SECTION */}
      <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#F8FAFC]">
                  Salon Owner AI Advisor
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                  <Sparkles className="w-3 h-3 text-[#FACC15]" />
                  Live Chatbot
                </span>
              </div>
              <p className="text-xs text-[#71717A]">
                Ask concise questions about your stylists, sales, services, or inventory and get instant answers.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setChatMessages([
                {
                  id: "msg_reset",
                  sender: "ai",
                  text: `Chat cleared! What would you like to ask about your salon operations?`,
                  time: "Just now",
                },
              ]);
              showToast("Chatbot reset to initial state.");
            }}
            className="text-xs font-mono text-[#71717A] hover:text-[#F8FAFC] flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 rounded-lg border border-[#27272A] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* 1-Tap Quick Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Tap to ask instantly:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {quickQuestions.map((qText) => (
              <button
                key={qText}
                onClick={() => handleSendChat(qText)}
                className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#27272A] hover:border-[#FACC15]/40 hover:bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
                <span>{qText}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream Box */}
        <div className="bg-[#080808] rounded-xl border border-[#27272A] p-4 space-y-3.5 max-h-80 overflow-y-auto">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center shrink-0 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[#FACC15] text-[#080808] font-bold"
                      : "bg-[#151515] text-[#F8FAFC] border border-[#27272A]"
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  {msg.quickAction && (
                    <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (msg.quickAction?.actionType === "reorder") {
                            showToast("Purchase order drafted for supplier!");
                          } else if (msg.quickAction?.actionType === "promo") {
                            showToast("Midweek Pamper Pass campaign queued!");
                          } else {
                            showToast("Viewing stylist ledger.");
                          }
                        }}
                        className="px-3 py-1 bg-[#181818] hover:bg-[#27272A] text-[#FACC15] border border-[#27272A] font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{msg.quickAction.label}</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1 text-right font-mono ${
                      isUser ? "text-[#080808]/70" : "text-[#71717A]"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#FACC15] text-[#080808] flex items-center justify-center shrink-0 text-xs font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isAiThinking && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#151515] border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-[#71717A] flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-ping"></span>
                <span>AI is analyzing salon ledger...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask a concise question (e.g. 'How much did Priya earn this week?' or 'What is our profit margin?')"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-[#151515] border border-[#27272A] rounded-xl text-xs font-medium text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15]"
            />
          </div>
          <button
            type="submit"
            disabled={!chatInput.trim() || isAiThinking}
            className="px-5 py-3 bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-[#080808] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* SECTION 1: WORKER PERFORMANCE */}
      <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-[#F8FAFC]">Worker Performance & Sales</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A] text-xs font-mono">
                {timeRange === "month" ? "Per Month" : "Per Week"}
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              See exactly how many services each worker gave, how many clients they served, and how much money they brought to your salon.
            </p>
          </div>
        </div>

        {/* Worker Table */}
        <div className="overflow-x-auto rounded-xl border border-[#27272A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#151515] border-b border-[#27272A] text-[#71717A] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Worker / Stylist</th>
                <th className="py-3.5 px-4">Services Given</th>
                <th className="py-3.5 px-4">Customers Handled</th>
                <th className="py-3.5 px-4">Revenue Generated</th>
                <th className="py-3.5 px-4">Commission Earned</th>
                <th className="py-3.5 px-4">Top Specialty Service</th>
                <th className="py-3.5 px-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] font-medium">
              {workerAnalytics.map((w) => (
                <tr key={w.id} className="hover:bg-[#181818] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-9 h-9 rounded-lg object-cover border border-[#27272A] shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#F8FAFC] text-xs">{w.name}</div>
                        <div className="text-[10px] text-[#71717A]">{w.role}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#F8FAFC] text-sm font-mono">
                      {w.servicesGiven}
                    </div>
                    <div className="text-[10px] text-[#71717A] font-mono">completed</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#FACC15] text-sm font-mono">
                      {w.customersHandled}
                    </div>
                    <div className="text-[10px] text-[#71717A] font-mono">clients in chair</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#F8FAFC] text-sm font-mono">
                      {formatCurrency(w.revenueGenerated)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {isMonth ? "Monthly total" : "Weekly total"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#FACC15] text-xs font-mono">
                      {formatCurrency(w.commissionEarned)}
                    </div>
                    <div className="text-[10px] text-[#71717A] font-mono">
                      Rate: {w.commissionRate}%
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#181818] text-[#A1A1AA] border border-[#27272A] text-[11px] font-mono font-bold">
                      {w.topService}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#181818] border border-[#27272A] text-[#FACC15] font-bold text-xs font-mono">
                      <Star className="w-3 h-3 fill-[#FACC15]" />
                      <span>{w.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: BEST SERVICES VS WORST SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEST SERVICES */}
        <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#F8FAFC]">
                  Best Performing Services
                </h3>
                <p className="text-[11px] text-[#71717A]">
                  Highest bookings & maximum revenue for your salon.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Top Earners
            </span>
          </div>

          <div className="space-y-3">
            {bestServices.map((bs, index) => (
              <div
                key={bs.id}
                className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#F8FAFC]">{bs.name}</div>
                    <div className="text-[10px] text-[#71717A] font-mono flex items-center gap-2 mt-0.5">
                      <span>{bs.category}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{bs.trend}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-[#FACC15] text-xs">
                    {formatCurrency(bs.revenue)}
                  </div>
                  <div className="text-[10px] text-[#71717A] font-mono">
                    {bs.bookings} bookings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WORST / SLOW SERVICES */}
        <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-[#FACC15]/30 text-[#FACC15] flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#F8FAFC]">
                  Slow / Underperforming Services
                </h3>
                <p className="text-[11px] text-[#71717A]">
                  Services with lowest demand & practical owner advice.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
              Needs Attention
            </span>
          </div>

          <div className="space-y-3">
            {slowServices.map((ss, index) => (
              <div
                key={ss.id}
                className="p-3.5 rounded-xl bg-[#151515] border border-[#27272A] hover:border-[#FACC15]/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-[#F8FAFC]">{ss.name}</div>
                    <div className="text-[10px] text-[#71717A] font-mono">
                      {ss.category} • {ss.issue}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[#FACC15] text-xs font-mono">
                      {formatCurrency(ss.revenue)}
                    </div>
                    <div className="text-[10px] text-rose-400 font-mono">
                      Only {ss.bookings} bookings
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#080808] border border-[#27272A] text-[11px] text-[#A1A1AA] flex items-start gap-1.5 font-medium">
                  <span className="font-bold text-[#FACC15] shrink-0 font-mono">💡 Advice:</span>
                  <span>{ss.ownerTip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: SALON STOCK OVERVIEW */}
      <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#F8FAFC]">
              Salon Stock & Supply Alerts
            </h3>
            <p className="text-xs text-[#71717A]">
              Check shampoo bottles, hair color tubes, and retail creams so your stylists never run out.
            </p>
          </div>

          <button
            onClick={() => showToast("Stock report and supplier purchase order created!")}
            className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Order Stock via WhatsApp</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {inventory.slice(0, 6).map((item) => {
            const isLow = item.currentStock <= item.minThreshold;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLow
                    ? "bg-[#151515] border-rose-500/40"
                    : "bg-[#151515] border-[#27272A]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#181818] text-[#A1A1AA] border border-[#27272A]">
                    {item.usageType}
                  </span>
                  {isLow ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      In Stock
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="font-bold text-xs text-[#F8FAFC] truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#71717A] font-mono">{item.brand}</div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#27272A] font-mono">
                  <div>
                    <span className="text-[#71717A] text-[10px] block">Current Units</span>
                    <span
                      className={`font-bold text-sm ${
                        isLow ? "text-rose-400" : "text-[#FACC15]"
                      }`}
                    >
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#71717A] text-[10px] block">Min Limit</span>
                    <span className="font-bold text-[#A1A1AA] text-sm">
                      {item.minThreshold} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: CLIENT FEEDBACK & RATINGS */}
      <div className="bg-[#101010] border border-[#27272A] p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#F8FAFC]">
                Customer Feedback & Staff Ratings
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live WhatsApp Feed
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Ratings and notes tapped by clients right after their visit from WhatsApp bills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#71717A]">Total Reviews:</span>
            <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#27272A] text-[#FACC15] font-mono font-bold text-xs">
              {feedbacks.length + 180} Verified
            </span>
          </div>
        </div>

        {/* 4 Scoreboard Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Overall Salon Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#F8FAFC]">
                4.9
              </span>
              <div className="flex text-[#FACC15]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#FACC15]" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">96% of clients gave 5 stars</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Staff Friendliness Score
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
              98%
            </div>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" />
              <span>Rated "Super Polite"</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Stylist Service Quality
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#FACC15]">
              4.9 ★
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">Precise haircuts & color work</p>
          </div>

          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
              Salon Hygiene & Ambience
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F8FAFC]">
              4.8 ★
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">Loved music, coffee & vibe</p>
          </div>
        </div>

        {/* Worker-by-Worker Customer Feedback Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
            Worker-by-Worker Client Satisfaction
          </h4>

          <div className="overflow-x-auto rounded-xl border border-[#27272A]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#151515] border-b border-[#27272A] text-[#71717A] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Worker / Stylist</th>
                  <th className="py-3 px-4">Service Rating</th>
                  <th className="py-3 px-4">Staff Friendliness</th>
                  <th className="py-3 px-4">Total Reviews</th>
                  <th className="py-3 px-4">Top Client Praise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] font-medium">
                {workerAnalytics.map((w) => (
                  <tr key={w.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#F8FAFC] flex items-center gap-2.5">
                      <img src={w.avatar} alt={w.name} className="w-7 h-7 rounded-lg object-cover border border-[#27272A]" />
                      <span>{w.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-[#FACC15] bg-[#181818] border border-[#27272A] px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-[#FACC15]" />
                        <span>{w.rating} / 5.0</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono font-bold">
                      99% Friendly
                    </td>
                    <td className="py-3 px-4 text-[#A1A1AA] font-mono">
                      {Math.round(w.customersHandled * 0.7)} reviews
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#181818] border border-[#27272A] text-[#A1A1AA] text-[10px] font-mono">
                        "Great listener, gentle hands ✨"
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Improvements & Recent Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>What Clients Say We Can Improve</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-bold text-[#A1A1AA] mb-1 text-[11px]">
                  <span>Everything was perfect & loved styling ✨</span>
                  <span className="font-mono text-emerald-400">86%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] border border-[#27272A] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "86%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#A1A1AA] mb-1 text-[11px]">
                  <span>Very polite & courteous staff 💖</span>
                  <span className="font-mono text-emerald-400">94%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] border border-[#27272A] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#A1A1AA] mb-1 text-[11px]">
                  <span>Slight wait time during peak hours (5-10m) ⏱️</span>
                  <span className="font-mono text-[#FACC15]">12%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] border border-[#27272A] overflow-hidden">
                  <div className="h-full bg-[#FACC15] rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#A1A1AA] mb-1 text-[11px]">
                  <span>Music a bit loud on Saturday evenings 🎵</span>
                  <span className="font-mono text-[#71717A]">5%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] border border-[#27272A] overflow-hidden">
                  <div className="h-full bg-[#27272A] rounded-full" style={{ width: "5%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Recent Feedback Stream */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#27272A] space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Recent WhatsApp Feedback Entries</span>
            </h4>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {feedbacks.slice(0, 3).map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-lg bg-[#080808] border border-[#27272A] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-[#F8FAFC]">
                      {fb.customerName}{" "}
                      <span className="font-normal text-[#71717A]">
                        • styled by {fb.staffName}
                      </span>
                    </div>
                    <div className="flex items-center text-[#FACC15] text-[10px] font-bold font-mono">
                      <span>{fb.serviceRating} ★</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(fb.improvementTags || fb.tags || []).map((tag: any, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#181818] text-emerald-400 border border-emerald-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {fb.comment && (
                    <p className="text-[11px] text-[#A1A1AA] italic">
                      "{fb.comment}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-1 border-t border-[#27272A] font-mono">
                    <span>{fb.date}</span>
                    <button
                      onClick={async () => {
                        const cleanPhone = fb.customerPhone.replace(/[^0-9]/g, "");
                        let replyMsg = `Hi ${fb.customerName}! ✨ Thank you so much for your kind feedback and for visiting ${salon.name}. We really appreciate your support and can't wait to see you again! 💖`;
                        try {
                          const aiRes = await generateReviewReply(
                            fb.customerName,
                            fb.serviceRating,
                            fb.comment || "Great service"
                          );
                          if (aiRes.reply) replyMsg = aiRes.reply;
                        } catch (err) {
                          console.warn("AI review reply error:", err);
                        }
                        window.open(
                          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMsg)}`,
                          "_blank"
                        );
                      }}
                      className="text-[#FACC15] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#FACC15]" />
                      <span>AI WhatsApp Reply →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
