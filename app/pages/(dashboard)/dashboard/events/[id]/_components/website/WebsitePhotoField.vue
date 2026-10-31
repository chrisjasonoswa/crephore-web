<script setup lang="ts">
import { ImageIcon, LoaderCircle, Upload, X } from '@lucide/vue'
import { uploadPhoto } from '~/features/media/media.api'
import { photoContentTypes, photoMaxBytes } from '~/features/media/media.type'
import { cToast } from '~/lib/cToast'

// One optional photo: upload it (stored right away; the section keeps its URL) or remove it, with a small preview.
const props = defineProps<{
  eventId: number
  label: string
  hint?: string
  // Keep the label for screen readers only, when a heading above already names the field
  hideLabel?: boolean
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
    <div class="flex items-center gap-2">
      <span class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
        <LoaderCircle v-if="isUploading" class="size-4 animate-spin" />
        <img v-else-if="url && !failed" :src="url" alt="" class="size-full object-cover" @error="failed = true">
        <ImageIcon v-else class="size-4" />
      </span>
      <input
        ref="fileInput"
        type="file"
        :accept="photoContentTypes.join(',')"
        class="hidden"
        data-photo-input
        @change="onFileChange"
      >
      <Button type="button" variant="outline" size="sm" :disabled="isUploading" @click="fileInput?.click()">
        <Upload />
        {{ isUploading ? 'Uploading…' : url ? 'Replace' : 'Upload photo' }}
      </Button>
      <Button
        v-if="url && !isUploading"
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="`Remove ${label.toLowerCase()}`"
        title="Remove"
        @click="url = undefined"
      >
        <X />
      </Button>
    </div>
    <p v-if="hint" class="text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
