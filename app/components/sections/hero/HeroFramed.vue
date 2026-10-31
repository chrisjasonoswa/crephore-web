<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `framed`: the first photo in a wide mat border like a printed invitation, the names beside it in
// large serif with the eyebrow underneath ("are getting married"). `photoSide` and `textAlign` place them;
// on phones the photo goes on top. The white mat is part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'hero'>>()

const photoOnLeft = computed(() => props.options.photoSide !== 'right')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto grid max-w-5xl items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
      <div
        data-hero-photo
        class="mx-auto w-full max-w-xs bg-white p-5 shadow-lg @2xl:max-w-sm @2xl:p-8 @3xl:row-start-1"
        :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
      >
        <SectionPhoto :src="content.layoutPhotos[0]" class="aspect-3/4 w-full" />
      </div>
      <div data-hero-text class="@3xl:row-start-1" :class="photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'">
        <HeroText
          :content="content"
          :styles="styles"
          :align="options.textAlign === 'center' ? 'center' : 'start'"
          size="large"
          eyebrow-below
        />
      </div>
    </div>
  </SectionFrame>
</template>
