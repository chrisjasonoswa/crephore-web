<script setup lang="ts">
import type { Section } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { Monitor, Smartphone, Tablet } from '@lucide/vue'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import { createDefaultSection } from '~/features/sections/section.registry'
import { fontPairings } from '~/site-theme/fontPairings'
import { colorPresets } from '~/site-theme/presets'
import PlaygroundSectionControls from './_components/PlaygroundSectionControls.vue'
import PlaygroundThemeControls from './_components/PlaygroundThemeControls.vue'

definePageMeta({ area: 'admin', wide: true })

// The playground previews a page: one site theme, and the sections on it in order.
const theme = ref<SiteTheme>({
  primaryColor: colorPresets[0]!.primaryColor,
  accentColor: colorPresets[0]!.accentColor,
  fontPairingKey: fontPairings[0]!.key,
  cornerStyle: 'soft',
})

// For now the page only has a hero; more section types will be added here.
const sections = ref<Section[]>([createDefaultSection('hero')])

// Preview screen sizes (common device widths); desktop uses the full preview width.
const devices = [
  { key: 'desktop', label: 'Desktop', width: undefined, icon: Monitor },
  { key: 'tablet', label: 'Tablet', width: 768, icon: Tablet },
  { key: 'mobile', label: 'Mobile', width: 390, icon: Smartphone },
] as const

type DeviceKey = (typeof devices)[number]['key']

const device = ref<DeviceKey>('desktop')
const activeDevice = computed(() => devices.find(option => option.key === device.value)!)

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one.
function setDevice(next: unknown) {
  if (typeof next === 'string' && next)
    device.value = next as DeviceKey
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
            <PlaygroundThemeControls v-model:theme="theme" />
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

      <div class="flex min-w-0 flex-col gap-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">
            {{ activeDevice.label }} · {{ activeDevice.width ? `${activeDevice.width}px` : 'full width' }}
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            :model-value="device"
            aria-label="Preview screen size"
            @update:model-value="setDevice"
          >
            <ToggleGroupItem
              v-for="option in devices"
              :key="option.key"
              :value="option.key"
              :aria-label="option.label"
              :title="option.label"
            >
              <component :is="option.icon" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <!-- The frame narrows to the device width; sections respond to it through container queries.
             The preview uses the event's site theme, not the Crephore app theme. -->
        <div
          class="mx-auto w-full overflow-hidden rounded-xl border transition-[max-width] duration-300"
          :style="{ maxWidth: activeDevice.width ? `${activeDevice.width}px` : undefined }"
        >
          <SiteThemeScope :theme="theme">
            <SectionRenderer v-for="(section, index) in sections" :key="index" :section="section" />
          </SiteThemeScope>
        </div>
      </div>
    </div>
  </div>
</template>
