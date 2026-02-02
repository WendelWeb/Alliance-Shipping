import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

// Routes that don't require any authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/news',
  '/calculator',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  // Admin login page and auth endpoints are public
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
  '/api/setup',
]);

// Admin page routes (not API)
function isAdminPage(pathname: string): boolean {
  return pathname.startsWith('/admin') && !pathname.startsWith('/api/');
}

// Admin API routes
function isAdminApi(pathname: string): boolean {
  return pathname.startsWith('/api/admin');
}

// Verify admin JWT from cookie (inline, no DB needed)
async function verifyAdminJwt(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // --- Admin page routes (except login) ---
  if (isAdminPage(pathname) && pathname !== '/admin/login') {
    const valid = await verifyAdminJwt(request);
    if (!valid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // --- Admin API routes (except login/logout) ---
  if (isAdminApi(pathname) && pathname !== '/api/admin/login' && pathname !== '/api/admin/logout' && pathname !== '/api/admin/elevate') {
    const valid = await verifyAdminJwt(request);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // --- All other non-public routes: Clerk auth ---
  if (!isPublicRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-up', request.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
