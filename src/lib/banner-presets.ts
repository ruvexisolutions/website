// ============================================================================
// BillCare - Discord-Style Salon Banners & Respected Salon Presets
// ============================================================================

export interface BannerPreset {
  id: string;
  name: string;
  category: "Discord Nitro" | "Luxury Atmosphere" | "Neon & Cyber" | "Gradients & Mesh";
  background: string;
  accentColor: string;
  description: string;
  isNitroStyle?: boolean;
  textColor?: string;
}

export const DISCORD_BANNER_PRESETS: BannerPreset[] = [
  {
    id: "discord-blurple",
    name: "Discord Blurple Nitro",
    category: "Discord Nitro",
    background: "linear-gradient(135deg, #1e1f38 0%, #5865F2 45%, #7289da 70%, #eb459e 100%)",
    accentColor: "#5865F2",
    description: "Iconic Discord Nitro signature palette with cosmic purple glow and neon violet highlights",
    isNitroStyle: true,
  },
  {
    id: "golden-noir",
    name: "Golden Noir & Velvet",
    category: "Luxury Atmosphere",
    background: "linear-gradient(135deg, #09090b 0%, #1c1408 30%, #3a2a10 60%, #b8860b 85%, #f6d285 100%)",
    accentColor: "#FACC15",
    description: "Champagne gold luxury shimmer against midnight velvet obsidian",
    isNitroStyle: true,
  },
  {
    id: "cyber-neon",
    name: "Cyberpunk Neon Atelier",
    category: "Neon & Cyber",
    background: "linear-gradient(135deg, #0b071a 0%, #311042 35%, #9333ea 70%, #ec4899 90%, #06b6d4 100%)",
    accentColor: "#06B6D4",
    description: "High-octane neon synthwave with cyber magenta and electric turquoise",
    isNitroStyle: true,
  },
  {
    id: "emerald-oasis",
    name: "Emerald Botanical Sanctuary",
    category: "Luxury Atmosphere",
    background: "linear-gradient(135deg, #021a12 0%, #064e3b 40%, #059669 75%, #10b981 92%, #6ee7b7 100%)",
    accentColor: "#10B981",
    description: "Deep organic eucalyptus jade with fresh revitalizing spa botanicals",
    isNitroStyle: true,
  },
  {
    id: "cosmic-stardust",
    name: "Cosmic Stardust & Nebula",
    category: "Discord Nitro",
    background: "radial-gradient(circle at 20% 30%, #3b0764 0%, #1e1035 40%, #09090b 80%), linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #d946ef 100%)",
    accentColor: "#A855F7",
    description: "Deep interstellar stardust with radiant ultraviolet nebula streaks",
    isNitroStyle: true,
  },
  {
    id: "sunset-horizon",
    name: "California Sunset Horizon",
    category: "Gradients & Mesh",
    background: "linear-gradient(135deg, #1f0814 0%, #831843 35%, #ea580c 70%, #f59e0b 90%, #fde047 100%)",
    accentColor: "#F97316",
    description: "Warm radiant golden hour sunset across the Pacific coastline",
    isNitroStyle: false,
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz & French Silk",
    category: "Luxury Atmosphere",
    background: "linear-gradient(135deg, #180913 0%, #4c1535 40%, #be185d 75%, #fb7185 92%, #fce7f3 100%)",
    accentColor: "#F43F5E",
    description: "Ultra-chic Parisian blush with iridescent champagne rose shimmer",
    isNitroStyle: true,
  },
  {
    id: "obsidian-stealth",
    name: "Obsidian Carbon Stealth",
    category: "Neon & Cyber",
    background: "radial-gradient(ellipse at top left, #27272a 0%, #18181b 45%, #09090b 100%)",
    accentColor: "#38BDF8",
    description: "Minimalist executive hyper-dark carbon texture with subtle studio lighting",
    isNitroStyle: false,
  },
  {
    id: "tokyo-sakura",
    name: "Tokyo Midnight Sakura",
    category: "Discord Nitro",
    background: "linear-gradient(135deg, #090c1f 0%, #1e1b4b 35%, #3730a3 65%, #c026d3 88%, #f472b6 100%)",
    accentColor: "#C026D3",
    description: "Shinjuku midnight rain illuminated by cherry blossom neon lanterns",
    isNitroStyle: true,
  },
  {
    id: "ocean-abyss",
    name: "Deep Ocean Atlantis",
    category: "Gradients & Mesh",
    background: "linear-gradient(135deg, #030712 0%, #0c2340 35%, #0284c7 70%, #38bdf8 90%, #a5f3fc 100%)",
    accentColor: "#38BDF8",
    description: "Bioluminescent azure waves with crystalline deep sapphire waters",
    isNitroStyle: false,
  },
  {
    id: "marble-showcase",
    name: "Luxe Studio Interior Showcase",
    category: "Luxury Atmosphere",
    background: "linear-gradient(to bottom, rgba(9,9,11,0.2), rgba(9,9,11,0.85)), url('/images/hero-showcase.jpg') center/cover no-repeat",
    accentColor: "#FACC15",
    description: "Opulent architecture, styling mirrors, and warm champagne studio chandeliers",
    isNitroStyle: true,
  },
  {
    id: "spa-sanctuary",
    name: "Zen Spa & Botanical Waters",
    category: "Luxury Atmosphere",
    background: "linear-gradient(to bottom, rgba(9,9,11,0.3), rgba(9,9,11,0.9)), url('/images/spa-wellness.jpg') center/cover no-repeat",
    accentColor: "#10B981",
    description: "Aromatic botanical candles, warm river stones, and soothing wellness waters",
    isNitroStyle: true,
  },
];

