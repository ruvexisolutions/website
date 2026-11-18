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

export const INITIAL_SERVICES: ServiceItem[] = [];


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

export const DEMO_PERSONAS: UserPersona[] = [];
