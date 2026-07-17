import { useRef } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'
import type { PickedPhoto } from '@/hooks/usePhotoPicker'

interface PhotoPickerRowProps {
  photos: PickedPhoto[]
  onAdd: (files: FileList) => void
  onRemove: (id: string) => void
}

export default function PhotoPickerRow({ photos, onAdd, onRemove }: PhotoPickerRowProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      {/* Hidden native inputs — camera opens the device camera directly
          via the `capture` attribute; gallery allows multi-select. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files)
          e.target.value = ''
        }}
      />

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 h-24 rounded-card border-2 border-dashed border-line flex flex-col
                     items-center justify-center gap-1 text-ink-muted active:bg-canvas"
        >
          <Camera size={22} />
          <span className="text-xs font-medium">Take photo</span>
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex-1 h-24 rounded-card border-2 border-dashed border-line flex flex-col
                     items-center justify-center gap-1 text-ink-muted active:bg-canvas"
        >
          <ImagePlus size={22} />
          <span className="text-xs font-medium">Add from gallery</span>
        </button>
      </div>

      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative shrink-0 w-20 h-20 rounded-control overflow-hidden">
              <img src={photo.previewUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label="Remove photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/60 text-white
                           flex items-center justify-center backdrop-blur-sm min-h-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
