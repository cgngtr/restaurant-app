import type { Database } from '@/types/supabase';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url?: string | undefined;
  dietary_flags?: {
    type: 'burger' | 'coffee' | null;
    extras: Record<string, number>;
    sides: Record<string, number>;
    sizes: Record<string, number>;
    milk_options: Record<string, number>;
  };
  customization_options?: {
    type: 'burger' | 'coffee' | null;
    extras: Record<string, number>;
    sides: Record<string, number>;
    sizes: Record<string, number>;
    milk_options: Record<string, number>;
  };
}; 