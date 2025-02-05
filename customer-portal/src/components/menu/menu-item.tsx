'use client'

import Image from 'next/image'
import { MenuItem as MenuItemType } from '@/lib/api/menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

// ... rest of the code ...

export function MenuItem({ item }: MenuItemProps) {
  const addToCart = useCartStore((state) => state.addToCart)

  return (
    <Card>
      <CardHeader className="p-0">
        {/* ... image section ... */}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant="secondary">{formatCurrency(item.price)}</Badge>
        </div>
        {/* ... description section ... */}
      </CardContent>
      {/* ... footer section ... */}
    </Card>
  )
} 