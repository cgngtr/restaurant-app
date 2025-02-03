'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Utensils,
  Settings,
  Menu
} from 'lucide-react'
import { useRoutePrefetch } from '@/hooks/use-route-prefetch'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tables', href: '/tables', icon: TableIcon },
  { name: 'Menu', href: '/menu', icon: Menu },
  { name: 'Orders', href: '/orders', icon: Utensils },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive 
          ? 'bg-gray-800 text-white' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      {children}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Enable route prefetching
  useRoutePrefetch()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-gray-900">
      <div className="flex flex-col h-screen">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">QR Order Admin</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <NavLink key={item.name} href={item.href} isActive={isActive}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
} 