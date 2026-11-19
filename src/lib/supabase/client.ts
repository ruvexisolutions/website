import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;
let dynamicSupabaseUrl = "";
let dynamicSupabaseAnonKey = "";

export function setDynamicSupabaseConfig(url: string, key: string) {
  if (url && key) {
    dynamicSupabaseUrl = url.trim();
    dynamicSupabaseAnonKey = key.trim();
    browserClient = null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = dynamicSupabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jpkxwdwjrgerdqxjxesw.supabase.co";
  const key = dynamicSupabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    key !== "your-anon-key-here" &&
    key !== "your_supabase_anon_key" &&
    key.length > 20
  );
};

export function createClient() {
  const supabaseUrl = dynamicSupabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jpkxwdwjrgerdqxjxesw.supabase.co";
  const supabaseAnonKey = dynamicSupabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return browserClient;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
