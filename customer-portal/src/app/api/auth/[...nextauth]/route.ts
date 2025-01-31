import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { Adapter } from '@auth/core/adapters'
import Google from 'next-auth/providers/google'
import type { NextAuthConfig } from 'next-auth'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET')
}

export const config = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.id = user.id
        token.sub = user.id
      }
      return token
    },
    session: ({ session, token }) => {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig

const handler = NextAuth(config)
export { handler as GET, handler as POST } 