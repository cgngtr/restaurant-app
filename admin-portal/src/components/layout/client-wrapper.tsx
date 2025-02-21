'use client'

import { useEffect, useState } from 'react'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Prevent AudioContext initialization
    const originalCreateAudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (originalCreateAudioContext) {
      (window as any).AudioContext = class extends originalCreateAudioContext {
        constructor(options?: AudioContextOptions) {
          super(options)
          // State is read-only, so we don't modify it
        }
      }
      ;(window as any).webkitAudioContext = (window as any).AudioContext
    }

    // Clean up browser extension classes
    const body = document.body
    const originalClasses = body.className.split(' ').filter(cls => 
      !cls.includes('vsc-') && 
      !cls.includes('volumecontrol-')
    )
    body.className = originalClasses.join(' ')

    // Mount component
    setMounted(true)

    return () => {
      // Clean up classes on unmount
      const cleanClasses = body.className.split(' ').filter(cls => 
        !cls.includes('vsc-') && 
        !cls.includes('volumecontrol-')
      )
      body.className = cleanClasses.join(' ')
    }
  }, [])

  // Return null during SSR
  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return <>{children}</>
} 