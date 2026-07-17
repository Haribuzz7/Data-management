import { useCategories } from '@/hooks/useCategories'
import Chip from '@/components/ui/Chip'
import { Loader2 } from 'lucide-react'

interface CategoryPickerProps {
  value: string | null
  onChange: (categoryId: string) => void
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { data: categories, isLoading, isError } = useCategories()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-faint py-2">
        <Loader2 size={16} className="animate-spin" /> Loading categories…
      </div>
    )
  }

  if (isError || !categories?.length) {
    return <p className="text-sm text-ink-faint py-2">Categories unavailable — check your connection.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          selected={value === cat.id}
          color={cat.color ?? undefined}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </Chip>
      ))}
    </div>
  )
}
