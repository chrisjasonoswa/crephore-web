import { afterEach, describe, expect, it, vi } from 'vitest'
import { photoMaxSide, scaledSize, shrinkPhoto } from '~/features/media/photo'

const fileOf = (type: string, bytes: number, name = 'IMG_1234.jpg') => new File([new Uint8Array(bytes)], name, { type })

// The browser's decoding and canvas, which the test environment doesn't have: a photo of `width` × `height` that the
// canvas encodes to `encodedBytes` (as WebP unless `webp` is false)
function stubBrowser(width: number, height: number, encodedBytes: number, webp = true) {
  const close = vi.fn()
  const drawImage = vi.fn()
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width, height, close })))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (this: HTMLCanvasElement, done, type) {
    const written = type === 'image/webp' && !webp ? 'image/png' : type!
    done(new Blob([new Uint8Array(encodedBytes)], { type: written }))
  })
  return { close, drawImage }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('photo', () => {
  it('fits a size to the long side, never enlarging it', () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: photoMaxSide, height: 1800 })
    expect(scaledSize(3000, 6000)).toEqual({ width: 1200, height: photoMaxSide })
    expect(scaledSize(1200, 800)).toEqual({ width: 1200, height: 800 })
  })

  it('scales a large photo down and re-encodes it as WebP, keeping its name', async () => {
    const { drawImage, close } = stubBrowser(4000, 3000, 400_000)
    const photo = await shrinkPhoto(fileOf('image/jpeg', 6_000_000))

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, photoMaxSide, 1800)
    expect(close).toHaveBeenCalled()
    expect(photo).toMatchObject({ name: 'IMG_1234.webp', type: 'image/webp', size: 400_000 })
  })

  it('falls back to JPEG where the browser can\'t write WebP, and keeps a PNG a PNG', async () => {
    stubBrowser(4000, 3000, 400_000, false)
    expect((await shrinkPhoto(fileOf('image/jpeg', 6_000_000))).type).toBe('image/jpeg')
    expect((await shrinkPhoto(fileOf('image/png', 6_000_000, 'logo.png'))).name).toBe('logo.png')
  })

  it('uploads a GIF, a small photo, or one that wouldn\'t come out smaller as it is', async () => {
    stubBrowser(1200, 800, 900_000)
    const gif = fileOf('image/gif', 3_000_000)
    const small = fileOf('image/jpeg', 500_000)
    const large = fileOf('image/jpeg', 2_000_000)

    expect(await shrinkPhoto(gif)).toBe(gif)
    expect(await shrinkPhoto(small)).toBe(small)
    stubBrowser(4000, 3000, 3_000_000)
    expect(await shrinkPhoto(large)).toBe(large)
  })

  it('uploads the photo as it is when the browser can\'t decode it', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => {
      throw new Error('Unsupported')
    }))
    const file = fileOf('image/jpeg', 6_000_000)

    expect(await shrinkPhoto(file)).toBe(file)
  })
})
