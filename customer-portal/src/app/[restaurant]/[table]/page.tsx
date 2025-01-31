import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu } from '@/components/menu/menu'
import { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface PageProps {
  params: {
    restaurant: string
    table: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

interface RestaurantData {
  id: string
  name: string
  logo_url: string | null
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

export default async function TablePage({ params, searchParams }: PageProps) {
  const restaurantData = await getRestaurantData(
    params.restaurant,
    params.table
  )

  if (!restaurantData) {
    notFound()
  }

  // Sort categories by sort_order
  const sortedCategories = [...(restaurantData.menu_categories || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  return (
    <main className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">
          {restaurantData.name} - Table {params.table}
        </h1>
      </header>
      
      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <Menu
            restaurantId={restaurantData.id}
            categories={sortedCategories}
            items={restaurantData.menu_items || []}
            onAddToCart={(item) => {
              // Cart functionality will be added later
              console.log('Add to cart:', item)
            }}
          />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          {/* Order component will be added next */}
        </section>
      </div>
    </main>
  )
} 