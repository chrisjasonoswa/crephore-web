<script setup lang="ts">
import type { CornerStyle, SiteTheme } from '~/site-theme/useSiteTheme'
import { TriangleAlert } from '@lucide/vue'
import { fontPairings } from '~/site-theme/fontPairings'
import { colorPresets } from '~/site-theme/presets'
import { siteThemeWarnings } from '~/site-theme/useSiteTheme'
import PlaygroundColorInput from './PlaygroundColorInput.vue'

// Site-wide settings: they apply to every section in the preview.
const theme = defineModel<SiteTheme>('theme', { required: true })

const cornerStyles: CornerStyle[] = ['sharp', 'soft', 'round']

const presetName = computed({
  get: () => colorPresets.find(preset =>
    preset.primaryColor === theme.value.primaryColor && preset.accentColor === theme.value.accentColor,
  )?.name,
  set: (name) => {
    const preset = colorPresets.find(p => p.name === name)
    if (preset)
      theme.value = { ...theme.value, primaryColor: preset.primaryColor, accentColor: preset.accentColor }
  },
})

const primaryColor = computed({
  get: () => theme.value.primaryColor,
  set: color => (theme.value = { ...theme.value, primaryColor: color }),
})

const accentColor = computed({
  get: () => theme.value.accentColor,
  set: color => (theme.value = { ...theme.value, accentColor: color }),
})

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
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <Label for="playground-colours">Colors</Label>
      <Select v-model="presetName">
        <SelectTrigger id="playground-colours" class="w-full">
          <SelectValue placeholder="Custom" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="preset in colorPresets" :key="preset.name" :value="preset.name">
            <span class="flex items-center gap-2">
              <span class="size-3 rounded-full" :style="{ backgroundColor: preset.primaryColor }" />
              <span class="size-3 rounded-full" :style="{ backgroundColor: preset.accentColor }" />
              {{ preset.name }}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Presets are a shortcut; any colour can be picked. The select shows "Custom" when none matches. -->
      <div class="mt-1 grid grid-cols-2 gap-3">
        <PlaygroundColorInput id="playground-primary" v-model="primaryColor" label="Primary" />
        <PlaygroundColorInput id="playground-accent" v-model="accentColor" label="Accent" />
      </div>

      <ul v-if="warnings.length" class="mt-1 flex flex-col gap-1.5">
        <li v-for="warning in warnings" :key="warning" class="flex gap-2 text-sm text-amber-700 dark:text-amber-400">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          {{ warning }}
        </li>
      </ul>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="playground-fonts">Fonts</Label>
      <Select v-model="fontPairingKey">
        <SelectTrigger id="playground-fonts" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="pairing in fontPairings" :key="pairing.key" :value="pairing.key">
            {{ pairing.name }}
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
