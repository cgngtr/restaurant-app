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
  Sliders,
  LogOut,
  TestTube
} from 'lucide-react'
import { useRoutePrefetch } from '@/hooks/use-route-prefetch'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRestaurant } from '@/providers/restaurant-provider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Menu', href: '/menu', icon: MenuIcon },
  { name: 'Tables', href: '/tables', icon: Table2 },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Customization', href: '/customization', icon: Sliders },
  { name: 'Settings', href: '/settings', icon: Settings },
  {
    name: 'Test',
    icon: TestTube,
    children: [
      { name: 'Test1', href: '/test/test1' },
      { name: 'Test2', href: '/test/test2' },
      { name: 'Test3', href: '/test/test3' },
      { name: 'Test4', href: '/test/test4' }
    ]
  }
]

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
      )}
    >
      {children}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout } = useRestaurant()
  
  // Enable route prefetching
  useRoutePrefetch()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Store className="h-6 w-6 text-primary" />
        <span className="ml-3 text-lg font-semibold text-foreground">QR Order App</span>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-1 p-4">
          {navigation.map((item) => {
            if (item.children) {
              return (
                <li key={item.name} className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </div>
                  <ul className="pl-8 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <li key={child.name}>
                          <NavLink href={child.href} isActive={isActive}>
                            {child.name}
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            }

            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <NavLink href={item.href} isActive={isActive}>
                  <item.icon className="h-5 w-5 shrink-0 mr-3" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
        <div className="border-t p-4 space-y-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </Button>
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  )
} 