<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageBody from './MessageBody.vue'
import MessageHeading from './MessageHeading.vue'

// Layout `inline`: like a magazine page. A square photo floats to one side (`photoSide`) from the top of the note, even
// on phones: the eyebrow and heading sit beside it, and the message (with a drop cap) and signature wrap around and
// under it. Starting the photo at the top keeps a short note level with it; a long one flows on below.
const props = defineProps<SectionLayoutProps<'message'>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <!-- The heading goes in the message's slot so the photo, floated first, sits beside all of the note -->
    <MessageBody data-message-text :content="content" :styles="styles" align="start" drop-cap class="mx-auto max-w-4xl">
      <SectionPhoto
        data-message-photo
        :src="content.layoutPhotos[0]"
        class="mb-3 aspect-square w-2/5 rounded-(--site-radius) @2xl:mb-4 @2xl:w-56"
        :class="photoOnLeft ? 'float-left me-5 @2xl:me-8' : 'float-right ms-5 @2xl:ms-8'"
      />
      <MessageHeading :content="content" :styles="styles" align="start" class="mb-5 @2xl:mb-6" />
    </MessageBody>
  </SectionFrame>
</template>
