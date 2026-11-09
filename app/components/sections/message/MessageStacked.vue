<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageText from './MessageText.vue'

// Layout `stacked`: a wide photo strip across the top of the section, the note below it (`textAlign`).
defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'textAlign'>>>()
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="aspect-16/7 w-full @3xl:aspect-16/5" />
    <div class="mx-auto max-w-3xl px-(--site-gutter) py-12 @2xl:py-16">
      <MessageText :content="content" :styles="styles" :align="options.textAlign" />
    </div>
  </SectionFrame>
</template>
