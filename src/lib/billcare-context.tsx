"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { billcareApi } from "./api-client";
import { DEMO_PERSONAS } from "./demo-data";
import { getRoleConfig } from "./role-permissions";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import {
  signUpWithSupabase,
  signInWithSupabasePassword,
  signOutWithSupabase,
  mapSupabaseUserToBillCare,
} from "./supabase/auth";

// ============================================================================
// Types & Data Contracts (Modeled on Salonist.io architecture)
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SALON_MANAGER" | "SALON_RECEPTIONIST" | "owner" | "manager" | "receptionist" | "admin" | string;
  salonId: string;
  avatar?: string;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  branch: string;
  city: string;
  currency: string;
  chairs: number;
  category: string;
  logoUrl?: string;
  logo?: string;
  bannerPreset?: string;
  bannerUrl?: string;
  bannerGradient?: string;
  accentColor?: string;
  tagline?: string;
  badges?: string[];
  gstin: string;
  autoGst: boolean;
  phone: string;
  email: string;
  address: string;
  timing: string;
  rating?: number;
  reviewCount?: number;
  [key: string]: any;
}

export interface Customer {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  gender: any;
  birthday?: string;
  totalVisits: number;
  visitsCount: number;
  totalSpend: number;
  totalSpent: number;
  loyaltyPoints: number;
  walletBalance?: number;
  lastVisitDate: string;
  tags: string[];
  notes?: string;
  lastService?: string;
  preferredStaff?: string;
  vipTier?: string;
  formulaNotes?: string;
  patchTestStatus?: string;
  patchTestDate?: string;
  allergies?: string;
  rebookingCadenceDays?: number;
  createdAt: string;
  [key: string]: any;
}

export interface Service {
  id: string;
  salonId: string;
  category: any;
  name: string;
  durationMinutes: number;
  bufferMinutes?: number;
  price: number;
  description: string;
  materialUsed?: string;
  materialItemId?: string;
  materialQuantity?: number;
  materialUnit?: string;
  averageMaterialUsed?: string;
  isOnlineBookable?: boolean;
  isActive?: boolean;
  popular?: boolean;
  [key: string]: any;
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  commissionRate: number; // e.g., 15 for 15%
  isClockedIn: boolean;
  clockedInAt?: string;
  todayEarnings: number;
  totalServicesCompleted: number;
  isActive: boolean;
  avatar?: string;
  specialty?: string[];
  status?: "clocked_in" | "on_break" | "clocked_out";
  clockInTime?: string;
  todayRevenue?: number;
  todayCommission?: number;
  todayServicesCount?: number;
  rating?: number;
  [key: string]: any;
}

export interface InventoryItem {
  id: string;
  salonId: string;
  name: string;
  category: any;
  sku: string;
  currentStock: number;
  minThreshold: number;
  costPrice: number;
  sellingPrice?: number;
  retailPrice?: number;
  brand?: string;
  usageType?: string;
  unit: string;
  supplier?: string;
  lastRestocked: string;
  [key: string]: any;
}

export interface Appointment {
  id: string;
  salonId: string;
  branchId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  time: string; // formatted time e.g. "11:00 AM"
  durationMinutes: number;
  price: number;
  status: any;
  source?: string;
  notes?: string;
  createdAt: string;
  servicesList?: { name: string; price: number; durationMinutes?: number; staffName?: string }[];
  buzzedAt?: string;
}

export interface CashRegisterShift {
  id: string;
  salonId: string;
  openedByUserId?: string;
  openedByName?: string;
  closedByUserId?: string;
  closedByName?: string;
  openingFloat: number;
  expectedCash: number;
  countedCash?: number;
  cashVariance?: number;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  name: string;
  type: "service" | "product" | string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  total?: number;
  staffId?: string;
  staffName?: string;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  salonId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  staffId?: string;
  staffName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  discount?: number;
  taxPercent: number;
  cgst: number;
  sgst: number;
  taxAmount: number;
  gstAmount?: number;
  grandTotal: number;
  total: number;
  paymentMethod: "UPI" | "Card" | "Cash" | "Split";
  paymentBreakdown?: { cash?: number; upi?: number; card?: number };
  splitDetails?: { cash?: number; upi?: number; card?: number };
  status: "paid" | "draft" | "refunded";
  notes?: string;
  createdAt: string;
  date: string;
  [key: string]: any;
}

export interface FollowUp {
  id: string;
  salonId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  triggerReason: string;
  suggestedMessage: string;
  status: any;
  dueDate: string;
  createdAt: string;
  campaignType?: any;
  scheduledFor?: string;
  serviceTrigger?: string;
  discountOffer?: string;
  [key: string]: any;
}

export interface ToastNotification {
  id: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

export type TabType =
  | "frontdesk"
  | "owner"
  | "overview"
  | "calendar"
  | "pos"
  | "customers"
  | "services"
  | "staff"
  | "inventory"
  | "followups"
  | "reports"
  | "booking"
  | "settings";

// ============================================================================
// Context Interface
// ============================================================================

interface BillCareContextType {
  // Auth & Session
  user: User | null;
  salon: Salon;
  isAuthenticated: boolean;
  isBackendConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    userData: { name: string; email: string; phone: string; password?: string },
    salonData: { name: string; city: string; category: string; chairs: number; currency?: string; gstin?: string }
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  logout: () => void;
  updateSalon: (data: Partial<Salon>) => void;
  updateUser: (data: Partial<User>) => void;
  setSession: (user: User, salon: Salon, token?: string) => void;

  // Real Data Collections
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  invoices: Invoice[];
  followUps: FollowUp[];

  // CRUD Operations
  addCustomer: (data: any) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addService: (data: any) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addStaff: (data: any) => Staff;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  toggleClockInOut: (staffId: string) => void;

  addInventoryItem: (data: any) => InventoryItem;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  adjustStock: (id: string, change: number, reason?: string) => void;
  deleteInventoryItem: (id: string) => void;

  addAppointment: (data: any) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  deleteAppointment: (id: string) => void;

