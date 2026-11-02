import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SiteDivider from '~/components/site-graphics/dividers/SiteDivider.vue'
import { getSiteDivider, siteDividers } from '~/components/site-graphics/dividers/site-dividers'

describe('site dividers', () => {
  it('has ten for any event and five for each kind of event, with unique keys and labels', () => {
    const count = (kind: string) => siteDividers.filter(divider => divider.kind === kind).length
    expect(count('any')).toBe(10)
    for (const kind of ['wedding', 'party', 'business', 'memorial'])
      expect(count(kind), kind).toBe(5)
    expect(new Set(siteDividers.map(divider => divider.key)).size).toBe(siteDividers.length)
    expect(new Set(siteDividers.map(divider => divider.label)).size).toBe(siteDividers.length)
  })

  it('keeps the keys saved menu cards already use', () => {
    expect(getSiteDivider('flourish')).toBeDefined()
    expect(getSiteDivider('dot')).toBeDefined()
    expect(getSiteDivider('none')).toBeUndefined()
  })

  it('draws every divider in the text colour, hidden from screen readers', async () => {
    for (const divider of siteDividers) {
      const svg = (await mountSuspended(SiteDivider, { props: { name: divider.key } })).find('svg')
      expect(svg.attributes('aria-hidden'), divider.key).toBe('true')
      expect(svg.attributes('viewBox')).toBe('0 0 120 24')
      const paths = svg.findAll('path')
      expect(paths).toHaveLength(divider.shapes.length)
      for (const path of paths)
        expect([path.attributes('fill'), path.attributes('stroke')], divider.key).toContain('currentColor')
    }
  })

  it('renders nothing for none or an unknown key', async () => {
    expect((await mountSuspended(SiteDivider, { props: { name: 'none' } })).find('svg').exists()).toBe(false)
    expect((await mountSuspended(SiteDivider, { props: { name: 'gone' } })).find('svg').exists()).toBe(false)
  })
})
