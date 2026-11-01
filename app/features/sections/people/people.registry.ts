import type { SectionTypeDefinition } from '../section.registry.type'
import { layout, onColour, onPaper } from '../section.layout'

// The people section type and its layouts, in picker order (see section.registry.ts).
export const peopleSection: SectionTypeDefinition<'people'> = {
  type: 'people',
  name: 'People',
  description: 'Who\'s who: the entourage, the hosts, speakers or a committee, with photos, roles and short bios.',
  contentVersion: 1,
  defaultContent: {
    eyebrow: 'The entourage',
    heading: 'Meet our people',
    people: [
      { id: 'sample-1', name: 'Bea Santos', role: 'Bride', bio: 'Coffee lover, planner of everything, and the one who said yes.' },
      { id: 'sample-2', name: 'Carlo Reyes', role: 'Groom', bio: 'Spilled the coffee that started it all.' },
      { id: 'sample-3', name: 'Tita Lorna', role: 'Maid of honour', bio: 'College best friend. Planned the proposal and kept it secret for six months.' },
      { id: 'sample-4', name: 'Migs Cruz', role: 'Best man', bio: 'Carlo\'s brother in all but blood, since grade school.' },
      { id: 'sample-5', name: 'Ana Lim', role: 'Bridesmaid' },
      { id: 'sample-6', name: 'Paolo Tan', role: 'Groomsman' },
      { id: 'sample-7', name: 'Joy Uy', role: 'Bridesmaid' },
      { id: 'sample-8', name: 'Ken Go', role: 'Groomsman' },
    ],
  },
  // Every layout uses the same fields; photos belong to the people (none in `entourage` and `credits`), bios show
  // only in `cards` and `spotlight`. No layout has layout photos.
  layouts: [
    layout({
      key: 'grid',
      name: 'Photo grid',
      description: 'Photos with the name and role underneath, in an even grid.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [
        { key: 'columns', label: 'Columns', choices: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }], default: '4' },
        {
          key: 'photoShape',
          label: 'Photo shape',
          choices: [{ value: 'circle', label: 'Circle' }, { value: 'arch', label: 'Arch' }, { value: 'square', label: 'Square' }],
          default: 'circle',
        },
      ],
    }, () => import('~/components/sections/people/PeopleGrid.vue')),
    layout({
      key: 'entourage',
      name: 'Entourage list',
      description: 'Names only, no photos. People next to each other with the same role share one heading. Best for sponsors and the full entourage.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{ key: 'columns', label: 'Columns', choices: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }], default: '3' }],
    }, () => import('~/components/sections/people/PeopleEntourage.vue')),
    layout({
      key: 'featured',
      name: 'Featured pair',
      description: 'The first two people as large portraits joined by an ampersand, for the couple or the hosts. Everyone else in a grid below.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{
        key: 'photoShape',
        label: 'Photo shape',
        choices: [{ value: 'arch', label: 'Arch' }, { value: 'circle', label: 'Circle' }],
        default: 'arch',
      }],
    }, () => import('~/components/sections/people/PeopleFeatured.vue')),
    layout({
      key: 'cards',
      name: 'Cards with bio',
      description: 'Each person on a card with a short bio. Best for speakers, hosts or a small entourage.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{ key: 'columns', label: 'Columns', choices: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], default: '3' }],
    }, () => import('~/components/sections/people/PeopleCards.vue')),
    layout({
      key: 'spotlight',
      name: 'Spotlight',
      description: 'One person per row with a large photo and bio. For a few key people.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{
        key: 'alternate',
        label: 'Photo sides',
        choices: [{ value: 'yes', label: 'Alternate' }, { value: 'no', label: 'Same side' }],
        default: 'yes',
      }],
    }, () => import('~/components/sections/people/PeopleSpotlight.vue')),
    layout({
      key: 'carousel',
      name: 'Carousel',
      description: 'A swipeable row of tall portraits with names. Fits a big group in little space.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{
        key: 'photoShape',
        label: 'Photo shape',
        choices: [{ value: 'arch', label: 'Arch' }, { value: 'rounded', label: 'Rounded' }],
        default: 'arch',
      }],
    }, () => import('~/components/sections/people/PeopleCarousel.vue')),
    layout({
      key: 'staggered',
      name: 'Staggered',
      description: 'Tall portraits in a row, every other one dropped lower. Elegant for a small, important group.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{
        key: 'photoShape',
        label: 'Photo shape',
        choices: [{ value: 'arch', label: 'Arch' }, { value: 'rounded', label: 'Rounded' }],
        default: 'arch',
      }],
    }, () => import('~/components/sections/people/PeopleStaggered.vue')),
    layout({
      key: 'polaroids',
      name: 'Polaroid wall',
      description: 'Instant photos scattered like a photo wall, a name written on each. Playful, for friends and the barkada.',
      layoutPhotoCount: 0,
      backgrounds: onPaper,
      options: [{
        key: 'tilt',
        label: 'Tilt',
        choices: [{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }],
        default: 'on',
      }],
    }, () => import('~/components/sections/people/PeoplePolaroids.vue')),
    layout({
      key: 'directory',
      name: 'Directory',
      description: 'Compact rows: a small photo, the name and role. For committees, staff or long lists with photos.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{ key: 'columns', label: 'Columns', choices: [{ value: '1', label: '1' }, { value: '2', label: '2' }], default: '2' }],
    }, () => import('~/components/sections/people/PeopleDirectory.vue')),
    layout({
      key: 'credits',
      name: 'Credits',
      description: 'Like the end credits of a film: each role in small caps with the name in large type. Text only.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [{
        key: 'roleFirst',
        label: 'Role',
        choices: [{ value: 'yes', label: 'Above name' }, { value: 'no', label: 'Below name' }],
        default: 'yes',
      }],
    }, () => import('~/components/sections/people/PeopleCredits.vue')),
  ],
}
