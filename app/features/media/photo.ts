// Photos as phones take them are often 4 to 8 MB at 4000 px or more, but a website never shows more than about 2400 px
// of one, so they're scaled down and re-encoded in the browser before uploading: a fraction of the size for guests,
// with no visible difference. GIFs (which may be animated: a canvas keeps one frame) and photos already small enough
// upload as they are, and so does anything the browser can't decode or that wouldn't come out smaller.

export const photoMaxSide = 2400
const photoQuality = 0.85
// Within the size limit, a photo this light isn't worth re-encoding
const lightEnoughBytes = 1024 * 1024

/** A width and height scaled to fit `max` on the long side (never enlarged). */
export function scaledSize(width: number, height: number, max = photoMaxSide) {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, photoQuality))

/** The photo to upload: scaled down and re-encoded when that makes it smaller, else the file as it is. */
export async function shrinkPhoto(file: File): Promise<File> {
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function')
    return file

  let bitmap: ImageBitmap
  try {
    // Turned upright by the photo's own orientation (`imageOrientation: 'from-image'` is the default)
    bitmap = await createImageBitmap(file)
  }
  catch {
    return file
  }

  const size = scaledSize(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  const context = size.width === bitmap.width && file.size <= lightEnoughBytes ? null : canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }
  canvas.width = size.width
  canvas.height = size.height
  context.drawImage(bitmap, 0, 0, size.width, size.height)
  bitmap.close()

  // WebP where the browser can write it; otherwise PNG keeps a PNG's transparency, and JPEG for the rest
  let blob = await toBlob(canvas, 'image/webp')
  if (!blob || blob.type !== 'image/webp')
    blob = await toBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg')
  if (!blob || blob.size >= file.size)
    return file

  const extension = blob.type.split('/')[1] === 'jpeg' ? 'jpg' : blob.type.split('/')[1]
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: blob.type })
}
