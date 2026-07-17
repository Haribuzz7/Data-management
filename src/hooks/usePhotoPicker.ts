import { useCallback, useEffect, useRef, useState } from 'react'

export interface PickedPhoto {
  id: string
  file: File
  previewUrl: string
}

export function usePhotoPicker() {
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const photosRef = useRef(photos)
  photosRef.current = photos

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: PickedPhoto[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }, [])

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  const reset = useCallback(() => {
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    setPhotos([])
  }, [])

  // Clean up object URLs on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
  }, [])

  return { photos, addFiles, removePhoto, reset }
}
