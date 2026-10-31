// A file uploaded for an event (crephore-backend MediaDto). For now: photos for its website.
export type MediaType = 'Photo'
export type MediaPurpose = 'WebsiteAsset'

export interface Media {
  id: number
  type: MediaType
  purpose: MediaPurpose
  // Where browsers load it from; sections store this URL
  url: string
  contentType: string
  sizeBytes: number
  createdAt: string
}

// What the API accepts (it checks the file's bytes, not its name)
export const photoContentTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const photoMaxBytes = 10 * 1024 * 1024
