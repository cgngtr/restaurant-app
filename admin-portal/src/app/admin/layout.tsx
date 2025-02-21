'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isSuperadmin, loading } = useUser()

  useEffect(() => {
    if (!loading && !isSuperadmin) {
      router.push('/dashboard')
    }
  }, [isSuperadmin, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isSuperadmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 