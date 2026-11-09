<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'
import DressCodeSwatches from './DressCodeSwatches.vue'

// Layout `split-photo` ("Split with photos"): inspiration photos on one side (`photoSide`), the details on the other,
// left-aligned: the heading and attire, the description, the swatches and the "please avoid" row. The photos
// (`photoCount`): one tall photo; two side by side; three, one tall beside two stacked; four, two by two. On phones
// only the first photo shows, wide, above the text.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'photoSide' | 'photoCount'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
const count = computed(() => Number(props.options.photoCount))
// From 768px: the photos' grid (written out in full so Tailwind finds them), and the first photo tall beside the
// stacked pair when there are three
const gridClasses: Record<number, string> = { 1: '', 2: '@3xl:grid-cols-2', 3: '@3xl:grid-cols-2 @3xl:grid-rows-2', 4: '@3xl:grid-cols-2 @3xl:grid-rows-2' }
const others = computed(() => Array.from({ length: count.value - 1 }, (_, index) => index + 1))
</script>

<template>
  <!-- On the photo the overlay covers the text's half (everything on phones, where the text spans the width) -->
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundPhoto"
    :overlay="photoOnLeft ? 'end' : 'start'"
    class="px-(--site-edge) py-14 @2xl:py-20"
  >
    <div data-dress-split class="mx-auto grid gap-10 @3xl:grid-cols-2 @3xl:items-center @3xl:gap-16">
      <div
        data-dress-photos
        class="grid gap-3 @3xl:row-start-1 @3xl:h-[34rem]"
        :class="[photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2', gridClasses[count]]"
      >
        <SectionPhoto
          data-dress-photo
          :src="content.layoutPhotos[0]"
          :variant="0"
          class="aspect-16/9 w-full rounded-(--site-radius) @3xl:aspect-auto @3xl:h-full"
          :class="count === 3 && '@3xl:row-span-2'"
        />
        <!-- The other photos only from 768px -->
        <SectionPhoto
          v-for="index in others"
          :key="index"
          data-dress-photo
          :src="content.layoutPhotos[index]"
          :variant="index"
          class="hidden size-full rounded-(--site-radius) @3xl:block"
        />
      </div>
      <div
        data-dress-details
        class="flex flex-col items-start gap-6 text-start @3xl:row-start-1"
        :class="photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'"
      >
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-lg" />
        <DressCodeSwatches :colours="content.colours" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" class="w-full" />
      </div>
    </div>
  </SectionFrame>
</template>
