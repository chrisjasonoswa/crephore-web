<script setup lang="ts">
import type { Section } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { setResponseStatus } from 'h3'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import { getSite } from '~/features/sites/site.api'

// An event's published website, as guests see it at <subdomain>.<site domain> (see app/router.options.ts).
// Rendered on the server, so guests and link previews get the whole page; unpublished and unknown addresses are a 404.
const props = defineProps<{
  subdomain: string
}>()

const { data: site } = await useAsyncData(`site:${props.subdomain}`, async () => {
  try {
    return (await getSite(props.subdomain)).data
  }
  catch {
    return null
  }
})

if (!site.value && import.meta.server) {
  const event = useRequestEvent()
  if (event)
    setResponseStatus(event, 404)
}

const theme = computed<SiteTheme | null>(() => {
  if (!site.value)
    return null
  const { backgroundColor, ...rest } = site.value.theme
  return backgroundColor ? { ...rest, backgroundColor } : rest
})
const sections = computed<Section[]>(() => site.value?.sections ?? [])
const occasion = computed(() => site.value && { startsAt: site.value.startsAt, timezone: site.value.timezone })

// The event's name alone, without Crephore's title suffix
useHead({
  title: () => site.value?.eventName ?? 'Website not found',
  titleTemplate: '%s',
})
</script>

<template>
  <SiteThemeScope v-if="site && theme && occasion" :theme="theme" class="min-h-svh">
    <main>
      <SectionRenderer v-for="(section, index) in sections" :key="index" :section="section" :occasion="occasion" />
    </main>
  </SiteThemeScope>

  <main v-else class="flex min-h-svh flex-col items-center justify-center gap-2 bg-background p-6 text-center text-foreground">
    <h1 class="text-2xl font-semibold">
      This website isn't available
    </h1>
    <p class="max-w-sm text-muted-foreground">
      Check the address, or ask the host for the link. It may not be published yet.
    </p>
  </main>
</template>
