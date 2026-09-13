import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Canonical production domain
const PRIMARY_DOMAIN = 'open.ncskit.org'

// All subdomains/aliases that should redirect to the primary domain
const REDIRECT_HOSTS = [
    'ncskit.org',
    'www.ncskit.org',
    'stat.ncskit.org',
    'ncsstat.ncskit.org',
    'demo_publish_ncskit.vercel.app',
]

export async function middleware(request: NextRequest) {
    try {
        const url = request.nextUrl.clone()
        const host = request.headers.get('host') || ''
        const forwardedProto = request.headers.get('x-forwarded-proto')
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

        // 1. FORCE HTTPS
        if (isProduction && forwardedProto === 'http') {
            url.protocol = 'https:'
            return NextResponse.redirect(url, { status: 301 })
        }

        // 2. REDIRECT ALIASES → PRIMARY DOMAIN (open.ncskit.org)
        const shouldRedirect = REDIRECT_HOSTS.some(h => host.includes(h))
        if (isProduction && shouldRedirect) {
            url.hostname = PRIMARY_DOMAIN
            url.protocol = 'https:'
            url.port = ''
            return NextResponse.redirect(url, { status: 301 })
        }

        // 3. Skip session update for static assets
        const pathname = request.nextUrl.pathname
        if (pathname.startsWith('/_next') || pathname.includes('.')) {
            return NextResponse.next()
        }

        // 4. Skip session processing when OAuth code is present
        if (request.nextUrl.searchParams.has('code')) {
            return NextResponse.next()
        }

        // 5. Session management (Supabase auth + RBAC)
        return await updateSession(request)

    } catch (err) {
        // Never crash the middleware — fall through to the app so it can handle
        // its own error states. Logging here would require Edge-compatible logger.
        console.error('[Middleware] Unhandled error, falling through:', err)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - WebR WASM files (large binaries served from public/)
         * - Static image/font assets
         */
        '/((?!_next/static|_next/image|favicon.ico|webr_core_v3|webr_repo_v6|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wasm|rds|gz|ico|ttf|woff|woff2)$).*)',
    ],
}
