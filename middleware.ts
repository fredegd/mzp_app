import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// List of routes that require authentication
const protectedRoutes = ["/dashboard", "/recipes", "/meal-planner", "/shopping-list", "/profile"]

// List of routes that are only accessible to unauthenticated users
const authRoutes = ["/auth/login", "/auth/sign-up"]

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient()

    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // Check if the route is for unauthenticated users only
    const isAuthRoute = authRoutes.some((route) => pathname === route)

    // If the route requires authentication and the user is not authenticated, redirect to login
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // If the route is for unauthenticated users only and the user is authenticated, redirect to dashboard
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Allow the request to proceed
    return NextResponse.next()
  } catch (error) {
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
