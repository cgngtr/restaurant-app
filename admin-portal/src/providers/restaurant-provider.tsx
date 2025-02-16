'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { getSupabaseClient } from '@/lib/supabase'

type Restaurant = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  active: boolean
}

type RestaurantStaff = {
  id: string;
  restaurant_id: string;
  profile_id: string;
  role: string;
  restaurants: Restaurant;
  created_at: string;
}

type RestaurantContextType = {
  restaurant: Restaurant | null
  loading: boolean
  error: Error | null
  logout: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  loading: true,
  error: null,
  logout: async () => {},
})

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Auth sayfalarını kontrol et
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  // Supabase client'ı useMemo ile oluştur
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Logout fonksiyonu
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      
      // Önce state'leri temizle
      setRestaurant(null)
      setError(null)
      
      // Local storage'ı temizle
      localStorage.clear()
      
      // Session cookie'lerini temizle
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Supabase oturumunu sonlandır ve login'e yönlendir
      await supabase.auth.signOut()
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Logout Error:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Restaurant bilgilerini yükle
  const loadRestaurant = useCallback(async () => {
    console.log('[DEBUG] ====== loadRestaurant Cycle Start ======');
    try {
      console.log('[DEBUG] loadRestaurant started', {
        isAuthPage,
        restaurantId: restaurant?.id,
        pathname
      });

      // Auth sayfalarında veri yükleme
      if (isAuthPage) {
        console.log('[DEBUG] Auth page detected, skipping data load');
        setLoading(false);
        return;
      }

      // Session kontrolü
      console.log('[DEBUG] Checking session...');
      
      // Önce mevcut session'ı kontrol et
      const { data: { session: currentSession }, error: currentSessionError } = await supabase.auth.getSession();
      console.log('[DEBUG] Current session check:', {
        hasSession: !!currentSession,
        error: currentSessionError
      });

      if (currentSessionError) {
        console.error('[DEBUG] Current session error:', currentSessionError);
        throw currentSessionError;
      }

      // Eğer session yoksa, refresh token ile yenilemeyi dene
      if (!currentSession) {
        console.log('[DEBUG] No current session, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        console.log('[DEBUG] Session refresh result:', {
          hasRefreshedSession: !!refreshedSession,
          refreshError
        });

        if (refreshError) {
          console.error('[DEBUG] Session refresh error:', refreshError);
          throw refreshError;
        }

        if (!refreshedSession) {
          console.log('[DEBUG] No session after refresh, logging out');
          await logout();
          return;
        }
      }

      const session = currentSession || await supabase.auth.getSession().then(res => res.data.session);
      
      if (!session) {
        console.log('[DEBUG] No valid session found, logging out');
        await logout();
        return;
      }

      try {
        // Restaurant staff ve restoran bilgilerini tek sorguda çek
        console.log('[DEBUG] Fetching restaurant staff data for user:', session.user.id);
        const staffResult = await supabase
          .from('restaurant_staff')
          .select(`
            id,
            restaurant_id,
            profile_id,
            role,
            created_at,
            restaurant:restaurants (
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
          .single();

        console.log('[DEBUG] Raw staff query result:', staffResult);

        const { data: staffData, error: staffError } = staffResult;

        console.log('[DEBUG] Restaurant staff query result:', {
          hasData: !!staffData,
          staffError,
          staffData
        });

        if (staffError) {
          console.error('[DEBUG] Staff Error:', {
            code: staffError.code,
            message: staffError.message,
            details: staffError.details,
            hint: staffError.hint
          });
          if (staffError.code === 'PGRST116') {
            throw new Error('Bu kullanıcıya atanmış restoran bulunamadı');
          }
          throw new Error('Restoran bilgilerine erişim sağlanamadı');
        }

        if (!staffData?.restaurant) {
          console.error('[DEBUG] No restaurant data found in staff data');
          throw new Error('Restoran bulunamadı');
        }

        // Tip güvenliği için dönüşüm
        const restaurantData: Restaurant = {
          id: staffData.restaurant.id,
          name: staffData.restaurant.name,
          slug: staffData.restaurant.slug,
          logo_url: staffData.restaurant.logo_url,
          address: staffData.restaurant.address,
          contact_email: staffData.restaurant.contact_email,
          contact_phone: staffData.restaurant.contact_phone,
          active: staffData.restaurant.active
        };

        console.log('[DEBUG] Setting restaurant data:', restaurantData);
        setRestaurant(restaurantData);
        setError(null);
      } catch (dbError) {
        console.error('[DEBUG] Database operation error:', dbError);
        throw dbError;
      }
    } catch (err) {
      console.error('[DEBUG] Load Restaurant Error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err : new Error('Bilinmeyen bir hata oluştu'));
      setRestaurant(null);
      
      toast({
        variant: "destructive",
        title: "Hata",
        description: err instanceof Error ? err.message : 'Restoran bilgileri yüklenirken bir hata oluştu',
      });

      if (err instanceof Error && 
         (err.message.includes('JWT') || 
          err.message.includes('session') || 
          err.message.includes('token'))) {
        console.log('[DEBUG] JWT/Session error detected, logging out');
        await logout();
      }
    } finally {
      console.log('[DEBUG] loadRestaurant completed');
      console.log('[DEBUG] ====== loadRestaurant Cycle End ======');
      setLoading(false);
    }
  }, [supabase, isAuthPage, logout, restaurant?.id, pathname]);

  useEffect(() => {
    let mounted = true;

    // İlk yükleme ve session kontrolü
    const initializeAuth = async () => {
      if (!mounted) return;

      try {
        console.log('[DEBUG] initializeAuth started');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[DEBUG] Initial session check:', {
          hasSession: !!session,
          sessionError,
          isAuthPage
        });

        if (sessionError) throw sessionError;

        if (!session && !isAuthPage) {
          console.log('[DEBUG] No session, redirecting to login');
          router.replace('/login');
          return;
        }

        if (session && isAuthPage) {
          console.log('[DEBUG] Session exists on auth page, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        }

        if (session && !isAuthPage) {
          console.log('[DEBUG] Session exists, loading restaurant data');
          await loadRestaurant();
        }
      } catch (error) {
        console.error('[DEBUG] Auth initialization error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        if (!isAuthPage) {
          router.replace('/login');
        }
      }
    };

    console.log('[DEBUG] Setting up auth state listener');
    initializeAuth();

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('[DEBUG] Auth state changed:', {
        event,
        hasSession: !!session,
        isAuthPage
      });

      if (event === 'SIGNED_OUT') {
        console.log('[DEBUG] User signed out');
        setRestaurant(null);
        setError(null);
        if (!isAuthPage) {
          router.replace('/login');
        }
      } else if (event === 'SIGNED_IN') {
        console.log('[DEBUG] User signed in');
        if (isAuthPage) {
          router.replace('/dashboard');
        } else {
          await loadRestaurant();
        }
      } else if (session && !isAuthPage) {
        console.log('[DEBUG] Session exists, loading restaurant data');
        await loadRestaurant();
      }
    });

    return () => {
      console.log('[DEBUG] Cleaning up auth state listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, isAuthPage, loadRestaurant]);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, error, logout }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export const useRestaurant = () => {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider')
  }
  return context
} 