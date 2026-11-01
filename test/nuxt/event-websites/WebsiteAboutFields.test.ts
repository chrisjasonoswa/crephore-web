import type { AboutContent } from '~/features/sections/section.content.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { getSectionType } from '~/features/sections/section.registry'
import WebsiteAboutFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteAboutFields.vue'

async function mountFields(props: { isTimeline: boolean, showChapterPhotos?: boolean, content?: AboutContent }) {
  const wrapper = await mountSuspended(WebsiteAboutFields, {
    props: {
      'eventId': 5,
      'isTimeline': props.isTimeline,
      'showChapterPhotos': props.showChapterPhotos ?? true,
      'content': props.content ?? structuredClone(getSectionType('about').defaultContent),
      'onUpdate:content': (next: AboutContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountFields>>
const content = (wrapper: Wrapper) => wrapper.props('content') as AboutContent
const headings = (wrapper: Wrapper) => content(wrapper).timeline.map(item => item.heading)

describe('website about fields', () => {
  it('edits the story on story layouts, and only mentions the timeline', async () => {
    const wrapper = await mountFields({ isTimeline: false })

    expect(wrapper.text()).toContain('Story')
    expect(wrapper.find('[data-timeline-fields]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Your timeline (3 chapters) shows in the Timeline layouts.')

    await wrapper.find('textarea').setValue('Our story.\n\nThe end.')
    expect(content(wrapper).body).toBe('Our story.\n\nThe end.')
    await wrapper.find('textarea').setValue('')
    expect(content(wrapper).body).toBeUndefined()
  })

  it('edits the chapters on timeline layouts, with the story as an optional intro', async () => {
    const wrapper = await mountFields({ isTimeline: true })

    expect(wrapper.text()).toContain('Intro (optional)')
    expect(wrapper.findAll('[data-timeline-item]')).toHaveLength(3)

    await wrapper.find('input[placeholder="e.g. Spilled coffee"]').setValue('First coffee')
    expect(headings(wrapper)[0]).toBe('First coffee')
  })

  it('adds, reorders and removes chapters', async () => {
    const wrapper = await mountFields({ isTimeline: true })
    const button = (label: string) => wrapper.findAll('button').find(b => b.attributes('aria-label') === label || b.text() === label)!

    await button('Add a chapter').trigger('click')
    expect(content(wrapper).timeline).toHaveLength(4)
    expect(content(wrapper).timeline[3]).toMatchObject({ heading: '' })

    await button('Move chapter 1 down').trigger('click')
    expect(headings(wrapper).slice(0, 2)).toEqual(['Two cities, one love', 'Spilled coffee'])
    expect(button('Move chapter 1 up').attributes('disabled')).toBeDefined()

    await button('Remove chapter 4').trigger('click')
    expect(headings(wrapper)).toEqual(['Two cities, one love', 'Spilled coffee', 'Yes, in Batangas'])
  })

  it('offers a photo per chapter, except on the text-only timeline', async () => {
    expect((await mountFields({ isTimeline: true })).findAll('[data-photo-label]').map(label => label.text()))
      .toEqual(['Chapter 1 photo', 'Chapter 2 photo', 'Chapter 3 photo'])
    expect((await mountFields({ isTimeline: true, showChapterPhotos: false })).findAll('[data-photo-label]')).toHaveLength(0)
  })

  it('stops adding chapters at twelve', async () => {
    const twelve = Array.from({ length: 12 }, (_, index) => ({ heading: `Chapter ${index + 1}` }))
    const wrapper = await mountFields({ isTimeline: true, content: { timeline: twelve, layoutPhotos: [] } })

    expect(wrapper.findAll('button').find(b => b.text() === 'Add a chapter')!.attributes('disabled')).toBeDefined()
  })
})
