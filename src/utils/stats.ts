import type { ActivityListItem } from '@/types'

export interface QuickStats {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay() // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day // shift so Monday is start
  const result = new Date(d)
  result.setDate(d.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function computeStats(items: ActivityListItem[]): QuickStats {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA')
  const weekStart = startOfWeekMonday(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let today = 0
  let thisWeek = 0
  let thisMonth = 0

  for (const item of items) {
    const d = new Date(item.activity_date + 'T00:00:00')
    if (item.activity_date === todayStr) today++
    if (d >= weekStart) thisWeek++
    if (d >= monthStart) thisMonth++
  }

  return { today, thisWeek, thisMonth, total: items.length }
}
