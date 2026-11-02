<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `spotlight`: one person per row with a large photo and their role, name and bio beside it; the photo
// alternates sides from row to row (`alternate`) or stays on the left. On phones the photo goes on top.
const props = defineProps<SectionLayoutProps<'people'>>()

const photoOnRight = (index: number) => props.options.alternate === 'yes' && index % 2 === 1
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto max-w-4xl">
      <PeopleHeading :content="content" :styles="styles" align="start" />
      <ul v-if="content.people.length" data-people class="mt-10 flex flex-col gap-12">
        <li
          v-for="(person, index) in content.people"
          :key="person.id"
          data-person
          :data-photo-side="photoOnRight(index) ? 'right' : 'left'"
          class="grid items-center gap-6 @2xl:gap-10"
          :class="photoOnRight(index) ? '@2xl:grid-cols-[1fr_14rem]' : '@2xl:grid-cols-[14rem_1fr]'"
        >
          <PersonPhoto
            data-person-photo
            :person="person"
            :styles="styles"
            class="aspect-4/5 w-full max-w-56 rounded-(--site-radius) @2xl:row-start-1"
            :class="photoOnRight(index) ? '@2xl:col-start-2 @2xl:justify-self-end' : '@2xl:col-start-1'"
          />
          <PersonCaption
            :person="person"
            :styles="styles"
            align="start"
            size="medium"
            role-first
            show-bio
            class="@2xl:row-start-1"
            :class="photoOnRight(index) ? '@2xl:col-start-1' : '@2xl:col-start-2'"
          />
        </li>
      </ul>
    </div>
  </SectionFrame>
</template>
