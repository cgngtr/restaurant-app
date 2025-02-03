'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const routes = [
  '/',
  '/menu',
  '/tables',
  '/orders',
  '/settings'
]

export function useRoutePrefetch() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Prefetch all routes except current one
    routes.forEach(route => {
      if (route !== pathname) {
        router.prefetch(route)
      }
    })
  }, [pathname, router])
} 