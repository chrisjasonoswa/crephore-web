<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { inspirationPhotoMax } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses, justifyClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `moodboard`: centred: the heading and attire and the description, then a collage of the six inspiration
// photos (placeholders for missing ones, so the collage stays whole) with the colours as overlapping dots in a small
// light pill pinned to its bottom edge, then the "please avoid" row. From 768px the collage has `columns` columns with
// some photos two rows tall, staggered so the grid is always full (3 columns: 3 rows; 4 columns: 2 rows); on phones
// two columns of square photos.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'columns'>>>()

// The pill is a light surface, whatever the background
const pillStyles = backgroundStyles.light
const photos = computed(() => Array.from({ length: inspirationPhotoMax }, (_, index) => props.content.layoutPhotos[index]))

// Which photos stand two rows tall from 768px; in placement order these fill each grid exactly
const tallPhotos: Record<string, number[]> = { 3: [0, 2, 3], 4: [0, 3] }
const columnClasses: Record<string, string> = { 3: '@3xl:grid-cols-3 @3xl:auto-rows-[11rem]', 4: '@3xl:grid-cols-4 @3xl:auto-rows-[14rem]' }
const isTall = (index: number) => (tallPhotos[props.options.columns] ?? []).includes(index)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto flex flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <div data-dress-moodboard class="relative w-full">
        <div data-dress-collage class="grid grid-cols-2 gap-2 @2xl:gap-3" :class="columnClasses[options.columns]">
          <SectionPhoto
            v-for="(src, index) in photos"
            :key="index"
            data-dress-photo
            :data-tall="isTall(index) || undefined"
            :src="src"
            :variant="index"
            class="aspect-square w-full rounded-(--site-radius) @3xl:aspect-auto @3xl:h-full"
            :class="isTall(index) && '@3xl:row-span-2'"
          />
        </div>
        <!-- The colours pinned over the collage's bottom edge, half on and half off -->
        <div v-if="content.colours.length" class="absolute inset-x-0 bottom-0 flex translate-y-1/2" :class="justifyClasses[options.textAlign]">
          <ul
            data-dress-swatches
            class="flex -space-x-2 rounded-full px-3 py-2 shadow-lg"
            :class="pillStyles.root"
          >
            <li
              v-for="colour in content.colours"
              :key="colour.id"
              data-dress-colour
              :data-colour-name="colour.name"
              :title="colour.name"
              class="size-8 rounded-full border-2 border-(--site-bg) ring-1 ring-current/15 @2xl:size-10"
              :style="{ backgroundColor: colour.hex }"
            >
              <span class="sr-only">{{ colour.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" :class="content.colours.length && 'mt-6'" />
    </div>
  </SectionFrame>
</template>
