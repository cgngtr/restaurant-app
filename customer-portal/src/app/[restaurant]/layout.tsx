import { supabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
  params: {
    restaurant: string
  }
}

export default function RestaurantLayout({ children, params }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Restaurant: {params.restaurant}</h1>
        </div>
      </header>
      {children}
    </div>
  )
} 