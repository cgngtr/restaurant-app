'use client'

import { useState, useEffect, useCallback } from 'react'
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
  loading?: 'lazy' | 'eager'
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
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  loading = 'lazy',
  onLoadingComplete,
  onVisibilityChange,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgSrc, setImgSrc] = useState(src)
  const [localPriority, setLocalPriority] = useState(priority)
  const [isVisible, setIsVisible] = useState(false)

  // Handle image loading and errors
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoadingComplete?.()
  }, [onLoadingComplete])

  const handleError = useCallback(() => {
    console.warn('Image failed to load:', src)
    setImgSrc('https://via.placeholder.com/400x300?text=Image+Not+Found')
    setIsLoading(false)
  }, [src])

  // Preload image
  useEffect(() => {
    if (!src || src.startsWith('data:')) return

    const img = new window.Image()
    img.src = src
    img.onload = handleLoad
    img.onerror = handleError

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, handleLoad, handleError])

  // Intersection Observer for lazy loading and visibility tracking
  useEffect(() => {
    if (loading === 'eager' || priority) {
      setLocalPriority(true)
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLocalPriority(true)
            setIsVisible(true)
            onVisibilityChange?.(true)
          } else {
            setIsVisible(false)
            onVisibilityChange?.(false)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    const element = document.getElementById(`img-${src}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [src, priority, loading, onVisibilityChange])

  // Progressive loading effect
  const containerClasses = cn(
    'overflow-hidden relative',
    isLoading && 'animate-pulse bg-gray-200',
    className
  )

  const imageClasses = cn(
    'duration-700 ease-in-out',
    isLoading
      ? 'scale-110 blur-2xl grayscale'
      : 'scale-100 blur-0 grayscale-0'
  )

  return (
    <div
      id={`img-${src}`}
      className={containerClasses}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      {isVisible && (
        <>
          <div
            className={cn(
              'absolute inset-0 bg-gray-100 transition-opacity duration-700',
              isLoading ? 'opacity-100' : 'opacity-0'
            )}
          />
          <Image
            src={imgSrc}
            alt={alt}
            className={imageClasses}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            sizes={sizes}
            priority={localPriority}
            quality={quality}
            onLoadingComplete={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      )}
    </div>
  )
} 