  createInvoice: (data: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    staffId?: string;
    staffName?: string;
    items: InvoiceItem[];
    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    discount?: number;
    taxPercent?: number;
    cgst?: number;
    sgst?: number;
    taxAmount?: number;
    gstAmount?: number;
    grandTotal?: number;
    total?: number;
    paymentMethod: "UPI" | "Card" | "Cash" | "Split" | "Wallet" | string;
    paymentBreakdown?: { cash?: number; upi?: number; card?: number; wallet?: number };
    splitDetails?: { cash?: number; upi?: number; card?: number; wallet?: number };
    notes?: string;
    [key: string]: any;
  }) => Invoice;

  topUpCustomerWallet: (customerId: string, amount: number) => Promise<{ success: boolean; message?: string }>;
  sendWhatsAppBill: (invoice: Invoice) => Promise<{ success: boolean; message?: string }>;
  sendWhatsAppReminder: (appointment: Appointment) => Promise<{ success: boolean; message?: string }>;

  // Receptionist & Front Desk Features
  currentShift: CashRegisterShift | null;
  openRegisterShift: (openingFloat: number, notes?: string) => Promise<{ success: boolean; shift?: CashRegisterShift; message?: string }>;
  closeRegisterShift: (countedCash: number, notes?: string) => Promise<{ success: boolean; shift?: CashRegisterShift; message?: string }>;
  appendServiceToAppointment: (appointmentId: string, serviceItem: { name: string; price: number; durationMinutes?: number; staffName?: string }) => void;
  sendChairReadyWhatsApp: (appointment: Appointment) => Promise<{ success: boolean; message?: string }>;

  addFollowUp: (data: any) => FollowUp;
  markFollowUpSent: (id: string) => void;

  // Utilities & Compatibility
  toasts: ToastNotification[];
  toast?: string;
  showToast: (message: string, type?: ToastNotification["type"]) => void;
  removeToast: (id: string) => void;

  // Compatibility Bridges for existing views
  updateSalonProfile: (data: Partial<Salon>) => void;
  feedbacks: any[];
  addFeedback: (data: any) => void;
  bookAppointment: (data: any) => Appointment;
  sendFollowUp: (id: string) => void;
  createFollowUp: (data: any) => FollowUp;
  updateStock: (id: string, qty: number, reason?: string) => void;
  restockItem: (id: string, qty: number) => void;
  toggleStaffStatus: (staffId: string) => void;
  updateStaffCommission: (id: string, rate: number) => void;
  addStaffMember: (data: any) => Staff;
  resetDemoData: () => void;
  wipeAllData: () => void;
  currentPersona: { id: string; name: string; role: string; avatar: string; roleTitle: string };
  allPersonas: any[];
  switchPersona: (id: string) => void;
  loginAs: (role: string, name: string) => void;
}

const BillCareContext = createContext<BillCareContextType | null>(null);

// ============================================================================
// Default Starter Blueprint Data
// ============================================================================

const DEFAULT_SALON: Salon = {
  id: "sln_billcare_flagship",
  name: "BillCare Premier Atelier & Spa",
  slug: "billcare-atelier",
  branch: "Flagship Studio",
  city: "Mumbai & Bengaluru",
  currency: "₹",
  chairs: 8,
  category: "Luxury Hair Studio & Aesthetic Spa",
  logoUrl: "/images/billcare-logo.png",
  logo: "/images/billcare-logo.png",
  bannerPreset: "discord-blurple",
  bannerUrl: "",
  bannerGradient: "linear-gradient(135deg, #1e1f38 0%, #5865F2 45%, #7289da 70%, #eb459e 100%)",
  accentColor: "#FACC15",
  tagline: "Bespoke Hair Sculpting, Organic Keratin Therapy & Aesthetic Skin Wellness",
  badges: ["👑 Official Flagship", "✨ Verified Atelier", "💎 Boost Level 3"],
  gstin: "27AABCB1234F1Z8",
  autoGst: true,
  phone: "+91 98450 11223",
  email: "hello@billcare.io",
  address: "Suite 401, Crescent Galleria, Indiranagar, Bengaluru",
  timing: "10:00 AM - 09:30 PM (All Days)",
  rating: 4.95,
  reviewCount: 428,
  upiId: "billcare.pos@icici",
  bankAccountName: "BillCare Premier Atelier & Spa",
  bankAccountNumber: "50200088991122",
  bankIfsc: "HDFC0001043",
  bankName: "HDFC Bank (Indiranagar Branch)",
};

const DEFAULT_USER: User = {
  id: "usr_billcare_owner",
  name: "Sunil Kumar",
  email: "owner@billcare.io",
  phone: "+91 98450 11223",
  role: "owner",
  salonId: "sln_billcare_flagship",
};

const INITIAL_SERVICES: Service[] = [];

const INITIAL_STAFF: Staff[] = [];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [];

const INITIAL_APPOINTMENTS: Appointment[] = [];

const INITIAL_INVOICES: Invoice[] = [];

const INITIAL_FOLLOWUPS: FollowUp[] = [];

const INITIAL_FEEDBACKS: any[] = [];

// ============================================================================
// BillCare Provider Component
// ============================================================================

