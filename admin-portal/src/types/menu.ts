import type { Database } from '@/types/supabase';

export interface DietaryFlag {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url?: string | undefined;
  dietary_flags?: DietaryFlag[];
  customization_options?: {
    type: 'burger' | 'coffee' | null;
    extras: Record<string, number>;
    sides: Record<string, number>;
    sizes: Record<string, number>;
    milk_options: Record<string, number>;
  };
}; 