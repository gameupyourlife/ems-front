import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login', '/password'];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Get auth token from cookies (we'll create this when logging in)
  const token = request.cookies.get('auth-token')?.value;
  
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // If not public path and no token, redirect to login
  if (!token) {
    // Store the original URL to redirect back after login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};