export interface SalonProfile {
  id: string;
  name: string;
  tagline: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  currency: string;
  rating: number;
  reviewCount: number;
  logo: string;
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  whatsapp?: {
    status?: string;
    displayNumber?: string;
    verifiedName?: string;
    phoneNumberId?: string;
    wabaId?: string;
    qualityRating?: string;
    isConnected?: boolean;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string[];
  phone: string;
  avatar: string;
  commissionRate: number; // percentage
  status: "clocked_in" | "on_break" | "clocked_out";
  clockInTime?: string;
  todayRevenue: number;
  todayCommission: number;
  todayServicesCount: number;
  rating: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: "Hair" | "Skin & Spa" | "Nails" | "Beard & Grooming" | "Makeup" | "Waxing" | "Hair Colour" | "Threading" | "Hair Spa" | "Massage" | "Facial" | string;
  durationMinutes: number;
  price: number;
  description: string;
  popular?: boolean;
  imageUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: "Hair Care" | "Color & Chemical" | "Skin & Facial" | "Tools & Disposables";
  usageType: "Salon Professional" | "Retail Sale";
  currentStock: number;
  minThreshold: number;
  costPrice: number;
  retailPrice?: number;
  unit: string;
  lastRestocked: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: "Female" | "Male" | "Other";
  visitsCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisitDate: string;
  lastService: string;
  preferredStaff: string;
  tags: string[];
  notes: string;
  vipTier?: "Platinum VIP" | "Gold VIP" | "Silver Regular";
  formulaNotes?: string;
  patchTestStatus?: "Valid" | "Expired" | "Not Required";
  patchTestDate?: string;
  allergies?: string;
  rebookingCadenceDays?: number;
}

export interface FollowUpCampaign {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  campaignType: "24h_feedback" | "color_touchup" | "win_back" | "birthday_offer";
  status: "Pending" | "Sent" | "Delivered" | "Replied";
  scheduledFor: string;
  serviceTrigger: string;
  suggestedMessage: string;
  discountOffer?: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerPhone: string;
  staffName: string;
  serviceName: string;
  date: string;
  serviceRating: number; // 1 to 5
  friendlinessRating: number; // 1 to 5
  ambienceRating: number; // 1 to 5
  improvementTags: string[];
  comment?: string;
}

export const INITIAL_FEEDBACK: CustomerFeedback[] = [];

export interface InvoiceItem {
  id: string;
  name: string;
  type: "service" | "product";
  price: number;
  quantity: number;
  staffId: string;
  staffName: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  total: number;
  paymentMethod: "Cash" | "UPI" | "Card" | "Split";
  splitDetails?: { cash: number; upi: number };
  status: "Paid" | "Draft" | "Refunded";
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  staffId: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: "Confirmed" | "In-Service" | "Completed" | "Cancelled";
  source: "Online Booking" | "Walk-in" | "Phone Call";
}

export const INITIAL_SALON: SalonProfile = {
  id: "sln_1dc700ec03ea",
  name: "OLG Professional Unisex Salon & HairFixing",
  tagline: "Luxury Styling, Advanced Hair Treatments & Aesthetic Spa",
  branch: "Chickmagalur Studio",
  address: "opp jayashree digital, aralimara road, basavanahalli, chikmagalur",
  phone: "8296294666",
  email: "darshanurs54@gmail.com",
  gstin: "",
  currency: "₹",
  rating: 4.9,
  reviewCount: 418,
  logo: "/logo.png",
  upiId: "8296294666@ybl",
};

export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "srv_olg_001",
    name: "Roll-On Wax - Full Arms",
    category: "Waxing",
    durationMinutes: 30,
    price: 700.0,
    description: "Roll-on wax hair removal for full arms.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_002",
    name: "Roll-On Wax - Half Arms",
    category: "Waxing",
    durationMinutes: 20,
    price: 600.0,
    description: "Roll-on wax hair removal for half arms.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_003",
    name: "Roll-On Wax - Half Leg",
    category: "Waxing",
    durationMinutes: 25,
    price: 700.0,
    description: "Roll-on wax hair removal for half legs.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_004",
    name: "Roll-On Wax - Full Leg",
    category: "Waxing",
    durationMinutes: 40,
    price: 800.0,
    description: "Roll-on wax hair removal for full legs.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_005",
    name: "Roll-On Wax - Back",
    category: "Waxing",
    durationMinutes: 30,
    price: 550.0,
    description: "Roll-on waxing for smooth back skin.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_006",
    name: "Roll-On Wax - Underarms",
    category: "Waxing",
    durationMinutes: 15,
    price: 200.0,
    description: "Gentle roll-on waxing for underarms.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_007",
    name: "Roll-On Wax - Full Body",
    category: "Waxing",
    durationMinutes: 120,
    price: 3680.0,
    description: "Comprehensive full body roll-on wax therapy.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_008",
    name: "Roll-On Wax - Full Face",
    category: "Waxing",
    durationMinutes: 30,
    price: 400.0,
    description: "Gentle facial roll-on waxing.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_009",
    name: "Roll-On Wax - Chest",
    category: "Waxing",
    durationMinutes: 25,
    price: 350.0,
    description: "Roll-on waxing for chest area.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_010",
    name: "Roll-On Wax - Stomach",
    category: "Waxing",
    durationMinutes: 25,
    price: 400.0,
    description: "Roll-on waxing for stomach area.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_011",
    name: "Roll-On Wax - Upper Lip",
    category: "Waxing",
    durationMinutes: 10,
    price: 60.0,
    description: "Quick roll-on waxing for upper lip.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_012",
    name: "Roll-On Wax - Forehead",
    category: "Waxing",
    durationMinutes: 10,
    price: 60.0,
    description: "Roll-on waxing for forehead hairline.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_013",
    name: "Roll-On Wax - Chin",
    category: "Waxing",
    durationMinutes: 10,
    price: 60.0,
    description: "Roll-on waxing for chin.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_014",
    name: "Roll-On Wax - Neck",
    category: "Waxing",
    durationMinutes: 15,
    price: 100.0,
    description: "Roll-on waxing for neck area.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_015",
    name: "Basic Haircut (U, V, Straight)",
    category: "Hair",
    durationMinutes: 30,
    price: 400.0,
    description: "Women's classic haircut (U-cut, V-cut, or straight cut).",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_016",
    name: "Layer Haircut Trim (With Wash & Normal Dry)",
    category: "Hair",
    durationMinutes: 45,
    price: 700.0,
    description: "Layer haircut trim including refreshing wash and blast dry.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_017",
    name: "Creativity Cut & Style (With Wash & Setting)",
    category: "Hair",
    durationMinutes: 60,
    price: 800.0,
    description: "Artistic couture cut with hair wash, blow dry, and styling.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_018",
    name: "Kids Haircut (Up to 10 Years)",
    category: "Hair",
    durationMinutes: 25,
    price: 400.0,
    description: "Gentle and stylish haircut for girls up to 10 years.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_019",
    name: "Fringes Cut & Bangs",
    category: "Hair",
    durationMinutes: 15,
    price: 100.0,
    description: "Fringe reshaping and face-framing bangs trim.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_020",
    name: "Student Beard Setting",
    category: "Beard & Grooming",
    durationMinutes: 15,
    price: 60.0,
    description: "Precision beard setting and shaping for students.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_021",
    name: "Student Haircut",
    category: "Beard & Grooming",
    durationMinutes: 25,
    price: 130.0,
    description: "Trendy men's haircut with student discount.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_022",
    name: "Student Haircut + Beard",
    category: "Beard & Grooming",
    durationMinutes: 40,
    price: 180.0,
    description: "Complete haircut and beard styling combo for students.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_023",
    name: "Non-Student Haircut",
    category: "Beard & Grooming",
    durationMinutes: 30,
    price: 150.0,
    description: "Classic professional men's haircut.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_024",
    name: "Non-Student Haircut + Beard",
    category: "Beard & Grooming",
    durationMinutes: 45,
    price: 200.0,
    description: "Executive haircut and beard grooming combination.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_025",
    name: "Shave",
    category: "Beard & Grooming",
    durationMinutes: 20,
    price: 80.0,
    description: "Traditional clean shave with hot towel preparation.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_026",
    name: "Beard Trim & Shape",
    category: "Beard & Grooming",
    durationMinutes: 20,
    price: 70.0,
    description: "Expert beard shaping, trimming, and edge detailing.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_027",
    name: "Kids Haircut (Boys)",
    category: "Beard & Grooming",
    durationMinutes: 20,
    price: 120.0,
    description: "Kid's haircut tailored for boys.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_028",
    name: "Hair Wash (Shampoo & Conditioner)",
    category: "Beard & Grooming",
    durationMinutes: 15,
    price: 50.0,
    description: "Invigorating scalp wash with shampoo and deep conditioner.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_029",
    name: "Matrix Natural Black (Ammonia Free)",
    category: "Hair Colour",
    durationMinutes: 45,
    price: 300.0,
    description: "Natural black coverage with gentle ammonia-free Matrix formulation.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_030",
    name: "Schwarzkopf Hair Colour",
    category: "Hair Colour",
    durationMinutes: 45,
    price: 400.0,
    description: "Premium Schwarzkopf colour application.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_031",
    name: "Schwarzkopf Root Touch-Up (With Ammonia)",
    category: "Hair Colour",
    durationMinutes: 60,
    price: 1400.0,
    description: "Targeted root regrowth coverage with rich Schwarzkopf pigments.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_032",
    name: "Schwarzkopf Root Touch-Up (Ammonia Free)",
    category: "Hair Colour",
    durationMinutes: 60,
    price: 1500.0,
    description: "Zero-ammonia gentle root touch-up from Schwarzkopf.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_033",
    name: "Matrix Root Touch-Up (With Ammonia)",
    category: "Hair Colour",
    durationMinutes: 50,
    price: 1300.0,
    description: "Matrix long-lasting root regrowth application.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_034",
    name: "Matrix Root Touch-Up (Ammonia Free)",
    category: "Hair Colour",
    durationMinutes: 50,
    price: 1200.0,
    description: "Matrix zero-ammonia scalp-friendly root touch-up.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_035",
    name: "Global Colour (Ammonia Free) - Medium Length",
    category: "Hair Colour",
    durationMinutes: 90,
    price: 2500.0,
    description: "Full head global colour with ammonia-free formulation for medium length hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_036",
    name: "Global Colour (Ammonia Free) - Large Length",
    category: "Hair Colour",
    durationMinutes: 105,
    price: 2800.0,
    description: "Full head global colour with ammonia-free formulation for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_037",
    name: "Global Colour (With Ammonia) - Medium Length",
    category: "Hair Colour",
    durationMinutes: 90,
    price: 2400.0,
    description: "Vibrant permanent global colour for medium length hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_038",
    name: "Global Colour (With Ammonia) - Large Length",
    category: "Hair Colour",
    durationMinutes: 105,
    price: 2700.0,
    description: "Vibrant permanent global colour for long hair.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_039",
    name: "Global Colour (Ammonia Free - Rate 2) - Medium Length",
    category: "Hair Colour",
    durationMinutes: 90,
    price: 2300.0,
    description: "Global ammonia-free colour for medium hair (second listed rate).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_040",
    name: "Global Colour (Ammonia Free - Rate 2) - Large Length",
    category: "Hair Colour",
    durationMinutes: 105,
    price: 2400.0,
    description: "Global ammonia-free colour for long hair (second listed rate).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_041",
    name: "Global Colour (With Ammonia - Rate 2) - Medium Length",
    category: "Hair Colour",
    durationMinutes: 90,
    price: 2200.0,
    description: "Global colour with ammonia for medium hair (second listed rate).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_042",
    name: "Global Colour (With Ammonia - Rate 2) - Large Length",
    category: "Hair Colour",
    durationMinutes: 105,
    price: 2300.0,
    description: "Global colour with ammonia for long hair (second listed rate).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_043",
    name: "Full Streaking (Per Streak)",
    category: "Hair Colour",
    durationMinutes: 20,
    price: 250.0,
    description: "Individual foil highlight streak application.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_044",
    name: "Full Streaking (Above 10 Streaks, Per Streak)",
    category: "Hair Colour",
    durationMinutes: 15,
    price: 200.0,
    description: "Discounted rate per streak for full head highlights exceeding 10 streaks.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_045",
    name: "Hair Highlights \u2013 Balayage (Medium Length)",
    category: "Hair Colour",
    durationMinutes: 120,
    price: 3500.0,
    description: "Hand-painted sun-kissed balayage dimension for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_046",
    name: "Hair Highlights \u2013 Balayage (Long Length)",
    category: "Hair Colour",
    durationMinutes: 150,
    price: 4300.0,
    description: "Seamless multi-dimensional balayage transformation for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_047",
    name: "Gel Polish with Express Manicure (Both Hands)",
    category: "Nails",
    durationMinutes: 45,
    price: 499.0,
    description: "Chip-resistant UV/LED gel polish with express manicure cuticle cleanup.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_048",
    name: "Special Gel Application (Cat Eye / Marble / Chrome / French)",
    category: "Nails",
    durationMinutes: 60,
    price: 1500.0,
    description: "Artistic luxury gel finish (Cat Eye, Marble, Chrome reflection, or French tips).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_049",
    name: "Acrylic Nail Extension (Both Hands with Gel Polish)",
    category: "Nails",
    durationMinutes: 90,
    price: 2500.0,
    description: "Durable acrylic sculpted extensions with gel polish on hands.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_050",
    name: "Acrylic Nail Extension (Both Legs with Gel Polish)",
    category: "Nails",
    durationMinutes: 90,
    price: 2500.0,
    description: "Toenail acrylic restoration and extension with lustrous gel polish.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_051",
    name: "Acrylic Refilling",
    category: "Nails",
    durationMinutes: 60,
    price: 1499.0,
    description: "Regrowth balance and reinforcement infill for acrylic extensions.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_052",
    name: "Gel Extension Removal",
    category: "Nails",
    durationMinutes: 30,
    price: 600.0,
    description: "Safe acetone soak-off and nail conditioning removal for extensions.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_053",
    name: "Gel Polish Removal",
    category: "Nails",
    durationMinutes: 20,
    price: 300.0,
    description: "Gentle drill-free soak-off removal of UV gel polish.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_054",
    name: "Fake Nail Extension (Both Hands with Gel Polish)",
    category: "Nails",
    durationMinutes: 60,
    price: 1500.0,
    description: "Full-cover press extensions finished with professional gel polish.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_055",
    name: "Basic Clean-Up",
    category: "Skin & Spa",
    durationMinutes: 30,
    price: 400.0,
    description: "Deep pore cleansing, exfoliation, steam, and soothing pack.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_056",
    name: "Advance Clean-Up",
    category: "Skin & Spa",
    durationMinutes: 45,
    price: 800.0,
    description: "Advanced blackhead extraction, ultrasonic scrubbing, and botanical pack.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_057",
    name: "Peel-Off Mask",
    category: "Skin & Spa",
    durationMinutes: 20,
    price: 400.0,
    description: "Detoxifying and pore-tightening peel-off skin mask.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_058",
    name: "Face D-Tan",
    category: "Skin & Spa",
    durationMinutes: 25,
    price: 400.0,
    description: "Instant sun tan reversal and radiance boost for face.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_059",
    name: "Neck D-Tan",
    category: "Skin & Spa",
    durationMinutes: 15,
    price: 200.0,
    description: "Even-toned brightening tan removal for neck.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_060",
    name: "Underarms D-Tan",
    category: "Skin & Spa",
    durationMinutes: 15,
    price: 199.0,
    description: "Underarm hyperpigmentation lightening and tan removal.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_061",
    name: "Full Arms D-Tan",
    category: "Skin & Spa",
    durationMinutes: 30,
    price: 599.0,
    description: "Intense anti-tan application for full arms.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_062",
    name: "Full Leg D-Tan",
    category: "Skin & Spa",
    durationMinutes: 40,
    price: 699.0,
    description: "Brightening anti-tan exfoliation for full legs.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_063",
    name: "Back D-Tan",
    category: "Skin & Spa",
    durationMinutes: 30,
    price: 500.0,
    description: "Sun spot and back tan clearance pack.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_064",
    name: "Full Body D-Tan",
    category: "Skin & Spa",
    durationMinutes: 90,
    price: 2500.0,
    description: "Complete head-to-toe body de-tanning and brightening ritual.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_065",
    name: "Eyebrow Threading",
    category: "Threading",
    durationMinutes: 10,
    price: 40.0,
    description: "Organic cotton thread eyebrow shaping.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_066",
    name: "Upper Lip Threading",
    category: "Threading",
    durationMinutes: 5,
    price: 20.0,
    description: "Quick precision upper lip hair removal.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_067",
    name: "Chin Threading",
    category: "Threading",
    durationMinutes: 5,
    price: 20.0,
    description: "Targeted chin hair threading.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_068",
    name: "Forehead Threading",
    category: "Threading",
    durationMinutes: 5,
    price: 20.0,
    description: "Forehead hair removal and hairline clean.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_069",
    name: "Full Face Threading",
    category: "Threading",
    durationMinutes: 30,
    price: 150.0,
    description: "Complete facial hair threading with aloe vera soothing finish.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_070",
    name: "Side Locks Threading",
    category: "Threading",
    durationMinutes: 10,
    price: 20.0,
    description: "Clean threading around side locks.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_071",
    name: "Cheek Threading",
    category: "Threading",
    durationMinutes: 10,
    price: 20.0,
    description: "Gentle peach fuzz removal on cheeks.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_072",
    name: "Lower Lip Threading",
    category: "Threading",
    durationMinutes: 5,
    price: 20.0,
    description: "Lower lip area threading.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_073",
    name: "Basic Manicure",
    category: "Nails",
    durationMinutes: 30,
    price: 350.0,
    description: "Soak, nail shaping, cuticle push, light massage, and polish.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_074",
    name: "Advance Manicure",
    category: "Nails",
    durationMinutes: 45,
    price: 600.0,
    description: "Aroma soak, dead cell scrub, masque, and deeply nourishing massage.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_075",
    name: "Manicure - Cut, File & Polish",
    category: "Nails",
    durationMinutes: 15,
    price: 150.0,
    description: "Quick fingernail trimming, buffing, and classic polish.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_076",
    name: "Basic Pedicure",
    category: "Nails",
    durationMinutes: 40,
    price: 450.0,
    description: "Foot soak, heel scrubbing, nail trimming, and moisturising.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_077",
    name: "Advance Pedicure",
    category: "Nails",
    durationMinutes: 55,
    price: 700.0,
    description: "Deluxe sea salt soak, callus peeling, rich pack, and leg massage.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_078",
    name: "Pedicure - Cut, File & Polish",
    category: "Nails",
    durationMinutes: 15,
    price: 150.0,
    description: "Toenail clipping, shaping, and fresh polish coat.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_079",
    name: "Hair Spa - Smoothing (Medium Length)",
    category: "Hair Spa",
    durationMinutes: 60,
    price: 750.0,
    description: "Intense smoothing spa cream with steam for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_080",
    name: "Hair Spa - Smoothing (Long Length)",
    category: "Hair Spa",
    durationMinutes: 75,
    price: 850.0,
    description: "Intense smoothing spa cream with steam for long hair.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_081",
    name: "Hair Spa - Repairing (Medium Length)",
    category: "Hair Spa",
    durationMinutes: 60,
    price: 750.0,
    description: "Deep keratin repair infusion for damaged medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_082",
    name: "Hair Spa - Repairing (Long Length)",
    category: "Hair Spa",
    durationMinutes: 75,
    price: 850.0,
    description: "Deep keratin repair infusion for damaged long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_083",
    name: "Hair Spa - Dandruff Treatment (Medium Length)",
    category: "Hair Spa",
    durationMinutes: 60,
    price: 750.0,
    description: "Anti-dandruff clarifying scalp treatment for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_084",
    name: "Hair Spa - Dandruff Treatment (Long Length)",
    category: "Hair Spa",
    durationMinutes: 75,
    price: 850.0,
    description: "Anti-dandruff clarifying scalp treatment for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_085",
    name: "Hair Spa - Massage Cream Treatment",
    category: "Hair Spa",
    durationMinutes: 45,
    price: 600.0,
    description: "Deep conditioning scalp and strand massage cream therapy.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_086",
    name: "Hair Straightening (Medium Length)",
    category: "Hair",
    durationMinutes: 180,
    price: 5000.0,
    description: "Permanent thermal straight rebonding for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_087",
    name: "Hair Straightening (Long Length)",
    category: "Hair",
    durationMinutes: 210,
    price: 6500.0,
    description: "Permanent thermal straight rebonding for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_088",
    name: "Hair Smoothing (Medium Length)",
    category: "Hair",
    durationMinutes: 150,
    price: 5000.0,
    description: "Silk protein smoothing treatment for medium length hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_089",
    name: "Hair Smoothing (Long Length)",
    category: "Hair",
    durationMinutes: 180,
    price: 6500.0,
    description: "Silk protein smoothing treatment for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_090",
    name: "Hair Rebounding (Medium Length)",
    category: "Hair",
    durationMinutes: 180,
    price: 4000.0,
    description: "Glass hair rebonding straightening for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_091",
    name: "Keratin Treatment (Medium Length)",
    category: "Hair",
    durationMinutes: 150,
    price: 6500.0,
    description: "Frizz-eliminating organic keratin infusion for medium hair.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_092",
    name: "Keratin Treatment (Long Length)",
    category: "Hair",
    durationMinutes: 180,
    price: 7000.0,
    description: "Frizz-eliminating organic keratin infusion for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_093",
    name: "Oil Massage with Steam \u2013 Men (15 Mins)",
    category: "Massage",
    durationMinutes: 15,
    price: 150.0,
    description: "Herbal hot oil scalp acupressure massage with steam for men.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_094",
    name: "Oil Massage with Steam \u2013 Men (25 Mins)",
    category: "Massage",
    durationMinutes: 25,
    price: 200.0,
    description: "Extended hot oil stress-relief massage with steam for men.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_095",
    name: "Oil Massage with Steam \u2013 Ladies (25 Mins)",
    category: "Massage",
    durationMinutes: 25,
    price: 250.0,
    description: "Warm Ayurvedic oil massage with rejuvenating steam for women.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_096",
    name: "Oil Massage with Steam \u2013 Ladies (35 Mins)",
    category: "Massage",
    durationMinutes: 35,
    price: 400.0,
    description: "Deep tension release hair and shoulder oil massage with steam.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_097",
    name: "Oil Massage with Steam \u2013 Ladies (50 Mins)",
    category: "Massage",
    durationMinutes: 50,
    price: 500.0,
    description: "Royal botanical head, neck, and back oil massage with aromatic steam.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_098",
    name: "Hair Smoothing Spa (Express)",
    category: "Hair Spa",
    durationMinutes: 35,
    price: 349.0,
    description: "Express smoothing nourishment treatment.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_099",
    name: "Hair Repairing Spa (Express)",
    category: "Hair Spa",
    durationMinutes: 35,
    price: 349.0,
    description: "Express damage repair conditioner pack.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_100",
    name: "Dandruff Treatment Spa (Express)",
    category: "Hair Spa",
    durationMinutes: 35,
    price: 349.0,
    description: "Express anti-flake scalp treatment.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_101",
    name: "Massage Cream Treatment (Express)",
    category: "Hair Spa",
    durationMinutes: 30,
    price: 300.0,
    description: "Express scalp massage cream therapy.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_102",
    name: "Hair Smoothing (Express) - Medium Length",
    category: "Hair",
    durationMinutes: 90,
    price: 1500.0,
    description: "Express semi-permanent smoothing for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_103",
    name: "Hair Smoothing (Express) - Long Length",
    category: "Hair",
    durationMinutes: 120,
    price: 2500.0,
    description: "Express semi-permanent smoothing for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_104",
    name: "Hair Straightening (Express) - Medium Length",
    category: "Hair",
    durationMinutes: 90,
    price: 1500.0,
    description: "Express thermal straightening for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_105",
    name: "Hair Straightening (Express) - Long Length",
    category: "Hair",
    durationMinutes: 120,
    price: 2500.0,
    description: "Express thermal straightening for long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_106",
    name: "Gold Facial",
    category: "Facial",
    durationMinutes: 60,
    price: 1450.0,
    description: "Luminous 24K gold foil infused glowing facial for special occasions.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_107",
    name: "Brightening Facial",
    category: "Facial",
    durationMinutes: 60,
    price: 1400.0,
    description: "High-potency vitamin radiant brightening treatment.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_108",
    name: "Pearl Facial",
    category: "Facial",
    durationMinutes: 60,
    price: 1400.0,
    description: "Natural pearl ash cooling pack for fair, supple complexion.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_109",
    name: "Diamond Facial",
    category: "Facial",
    durationMinutes: 60,
    price: 1400.0,
    description: "Sparkling diamond dust micro-dermabrasion for crystal clarity.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_110",
    name: "Chocolate Mint Facial",
    category: "Facial",
    durationMinutes: 75,
    price: 2300.0,
    description: "Rich antioxidant cocoa butter and peppermint cooling facial.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_111",
    name: "Tangerine Whitening Facial (Kanpeki)",
    category: "Facial",
    durationMinutes: 75,
    price: 2200.0,
    description: "Kanpeki Japanese professional bio-extract tangerine glow therapy.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_112",
    name: "Pro Merge Facial (Kanpeki)",
    category: "Facial",
    durationMinutes: 75,
    price: 2100.0,
    description: "Kanpeki clinical cellular repair and barrier strengthening.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_113",
    name: "Lotus Bridal Glow Facial",
    category: "Facial",
    durationMinutes: 90,
    price: 2600.0,
    description: "Ultra-luxe bridal brightening ritual with pure lotus nectar.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_114",
    name: "Lotus Bridal Brightening Facial",
    category: "Facial",
    durationMinutes: 90,
    price: 2500.0,
    description: "Pre-wedding radiance facial restoring suppleness and glow.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_115",
    name: "Lotus Bridal Whitening Facial",
    category: "Facial",
    durationMinutes: 90,
    price: 2400.0,
    description: "Targeted de-pigmenting bridal treatment for porcelain finish.",
    popular: true,
    imageUrl: "",
  },
  {
    id: "srv_olg_116",
    name: "Gold Moroccan Vitamin C Facial",
    category: "Facial",
    durationMinutes: 90,
    price: 2800.0,
    description: "Moroccan Argan and 20% Vitamin C elixir anti-aging luxury ritual.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_117",
    name: "Shampoo, Conditioner & Blast Dry",
    category: "Hair",
    durationMinutes: 25,
    price: 300.0,
    description: "Luxury salon hair wash with blow blast drying.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_118",
    name: "Basic Blow Dry (Straight Finish with Wash)",
    category: "Hair",
    durationMinutes: 35,
    price: 350.0,
    description: "Clarifying shampoo, condition, and straight paddle blow dry.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_119",
    name: "Tongs & Ironing Hair Style",
    category: "Hair",
    durationMinutes: 40,
    price: 500.0,
    description: "Heat styling with curling tongs or flat iron smoothing.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_120",
    name: "Advance Blow Dry \u2013 Curls (Without Wash) - Medium Length",
    category: "Hair",
    durationMinutes: 35,
    price: 500.0,
    description: "Bouncy textured curl blow dry on dry medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_121",
    name: "Advance Blow Dry \u2013 Curls (Without Wash) - Long Length",
    category: "Hair",
    durationMinutes: 45,
    price: 700.0,
    description: "Voluminous curl styling on dry long hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_122",
    name: "Advance Blow Dry \u2013 Curls (With Wash) - Medium Length",
    category: "Hair",
    durationMinutes: 50,
    price: 700.0,
    description: "Includes refreshing wash, conditioning, and sculpted round-brush curls (medium).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_123",
    name: "Advance Blow Dry \u2013 Curls (With Wash) - Long Length",
    category: "Hair",
    durationMinutes: 60,
    price: 900.0,
    description: "Includes refreshing wash, conditioning, and sculpted round-brush curls (long).",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_124",
    name: "Temporary Ironing (With Wash) - Medium Length",
    category: "Hair",
    durationMinutes: 60,
    price: 1000.0,
    description: "Shampoo wash followed by sleek thermal ceramic flat ironing for medium hair.",
    popular: false,
    imageUrl: "",
  },
  {
    id: "srv_olg_125",
    name: "Temporary Ironing (With Wash) - Long Length",
    category: "Hair",
    durationMinutes: 75,
    price: 1500.0,
    description: "Shampoo wash followed by silky thermal flat ironing for long hair.",
    popular: false,
    imageUrl: "",
  },
];


export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [];

export const INITIAL_FOLLOW_UPS: FollowUpCampaign[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: "SALON_MANAGER" | "SALON_RECEPTIONIST" | "owner" | "manager" | "receptionist" | "admin";
  avatar: string;
  roleTitle: string;
  salonBranch: string;
}

export const DEMO_PERSONAS: UserPersona[] = [
  {
    id: "usr_manager",
    name: "Kavita Rao",
    email: "manager@Ruvexi.io",
    role: "SALON_MANAGER",
    avatar: "KR",
    roleTitle: "Salon Manager",
    salonBranch: "Flagship Studio",
  },
  {
    id: "usr_receptionist",
    name: "Ananya Sen",
    email: "reception@Ruvexi.io",
    role: "SALON_RECEPTIONIST",
    avatar: "AS",
    roleTitle: "Salon Receptionist",
    salonBranch: "Flagship Studio",
  },
];
