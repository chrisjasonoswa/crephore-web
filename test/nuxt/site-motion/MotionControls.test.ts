import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MotionControls from '~/components/site-editor/MotionControls.vue'

const theme: SiteTheme = {
  primaryColor: '#1E2A44',
  secondaryColor: '#E8A598',
  fontPairingKey: 'serif_classic',
  cornerStyle: 'soft',
  motion: { intro: 'shutter', intensity: 'normal' },
}

async function mountControls(start: SiteTheme = theme, props: Record<string, unknown> = {}) {
  const wrapper = await mountSuspended(MotionControls, {
    props: {
      'theme': start,
      'onUpdate:theme': (next: SiteTheme) => wrapper.setProps({ theme: next }),
      ...props,
    },
  })
  return wrapper
}
const motionOf = (wrapper: Awaited<ReturnType<typeof mountControls>>) => (wrapper.props('theme') as SiteTheme).motion

describe('motion controls', () => {
  it('offers the intros for any event, and none, as cards with their mood and length, the current one pressed', async () => {
    const wrapper = await mountControls()
    const choices = wrapper.findAll('[data-motion-choice]')
    expect(choices).toHaveLength(21)
    expect(choices[0]!.text()).toContain('No intro')
    expect(choices.find(choice => choice.attributes('aria-pressed') === 'true')!.attributes('data-motion-choice')).toBe('shutter')
    expect(wrapper.find('[data-motion-choice="shutter"]').text()).toMatch(/Signature · \d\.\d s/)
    // Only the intro: no scroll animations
    expect(wrapper.text()).not.toContain('Section transition')
  })

  it('lists the kinds in the same order as the colour presets, opening on the selected intro\'s kind', async () => {
    const wrapper = await mountControls(theme, { eventKind: 'party' })
    expect(wrapper.findAll('[data-intro-kind]').map(chip => chip.attributes('data-intro-kind'))).toEqual(['any', 'wedding', 'party', 'business', 'memorial'])
    // The shutter is an Any intro: it opens there, not on the event's kind
    expect(wrapper.find('[data-intro-kind="any"]').attributes('aria-pressed')).toBe('true')
  })

  it('picks the intro and the intensity, keeping the rest of the theme', async () => {
    const wrapper = await mountControls()
    await wrapper.find('[data-motion-choice="orbit"]').trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Bold')!.trigger('click')

    expect(motionOf(wrapper)).toEqual({ intro: 'orbit', intensity: 'bold' })
    // Picking one plays it in the preview; picking none doesn't
    expect(wrapper.emitted('play-intro')).toHaveLength(1)
    await wrapper.find('[data-motion-choice="none"]').trigger('click')
    expect(wrapper.emitted('play-intro')).toHaveLength(1)
    expect((wrapper.props('theme') as SiteTheme).primaryColor).toBe('#1E2A44')
  })

  it('asks the preview to play the intro, and can\'t without one', async () => {
    const wrapper = await mountControls()
    await wrapper.find('[data-play-intro]').trigger('click')
    expect(wrapper.emitted('play-intro')).toHaveLength(1)

    const none = await mountControls({ ...theme, motion: { ...theme.motion, intro: 'none' } })
    expect(none.find('[data-play-intro]').attributes('disabled')).toBeDefined()
  })

  it('lists the scenes by kind of event, starting on the selected intro\'s kind, and plays one when picked', async () => {
    const wrapper = await mountControls({ ...theme, motion: { intro: 'countdown', intensity: 'normal' } }, { eventKind: 'wedding' })
    expect(wrapper.find('[data-intro-kind="party"]').attributes('aria-pressed')).toBe('true')
    const choices = wrapper.findAll('[data-motion-choice]')
    expect(choices).toHaveLength(20)
    expect(choices[0]!.text()).toContain('Countdown pop')
    expect(choices[0]!.text()).toMatch(/Playful · \d\.\d s/)

    await wrapper.find('[data-motion-choice="balloon"]').trigger('click')
    expect(motionOf(wrapper).intro).toBe('balloon')
    expect(wrapper.emitted('play-intro')).toHaveLength(1)

    await wrapper.find('[data-intro-kind="any"]').trigger('click')
    expect(wrapper.findAll('[data-motion-choice]')).toHaveLength(21)
  })

  it('opens on the kind of the scene in use', async () => {
    const wrapper = await mountControls({ ...theme, motion: { intro: 'wreath-seal', intensity: 'normal' } }, { eventKind: 'wedding' })
    expect(wrapper.find('[data-intro-kind="memorial"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('[data-motion-choice="wreath-seal"]').attributes('aria-pressed')).toBe('true')
  })
})
