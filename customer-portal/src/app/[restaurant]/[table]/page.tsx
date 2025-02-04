import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu } from '@/components/menu/menu'
import { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface RestaurantData {
  id: string
  name: string
  logo_url: string | null
  slug: string
  tables: Array<{
    id: string
    table_number: string
    status: string
  }>
  menu_categories: MenuCategory[]
  menu_items: MenuItem[]
}

async function getRestaurantData(slug: string, tableNumber: string): Promise<RestaurantData | null> {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(`
      id,
      name,
      logo_url,
      slug,
      tables!inner (
        id,
        table_number,
        status
      ),
      menu_categories (
        id,
        name,
        sort_order,
        active,
        restaurant_id,
        created_at
      ),
      menu_items (
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_available,
        dietary_flags,
        restaurant_id,
        created_at
      )
    `)
    .eq('slug', slug)
    .eq('tables.table_number', tableNumber)
    .single()

  return restaurant
}

interface PageProps {
  params: {
    restaurant: string
    table: string
  }
}

export default async function RestaurantTablePage({ params }: PageProps) {
  const restaurant = await getRestaurantData(params.restaurant, params.table)

  if (!restaurant) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <Menu
        restaurantName={restaurant.name}
        tableNumber={params.table}
        categories={restaurant.menu_categories}
        items={restaurant.menu_items}
      />
    </main>
  )
} 