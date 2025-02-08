'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Store,
  Table2,
  ClipboardList,
  Settings,
  Sliders
} from 'lucide-react'
import { useRoutePrefetch } from '@/hooks/use-route-prefetch'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Menu', href: '/menu', icon: MenuIcon },
  { name: 'Tables', href: '/tables', icon: Table2 },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Customization', href: '/customization', icon: Sliders },
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
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Store className="h-6 w-6 text-primary" />
        <span className="ml-3 text-lg font-semibold text-foreground">QR Order App</span>
      </div>
      <nav className="flex flex-1 flex-col h-[calc(100vh-4rem)]">
        <ul role="list" className="flex flex-1 flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="border-t p-4 flex justify-center">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  )
} 