export const BRAND_ACCENT_COLORS = [
  { name: "Imperial Gold", hex: "#FACC15", text: "#080808" },
  { name: "Discord Blurple", hex: "#5865F2", text: "#FFFFFF" },
  { name: "Emerald Jade", hex: "#10B981", text: "#080808" },
  { name: "Cyber Cyan", hex: "#06B6D4", text: "#080808" },
  { name: "Rose Quartz", hex: "#F43F5E", text: "#FFFFFF" },
  { name: "Celestial Violet", hex: "#A855F7", text: "#FFFFFF" },
  { name: "Sunset Orange", hex: "#F97316", text: "#080808" },
  { name: "Electric Sky", hex: "#38BDF8", text: "#080808" },
];

// ============================================================================
// Respected Salons Registry (Multi-tenant booking presets)
// ============================================================================

export interface RespectedSalonProfile {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  branch: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  rating: number;
  reviewCount: number;
  logo: string;
  logoUrl?: string;
  bannerPreset: string;
  bannerUrl?: string;
  bannerGradient?: string;
  accentColor: string;
  category: string;
  badges: string[];
  timing: string;
  instagram: string;
  features: string[];
  services: {
    id: string;
    name: string;
    category: string;
    durationMinutes: number;
    price: number;
    description: string;
    popular?: boolean;
  }[];
  staff: {
    id: string;
    name: string;
    role: string;
    specialty: string[];
    rating: number;
    avatar: string;
    experienceYears: number;
  }[];
}

