<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { CountdownUnit } from '~/features/sections/countdown'

// One outlined tile per unit (boxes, split). Two per row on phones when there are four.
// Tiles are drawn in the text colour at low strength, so they work on every background.
const props = withDefaults(defineProps<{
  units: CountdownUnit[]
  styles: BackgroundStyles
  // Smaller tiles for half-width layouts
  compact?: boolean
}>(), {
  compact: false,
})

const columns = computed(() => (props.units.length === 4 ? 'grid-cols-2 @2xl:grid-cols-4' : 'grid-cols-3'))
</script>

<template>
  <div role="timer" class="grid w-full gap-3" :class="[columns, compact ? 'max-w-md' : 'max-w-md @2xl:max-w-2xl @2xl:gap-4']">
    <div
      v-for="unit in units"
      :key="unit.key"
      :data-unit="unit.key"
      class="flex flex-col items-center rounded-(--site-radius) border border-current/15 bg-current/[0.03] px-3 py-4"
      :class="!compact && '@2xl:py-6'"
    >
      <span
        class="font-(family-name:--site-font-heading) leading-none tabular-nums"
        :class="compact ? 'text-3xl @2xl:text-4xl' : 'text-4xl @2xl:text-5xl'"
      >
        {{ unit.text }}
      </span>
      <span class="mt-2 text-[0.6rem] font-medium tracking-[0.2em] uppercase @2xl:text-[0.65rem]" :class="styles.muted">
        {{ unit.label }}
      </span>
    </div>
  </div>
</template>
