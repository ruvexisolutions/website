import { createClient, isSupabaseConfigured } from "./client";
import type { User as SupabaseAuthUser, Session } from "@supabase/supabase-js";

export interface RuvexiAuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    salonId: string;
    avatar?: string;
  };
  salon?: {
    id: string;
    name: string;
    slug?: string;
    city?: string;
    category?: string;
    chairs?: number;
    currency?: string;
    [key: string]: any;
  };
  token?: string;
  requiresEmailVerification?: boolean;
  error?: string;
}

/**
 * Transforms Supabase user and metadata into Ruvexi User and Salon models
 */
export function mapSupabaseUserToRuvexi(supabaseUser: SupabaseAuthUser, session?: Session | null) {
  const metadata = supabaseUser.user_metadata || {};
  const email = supabaseUser.email || metadata.email || "";
  const name = metadata.name || metadata.full_name || email.split("@")[0] || "Salon Team Member";
  const phone = supabaseUser.phone || metadata.phone || "";
  const role = metadata.role || "SALON_MANAGER";
  const salonId = metadata.salon_id || `sln_${supabaseUser.id.replace(/-/g, "").slice(0, 12)}`;
  const salonName = metadata.salon_name || `${name}'s Atelier`;

  const user = {
    id: supabaseUser.id,
    name,
    email,
    phone,
    role,
    salonId,
    avatar: name.charAt(0).toUpperCase(),
  };

  const salon = {
    id: salonId,
    name: salonName,
    slug: salonName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    branch: metadata.branch || "Flagship Studio",
    city: metadata.city || "Bengaluru",
    category: metadata.category || "Hair Studio & Luxury Spa",
    chairs: metadata.chairs || 6,
    currency: metadata.currency || "₹",
    gstin: metadata.gstin || "27AABCB1234F1Z8",
    autoGst: true,
    phone: phone || "+91 98450 11223",
    email: email || "contact@Ruvexi.io",
    address: metadata.address || "100ft Road, Indiranagar",
    timing: "10:00 AM - 09:00 PM (All Days)",
    rating: 0,
    reviewCount: 0,
    subscriptionStatus: "trial",
    subscriptionPlan: "free_trial",
    isTrialActive: true,
    trialDaysLeft: 7,
  };

  return { user, salon, token: session?.access_token };
}

/**
 * 1. Sign Up using Supabase Auth
 */
export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  salonName: string;
  city?: string;
  category?: string;
  chairs?: number;
}): Promise<RuvexiAuthResult> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      error: "Supabase authentication service is not configured.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          phone: params.phone || "",
          role: "SALON_MANAGER",
          salon_name: params.salonName,
          city: params.city || "Bengaluru",
          category: params.category || "Hair Studio & Luxury Spa",
          chairs: params.chairs || 6,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // If Supabase project requires email confirmation and session is not yet active
      if (!data.session) {
        return {
          success: true,
          requiresEmailVerification: true,
          user: {
            id: data.user.id,
            name: params.name,
            email: params.email,
            phone: params.phone || "",
            role: "SALON_MANAGER",
            salonId: `sln_${data.user.id.replace(/-/g, "").slice(0, 12)}`,
          },
        };
      }

      const mapped = mapSupabaseUserToRuvexi(data.user, data.session);
      return {
        success: true,
        user: mapped.user,
        salon: mapped.salon,
        token: mapped.token,
      };
    }

    return { success: false, error: "Failed to create Supabase account." };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred during signup." };
  }
}

/**
 * 2. Sign In with Email & Password using Supabase Auth
 */
export async function signInWithSupabasePassword(
  email: string,
  password: string
): Promise<RuvexiAuthResult> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      error: "Supabase authentication service is not configured.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user && data.session) {
      const mapped = mapSupabaseUserToRuvexi(data.user, data.session);
      return {
        success: true,
        user: mapped.user,
        salon: mapped.salon,
        token: mapped.token,
      };
    }

    return { success: false, error: "Failed to retrieve user session from Supabase." };
  } catch (err: any) {
    return { success: false, error: err.message || "Sign in failed." };
  }
}

/**
 * 3. Request OTP (Phone / SMS) using Supabase Auth
 */
export async function requestSupabasePhoneOtp(phone: string): Promise<{ success: boolean; message: string; error?: string }> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      message: "SMS service is not configured.",
      error: "SMS service not configured",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    });

    if (error) {
      return { success: false, message: error.message, error: error.message };
    }

    return {
      success: true,
      message: `6-digit verification code sent to ${phone}. Valid for 5 minutes.`,
    };
  } catch (err: any) {
    return { success: false, message: err.message, error: err.message };
  }
}

/**
 * 3b. Request Email OTP (Manager Login) using Supabase Auth
 */
export async function requestSupabaseEmailOtp(email: string): Promise<{ success: boolean; message: string; error?: string }> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      message: "Email OTP service is not configured.",
      error: "Email OTP service not configured",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, message: error.message, error: error.message };
    }

    return {
      success: true,
      message: `6-digit login code dispatched to ${email}. Valid for 5 minutes.`,
    };
  } catch (err: any) {
    return { success: false, message: err.message, error: err.message };
  }
}

/**
 * 4. Verify OTP (Phone / SMS) using Supabase Auth
 */
export async function verifySupabasePhoneOtp(phone: string, token: string): Promise<RuvexiAuthResult> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      error: "SMS OTP verification service is not configured.",
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: token.trim(),
      type: "sms",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user && data.session) {
      const mapped = mapSupabaseUserToRuvexi(data.user, data.session);
      return {
        success: true,
        user: mapped.user,
        salon: mapped.salon,
        token: mapped.token,
      };
    }

    return { success: false, error: "Failed to establish session after OTP verification." };
  } catch (err: any) {
    return { success: false, error: err.message || "OTP verification failed." };
  }
}

/**
 * 4b. Verify Email OTP (Manager Login) using Supabase Auth
 */
export async function verifySupabaseEmailOtp(email: string, token: string): Promise<RuvexiAuthResult> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      error: "Email OTP verification service is not configured.",
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user && data.session) {
      const mapped = mapSupabaseUserToRuvexi(data.user, data.session);
      return {
        success: true,
        user: mapped.user,
        salon: mapped.salon,
        token: mapped.token,
      };
    }

    return { success: false, error: "Failed to establish session after email OTP verification." };
  } catch (err: any) {
    return { success: false, error: err.message || "Email OTP verification failed." };
  }
}

/**
 * 4c. Sign In with Google OAuth using Supabase Auth
 */
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      success: false,
      error: "Google Sign-In requires active Supabase credentials in .env.local with Google OAuth enabled in Supabase Dashboard.",
    };
  }

  try {
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/overview`
      : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.url && typeof window !== "undefined") {
      window.location.href = data.url;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to initiate Google sign in." };
  }
}

/**
 * 5. Sign Out using Supabase Auth
 */
export async function signOutWithSupabase(): Promise<void> {
  const supabase = createClient();
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out warning:", e);
    }
  }
}

/**
 * 6. Send Password Reset Email using Supabase Auth
 */
export async function requestSupabasePasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return { success: true };
  }

  try {
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 7. Update Password using Supabase Auth
 */
export async function updateSupabasePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 8. Get current active session from Supabase
 */
export async function getActiveSupabaseSession(): Promise<RuvexiAuthResult | null> {
  const supabase = createClient();
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) return null;

    const mapped = mapSupabaseUserToRuvexi(session.user, session);
    return {
      success: true,
      user: mapped.user,
      salon: mapped.salon,
      token: mapped.token,
    };
  } catch {
    return null;
  }
}

