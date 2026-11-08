import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { RuvexiProvider } from "@/lib/ruvexi-context";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090d16",
};

export const metadata: Metadata = {
  title: "Ruvexi Solutions - The Modern Salon & Spa Management Platform",
  description:
    "End-to-end salon management SaaS platform: Point of Sale (POS) billing, appointment calendar, staff commission tracking, salon stock inventory, automated customer follow-ups & branded booking.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-amber-200 selection:text-slate-950 antialiased">
        <RuvexiProvider>
          {children}
        </RuvexiProvider>
      </body>
    </html>
  );
}
