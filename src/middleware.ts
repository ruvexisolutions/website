import { NextRequest, NextResponse } from 'next/server';

/**
 * Ruvexi Solutions Multi-Tenant Resolution Middleware
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Never rewrite Next.js internals, static files, or API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'Ruvexi.io';
  const hostWithoutPort = hostname.split(':')[0];

  // If accessing by IP (like 127.0.0.1), treat as no subdomain
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort);
  let subdomain = '';

  if (!isIpAddress) {
    if (hostWithoutPort.endsWith('.localhost')) {
      subdomain = hostWithoutPort.replace('.localhost', '');
    } else if (hostWithoutPort.endsWith(`.${rootDomain}`)) {
      subdomain = hostWithoutPort.replace(`.${rootDomain}`, '');
    }
  }

  // 1. App Dashboard subdomain
  if (subdomain === 'app') {
    return NextResponse.rewrite(new URL(`/(dashboard)${url.pathname}`, req.url));
  }

  // 2. Super Admin Portal subdomain
  if (subdomain === 'admin') {
    return NextResponse.rewrite(new URL(`/(super-admin)${url.pathname}`, req.url));
  }

  // 3. Branded Salon Subdomain (e.g. blossom-salon.Ruvexi.io)
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    return NextResponse.rewrite(
      new URL(`/(tenant-site)/${subdomain}${url.pathname}`, req.url)
    );
  }

  // 4. Default: Standard App Routing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};
