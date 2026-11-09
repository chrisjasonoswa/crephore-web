<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageText from './MessageText.vue'

// Layout `portrait`: the note centred like a letter, with a small round photo on top or beside the signature
// (`photoPlacement`). The photo is optional here: without one it's a plain letter, not a placeholder.
// The white ring is part of the photo's look, not a theme colour.
defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoPlacement'>>>()
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <MessageText :content="content" :styles="styles" align="center" class="mx-auto max-w-3xl">
      <template v-if="content.layoutPhotos[0] && options.photoPlacement === 'top'" #before-heading>
        <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="size-20 rounded-full bg-white p-1 shadow-md @2xl:size-24" />
      </template>
      <template v-if="content.layoutPhotos[0] && options.photoPlacement === 'signature'" #before-signature>
        <SectionPhoto data-message-photo :src="content.layoutPhotos[0]" class="size-12 rounded-full bg-white p-0.5 shadow-md @2xl:size-14" />
      </template>
    </MessageText>
  </SectionFrame>
</template>
