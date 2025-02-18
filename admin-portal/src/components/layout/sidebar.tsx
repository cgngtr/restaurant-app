'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Table2,
  ClipboardList,
  Settings,
  Sliders,
  LogOut,
  Store,
  Package,
  FolderTree,
  Building2,
  ChevronDown
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
  {
    name: 'Stock',
    href: '/stock',
    icon: Package,
    children: [
      { name: 'Current Stock', href: '/stock/current-stock', icon: Package },
      { name: 'Categories', href: '/stock/categories', icon: FolderTree },
      { name: 'Suppliers', href: '/stock/suppliers', icon: Building2 }
    ]
  },
  { name: 'Customization', href: '/customization', icon: Sliders },
  { name: 'Settings', href: '/settings', icon: Settings }
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
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

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
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
              const isActive = pathname?.startsWith(item.href.split('/')[1])
              const isOpen = openDropdown === item.name
              return (
                <li key={item.name} className="space-y-1">
                  <div className="flex flex-col">
                    <NavLink href={item.href} isActive={pathname === item.href}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 shrink-0 mr-3" aria-hidden="true" />
                          {item.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 hover:bg-transparent"
                          onClick={(e) => {
                            e.preventDefault()
                            toggleDropdown(item.name)
                          }}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                              isOpen ? "rotate-180" : ""
                            )}
                          />
                        </Button>
                      </div>
                    </NavLink>
                    {isOpen && (
                      <ul className="pl-8 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href
                          return (
                            <li key={child.name}>
                              <NavLink href={child.href} isActive={isChildActive}>
                                {child.icon && <child.icon className="h-4 w-4 shrink-0 mr-3" aria-hidden="true" />}
                                {child.name}
                              </NavLink>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
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