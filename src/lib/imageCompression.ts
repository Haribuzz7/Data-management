import imageCompression from 'browser-image-compression'

export interface ProcessedImage {
  fullBlob: Blob
  thumbBlob: Blob
  width: number
  height: number
}

/**
 * Compresses a captured/picked photo into two variants:
 *  - full: reasonable quality, capped at 1600px — what she'll actually view
 *  - thumb: small + light, for gallery grids and the New Entry preview row
 *
 * Runs in a web worker so it doesn't freeze the UI on a mid-range phone.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const [fullBlob, thumbBlob] = await Promise.all([
    imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 0.6,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8,
    }),
    imageCompression(file, {
      maxWidthOrHeight: 400,
      maxSizeMB: 0.08,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.7,
    }),
  ])

  const { width, height } = await getImageDimensions(fullBlob)

  return { fullBlob, thumbBlob, width, height }
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}
