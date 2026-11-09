<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `arch`: the first photo in an arch, the date and venue below it. `namesPlacement` puts the names
// above or below the arch. The arch grows with the screen's height (`archSize`), so it fills a tall screen too.
defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'namesPlacement'>>>()

// The arch's height: the screen's height less about 28rem for the names, date and padding, between 14rem and 48rem, and
// never wider than the screen allows (3:4, inside the 1.5rem side padding); its width follows
const archSize = 'aspect-3/4 h-[min(clamp(14rem,calc(var(--site-screen-height)_-_28rem),48rem),calc((100cqw_-_3rem)*4/3))]'
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col justify-center px-6 py-14 @2xl:py-20">
    <HeroText :content="content" :occasion="occasion" :styles="styles" align="center" size="large" class="mx-auto max-w-5xl">
      <template v-if="options.namesPlacement === 'below'" #before-heading>
        <SectionPhoto :src="content.layoutPhotos[0]" data-arch class="mb-8 rounded-t-full" :class="archSize" />
      </template>
      <template v-else #after-heading>
        <SectionPhoto :src="content.layoutPhotos[0]" data-arch class="mt-8 rounded-t-full" :class="archSize" />
      </template>
    </HeroText>
  </SectionFrame>
</template>
