import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Add pathname to headers for server-side routing
  res.headers.set('x-pathname', request.nextUrl.pathname)
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Auth sayfaları için kontrol (login, register)
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
    if (session) {
      // Kullanıcı giriş yapmışsa auth sayfalarına erişemez
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return res
  }

  // Auth callback için kontrol
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Protected routes için kontrol
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 