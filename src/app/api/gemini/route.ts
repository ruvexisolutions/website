import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://web-production-7d450.up.railway.app";

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 25;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

async function verifyAuthenticatedCaller(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const checkRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
      });
      if (checkRes.ok) return true;
    } catch {
      // Fall through to Supabase check
    }
  }

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) return true;
  } catch {
    // Ignore
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAuthenticatedCaller(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Authentication required to use AI Co-Pilot." },
        { status: 401 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const bucket = rateBuckets.get(clientIp);
    if (bucket && now < bucket.resetAt) {
      if (bucket.count >= RATE_MAX_REQUESTS) {
        return NextResponse.json(
          { success: false, error: "AI rate limit reached. Please wait a minute and retry." },
          { status: 429 }
        );
      }
      bucket.count += 1;
    } else {
      rateBuckets.set(clientIp, { count: 1, resetAt: now + RATE_WINDOW_MS });
    }

    const { prompt, systemInstruction } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 8000) {
      return NextResponse.json(
        { success: false, error: "Valid prompt (under 8,000 characters) is required." },
        { status: 400 }
      );
    }

    // 1. Prefer delegating directly to Railway backend (/api/v1/ai/generate) so GEMINI_API_KEY lives strictly in Railway env
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const railwayRes = await fetch(`${BACKEND_URL}/api/v1/ai/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ prompt, systemInstruction }),
        });
        const railwayData = await railwayRes.json().catch(() => ({}));
        if (railwayRes.ok && railwayData?.success) {
          return NextResponse.json({ success: true, text: railwayData.text });
        }
        // Only fall back to local server GEMINI_API_KEY if Railway doesn't have the key configured
        if (railwayRes.status !== 503 && railwayRes.status !== 404) {
          return NextResponse.json(
            { success: false, error: railwayData?.detail || railwayData?.error || "AI service error" },
            { status: railwayRes.status }
          );
        }
      } catch {
        // Fall through to local server-only env key if set
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY is not configured in Railway backend or server environment.",
      }, { status: 503 });
    }

    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastStatus = 500;
    let lastError = "AI service failed";

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return NextResponse.json({
          success: true,
          text: generatedText.trim(),
        });
      }

      lastStatus = response.status;
      lastError = await response.text();
      if (response.status !== 404) break;
    }

    return NextResponse.json({ success: false, error: lastError }, { status: lastStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

