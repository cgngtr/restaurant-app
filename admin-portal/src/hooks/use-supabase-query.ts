'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

interface UseSupabaseQueryProps {
  key: string[]
  query: any
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    gcTime?: number
  }
}

export function useSupabaseQuery<T>({ 
  key, 
  query,
  options = {}
}: UseSupabaseQueryProps) {
  const {
    enabled = true,
    refetchInterval = 0,
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 30 // 30 minutes
  } = options

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await query
      if (error) throw error
      return data as T
    },
    enabled,
    refetchInterval,
    staleTime,
    gcTime,
    retry: 1
  })
} 