<script setup lang="ts">
import type { MessageLayoutOptions } from '~/features/sections/message/message.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import MessageText from './MessageText.vue'

// Layout `split`: the photo fills one half edge to edge (`photoSide`), the note sits on the other.
// On phones the photo goes on top.
const props = defineProps<SectionLayoutProps<'message', MessageLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="grid @3xl:min-h-[34rem] @3xl:grid-cols-2">
    <SectionPhoto
      data-message-photo
      :src="content.layoutPhotos[0]"
      class="aspect-16/10 w-full @3xl:row-start-1 @3xl:aspect-auto @3xl:h-full"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    />
    <div
      data-message-column
      class="flex flex-col justify-center px-(--site-edge) py-12 @3xl:row-start-1 @3xl:py-20"
      :class="photoOnLeft ? '@3xl:col-start-2 @3xl:ps-(--site-gutter)' : '@3xl:col-start-1 @3xl:pe-(--site-gutter)'"
    >
      <MessageText :content="content" :styles="styles" align="start" />
    </div>
  </SectionFrame>
</template>