export const RESPECTED_SALONS: RespectedSalonProfile[] = [
  {
    id: "sln_billcare_flagship",
    slug: "billcare-atelier",
    name: "BillCare Premier Atelier & Spa",
    tagline: "Bespoke Hair Sculpting, Organic Keratin Therapy & Aesthetic Skin Wellness",
    branch: "Flagship Indiranagar",
    city: "Bengaluru",
    address: "Suite 401, Crescent Galleria, 100 Ft Rd, Indiranagar, Bengaluru - 560038",
    phone: "+91 98450 11223",
    email: "atelier@billcare.io",
    currency: "₹",
    rating: 4.95,
    reviewCount: 428,
    logo: "/images/billcare-logo.png",
    bannerPreset: "discord-blurple",
    accentColor: "#FACC15",
    category: "Luxury Hair Studio & Aesthetic Spa",
    badges: ["👑 Official Flagship", "✨ Verified Atelier", "💎 Boost Level 3", "⚡ Instant WhatsApp Pass"],
    timing: "10:00 AM - 09:30 PM (Open All 7 Days)",
    instagram: "@billcare.atelier",
    features: ["Zero Marketplace Fee", "Master Colorists", "Private VIP Suites", "Complimentary Prosecco"],
    services: [
      {
        id: "srv_b1",
        name: "Director's Bespoke Haircut & Silk Styling",
        category: "Hair",
        durationMinutes: 60,
        price: 1800,
        description: "Bespoke face-framing scissor sculpting by our Creative Director, paired with organic clarifying wash and botanical blowdry.",
        popular: true,
      },
      {
        id: "srv_b2",
        name: "French Balayage & Glaze Melt",
        category: "Hair",
        durationMinutes: 150,
        price: 6500,
        description: "Freehand dimensional French lightening seamlessly melted with ammonia-free gloss for sun-kissed reflection.",
        popular: true,
      },
      {
        id: "srv_b3",
        name: "Cellular 24K Gold Hydra-Facial",
        category: "Skin & Spa",
        durationMinutes: 75,
        price: 4200,
        description: "Medical-grade vortex deep pore extraction infused with pure 24K colloidal gold, hyaluronic serum, and cryo-sculpting.",
        popular: true,
      },
      {
        id: "srv_b4",
        name: "Deep Tissue Himalayan Salt Stone Therapy",
        category: "Skin & Spa",
        durationMinutes: 90,
        price: 3600,
        description: "Warm mineral-rich pink salt stones melts chronic muscle tension with therapeutic eucalyptus essential oils.",
      },
      {
        id: "srv_b5",
        name: "Royal Diamond Gel Sculpting Manicure",
        category: "Nails",
        durationMinutes: 50,
        price: 1500,
        description: "Russian cuticle detailing, Japanese diamond-infused gel lacquer, and intensive shea butter mask.",
      },
      {
        id: "srv_b6",
        name: "Executive Beard Sculpt & Ozone Vapor",
        category: "Beard & Grooming",
        durationMinutes: 40,
        price: 950,
        description: "Precise straight-razor contouring, warm herbal ozone steaming, and sandalwood conditioning balm.",
      },
    ],
    staff: [
      {
        id: "st_1",
        name: "Kavita Rao",
        role: "Creative Styling Director",
        specialty: ["French Balayage", "Precision Bobs", "Bridal Hair"],
        rating: 4.98,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80",
        experienceYears: 11,
      },
      {
        id: "st_2",
        name: "Vikram Malhotra",
        role: "Master Barber & Stylist",
        specialty: ["Executive Fades", "Beard Sculpting", "Keratin Smoothing"],
        rating: 4.92,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
        experienceYears: 8,
      },
      {
        id: "st_3",
        name: "Ananya Deshmukh",
        role: "Senior Aesthetician",
        specialty: ["Hydra-Facials", "Ayurvedic Spa", "Micro-needling"],
        rating: 4.96,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80",
        experienceYears: 9,
      },
      {
        id: "st_4",
        name: "Rohit Verma",
        role: "Senior Color Specialist",
        specialty: ["Vivid Hair Coloring", "AirTouch Balayage", "Scalp Detox"],
        rating: 4.89,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
        experienceYears: 7,
      },
    ],
  },
  {
    id: "sln_luxe_haven",
    slug: "luxe-haven",
    name: "Luxe Haven Salon & Aesthetic Spa",
    tagline: "Curated Haute Coiffure, Velvet Skin Therapy & French Balayage",
    branch: "100 Ft Road Flagship",
    city: "Bengaluru",
    address: "742, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    phone: "+91 98450 12890",
    email: "concierge@luxehaven.in",
    currency: "₹",
    rating: 4.96,
    reviewCount: 512,
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80",
    bannerPreset: "rose-quartz",
    accentColor: "#F43F5E",
    category: "Organic Hair & Facial Haven",
    badges: ["✨ Partnered Boutique", "🌸 Organic Botanical Certified", "💎 Boost Level 3"],
    timing: "09:30 AM - 09:00 PM (Tuesday - Sunday)",
    instagram: "@luxehaven.salon",
    features: ["Ammonia-free Dyes", "Private Steam Pods", "Matcha & Herbal Bar", "100% Cruelty Free"],
    services: [
      {
        id: "srv_l1",
        name: "Parisian Silk Gloss & Cut",
        category: "Hair",
        durationMinutes: 75,
        price: 2400,
        description: "Organic argan oil deep infusion followed by a signature dry-cut styling technique.",
        popular: true,
      },
      {
        id: "srv_l2",
        name: "Botanical Rose Quartz Hydration Facial",
        category: "Skin & Spa",
        durationMinutes: 60,
        price: 3200,
        description: "Damask rose hydrosol, cooled quartz gua-sha lymphatic drainage, and antioxidant squalane.",
        popular: true,
      },
      {
        id: "srv_l3",
        name: "Organic Agave Smoothing Treatment",
        category: "Hair",
        durationMinutes: 120,
        price: 5800,
        description: "Zero-formaldehyde organic plant protein smoothing for frizz-free humidity resistance.",
      },
      {
        id: "srv_l4",
        name: "Aromatherapy Herbal Body Glow",
        category: "Skin & Spa",
        durationMinutes: 80,
        price: 3800,
        description: "Exfoliating lavender and sea salt buffing followed by a warm sweet almond oil wrap.",
      },
    ],
    staff: [
      {
        id: "st_l1",
        name: "Camille Laurent",
        role: "Artistic Director",
        specialty: ["French Balayage", "Invisible Layers"],
        rating: 4.97,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
        experienceYears: 12,
      },
      {
        id: "st_l2",
        name: "Nandini Sen",
        role: "Holistic Skin Specialist",
        specialty: ["Rose Quartz Facials", "Lymphatic Sculpt"],
        rating: 4.94,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80",
        experienceYears: 8,
      },
    ],
  },
  {
    id: "sln_obsidian_barber",
    slug: "obsidian-barber",
    name: "Obsidian & Chrome Grooming Lounge",
    tagline: "Precision Skin Fades, Hot Towel Straight-Razor Shaves & Beard Sculpting",
    branch: "Pali Hill Studio",
    city: "Mumbai",
    address: "Corner House, 14th Road, Bandra West, Mumbai - 400050",
    phone: "+91 99201 44556",
    email: "frontdesk@obsidiangrooming.com",
    currency: "₹",
    rating: 4.88,
    reviewCount: 380,
    logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80",
    bannerPreset: "obsidian-stealth",
    accentColor: "#06B6D4",
    category: "Executive Barber & Gentlemen's Lounge",
    badges: ["💈 Master Barber Guild", "⚡ Quick 30m Express", "🥃 Single Malt Lounge"],
    timing: "10:30 AM - 10:00 PM (Closed Mondays)",
    instagram: "@obsidian.barbers",
    features: ["Hot Towel Shave", "Custom Espresso Bar", "Shoe Shine", "Soundproof Booths"],
    services: [
      {
        id: "srv_o1",
        name: "The Executive Taper & Razor Fade",
        category: "Hair",
        durationMinutes: 45,
        price: 1200,
        description: "Surgical foil shaver fade with scissor textured crown and hot lather neck shave.",
        popular: true,
      },
      {
        id: "srv_o2",
        name: "Signature 7-Step Hot Towel Shave",
        category: "Beard & Grooming",
        durationMinutes: 40,
        price: 900,
        description: "Essential oil pre-shave massage, dual hot towels, traditional straight edge, and cold rosewater compress.",
        popular: true,
      },
      {
        id: "srv_o3",
        name: "Charcoal Detox Scalp & Beard Mask",
        category: "Beard & Grooming",
        durationMinutes: 35,
        price: 850,
        description: "Activated bamboo charcoal exfoliating scrub to remove product buildup and invigorate folicules.",
      },
    ],
    staff: [
      {
        id: "st_o1",
        name: "Arjun Khanna",
        role: "Head Barber & Proprietor",
        specialty: ["Skin Fades", "Beard Sculpting"],
        rating: 4.93,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
        experienceYears: 10,
      },
      {
        id: "st_o2",
        name: "Dev Sharma",
        role: "Master Color & Stylist",
        specialty: ["Textured Crops", "Grey Blending"],
        rating: 4.86,
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
        experienceYears: 6,
      },
    ],
  },
  {
    id: "sln_aura_glow",
    slug: "aura-glow",
    name: "Aura Glow Holistic Wellness & Med-Spa",
    tagline: "Modern Panchakarma, Golden Glow Hydrafacial & Sound Bath Rituals",
    branch: "Koramangala 4th Block",
    city: "Bengaluru",
    address: "88, 80 Feet Road, Koramangala 4th Block, Bengaluru - 560034",
    phone: "+91 97410 88990",
    email: "healing@auraglow.in",
    currency: "₹",
    rating: 4.98,
    reviewCount: 640,
    logo: "https://images.unsplash.com/photo-1512290900672-1f55b9e07851?w=150&auto=format&fit=crop&q=80",
    bannerPreset: "emerald-oasis",
    accentColor: "#10B981",
    category: "Holistic Skin & Med-Spa",
    badges: ["🌿 100% Ayurvedic", "🧘 Sound Healing Studio", "⭐ 4.98 Highest Rated"],
    timing: "08:00 AM - 08:30 PM (Daily)",
    instagram: "@auraglow.wellness",
    features: ["Tibetan Singing Bowls", "Organic Herbal Teas", "Dermatologist Supervised", "Steam Showers"],
    services: [
      {
        id: "srv_a1",
        name: "Kumkumadi Royal Saffron Facial",
        category: "Skin & Spa",
        durationMinutes: 75,
        price: 3500,
        description: "Authentic Kashmiri saffron and 26 precious Himalayan herbs massaged to restore deep cellular glow.",
        popular: true,
      },
      {
        id: "srv_a2",
        name: "Shirodhara & Herbal Scalp Detox",
        category: "Skin & Spa",
        durationMinutes: 60,
        price: 2800,
        description: "Continuous stream of warm medicated herbal oil on the third eye to induce meditative relaxation.",
        popular: true,
      },
      {
        id: "srv_a3",
        name: "Abhyanga Full Body Warm Oil Massage",
        category: "Skin & Spa",
        durationMinutes: 90,
        price: 4000,
        description: "Synchronized full-body massage with warm sesame-infused therapeutic oils and steam sauna.",
      },
    ],
    staff: [
      {
        id: "st_a1",
        name: "Dr. Maya Nambiar",
        role: "BAMS Wellness Physician",
        specialty: ["Ayurvedic Consultation", "Shirodhara"],
        rating: 4.99,
        avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=160&auto=format&fit=crop&q=80",
        experienceYears: 14,
      },
      {
        id: "st_a2",
        name: "Rhea Shenoy",
        role: "Holistic Aesthetician",
        specialty: ["Sound Baths", "Glow Facials"],
        rating: 4.95,
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=160&auto=format&fit=crop&q=80",
        experienceYears: 7,
      },
    ],
  },
];

