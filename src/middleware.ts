import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/auth', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip authentication check for public routes or API routes that aren't protected
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files like favicon.ico
  ) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If no token exists, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Continue to protected route
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /api/auth routes (authentication endpoints)
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     * 4. All files in the public folder
     */
    '/((?!api/auth|_next|static|.*\\..*).*)',
  ],
}; 