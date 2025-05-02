import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login', '/password'];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Get auth information from cookies
  const token = request.cookies.get('auth-token')?.value;
  const userId = request.cookies.get('user-id')?.value;
  
  // For debugging (remove in production)
  // console.log('Middleware: Checking auth for', request.nextUrl.pathname);
  // console.log('Auth token:', token);
  // console.log('User ID:', userId);
  
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // If not public path and no token or userId, redirect to login
  if (!token || !userId) {
    // Store the original URL to redirect back after login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, add user info to request headers
  // This allows server components to access user info without client-side context
  const response = NextResponse.next();
  
  // Add user info to response headers for server components
  response.headers.set('x-user-id', userId);
  
  return response;
}

// Configure which paths the middleware applies to
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};