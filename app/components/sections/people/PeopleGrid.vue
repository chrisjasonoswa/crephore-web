<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { peopleRowWidths, personPhotoShapes } from '~/features/sections/people/people.helpers'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `grid` ("Photo grid"): each person's photo (`photoShape`) with the name and role underneath, `columns` a row
// from 768px (two on phones, three in between); a row that isn't full is centred.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'columns' | 'photoShape'>>>()

const shape = computed(() => personPhotoShapes[props.options.photoShape])
const width = computed(() => peopleRowWidths[props.options.columns])
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul v-if="content.people.length" data-people class="mx-auto mt-10 flex flex-wrap justify-center gap-x-6 gap-y-10">
      <li
        v-for="person in content.people"
        :key="person.id"
        data-person
        class="flex w-[calc((100%-1.5rem)/2)] flex-col items-center gap-3 @2xl:w-[calc((100%-3rem)/3)]"
        :class="width"
      >
        <PersonPhoto data-person-photo :data-shape="options.photoShape" :person="person" :styles="styles" class="w-24 @2xl:w-28" :class="shape" />
        <PersonCaption :person="person" :styles="styles" />
      </li>
    </ul>
  </SectionFrame>
</template>
