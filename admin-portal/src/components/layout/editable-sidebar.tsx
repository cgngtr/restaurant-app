'use client'

import * as React from 'react'
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
  ChevronDown,
  Calculator,
  GripVertical,
  Pencil,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRestaurant } from '@/providers/restaurant-provider'
import { useNavigation } from '@/hooks/use-navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { NavigationItemWithChildren } from '@/types/navigation'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  MenuIcon,
  Table2,
  ClipboardList,
  Settings,
  Sliders,
  Package,
  FolderTree,
  Building2,
  Calculator
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive: boolean
  isEditing?: boolean
  isDragging?: boolean
  isVisible?: boolean
}

function NavLink({ href, children, isActive, isEditing, isDragging, isVisible = true }: NavLinkProps) {
  if (!isVisible && !isEditing) {
    return null
  }

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
        isDragging && 'bg-accent/50',
        !isVisible && 'opacity-50'
      )}
      onClick={(e) => {
        if (isEditing) e.preventDefault()
      }}
    >
      {children}
    </Link>
  )
}

interface EditNavigationDialogProps {
  item: NavigationItemWithChildren | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: { name: string; icon: string; is_visible: boolean }) => void
}

function EditNavigationDialog({ item, open, onOpenChange, onSave }: EditNavigationDialogProps) {
  const [name, setName] = useState(item?.name || '')
  const [icon, setIcon] = useState(item?.icon || 'LayoutDashboard')
  const [isVisible, setIsVisible] = useState(item?.is_visible ?? true)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setIcon(item.icon)
      setIsVisible(item.is_visible)
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, icon, is_visible: isVisible })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Navigation Item' : 'Add Navigation Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(ICON_MAP).map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center">
                      {React.createElement(ICON_MAP[iconName], { className: 'h-4 w-4 mr-2' })}
                      {iconName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
            <Label htmlFor="visible">Show in sidebar</Label>
          </div>
          <DialogFooter>
            <Button type="submit">{item ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditableSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItemWithChildren | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { logout, restaurant } = useRestaurant()
  const { navigation, loading, updateNavigationItem, createNavigationItem, deleteNavigationItem, reorderNavigationItems } = useNavigation()

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
    if (!isEditing) {
      setOpenDropdown(openDropdown === name ? null : name)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(navigation)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index
    }))

    try {
      await reorderNavigationItems(updates)
      toast({
        title: 'Navigation updated',
        description: 'The navigation order has been updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update navigation order.',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (item: NavigationItemWithChildren) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSaveEdit = async (values: { name: string; icon: string; is_visible: boolean }) => {
    try {
      if (editingItem) {
        await updateNavigationItem({
          id: editingItem.id,
          name: values.name,
          icon: values.icon,
          is_visible: values.is_visible
        })
        toast({
          title: 'Item updated',
          description: 'Navigation item has been updated successfully.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save item.',
        variant: 'destructive'
      })
    }
  }

  const handleVisibilityToggle = async (item: NavigationItemWithChildren) => {
    try {
      await updateNavigationItem({
        id: item.id,
        is_visible: !item.is_visible
      })
      toast({
        title: 'Visibility updated',
        description: `${item.name} is now ${item.is_visible ? 'hidden' : 'visible'}.`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visibility.',
        variant: 'destructive'
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <Store className="h-6 w-6 text-primary" />
          <span className="ml-3 text-lg font-semibold text-foreground">Orderwise</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <X className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="navigation">
            {(provided) => (
              <ul
                role="list"
                className="flex flex-col gap-1 p-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {navigation.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          {isEditing && (
                            <div
                              {...provided.dragHandleProps}
                              className="px-2 cursor-grab"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {item.children ? (
                              <div className="flex flex-col">
                                <NavLink
                                  href={item.href}
                                  isActive={pathname === item.href}
                                  isEditing={isEditing}
                                  isDragging={snapshot.isDragging}
                                  isVisible={item.is_visible}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center min-w-0">
                                      {React.createElement(ICON_MAP[item.icon] || Package, {
                                        className: "h-5 w-5 shrink-0 mr-3"
                                      })}
                                      <span className="truncate">{item.name}</span>
                                    </div>
                                    {item.children && item.children.length > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0 hover:bg-transparent ml-2"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          toggleDropdown(item.name)
                                        }}
                                      >
                                        <ChevronDown
                                          className={cn(
                                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                            openDropdown === item.name ? "rotate-180" : ""
                                          )}
                                        />
                                      </Button>
                                    )}
                                  </div>
                                </NavLink>
                                {openDropdown === item.name && (
                                  <ul className="pl-8 mt-1 space-y-1">
                                    {item.children.map((child) => {
                                      const isChildActive = pathname === child.href
                                      return (
                                        <li key={child.name} className="flex items-center gap-2">
                                          <div className="flex-1 min-w-0">
                                            <NavLink
                                              href={child.href}
                                              isActive={isChildActive}
                                              isEditing={isEditing}
                                              isVisible={child.is_visible}
                                            >
                                              <div className="flex items-center min-w-0">
                                                {React.createElement(ICON_MAP[child.icon] || Package, {
                                                  className: "h-4 w-4 shrink-0 mr-3"
                                                })}
                                                <span className="truncate">{child.name}</span>
                                              </div>
                                            </NavLink>
                                          </div>
                                          {isEditing && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 shrink-0"
                                              onClick={() => handleEdit(child)}
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </li>
                                      )
                                    })}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <NavLink
                                href={item.href}
                                isActive={pathname === item.href}
                                isEditing={isEditing}
                                isDragging={snapshot.isDragging}
                                isVisible={item.is_visible}
                              >
                                <div className="flex items-center min-w-0">
                                  {React.createElement(ICON_MAP[item.icon] || Package, {
                                    className: "h-5 w-5 shrink-0 mr-3"
                                  })}
                                  <span className="truncate">{item.name}</span>
                                </div>
                              </NavLink>
                            )}
                          </div>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </nav>

      <div className="border-t p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="flex-1 justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 px-3 py-2 h-auto"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-5 w-5 shrink-0 mr-3" />
          {isLoggingOut ? 'Logging Out...' : 'Log Out'}
        </Button>
        <div className="h-8 w-[1px] bg-border mx-4" />
        <ThemeToggle />
      </div>

      <EditNavigationDialog
        item={editingItem}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveEdit}
      />
    </div>
  )
} 