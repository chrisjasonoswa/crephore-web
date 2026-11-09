<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { personPhotoShapes } from '~/features/sections/people/people.helpers'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `featured` ("Featured pair"): the first two people as large portraits (`photoShape`) joined by an ampersand,
// for the couple or the hosts; everyone else as small round photos below, a row that isn't full centred. On phones the
// pair stacks with the ampersand between them.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'photoShape'>>>()

const shape = computed(() => personPhotoShapes[props.options.photoShape])
const pair = computed(() => props.content.people.slice(0, 2))
const others = computed(() => props.content.people.slice(2))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <div v-if="pair.length" data-people-pair class="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-center @2xl:gap-10">
      <template v-for="(person, index) in pair" :key="person.id">
        <span
          v-if="index === 1"
          aria-hidden="true"
          data-people-ampersand
          class="font-(family-name:--site-font-heading) text-5xl leading-none @2xl:self-center @2xl:text-7xl"
          :class="styles.eyebrow"
        >&amp;</span>
        <div data-person class="flex flex-col items-center gap-4">
          <PersonPhoto data-person-photo :data-shape="options.photoShape" :person="person" :styles="styles" class="w-40 @2xl:w-56" :class="shape" />
          <PersonCaption :person="person" :styles="styles" size="medium" />
        </div>
      </template>
    </div>
    <ul v-if="others.length" data-people class="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-8">
      <li
        v-for="person in others"
        :key="person.id"
        data-person
        class="flex w-[calc((100%-1.5rem)/2)] flex-col items-center gap-2 @2xl:w-[calc((100%-3rem)/3)] @3xl:w-[calc((100%-4.5rem)/4)]"
      >
        <PersonPhoto data-person-photo :person="person" :styles="styles" class="aspect-square w-20 rounded-full" />
        <PersonCaption :person="person" :styles="styles" />
      </li>
    </ul>
  </SectionFrame>
</template>
