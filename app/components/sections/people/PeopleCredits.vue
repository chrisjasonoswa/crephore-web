<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'

// Layout `credits`: like the end credits of a film, one person after another, centred: the role in small capitals
// above the name in large type (`roleFirst`), or below it. Text only.
defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'roleFirst'>>>()
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul v-if="content.people.length" data-people class="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-6 @2xl:gap-8">
      <li v-for="person in content.people" :key="person.id" data-person>
        <PersonCaption :person="person" :styles="styles" size="large" :role-first="options.roleFirst === 'yes'" />
      </li>
    </ul>
  </SectionFrame>
</template>
