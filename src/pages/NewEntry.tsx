import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, Calendar } from 'lucide-react'

import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import CategoryPicker from '@/components/activity/CategoryPicker'
import TagInput from '@/components/activity/TagInput'
import PhotoPickerRow from '@/components/activity/PhotoPickerRow'
import { usePhotoPicker } from '@/hooks/usePhotoPicker'
import { useCreateActivity } from '@/hooks/useCreateActivity'

function today() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
}

export default function NewEntry() {
  const navigate = useNavigate()
  const { photos, addFiles, removePhoto, reset: resetPhotos } = usePhotoPicker()
  const createActivity = useCreateActivity()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())
  const [location, setLocation] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [titleError, setTitleError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setTitleError('Give this activity a title.')
      return
    }
    setTitleError(null)

    await createActivity.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      location: location.trim(),
      activity_date: date,
      tags,
      photos: photos.map((p) => p.file),
    })

    resetPhotos()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header — close button, matches sheet-like feel even as a full page */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3
                   bg-canvas/90 backdrop-blur-lg border-b border-line
                   pt-[calc(0.75rem+env(safe-area-inset-top))]"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Cancel"
          className="w-10 h-10 flex items-center justify-center rounded-full text-ink-muted active:bg-surface min-h-0"
        >
          <X size={22} />
        </button>
        <h1 className="text-base font-semibold">New Activity</h1>
        <div className="w-10" /> {/* balances the close button for centered title */}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 flex flex-col gap-5">
        <Input
          label="Title"
          placeholder="e.g. Soil testing at Kannampalayam farm"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError(null)
          }}
          error={titleError ?? undefined}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="Date"
            icon={<Calendar size={18} />}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today()}
          />
          <Input
            label="Location"
            placeholder="Village / farm name"
            icon={<MapPin size={18} />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
          <CategoryPicker value={categoryId} onChange={setCategoryId} />
        </div>

        <Textarea
          label="Description"
          placeholder="What happened, who was involved, key observations…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />

        <TagInput value={tags} onChange={setTags} />

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Photos</label>
          <PhotoPickerRow photos={photos} onAdd={addFiles} onRemove={removePhoto} />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={createActivity.isPending}
          className="mt-2"
        >
          Save Activity
        </Button>
      </form>
    </div>
  )
}
