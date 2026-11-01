<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import PeopleHeading from './PeopleHeading.vue'

// Layout `polaroids` ("Polaroid wall"): instant photos scattered like a photo wall (tilted unless `tilt` is off), each
// person's name written on the print. A row that isn't full is centred. The white prints are part of the look, not a
// theme colour; the names on them use the light text colour.
const props = defineProps<SectionLayoutProps<'people'>>()

const tilts = ['-rotate-3', 'rotate-2', 'rotate-3', '-rotate-2', 'rotate-1', '-rotate-1']
const tiltOf = (index: number) => (props.options.tilt === 'on' ? tilts[index % tilts.length] : '')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul v-if="content.people.length" data-people class="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-6 @2xl:gap-8">
      <li v-for="(person, index) in content.people" :key="person.id" data-person class="w-36 @2xl:w-48">
        <figure data-person-polaroid class="bg-white p-2.5 pb-3 shadow-lg" :class="tiltOf(index)">
          <SectionPhoto data-person-photo :src="person.photo" :variant="index" class="aspect-square w-full" />
          <figcaption data-person-name class="mt-2.5 text-center font-(family-name:--site-font-heading) text-base leading-snug text-(--site-text) @2xl:text-lg">
            {{ person.name }}
          </figcaption>
        </figure>
      </li>
    </ul>
  </SectionFrame>
</template>
