'use client'

import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <p className="mt-2 text-sm text-gray-500">Loading...</p>
    </div>
  )
} 