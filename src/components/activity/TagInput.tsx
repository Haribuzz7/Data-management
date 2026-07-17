import { useState, type KeyboardEvent } from 'react'
import Chip from '@/components/ui/Chip'
import Input from '@/components/ui/Input'
import { Tag } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const commitDraft = () => {
    const clean = draft.trim().toLowerCase()
    if (clean && !value.includes(clean)) {
      onChange([...value, clean])
    }
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitDraft()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <Input
        label="Tags"
        icon={<Tag size={18} />}
        placeholder="Type a tag, then press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {value.map((tag) => (
            <Chip key={tag} onRemove={() => onChange(value.filter((t) => t !== tag))}>
              {tag}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}
