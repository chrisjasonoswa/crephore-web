<script setup lang="ts">
import type { SectionBackground } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { ImageIcon } from '@lucide/vue'
import { sectionBackgroundLabels } from '~/features/sections/section.type'
import { lightBackground } from '~/site-theme/useSiteTheme'
import WebsiteChoiceGroup from './WebsiteChoiceGroup.vue'

// The section's background, as cards with a swatch in the event's colours (only the ones its layout supports).
const props = defineProps<{
  backgrounds: SectionBackground[]
  theme: SiteTheme
  // Shown in the Photo swatch when set
  photoUrl?: string
}>()

const background = defineModel<SectionBackground>({ required: true })

const choices = computed(() => props.backgrounds.map(value => ({ value, label: sectionBackgroundLabels[value] })))

const swatchColors = computed<Record<Exclude<SectionBackground, 'photo'>, string>>(() => ({
  light: lightBackground(props.theme),
  primary: props.theme.primaryColor,
  accent: props.theme.accentColor,
}))
</script>

<template>
  <WebsiteChoiceGroup v-model="background" :choices="choices" label="Background">
    <template #swatch="{ choice }">
      <span
        class="flex size-7 items-center justify-center overflow-hidden rounded-full border shadow-xs"
        :style="choice.value === 'photo' ? undefined : { backgroundColor: swatchColors[choice.value] }"
      >
        <template v-if="choice.value === 'photo'">
          <img v-if="photoUrl" :src="photoUrl" alt="" class="size-full object-cover">
          <ImageIcon v-else class="size-3.5 text-muted-foreground" />
        </template>
      </span>
    </template>
  </WebsiteChoiceGroup>
</template>
