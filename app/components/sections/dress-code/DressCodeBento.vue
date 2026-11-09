<script setup lang="ts">
import type { DressColour } from '~/features/sections/dress-code/dress-code.type'
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `bento`: centred on the section, the eyebrow, heading, attire and description; then a grid of rounded tiles,
// the colours (each tile filled with it, its name at the bottom left in small spaced capitals when it has one) mixed
// with the two inspiration photos; then the "please avoid" row. From 768px the grid is two rows, always full: four
// columns for two to five colours (with fewer colours the photos, then colours, grow two rows tall), three with one
// colour and two with none. On phones the tiles sit two to a row, a lone last tile full width.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

type Tile = { kind: 'colour', colour: DressColour, tall: boolean } | { kind: 'photo', index: number, tall: boolean }

// Placement order and which tiles stand two rows tall, so the two rows fill exactly
const tiles = computed<Tile[]>(() => {
  const [c0, c1, c2, c3, c4] = props.content.colours
  const colour = (colour: DressColour, tall = false): Tile => ({ kind: 'colour', colour, tall })
  const photo = (index: number, tall = false): Tile => ({ kind: 'photo', index, tall })
  if (c4)
    return [photo(0, true), colour(c0!), colour(c1!), colour(c2!), colour(c3!), colour(c4), photo(1)]
  if (c3)
    return [photo(0, true), colour(c0!), colour(c1!), photo(1, true), colour(c2!), colour(c3)]
  if (c2)
    return [photo(0, true), colour(c0!, true), colour(c1!), photo(1, true), colour(c2)]
  if (c1)
    return [photo(0, true), colour(c0!, true), photo(1, true), colour(c1, true)]
  if (c0)
    return [photo(0, true), colour(c0, true), photo(1, true)]
  return [photo(0, true), photo(1, true)]
})
// Written out in full so Tailwind finds them
const columns = computed(() => ({ 0: '@3xl:grid-cols-2', 1: '@3xl:grid-cols-3' })[Math.min(props.content.colours.length, 2) as 0 | 1] ?? '@3xl:grid-cols-4')
// A lone last tile on phones spans the row
const loneLast = (index: number) => index === tiles.value.length - 1 && tiles.value.length % 2 === 1
const tileClasses = (tile: Tile, index: number) => [
  loneLast(index) ? 'col-span-2 aspect-2/1 @3xl:col-span-1' : 'aspect-square',
  '@3xl:aspect-auto',
  tile.tall && '@3xl:row-span-2',
]
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto flex flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div data-dress-text class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>

      <div data-dress-bento class="grid w-full grid-cols-2 gap-3 @2xl:gap-4 @3xl:auto-rows-[minmax(13rem,auto)]" :class="columns">
        <template v-for="(tile, index) in tiles" :key="tile.kind === 'colour' ? tile.colour.id : `photo-${tile.index}`">
          <div
            v-if="tile.kind === 'colour'"
            data-dress-colour
            :data-colour-name="tile.colour.name"
            class="flex items-end rounded-(--site-radius) border border-current/15 p-4 text-start @2xl:p-5"
            :class="tileClasses(tile, index)"
            :style="{ backgroundColor: tile.colour.hex, color: textOnColour(tile.colour.hex) }"
          >
            <span v-if="tile.colour.name" class="text-[0.65rem] font-semibold tracking-[0.2em] uppercase @2xl:text-xs">{{ tile.colour.name }}</span>
          </div>
          <SectionPhoto
            v-else
            data-dress-photo
            :src="content.layoutPhotos[tile.index]"
            :variant="tile.index"
            class="w-full rounded-(--site-radius) @3xl:h-full"
            :class="tileClasses(tile, index)"
          />
        </template>
      </div>

      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
  </SectionFrame>
</template>
