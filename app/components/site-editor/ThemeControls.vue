<script setup lang="ts">
import type { EventKind } from '~/site-theme/eventKinds'
import type { ColorPreset } from '~/site-theme/presets'
import type { CornerStyle, SiteTheme } from '~/site-theme/useSiteTheme'
import { Palette, Sparkles, TriangleAlert, Type } from '@lucide/vue'
import { motionIntensityLabels, normalizeSiteMotion, pageIntros } from '~/features/site-motion/site-motion.type'
import { normalizeHex } from '~/site-theme/color'
import { fontPairingGroups, fontPairings, fontStack } from '~/site-theme/fontPairings'
import { eventKindLabels, eventKinds } from '~/site-theme/eventKinds'
import { backgroundPresets, colorPresets } from '~/site-theme/presets'
import { lightBackground, secondaryFor, siteThemeWarnings } from '~/site-theme/useSiteTheme'
import ColorInput from './ColorInput.vue'
import MotionControls from './MotionControls.vue'

// Site-wide settings, in three groups that open one at a time (an accordion, all closed at first so every group shows
// at a glance; each row says what's chosen): Colors (presets, the brand colours, the light background), Fonts &
// corners, and Animation (the intro, intensity first). They apply to every section of the page. Used by the event
// website editor and the admin playground. `play-intro`: the motion's "Play intro" button.
// The presets open on the kind of the preset in use; with custom colours, on `eventKind` (the event's kind), else any.
const props = defineProps<{ eventKind?: EventKind }>()
const theme = defineModel<SiteTheme>('theme', { required: true })
const emit = defineEmits<{ 'play-intro': [] }>()

const id = useId()
const cornerStyles: CornerStyle[] = ['sharp', 'soft', 'round']

// Presets are a shortcut; any colour can be picked below. None is selected when the colours are custom. Listed by kind
// of event, one kind at a time.
const isColorPreset = (preset: ColorPreset) =>
  preset.primaryColor === theme.value.primaryColor
  && preset.secondaryColor === theme.value.secondaryColor
  && preset.accentColor === theme.value.accentColor
function setColorPreset({ primaryColor, secondaryColor, accentColor }: ColorPreset) {
  const { secondaryColor: _secondary, accentColor: _accent, ...rest } = theme.value
  theme.value = { ...rest, primaryColor, ...(secondaryColor && { secondaryColor }), ...(accentColor && { accentColor }) }
}
const presetKind = ref<EventKind>(colorPresets.find(isColorPreset)?.kind ?? props.eventKind ?? 'any')
const shownPresets = computed(() => colorPresets.filter(preset => preset.kind === presetKind.value))
const presetSwatches = (preset: ColorPreset) => [preset.primaryColor, preset.secondaryColor, preset.accentColor].filter(Boolean)

const primaryColor = computed({
  get: () => theme.value.primaryColor,
  set: color => (theme.value = { ...theme.value, primaryColor: color ?? theme.value.primaryColor }),
})

// Optional: empty leaves the colour out of the theme
const optionalColor = (key: 'secondaryColor' | 'accentColor') => computed({
  get: () => theme.value[key],
  set: (color) => {
    const { [key]: _old, ...rest } = theme.value
    theme.value = color ? { ...rest, [key]: color } : rest
  },
})
const secondaryColor = optionalColor('secondaryColor')
const accentColor = optionalColor('accentColor')
// What's used without a secondary: one made from the primary
const derivedSecondary = computed(() => secondaryFor({ primaryColor: theme.value.primaryColor }))

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

/* Each group's row: what's chosen in it */
const colorsSummary = computed(() => colorPresets.find(isColorPreset)?.name ?? 'Custom colors')
const summarySwatches = computed(() => [theme.value.primaryColor, theme.value.secondaryColor ?? derivedSecondary.value, theme.value.accentColor].filter(Boolean))
const cornerLabel = (style: CornerStyle) => `${style.charAt(0).toUpperCase()}${style.slice(1)}`
const fontsSummary = computed(() => {
  const pairing = fontPairings.find(item => item.key === theme.value.fontPairingKey)
  return [pairing?.name, `${cornerLabel(theme.value.cornerStyle)} corners`].filter(Boolean).join(' · ')
})
const animationSummary = computed(() => {
  const motion = normalizeSiteMotion(theme.value.motion)
  return motion.intro === 'none'
    ? 'No intro'
    : `${pageIntros.find(choice => choice.key === motion.intro)?.label} · ${motionIntensityLabels[motion.intensity]}`
})
</script>

