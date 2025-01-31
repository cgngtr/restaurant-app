import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

// No authentication required for customer portal, but we'll track sessions
export async function getSessionId() {
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
    .in('status', ['pending', 'preparing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return order
} 