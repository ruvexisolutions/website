/**
 * BillCare Solution Platform API Client
 * Seamlessly connects Next.js frontend to FastAPI backend API
 */

const LIVE_BACKEND_URL = "https://billcare-production.up.railway.app/api/v1";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("3000")
    ? (process.env.NEXT_PUBLIC_API_URL || LIVE_BACKEND_URL)
    : LIVE_BACKEND_URL);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("billcare_token");
      if (token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {}
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText || `HTTP ${res.status}` };
      }
      throw new Error(errorJson.detail || `Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    // Return friendly error or propagate
    console.warn(`[BillCare API] ${options.method || "GET"} ${url} error:`, err.message);
    throw err;
  }
}

export const billcareApi = {
  // Bootstrap entire workspace state
  getBootstrap: () => request<any>("/bootstrap"),

  // Auth
  login: (credentials: { email: string; password?: string }) =>
    request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  signup: (payload: { user: any; salon: any }) =>
    request<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; new_password: string }) =>
    request<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Salon Profile
  getSalon: () => request<any>("/salon"),
  updateSalon: (data: any) =>
    request<any>("/salon", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Customers
  getCustomers: () => request<any[]>("/customers"),
  createCustomer: (data: any) =>
    request<any>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCustomer: (id: string, data: any) =>
    request<any>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id: string) =>
    request<{ success: boolean; id: string }>(`/customers/${id}`, {
      method: "DELETE",
    }),

  // Services
  getServices: () => request<any[]>("/services"),
  createService: (data: any) =>
    request<any>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: any) =>
    request<any>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean; id: string }>(`/services/${id}`, {
      method: "DELETE",
    }),

  // Staff
  getStaff: () => request<any[]>("/staff"),
  createStaff: (data: any) =>
    request<any>("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStaff: (id: string, data: any) =>
    request<any>(`/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  toggleClock: (id: string) =>
    request<any>(`/staff/${id}/toggle-clock`, {
      method: "POST",
    }),
  deleteStaff: (id: string) =>
    request<{ success: boolean; id: string }>(`/staff/${id}`, {
      method: "DELETE",
    }),

  // Inventory
  getInventory: () => request<any[]>("/inventory"),
  createInventory: (data: any) =>
    request<any>("/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInventory: (id: string, data: any) =>
    request<any>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  adjustStock: (id: string, change: number, reason?: string) =>
    request<any>(`/inventory/${id}/adjust-stock`, {
      method: "POST",
      body: JSON.stringify({ change, reason }),
    }),
  deleteInventory: (id: string) =>
    request<{ success: boolean; id: string }>(`/inventory/${id}`, {
      method: "DELETE",
    }),

  // Appointments
  getAppointments: () => request<any[]>("/appointments"),
  createAppointment: (data: any) =>
    request<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAppointmentStatus: (id: string, status: string) =>
    request<any>(`/appointments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteAppointment: (id: string) =>
    request<{ success: boolean; id: string }>(`/appointments/${id}`, {
      method: "DELETE",
    }),

  // Invoices & POS
  getInvoices: () => request<any[]>("/invoices"),
  createInvoice: (data: any) =>
    request<any>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Follow-ups & Retention
  getFollowUps: () => request<any[]>("/followups"),
  createFollowUp: (data: any) =>
    request<any>("/followups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  markFollowUpSent: (id: string) =>
    request<any>(`/followups/${id}/sent`, {
      method: "POST",
    }),

  // Feedbacks
  getFeedbacks: () => request<any[]>("/feedbacks"),
  createFeedback: (data: any) =>
    request<any>("/feedbacks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // WhatsApp Business Platform Cloud API
  getWhatsAppStatus: () => request<any>("/whatsapp/status"),
  configureWhatsApp: (data: {
    phoneNumberId: string;
    wabaId?: string;
    accessToken: string;
    displayNumber?: string;
    verifiedName?: string;
  }) =>
    request<any>("/whatsapp/configure", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  testWhatsAppConnection: (data?: any) =>
    request<any>("/whatsapp/test-connection", {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),
  embeddedSignupWhatsApp: (data: any) =>
    request<any>("/whatsapp/embedded-signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  disconnectWhatsApp: () =>
    request<any>("/whatsapp/disconnect", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  getWhatsAppMessages: () => request<any>("/whatsapp/messages"),
  sendWhatsAppBill: (data: any) =>
    request<any>("/whatsapp/send-bill", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendWhatsAppReminder: (data: any) =>
    request<any>("/whatsapp/send-reminder", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendWhatsAppCampaign: (data: any) =>
    request<any>("/whatsapp/send-campaign", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  topUpWallet: (customerId: string, amount: number) =>
    request<any>(`/customers/${customerId}/wallet`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  request,

  // Subscription & 7-Day Trial Management
  getSubscriptionStatus: () => request<any>("/subscription/status"),
  upgradeSubscription: (plan: string) =>
    request<any>("/subscription/upgrade", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  // Dynamic Payments (Cash & UPI Direct-to-Salon)
  getPaymentSettings: () => request<any>("/payments/settings"),
  updatePaymentSettings: (data: {
    cashEnabled?: boolean;
    upiEnabled?: boolean;
    upiId?: string;
    upiPayeeName?: string;
    paymentInstructions?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankName?: string;
  }) =>
    request<any>("/payments/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  generateUpiQr: (data: {
    amount?: number;
    invoiceNumber?: string;
    invoiceId?: string;
  }) =>
    request<any>("/payments/generate-upi-qr", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirmPayment: (
    invoiceId: string,
    data: {
      paymentMethod: "CASH" | "UPI" | string;
      amountReceived?: number;
      explicitVerification?: boolean;
      bankReference?: string;
      notes?: string;
    }
  ) =>
    request<any>(`/invoices/${invoiceId}/payments/confirm`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getInvoicePayments: (invoiceId: string) =>
    request<any[]>(`/invoices/${invoiceId}/payments`),

  // Cash Register Shift Management (Front Desk)
  getCurrentShift: () => request<any>("/register/current"),
  openRegisterShift: (data: { openingFloat?: number; notes?: string }) =>
    request<any>("/register/open", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  closeRegisterShift: (data: { countedCash: number; notes?: string }) =>
    request<any>("/register/close", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

