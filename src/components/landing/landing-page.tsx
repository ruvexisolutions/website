"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Receipt,
  Users,
  MessageSquare,
  Boxes,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Clock,
  Check,
  Scissors,
  Globe,
  DollarSign,
  Send,
  HelpCircle,
  QrCode,
  CreditCard,
  MapPin,
  Quote,
  Menu,
  X,
  Star,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { BillCareLogo } from "@/components/brand/billcare-logo";

type StudioType = "hair" | "spa" | "barber" | "nail";

interface StudioProfile {
  id: StudioType;
  index: string;
  label: string;
  salonName: string;
  location: string;
  activeService: string;
  stylist: string;
  duration: string;
  amount: number;
  retailItem: string;
  retailAmount: number;
  image: string;
  chairs: number;
  curation: string;
}

const STUDIO_PROFILES: Record<StudioType, StudioProfile> = {
  hair: {
    id: "hair",
    index: "01",
    label: "Hair Atelier",
    salonName: "Maison Luxe Hair Atelier",
    location: "Indiranagar, Bengaluru",
    activeService: "Signature Balayage & Olaplex Gloss",
    stylist: "Priya Sharma · Creative Director",
    duration: "90 min",
    amount: 6500,
    retailItem: "Moroccanoil Treatment (100ml)",
    retailAmount: 3400,
    image: "/images/hero-showcase.jpg",
    chairs: 8,
    curation: "Precision foil placement & multi-stage glossing",
  },
  spa: {
    id: "spa",
    index: "02",
    label: "Day Spa & Wellness",
    salonName: "Aura Holistic Ayurveda & Spa",
    location: "Juhu Tara Road, Mumbai",
    activeService: "Deep Tissue & Herbal Potli Ritual",
    stylist: "Sunita Verma · Master Therapist",
    duration: "75 min",
    amount: 4800,
    retailItem: "Forest Essentials Botanical Mist (200ml)",
    retailAmount: 2200,
    image: "/images/spa-wellness.jpg",
    chairs: 6,
    curation: "Synchronized private suites with aroma cadence",
  },
  barber: {
    id: "barber",
    index: "03",
    label: "Barber Club",
    salonName: "The Blade & Comb Grooming Club",
    location: "Bandra West, Mumbai",
    activeService: "Royal Hot Towel Shave & Skin Fade",
    stylist: "Vikram Mehta · Lead Barber",
    duration: "45 min",
    amount: 1800,
    retailItem: "Matte Clay Pomade & Beard Elixir",
    retailAmount: 1600,
    image: "/images/checkout-pos.jpg",
    chairs: 10,
    curation: "Traditional straight-edge craft & club memberships",
  },
  nail: {
    id: "nail",
    index: "04",
    label: "Nail Lounge",
    salonName: "Luxe Sculpted Nails & Lashes",
    location: "South Extension, New Delhi",
    activeService: "Sculpted Gel Extensions & Chrome Art",
    stylist: "Rohit Malhotra · Master Artist",
    duration: "60 min",
    amount: 2800,
    retailItem: "Botanical Cuticle Recovery Serum",
    retailAmount: 1200,
    image: "/images/stylist-consultation.jpg",
    chairs: 6,
    curation: "Custom hand-painted chrome & Russian manicure",
  },
};

