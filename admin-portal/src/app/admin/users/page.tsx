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
import { Badge } from '@/components/ui/badge'
import { Search, MoreVertical } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface User {
  id: string
  email: string
  display_name: string
  role: 'superadmin' | 'restaurant_owner' | 'staff'
  created_at: string
  updated_at: string
  restaurant?: {
    id: string
    name: string
  } | null
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          restaurant:restaurant_staff (
            restaurant:restaurants (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      // Transform the data to match our interface
      const transformedProfiles = profiles.map((profile: any) => ({
        ...profile,
        restaurant: profile.restaurant?.[0]?.restaurant || null
      }))

      return transformedProfiles as User[]
    }
  })

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRoleChange = async (user: User, newRole: 'restaurant_owner' | 'staff') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: `User role updated successfully`,
      })

      refetch()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user role',
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.display_name}
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === 'superadmin'
                          ? 'destructive'
                          : user.role === 'restaurant_owner'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'superadmin' 
                      ? 'None' 
                      : user.restaurant?.name || 'Not Assigned'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.updated_at).toLocaleDateString()}
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
                        {user.role !== 'superadmin' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(
                                user, 
                                user.role === 'restaurant_owner' ? 'staff' : 'restaurant_owner'
                              )}
                            >
                              {user.role === 'restaurant_owner' ? 'Make Staff' : 'Make Restaurant Owner'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
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