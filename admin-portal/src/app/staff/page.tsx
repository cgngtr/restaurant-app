'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRestaurant } from '@/providers/restaurant-provider'

interface StaffMember {
  id: string
  name: string
  role: string
  email: string
  status: 'active' | 'inactive'
}

interface DatabaseStaffMember {
  id: string
  profile_id: string
  role: string
  profiles: { email: string }[]
}

// Helper function for role badge colors
const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'chef':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'waiter':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Staff page component
export default function StaffPage() {
  const { restaurant } = useRestaurant()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (restaurant?.id) {
      fetchStaff()
    }
  }, [restaurant?.id])

  const fetchStaff = async () => {
    if (!restaurant?.id) return

    try {
      const { data, error } = await supabase
        .from('restaurant_staff')
        .select(`
          id,
          profile_id,
          role,
          profiles!inner(email)
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at')

      if (error) throw error

      console.log('Fetched data:', data);

      // Transform the data to match StaffMember interface
      const transformedData: StaffMember[] = (data as DatabaseStaffMember[] || []).map(staff => {
        const email = staff.profiles?.[0]?.email || ''
        return {
          id: staff.id,
          name: email ? email.split('@')[0] : 'Unknown',
          role: staff.role,
          email: email,
          status: 'active' as const
        }
      })

      setStaff(transformedData)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch staff members',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    managers: staff.filter(s => s.role.toLowerCase() === 'manager').length,
    chefs: staff.filter(s => s.role.toLowerCase() === 'chef').length,
    waiters: staff.filter(s => s.role.toLowerCase() === 'waiter').length,
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading staff data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Staff</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Staff</h3>
          <p className="text-2xl font-bold">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Managers</h3>
          <p className="text-2xl font-bold">{stats.managers}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Chefs</h3>
          <p className="text-2xl font-bold">{stats.chefs}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Waiters</h3>
          <p className="text-2xl font-bold">{stats.waiters}</p>
        </Card>
      </div>

      {/* Staff Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}