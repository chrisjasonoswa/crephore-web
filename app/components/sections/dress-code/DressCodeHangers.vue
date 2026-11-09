<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { DressColour } from '~/features/sections/dress-code/dress-code.type'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import aLineGown from '~/assets/images/dress-code/a-line-gown.png'
import ballGown from '~/assets/images/dress-code/ball-gown.png'
import mermaidGown from '~/assets/images/dress-code/mermaid-gown.png'
import tuxedo from '~/assets/images/dress-code/tuxedo.png'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundColours, resolveBackground } from '~/features/sections/section.background'
import { mixSrgb } from '~/site-theme/color'
import { alignClasses, blockAlignClasses } from '~/features/sections/section.options'
import { useScrollPin } from '~/features/sections/useScrollPin'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `hangers` ("Silhouettes"; once a clothes rail, hence the key): centred: the heading and attire, the description,
// then one outfit silhouette per suggested colour, the same height, in this order: an A-line gown, a tuxedo, a mermaid
// gown, a tuxedo, a ball gown (four colours: no ball gown), each a flat fill in its colour. Each drawing is a mask
// (`assets/images/dress-code/`; the tuxedo's pocket square filled in, so both sides of its chest match), so its details
// are cut-outs the section shows through. A crisp hairline keeps a figure in view when its colour is the section's own
// (`outlineOf`): on the light background a darker shade of the figure's own colour; on the others white when the
// background is close to black, else a darker shade of the background. Under each, the colour's name in small spaced capitals (when it has one); the outfits aren't named. On phones the row scrolls sideways;
// from 672px the figures shrink to fit (`--figure`: their height). "Please avoid" below. No figures without colours.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

// Width ÷ height of each drawing, so every figure is the same height
const outfits = [
  { key: 'a-line-gown', src: aLineGown, ratio: 0.8817 },
  { key: 'tuxedo', src: tuxedo, ratio: 0.3634 },
  { key: 'mermaid-gown', src: mermaidGown, ratio: 0.3774 },
  { key: 'tuxedo', src: tuxedo, ratio: 0.3634 },
  { key: 'ball-gown', src: ballGown, ratio: 0.7297 },
]

// One per colour, up to the five outfits
const figures = computed(() => props.content.colours.slice(0, outfits.length)
  .map((colour: DressColour, index) => ({ outfit: outfits[index]!, colour })))

// The outline. On the light background: the figure's own colour, darker. On the others: white on a background close to
// black (oklch lightness under 0.35), else the background a little darker; the theme's colours are CSS variables, so
// that's worked out in CSS (relative colour syntax), `k` being 0 on a dark background and 1 otherwise.
const k = 'clamp(0, (l - 0.35) * 1000, 1)'
const shown = computed(() => resolveBackground(props.background, props.content.backgroundPhoto))
const backgroundOutline = computed(() => `oklch(from ${backgroundColours[shown.value].background} calc(${k} * l * 0.78 + 1 - ${k}) calc(${k} * c) h)`)
const outlineOf = (hex: string) => (shown.value === 'light' ? mixSrgb(hex, '#000000', 0.7) : backgroundOutline.value)

// Scrolling down slides the row right while it scrolls sideways (phones)
const pinned = useTemplateRef<HTMLElement>('pinned')
const row = useTemplateRef<HTMLElement>('row')
const { space } = useScrollPin(pinned, row)

function figureStyle(hex: string, src: string, ratio: number) {
  const mask = `url("${src}") center / contain no-repeat`
  return { backgroundColor: hex, aspectRatio: String(ratio), mask, WebkitMask: mask }
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div ref="pinned" data-dress-hangers class="mx-auto flex flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>

      <!-- Edge to edge on phones, so the row scrolls under the section's padding (the gutter). From 672px the figures'
           height leaves room for all five: they're 2.73 heights wide together, beside the frame's padding on both
           sides (`--site-edge`) and four gaps of up to 2rem (with a little to spare, over 2.8 heights) -->
      <div
        v-if="figures.length"
        ref="row"
        data-dress-silhouettes
        class="-mx-(--site-gutter) w-[calc(100%+2*var(--site-gutter))] overflow-x-auto px-(--site-gutter) [--figure:12rem] @2xl:mx-0 @2xl:w-full @2xl:px-0 @2xl:[--figure:min(18rem,calc((100cqw_-_2*var(--site-edge)_-_8rem)/2.8))]"
      >
        <!-- Lined up by their tops (every figure is the same height), so a colour without a name doesn't drop its figure -->
        <ul class="flex w-max items-start gap-6 @3xl:gap-8" :class="blockAlignClasses[options.textAlign]">
          <li
            v-for="{ outfit, colour } in figures"
            :key="colour.id"
            data-dress-colour
            :data-colour-name="colour.name"
            :data-silhouette="outfit.key"
            class="flex flex-col items-center"
          >
            <!-- The hairline: four sharp drop shadows on the wrapper, which follow the masked shape -->
            <div
              aria-hidden="true"
              data-dress-outline
              class="[filter:drop-shadow(0.75px_0_0_var(--outline))_drop-shadow(-0.75px_0_0_var(--outline))_drop-shadow(0_0.75px_0_var(--outline))_drop-shadow(0_-0.75px_0_var(--outline))]"
              :style="{ '--outline': outlineOf(colour.hex) }"
            >
              <div data-dress-figure class="h-(--figure)" :style="figureStyle(colour.hex, outfit.src, outfit.ratio)" />
            </div>
            <span v-if="colour.name" class="mt-4 text-[0.65rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">{{ colour.name }}</span>
          </li>
        </ul>
      </div>

      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
    <!-- The room the row slides through while the content above is pinned -->
    <div v-if="space" aria-hidden="true" data-scroll-pin-space :style="space" />
  </SectionFrame>
</template>
