import { describe, expect, it } from 'vitest'
import { siteAddress, siteSubdomainOf } from '~/features/sites/site'

describe('site address', () => {
  it('builds an event website\'s host and link from the site base URL', () => {
    const production = siteAddress('https://crephore.com')
    const development = siteAddress('http://localhost:3000')

    expect(production.domain).toBe('crephore.com')
    expect(production.hostOf('ana-and-marco')).toBe('ana-and-marco.crephore.com')
    expect(production.urlOf('ana-and-marco')).toBe('https://ana-and-marco.crephore.com')
    expect(development.domain).toBe('localhost:3000')
    expect(development.urlOf('ana-and-marco')).toBe('http://ana-and-marco.localhost:3000')
  })

  it('finds the event website a host is for', () => {
    expect(siteSubdomainOf('ana-and-marco.localhost', 'http://localhost:3000')).toBe('ana-and-marco')
    expect(siteSubdomainOf('Ana-And-Marco.crephore.com', 'https://crephore.com')).toBe('ana-and-marco')
  })

  it('treats Crephore\'s own hosts as no event website', () => {
    expect(siteSubdomainOf('localhost', 'http://localhost:3000')).toBeNull()
    expect(siteSubdomainOf('crephore.com', 'https://crephore.com')).toBeNull()
    expect(siteSubdomainOf('www.crephore.com', 'https://crephore.com')).toBeNull()
    expect(siteSubdomainOf('a.b.crephore.com', 'https://crephore.com')).toBeNull()
    expect(siteSubdomainOf('crephore.com.evil.test', 'https://crephore.com')).toBeNull()
    expect(siteSubdomainOf('notcrephore.com', 'https://crephore.com')).toBeNull()
  })
})
