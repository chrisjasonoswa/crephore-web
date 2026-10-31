<script setup lang="ts">
import { Monitor, Smartphone, Tablet } from '@lucide/vue'

// Previews a page at a device width: a toolbar (the `#toolbar` slot on the left, the screen size on the right) and
// a frame that narrows to that width. Sections respond to the frame through container queries, so the phone
// layout shows on any screen. Used by the event website editor and the admin playground.

// Common device widths; desktop uses the full width.
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
  <div class="flex min-w-0 flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <slot name="toolbar">
        <p class="text-sm text-muted-foreground">
          {{ activeDevice.label }} · {{ activeDevice.width ? `${activeDevice.width}px` : 'full width' }}
        </p>
      </slot>
      <ToggleGroup
        type="single"
        variant="outline"
        :model-value="device"
        aria-label="Preview screen size"
        class="ml-auto"
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

    <div
      data-preview-frame
      class="mx-auto w-full overflow-hidden rounded-xl border transition-[max-width] duration-300"
      :style="{ maxWidth: activeDevice.width ? `${activeDevice.width}px` : undefined }"
    >
      <slot />
    </div>
  </div>
</template>
