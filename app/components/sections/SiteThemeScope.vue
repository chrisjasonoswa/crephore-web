<script setup lang="ts">
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { useSiteTheme } from '~/site-theme/useSiteTheme'

// Applies an event's site theme to everything inside it. Wrap sections in this,
// never set `--site-*` variables on :root (the Crephore app has its own theme).
// It is also the size container sections respond to (`@2xl:` etc.), so a narrow preview
// shows the mobile layout even on a wide screen.
const props = defineProps<{ theme: SiteTheme }>()

const themeVars = useSiteTheme(() => props.theme)
</script>

<template>
  <div
    class="crephore-site @container bg-(--site-bg) font-(family-name:--site-font-body) text-(--site-text) antialiased"
    :style="themeVars"
  >
    <slot />
  </div>
</template>
