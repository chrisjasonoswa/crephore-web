<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <!-- Light mode: linen C on a midnight tile. Dark mode: `--primary` turns linen, so the tile flips to linen
       with a midnight C (`--primary-foreground`) and still stands out on dark backgrounds.
       `size-full!` beats SidebarMenuButton's `[&_svg]:size-4`, which would shrink it to 16px in the sidebar. -->
  <span :class="cn('flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-linen dark:text-primary-foreground', props.class)">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="currentColor"
      class="size-full!"
      aria-hidden="true"
    >
      <path
        transform="translate(3.74 0)"
        d="M87.777 81.702 A35.25 35.25 0 1 1 87.777 38.298 L82.655 42.300 A28.75 28.75 0 1 0 82.655 77.700 Z M65.387 45.466 A15.5 15.5 0 1 0 74.534 54.613 A6.5 6.5 0 0 1 65.387 45.466 Z"
      />
    </svg>
  </span>
</template>
