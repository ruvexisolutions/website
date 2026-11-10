import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://web-production-7d450.up.railway.app";

async function proxyHandler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join("/") : "";
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Avoid passing host or connection headers that can break upstream proxying
    if (!["host", "connection"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: any = undefined;
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-ignore
      duplex: "half",
    });

    const responseData = await upstreamRes.text();
    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(responseData, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.warn(`[Proxy Error] failed connecting to ${targetUrl}:`, err.message);
    return NextResponse.json(
      { error: "Backend service unreachable", detail: err.message },
      { status: 502 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
