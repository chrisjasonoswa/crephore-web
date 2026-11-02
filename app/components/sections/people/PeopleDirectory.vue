<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `directory`: compact rows of a small round photo, the name and role, divided by thin lines, in one or two
// `columns` (one on phones). For committees, staff or long lists with photos.
const props = defineProps<SectionLayoutProps<'people'>>()

const twoColumns = computed(() => props.options.columns === '2')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto max-w-4xl">
      <PeopleHeading :content="content" :styles="styles" align="start" />
      <ul v-if="content.people.length" data-people class="mt-8 grid gap-x-10" :class="twoColumns && '@2xl:grid-cols-2'">
        <li v-for="person in content.people" :key="person.id" data-person class="flex items-center gap-4 border-b border-current/15 py-3">
          <PersonPhoto data-person-photo :person="person" :styles="styles" class="aspect-square w-12 shrink-0 rounded-full" />
          <PersonCaption :person="person" :styles="styles" align="start" />
        </li>
      </ul>
    </div>
  </SectionFrame>
</template>
