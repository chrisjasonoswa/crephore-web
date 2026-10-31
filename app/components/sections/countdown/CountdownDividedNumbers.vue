<script setup lang="ts">
import type { CountdownUnit } from '~/features/sections/countdown'
import type { Align } from '~/features/sections/section.options'

// Big numbers divided by thin lines, no boxes (minimal, over a photo, calendar). On phones the large sizes
// wrap to two per row without the lines; the small size stays on one row.
const props = withDefaults(defineProps<{
  units: CountdownUnit[]
  // Label colour (the background's muted text)
  labelClass: string
  size?: 'large' | 'medium' | 'small'
  align?: Align
}>(), {
  size: 'large',
  align: 'center',
})

const numberSizes = {
  large: 'text-5xl @2xl:text-7xl',
  medium: 'text-4xl @2xl:text-6xl',
  small: 'text-3xl @2xl:text-4xl',
}

const wraps = computed(() => props.size !== 'small')
// Phones: two per row for four units, all three on one row without seconds
const phoneColumns = computed(() => (props.units.length === 4 ? 'grid-cols-2' : 'grid-cols-3'))
// Written out in full so Tailwind finds them
const justify = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }
const justifyWide = { start: '@2xl:justify-start', center: '@2xl:justify-center', end: '@2xl:justify-end' }
</script>

<template>
  <div
    role="timer"
    class="items-stretch"
    :class="wraps ? ['grid gap-y-6 @2xl:flex @2xl:gap-y-0', phoneColumns, justifyWide[align]] : ['flex', justify[align]]"
  >
    <div
      v-for="(unit, index) in units"
      :key="unit.key"
      :data-unit="unit.key"
      class="flex flex-col items-center"
      :class="[
        size === 'small' ? 'px-3 first:pl-0 last:pr-0' : 'px-2 @2xl:px-8 @2xl:first:pl-0 @2xl:last:pr-0',
        index > 0 && (wraps ? '@2xl:border-l @2xl:border-current/20' : 'border-l border-current/20'),
      ]"
    >
      <span class="font-(family-name:--site-font-heading) leading-none tabular-nums" :class="numberSizes[size]">
        {{ unit.text }}
      </span>
      <span class="mt-2 text-[0.6rem] font-medium tracking-[0.2em] uppercase @2xl:text-[0.65rem]" :class="labelClass">
        {{ unit.label }}
      </span>
    </div>
  </div>
</template>
