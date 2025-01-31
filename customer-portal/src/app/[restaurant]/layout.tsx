import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
  params: {
    restaurant: string
  }
}

async function getRestaurant(slug: string) {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  return restaurant
}

export default async function RestaurantLayout({ children, params }: LayoutProps) {
  const restaurant = await getRestaurant(params.restaurant)

  if (!restaurant || !restaurant.active) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant-wide header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="h-10 w-10 object-contain"
              />
            )}
            <h1 className="text-xl font-semibold">{restaurant.name}</h1>
          </div>
        </div>
      </header>

      {/* Page content */}
      {children}
    </div>
  )
} 