// Helper to resolve CSS background for any salon
export function resolveSalonBannerStyle(
  salon: {
    bannerPreset?: string;
    bannerUrl?: string;
    bannerGradient?: string;
  }
): React.CSSProperties {
  // If custom gradient is set
  if (salon.bannerGradient && salon.bannerGradient.trim()) {
    return {
      background: salon.bannerGradient,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  // If custom image URL is uploaded or provided
  if (salon.bannerUrl && salon.bannerUrl.trim()) {
    return {
      backgroundImage: `linear-gradient(to bottom, rgba(14,14,16,0.2) 0%, rgba(14,14,16,0.85) 100%), url('${salon.bannerUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  // If preset is selected
  const preset = DISCORD_BANNER_PRESETS.find((p) => p.id === salon.bannerPreset);
  if (preset) {
    if (preset.background.includes("url(")) {
      return {
        background: preset.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      background: preset.background,
    };
  }

  // Fallback default (Discord Blurple Nitro)
  return {
    background: "linear-gradient(135deg, #1e1f38 0%, #5865F2 45%, #7289da 70%, #eb459e 100%)",
  };
}

export function findRespectedSalonBySlug(slug?: string): RespectedSalonProfile | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return RESPECTED_SALONS.find((s) => s.slug === clean || s.id === clean);
}
