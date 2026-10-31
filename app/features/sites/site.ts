// Event websites live at <subdomain>.<host of the site base URL>: ana-and-marco.crephore.com in production,
// ana-and-marco.localhost:3000 in development (browsers send *.localhost to this machine).

export interface SiteAddress {
  // The host websites are subdomains of, e.g. "crephore.com" or "localhost:3000"
  domain: string
  // "ana-and-marco.crephore.com", for showing
  hostOf: (subdomain: string) => string
  // "https://ana-and-marco.crephore.com", for linking
  urlOf: (subdomain: string) => string
}

export function siteAddress(baseUrl: string): SiteAddress {
  const base = new URL(baseUrl)
  return {
    domain: base.host,
    hostOf: subdomain => `${subdomain}.${base.host}`,
    urlOf: subdomain => `${base.protocol}//${subdomain}.${base.host}`,
  }
}

// Subdomains that stay Crephore itself
const reservedSubdomains = ['www']

/** The event website a request's host is for (its subdomain), or null when it is Crephore itself. */
export function siteSubdomainOf(hostname: string, baseUrl: string): string | null {
  const base = new URL(baseUrl).hostname
  const host = hostname.toLowerCase()
  if (!host.endsWith(`.${base}`))
    return null

  const subdomain = host.slice(0, -(base.length + 1))
  // One label only (a.b.crephore.com is not an event website)
  if (!subdomain || subdomain.includes('.') || reservedSubdomains.includes(subdomain))
    return null
  return subdomain
}
