'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { getSupabaseClient } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  contact_email: string;
  contact_phone: string | null;
  active: boolean;
  created_at: string;
}

interface RestaurantStaffData {
  id: string;
  restaurant_id: string;
  profile_id: string;
  role: string;
  created_at: string;
  restaurant: Restaurant;
}

interface RestaurantContextType {
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: React.ReactNode }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const authListenerRef = useRef<(() => void) | null>(null)

  // Auth sayfalarını kontrol et
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  // Supabase client'ı useMemo ile oluştur
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Restaurant bilgilerini yükle
  const loadRestaurant = useCallback(async (session: Session | null) => {
    try {
      // Auth sayfalarında veri yükleme
      if (isAuthPage || !session) {
        setIsLoading(false);
        return;
      }

      // First check if user is superadmin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error('Kullanıcı profili bulunamadı');
      }

      // If user is superadmin, return default admin restaurant
      if (profileData?.role === 'superadmin') {
        setRestaurant({
          id: 'admin',
          name: 'Admin',
          slug: 'admin',
          logo_url: null,
          address: null,
          contact_email: session.user.email || '',
          contact_phone: null,
          active: true,
          created_at: new Date().toISOString()
        });
        setError(null);
        setIsLoading(false);
        return;
      }

      // Restaurant staff ve restoran bilgilerini tek sorguda çek
      const { data: staffData, error: staffError } = await supabase
        .from('restaurant_staff')
        .select(`
          id,
          restaurant_id,
          profile_id,
          role,
          created_at,
          restaurant:restaurants!inner (
            id,
            name,
            slug,
            logo_url,
            address,
            contact_email,
            contact_phone,
            active,
            created_at
          )
        `)
        .eq('profile_id', session.user.id)
        .single() as { 
          data: RestaurantStaffData | null, 
          error: any 
        };

      if (staffError) {
        if (staffError.code === 'PGRST116') {
          throw new Error('Bu kullanıcıya atanmış restoran bulunamadı');
        }
        throw new Error('Restoran bilgilerine erişim sağlanamadı');
      }

      if (!staffData || !staffData.restaurant) {
        throw new Error('Restoran bulunamadı');
      }

      const restaurantData: Restaurant = staffData.restaurant;
      setRestaurant(restaurantData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Bilinmeyen bir hata oluştu'));
      setRestaurant(null);
      
      if (!isAuthPage) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, isAuthPage]);

  // Auth state değişikliklerini izle
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Mevcut session'ı kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          await loadRestaurant(session);
        }

        // Auth state listener'ı ayarla
        if (!authListenerRef.current) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (isMounted) {
                await loadRestaurant(session);
              }
            }
          );
          authListenerRef.current = subscription.unsubscribe;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('Auth initialization failed'));
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      if (authListenerRef.current) {
        authListenerRef.current();
        authListenerRef.current = null;
      }
    };
  }, [supabase, loadRestaurant]);

  // Logout fonksiyonu
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Önce state'leri temizle
      setRestaurant(null);
      setError(null);
      
      // Local storage'ı temizle
      localStorage.clear();
      
      // Session cookie'lerini temizle
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Auth listener'ı temizle
      if (authListenerRef.current) {
        authListenerRef.current();
        authListenerRef.current = null;
      }
      
      // Supabase oturumunu sonlandır ve login'e yönlendir
      await supabase.auth.signOut();
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout Error:', error);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const value = useMemo(() => ({
    restaurant,
    isLoading,
    error,
    logout
  }), [restaurant, isLoading, error, logout]);

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}; 