<template>
  <!-- One group open at a time, all closed at first; a group closes when its row is clicked again -->
  <Accordion type="single" collapsible class="flex flex-col gap-2">
    <AccordionItem value="colors" data-style-group="colors" class="rounded-lg border data-open:border-ring">
      <AccordionTrigger class="items-center gap-3 px-3 py-3 hover:no-underline">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><Palette class="size-4" /></span>
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="font-semibold">Colors</span>
          <span data-style-summary class="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <span class="flex shrink-0 -space-x-1">
              <span v-for="color in summarySwatches" :key="color" class="size-3 rounded-full border border-background" :style="{ backgroundColor: color }" />
            </span>
            <span class="truncate">{{ colorsSummary }}</span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent class="flex flex-col gap-6 px-3 pb-4 [&_p:not(:last-child)]:mb-0">
        <div class="flex flex-col gap-2">
          <Label>Presets</Label>
          <div class="flex flex-wrap gap-1" role="group" aria-label="Presets for">
            <button
              v-for="kind in eventKinds"
              :key="kind"
              type="button"
              :data-preset-kind="kind"
              :aria-pressed="presetKind === kind"
              class="cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              @click="presetKind = kind"
            >
              {{ eventKindLabels[kind] }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2" role="group" aria-label="Colour presets">
            <button
              v-for="preset in shownPresets"
              :key="preset.name"
              type="button"
              :data-color-preset="preset.name"
              :aria-pressed="isColorPreset(preset)"
              class="flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/5 aria-pressed:ring-1 aria-pressed:ring-primary"
              @click="setColorPreset(preset)"
            >
              <span class="flex shrink-0 -space-x-1">
                <span v-for="color in presetSwatches(preset)" :key="color" class="size-4 rounded-full border border-background" :style="{ backgroundColor: color }" />
              </span>
              <span class="truncate" :title="preset.name">{{ preset.name }}</span>
            </button>
          </div>

          <div class="mt-1 flex flex-col gap-3">
            <ColorInput :id="`${id}-primary`" v-model="primaryColor" label="Primary" />
            <ColorInput
              :id="`${id}-secondary`"
              v-model="secondaryColor"
              label="Secondary"
              optional
              :empty-color="derivedSecondary"
              placeholder="Made from the primary"
            />
            <ColorInput :id="`${id}-accent`" v-model="accentColor" label="Accent" optional placeholder="None" />
          </div>
          <p class="text-xs text-muted-foreground">
            Only the primary is needed. The secondary is a second colour for sections and labels. The accent is for buttons
            and small highlights like icons and dots.
          </p>

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
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="fonts" data-style-group="fonts" class="rounded-lg border data-open:border-ring">
      <AccordionTrigger class="items-center gap-3 px-3 py-3 hover:no-underline">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><Type class="size-4" /></span>
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="font-semibold">Fonts &amp; corners</span>
          <span data-style-summary class="truncate text-xs font-normal text-muted-foreground">{{ fontsSummary }}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent class="flex flex-col gap-6 px-3 pb-4 [&_p:not(:last-child)]:mb-0">
        <div class="flex flex-col gap-2">
          <Label :for="`${id}-fonts`">Fonts</Label>
          <Select v-model="fontPairingKey">
            <SelectTrigger :id="`${id}-fonts`" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <!-- By the events each suits; each name in its own heading font (the fonts load when the list opens). Each
                   group's name is a band that stays at the top while its fonts scroll past, so the group is always shown -->
              <SelectGroup v-for="group in fontPairingGroups" :key="group.key">
                <SelectLabel data-font-group class="sticky top-0 z-10 -mx-1 border-y bg-muted px-3 py-2 text-xs font-semibold text-foreground">
                  {{ group.label }}
                </SelectLabel>
                <SelectItem v-for="pairing in fontPairings.filter(item => item.group === group.key)" :key="pairing.key" :value="pairing.key">
                  <span :style="{ fontFamily: fontStack(pairing.heading) }" class="text-base">{{ pairing.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ pairing.heading.family }} + {{ pairing.body.family }}</span>
                </SelectItem>
              </SelectGroup>
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
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="animation" data-style-group="animation" class="rounded-lg border data-open:border-ring">
      <AccordionTrigger class="items-center gap-3 px-3 py-3 hover:no-underline">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><Sparkles class="size-4" /></span>
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="font-semibold">Animation</span>
          <span data-style-summary class="truncate text-xs font-normal text-muted-foreground">{{ animationSummary }}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent class="px-3 pb-4 [&_p:not(:last-child)]:mb-0">
        <MotionControls v-model:theme="theme" :event-kind="eventKind" @play-intro="emit('play-intro')" />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
