import { NextRequest, NextResponse } from 'next/server';

const STATIC_EXT_REGEX = /\.(png|jpe?g|gif|webp|svg|ico|css|js|map|json|txt|xml|woff2?|ttf)$/i;

/**
 * Ruvexi Solutions Multi-Tenant Resolution Middleware
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = (req.headers.get('host') || '').toLowerCase();

  // Never rewrite Next.js internals, static assets, or API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    STATIC_EXT_REGEX.test(url.pathname)
  ) {
    return NextResponse.next();
  }

  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'ruvexisolutions.com').toLowerCase();
  const hostWithoutPort = hostname.split(':')[0];

  // If accessing by IP (like 127.0.0.1), treat as no subdomain
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort);
  let subdomain = '';

  if (!isIpAddress && hostWithoutPort !== rootDomain && hostWithoutPort !== 'ruvexi.netlify.app') {
    if (hostWithoutPort.endsWith('.localhost')) {
      subdomain = hostWithoutPort.replace('.localhost', '');
    } else if (hostWithoutPort.endsWith(`.${rootDomain}`)) {
      subdomain = hostWithoutPort.replace(`.${rootDomain}`, '');
    } else if (hostWithoutPort.endsWith('.ruvexi.io')) {
      subdomain = hostWithoutPort.replace('.ruvexi.io', '');
    }
  }

  // 1. App Dashboard subdomain -> real Next.js dashboard route
  if (subdomain === 'app') {
    const targetPath = url.pathname === '/' ? '/overview' : url.pathname;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // 2. Super Admin Portal subdomain -> real /admin route
  if (subdomain === 'admin') {
    const targetPath = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
    return NextResponse.rewrite(new URL(targetPath, req.url));
  }

  // 3. Branded Salon Subdomain (e.g. blossom-salon.ruvexisolutions.com -> /[salonSlug]/book)
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    const subPath = url.pathname === '/' ? '/book' : url.pathname;
    return NextResponse.rewrite(new URL(`/${subdomain}${subPath}`, req.url));
  }

  // 4. Default: Standard App Routing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};
