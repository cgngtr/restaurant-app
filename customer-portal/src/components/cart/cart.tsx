'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShoppingCart } from 'lucide-react'
import { AnimateList, ListItem, ScaleIn } from '@/components/ui/animated-presence'
import { motion, AnimatePresence } from 'framer-motion'

export function Cart() {
  const [open, setOpen] = useState(false)
  const { items, updateQuantity, removeItem, updateSpecialInstructions, getTotal } = useCartStore()

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleCheckout = () => {
    setOpen(false)
    window.location.href = `${window.location.pathname}/checkout`
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <ScaleIn className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </ScaleIn>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
              <AnimateList className="space-y-4">
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    className="flex flex-col space-y-2 border-b pb-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <motion.div className="flex items-center space-x-2">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                        </motion.div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateQuantity(item.id, parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-16 text-center"
                        />
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                    <Textarea
                      placeholder="Special instructions..."
                      value={item.special_instructions || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateSpecialInstructions(item.id, e.target.value)
                      }
                      className="h-20 resize-none"
                    />
                    <motion.div whileTap={{ scale: 0.95 }} className="self-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </motion.div>
                  </ListItem>
                ))}
              </AnimateList>
            </ScrollArea>
            <motion.div 
              className="border-t pt-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
} 