import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-jwt-key-change-in-production'
);

export interface AdminSession {
  adminId: number;
  userId: number;
  role: 'super_admin' | 'admin' | 'moderator';
  email: string;
  permissions: any;
}

// Create JWT token
export async function createAdminToken(session: AdminSession): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(secret);
}

// Verify JWT token
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminSession;
  } catch (error) {
    return null;
  }
}

// Get admin session from cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return null;
  }

  return await verifyAdminToken(token);
}

// Set admin session cookie
export async function setAdminSession(session: AdminSession) {
  const token = await createAdminToken(session);
  const cookieStore = await cookies();

  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

// Clear admin session
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Middleware helper to protect admin routes
export async function requireAdmin(request: NextRequest): Promise<NextResponse | AdminSession> {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const session = await verifyAdminToken(token);

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return session;
}

// Check if user has permission
export function hasPermission(
  session: AdminSession,
  resource: string,
  action: string
): boolean {
  // Super admin has all permissions
  if (session.role === 'super_admin') {
    return true;
  }

  // Check specific permission
  const permissions = session.permissions || {};
  return permissions[resource]?.[action] === true;
}
