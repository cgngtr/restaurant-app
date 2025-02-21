import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { RestaurantNavigationItem, SuperadminNavigationItem } from '@/types/navigation';

const ADMIN_NAVIGATION = [
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    sort_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin-restaurants',
    name: 'Restaurants',
    href: '/admin/restaurants',
    icon: 'Store',
    sort_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin-users',
    name: 'Users',
    href: '/admin/users',
    icon: 'Users',
    sort_order: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin-analytics',
    name: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart',
    sort_order: 4,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin-settings',
    name: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    sort_order: 5,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as SuperadminNavigationItem[];

export const useNavigation = () => {
  const { profile, loading: userLoading, isSuperadmin } = useUser();

  const { data: restaurantNavigation, isLoading: navLoading } = useQuery({
    queryKey: ['navigation', profile?.role],
    queryFn: async () => {
      if (!profile || isSuperadmin) return null;

      const { data, error } = await supabase
        .from('navigation_settings')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching restaurant navigation:', error);
        return null;
      }

      return data as RestaurantNavigationItem[];
    },
    enabled: !!profile && !isSuperadmin,
  });

  return {
    navigation: isSuperadmin ? ADMIN_NAVIGATION : restaurantNavigation,
    isLoading: userLoading || navLoading,
    isSuperadmin,
  };
}; 