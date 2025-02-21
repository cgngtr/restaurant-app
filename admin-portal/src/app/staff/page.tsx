'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Filter, MoreVertical, UserPlus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRestaurant } from '@/providers/restaurant-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StaffMember {
  id: string
  name: string
  role: string
  email: string
  status: 'active' | 'inactive'
  avatarUrl?: string
}

interface DatabaseStaffMember {
  id: string
  profile_id: string
  role: string
  profiles: { 
    email: string
    display_name?: string 
  }
}

// Helper function for role badge colors
const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'restaurant_owner':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'waiter':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const StaffSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-12" />
        </Card>
      ))}
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Staff page component
export default function StaffPage() {
  const { restaurant } = useRestaurant()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'table'>('grid')

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
        .select(`id, profile_id, role, profiles!inner(email, display_name)`) // Added !inner to ensure profiles is an object
        .eq('restaurant_id', restaurant.id)
        .order('created_at')

      if (error) throw error

      console.log('Fetched data:', data);

      // Transform the data to match StaffMember interface
      const transformedData: StaffMember[] = (data as unknown as DatabaseStaffMember[] || []).map(staff => {
        const email = staff.profiles?.email || ''
        return {
          id: staff.id,
          name: staff.profiles?.display_name || email.split('@')[0],
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

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    waiters: staff.filter(s => s.role.toLowerCase() === 'waiter').length,
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <StaffSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage your restaurant staff members and their roles</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Total Staff</h3>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Active Staff</h3>
            <p className="text-3xl font-bold mt-2">{stats.active}</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-green-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Waiters</h3>
            <p className="text-3xl font-bold mt-2">{stats.waiters}</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-green-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
              <SelectItem value="waiter">Waiters</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Staff Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit Details</DropdownMenuItem>
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Remove Staff</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role}
                </Badge>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}