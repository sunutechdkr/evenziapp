import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from './types/models';

// List of public routes that don't require authentication
const publicRoutes = [
  '/', 
  '/login', 
  '/api/auth', 
  '/register', 
  '/auth/verify-request',
  '/event',
  '/api/register',
  '/privacy-policy'
];

// Routes accessibles uniquement aux administrateurs
const adminRoutes = [
  '/dashboard/admin',
  '/dashboard/users',
  '/dashboard/settings'
];

// Routes accessibles aux organisateurs et administrateurs
const organizerRoutes = [
  '/dashboard/events/create',
  '/dashboard/analytics'
];

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

  // Vérification des restrictions basées sur le rôle
  const userRole = token.role as UserRole;

  // Routes administrateur - réservées aux administrateurs
  if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Routes organisateur - réservées aux organisateurs et administrateurs
  if (organizerRoutes.some(route => pathname.startsWith(route)) && 
      userRole !== UserRole.ORGANIZER && 
      userRole !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirection après connexion si l'utilisateur accède à la racine du dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    switch (userRole) {
      case UserRole.ADMIN:
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      case UserRole.ORGANIZER:
        return NextResponse.redirect(new URL('/dashboard/events', request.url));
      case UserRole.STAFF:
        return NextResponse.redirect(new URL('/dashboard/events', request.url));
      case UserRole.USER:
      default:
        return NextResponse.redirect(new URL('/my-events', request.url));
    }
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