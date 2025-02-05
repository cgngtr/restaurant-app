import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import { supabase } from './supabase'
import type { Session } from 'next-auth'
import type { IncomingMessage } from 'http'

export async function getSession(): Promise<Session | null> {
  const token = await getToken({ 
    req: {
      headers: {
        cookie: cookies().toString()
      }
    },
    secret: process.env.NEXTAUTH_SECRET
  })

  if (!token) return null

  return {
    user: {
      id: token.sub!,
      name: token.name,
      email: token.email,
      image: token.picture,
    },
    expires: new Date(token.exp! * 1000).toISOString()
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

// No authentication required for customer portal, but we'll track sessions
export async function getUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id || null
}

// Helper to check if there's an active order for this table
export async function getActiveOrder(restaurantId: string, tableId: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('table_id', tableId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return order
}

export async function getUserOrders(userId: string) {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return orders
} 