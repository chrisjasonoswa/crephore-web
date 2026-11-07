<script setup lang="ts">
import type { Section } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { setResponseStatus } from 'h3'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import { currentLayoutKey, sectionRegistry } from '~/features/sections/section.registry'
import { upgradeSectionContent } from '~/features/sections/section.upgrade'
import { sectionProgram } from '~/features/event-programs/event-program'
import { themeFromApi } from '~/features/event-websites/event-website'
import { introContentFor } from '~/features/site-motion/intro-content'
import { getSite } from '~/features/sites/site.api'
import { eventKindFor } from '~/site-theme/eventKinds'

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
  return themeFromApi(site.value.theme)
})
// What the intros show: the event's name, date and venue, the program's numbers, its kind
const introContent = computed(() => introContentFor(sections.value, occasion.value, eventKindFor(site.value?.eventType)))
// The event's details the sections show (the hero's names, date, place and a memorial's life dates, the countdown's
// heading and target, the program's venue, items and venues)
const occasion = computed(() => site.value && {
  name: site.value.eventName,
  venue: site.value.venueName,
  startsAt: site.value.startsAt,
  timezone: site.value.timezone,
  program: sectionProgram(site.value.program, site.value.venues),
  bornOn: site.value.bornOn ?? undefined,
  diedOn: site.value.diedOn ?? undefined,
})
// Published content may be from an older content version; upgraded like in the editor, and a removed layout shows as
// its replacement (`currentLayoutKey`). A program section is left out while the event's program has no items. Sections
// of a type this app no longer has (e.g. the removed venue section) are skipped.
const sections = computed<Section[]>(() => (site.value?.sections ?? [])
  .filter(section => section.type !== 'program' || occasion.value?.program.items.length)
  .filter(section => section.type in sectionRegistry)
  .map(section => ({
    ...section,
    layout: currentLayoutKey(section.type, section.layout),
    content: upgradeSectionContent(section.type, section.content, section.contentVersion),
  })))

// The event's name alone, without Crephore's title suffix
useHead({
  title: () => site.value?.eventName ?? 'Website not found',
  titleTemplate: '%s',
})
</script>

<template>
  <SiteThemeScope v-if="site && theme && occasion" :theme="theme" intro-on-load :intro-content="introContent" class="min-h-svh">
    <main>
      <SectionRenderer v-for="(section, index) in sections" :key="index" :section="section" :occasion="occasion" :priority="index === 0" />
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
