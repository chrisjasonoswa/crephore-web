<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import MessageText from './MessageText.vue'

// Layout `card`: the note on a paper card, with the photo taped to its top corner (`photoCorner`). The card has its
// own solid surface, so the background photo needs no overlay. The photo's white border is part of the look.
const props = defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoCorner'>>>()

const photoOnLeft = computed(() => props.options.photoCorner === 'left')
// The card is always light, whatever the background
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-(--site-edge) pt-20 pb-14 @2xl:pt-24 @2xl:pb-20">
    <div data-message-card class="relative mx-auto max-w-2xl rounded-(--site-radius) px-7 pt-14 pb-10 shadow-xl @2xl:px-14 @2xl:py-14" :class="cardStyles.root">
      <div
        data-message-corner
        class="absolute -top-12 w-24 bg-white p-1.5 shadow-lg @2xl:-top-14 @2xl:w-32"
        :class="photoOnLeft ? '-left-3 -rotate-6 @2xl:-left-8' : '-right-3 rotate-6 @2xl:-right-8'"
      >
        <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-square w-full" />
        <!-- A strip of tape holding it on -->
        <span aria-hidden="true" class="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3 bg-white/70 shadow-sm" />
      </div>
      <MessageText :content="content" :styles="cardStyles" align="center" />
    </div>
  </SectionFrame>
</template>
