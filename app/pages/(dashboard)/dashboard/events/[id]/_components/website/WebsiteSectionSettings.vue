<script setup lang="ts">
import type { WebsiteSection } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import type { CountdownContent, HeroContent } from '~/features/sections/section.content.type'
import type { SectionLayoutOption } from '~/features/sections/section.options'
import type { SectionBackground, SectionOccasion } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { ArrowLeft, Eye, EyeOff } from '@lucide/vue'
import SectionThumbnail from '~/components/sections/SectionThumbnail.vue'
import { positions, resolveLayoutOptions } from '~/features/sections/section.options'
import { backgroundPhotoOf, layoutPhotosOf, withBackgroundPhoto, withLayoutPhoto } from '~/features/sections/section.photos'
import { changeSectionLayout, getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import WebsiteBackgroundPicker from './WebsiteBackgroundPicker.vue'
import WebsiteChoiceGroup from './WebsiteChoiceGroup.vue'
import WebsiteCountdownFields from './WebsiteCountdownFields.vue'
import WebsiteHeroFields from './WebsiteHeroFields.vue'
import WebsiteLayoutPickerDialog from './WebsiteLayoutPickerDialog.vue'
import WebsitePhotoField from './WebsitePhotoField.vue'
import WebsitePositionPicker from './WebsitePositionPicker.vue'

// Everything about one section, top to bottom: its layout (picked from thumbnails), the layout's placement options,
// the background (and its photo), the photos inside the layout, and the text.
const props = defineProps<{
  event: Event
  theme: SiteTheme
  occasion: SectionOccasion
}>()

const section = defineModel<WebsiteSection>('section', { required: true })

const emit = defineEmits<{
  back: []
}>()

const definition = computed(() => getSectionType(section.value.type))
const layout = computed(() => getSectionLayout(section.value.type, section.value.layout))
const options = computed(() => (layout.value ? resolveLayoutOptions(layout.value.options, section.value.options) : {}))

const isLayoutPickerOpen = ref(false)
// Switching layout resets its options and keeps the background when the new layout supports it
const pickLayout = (key: string) => (section.value = changeSectionLayout(section.value, key))

function setOption(key: string, next: unknown) {
  if (typeof next === 'string' && next)
    section.value = { ...section.value, options: { ...options.value, [key]: next } }
}

// The 3×3 position options get a position picker; the rest a row of toggles
const isPositionOption = (option: SectionLayoutOption) =>
  option.choices.length === positions.length && option.choices.every(choice => (positions as readonly string[]).includes(choice.value))

const background = computed({
  get: () => section.value.background,
  set: (next: SectionBackground) => (section.value = { ...section.value, background: next }),
})
const backgroundPhoto = computed({
  get: () => backgroundPhotoOf(section.value),
  set: url => (section.value = withBackgroundPhoto(section.value, url)),
})
// One field per photo the layout shows
const layoutPhotoSlots = computed(() => Array.from({ length: layout.value?.layoutPhotoCount ?? 0 }, (_, index) => index))
const layoutPhotos = computed(() => layoutPhotosOf(section.value))
const setLayoutPhoto = (index: number, url: string | undefined) =>
  (section.value = withLayoutPhoto(section.value, index, url))

// `Section` doesn't narrow its content by `type`, so each content editor gets it cast to its type
const heroContent = computed({
  get: () => section.value.content as HeroContent,
  set: content => (section.value = { ...section.value, content }),
})
const countdownContent = computed({
  get: () => section.value.content as CountdownContent,
  set: content => (section.value = { ...section.value, content }),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="All sections" title="All sections" @click="emit('back')">
        <ArrowLeft />
      </Button>
      <h3 class="flex-1 font-semibold">
        {{ definition.name }}
      </h3>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :aria-pressed="!section.isVisible"
        @click="section = { ...section, isVisible: !section.isVisible }"
      >
        <EyeOff v-if="!section.isVisible" />
        <Eye v-else />
        {{ section.isVisible ? 'Shown' : 'Hidden' }}
      </Button>
    </div>

    <p v-if="!section.isVisible" class="-mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
      Hidden from guests. It stays here so you can show it again.
    </p>

    <section class="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h4 class="text-sm font-bold">
        Layout
      </h4>
      <button
        type="button"
        data-change-layout
        class="group flex cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left transition-colors hover:border-primary/60"
        @click="isLayoutPickerOpen = true"
      >
        <SectionThumbnail :section="section" :theme="theme" :occasion="occasion" class="aspect-16/10 w-full rounded-lg border bg-muted" />
        <span class="flex items-center justify-between gap-2 px-1 pb-0.5">
          <span class="text-sm font-medium">{{ layout?.name }}</span>
          <span class="text-xs font-medium text-primary group-hover:underline">Change layout</span>
        </span>
      </button>

      <!-- The layout's placement options -->
      <div v-for="option in layout?.options ?? []" :key="option.key" class="flex flex-col gap-2">
        <Label class="text-xs text-muted-foreground">{{ option.label }}</Label>
        <WebsitePositionPicker
          v-if="isPositionOption(option)"
          :model-value="options[option.key]!"
          :label="option.label"
          :choices="option.choices"
          @update:model-value="setOption(option.key, $event)"
        />
        <WebsiteChoiceGroup
          v-else
          :model-value="options[option.key]!"
          :choices="option.choices"
          :label="option.label"
          @update:model-value="setOption(option.key, $event)"
        />
      </div>
    </section>

    <section class="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h4 class="text-sm font-bold">
        Background
      </h4>
      <WebsiteBackgroundPicker
        v-if="(layout?.backgrounds.length ?? 0) > 1"
        v-model="background"
        :backgrounds="layout!.backgrounds"
        :theme="theme"
        :photo-url="backgroundPhoto"
      />
      <p v-else class="text-xs text-muted-foreground">
        This layout sits on a photo.
      </p>
      <WebsitePhotoField
        v-if="section.background === 'photo'"
        v-model:url="backgroundPhoto"
        :event-id="event.id"
        label="Background photo"
        hint="Behind the whole section, under a soft overlay so the text stays readable. Without one, your primary colour is used."
      />
    </section>

    <section v-if="layoutPhotoSlots.length" class="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h4 class="text-sm font-bold">
        {{ layoutPhotoSlots.length === 1 ? 'Photo' : 'Photos' }}
      </h4>
      <WebsitePhotoField
        v-for="index in layoutPhotoSlots"
        :key="index"
        :url="layoutPhotos[index] || undefined"
        :event-id="event.id"
        :label="layoutPhotoSlots.length === 1 ? 'Photo' : `Photo ${index + 1}`"
        :hide-label="layoutPhotoSlots.length === 1"
        @update:url="setLayoutPhoto(index, $event)"
      />
      <p class="text-xs text-muted-foreground">
        Shown inside the layout. Until you add one, a soft placeholder keeps its shape.
      </p>
    </section>

    <section class="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h4 class="text-sm font-bold">
        Text
      </h4>
      <WebsiteHeroFields v-if="section.type === 'hero'" v-model:content="heroContent" :event="event" />
      <WebsiteCountdownFields v-else-if="section.type === 'countdown'" v-model:content="countdownContent" />
    </section>

    <WebsiteLayoutPickerDialog
      v-model:open="isLayoutPickerOpen"
      :section="section"
      :theme="theme"
      :occasion="occasion"
      @pick="pickLayout"
    />
  </div>
</template>
