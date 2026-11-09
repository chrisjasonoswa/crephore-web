<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { peopleRowWidths } from '~/features/sections/people/people.helpers'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `cards` ("Cards with bio"): each person on a light card with their photo, name, role and bio, `columns` a row
// from 768px (one on phones, two in between); a row that isn't full is centred.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'columns'>>>()

const width = computed(() => peopleRowWidths[props.options.columns])
// The cards are always light, whatever the background
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul v-if="content.people.length" data-people class="mx-auto mt-10 flex flex-wrap justify-center gap-6">
      <li
        v-for="person in content.people"
        :key="person.id"
        data-person
        class="flex w-full max-w-sm flex-col gap-4 rounded-(--site-radius) p-4 shadow-md @2xl:w-[calc((100%-1.5rem)/2)] @2xl:max-w-none"
        :class="[cardStyles.root, width]"
      >
        <!-- The initials in the section's avatar colours; the text in the light card's colours -->
        <PersonPhoto data-person-photo :person="person" :styles="styles" class="aspect-16/10 w-full rounded-(--site-radius)" />
        <PersonCaption :person="person" :styles="cardStyles" show-bio />
      </li>
    </ul>
  </SectionFrame>
</template>
