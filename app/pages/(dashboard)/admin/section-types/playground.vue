<script setup lang="ts">
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import PreviewFrame from '~/components/site-editor/PreviewFrame.vue'
import ThemeControls from '~/components/site-editor/ThemeControls.vue'
import { createDefaultSection } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'
import { fontPairings } from '~/site-theme/fontPairings'
import { colorPresets } from '~/site-theme/presets'
import PlaygroundSectionControls from './_components/PlaygroundSectionControls.vue'

definePageMeta({ area: 'admin', wide: true })

// The playground previews a page: one site theme, and the sections on it in order.
const theme = ref<SiteTheme>({
  primaryColor: colorPresets[0]!.primaryColor,
  accentColor: colorPresets[0]!.accentColor,
  fontPairingKey: fontPairings[0]!.key,
  cornerStyle: 'soft',
})

// One section of each type, in page order
const sections = ref<Section[]>([createDefaultSection('hero'), createDefaultSection('countdown')])

// The event's start, for the countdown: try a far date, the last hour, and one that has passed
const occasionChoices = [
  { key: 'sample', label: 'In 112 days' },
  { key: 'soon', label: 'In 1 hour' },
  { key: 'passed', label: 'Passed' },
] as const

type OccasionKey = (typeof occasionChoices)[number]['key']

const occasionKey = ref<OccasionKey>('sample')
const occasion = computed<SectionOccasion>(() => {
  if (occasionKey.value === 'sample')
    return sampleOccasion()
  const offset = occasionKey.value === 'soon' ? 60 * 60_000 : -60_000
  return { startsAt: new Date(Date.now() + offset).toISOString(), timezone: 'Asia/Manila' }
})

function setOccasion(next: unknown) {
  if (typeof next === 'string' && next)
    occasionKey.value = next as OccasionKey
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <CPageHeader title="Playground" description="Preview section layouts, backgrounds and colour combinations" />

    <!-- Controls on the left (sticky while scrolling the preview), preview on the right; stacked on small screens -->
    <div class="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <!-- Scrolls on its own when taller than the viewport, so every control stays reachable -->
      <Card class="lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto">
        <CardContent class="flex flex-col gap-6">
          <!-- Theme: applies to every section -->
          <section class="flex flex-col gap-4">
            <h2 class="font-semibold">
              Theme
            </h2>
            <ThemeControls v-model:theme="theme" />
          </section>

          <Separator />

          <!-- The event the page belongs to (sections that show its details, e.g. the countdown) -->
          <section class="flex flex-col gap-2">
            <h2 class="font-semibold">
              Event starts
            </h2>
            <ToggleGroup
              type="single"
              variant="outline"
              :model-value="occasionKey"
              aria-label="Event starts"
              class="grid w-full auto-cols-fr grid-flow-col"
              @update:model-value="setOccasion"
            >
              <ToggleGroupItem v-for="choice in occasionChoices" :key="choice.key" :value="choice.key" class="text-xs">
                {{ choice.label }}
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <Separator />

          <!-- Sections: in the order they appear on the page -->
          <section class="flex flex-col gap-4">
            <h2 class="font-semibold">
              Sections
            </h2>
            <PlaygroundSectionControls
              v-for="(_, index) in sections"
              :key="index"
              v-model:section="sections[index]!"
            />
          </section>
        </CardContent>
      </Card>

      <!-- The preview uses the event's site theme, not the Crephore app theme -->
      <PreviewFrame>
        <SiteThemeScope :theme="theme">
          <SectionRenderer v-for="(section, index) in sections" :key="index" :section="section" :occasion="occasion" />
        </SiteThemeScope>
      </PreviewFrame>
    </div>
  </div>
</template>