export function LandingPage() {
  const { salon, showToast } = useBillCare();

  // Active Interactive Studio Selector
  const [activeStudio, setActiveStudio] = useState<StudioType>("hair");
  const studio = STUDIO_PROFILES[activeStudio];

  // Interactive Sandbox Tab State
  const [activePreviewTab, setActivePreviewTab] = useState<"pos" | "calendar" | "whatsapp" | "formula">("pos");

  // POS Sandbox State
  const [posDiscount, setPosDiscount] = useState<number>(10);
  const [posPaymentMethod, setPosPaymentMethod] = useState<"UPI" | "Card" | "Cash">("UPI");
  const [posReceiptShown, setPosReceiptShown] = useState<boolean>(false);

  // WhatsApp Sandbox State
  const [waSent, setWaSent] = useState<boolean>(false);

  // ROI Calculator State
  const [chairsCount, setChairsCount] = useState<number>(8);
  const [avgTicket, setAvgTicket] = useState<number>(2200);
  const [clientsPerChairDay, setClientsPerChairDay] = useState<number>(5);

  // Pricing Interval
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Feature Comparison Table collapse state
  const [showFeatureTable, setShowFeatureTable] = useState(true);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI Calculations
  const dailyTurnover = chairsCount * avgTicket * clientsPerChairDay;
  const monthlyTurnover = dailyTurnover * 26;
  const recoveredViaWhatsApp = Math.round(monthlyTurnover * 0.22);
  const hoursSavedPerMonth = chairsCount * 7;

  const handleSendWhatsAppTest = () => {
    setWaSent(true);
    showToast("Dispatched simulated VIP WhatsApp booking reminder to client Ananya");
    setTimeout(() => setWaSent(false), 5000);
  };

  const faqs = [
    {
      q: "How does BillCare differ from aggregators like Fresha or Zenoti?",
      a: "Marketplace aggregators take up to 20% cut per client booking and display rival salons right next to your brand. BillCare is a sovereign operating system: 0% transaction fees, 100% private client database, and your own custom branded booking portal.",
    },
    {
      q: "Can receptionists handle checkout without seeing owner profits or tax filings?",
      a: "Yes. Granular role-based security allows receptionists and stylists to manage daily calendars, seat walk-ins, and ring up sales while strictly restricting gross margins, staff payouts, and tax ledgers to salon owners.",
    },
    {
      q: "Does BillCare connect with thermal receipt printers and barcode scanners?",
      a: "Yes. Works out of the box with standard 80mm & 58mm ESC/POS thermal printers (Epson, TVS, Star Micronics), USB/Bluetooth barcode scanners, and sends automated paperless WhatsApp tax receipts.",
    },
    {
      q: "How does automated WhatsApp retention recover lapsed clients?",
      a: "Integrated directly with the official Meta Cloud API. BillCare monitors client service history and automatically dispatches personalized 28-day color refreshers, birthday VIP passes, and review requests with zero manual staff effort.",
    },
    {
      q: "Can we migrate our existing client formulas, inventory, and phone directory?",
      a: "Yes. Import client history, custom color formulas, and product catalog via CSV or Excel in 1 click. Our white-glove onboarding concierge ensures zero downtime during your switch.",
    },
    {
      q: "What happens if our salon loses WiFi connectivity during rush hours?",
      a: "BillCare is built as an offline-resilient Progressive Web App (PWA). You can continue ringing up cash sales, viewing formulas, and booking chairs uninterrupted. Everything auto-synchronizes the second your connection returns.",
    },
  ];

  return (
    <div className="bg-[#09090b] text-slate-100 font-sans selection:bg-amber-200 selection:text-slate-950 min-h-screen">
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3">
              <BillCareLogo size="md" variant="light" showSubtitle={true} />
            </Link>

            {/* Desktop Navigation Links with Simple Words */}
            <nav className="hidden lg:flex items-center gap-8 text-xs tracking-wider uppercase font-medium text-slate-400">
              <a href="#studio-selector" className="hover:text-white transition-colors">
                Salons
              </a>
              <a href="#sandbox" className="hover:text-white transition-colors">
                Live POS
              </a>
              <a href="#workflows" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#comparison" className="hover:text-white transition-colors">
                Why Us
              </a>
              <a href="#testimonials" className="hover:text-white transition-colors">
                Reviews
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </nav>

            {/* Action Buttons & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs tracking-wider uppercase font-medium text-slate-300 hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-2 sm:px-4 bg-[#FACC15] hover:bg-[#EAB308] text-[#09090b] font-bold text-xs tracking-wider uppercase rounded transition-all shadow-sm"
              >
                Start Trial
              </Link>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#FACC15]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c0c0e] border-b border-white/[0.08] px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-xs uppercase tracking-wider font-medium text-slate-300">
              <a
                href="#studio-selector"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Salons & Spas
              </a>
              <a
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Interactive POS Terminal
              </a>
              <a
                href="#workflows"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Operational Features
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Why BillCare (Zero Commissions)
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Salon Owner Reviews
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors border-b border-white/[0.04]"
              >
                Subscription Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#FACC15] transition-colors"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-white/10 text-white font-medium text-xs uppercase tracking-wider rounded text-center border border-white/15"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#FACC15] text-[#09090b] font-bold text-xs uppercase tracking-wider rounded text-center shadow-md"
              >
                Begin 14-Day Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Full Architectural Salon Background Image - Clearly Visible */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/hero-bg.jpg"
            alt="Luxury salon interior atmosphere"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Balanced dark scrim: salon mirrors and warm lights are clearly visible while text pops */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/20" />
        </div>

        {/* Hero Content with z-10 */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow Label with Simple Words */}
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-amber-300 font-medium">
            All-in-one software for salons and spas
          </div>

          {/* Simple, Powerful Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal text-white tracking-tight leading-[1.05]">
            Run your salon <br />
            with <span className="italic font-light text-amber-200">ease</span>.
          </h1>

          {/* Simple, Clear Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Fast billing, chair booking, automated WhatsApp reminders, and staff commissions. Everything you need to manage daily salon rush — with zero booking fees.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#09090b] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 group shadow-xl shadow-[#FACC15]/20 hover:scale-[1.02] cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <span>Open Salon POS</span>
            </Link>

            <Link
              href="/book"
              className="px-6 py-3.5 text-slate-300 hover:text-white font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              <Globe className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Online Booking Link</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Studio Showcase & Preview Section - On clean dark background */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-20 bg-[#09090b]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Interactive Studio Archetype Switcher */}
          <div id="studio-selector" className="max-w-4xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 mb-4">
              Choose your salon type:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 border-b border-white/[0.08] pb-4">
              {(Object.keys(STUDIO_PROFILES) as StudioType[]).map((key) => {
                const item = STUDIO_PROFILES[key];
                const isSelected = activeStudio === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveStudio(key)}
                    className={`pb-2 text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 -mb-[18px] ${
                      isSelected
                        ? "border-amber-400 text-amber-200 font-medium"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400">{item.index}</span>
                    <span className="uppercase tracking-widest">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Visual Mockup Frame */}
          <div className="pt-6 max-w-5xl mx-auto text-left">
            <div className="rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0c0c0e] shadow-2xl">
              {/* Minimal Top Studio Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] text-xs">
                <div className="flex items-center gap-3">
                  <div className="font-serif italic text-base text-white">{studio.salonName}</div>
                  <span className="text-white/20">/</span>
                  <div className="font-mono text-[11px] text-slate-400">{studio.location}</div>
                </div>
                <div className="font-mono text-[11px] text-slate-400 hidden sm:block">
                  {studio.chairs} Styling Chairs Active
                </div>
              </div>

              {/* Main Showcase Image */}
              <div className="relative aspect-[16/9] sm:aspect-[21/10] bg-slate-900 overflow-hidden">
                <img
                  src={studio.image}
                  alt={studio.salonName}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent pointer-events-none" />

                {/* Minimalist Understated Operational Strip */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Current Service</div>
                    <div className="text-sm font-medium text-white">{studio.activeService}</div>
                    <div className="text-xs text-slate-400">{studio.stylist} · {studio.duration}</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Bill Amount</div>
                      <div className="font-mono text-base font-semibold text-amber-300">{formatCurrency(studio.amount)}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Retail Product</div>
                      <div className="text-xs text-slate-200">{studio.retailItem}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Row in Simple Words */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left border-t border-white/[0.08]">
            <div className="space-y-1">
              <div className="font-serif text-3xl font-normal text-white">0%</div>
              <div className="text-xs text-slate-400 font-light">Zero commission. You keep 100% of your sales.</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-3xl font-normal text-white">5 Sec</div>
              <div className="text-xs text-slate-400 font-light">Fast checkout. Ring up bills in 5 seconds.</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-3xl font-normal text-white">100%</div>
              <div className="text-xs text-slate-400 font-light">Your client list stays private to your salon.</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-3xl font-normal text-white">WhatsApp</div>
              <div className="text-xs text-slate-400 font-light">Digital bills and appointment reminders.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations & Standards */}
      <section className="py-12 border-b border-white/[0.08] bg-[#09090b]">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
            Engineered Standards & Bank-Grade Payment Rails
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="text-slate-300">Meta WhatsApp Cloud API</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-300">UPI Dynamic QR Auto-Sync</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-300">Visa / Mastercard / RuPay</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-300">ESC/POS Thermal Standard</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-300">PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </section>

      {/* Interactive Operational Sandbox */}
      <section id="sandbox" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              01 / Operational Sandbox
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Test core front-desk mechanics
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Interact with real checkout calculations, chair scheduling matrices, and automated retention dispatches.
            </p>
          </div>

          {/* Sandbox Frame */}
          <div className="bg-[#09090b] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden">
            {/* Minimalist Tab Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#0c0c0e] gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActivePreviewTab("pos")}
                  className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all cursor-pointer rounded ${
                    activePreviewTab === "pos"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  01. POS Billing
                </button>

                <button
                  onClick={() => setActivePreviewTab("calendar")}
                  className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all cursor-pointer rounded ${
                    activePreviewTab === "calendar"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  02. Chair Schedule
                </button>

                <button
                  onClick={() => setActivePreviewTab("whatsapp")}
                  className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all cursor-pointer rounded ${
                    activePreviewTab === "whatsapp"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  03. WhatsApp Pass
                </button>

                <button
                  onClick={() => setActivePreviewTab("formula")}
                  className={`px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all cursor-pointer rounded ${
                    activePreviewTab === "formula"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  04. Formula Vault
                </button>
              </div>

              <div>
                <Link
                  href="/dashboard"
                  className="text-xs font-mono tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  <span>Launch Live Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: POS Billing */}
              {activePreviewTab === "pos" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div>
                        <h3 className="font-serif text-lg text-white font-normal">Active Checkout Folio</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Station 01 · Client: Ananya Deshmukh</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        Live Transaction
                      </span>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-lg border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Scissors className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-white">Signature Balayage & Olaplex Gloss</div>
                            <div className="text-[11px] text-slate-400">Stylist: Priya Sharma · 90 min</div>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-amber-300">₹6,500</div>
                      </div>

                      <div className="flex items-center justify-between bg-white/[0.03] p-3.5 rounded-lg border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Boxes className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-white">Moroccanoil Treatment Original (100ml)</div>
                            <div className="text-[11px] text-slate-400">Retail Take-home · Qty: 1</div>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-amber-300">₹3,400</div>
                      </div>
                    </div>

                    {/* Discount Selector */}
                    <div className="bg-white/[0.03] p-3.5 rounded-lg border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>VIP Membership Privilege</span>
                        <span className="font-mono text-amber-300">{posDiscount}% applied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[0, 10, 15, 20].map((d) => (
                          <button
                            key={d}
                            onClick={() => setPosDiscount(d)}
                            className={`flex-1 py-1.5 rounded font-mono text-xs transition-all cursor-pointer ${
                              posDiscount === d
                                ? "bg-white text-slate-950 font-bold"
                                : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                            }`}
                          >
                            {d === 0 ? "None" : `${d}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Tender */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Tender Rail</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["UPI", "Card", "Cash"] as const).map((method) => (
                          <button
                            key={method}
                            onClick={() => setPosPaymentMethod(method)}
                            className={`py-2 px-3 rounded text-xs font-mono transition-all border cursor-pointer ${
                              posPaymentMethod === method
                                ? "border-amber-400/80 bg-amber-400/10 text-amber-200"
                                : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white"
                            }`}
                          >
                            {method === "UPI" && "Dynamic UPI QR"}
                            {method === "Card" && "POS Card Terminal"}
                            {method === "Cash" && "Cash Tender"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Receipt & Total */}
                  <div className="lg:col-span-5 bg-white/[0.02] p-5 rounded-xl border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <span className="text-[11px] font-mono text-slate-400">INVOICE BREAKDOWN</span>
                        <span className="text-[10px] font-mono text-slate-400">GST 18% INCLUSIVE</span>
                      </div>

                      {(() => {
                        const sub = 9900;
                        const disc = Math.round((sub * posDiscount) / 100);
                        const taxable = sub - disc;
                        const gst = Math.round(taxable * 0.18);
                        const total = taxable + gst;

                        return (
                          <div className="py-4 space-y-2 text-xs font-light">
                            <div className="flex justify-between text-slate-400">
                              <span>Service & Retail Gross</span>
                              <span className="font-mono text-slate-200">{formatCurrency(sub)}</span>
                            </div>
                            <div className="flex justify-between text-amber-300">
                              <span>Privilege Reduction ({posDiscount}%)</span>
                              <span className="font-mono">-{formatCurrency(disc)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>GST @ 18%</span>
                              <span className="font-mono text-slate-200">+{formatCurrency(gst)}</span>
                            </div>
                            <div className="h-px bg-white/[0.08] my-2"></div>
                            <div className="flex justify-between items-baseline pt-1">
                              <span className="text-sm font-medium text-white">Net Settled</span>
                              <span className="font-serif text-2xl text-white">
                                {formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          setPosReceiptShown(true);
                          showToast("Payment recorded. Paperless invoice dispatched via WhatsApp.");
                        }}
                        className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-medium text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                      >
                        Complete Settlement ({posPaymentMethod})
                      </button>

                      {posReceiptShown && (
                        <div className="p-2.5 rounded bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Digital tax invoice delivered to client WhatsApp</span>
                        </div>
                      )}
                    </div>

                    {/* Front Desk Snapshot */}
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/10 relative aspect-[16/9]">
                      <img
                        src="/images/checkout-pos.jpg"
                        alt="Front Desk Checkout & WhatsApp E-Receipt"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Calendar Matrix */}
              {activePreviewTab === "calendar" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div>
                      <h3 className="font-serif text-lg text-white font-normal">Station Schedule Matrix</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Concurrency lock prevents duplicate chair allocations</p>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      SCHEDULE: 10:00 - 20:00
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Chair 1 */}
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-200">STATION 01</span>
                        <span className="text-[10px] font-mono text-slate-400">OCCUPIED</span>
                      </div>
                      <div className="text-xs text-slate-400">Priya Sharma · Creative Director</div>

                      <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded space-y-1">
                        <div className="font-mono text-[10px] text-amber-300">11:00 - 12:30</div>
                        <div className="text-xs font-medium text-white">Balayage & Olaplex Gloss</div>
                        <div className="text-[11px] text-slate-400">Ananya D. · ₹6,500</div>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded space-y-1">
                        <div className="font-mono text-[10px] text-slate-400">14:00 - 15:00</div>
                        <div className="text-xs font-medium text-white">K-Gloss Smoothing</div>
                        <div className="text-[11px] text-slate-400">Rhea Sen · ₹4,200</div>
                      </div>
                    </div>

                    {/* Chair 2 */}
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-200">STATION 02</span>
                        <span className="text-[10px] font-mono text-slate-400">COMPLETED</span>
                      </div>
                      <div className="text-xs text-slate-400">Rahul M. · Master Colorist</div>

                      <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded space-y-1">
                        <div className="font-mono text-[10px] text-slate-400">10:30 - 11:45</div>
                        <div className="text-xs font-medium text-white">Root Retouch & Cut</div>
                        <div className="text-[11px] text-slate-400">Kavita S. · ₹3,200</div>
                      </div>

                      <div className="p-3 border border-dashed border-white/20 rounded text-center py-4">
                        <span className="font-mono text-[11px] text-slate-400">Available · 13:15</span>
                      </div>
                    </div>

                    {/* Chair 3 */}
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-200">SUITE 03</span>
                        <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
                      </div>
                      <div className="text-xs text-slate-400">Sunita V. · Master Therapist</div>

                      <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded space-y-1">
                        <div className="font-mono text-[10px] text-slate-400">11:00 - 12:15</div>
                        <div className="text-xs font-medium text-white">Hydra-Infusion Facial</div>
                        <div className="text-[11px] text-slate-400">Meera K. · ₹3,800</div>
                      </div>

                      <div className="p-3 border border-dashed border-white/20 rounded text-center py-4">
                        <span className="font-mono text-[11px] text-slate-400">Available · 13:00</span>
                      </div>
                    </div>

                    {/* Chair 4 */}
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-200">STATION 04</span>
                        <span className="text-[10px] font-mono text-slate-400">OCCUPIED</span>
                      </div>
                      <div className="text-xs text-slate-400">Rohit M. · Nail Artist</div>

                      <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded space-y-1">
                        <div className="font-mono text-[10px] text-amber-300">11:00 - 12:00</div>
                        <div className="text-xs font-medium text-white">Sculpted Extensions</div>
                        <div className="text-[11px] text-slate-400">Divya Sen · ₹2,400</div>
                      </div>

                      <div className="p-3 border border-dashed border-white/20 rounded text-center py-4">
                        <span className="font-mono text-[11px] text-slate-400">Available · 14:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WhatsApp Retention */}
              {activePreviewTab === "whatsapp" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-200">
                  <div className="md:col-span-5 space-y-5">
                    <div className="pb-3 border-b border-white/[0.08]">
                      <h3 className="font-serif text-lg text-white font-normal">Automated Client Retention</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Meta Cloud API · 0 manual intervention</p>
                    </div>

                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/[0.08] space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Trigger Cadence</span>
                        <span className="text-slate-200">28 Days Post-Color</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Client</span>
                        <span className="text-slate-200">Ananya Deshmukh</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Stylist</span>
                        <span className="text-slate-200">Priya Sharma</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Pass Code</span>
                        <span className="text-amber-300">GLOW15 (15% Privileged)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSendWhatsAppTest}
                      className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-medium text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{waSent ? "Dispatched Successfully" : "Trigger Simulated Notification"}</span>
                    </button>
                  </div>

                  {/* Clean WhatsApp Mockup */}
                  <div className="md:col-span-7 bg-[#11141a] p-5 rounded-xl border border-white/[0.08] flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-serif text-sm">
                          {salon.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">{salon.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">Official Business Verification</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Delivered</span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="py-6">
                      <div className="max-w-[85%] bg-slate-900 text-slate-200 p-4 rounded-xl border border-white/[0.08] text-xs space-y-2 leading-relaxed font-light">
                        <p>
                          Good morning Ananya, it has been 4 weeks since your signature Balayage and Olaplex treatment with Priya at {salon.name}.
                        </p>
                        <p className="text-slate-400">
                          To maintain your blonde gloss without brassiness, your root retouch is recommended this week.
                        </p>
                        <div className="p-2.5 bg-black/40 rounded border border-white/10 font-mono text-[11px] text-amber-200 flex items-center justify-between">
                          <span>VIP Pass: GLOW15</span>
                          <span>15% SAVINGS</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="text-amber-300 underline cursor-pointer">
                            Reserve Preferred Station →
                          </span>
                          <span>10:30</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 text-center border-t border-white/[0.08] pt-2">
                      Official Meta Cloud Infrastructure · Zero Spam Architecture
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Formula Vault */}
              {activePreviewTab === "formula" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div>
                      <h3 className="font-serif text-lg text-white font-normal">Technical Formulation History</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Gram-level tint records · Patch-test validity ledger</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      SAFETY RECORD VERIFIED
                    </span>
                  </div>

                  <div className="bg-white/[0.02] p-5 rounded-lg border border-white/[0.08] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-serif text-base text-white">Meera Kapoor</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Client #1042 · 18 Lifetime Visits · Total Spend: ₹48,500</p>
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        Patch Test: Valid (Oct 2026)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="bg-white/[0.03] p-4 rounded border border-white/[0.08] space-y-2">
                        <div className="text-xs font-mono uppercase tracking-wider text-amber-200">Formulation Entry:</div>
                        <div className="font-mono text-xs text-slate-300 bg-black/40 p-3 rounded border border-white/[0.06] leading-relaxed">
                          Schwarzkopf Igora 7-1 (30g) + 8-4 (15g)<br />
                          + 20 Vol Developer (45g)<br />
                          Gloss: Olaplex 4-in-1 (15 min)
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">Logged by Priya Sharma on 18 Sep 2026</div>
                      </div>

                      <div className="bg-white/[0.03] p-4 rounded border border-white/[0.08] space-y-2">
                        <div className="text-xs font-mono uppercase tracking-wider text-amber-200">Technical Notes:</div>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          Scalp sensitivity to high volume bleach. Prefers low-heat blowout with Moroccan Argan oil.
                          Cold brew coffee during extended foils.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-slate-400">
                          Revisit Cycle: Every 28 Days
                        </div>
                      </div>

                      <div className="rounded overflow-hidden border border-white/10 relative min-h-[140px] md:min-h-full">
                        <img
                          src="/images/stylist-consultation.jpg"
                          alt="Stylist table-side consultation"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Stories */}
      <section id="workflows" className="py-24 md:py-36 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#09090b]">
        <div className="max-w-6xl mx-auto space-y-28">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              02 / Workflows
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Built for salon precision
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Eliminate front-desk bottlenecks, protect custom color formulas, and maximize chair utilization.
            </p>
          </div>

          {/* Story 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-slate-900">
                <img
                  src="/images/checkout-pos.jpg"
                  alt="Modern salon front-desk checkout and WhatsApp receipt dispatch"
                  className="w-full h-[380px] object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Front-Desk Velocity
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight leading-snug">
                Five-second checkout. Zero paper friction.
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Eliminate paper slip jams, misplaced tax invoices, and manual billing calculations. Receptionists ring up services, scan retail items, apply tier perks, and accept dynamic UPI QR or split payments in seconds.
              </p>
              <div className="space-y-3 pt-2 text-xs font-light text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">01</span>
                  <span><strong className="text-white font-medium">Dynamic UPI QR & Card Split:</strong> Split tenders across cash, card, and UPI without arithmetic errors.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">02</span>
                  <span><strong className="text-white font-medium">Paperless WhatsApp GST Invoices:</strong> Dispatches official PDF invoices directly to clients' phones, saving thousands in thermal paper rolls.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">03</span>
                  <span><strong className="text-white font-medium">Offline Resilience:</strong> Ring up sales even if broadband drops — folios auto-sync the moment connectivity returns.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Technical Mastery
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight leading-snug">
                Never lose a shade formula, developer volume, or allergy note.
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Retain client loyalty to your salon brand, not individual staff. Every shade recipe, balayage toner ratio, and patch-test countdown is securely stored in your private cloud vault. Stylists review formulas table-side on any tablet.
              </p>
              <div className="space-y-3 pt-2 text-xs font-light text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">01</span>
                  <span><strong className="text-white font-medium">Gram-Level Precision:</strong> Exact tint and developer measurements with stylist timestamps ensure repeatable results.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">02</span>
                  <span><strong className="text-white font-medium">Allergy Patch-Test Expiry:</strong> Automated alerts ensure staff re-test sensitive clients prior to high-volume chemical treatments.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">03</span>
                  <span><strong className="text-white font-medium">Zero Stylist Dependency:</strong> When a stylist is away, colleagues can recreate exact client recipes with complete confidence.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-slate-900">
                <img
                  src="/images/stylist-consultation.jpg"
                  alt="Stylist consulting with client in salon chair"
                  className="w-full h-[380px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-slate-900">
                <img
                  src="/images/spa-wellness.jpg"
                  alt="Luxury day spa treatment suite"
                  className="w-full h-[380px] object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Facility Concurrency
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight leading-snug">
                Every styling station and therapy suite at maximum yield.
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                A multi-station visual diary giving reception complete clarity. Seat walk-in guests effortlessly, assign specialist therapists based on certification, and schedule multi-hour ritual packages without collisions.
              </p>
              <div className="space-y-3 pt-2 text-xs font-light text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">01</span>
                  <span><strong className="text-white font-medium">Concurrency Lock:</strong> Guarantees that two receptionists cannot book the same station or therapist simultaneously.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">02</span>
                  <span><strong className="text-white font-medium">Turnover Signals:</strong> Notifies housekeeping when a treatment suite is vacated and ready for reset.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-slate-400">03</span>
                  <span><strong className="text-white font-medium">Direct Booking:</strong> Your booking portal promotes only your salon — never featuring competitor discounts.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: 6 Core Platform Pillars */}
      <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              03 / Capabilities
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Architected for high-volume studios
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Intuitive interfaces that receptionists and stylists master within their first shift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">01 / TENDER</div>
              <h3 className="font-serif text-xl font-normal text-white">Rapid POS & E-Billing</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Accept cash, UPI, or cards on a unified folio. Apply privilege discounts and deliver digital GST invoices directly via WhatsApp.
              </p>
            </div>

            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">02 / CALENDAR</div>
              <h3 className="font-serif text-xl font-normal text-white">Chair Schedule Matrix</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Clear daily planner displaying station occupancy. Drag-and-drop service adjustments, seat walk-ins, and prevent double bookings.
              </p>
            </div>

            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">03 / RETENTION</div>
              <h3 className="font-serif text-xl font-normal text-white">Meta WhatsApp Cloud</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Automated 24h appointment reminders, birthday passes, and 28-day color refresh prompts that maintain steady repeat visits.
              </p>
            </div>

            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">04 / PERSONNEL</div>
              <h3 className="font-serif text-xl font-normal text-white">Attendance & Commissions</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                One-tap staff clock-in with transparent calculation of service splits, retail incentives, and gratuities for payroll clarity.
              </p>
            </div>

            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">05 / INVENTORY</div>
              <h3 className="font-serif text-xl font-normal text-white">Backbar & Retail Ledger</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Differentiate salon backbar consumption from retail shelf stock. Depletes automatically at checkout with threshold reorder alerts.
              </p>
            </div>

            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="font-mono text-xs text-slate-400">06 / DOMAIN</div>
              <h3 className="font-serif text-xl font-normal text-white">Sovereign Booking Portal</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Custom booking URL under your salon brand. Zero marketplace commissions and zero rival advertisements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Perspectives */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#09090b]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              04 / Case Studies
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Perspectives from studio founders
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Independent salon and clinic directors on transitioning from aggregators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story 1 */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="font-mono text-xs text-amber-300">₹1.85 Lakhs Saved in 6 Months</div>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  "Transitioning from marketplace platforms to BillCare eliminated a 20% take on our repeat clientele. Our guests appreciate receiving branded WhatsApp invoices without needing a third-party app."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/[0.08]">
                <img
                  src="/images/owner-priya.jpg"
                  alt="Priya Nair"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-medium text-white">Priya Nair</div>
                  <div className="text-[11px] text-slate-400">Maison Luxe Hair Atelier · Bengaluru</div>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="font-mono text-xs text-amber-300">42% Reduction in No-Shows</div>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  "Front desk staff mastered the station schedule matrix within an afternoon. Stylist commission calculations went from hours of manual reconciliation to a single report."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/[0.08]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Vikram Mehta"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-medium text-white">Vikram Mehta</div>
                  <div className="text-[11px] text-slate-400">Blade & Comb Club · Mumbai</div>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="font-mono text-xs text-amber-300">Complete Data Sovereignty</div>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  "Our wellness clients require discretion. Aggregator pools share client data with competitor salons. BillCare guarantees isolation, and our patch-test ledger gives practitioners absolute certainty."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/[0.08]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Dr. Shweta Nair"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-medium text-white">Dr. Shweta Nair</div>
                  <div className="text-[11px] text-slate-400">Nirvana Holistic Wellness · New Delhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#09090b]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              06 / Sovereignty
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Sovereign software vs aggregators
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Why leading studios avoid giving away 20% of customer lifetime value.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <table className="w-full text-left text-xs border-collapse font-light">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 font-mono text-[11px]">
                  <th className="py-4 px-5">CAPABILITY</th>
                  <th className="py-4 px-5 text-white bg-white/[0.03]">BILLCARE</th>
                  <th className="py-4 px-5">FRESHA</th>
                  <th className="py-4 px-5">ZENOTI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="py-4 px-5 text-white font-medium">New Client Booking Fee</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono bg-white/[0.03]">0% Free</td>
                  <td className="py-4 px-5 text-slate-400">20% per booking</td>
                  <td className="py-4 px-5 text-slate-400">Custom gateway cuts</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 text-white font-medium">Competitor Ads on Booking Link</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono bg-white/[0.03]">Zero (Private)</td>
                  <td className="py-4 px-5 text-slate-400">Yes (Promotes rivals)</td>
                  <td className="py-4 px-5 text-slate-400">No</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 text-white font-medium">WhatsApp Cloud API Automation</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono bg-white/[0.03]">Included</td>
                  <td className="py-4 px-5 text-slate-400">SMS with surcharge</td>
                  <td className="py-4 px-5 text-slate-400">Paid enterprise add-on</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 text-white font-medium">Gram Formulation & Patch-Test Ledger</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono bg-white/[0.03]">Included</td>
                  <td className="py-4 px-5 text-slate-400">Basic freeform note</td>
                  <td className="py-4 px-5 text-slate-400">Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 text-white font-medium">Customer Database Ownership</td>
                  <td className="py-4 px-5 text-emerald-400 font-mono bg-white/[0.03]">100% Sovereign</td>
                  <td className="py-4 px-5 text-slate-400">Shared marketplace pool</td>
                  <td className="py-4 px-5 text-slate-400">Private enterprise</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials & Social Proof Section */}
      <section id="testimonials" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#0c0c0e]">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>07 / Verified Studio Feedback</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Trusted by 450+ premium salons & spas
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              From flagship hair ateliers in Bandra to multi-station academies in Indiranagar, see how BillCare eliminates checkout bottlenecks and recovers lapsed clients.
            </p>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center">
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FACC15]">450+</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Studios</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">1.2M+</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Visits Billed</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400">₹0</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Commission Taken</div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">99.98%</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">PWA Uptime SLA</div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#111114] space-y-6 flex flex-col justify-between hover:border-[#FACC15]/40 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FACC15]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +30% Chair Velocity
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-light leading-relaxed italic">
                  "We switched 8 stations from Zenoti to BillCare. On busy Saturdays, our reception counter used to be absolute chaos. With BillCare, walk-in check-in and billing takes 15 seconds, and our chair turnover increased by 30%. Zero booking fee saved us lakhs this year alone."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] font-serif font-bold text-sm shrink-0">
                  RM
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Rohan Mehra</div>
                  <div className="text-[11px] text-slate-400 truncate">Founder & Creative Director</div>
                  <div className="text-[10px] font-mono text-[#FACC15] truncate">Atelier 11 Hair Artistry, Bandra Mumbai</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl border border-[#FACC15]/30 bg-[#131317] space-y-6 flex flex-col justify-between hover:border-[#FACC15]/60 transition-all shadow-xl relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FACC15]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    &lt;2% No-Show Rate
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-light leading-relaxed italic">
                  "Automated Meta WhatsApp appointment reminders cut our no-shows from 18% down to under 2%. The client formula cards are indispensable for our therapists, and the 28-day automated recall campaign brought back 34% of inactive clients without touching our phones."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-200 font-serif font-bold text-sm shrink-0">
                  PS
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Dr. Pooja Singhania</div>
                  <div className="text-[11px] text-slate-400 truncate">Operations & Spa Director</div>
                  <div className="text-[10px] font-mono text-[#FACC15] truncate">Aura Wellness Sanctuary, Bengaluru</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#111114] space-y-6 flex flex-col justify-between hover:border-[#FACC15]/40 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FACC15]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    100% Staff Trust
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-light leading-relaxed italic">
                  "Barbers in our club can check their commission tiers and daily tips right from their phones without seeing our private ledger or overheads. Receptionists love the simple keyboard shortcuts. We expanded to our 2nd branch in Gurgaon seamlessly."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] font-serif font-bold text-sm shrink-0">
                  VR
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Vikramaditya Rao</div>
                  <div className="text-[11px] text-slate-400 truncate">Franchise Partner & Master Barber</div>
                  <div className="text-[10px] font-mono text-[#FACC15] truncate">The Royal Gentlemen Club, Delhi NCR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans & Pricing */}
      <section id="pricing" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#0b0b0e]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              08 / Pricing
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Transparent monthly plans
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Zero transaction cuts. Zero commission lock-ins.
            </p>

            <div className="inline-flex items-center border border-white/[0.08] p-1 rounded bg-[#09090b] font-mono text-xs mt-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                  billingCycle === "monthly" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] text-amber-300">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan 1 */}
            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-serif text-xl text-white">Starter Studio</div>
                  <div className="text-xs text-slate-400 font-light">Up to 3 styling chairs.</div>
                </div>
                <div className="pt-2">
                  <span className="font-serif text-3xl text-white">
                    {billingCycle === "annual" ? "₹2,399" : "₹2,999"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono"> / month</span>
                </div>
                <div className="space-y-2 text-xs font-light text-slate-300 pt-3 border-t border-white/[0.08]">
                  <div>· Up to 3 Styling Stations</div>
                  <div>· Fast POS & GST Invoicing</div>
                  <div>· Daily Schedule Planner</div>
                  <div>· Client Formulation Vault</div>
                </div>
              </div>
              <Link
                href="/signup"
                className="w-full py-2.5 border border-white/20 text-slate-200 hover:bg-white/5 font-medium text-xs uppercase tracking-wider rounded text-center block transition-all"
              >
                Begin Trial
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="p-7 rounded-xl border border-amber-400/40 bg-white/[0.04] space-y-6 flex flex-col justify-between relative shadow-2xl">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-serif text-xl text-white">Growth Studio</div>
                  <div className="text-xs text-slate-400 font-light">For high-traffic studios & multi-chair salons.</div>
                </div>
                <div className="pt-2">
                  <span className="font-serif text-3xl text-amber-200">
                    {billingCycle === "annual" ? "₹4,799" : "₹5,999"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono"> / month</span>
                </div>
                <div className="space-y-2 text-xs font-light text-slate-200 pt-3 border-t border-white/[0.08]">
                  <div>· Up to 10 Styling Stations</div>
                  <div>· Meta WhatsApp Marketing API</div>
                  <div>· Staff Clock-in & Split Commissions</div>
                  <div>· Backbar & Retail Stock Ledger</div>
                  <div>· Branded Online Booking Portal</div>
                </div>
              </div>
              <Link
                href="/signup"
                className="w-full py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs uppercase tracking-wider rounded text-center block transition-all shadow-md"
              >
                Begin Trial
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-serif text-xl text-white">Multi-Branch Chain</div>
                  <div className="text-xs text-slate-400 font-light">Franchise groups and multi-location brands.</div>
                </div>
                <div className="pt-2">
                  <span className="font-serif text-3xl text-white">
                    {billingCycle === "annual" ? "₹10,399" : "₹12,999"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono"> / month</span>
                </div>
                <div className="space-y-2 text-xs font-light text-slate-300 pt-3 border-t border-white/[0.08]">
                  <div>· Unlimited Stations & Outlets</div>
                  <div>· Centralized Client Loyalty Sync</div>
                  <div>· Inter-Branch Stock Transfers</div>
                  <div>· Dedicated Database Instance</div>
                </div>
              </div>
              <Link
                href="/signup"
                className="w-full py-2.5 border border-white/20 text-slate-200 hover:bg-white/5 font-medium text-xs uppercase tracking-wider rounded text-center block transition-all"
              >
                Contact Concierge
              </Link>
            </div>
          </div>

          {/* Deep Feature Comparison Matrix */}
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between border-t border-white/[0.08] pt-8">
              <div>
                <h3 className="font-serif text-xl text-white font-medium">Detailed Feature Comparison</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  See exactly what capabilities are unlocked in each edition.
                </p>
              </div>
              <button
                onClick={() => setShowFeatureTable(!showFeatureTable)}
                className="text-xs font-mono uppercase tracking-wider text-[#FACC15] hover:underline cursor-pointer flex items-center gap-1"
              >
                {showFeatureTable ? "Hide Matrix" : "View Matrix"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFeatureTable ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showFeatureTable && (
              <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
                <table className="w-full text-left text-xs border-collapse font-light">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-mono text-[11px]">
                      <th className="py-3.5 px-5">CAPABILITY</th>
                      <th className="py-3.5 px-5 text-slate-300">STARTER</th>
                      <th className="py-3.5 px-5 text-[#FACC15] bg-white/[0.03]">GROWTH</th>
                      <th className="py-3.5 px-5 text-slate-300">MULTI-BRANCH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Styling Stations / Chairs</td>
                      <td className="py-3 px-5 text-slate-300 font-mono">Up to 3</td>
                      <td className="py-3 px-5 text-[#FACC15] font-mono bg-white/[0.03]">Up to 10</td>
                      <td className="py-3 px-5 text-emerald-400 font-mono">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Real-Time Front Desk & Walk-In Queue</td>
                      <td className="py-3 px-5 text-emerald-400">Included</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Included</td>
                      <td className="py-3 px-5 text-emerald-400">Included</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Fast POS & GST Thermal Printing (80mm/58mm)</td>
                      <td className="py-3 px-5 text-emerald-400">Included</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Included</td>
                      <td className="py-3 px-5 text-emerald-400">Included</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Automated Meta WhatsApp Dispatches</td>
                      <td className="py-3 px-5 text-slate-500">Manual Web links</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Official Meta API</td>
                      <td className="py-3 px-5 text-emerald-400">Dedicated WABA + Green Tick</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Client Formulation & Chemical Vault</td>
                      <td className="py-3 px-5 text-emerald-400">Basic Notes</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Full Gram Ledger</td>
                      <td className="py-3 px-5 text-emerald-400">Cross-branch Formula Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Staff Split Commission & Attendance Engine</td>
                      <td className="py-3 px-5 text-slate-500">Basic</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Dynamic Tiers + Tips</td>
                      <td className="py-3 px-5 text-emerald-400">Multi-branch Payroll Sync</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Retail Stock & Backbar Usage Ledger</td>
                      <td className="py-3 px-5 text-slate-500">Simple Inventory</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Automated Alerts</td>
                      <td className="py-3 px-5 text-emerald-400">Inter-Branch Stock Transfer</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Sovereign Branded Online Booking Portal</td>
                      <td className="py-3 px-5 text-emerald-400">Standard URL</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Custom Subdomain</td>
                      <td className="py-3 px-5 text-emerald-400">White-label Custom Domain</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">Zero Marketplace Transaction Fees</td>
                      <td className="py-3 px-5 text-emerald-400 font-mono">0% Forever</td>
                      <td className="py-3 px-5 text-emerald-400 font-mono bg-white/[0.03]">0% Forever</td>
                      <td className="py-3 px-5 text-emerald-400 font-mono">0% Forever</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-white font-medium">White-Glove Migration from Zenoti / Fresha</td>
                      <td className="py-3 px-5 text-slate-500">Self-serve CSV</td>
                      <td className="py-3 px-5 text-emerald-400 bg-white/[0.03]">Guided Concierge</td>
                      <td className="py-3 px-5 text-emerald-400">Dedicated Account Manager</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#09090b]">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
              08 / Inquiries
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/[0.08] rounded-lg overflow-hidden bg-white/[0.02] transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-5 text-left text-sm font-medium text-white flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-400 font-light leading-relaxed border-t border-white/[0.06] animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Final Callout */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0c0e] text-center border-b border-white/[0.08]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400/90 font-medium">
            Deployment
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-normal text-white tracking-tight">
            Elevate your studio operations.
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-400 font-light leading-relaxed">
            Fourteen days complimentary access. Zero commission lock-ins. Seamless data migration from existing spreadsheets or aggregators.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-slate-100 hover:bg-white text-slate-950 font-medium text-xs uppercase tracking-wider rounded transition-all shadow-xl"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-transparent hover:bg-white/5 text-slate-200 font-medium text-xs uppercase tracking-wider rounded border border-white/20 transition-all"
            >
              Open Reception Terminal
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Editorial Footer */}
      <footer className="bg-[#08080a] py-20 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <BillCareLogo size="md" variant="light" showSubtitle={true} />
              <p className="text-slate-400 text-xs max-w-sm font-light leading-relaxed">
                The sovereign management operating system for high-volume hair salons, master barber clubs, and luxury aesthetic wellness clinics.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Systems Operational · Mumbai & Bangalore Region
                </span>
              </div>
            </div>

            {/* Front Desk & Operations */}
            <div className="space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-white">Operations</div>
              <ul className="space-y-2 text-slate-400 font-light">
                <li><Link href="/front-desk" className="hover:text-white transition-colors">Front Desk Counter</Link></li>
                <li><Link href="/pos" className="hover:text-white transition-colors">POS & Thermal Invoicing</Link></li>
                <li><Link href="/calendar" className="hover:text-white transition-colors">Chair Scheduler Matrix</Link></li>
                <li><Link href="/staff" className="hover:text-white transition-colors">Staff Clock-In & Tips</Link></li>
                <li><Link href="/inventory" className="hover:text-white transition-colors">Backbar & Stock Ledger</Link></li>
              </ul>
            </div>

            {/* Growth & Retention */}
            <div className="space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-white">Client Growth</div>
              <ul className="space-y-2 text-slate-400 font-light">
                <li><Link href="/customers" className="hover:text-white transition-colors">Client CRM & Formulas</Link></li>
                <li><Link href="/whatsapp" className="hover:text-white transition-colors">WhatsApp Dispatches</Link></li>
                <li><Link href="/book" className="hover:text-white transition-colors">Online Booking Link</Link></li>
                <li><Link href="/owner" className="hover:text-white transition-colors">Owner Analytics & BI</Link></li>
                <li><Link href="/reports" className="hover:text-white transition-colors">GST Tax & Sales Reports</Link></li>
              </ul>
            </div>

            {/* Compliance & Trust */}
            <div className="space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-white">Enterprise Trust</div>
              <ul className="space-y-2 text-slate-400 font-light">
                <li className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>GST E-Invoicing Ready</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Meta Cloud API Partner</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Marketplace Cuts</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-Bit TLS Encryption</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
            <div>
              © {new Date().getFullYear()} BillCare Technologies Inc. Built for independent salons across India.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-white transition-colors">Staff Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Start Free Trial</Link>
              <span className="text-slate-600">·</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span className="text-slate-600">·</span>
              <span>v2.8 Enterprise</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
