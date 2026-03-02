import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Define protected routes and their allowed roles
const routeRoles: Record<string, string[]> = {
    '/dashboard': ['ADMIN', 'FRONT_DESK', 'DOCTOR', 'BILLING'],
    '/admin': ['ADMIN'],
    '/front-desk': ['FRONT_DESK', 'ADMIN'],
    '/doctor': ['DOCTOR', 'ADMIN'],
    '/billing': ['BILLING', 'ADMIN']
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes
    if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
        // If user is already logged in, redirect away from login page to dashboard
        if (pathname === '/login' || pathname === '/') {
            const token = request.cookies.get('auth_token')?.value
            if (token) {
                const payload = await verifyToken(token)
                if (payload) {
                    return NextResponse.redirect(new URL('/dashboard', request.url))
                }
            }
        }
        return NextResponse.next()
    }

    // Verify auth token for protected routes
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload: any = await verifyToken(token)

    if (!payload) {
        // Invalid token
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check Role-Based Access Control
    const userRole = payload.role as string

    // Check if current path matches any of our protected route prefixes
    const matchedRoute = Object.keys(routeRoles).find(route => pathname.startsWith(route))

    if (matchedRoute) {
        const allowedRoles = routeRoles[matchedRoute]

        if (!allowedRoles.includes(userRole)) {
            // User doesn't have permission for this route
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 })
            }
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
