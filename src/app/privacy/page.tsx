import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | RUVEXI Solutions",
  description: "Privacy Policy detailing how RUVEXI protects salon customer data, formulas, and transaction records.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#060706] text-white selection:bg-[#22C55E]/30 selection:text-[#22C55E]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#060706]/80 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 font-bold tracking-[0.2em] text-sm">
            <span>RUVEXI</span>
            <span className="w-1.5 h-3 bg-[#22C55E] rounded-sm -mt-1" />
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-white/10 hover:border-[#22C55E]/50 hover:bg-[#22C55E]/10 transition-colors"
          >
            Owner Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122C1A] border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">
            Last updated: November 2026 • High-Integrity Data Privacy Architecture for Salons and Spas
          </p>
        </div>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          <section className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#22C55E]" />
              1. Information Collection & Scope
            </h2>
            <p>
              When salon owners, managers, stylists, or clients interact with <strong className="text-white">RUVEXI Solutions</strong>, we process:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-white">Salon Account Information:</strong> Salon atelier trade name, owner name, business email, contact number, and GSTIN.</li>
              <li><strong className="text-white">Client CRM Profiles:</strong> Customer phone numbers, appointment timestamps, past visit frequencies, loyalty point balances, and hair/skin formula notes.</li>
              <li><strong className="text-white">Point of Sale (POS) Records:</strong> Service items billed, payment methods (UPI, Card, Cash), and invoice sums.</li>
              <li><strong className="text-white">Staff Roster Metrics:</strong> Clock-in timestamps, assigned services, and commission calculations.</li>
            </ul>
          </section>

          <section className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#22C55E]" />
              2. Strict Non-Monetization of Salon Data
            </h2>
            <p>
              RUVEXI operates on a clean subscription software business model. We do <strong className="text-white underline decoration-[#22C55E]">NOT</strong> sell, trade, or monetize client lists, formulas, or revenues with advertisers, third-party FMCG brands, or external aggregators. Your salon database belongs strictly to your business.
            </p>
          </section>

          <section className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#22C55E]" />
              3. Encryption & Row-Level Isolation
            </h2>
            <p>
              All database connections are enforced with PostgreSQL Row-Level Security (RLS), guaranteeing that no staff or tenant can view records outside their authenticated tenant domain.
            </p>
            <p>
              Data transmission is protected with 256-bit Transport Layer Security (TLS 1.3), and customer formula records are encrypted at rest with AES-256 standards.
            </p>
          </section>

          <section className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#22C55E]" />
              4. Data Subject Rights & Contact
            </h2>
            <p>
              You or your clients may request an export or complete purge of personal records at any time. For privacy inquiries or requests, contact our privacy officer:
            </p>
            <div className="bg-[#141815] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">Privacy Governance Desk</p>
                <p className="text-[#22C55E] font-mono text-sm">ruvexisolutions@gmail.com</p>
              </div>
              <a
                href="mailto:ruvexisolutions@gmail.com"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#22C55E] text-black font-bold text-xs hover:bg-[#1ea850] transition-colors"
              >
                Send Privacy Request
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
