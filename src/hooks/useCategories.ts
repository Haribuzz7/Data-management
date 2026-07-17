import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { Category } from '@/types'

async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name')

    if (error) throw error

    // Refresh the offline cache so the picker works with zero connectivity.
    await db.categories.bulkPut(data)
    return data
  } catch {
    // Offline, or Supabase unreachable — fall back to last-cached copy.
    const cached = await db.categories.toArray()
    if (cached.length > 0) return cached
    throw new Error('No cached categories available offline yet.')
  }
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}
