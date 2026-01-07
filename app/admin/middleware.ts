import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to login page
  if (path === '/admin/login') {
    return NextResponse.next();
  }

  // Check admin session
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Allow access to admin routes
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
