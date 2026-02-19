import { NextRequest, NextResponse } from 'next/server';

// This function runs before every request
export function middleware(request: NextRequest) {
  // For now, we'll allow all routes
  // In a real implementation, you would check authentication status here
  return NextResponse.next();
}

// Configure which routes the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};