import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://api.ruvexisolutions.com";

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
        { success: false, error: "Authentication required to generate AI cover images." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const serviceName = String(body.serviceName || "Signature Salon Treatment").trim().slice(0, 120);
    const category = String(body.category || "Salon & Spa").trim().slice(0, 80);
    const description = String(body.description || "").trim().slice(0, 240);
    const salonName = String(body.salonName || "Luxury Salon").trim().slice(0, 120);

    const visualPrompt = [
      `Luxury editorial beauty salon photography for "${serviceName}" (${category}) at "${salonName}".`,
      description ? `Treatment mood: ${description}.` : "",
      "Moody warm architectural lighting, champagne gold accents, marble and dark wood studio aesthetic, ultra-clean commercial photography, wide 16:9 composition, no text or watermarks.",
    ]
      .filter(Boolean)
      .join(" ");

    // 1. Try Google Gemini Imagen 3 if GEMINI_API_KEY is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const imagenRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt: visualPrompt }],
              parameters: { sampleCount: 1, aspectRatio: "16:9" },
            }),
          }
        );
        if (imagenRes.ok) {
          const imagenData = await imagenRes.json().catch(() => ({}));
          const b64 = imagenData?.predictions?.[0]?.bytesBase64Encoded;
          const mime = imagenData?.predictions?.[0]?.mimeType || "image/png";
          if (b64) {
            return NextResponse.json({
              success: true,
              imageDataUrl: `data:${mime};base64,${b64}`,
              provider: "gemini-imagen",
            });
          }
        }
      } catch {
        // Fall through to Pollinations AI image generation
      }
    }

    // 2. Fallback to Pollinations AI image generation (fetched server-side to avoid CORS canvas tainting)
    const encodedPrompt = encodeURIComponent(visualPrompt);
    const seed = Math.floor(Math.random() * 1_000_000);
    const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&seed=${seed}`;
    const imgRes = await fetch(pollUrl, { cache: "no-store" });
    if (!imgRes.ok) {
      return NextResponse.json(
        { success: false, error: "AI image provider is temporarily unavailable. Please retry." },
        { status: 502 }
      );
    }

    const arrayBuf = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(arrayBuf).toString("base64");

    return NextResponse.json({
      success: true,
      imageDataUrl: `data:${contentType};base64,${base64}`,
      provider: "pollinations-ai",
    });
  } catch (err: any) {
    console.error("[AI Service Cover] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate AI cover image." },
      { status: 500 }
    );
  }
}

