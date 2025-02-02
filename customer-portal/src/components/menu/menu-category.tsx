'use client'

import Image from 'next/image'
import { Database } from '@/types/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface MenuCategoryProps {
  category: MenuCategory
  items: MenuItem[]
}

export function MenuCategory({ category, items }: MenuCategoryProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up')
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleAddToCart = async (item: MenuItem) => {
    setLoading((prev) => ({ ...prev, [item.id]: true }))

    try {
      addItem(item)
      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  const itemAnimation = {
    offscreen: { 
      opacity: 0,
      y: scrollDirection === 'up' ? 50 : -50
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 0.6
      }
    }
  }

  const titleAnimation = {
    offscreen: { 
      opacity: 0,
      y: scrollDirection === 'up' ? 20 : -20
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: false, margin: "-50px" }}
            variants={itemAnimation}
          >
            <Card className="overflow-hidden">
              {item.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                {item.dietary_flags && item.dietary_flags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.dietary_flags.map((flag) => (
                      <Badge key={flag} variant="secondary">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="mt-4 w-full"
                    disabled={!item.is_available || loading[item.id]}
                  >
                    {loading[item.id]
                      ? 'Adding...'
                      : item.is_available
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 