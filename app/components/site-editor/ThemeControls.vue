<script setup lang="ts">
import type { CornerStyle, SiteTheme } from '~/site-theme/useSiteTheme'
import { TriangleAlert } from '@lucide/vue'
import { normalizeHex } from '~/site-theme/color'
import { fontPairings } from '~/site-theme/fontPairings'
import { backgroundPresets, colorPresets } from '~/site-theme/presets'
import { lightBackground, siteThemeWarnings } from '~/site-theme/useSiteTheme'
import ColorInput from './ColorInput.vue'

// Site-wide settings (colours, light background, fonts, corners): they apply to every section of the page.
// Used by the event website editor and the admin playground.
const theme = defineModel<SiteTheme>('theme', { required: true })

const id = useId()
const cornerStyles: CornerStyle[] = ['sharp', 'soft', 'round']

// Presets are a shortcut; any colour can be picked below. None is selected when the colours are custom.
const isColorPreset = (preset: (typeof colorPresets)[number]) =>
  preset.primaryColor === theme.value.primaryColor && preset.accentColor === theme.value.accentColor
const setColorPreset = (preset: (typeof colorPresets)[number]) =>
  (theme.value = { ...theme.value, primaryColor: preset.primaryColor, accentColor: preset.accentColor })

const primaryColor = computed({
  get: () => theme.value.primaryColor,
  set: color => (theme.value = { ...theme.value, primaryColor: color }),
})

const accentColor = computed({
  get: () => theme.value.accentColor,
  set: color => (theme.value = { ...theme.value, accentColor: color }),
})

// The light background: a preset, or any colour (kept light). The field shows the colour in use (white by default).
const effectiveBackground = computed(() => lightBackground(theme.value))
const backgroundColor = computed({
  get: () => effectiveBackground.value,
  set: color => (theme.value = { ...theme.value, backgroundColor: color }),
})
const isBackgroundPreset = (color: string | null) =>
  color === null ? !theme.value.backgroundColor : theme.value.backgroundColor === color
const setBackgroundPreset = (color: string | null) =>
  (theme.value = { ...theme.value, backgroundColor: color ?? undefined })
// A custom colour that was too dark or too colourful for a page background
const backgroundAdjusted = computed(() =>
  !!theme.value.backgroundColor && normalizeHex(theme.value.backgroundColor) !== effectiveBackground.value,
)

// Readable text is guaranteed by the theme; these flag colours that make buttons or sections blend in.
const warnings = computed(() => siteThemeWarnings(theme.value))

const fontPairingKey = computed({
  get: () => theme.value.fontPairingKey,
  set: key => (theme.value = { ...theme.value, fontPairingKey: key }),
})

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one.
function setCornerStyle(next: unknown) {
  if (typeof next === 'string' && next)
    theme.value = { ...theme.value, cornerStyle: next as CornerStyle }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <Label>Colors</Label>
      <div class="grid grid-cols-2 gap-2" role="group" aria-label="Colour presets">
        <button
          v-for="preset in colorPresets"
          :key="preset.name"
          type="button"
          :aria-pressed="isColorPreset(preset)"
          class="flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:ring-1 aria-pressed:ring-primary"
          @click="setColorPreset(preset)"
        >
          <span class="flex shrink-0 -space-x-1">
            <span class="size-4 rounded-full border border-background" :style="{ backgroundColor: preset.primaryColor }" />
            <span class="size-4 rounded-full border border-background" :style="{ backgroundColor: preset.accentColor }" />
          </span>
          <span class="truncate">{{ preset.name }}</span>
        </button>
      </div>

      <div class="mt-1 grid grid-cols-2 gap-3">
        <ColorInput :id="`${id}-primary`" v-model="primaryColor" label="Primary" />
        <ColorInput :id="`${id}-accent`" v-model="accentColor" label="Accent" />
      </div>

      <ul v-if="warnings.length" class="mt-1 flex flex-col gap-1.5">
        <li v-for="warning in warnings" :key="warning" class="flex gap-2 text-sm text-amber-700 dark:text-amber-400">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          {{ warning }}
        </li>
      </ul>
    </div>

    <div class="flex flex-col gap-2">
      <Label>Light background</Label>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Light background presets">
        <button
          v-for="preset in backgroundPresets"
          :key="preset.name"
          type="button"
          :title="preset.name"
          :aria-label="preset.name"
          :aria-pressed="isBackgroundPreset(preset.color)"
          class="relative size-8 cursor-pointer rounded-full border shadow-xs ring-offset-2 ring-offset-background transition-shadow aria-pressed:ring-2 aria-pressed:ring-ring"
          :style="{ backgroundColor: preset.color ?? lightBackground({}) }"
          @click="setBackgroundPreset(preset.color)"
        />
      </div>
      <ColorInput :id="`${id}-background`" v-model="backgroundColor" label="Custom" />
      <p v-if="backgroundAdjusted" class="text-xs text-muted-foreground">
        Lightened to {{ effectiveBackground }} so it works as a page background and text stays readable.
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-fonts`">Fonts</Label>
      <Select v-model="fontPairingKey">
        <SelectTrigger :id="`${id}-fonts`" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="pairing in fontPairings" :key="pairing.key" :value="pairing.key">
            {{ pairing.name }}
            <span class="text-xs text-muted-foreground">{{ pairing.heading.family }} + {{ pairing.body.family }}</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex flex-col gap-2">
      <Label>Corners</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        :model-value="theme.cornerStyle"
        class="w-full"
        @update:model-value="setCornerStyle"
      >
        <ToggleGroupItem v-for="option in cornerStyles" :key="option" :value="option" class="flex-1 capitalize">
          {{ option }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
</template>
