<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageHeading from './MessageHeading.vue'
import MessageBody from './MessageBody.vue'

// Layout `editorial`: a big heading on the left and the message and signature on the right, with a wide photo below
// or above them (`photoPosition`). On phones everything stacks.
const props = defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoPosition'>>>()

const photoAbove = computed(() => props.options.photoPosition === 'above')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-message-editorial class="mx-auto flex gap-10 @3xl:gap-14" :class="photoAbove ? 'flex-col-reverse' : 'flex-col'">
      <div data-message-text class="grid gap-6 @3xl:grid-cols-2 @3xl:gap-16">
        <MessageHeading :content="content" :styles="styles" align="start" size="large" />
        <MessageBody :content="content" :styles="styles" align="start" class="@3xl:pt-8" />
      </div>
      <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-16/9 w-full rounded-(--site-radius) @3xl:aspect-16/5" />
    </div>
  </SectionFrame>
</template>
