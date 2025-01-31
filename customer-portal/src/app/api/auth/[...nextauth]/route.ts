import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,
  providers: [],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 