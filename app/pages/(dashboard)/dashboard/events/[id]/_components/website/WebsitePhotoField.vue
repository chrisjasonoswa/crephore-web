<script setup lang="ts">
import { ImageIcon, LoaderCircle, Upload, X } from '@lucide/vue'
import { uploadPhoto } from '~/features/media/media.api'
import { photoContentTypes, photoMaxBytes } from '~/features/media/media.type'
import { cToast } from '~/lib/cToast'

// One optional photo: upload it (stored right away; the section keeps its URL) or remove it, with a small preview.
// `large` shows the photo (or a placeholder) as a box filling the width, h-48 like the venue's map preview, with the
// buttons over its top corner.
const props = defineProps<{
  eventId: number
  label: string
  hint?: string
  // Keep the label for screen readers only, when a heading above already names the field
  hideLabel?: boolean
  large?: boolean
}>()

const url = defineModel<string | undefined>('url', { required: true })

const labelId = useId()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const isUploading = ref(false)

// A photo that doesn't load shows the icon instead of a broken image
const failed = ref(false)
watch(url, () => (failed.value = false))

async function onFileChange(event: globalThis.Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Picking the same file again should upload it again
  input.value = ''
  if (!file)
    return

  // Checked here too, so a wrong file gets an answer without uploading it
  if (!photoContentTypes.includes(file.type))
    return cToast({ title: 'Choose a JPG, PNG, WebP or GIF photo.', type: 'error' })
  if (file.size > photoMaxBytes)
    return cToast({ title: 'The photo must be 10 MB or smaller.', type: 'error' })

  isUploading.value = true
  try {
    url.value = (await uploadPhoto(props.eventId, file)).data.url
  }
  catch {
    // The API client already showed its message
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div role="group" :aria-labelledby="labelId" class="flex flex-col gap-2">
    <span :id="labelId" data-photo-label class="text-sm leading-none font-medium" :class="hideLabel && 'sr-only'">{{ label }}</span>
    <div :class="large ? 'relative h-48 overflow-hidden rounded-lg border bg-muted' : 'flex items-center gap-2'">
      <span
        data-photo-preview
        class="flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground"
        :class="large ? 'size-full' : 'size-12 rounded-md border'"
      >
        <LoaderCircle v-if="isUploading" :class="large ? 'size-5' : 'size-4'" class="animate-spin" />
        <img v-else-if="url && !failed" :src="url" alt="" class="size-full object-cover" @error="failed = true">
        <ImageIcon v-else :class="large ? 'size-5' : 'size-4'" />
      </span>
      <input
        ref="fileInput"
        type="file"
        :accept="photoContentTypes.join(',')"
        class="hidden"
        data-photo-input
        @change="onFileChange"
      >
      <!-- Large: over the photo's top corner, solid (Replace white, remove in the error colour) so they read on any photo -->
      <div :class="large ? 'absolute top-2 right-2 flex items-center gap-1.5' : 'contents'">
        <Button type="button" variant="outline" size="sm" :class="large && 'border-transparent bg-white text-neutral-900 shadow-sm hover:bg-neutral-100 hover:text-neutral-900 dark:bg-white dark:hover:bg-neutral-100'" :disabled="isUploading" @click="fileInput?.click()">
          <Upload />
          {{ isUploading ? 'Uploading…' : url ? 'Replace' : 'Upload photo' }}
        </Button>
        <Button
          v-if="url && !isUploading"
          type="button"
          variant="ghost"
          size="icon-sm"
          :class="large && 'bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:text-white dark:bg-destructive dark:hover:bg-destructive/90'"
          :aria-label="`Remove ${label.toLowerCase()}`"
          title="Remove"
          @click="url = undefined"
        >
          <X />
        </Button>
      </div>
    </div>
    <p v-if="hint" class="text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
