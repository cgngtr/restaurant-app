import type { Database } from '@/types/supabase';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url?: string | undefined;
  category?: {
    name: string;
  };
  customization_options?: {
    size?: {
      options: string[];
      required: boolean;
    };
    extras?: {
      options: string[];
      required: boolean;
    };
    spiciness?: {
      options: string[];
      required: boolean;
    };
  };
}; 