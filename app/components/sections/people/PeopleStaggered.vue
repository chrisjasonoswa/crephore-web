<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { personPhotoShapes } from '~/features/sections/people/people.helpers'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `staggered`: tall portraits (`photoShape`) in a row, every other one dropped lower. Two a row on phones, three
// in between and five from 768px; a row that isn't full is centred.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'photoShape'>>>()

const shape = computed(() => personPhotoShapes[props.options.photoShape])
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul v-if="content.people.length" data-people class="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-10">
      <li
        v-for="person in content.people"
        :key="person.id"
        data-person
        class="flex w-[calc((100%-1.25rem)/2)] flex-col items-center gap-3 even:mt-12 @2xl:w-[calc((100%-2.5rem)/3)] @2xl:even:mt-16 @3xl:w-[calc((100%-5rem)/5)]"
      >
        <PersonPhoto data-person-photo :data-shape="options.photoShape" :person="person" :styles="styles" class="w-full max-w-44" :class="shape" />
        <PersonCaption :person="person" :styles="styles" />
      </li>
    </ul>
  </SectionFrame>
</template>
