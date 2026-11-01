<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import MessageText from './MessageText.vue'

// Layout `postcard`: a light postcard with the photo on one side (`photoSide`) and the note on the other, a divider
// between them and a stamp in the note's corner. On phones the photo goes on top and the divider and stamp go.
// The card has its own solid surface, so the background photo needs no overlay.
const props = defineProps<SectionLayoutProps<'message'>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
// The postcard is always light, whatever the background
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div
      data-message-postcard
      class="mx-auto flex max-w-5xl flex-col gap-6 rounded-(--site-radius) p-4 shadow-xl @2xl:p-6 @3xl:gap-0"
      :class="[cardStyles.root, photoOnLeft ? '@3xl:flex-row' : '@3xl:flex-row-reverse']"
    >
      <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-4/3 w-full @3xl:aspect-auto @3xl:min-h-80 @3xl:w-1/2" />
      <div
        class="relative flex flex-1 flex-col justify-center px-2 pb-4 @3xl:my-4 @3xl:px-10 @3xl:pb-0"
        :class="photoOnLeft ? '@3xl:ms-8 @3xl:border-s @3xl:border-(--site-border)' : '@3xl:me-8 @3xl:border-e @3xl:border-(--site-border)'"
      >
        <span
          aria-hidden="true"
          data-message-stamp
          class="absolute end-0 top-0 hidden h-14 w-12 rounded-sm border-2 border-dashed border-current/25 @3xl:block"
          :class="!photoOnLeft && '@3xl:end-auto @3xl:start-0'"
        />
        <MessageText :content="content" :styles="cardStyles" align="start" class="@3xl:pt-16" />
      </div>
    </div>
  </SectionFrame>
</template>
