import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ThemeControls from '~/components/site-editor/ThemeControls.vue'

const theme: SiteTheme = {
  primaryColor: '#1E2A44',
  secondaryColor: '#E8A598',
  fontPairingKey: 'serif_classic',
  cornerStyle: 'soft',
  motion: { intro: 'shutter', intensity: 'normal' },
}

type Group = 'colors' | 'fonts' | 'animation'

// Every group starts closed; `open` opens one (the colours, by default) the way a host would
async function mountControls(start: SiteTheme = theme, props: Record<string, unknown> = {}, open: Group | null = 'colors') {
  const wrapper = await mountSuspended(ThemeControls, {
    props: {
      'theme': start,
      'onUpdate:theme': (next: SiteTheme) => wrapper.setProps({ theme: next }),
      ...props,
    },
  })
  if (open)
    await wrapper.find(`[data-style-group="${open}"] button`).trigger('click')
  return wrapper
}
const isOpen = (wrapper: Awaited<ReturnType<typeof mountControls>>, group: Group) =>
  wrapper.find(`[data-style-group="${group}"] button`).attributes('aria-expanded') === 'true'
const summaryOf = (wrapper: Awaited<ReturnType<typeof mountControls>>, group: Group) =>
  wrapper.find(`[data-style-group="${group}"] [data-style-summary]`).text()
const themeOf = (wrapper: Awaited<ReturnType<typeof mountControls>>) => wrapper.props('theme') as SiteTheme
const presetNames = (wrapper: Awaited<ReturnType<typeof mountControls>>) => wrapper.findAll('[data-color-preset]').map(preset => preset.attributes('data-color-preset'))

describe('theme controls: colours', () => {
  it('shows the presets of the preset in use, by kind of event, the current one pressed', async () => {
    const wrapper = await mountControls()

    expect(wrapper.find('[data-preset-kind="any"]').attributes('aria-pressed')).toBe('true')
    expect(presetNames(wrapper)).toHaveLength(6)
    expect(wrapper.find('[data-color-preset="Midnight & Rose"]').attributes('aria-pressed')).toBe('true')

    await wrapper.find('[data-preset-kind="party"]').trigger('click')
    expect(presetNames(wrapper)).toContain('Flamingo, Lemon & Teal')
  })

  it('opens on the kind of the preset in use, or the event\'s kind with custom colours', async () => {
    const custom = await mountControls({ ...theme, primaryColor: '#123456', secondaryColor: undefined }, { eventKind: 'memorial' })
    expect(presetNames(custom)[0]).toBe('Charcoal')

    // Hot Pink is a party preset: it opens there whatever the event
    const preset = await mountControls({ ...theme, primaryColor: '#E6337A', secondaryColor: undefined, accentColor: undefined }, { eventKind: 'memorial' })
    expect(presetNames(preset)).toContain('Hot Pink')
  })

  it('applies a preset\'s colours, leaving out the ones it doesn\'t have', async () => {
    const wrapper = await mountControls({ ...theme, accentColor: '#C9A54C' }, { eventKind: 'party' })

    await wrapper.find('[data-color-preset="Grape, Mint & Sunshine"]').trigger('click')
    expect(themeOf(wrapper)).toMatchObject({ primaryColor: '#5B2A86', secondaryColor: '#A8F0D1', accentColor: '#FFC93C' })

    await wrapper.find('[data-color-preset="Hot Pink"]').trigger('click')
    expect(themeOf(wrapper).primaryColor).toBe('#E6337A')
    expect(themeOf(wrapper)).not.toHaveProperty('secondaryColor')
    expect(themeOf(wrapper)).not.toHaveProperty('accentColor')
  })

  it('lets the secondary and accent be cleared, and the accent be added', async () => {
    const wrapper = await mountControls()

    expect(wrapper.findAll('[data-clear-color]')).toHaveLength(1)
    await wrapper.find('[data-clear-color]').trigger('click')
    expect(themeOf(wrapper)).not.toHaveProperty('secondaryColor')

    await wrapper.find('input[id$="-accent"]').setValue('#c9a54c')
    expect(themeOf(wrapper).accentColor).toBe('#C9A54C')
    await wrapper.find('input[id$="-accent"]').setValue('')
    expect(themeOf(wrapper)).not.toHaveProperty('accentColor')
  })
})

describe('theme controls: groups', () => {
  it('starts with every group closed, so all three show at a glance', async () => {
    const wrapper = await mountControls(theme, {}, null)

    expect(wrapper.findAll('[data-style-group] button').map(button => button.text())).toEqual([
      expect.stringContaining('Colors'),
      expect.stringContaining('Fonts & corners'),
      expect.stringContaining('Animation'),
    ])
    expect((['colors', 'fonts', 'animation'] as const).some(group => isOpen(wrapper, group))).toBe(false)
    expect(wrapper.find('[data-color-preset]').exists()).toBe(false)
  })

  it('opens one group at a time, and closes it when its row is clicked again', async () => {
    const wrapper = await mountControls(theme, {}, 'colors')
    expect(isOpen(wrapper, 'colors')).toBe(true)

    await wrapper.find('[data-style-group="animation"] button').trigger('click')
    expect(isOpen(wrapper, 'animation')).toBe(true)
    expect(isOpen(wrapper, 'colors')).toBe(false)

    await wrapper.find('[data-style-group="animation"] button').trigger('click')
    expect(isOpen(wrapper, 'animation')).toBe(false)
  })

  it('says what\'s chosen in each group\'s row', async () => {
    const wrapper = await mountControls(theme, {}, null)
    expect(summaryOf(wrapper, 'colors')).toBe('Midnight & Rose')
    expect(summaryOf(wrapper, 'fonts')).toBe('Serif classic · Soft corners')
    expect(summaryOf(wrapper, 'animation')).toBe('Shutter · Normal')

    const custom = await mountControls({ ...theme, primaryColor: '#123456', motion: { intro: 'none', intensity: 'bold' } }, {}, null)
    expect(summaryOf(custom, 'colors')).toBe('Custom colors')
    expect(summaryOf(custom, 'animation')).toBe('No intro')
  })

  it('puts the intensity above the intro in Animation', async () => {
    const wrapper = await mountControls(theme, {}, 'animation')
    const html = wrapper.find('[data-style-group="animation"]').html()

    expect(html.indexOf('Intensity')).toBeGreaterThan(-1)
    expect(html.indexOf('Intensity')).toBeLessThan(html.indexOf('Intro animation'))
  })
})
