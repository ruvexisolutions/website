import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://web-production-7d450.up.railway.app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessToken, credential } = body;

    if (!accessToken && !credential) {
      return NextResponse.json(
        { success: false, error: "Google authentication token is required." },
        { status: 400 }
      );
    }

    // Delegate verification and JWT minting directly to FastAPI (/api/v1/auth/google)
    const upstreamRes = await fetch(`${BACKEND_URL}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, credential }),
      cache: "no-store",
    });

    const data = await upstreamRes.json().catch(() => ({}));
    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.detail || data.error || "Google sign-in failed.",
        },
        { status: upstreamRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      isNewUser: Boolean(data.isNewUser),
      user: data.user,
      salon: data.salon,
      token: data.token,
    });
  } catch (err: any) {
    console.error("Google Auth route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Google authentication failed." },
      { status: 502 }
    );
  }
}

