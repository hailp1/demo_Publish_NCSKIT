import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|webr_core_v3|webr_repo_v6).*)',
    ],
}
