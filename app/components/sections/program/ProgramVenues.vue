<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { ProgramContent, ProgramVenue } from '~/features/sections/program/program.type'
import type { Align } from '~/features/sections/section.options'
import { MapPin } from '@lucide/vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { venuePreview } from '~/features/sections/program/program.helpers'
import ProgramVenueMapLink from './ProgramVenueMapLink.vue'
import ProgramVenuePreview from './ProgramVenuePreview.vue'
import ProgramVenuesHeading from './ProgramVenuesHeading.vue'

// The program's venues at the bottom of a program layout (`occasion.program.venues`: only venues with more than a
// name), under the section's own venues eyebrow and heading (`ProgramVenuesHeading`): each with its preview (its
// photo, else the map at its pin), name, address (in the text colour), notes (softer and smaller, secondary) and
// "See map". Nothing without venues. `look` fits it to the layout around it:
//  - rows: on the section's own background, a rule above; one venue with its preview beside its text, several two per
//    row from 768px with the preview above
//  - cards: light cards with a shadow, the preview on top (the card-based layouts); with `cardStyles`, cards in those
//    colours in turn and no shadow (the date blocks' colours)
//  - open: arranged like the cards but with no card: the preview as it is, the details under it on the section's colours
//  - agenda: like the agenda's items: a thin bordered box on the section's colours, the preview at its top, then the name,
//    the address behind a map pin and the notes under a dashed rule; two per row from 672px
//  - tickets: light tickets, the preview on a stub behind a perforated line with notches, like the tickets layout's
//  - poster: like the poster's items: the preview, the item's thin rule, then the name in small bold spaced capitals, the
//    address, notes and a "See map" link in small capitals, on the section's background, in the items' grid
//  - plain: centred text on the surface it's placed on, a small preview above (inside paper: the menu card, a note)
// When some venues have a preview and some don't, those without show a placeholder (a pin in a badge over the name, in
// the theme's soft tint; the tickets' stub its "Admit" label), so they all keep the same shape. Not a layout.
const props = withDefaults(defineProps<{
  venues: ProgramVenue[]
  // The section's content, for the block's eyebrow and heading
  content: Pick<ProgramContent, 'venuesEyebrow' | 'venuesHeading'>
  // The colours of what it sits on (the section's background, or the paper it's placed on for `plain`)
  styles: BackgroundStyles
  look?: 'rows' | 'cards' | 'open' | 'agenda' | 'tickets' | 'poster' | 'plain'
  // The eyebrow and heading's alignment (e.g. the timeline's `titleAlign`); by default left in rows and poster, else
  // centred
  headingAlign?: Align
  // The rows' rule above the block: the text colour, the label colour like the day dividers' lines (the timeline and
  // list), or none where the layout already ends on a line (the table)
  rule?: 'text' | 'label' | 'none'
  // Cards in these colours (and their text and button), in turn, without a shadow (the date blocks');
  // light cards with a shadow without
  cardStyles?: BackgroundStyles[]
}>(), {
  look: 'rows',
  rule: 'text',
})

// Named by its heading, else plainly
const label = computed(() => props.content.venuesHeading || (props.venues.length > 1 ? 'Venues' : 'Venue'))
// The list sits under the heading block when there is one
const align = computed<Align>(() => props.headingAlign ?? (['rows', 'poster', 'agenda'].includes(props.look) ? 'start' : 'center'))
// When any venue has a preview, the others show a placeholder in its place, so every venue keeps the same shape
const placeholders = computed(() => props.venues.some(venue => venuePreview(venue)))
const hasHeading = computed(() => !!(props.content.venuesEyebrow || props.content.venuesHeading))
// Cards and tickets are light, whatever the background (unless the cards are given colours)
const paper = backgroundStyles.light
const stylesOf = (index: number) => (props.cardStyles?.length ? props.cardStyles[index % props.cardStyles.length]! : paper)
// The notches are cut out of the ticket (a mask), so whatever is behind it shows through them
const notches = 'radial-gradient(circle at 9rem 0, transparent 0.5rem, #000 calc(0.5rem + 0.5px)), radial-gradient(circle at 9rem 100%, transparent 0.5rem, #000 calc(0.5rem + 0.5px))'
const notchStyle = { maskImage: notches, WebkitMaskImage: notches, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }
</script>

