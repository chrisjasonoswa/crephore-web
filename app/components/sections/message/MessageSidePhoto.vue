<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageText from './MessageText.vue'

// Layout `side-photo`: a smaller photo beside the note (`photoSide`), in a `frame`: plain (the site's corners),
// an arch, or a white print border. On phones the photo sits centred above the note.
const props = defineProps<SectionLayoutProps<'message'>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
const photoShape = computed(() => ({
  plain: 'rounded-(--site-radius)',
  arch: 'rounded-t-full',
  framed: '',
}[props.options.frame!]))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-10 @3xl:gap-16" :class="photoOnLeft ? '@3xl:flex-row' : '@3xl:flex-row-reverse'">
      <div
        data-message-frame
        :data-frame="options.frame"
        class="w-44 shrink-0 @2xl:w-56 @3xl:w-72"
        :class="options.frame === 'framed' && 'bg-white p-3 shadow-lg @2xl:p-4'"
      >
        <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-4/5 w-full" :class="photoShape" />
      </div>
      <MessageText :content="content" :styles="styles" align="start" class="flex-1" />
    </div>
  </SectionFrame>
</template>
