'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, Search } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Restaurant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  contact_email: string
  contact_phone: string | null
  active: boolean
  created_at: string
}

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data: restaurants, isLoading, refetch } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Restaurant[]
    }
  })

  const filteredRestaurants = restaurants?.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusChange = async (restaurant: Restaurant) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ active: !restaurant.active })
        .eq('id', restaurant.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Restaurant status updated successfully`,
      })

      refetch()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update restaurant status',
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Add a new restaurant to the platform.
              </DialogDescription>
            </DialogHeader>
            {/* Add restaurant form will go here */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Restaurant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants?.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">
                    {restaurant.name}
                    <div className="text-sm text-muted-foreground">
                      {restaurant.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{restaurant.contact_email}</div>
                    <div className="text-sm text-muted-foreground">
                      {restaurant.contact_phone}
                    </div>
                  </TableCell>
                  <TableCell>{restaurant.address || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={restaurant.active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(restaurant)}
                    >
                      {restaurant.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Restaurant</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Restaurant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
} 