<template>
  <section v-if="venues.length" data-program-venues :data-look="look" :aria-label="label">
    <!-- Rows: the section's own colours, previews beside the text -->
    <template v-if="look === 'rows'">
      <div :class="rule === 'text' && 'border-t border-current/15 pt-10'">
        <!-- In the label colour at the day dividers' strength (the label colour is a text class, so a line of its own) -->
        <div v-if="rule === 'label'" aria-hidden="true" data-venues-rule class="mb-10 h-px bg-current/30" :class="styles.eyebrow" />
        <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
        <ul class="grid gap-8" :class="[hasHeading && 'mt-6', venues.length > 1 && '@3xl:grid-cols-2']">
          <!-- One venue: its preview beside the text; several (two per row): the preview above, so the text has room -->
          <li v-for="venue in venues" :key="venue.id" data-program-venue-entry class="flex flex-col gap-4" :class="venues.length === 1 && '@2xl:flex-row @2xl:items-start'">
            <ProgramVenuePreview
              :venue="venue" :placeholder="placeholders" :tint="styles.avatar" :badge="styles.avatarAccent"
              class="w-full shrink-0 overflow-hidden rounded-(--site-radius)"
              :class="venues.length === 1 ? 'aspect-4/3 @2xl:w-64' : 'aspect-16/9'"
            />
            <div class="flex min-w-0 flex-col gap-1.5">
              <h4 data-venue-name class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="styles.brandText">
                {{ venue.name }}
              </h4>
              <p v-if="venue.address" data-venue-address class="text-sm">
                {{ venue.address }}
              </p>
              <p v-if="venue.notes" data-venue-notes class="text-xs whitespace-pre-line" :class="styles.muted">
                {{ venue.notes }}
              </p>
              <ProgramVenueMapLink :venue="venue" class="mt-1 self-start" />
            </div>
          </li>
        </ul>
      </div>
    </template>

    <!-- Cards: light cards with the preview on top -->
    <template v-else-if="look === 'cards'">
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul :class="hasHeading && 'mt-6'" class="flex flex-wrap justify-center gap-6">
        <li
          v-for="(venue, index) in venues"
          :key="venue.id"
          data-program-venue-entry
          class="flex w-full flex-col overflow-hidden rounded-(--site-radius) @3xl:w-[calc(50%-0.75rem)] @5xl:max-w-md"
          :class="[stylesOf(index).root, !cardStyles?.length && 'shadow-md']"
        >
          <ProgramVenuePreview :venue="venue" :placeholder="placeholders" :tint="stylesOf(index).avatar" :badge="stylesOf(index).avatarAccent" class="aspect-16/9 w-full overflow-hidden" />
          <div class="flex flex-col gap-1.5 p-6">
            <h4 data-venue-name class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="stylesOf(index).brandText">
              {{ venue.name }}
            </h4>
            <p v-if="venue.address" data-venue-address class="text-sm">
              {{ venue.address }}
            </p>
            <p v-if="venue.notes" data-venue-notes class="text-xs whitespace-pre-line" :class="stylesOf(index).muted">
              {{ venue.notes }}
            </p>
            <ProgramVenueMapLink :venue="venue" class="mt-2 self-start" :link-class="`inline-flex items-center gap-1.5 rounded-(--site-radius) px-4 py-2 text-xs font-semibold ${stylesOf(index).button}`" />
          </div>
        </li>
      </ul>
    </template>

    <!-- Open: like the cards, without the card: the preview as it is, the details under it on the section's colours -->
    <template v-else-if="look === 'open'">
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul :class="hasHeading && 'mt-6'" class="flex flex-wrap justify-center gap-x-6 gap-y-10">
        <li
          v-for="venue in venues"
          :key="venue.id"
          data-program-venue-entry
          class="flex w-full flex-col gap-4 @3xl:w-[calc(50%-0.75rem)] @5xl:max-w-md"
        >
          <ProgramVenuePreview :venue="venue" :placeholder="placeholders" :tint="styles.avatar" :badge="styles.avatarAccent" class="aspect-16/9 w-full overflow-hidden rounded-(--site-radius)" />
          <div class="flex flex-col gap-1.5">
            <h4 data-venue-name class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="styles.brandText">
              {{ venue.name }}
            </h4>
            <p v-if="venue.address" data-venue-address class="text-sm">
              {{ venue.address }}
            </p>
            <p v-if="venue.notes" data-venue-notes class="text-xs whitespace-pre-line" :class="styles.muted">
              {{ venue.notes }}
            </p>
            <ProgramVenueMapLink :venue="venue" class="mt-2 self-start" :link-class="`inline-flex items-center gap-1.5 rounded-(--site-radius) px-4 py-2 text-xs font-semibold ${styles.button}`" />
          </div>
        </li>
      </ul>
    </template>

    <!-- Agenda: bordered boxes like the agenda's items, the preview at the top and the details under it -->
    <template v-else-if="look === 'agenda'">
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul :class="[hasHeading && 'mt-6', venues.length > 1 && '@2xl:grid-cols-2']" class="grid gap-3">
        <li
          v-for="venue in venues"
          :key="venue.id"
          data-program-venue-entry
          class="flex flex-col gap-4 rounded-(--site-radius) border border-current/15 p-4 @2xl:p-6"
        >
          <ProgramVenuePreview
            :venue="venue" :placeholder="placeholders" :tint="styles.avatar" :badge="styles.avatarAccent"
            class="w-full overflow-hidden rounded-(--site-radius)"
            :class="venues.length > 1 ? 'aspect-16/9' : 'aspect-2/1'"
          />
          <div class="flex flex-col">
            <h4 data-venue-name class="font-(family-name:--site-font-heading) text-lg leading-snug @2xl:text-2xl" :class="styles.brandText">
              {{ venue.name }}
            </h4>
            <p v-if="venue.address" data-venue-address class="mt-3 flex items-start gap-2 text-sm">
              <MapPin aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="styles.accent" />
              <span>{{ venue.address }}</span>
            </p>
            <ProgramVenueMapLink :venue="venue" class="mt-3 self-start" />
            <p v-if="venue.notes" data-venue-notes class="mt-4 border-t border-dashed border-current/20 pt-4 text-xs whitespace-pre-line" :class="styles.muted">
              {{ venue.notes }}
            </p>
          </div>
        </li>
      </ul>
    </template>

    <!-- Tickets: the preview on a stub, a perforated line, then the text -->
    <template v-else-if="look === 'tickets'">
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul :class="hasHeading && 'mt-6'" class="mx-auto flex max-w-3xl flex-col gap-5">
        <li v-for="venue in venues" :key="venue.id" data-program-venue-entry class="drop-shadow-md">
          <div class="flex min-h-36 rounded-(--site-radius)" :class="paper.root" :style="notchStyle">
            <div class="w-36 shrink-0 overflow-hidden rounded-s-(--site-radius) bg-(--site-primary-50)">
              <ProgramVenuePreview v-if="venuePreview(venue)" :venue="venue" class="size-full" />
              <div v-else class="flex size-full items-center justify-center text-[0.65rem] font-semibold tracking-[0.25em] uppercase" :class="paper.eyebrow">
                Admit
              </div>
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-1.5 border-s-2 border-dashed border-current/20 p-5">
              <h4 data-venue-name class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="paper.brandText">
                {{ venue.name }}
              </h4>
              <p v-if="venue.address" data-venue-address class="text-sm font-semibold tracking-[0.15em] uppercase">
                {{ venue.address }}
              </p>
              <p v-if="venue.notes" data-venue-notes class="text-xs whitespace-pre-line" :class="paper.muted">
                {{ venue.notes }}
              </p>
              <ProgramVenueMapLink :venue="venue" class="mt-1 self-start" />
            </div>
          </div>
        </li>
      </ul>
    </template>

    <!-- Poster: big bold capitals, the preview framed in the text colour -->
    <template v-else-if="look === 'poster'">
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul class="grid gap-x-10 gap-y-12 @2xl:grid-cols-2" :class="hasHeading && 'mt-10'">
        <li v-for="venue in venues" :key="venue.id" data-program-venue-entry class="flex flex-col">
          <ProgramVenuePreview :venue="venue" :placeholder="placeholders" :tint="styles.avatar" :badge="styles.avatarAccent" class="aspect-16/9 w-full overflow-hidden" />
          <span aria-hidden="true" class="block h-0.5 w-full bg-current/30" :class="(placeholders || venuePreview(venue)) && 'mt-5'" />
          <h4 data-venue-name class="mt-4 text-sm font-bold tracking-[0.2em] uppercase">
            {{ venue.name }}
          </h4>
          <p v-if="venue.address" data-venue-address class="mt-2 text-sm font-medium">
            {{ venue.address }}
          </p>
          <p v-if="venue.notes" data-venue-notes class="mt-1.5 text-xs whitespace-pre-line" :class="styles.muted">
            {{ venue.notes }}
          </p>
          <ProgramVenueMapLink
            :venue="venue"
            class="mt-3 self-start"
            link-class="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase underline underline-offset-4"
          />
        </li>
      </ul>
    </template>

    <!-- Plain: centred text on the paper it sits on, a small preview above -->
    <template v-else>
      <ProgramVenuesHeading :content="content" :styles="styles" :align="align" />
      <ul :class="hasHeading && 'mt-6'" class="flex flex-col gap-8">
        <li v-for="venue in venues" :key="venue.id" data-program-venue-entry class="flex flex-col items-center gap-1.5 text-center">
          <ProgramVenuePreview :venue="venue" :placeholder="placeholders" :tint="styles.avatar" :badge="styles.avatarAccent" class="mb-2 aspect-16/9 w-full max-w-xs overflow-hidden rounded-(--site-radius)" />
          <h4 data-venue-name class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="styles.brandText">
            {{ venue.name }}
          </h4>
          <p v-if="venue.address" data-venue-address class="text-sm">
            {{ venue.address }}
          </p>
          <p v-if="venue.notes" data-venue-notes class="max-w-md text-xs whitespace-pre-line italic" :class="styles.muted">
            {{ venue.notes }}
          </p>
          <ProgramVenueMapLink :venue="venue" class="mt-1" />
        </li>
      </ul>
    </template>
  </section>
</template>
