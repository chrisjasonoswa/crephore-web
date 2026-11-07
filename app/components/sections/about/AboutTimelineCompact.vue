<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import AboutChapter from './AboutChapter.vue'
import AboutText from './AboutText.vue'

// Layout `timeline-compact`: the heading and intro, then text-only chapters (no photos, so it suits long timelines and
// tributes). Left-aligned (`textAlign`) they run down a thin line with a dot each; centred, a short line and a dot
// sit between them.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'textAlign'>>>()

const centred = computed(() => (props.options.textAlign) === 'center')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto max-w-2xl">
      <AboutText :content="content" :styles="styles" :align="centred ? 'center' : 'start'" />
      <ol v-if="content.timeline.length" data-about-timeline class="relative mt-10 flex flex-col" :class="centred ? 'items-center gap-0' : 'gap-8'">
        <span v-if="!centred" aria-hidden="true" class="absolute inset-y-1 start-1 w-px bg-current/20" />
        <li
          v-for="(item, index) in content.timeline"
          :key="index"
          data-about-chapter
          class="relative"
          :class="centred ? 'flex flex-col items-center' : 'ps-8'"
        >
          <template v-if="centred">
            <span v-if="index > 0" aria-hidden="true" class="my-2 h-8 w-px bg-current/20" />
            <span aria-hidden="true" class="mb-3 size-2 rounded-full bg-current" :class="styles.accent" />
          </template>
          <span v-else aria-hidden="true" class="absolute start-0 top-1 size-2 rounded-full bg-current" :class="styles.accent" />
          <AboutChapter :item="item" :styles="styles" :align="centred ? 'center' : 'start'" />
        </li>
      </ol>
    </div>
  </SectionFrame>
</template>
