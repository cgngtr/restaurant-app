'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
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
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: React.ReactNode }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(true)
      
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
      setIsLoading(false)
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
        setIsLoading(false);
        return;
      }

      // Session kontrolü
      console.log('[DEBUG] Checking session...');
      
      let currentSession: Session | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!currentSession && retryCount < maxRetries) {
        // Önce mevcut session'ı kontrol et
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          currentSession = session;
          break;
        }

        if (sessionError) {
          console.error('[DEBUG] Session error:', sessionError);
          // Hata durumunda 1 saniye bekle ve tekrar dene
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
          continue;
        }

        // Session yoksa refresh token ile yenilemeyi dene
        console.log('[DEBUG] No current session, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();

        if (refreshedSession) {
          currentSession = refreshedSession;
          break;
        }

        if (refreshError) {
          console.error('[DEBUG] Refresh error:', refreshError);
          // Hata durumunda 1 saniye bekle ve tekrar dene
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
          continue;
        }

        // Başarısız olursa 1 saniye bekle ve tekrar dene
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCount++;
      }

      if (!currentSession) {
        console.log('[DEBUG] No valid session after retries, redirecting to login');
        if (!isAuthPage) {
          router.replace('/login');
        }
        return;
      }

      try {
        // Restaurant staff ve restoran bilgilerini tek sorguda çek
        console.log('[DEBUG] Fetching restaurant staff data for user:', currentSession.user.id);
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
          .eq('profile_id', currentSession.user.id)
          .single();

        console.log('[DEBUG] Raw staff query result:', JSON.stringify(staffData, null, 2));
        console.log('[DEBUG] Restaurant data structure:', staffData?.restaurant);

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

        if (!staffData || !staffData.restaurant) {
          console.error('[DEBUG] No restaurant data found in staff data');
          throw new Error('Restoran bulunamadı');
        }

        // Tip güvenliği için dönüşüm
        type RestaurantResponse = {
          restaurant: {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
            address: string | null;
            contact_email: string;
            contact_phone: string | null;
            active: boolean;
            created_at: string;
          };
        };

        const typedStaffData = staffData as unknown as RestaurantResponse;
        const restaurantData: Restaurant = {
          id: typedStaffData.restaurant.id,
          name: typedStaffData.restaurant.name,
          slug: typedStaffData.restaurant.slug,
          logo_url: typedStaffData.restaurant.logo_url,
          address: typedStaffData.restaurant.address,
          contact_email: typedStaffData.restaurant.contact_email,
          contact_phone: typedStaffData.restaurant.contact_phone,
          active: typedStaffData.restaurant.active,
          created_at: typedStaffData.restaurant.created_at
        };

        setRestaurant(restaurantData);
        console.log('[DEBUG] Restaurant data set successfully');
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
      setIsLoading(false);
    }
  }, [supabase, isAuthPage, logout, restaurant?.id, pathname]);

  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout;

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

    // Her 4 dakikada bir session'ı kontrol et ve gerekirse yenile
    sessionCheckInterval = setInterval(async () => {
      if (!mounted) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session varsa yenilemeyi dene
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        console.error('[DEBUG] Session refresh error:', error);
      }
    }, 4 * 60 * 1000); // 4 dakika

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
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[DEBUG] User signed in or token refreshed');
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
      clearInterval(sessionCheckInterval);
    };
  }, [supabase, router, isAuthPage, loadRestaurant]);

  return (
    <RestaurantContext.Provider value={{ restaurant, isLoading, error }}>
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