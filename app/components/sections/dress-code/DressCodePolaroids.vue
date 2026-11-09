<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'
import DressCodeSwatches from './DressCodeSwatches.vue'

// Layout `polaroids`: centred: the heading and attire and the description, then the inspiration photos (`photoCount`:
// three, four or five) as slightly tilted instant photos in a row, uncaptioned (the thicker bottom border left blank,
// as on a real print). Then all the colours as swatches with their names, and the "please avoid" row. Two prints to a
// row on phones, a lone last one centred. The white prints are part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'photoCount'>>>()

const tilts = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-1']

const count = computed(() => Number(props.options.photoCount))
const photos = computed(() => Array.from({ length: count.value }, (_, index) => props.content.layoutPhotos[index]))
// Written out in full so Tailwind finds them
const columns: Record<number, string> = { 3: 'max-w-3xl @3xl:grid-cols-3', 4: '@3xl:grid-cols-4', 5: '@3xl:grid-cols-5' }
// With an odd count, the last print sits alone on phones, centred
const loneLast = (index: number) => count.value % 2 === 1 && index === count.value - 1
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto flex flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <ul data-dress-polaroids class="grid w-full grid-cols-2 gap-x-5 gap-y-8 px-2 @2xl:gap-x-8" :class="columns[count]">
        <li
          v-for="(src, index) in photos"
          :key="index"
          data-dress-print
          :class="loneLast(index) && 'col-span-2 mx-auto w-1/2 @3xl:col-span-1 @3xl:w-full'"
        >
          <!-- The thicker bottom border stays blank, as on a real print -->
          <figure class="bg-white p-2.5 pb-10 shadow-lg @2xl:p-3 @2xl:pb-12" :class="tilts[index % tilts.length]">
            <SectionPhoto data-dress-photo :src="src" :variant="index" class="aspect-4/5 w-full" />
          </figure>
        </li>
      </ul>
      <DressCodeSwatches :align="options.textAlign" :colours="content.colours" :styles="styles" />
      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
  </SectionFrame>
</template>
