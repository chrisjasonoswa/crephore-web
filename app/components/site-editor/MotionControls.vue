<script setup lang="ts">
import type { MotionIntensity, PageIntroKey } from '~/features/site-motion/site-motion.type'
import type { EventKind } from '~/site-theme/eventKinds'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { Play } from '@lucide/vue'
import { introDuration } from '~/features/site-motion/presets'
import { motionIntensities, motionIntensityLabels, normalizeSiteMotion, pageIntros } from '~/features/site-motion/site-motion.type'
import { eventKindLabels, eventKinds } from '~/site-theme/eventKinds'

// The site's intro animation (theme.motion): how fast it plays (first), and the intro when the site opens. Listed by kind of
// event in the colour presets' order (Any: intros for every event, and None), opening on the selected intro's kind:
// each scene (scenes/) a card with its mood and length; picking one plays it in the preview. "Play intro" asks the
// preview to play it (`play-intro`). `eventKind`: the event's kind, opened only when the intro isn't found.
const props = defineProps<{ eventKind?: EventKind }>()
const theme = defineModel<SiteTheme>('theme', { required: true })
const emit = defineEmits<{ 'play-intro': [] }>()

const id = useId()
const motion = computed(() => normalizeSiteMotion(theme.value.motion))
const current = computed(() => pageIntros.find(choice => choice.key === motion.value.intro))
const description = computed(() => current.value?.description)

// Opens on the selected intro's kind (Any too); `eventKind` only when none is found
const introKind = ref<EventKind>(current.value?.kind ?? props.eventKind ?? 'any')
const shownIntros = computed(() => pageIntros.filter(choice => choice.kind === introKind.value))
const seconds = (key: PageIntroKey) => `${(introDuration(key, motion.value.intensity) / 1000).toFixed(1)} s`

function setIntro(intro: PageIntroKey) {
  theme.value = { ...theme.value, motion: { ...motion.value, intro } }
  // Play it in the page preview (no intro has nothing to play)
  if (intro !== 'none')
    emit('play-intro')
}

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one
function setIntensity(next: unknown) {
  if (typeof next === 'string' && next)
    theme.value = { ...theme.value, motion: { ...motion.value, intensity: next as MotionIntensity } }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-intensity`">Intensity</Label>
      <ToggleGroup
        :id="`${id}-intensity`"
        type="single"
        variant="outline"
        :model-value="motion.intensity"
        class="w-full"
        @update:model-value="setIntensity"
      >
        <ToggleGroupItem v-for="intensity in motionIntensities" :key="intensity" :value="intensity" class="flex-1">
          {{ motionIntensityLabels[intensity] }}
        </ToggleGroupItem>
      </ToggleGroup>
      <p class="text-xs text-muted-foreground">
        How quickly the intro plays: subtle is quickest, bold takes its time. Guests who ask their device for less motion get a simple fade.
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex min-h-8 items-center justify-between gap-2">
        <Label :id="`${id}-intro`">Intro animation</Label>
        <Button type="button" variant="outline" size="sm" data-play-intro :disabled="motion.intro === 'none'" @click="emit('play-intro')">
          <Play />
          Play intro
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">
        {{ description }}
      </p>
      <div class="flex flex-wrap gap-1" role="group" aria-label="Intros for">
        <button
          v-for="kind in eventKinds"
          :key="kind"
          type="button"
          :data-intro-kind="kind"
          :aria-pressed="introKind === kind"
          class="cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          @click="introKind = kind"
        >
          {{ eventKindLabels[kind] }}
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2" role="group" :aria-labelledby="`${id}-intro`">
        <button
          v-for="choice in shownIntros"
          :key="choice.key"
          type="button"
          :data-motion-choice="choice.key"
          :aria-pressed="motion.intro === choice.key"
          :title="choice.description"
          class="flex cursor-pointer flex-col gap-0.5 rounded-md border px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:ring-1 aria-pressed:ring-primary"
          @click="setIntro(choice.key)"
        >
          <span class="truncate font-medium">{{ choice.label }}</span>
          <span v-if="choice.mood" class="truncate text-muted-foreground">{{ choice.mood }} · {{ seconds(choice.key) }}</span>
          <span v-else class="truncate text-muted-foreground">No intro</span>
        </button>
      </div>
    </div>

  </div>
</template>
