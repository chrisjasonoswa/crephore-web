import type { Section } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { createDefaultSection, getSectionLayout } from '~/features/sections/section.registry'
import WebsiteSectionNotes from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteSectionNotes.vue'
import WebsiteSectionList from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteSectionList.vue'

const about = (layout: string, timeline: { heading: string }[]): Section<'about'> =>
  ({ ...createDefaultSection('about'), layout, content: { heading: 'Our story', timeline, layoutPhotos: [] } })
const notesFor = (section: Section) => mountSuspended(WebsiteSectionNotes, {
  props: { section, layout: getSectionLayout(section.type, section.layout)! },
})

describe('website section notes', () => {
  it('warns when the layout needs content that\'s still empty', async () => {
    const wrapper = await notesFor(about('timeline-zigzag', []))

    expect(wrapper.find('[data-missing-notes]').text()).toBe('This layout needs at least one chapter.')
    expect(wrapper.find('[data-hidden-notes]').exists()).toBe(false)
  })

  it('says what the layout doesn\'t show and that it\'s kept', async () => {
    const wrapper = await notesFor(about('split', [{ heading: 'We met' }, { heading: 'We moved' }, { heading: 'Yes' }]))

    expect(wrapper.find('[data-hidden-notes]').text()).toBe('This layout doesn\'t show your 3 chapters. They\'re kept for layouts that do.')
    expect(wrapper.find('[data-missing-notes]').exists()).toBe(false)
  })

  it('shows nothing when the layout has what it needs and shows everything filled in', async () => {
    const wrapper = await notesFor(about('timeline-zigzag', [{ heading: 'We met' }]))

    expect(wrapper.find('[role="note"]').exists()).toBe(false)
  })

  it('marks sections missing content in the section list', async () => {
    const sections = [
      { ...about('timeline-zigzag', []), key: 'a', isVisible: true, visibility: 'Always' as const },
      { ...about('timeline-zigzag', [{ heading: 'We met' }]), key: 'b', isVisible: true, visibility: 'Always' as const },
    ]
    const list = await mountSuspended(WebsiteSectionList, { props: { sections } })
    const rows = list.findAll('[data-section-row]')

    expect(rows[0]!.find('[data-section-missing]').exists()).toBe(true)
    expect(rows[0]!.text()).toContain('(missing content its layout needs)')
    expect(rows[1]!.find('[data-section-missing]').exists()).toBe(false)
  })
})
