import type { AboutContent } from '~/features/sections/about/about.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import WebsiteAboutFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteAboutFields.vue'

// With a real layout, so its declared fields drive the editor: a story layout, a timeline, the text-only timeline
async function mountFields(props: { layout: 'split' | 'timeline-zigzag' | 'timeline-compact', content?: AboutContent }) {
  const wrapper = await mountSuspended(WebsiteAboutFields, {
    props: {
      'eventId': 5,
      'layout': getSectionLayout('about', props.layout)!,
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
  it('edits the story on story layouts, without the timeline', async () => {
    const wrapper = await mountFields({ layout: 'split' })

    expect(wrapper.text()).toContain('Story')
    expect(wrapper.find('[data-timeline-fields]').exists()).toBe(false)

    await wrapper.find('textarea').setValue('Our story.\n\nThe end.')
    expect(content(wrapper).body).toBe('Our story.\n\nThe end.')
    await wrapper.find('textarea').setValue('')
    expect(content(wrapper).body).toBeUndefined()
  })

  it('edits the chapters on timeline layouts, with the story as an optional intro', async () => {
    const wrapper = await mountFields({ layout: 'timeline-zigzag' })

    expect(wrapper.text()).toContain('Intro (optional)')
    expect(wrapper.findAll('[data-timeline-item]')).toHaveLength(3)

    await wrapper.find('input[placeholder="e.g. Spilled coffee"]').setValue('First coffee')
    expect(headings(wrapper)[0]).toBe('First coffee')
  })

  it('adds, reorders and removes chapters', async () => {
    const wrapper = await mountFields({ layout: 'timeline-zigzag' })
    const button = (label: string) => wrapper.findAll('button').find(b => b.attributes('aria-label') === label || b.text() === label)!

    await button('Add a chapter').trigger('click')
    expect(content(wrapper).timeline).toHaveLength(4)
    expect(content(wrapper).timeline[3]).toMatchObject({ heading: '' })

    // Arrow Down on the first chapter's handle moves it down; Arrow Up on it does nothing
    await wrapper.findAll('[data-timeline-handle]')[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(headings(wrapper).slice(0, 2)).toEqual(['Two cities, one love', 'Spilled coffee'])
    await wrapper.findAll('[data-timeline-handle]')[0]!.trigger('keydown', { key: 'ArrowUp' })
    expect(headings(wrapper).slice(0, 2)).toEqual(['Two cities, one love', 'Spilled coffee'])

    await button('Remove chapter 4').trigger('click')
    expect(headings(wrapper)).toEqual(['Two cities, one love', 'Spilled coffee', 'Yes, in Batangas'])
  })

  it('offers a photo per chapter, except on the text-only timeline', async () => {
    expect((await mountFields({ layout: 'timeline-zigzag' })).findAll('[data-photo-label]').map(label => label.text()))
      .toEqual(['Chapter 1 photo', 'Chapter 2 photo', 'Chapter 3 photo'])
    expect((await mountFields({ layout: 'timeline-compact' })).findAll('[data-photo-label]')).toHaveLength(0)
  })

  it('stops adding chapters at twelve', async () => {
    const twelve = Array.from({ length: 12 }, (_, index) => ({ heading: `Chapter ${index + 1}` }))
    const wrapper = await mountFields({ layout: 'timeline-zigzag', content: { timeline: twelve, layoutPhotos: [] } })

    expect(wrapper.findAll('button').find(b => b.text() === 'Add a chapter')!.attributes('disabled')).toBeDefined()
  })
})
