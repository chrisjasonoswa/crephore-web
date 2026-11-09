<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { groupPeopleByRole } from '~/features/sections/people/people.helpers'
import PeopleHeading from './PeopleHeading.vue'

// Layout `entourage` ("Entourage list"): names only, no photos. People next to each other with the same role share one
// heading ("Principal sponsors"), in up to `columns` columns (one on phones). Names in the background's brand text
// colour, roles in its brand label colour.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'columns'>>>()

const groups = computed(() => groupPeopleByRole(props.content.people))
const columns: Record<string, string> = {
  1: '',
  2: '@2xl:columns-2',
  3: '@2xl:columns-2 @3xl:columns-3',
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <div v-if="groups.length" data-people class="mx-auto mt-10 max-w-4xl gap-10 text-center" :class="columns[options.columns]">
      <section v-for="(group, index) in groups" :key="index" data-people-group class="mb-7 break-inside-avoid">
        <h3 v-if="group.role" data-person-role class="mb-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase @2xl:text-[0.7rem]" :class="styles.eyebrow">
          {{ group.role }}
        </h3>
        <ul :class="styles.brandText">
          <li v-for="person in group.people" :key="person.id" data-person class="font-(family-name:--site-font-heading) text-lg leading-snug @2xl:text-xl">
            {{ person.name }}
          </li>
        </ul>
      </section>
    </div>
  </SectionFrame>
</template>
