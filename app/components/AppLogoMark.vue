<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <!-- Light mode: the app icon, brand pink C on brand teal. The tile is fixed to #1F6E6C (the theme's light
       `--primary`) because `--primary` turns lagoon in dark mode.
       Dark mode: the brand sheet's inverse tile, brand teal C on brand pink, so the tile stands out on dark surfaces.
       The SVG draws with currentColor; `text-secondary` is the brand pink (#F4B6C2 in both modes).
       `size-full!` beats SidebarMenuButton's `[&_svg]:size-4`, which would shrink it to 16px in the sidebar. -->
  <span :class="cn('flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1F6E6C] text-secondary dark:bg-secondary dark:text-[#1F6E6C]', props.class)">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="currentColor"
      class="size-full!"
      aria-hidden="true"
    >
      <path
        d="M85.22 79.70 A32 32 0 1 1 85.22 40.30"
        fill="none"
        stroke="currentColor"
        stroke-width="11"
        stroke-linecap="round"
      />
      <path d="M61.374 43.056 A17 17 0 1 0 76.944 58.626 A2.6 2.6 0 0 0 73.361 56.433 A7.5 7.5 0 0 1 63.567 46.639 A2.6 2.6 0 0 0 61.374 43.056 Z" />
    </svg>
  </span>
</template>
