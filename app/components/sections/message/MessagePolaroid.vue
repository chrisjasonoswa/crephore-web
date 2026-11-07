<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageText from './MessageText.vue'

// Layout `polaroid`: one tilted instant photo next to the note (`photoSide`); on phones it sits above it.
// The white print border is part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-12 @3xl:gap-16" :class="photoOnLeft ? '@3xl:flex-row' : '@3xl:flex-row-reverse'">
      <div
        data-message-polaroid
        class="w-52 shrink-0 bg-white p-3 pb-10 shadow-xl @2xl:w-64 @3xl:w-72"
        :class="photoOnLeft ? '-rotate-6' : 'rotate-6'"
      >
        <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-square w-full" />
      </div>
      <MessageText :content="content" :styles="styles" align="start" class="flex-1" />
    </div>
  </SectionFrame>
</template>
