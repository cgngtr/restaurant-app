'use client'

import { useEffect, useState } from 'react'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Browser extension class'larını temizle
    const body = document.body
    const originalClasses = body.className.split(' ').filter(cls => 
      !cls.includes('vsc-') && 
      !cls.includes('volumecontrol-')
    )
    body.className = originalClasses.join(' ')

    // Component'i mount et
    setMounted(true)

    return () => {
      // Unmount olduğunda class'ları tekrar temizle
      const cleanClasses = body.className.split(' ').filter(cls => 
        !cls.includes('vsc-') && 
        !cls.includes('volumecontrol-')
      )
      body.className = cleanClasses.join(' ')
    }
  }, [])

  // SSR sırasında null döndür
  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return <>{children}</>
} 