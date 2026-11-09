<script setup lang="ts">
import type { CountdownLayoutOptions } from '~/features/sections/countdown/countdown.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown/countdown.helpers'
import CountdownButton from './CountdownButton.vue'
import CountdownHeading from './CountdownHeading.vue'
import CountdownTiles from './CountdownTiles.vue'

// Layout `split`: the layout photo on one half (`photoSide`), the countdown tiles, date and button on the other.
// On phones the photo goes on top.
const props = defineProps<SectionLayoutProps<'countdown', CountdownLayoutOptions<'photoSide'>>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const photoOnLeft = computed(() => props.options.photoSide === 'left')
const date = computed(() => formatOccasionDate(props.occasion))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="grid @3xl:min-h-[34rem] @3xl:grid-cols-2">
    <SectionPhoto
      data-countdown-photo
      :src="content.layoutPhotos[0]"
      class="aspect-16/9 w-full @3xl:row-start-1 @3xl:aspect-auto @3xl:h-full"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    />
    <div
      data-countdown-text
      class="flex flex-col items-center justify-center gap-6 px-(--site-edge) py-12 text-center @3xl:row-start-1 @3xl:py-20"
      :class="photoOnLeft ? '@3xl:col-start-2 @3xl:ps-(--site-gutter)' : '@3xl:col-start-1 @3xl:pe-(--site-gutter)'"
    >
      <CountdownHeading :content="content" :occasion="occasion" :styles="styles" size="medium" />
      <CountdownTiles :units="units" :styles="styles" compact />
      <p data-countdown-date class="text-sm" :class="styles.muted">
        {{ date }}
      </p>
      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>