export function BillCareProvider({ children }: { children: React.ReactNode }) {
  // Persistence state
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<Salon>(DEFAULT_SALON);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);
  const [feedbacks, setFeedbacks] = useState<any[]>(INITIAL_FEEDBACKS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [currentShift, setCurrentShift] = useState<CashRegisterShift | null>(null);

  // Helper to persist data to localStorage
  const persist = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to storage`, e);
    }
  };

  // Load from localStorage first, then sync directly from the FastAPI backend database
  useEffect(() => {
    try {
      // Clean slate migration: purge previous demo cache and remove old bypass auth tokens
      if (typeof window !== "undefined" && !localStorage.getItem("billcare_auth_strict_2026_v2")) {
        localStorage.removeItem("billcare_user");
        localStorage.removeItem("billcare_token");
        localStorage.removeItem("billcare_customers");
        localStorage.removeItem("billcare_services");
        localStorage.removeItem("billcare_staff");
        localStorage.removeItem("billcare_inventory");
        localStorage.removeItem("billcare_appointments");
        localStorage.removeItem("billcare_invoices");
        localStorage.removeItem("billcare_followups");
        localStorage.removeItem("billcare_feedbacks");
        localStorage.setItem("billcare_auth_strict_2026_v2", "true");
      }

      const storedUser = localStorage.getItem("billcare_user");
      const storedToken = localStorage.getItem("billcare_token");
      const storedSalon = localStorage.getItem("billcare_salon");
      const storedCustomers = localStorage.getItem("billcare_customers");
      const storedServices = localStorage.getItem("billcare_services");
      const storedStaff = localStorage.getItem("billcare_staff");
      const storedInventory = localStorage.getItem("billcare_inventory");
      const storedAppointments = localStorage.getItem("billcare_appointments");
      const storedInvoices = localStorage.getItem("billcare_invoices");
      const storedFollowups = localStorage.getItem("billcare_followups");
      const storedFeedbacks = localStorage.getItem("billcare_feedbacks");
      const storedShift = localStorage.getItem("billcare_current_shift");
      if (storedShift) {
        try {
          setCurrentShift(JSON.parse(storedShift));
        } catch {}
      }

      // Only authenticate if both user and valid session token exist
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("billcare_user");
          localStorage.removeItem("billcare_token");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      if (storedSalon) setSalon(JSON.parse(storedSalon));
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      if (storedServices) setServices(JSON.parse(storedServices));
      if (storedStaff) setStaff(JSON.parse(storedStaff));
      if (storedInventory) setInventory(JSON.parse(storedInventory));
      if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
      if (storedFollowups) setFollowUps(JSON.parse(storedFollowups));
      if (storedFeedbacks) setFeedbacks(JSON.parse(storedFeedbacks));
    } catch (e) {
      console.warn("BillCare: Storage hydration warning", e);
    }

    // Hydrate from active Supabase Session if available
    if (typeof window !== "undefined" && isSupabaseConfigured()) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const mapped = mapSupabaseUserToBillCare(session.user, session);
          setUser(mapped.user);
          persist("billcare_user", mapped.user);
          if (mapped.token) persist("billcare_token", mapped.token);
        }
      }).catch((e) => console.warn("Supabase session check:", e));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const mapped = mapSupabaseUserToBillCare(session.user, session);
          setUser(mapped.user);
          persist("billcare_user", mapped.user);
          if (mapped.token) persist("billcare_token", mapped.token);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          try {
            localStorage.removeItem("billcare_user");
            localStorage.removeItem("billcare_token");
          } catch { }
        }
      });
    }

    // Connect and synchronize from live backend database
    billcareApi
      .getBootstrap()
      .then((data) => {
        if (!data) return;
        setIsBackendConnected(true);

        if (data.salon) {
          setSalon(data.salon);
          persist("billcare_salon", data.salon);
        }
        if (Array.isArray(data.customers)) {
          setCustomers(data.customers);
          persist("billcare_customers", data.customers);
        }
        if (Array.isArray(data.services)) {
          setServices(data.services);
          persist("billcare_services", data.services);
        }
        if (Array.isArray(data.staff)) {
          setStaff(data.staff);
          persist("billcare_staff", data.staff);
        }
        if (Array.isArray(data.inventory)) {
          setInventory(data.inventory);
          persist("billcare_inventory", data.inventory);
        }
        if (Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
          persist("billcare_appointments", data.appointments);
        }
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
          persist("billcare_invoices", data.invoices);
        }
        if (Array.isArray(data.followUps)) {
          setFollowUps(data.followUps);
          persist("billcare_followups", data.followUps);
        }
        if (Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
          persist("billcare_feedbacks", data.feedbacks);
        }
      })
      .catch((err) => {
        console.info("BillCare: Connected via offline cached data:", err.message);
      });

    billcareApi
      .getCurrentShift()
      .then((data) => {
        if (data && data.hasOpenShift && data.shift) {
          setCurrentShift(data.shift);
          persist("billcare_current_shift", data.shift);
        }
      })
      .catch(() => {});
  }, []);

  // Toast Notification handler
  const showToast = (message: string, type: ToastNotification["type"] = "success") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --------------------------------------------------------------------------
  // Authentication Actions (Supabase Complete Auth)
  // --------------------------------------------------------------------------
  const login = async (email: string, password: string = "") => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: "Please enter your work email address." };
    }
    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    try {
      // 1. Prioritize Supabase Auth
      if (isSupabaseConfigured()) {
        const supaRes = await signInWithSupabasePassword(normalizedEmail, password);
        if (supaRes.success && supaRes.user) {
          setUser(supaRes.user);
          persist("billcare_user", supaRes.user);
          if (supaRes.token) {
            persist("billcare_token", supaRes.token);
          }
          if (supaRes.salon) {
            setSalon((prev) => ({ ...prev, ...supaRes.salon }));
            persist("billcare_salon", { ...salon, ...supaRes.salon });
          }
          showToast(`Welcome back to BillCare, ${supaRes.user.name}!`);
          return { success: true };
        }
        if (supaRes.error) {
          return { success: false, error: supaRes.error };
        }
      }

      // 2. Standalone API fallback
      const res = await billcareApi.login({ email: normalizedEmail, password });
      if (res && res.user) {
        setUser(res.user);
        persist("billcare_user", res.user);
        if (res.token) {
          persist("billcare_token", res.token);
        }
        if (res.salon) {
          setSalon(res.salon);
          persist("billcare_salon", res.salon);
        }
        showToast(`Welcome back to BillCare, ${res.user.name}!`);
        return { success: true };
      }
      return { success: false, error: "Authentication failed. Please verify credentials." };
    } catch (err: any) {
      console.warn("Auth failed:", err.message);
      return { success: false, error: err.message || "Invalid email or password." };
    }
  };

  const signup = async (
    userData: { name: string; email: string; phone: string; password?: string },
    salonData: { name: string; city: string; category: string; chairs: number; currency?: string; gstin?: string }
  ) => {
    if (!userData.name || !userData.email || !salonData.name) {
      return { success: false, error: "Please fill in all required fields." };
    }
    if (!userData.password || userData.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    try {
      // 1. Supabase Auth signup
      if (isSupabaseConfigured()) {
        const supaRes = await signUpWithSupabase({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          salonName: salonData.name,
          city: salonData.city,
          category: salonData.category,
          chairs: salonData.chairs,
        });

        if (supaRes.requiresEmailVerification) {
          return { success: true, requiresEmailVerification: true };
        }

        if (supaRes.success && supaRes.user) {
          setUser(supaRes.user);
          persist("billcare_user", supaRes.user);
          if (supaRes.salon) {
            setSalon((prev) => ({ ...prev, ...supaRes.salon }));
            persist("billcare_salon", { ...salon, ...supaRes.salon });
          }
          if (supaRes.token) {
            persist("billcare_token", supaRes.token);
          }
          showToast(`Welcome to BillCare! Your workspace for "${salonData.name}" is ready.`);
          return { success: true };
        }

        if (supaRes.error) {
          return { success: false, error: supaRes.error };
        }
      }

      // 2. Standalone API fallback
      const res = await billcareApi.signup({
        user: userData,
        salon: salonData,
      });
      if (res && res.user && res.salon) {
        setUser(res.user);
        setSalon(res.salon);
        persist("billcare_user", res.user);
        persist("billcare_salon", res.salon);
        if (res.token) {
          persist("billcare_token", res.token);
        }
        showToast(`Welcome to BillCare! Your workspace for "${res.salon.name}" is ready.`);
        return { success: true };
      }
      return { success: false, error: "Failed to create salon account." };
    } catch (err: any) {
      console.warn("Signup failed:", err.message);
      return { success: false, error: err.message || "Failed to create salon account." };
    }
  };

  const logout = () => {
    setUser(null);
    signOutWithSupabase().catch(() => { });
    try {
      localStorage.removeItem("billcare_user");
      localStorage.removeItem("billcare_token");
    } catch (e) { }
    showToast("Signed out successfully from BillCare.", "info");
  };

  const updateSalon = (data: Partial<Salon>) => {
    setSalon((prev) => {
      const updated = { ...prev, ...data };
      persist("billcare_salon", updated);
      return updated;
    });
    billcareApi.updateSalon(data).catch((err) => console.warn("Backend sync notice:", err.message));
    showToast("Salon settings updated successfully.");
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      persist("billcare_user", updated);
      return updated;
    });
    showToast("Profile credentials updated.");
  };

  const setSession = (newUser: User, newSalon: Salon, token?: string) => {
    setUser(newUser);
    setSalon(newSalon);
    persist("billcare_user", newUser);
    persist("billcare_salon", newSalon);
    if (token && typeof window !== "undefined") {
      localStorage.setItem("billcare_token", token);
    }
  };

  const switchPersona = (_personaId: string) => {
    console.warn("Security Alert: Client-side role switching is permanently disabled in production. Authentication must be verified via backend JWT.");
  };

  const loginAs = (_role: string, _name?: string) => {
    console.warn("Security Alert: Client-side loginAs is permanently disabled in production. Please sign in via /login.");
  };

  // --------------------------------------------------------------------------
  // Customer CRUD
  // --------------------------------------------------------------------------
  const addCustomer = (data: any): Customer => {
    const newCustomer: Customer = {
      id: "cst_" + Date.now(),
      salonId: salon.id,
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      gender: data.gender || "female",
      tags: data.tags || [],
      totalVisits: 0,
      visitsCount: 0,
      totalSpend: 0,
      totalSpent: 0,
      loyaltyPoints: 50,
      lastVisitDate: new Date().toISOString().split("T")[0],
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      ...data,
    };

    setCustomers((prev) => {
      const updated = [newCustomer, ...prev];
      persist("billcare_customers", updated);
      return updated;
    });

    billcareApi.createCustomer(newCustomer).catch((err) => console.warn("Sync notice createCustomer:", err.message));
    showToast(`Added customer ${newCustomer.name} to CRM`);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      persist("billcare_customers", updated);
      return updated;
    });
    billcareApi.updateCustomer(id, data).catch((err) => console.warn("Sync notice updateCustomer:", err.message));
    showToast("Customer record updated.");
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persist("billcare_customers", updated);
      return updated;
    });
    billcareApi.deleteCustomer(id).catch((err) => console.warn("Sync notice deleteCustomer:", err.message));
    showToast("Customer profile deleted from database.", "info");
  };

  // --------------------------------------------------------------------------
  // Service CRUD
  // --------------------------------------------------------------------------
  const addService = (data: any): Service => {
    const newService: Service = {
      id: "srv_" + Date.now(),
      salonId: salon.id,
      name: data.name,
      category: data.category || "General",
      durationMinutes: data.durationMinutes || 45,
      bufferMinutes: data.bufferMinutes ?? 5,
      price: data.price || 0,
      description: data.description || "",
      isOnlineBookable: data.isOnlineBookable ?? true,
      isActive: data.isActive ?? true,
      ...data,
    };
    setServices((prev) => {
      const updated = [...prev, newService];
      persist("billcare_services", updated);
      return updated;
    });
    billcareApi.createService(newService).catch((err) => console.warn("Sync notice createService:", err.message));
    showToast(`Service "${newService.name}" published to menu.`);
    return newService;
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      persist("billcare_services", updated);
      return updated;
    });
    billcareApi.updateService(id, data).catch((err) => console.warn("Sync notice updateService:", err.message));
    showToast("Service details saved.");
  };

  const deleteService = (id: string) => {
    setServices((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persist("billcare_services", updated);
      return updated;
    });
    billcareApi.deleteService(id).catch((err) => console.warn("Sync notice deleteService:", err.message));
    showToast("Service archived from menu.", "info");
  };

  // --------------------------------------------------------------------------
  // Staff CRUD & Attendance
  // --------------------------------------------------------------------------
  const addStaff = (data: any): Staff => {
    const newStaff: Staff = {
      id: "stf_" + Date.now(),
      salonId: salon.id,
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      role: data.role || "Stylist",
      commissionRate: data.commissionRate || 15,
      isClockedIn: true,
      clockedInAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      todayEarnings: 0,
      todayCommission: 0,
      todayRevenue: 0,
      todayServicesCount: 0,
      totalServicesCompleted: 0,
      isActive: true,
      specialty: data.specialty || ["Hair Specialist"],
      status: "clocked_in",
      rating: 5,
      ...data,
    };
    setStaff((prev) => {
      const updated = [...prev, newStaff];
      persist("billcare_staff", updated);
      return updated;
    });
    billcareApi.createStaff(newStaff).catch((err) => console.warn("Sync notice createStaff:", err.message));
    showToast(`Added team member ${newStaff.name}`);
    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<Staff>) => {
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      persist("billcare_staff", updated);
      return updated;
    });
    billcareApi.updateStaff(id, data).catch((err) => console.warn("Sync notice updateStaff:", err.message));
    showToast("Staff profile updated.");
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persist("billcare_staff", updated);
      return updated;
    });
    billcareApi.deleteStaff(id).catch((err) => console.warn("Sync notice deleteStaff:", err.message));
    showToast("Staff member removed from roster.", "info");
  };

  const toggleClockInOut = (staffId: string) => {
    setStaff((prev) => {
      const updated = prev.map((s) => {
        if (s.id === staffId) {
          const nextState = !s.isClockedIn;
          showToast(
            `${s.name} clocked ${nextState ? "IN" : "OUT"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            nextState ? "success" : "info"
          );
          return {
            ...s,
            isClockedIn: nextState,
            clockedInAt: nextState
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return s;
      });
      persist("billcare_staff", updated);
      return updated;
    });
    billcareApi.toggleClock(staffId).catch((err) => console.warn("Sync notice toggleClock:", err.message));
  };

  // --------------------------------------------------------------------------
  // Inventory Management
  // --------------------------------------------------------------------------
  const addInventoryItem = (data: any): InventoryItem => {
    const newItem: InventoryItem = {
      id: "inv_" + Date.now(),
      salonId: salon.id,
      name: data.name,
      category: data.category || "General",
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      currentStock: data.currentStock || 0,
      minThreshold: data.minThreshold || 5,
      costPrice: data.costPrice || 0,
      sellingPrice: data.sellingPrice || data.retailPrice || Math.round((data.costPrice || 1000) * 1.5),
      unit: data.unit || "unit",
      supplier: data.supplier || "Official Distributor",
      lastRestocked: new Date().toISOString().split("T")[0],
      ...data,
    };
    setInventory((prev) => {
      const updated = [newItem, ...prev];
      persist("billcare_inventory", updated);
      return updated;
    });
    billcareApi.createInventory(newItem).catch((err) => console.warn("Sync notice createInventory:", err.message));
    showToast(`Added product "${newItem.name}" to inventory.`);
    return newItem;
  };

  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    setInventory((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      persist("billcare_inventory", updated);
      return updated;
    });
    billcareApi.updateInventory(id, data).catch((err) => console.warn("Sync notice updateInventory:", err.message));
    showToast("Inventory item updated.");
  };

  const adjustStock = (id: string, change: number, reason = "Stock Adjustment") => {
    setInventory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.currentStock + change);
          showToast(`Adjusted ${item.name} stock (${change > 0 ? "+" + change : change}) - ${reason}`);
          return { ...item, currentStock: newQty };
        }
        return item;
      });
      persist("billcare_inventory", updated);
      return updated;
    });
    billcareApi.adjustStock(id, change, reason).catch((err) => console.warn("Sync notice adjustStock:", err.message));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persist("billcare_inventory", updated);
      return updated;
    });
    billcareApi.deleteInventory(id).catch((err) => console.warn("Sync notice deleteInventory:", err.message));
    showToast("Product deleted from inventory.", "info");
  };

  // --------------------------------------------------------------------------
  // Appointments Management
  // --------------------------------------------------------------------------
  const addAppointment = (data: any): Appointment => {
    const newApt: Appointment = {
      id: "apt_" + Date.now(),
      salonId: salon.id,
      customerId: data.customerId || "cst_walkin",
      customerName: data.customerName || "Walk-in Guest",
      customerPhone: data.customerPhone || "",
      staffId: data.staffId || staff[0]?.id || "stf_1",
      staffName: data.staffName || staff[0]?.name || "Priya Sharma",
      serviceId: data.serviceId || services[0]?.id || "srv_1",
      serviceName: data.serviceName || services[0]?.name || "Haircut",
      date: data.date || new Date().toISOString().split("T")[0],
      startTime: data.startTime || data.time || "11:00",
      endTime: data.endTime || "11:45",
      time: data.time || data.startTime || "11:00 AM",
      durationMinutes: data.durationMinutes || 45,
      price: data.price || 1500,
      status: data.status || "confirmed",
      createdAt: new Date().toISOString(),
      ...data,
    };
    setAppointments((prev) => {
      const updated = [newApt, ...prev];
      persist("billcare_appointments", updated);
      return updated;
    });
    billcareApi.createAppointment(newApt).catch((err) => console.warn("Sync notice createAppointment:", err.message));
    showToast(`Booked appointment for ${newApt.customerName} at ${newApt.startTime}`);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status } : a));
      persist("billcare_appointments", updated);
      return updated;
    });
    billcareApi.updateAppointmentStatus(id, status).catch((err) => console.warn("Sync notice updateAppointmentStatus:", err.message));
    showToast(`Appointment status changed to "${status.toUpperCase()}"`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      persist("billcare_appointments", updated);
      return updated;
    });
    billcareApi.deleteAppointment(id).catch((err) => console.warn("Sync notice deleteAppointment:", err.message));
    showToast("Appointment removed.", "info");
  };

  // --------------------------------------------------------------------------
  // POS Checkout & Invoicing Engine
  // --------------------------------------------------------------------------
  const createInvoice = (data: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    staffId?: string;
    staffName?: string;
    items: InvoiceItem[];
    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    discount?: number;
    taxPercent?: number;
    cgst?: number;
    sgst?: number;
    taxAmount?: number;
    gstAmount?: number;
    grandTotal?: number;
    total?: number;
    paymentMethod: "UPI" | "Card" | "Cash" | "Split" | string;
    paymentBreakdown?: { cash?: number; upi?: number; card?: number };
    splitDetails?: { cash?: number; upi?: number; card?: number };
    notes?: string;
    [key: string]: any;
  }): Invoice => {
    const grandTotalVal = data.grandTotal ?? data.total ?? data.subtotal;
    const seq = 100 + invoices.length + 1;
    const invNumber = `BC-INV-${new Date().getFullYear()}-${seq.toString().padStart(4, "0")}`;

    const newInvoice: Invoice = {
      ...data,
      id: "inv_" + Date.now(),
      invoiceNumber: invNumber,
      salonId: salon.id,
      customerId: data.customerId || "cst_walkin",
      discountPercent: data.discountPercent ?? 0,
      discountAmount: data.discountAmount ?? data.discount ?? 0,
      discount: data.discount ?? data.discountAmount ?? 0,
      taxPercent: data.taxPercent ?? 5,
      cgst: data.cgst ?? Math.round((data.gstAmount ?? data.taxAmount ?? 0) / 2),
      sgst: data.sgst ?? Math.round((data.gstAmount ?? data.taxAmount ?? 0) / 2),
      taxAmount: data.taxAmount ?? data.gstAmount ?? 0,
      gstAmount: data.gstAmount ?? data.taxAmount ?? 0,
      grandTotal: grandTotalVal,
      total: grandTotalVal,
      paymentMethod: data.paymentMethod as any,
      status: "paid",
      createdAt: new Date().toISOString(),
      date: data.date || new Date().toISOString().split("T")[0],
    };

    // 1. Add to invoices
    setInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      persist("billcare_invoices", updated);
      return updated;
    });

    // 2. Transmit to backend database (FastAPI will update customer visits/spend & deduct product stock)
    billcareApi.createInvoice(newInvoice).catch((err) => console.warn("Sync notice createInvoice:", err.message));

    // 3. Optimistically update local customer metrics & prepaid wallet
    if (data.customerId) {
      setCustomers((prev) => {
        const isWallet = String(data.paymentMethod).toUpperCase() === "WALLET";
        const updated = prev.map((c) => {
          if (c.id === data.customerId) {
            const addedPoints = Math.round(grandTotalVal * 0.05);
            const currentWallet = c.walletBalance || 0;
            return {
              ...c,
              totalVisits: (c.totalVisits || 0) + 1,
              visitsCount: (c.visitsCount || c.totalVisits || 0) + 1,
              totalSpend: (c.totalSpend || 0) + grandTotalVal,
              totalSpent: (c.totalSpent || c.totalSpend || 0) + grandTotalVal,
              loyaltyPoints: (c.loyaltyPoints || 0) + addedPoints,
              walletBalance: isWallet ? Math.max(0, currentWallet - grandTotalVal) : currentWallet,
              lastVisitDate: new Date().toISOString().split("T")[0],
            };
          }
          return c;
        });
        persist("billcare_customers", updated);
        return updated;
      });
    }

    // 4. Auto-deduct inventory for retail products & service consumable materials
    data.items.forEach((item) => {
      // 4a. Retail product sale
      if (item.type === "product" && item.id) {
        setInventory((prev) => {
          const updated = prev.map((inv) =>
            inv.id === item.id
              ? { ...inv, currentStock: Math.max(0, inv.currentStock - item.quantity) }
              : inv
          );
          persist("billcare_inventory", updated);
          return updated;
        });
      }
      // 4b. Service consumable material deduction (Backbar stock monitor)
      else if (item.type !== "product") {
        const srv = services.find((s) => s.id === item.id || s.name === item.name);
        if (srv?.materialItemId) {
          const qty = Math.max(1, srv.materialQuantity || 1);
          setInventory((prev) => {
            const updated = prev.map((inv) =>
              inv.id === srv.materialItemId
                ? { ...inv, currentStock: Math.max(0, inv.currentStock - qty) }
                : inv
            );
            persist("billcare_inventory", updated);
            return updated;
          });
        }
      }
    });

    // 5. Credit staff commission
    if (data.staffId) {
      setStaff((prev) => {
        const updated = prev.map((st) => {
          if (st.id === data.staffId) {
            const comm = (data.subtotal * (st.commissionRate || 15)) / 100;
            return {
              ...st,
              todayEarnings: (st.todayEarnings || 0) + comm,
              totalServicesCompleted: (st.totalServicesCompleted || 0) + 1,
            };
          }
          return st;
        });
        persist("billcare_staff", updated);
        return updated;
      });
    }

    // 6. Update cash register shift expected cash if cash was received
    const cashPortion =
      String(data.paymentMethod).toUpperCase() === "CASH"
        ? grandTotalVal
        : Number(data.splitDetails?.cash || data.paymentBreakdown?.cash || 0);

    if (cashPortion > 0) {
      setCurrentShift((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          expectedCash: prev.expectedCash + cashPortion,
        };
        persist("billcare_current_shift", updated);
        return updated;
      });
    }

    showToast(`Invoice ${invNumber} generated for ${data.customerName}! Payment mode: ${data.paymentMethod}`);
    return newInvoice;
  };

  const topUpCustomerWallet = async (customerId: string, amount: number) => {
    setCustomers((prev) => {
      const updated = prev.map((c) =>
        c.id === customerId
          ? { ...c, walletBalance: (c.walletBalance || 0) + amount }
          : c
      );
      persist("billcare_customers", updated);
      return updated;
    });
    showToast(`Added ₹${amount.toLocaleString()} wallet credit!`, "success");
    billcareApi.request(`/customers/${customerId}/wallet`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }).catch((e: any) => console.warn("Wallet topup sync notice:", e.message));
    return { success: true };
  };

  const sendWhatsAppBill = async (inv: Invoice) => {
    const rawPhone = (inv.customerPhone || "").replace(/[^0-9]/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(
      `*BillCare Receipt - ${salon.name}*\n` +
      `Invoice: ${inv.invoiceNumber}\n` +
      `Customer: ${inv.customerName}\n` +
      `Total: ₹${(inv.grandTotal || inv.total || 0).toLocaleString()}\n` +
      `Payment: ${inv.paymentMethod}\n\n` +
      `Thank you for visiting ${salon.name}! Rate your experience: https://g.page/r/billcare/review`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
    showToast(`WhatsApp receipt link opened for ${inv.customerName}!`, "success");
    billcareApi.request("/whatsapp/send-bill", {
      method: "POST",
      body: JSON.stringify({
        to_phone: cleanPhone,
        customer_name: inv.customerName,
        invoice_number: inv.invoiceNumber,
        total_amount: inv.grandTotal || inv.total || 0,
        items: inv.items,
      }),
    }).catch(() => {});
    return { success: true };
  };

  const sendWhatsAppReminder = async (apt: Appointment) => {
    const rawPhone = (apt.customerPhone || "").replace(/[^0-9]/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(
      `*Appointment Reminder - ${salon.name}*\n` +
      `Hi ${apt.customerName}! Your appointment for *${apt.serviceName}* with stylist *${apt.staffName}* is scheduled for today at *${apt.time}*.\n\n` +
      `Address: ${salon.address}\n` +
      `Looking forward to seeing you!`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
    showToast(`WhatsApp reminder dispatched to ${apt.customerName}!`, "info");
    billcareApi.request("/whatsapp/send-reminder", {
      method: "POST",
      body: JSON.stringify({
        to_phone: cleanPhone,
        customer_name: apt.customerName,
        service_name: apt.serviceName,
        staff_name: apt.staffName,
        date_time: `${apt.date} at ${apt.time}`,
      }),
    }).catch(() => {});
    return { success: true };
  };

  const openRegisterShift = async (openingFloat: number, notes?: string) => {
    const newShift: CashRegisterShift = {
      id: "shift_" + Date.now(),
      salonId: salon.id,
      openedByName: user?.name || "Front Desk Receptionist",
      openingFloat,
      expectedCash: openingFloat,
      status: "open",
      openedAt: new Date().toISOString(),
      notes: notes || "Shift opened at Front Desk",
    };
    setCurrentShift(newShift);
    persist("billcare_current_shift", newShift);
    showToast(`Cash register opened with ₹${openingFloat.toLocaleString()} float!`, "success");
    billcareApi.openRegisterShift({ openingFloat, notes }).catch(() => {});
    return { success: true, shift: newShift };
  };

  const closeRegisterShift = async (countedCash: number, notes?: string) => {
    if (!currentShift) return { success: false, message: "No open register shift found" };
    const variance = Math.round((countedCash - currentShift.expectedCash) * 100) / 100;
    const closedShift: CashRegisterShift = {
      ...currentShift,
      countedCash,
      cashVariance: variance,
      status: "closed",
      closedAt: new Date().toISOString(),
      closedByName: user?.name || "Front Desk Receptionist",
      notes: notes || `Shift closed with variance of ₹${variance}`,
    };
    setCurrentShift(null);
    localStorage.removeItem("billcare_current_shift");
    showToast(`Register shift closed! Variance: ₹${variance}`, variance === 0 ? "success" : "warning");
    billcareApi.closeRegisterShift({ countedCash, notes }).catch(() => {});
    return { success: true, shift: closedShift };
  };

  const appendServiceToAppointment = (
    appointmentId: string,
    item: { name: string; price: number; durationMinutes?: number; staffName?: string }
  ) => {
    setAppointments((prev) => {
      const updated = prev.map((apt) => {
        if (apt.id === appointmentId) {
          const currentServices = apt.servicesList || [
            { name: apt.serviceName, price: apt.price, durationMinutes: apt.durationMinutes, staffName: apt.staffName },
          ];
          const newServices = [...currentServices, item];
          const combinedNames = newServices.map((s) => s.name).join(" + ");
          const combinedPrice = newServices.reduce((acc, s) => acc + (s.price || 0), 0);
          const combinedDuration = newServices.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);
          return {
            ...apt,
            serviceName: combinedNames,
            price: combinedPrice,
            durationMinutes: combinedDuration,
            servicesList: newServices,
          };
        }
        return apt;
      });
      persist("billcare_appointments", updated);
      return updated;
    });
    showToast(`Added "${item.name}" to in-chair visit!`, "success");
  };

  const sendChairReadyWhatsApp = async (apt: Appointment) => {
    const rawPhone = (apt.customerPhone || "").replace(/[^0-9]/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(
      `Hi ${apt.customerName}! ✨ Good news from ${salon.name}: Your chair with stylist ${apt.staffName} is now ready for your ${apt.serviceName} session.\n\nPlease head over to the styling floor. We're ready for you!`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === apt.id ? { ...a, buzzedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : a
      );
      persist("billcare_appointments", updated);
      return updated;
    });
    showToast(`Chair Ready buzz sent to ${apt.customerName}!`, "success");
    billcareApi
      .sendWhatsAppCampaign({
        campaignName: "Chair Ready Buzz",
        targetPhone: cleanPhone,
        message: text,
      })
      .catch(() => {});
    return { success: true };
  };

  // --------------------------------------------------------------------------
  // Marketing & Retention Follow-Ups
  // --------------------------------------------------------------------------
  const addFollowUp = (data: any): FollowUp => {
    const newFlw: FollowUp = {
      id: "flw_" + Date.now(),
      salonId: salon.id,
      customerId: data.customerId || "cst_1",
      customerName: data.customerName || "Valued Client",
      customerPhone: data.customerPhone || "",
      serviceName: data.serviceName || "Treatment",
      triggerReason: data.triggerReason || "Retention Check-In",
      suggestedMessage: data.suggestedMessage || "",
      status: data.status || "pending",
      dueDate: data.dueDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      ...data,
    };
    setFollowUps((prev) => {
      const updated = [newFlw, ...prev];
      persist("billcare_followups", updated);
      return updated;
    });
    billcareApi.createFollowUp(newFlw).catch((err) => console.warn("Sync notice createFollowUp:", err.message));
    return newFlw;
  };

  const markFollowUpSent = (id: string) => {
    setFollowUps((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, status: "sent" as const } : f));
      persist("billcare_followups", updated);
      return updated;
    });
    billcareApi.markFollowUpSent(id).catch((err) => console.warn("Sync notice markFollowUpSent:", err.message));
    showToast("Follow-up marked as sent.");
  };

  const addFeedback = (data: any) => {
    const newFb = {
      id: "fb_" + Date.now(),
      salonId: salon.id,
      customerName: data.customerName || "Valued Guest",
      staffName: data.staffName || "Stylist",
      serviceName: data.serviceName || "Service",
      rating: data.rating || 5,
      comment: data.comment || "Great experience",
      date: "Just now",
      tags: data.tags || ["Loved the service ✨"],
      ...data,
    };
    setFeedbacks((prev) => {
      const updated = [newFb, ...prev];
      persist("billcare_feedbacks", updated);
      return updated;
    });
    billcareApi.createFeedback(newFb).catch((err) => console.warn("Sync notice createFeedback:", err.message));
    showToast("Feedback recorded. Thank you!");
  };

  return (
    <BillCareContext.Provider
      value={{
        user,
        salon,
        isAuthenticated: !!user,
        isBackendConnected,
        login,
        signup,
        logout,
        updateSalon,
        updateUser,

        customers,
        services,
        staff,
        inventory,
        appointments,
        invoices,
        followUps,

        addCustomer,
        updateCustomer,
        deleteCustomer,

        addService,
        updateService,
        deleteService,

        addStaff,
        updateStaff,
        deleteStaff,
        toggleClockInOut,

        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        deleteInventoryItem,

        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,

        createInvoice,
        topUpCustomerWallet,
        sendWhatsAppBill,
        sendWhatsAppReminder,

        currentShift,
        openRegisterShift,
        closeRegisterShift,
        appendServiceToAppointment,
        sendChairReadyWhatsApp,

        addFollowUp,
        markFollowUpSent,

        toasts,
        toast: toasts[0]?.message,
        showToast,
        removeToast,

        updateSalonProfile: updateSalon,
        feedbacks,
        addFeedback,
        bookAppointment: (data: any) =>
          addAppointment({
            customerId: "cst_online_" + Date.now(),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            serviceId: services.find((s) => s.name === data.serviceName)?.id || services[0]?.id || "srv_1",
            serviceName: data.serviceName,
            staffId: data.staffId || staff[0]?.id || "stf_1",
            staffName: data.staffName || staff[0]?.name || "Priya Sharma",
            date: new Date().toISOString().split("T")[0],
            startTime: data.time || "11:00",
            endTime: "11:45",
            durationMinutes: data.durationMinutes || 45,
            price: data.price || 1500,
            status: "confirmed",
            notes: "Online booking reservation",
          }),
        sendFollowUp: markFollowUpSent,
        createFollowUp: addFollowUp,
        updateStock: (id: string, qty: number, reason?: string) => adjustStock(id, qty, reason || "Stock update"),
        restockItem: (id: string, qty: number) => adjustStock(id, qty, "Restock order"),
        toggleStaffStatus: toggleClockInOut,
        updateStaffCommission: (id: string, rate: number) => updateStaff(id, { commissionRate: rate }),
        addStaffMember: addStaff,
        wipeAllData: () => {
          setCustomers([]);
          setServices([]);
          setStaff([]);
          setInventory([]);
          setAppointments([]);
          setInvoices([]);
          setFollowUps([]);
          setFeedbacks([]);
          localStorage.removeItem("billcare_customers");
          localStorage.removeItem("billcare_services");
          localStorage.removeItem("billcare_staff");
          localStorage.removeItem("billcare_inventory");
          localStorage.removeItem("billcare_appointments");
          localStorage.removeItem("billcare_invoices");
          localStorage.removeItem("billcare_followups");
          localStorage.removeItem("billcare_feedbacks");
          showToast("Workspace wiped completely clean. Ready for your fresh data!");
        },
        resetDemoData: () => {
          setCustomers([]);
          setServices([]);
          setStaff([]);
          setInventory([]);
          setAppointments([]);
          setInvoices([]);
          setFollowUps([]);
          setFeedbacks([]);
          localStorage.removeItem("billcare_customers");
          localStorage.removeItem("billcare_services");
          localStorage.removeItem("billcare_staff");
          localStorage.removeItem("billcare_inventory");
          localStorage.removeItem("billcare_appointments");
          localStorage.removeItem("billcare_invoices");
          localStorage.removeItem("billcare_followups");
          localStorage.removeItem("billcare_feedbacks");
          showToast("Workspace wiped completely clean. Ready for your fresh data!");
        },
        currentPersona: {
          id: user?.id || "usr_owner",
          name: user?.name || "Sunil Kumar",
          role: user?.role || "owner",
          avatar: user?.avatar || user?.name?.charAt(0) || "S",
          roleTitle: getRoleConfig(user?.role).label,
        },
        allPersonas: DEMO_PERSONAS,
        switchPersona,
        loginAs,
        setSession,
      }}
    >
      {children}

      {/* Floating Modern Toast Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-xs font-semibold backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-800"
                : toast.type === "warning"
                  ? "bg-amber-950/90 text-amber-100 border-amber-800"
                  : toast.type === "info"
                    ? "bg-slate-900/90 text-slate-100 border-slate-700"
                    : "bg-emerald-950/95 text-emerald-100 border-emerald-800"
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </BillCareContext.Provider>
  );
}

// Hook to access BillCare Context
export function useBillCare() {
  const context = useContext(BillCareContext);
  if (!context) {
    throw new Error("useBillCare must be used within a BillCareProvider");
  }
  return context;
}

// Backward compatibility alias for any existing code using useDemo
export const useDemo = useBillCare;
export const DemoProvider = BillCareProvider;
