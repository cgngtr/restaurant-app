import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'


export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

// Middleware to protect admin routes
export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  return session
}

// Get the restaurant ID for the current user
export async function getRestaurantId() {
  const session = await getSession()
  if (!session?.user?.email) return null

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('contact_email', session.user.email)
    .single()

  return restaurant?.id || null
}

// Check if user has access to a specific restaurant
export async function checkRestaurantAccess(restaurantId: string) {
  const session = await getSession()
  if (!session?.user?.email) return false

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .eq('contact_email', session.user.email)
    .single()

  return !!restaurant
}

// Helper to get restaurant details
export async function getRestaurantDetails() {
  const session = await getSession()
  if (!session?.user?.email) return null

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('contact_email', session.user.email)
    .single()

  return restaurant
} 