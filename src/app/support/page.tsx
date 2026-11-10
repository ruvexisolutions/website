import Link from "next/link";
import { ArrowLeft, Headphones, Mail, MessageSquare, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Support & Help Center | RUVEXI Solutions",
  description: "Official Support & Help Center for RUVEXI Salon Management Platform. Email: ruvexisolutions@gmail.com",
};

export default function SupportPage() {
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
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 Operations Help Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">How Can We Help Your Salon?</h1>
          <p className="text-slate-400 text-sm">
            Direct access to RUVEXI technical engineers for POS hardware, UPI payment reconciliation, and multi-staff accounts.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#122C1A] border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Email Support</h3>
              <p className="text-slate-400 text-xs mb-4">Guaranteed response within 4 hours for billing and configuration tickets.</p>
              <a
                href="mailto:ruvexisolutions@gmail.com"
                className="inline-block font-mono text-sm font-semibold text-[#22C55E] hover:underline"
              >
                ruvexisolutions@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-[#101311] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#122C1A] border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">WhatsApp Live Support</h3>
              <p className="text-slate-400 text-xs mb-4">Live assistance for active counter billing and thermal printer configuration.</p>
              <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
                Available Mon–Sat: 9 AM – 9 PM IST
              </span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#22C55E]" />
            Frequently Asked Questions
          </h2>

          <div className="bg-[#101311] border border-white/[0.08] rounded-xl p-5 space-y-2">
            <h3 className="text-white font-semibold text-sm">How do I configure my ESC/POS Bluetooth thermal printer?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Open the RUVEXI mobile app, go to Settings &gt; POS &amp; Hardware &gt; Pair Thermal Printer. Select your 58mm or 80mm wireless printer from the Bluetooth list. Test receipt printing takes less than 15 seconds.
            </p>
          </div>

          <div className="bg-[#101311] border border-white/[0.08] rounded-xl p-5 space-y-2">
            <h3 className="text-white font-semibold text-sm">Does Dynamic UPI QR require a bank terminal swipe machine?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No. RUVEXI generates instant NPCI-compliant dynamic QR codes directly on your counter tablet, mobile device, or prints it at the bottom of the estimate slip. Funds settle directly into your current account without 2% swipe machine interchange fees.
            </p>
          </div>

          <div className="bg-[#101311] border border-white/[0.08] rounded-xl p-5 space-y-2">
            <h3 className="text-white font-semibold text-sm">What happens if our salon internet goes down during peak rush?</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              RUVEXI mobile features local caching. You can generate bills, punch service tickets, and queue invoices locally. Once internet connectivity restores, the offline queue syncs automatically to Supabase Cloud without data collision.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

