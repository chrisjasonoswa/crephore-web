<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import MessageText from './MessageText.vue'

// Layout `overlap`: a large photo (`photoSide`) with the note on a light panel overlapping its edge, editorial style.
// On phones the panel overlaps the photo's bottom edge. The panel has its own solid surface, so the background photo
// needs no overlay.
const props = defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
// The panel is always light, whatever the background
const panelStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto grid max-w-6xl @3xl:grid-cols-12 @3xl:items-center">
      <SectionPhoto
        data-message-photo
        :src="content.layoutPhotos[0]"
        class="aspect-4/3 w-full rounded-(--site-radius) @3xl:col-span-7 @3xl:row-start-1 @3xl:aspect-auto @3xl:h-[32rem]"
        :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-6'"
      />
      <div
        data-message-panel
        class="relative z-10 mx-4 -mt-16 rounded-(--site-radius) p-7 shadow-xl @2xl:mx-10 @2xl:p-10 @3xl:col-span-6 @3xl:row-start-1 @3xl:mx-0 @3xl:mt-0"
        :class="[panelStyles.root, photoOnLeft ? '@3xl:col-start-6' : '@3xl:col-start-2']"
      >
        <MessageText :content="content" :styles="panelStyles" align="start" />
      </div>
    </div>
  </SectionFrame>
</template>
