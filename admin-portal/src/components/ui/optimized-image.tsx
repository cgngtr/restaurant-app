import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  onLoadingComplete?: () => void
  onVisibilityChange?: (isVisible: boolean) => void
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  onLoadingComplete,
  onVisibilityChange,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgSrc, setImgSrc] = useState(src)
  const [localPriority, setLocalPriority] = useState(priority)

  // Simple preload check
  useEffect(() => {
    if (!src || src.startsWith('data:')) return

    const img = new window.Image()
    img.src = src

    const handleLoad = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      console.warn('Image failed to load:', src)
      setImgSrc('https://via.placeholder.com/400x300?text=Image+Not+Found')
      setIsLoading(false)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [src])

  // Intersection Observer for lazy loading and visibility tracking
  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setLocalPriority(true)
              onVisibilityChange?.(true)
            } else {
              onVisibilityChange?.(false)
            }
          })
        },
        {
          rootMargin: '100px',
          threshold: 0.1,
        }
      )

      const element = document.getElementById(`img-${src}`)
      if (element) {
        observer.observe(element)
      }

      return () => observer.disconnect()
    }
  }, [src, priority, onVisibilityChange])

  return (
    <div 
      id={`img-${src}`}
      className={cn(
        'overflow-hidden relative',
        isLoading && 'animate-pulse bg-gray-200',
        className
      )}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gray-100 transition-opacity duration-700',
          isLoading ? 'opacity-100' : 'opacity-0'
        )}
      />
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
        )}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={localPriority}
        quality={quality}
        onLoadingComplete={() => {
          setIsLoading(false)
          onLoadingComplete?.()
        }}
        onError={() => {
          setImgSrc('https://via.placeholder.com/400x300?text=Image+Not+Found')
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
} 