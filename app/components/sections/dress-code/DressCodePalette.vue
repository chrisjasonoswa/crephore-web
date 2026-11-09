<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'
import DressCodeSwatches from './DressCodeSwatches.vue'

// Layout `palette` (the default): centred: the heading and attire, the description, then the colours as large swatches
// (`swatchShape`: circles or squares) with their names (when they have one), and a small "please avoid" row.
defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'swatchShape'>>>()
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto flex max-w-3xl flex-col gap-8" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <DressCodeSwatches :align="options.textAlign" :colours="content.colours" :styles="styles" size="large" :shape="options.swatchShape" />
      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
  </SectionFrame>
</template>
