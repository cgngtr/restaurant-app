import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const subscribeToOrders = (
  restaurantId: string,
  callback: (payload: any) => void
) => {
  console.log('Subscribing to orders for restaurant:', restaurantId);
  
  const channel = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        console.log('Received real-time update:', payload);
        callback(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order_items',
        filter: `order_id=in.(select id from orders where restaurant_id=eq.${restaurantId})`,
      },
      (payload) => {
        console.log('Received order items update:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return channel;
}

// Helper function to compress image before upload
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height
      const maxDimension = 1200

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width
        width = maxDimension
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height
        height = maxDimension
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        0.85
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
  })
}

// Helper function for image uploads
export const uploadMenuImage = async (file: File, itemId: string) => {
  try {
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('File must be JPEG, PNG, or WebP')
    }

    // Compress image before upload
    const compressedImage = await compressImage(file)
    const fileExt = 'jpg' // We're converting everything to JPEG for consistency
    const fileName = `${itemId}-${Date.now()}.${fileExt}`

    console.log('Attempting to upload file:', {
      fileName,
      originalSize: file.size,
      compressedSize: compressedImage.size,
      fileType: 'image/jpeg'
    })

    // Delete old images for this item
    const { data: existingFiles } = await supabase.storage
      .from('menu-images')
      .list('', {
        search: itemId
      })

    if (existingFiles?.length) {
      await Promise.all(
        existingFiles.map(file => 
          supabase.storage
            .from('menu-images')
            .remove([file.name])
        )
      )
    }

    // Attempt to upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, compressedImage, {
        cacheControl: '31536000', // Cache for 1 year
        upsert: true,
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Get public URL with transformation parameters
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName, {
        transform: {
          width: 800,
          height: 600,
          resize: 'cover'
        }
      })

    return publicUrl
  } catch (error) {
    console.error('Error in uploadMenuImage:', error)
    throw error
  }
}

// Initialize storage bucket for menu images
export const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const menuImagesBucket = buckets?.find(b => b.name === 'menu-images')

    if (!menuImagesBucket) {
      const { data, error } = await supabase.storage.createBucket('menu-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      })

      if (error) {
        console.error('Error creating menu-images bucket:', error)
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
  }
}

// Initialize storage on app load
if (typeof window !== 'undefined') {
  initializeStorage() }