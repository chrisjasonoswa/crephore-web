<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { alignClasses } from '~/features/sections/section.options'
import MessageHeading from './MessageHeading.vue'
import MessageBody from './MessageBody.vue'

// Layout `photo-middle`: the heading above, a landscape photo in the middle, the message and signature below
// (`textAlign`).
const props = defineProps<SectionLayoutProps<'message'>>()

const align = computed(() => props.options.textAlign as Align)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div data-message-text class="mx-auto flex max-w-3xl flex-col gap-8" :class="alignClasses[align]">
      <MessageHeading :content="content" :styles="styles" :align="align" />
      <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-16/9 w-full rounded-(--site-radius)" />
      <MessageBody :content="content" :styles="styles" :align="align" class="w-full" />
    </div>
  </SectionFrame>
</template>
