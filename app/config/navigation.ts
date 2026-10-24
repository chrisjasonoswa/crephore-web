import type { Component } from 'vue'
import { CalendarHeart, FlaskConical, LayoutDashboard, LayoutTemplate, PanelsTopLeft, Settings, Shapes, Users } from '@lucide/vue'

export type NavArea = 'user' | 'admin'

export interface NavItem {
  title: string
  to: string
  icon: Component
  children?: NavItem[] // shown as a sub-menu under the item
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

declare module '#app' {
  interface PageMeta {
    area?: NavArea
    wide?: boolean // use the full content width instead of the centred column
  }
}

// Root route, breadcrumb label and shell copy for each area.
export const areas: Record<NavArea, { label: string, root: string, switchLabel: string, searchPlaceholder: string }> = {
  user: { label: 'Dashboard', root: '/dashboard', switchLabel: 'Switch to admin', searchPlaceholder: 'Search dashboard' },
  admin: { label: 'Admin', root: '/admin', switchLabel: 'Switch to host dashboard', searchPlaceholder: 'Search admin' },
}

export const navigation: Record<NavArea, NavGroup[]> = {
  user: [
    {
      label: 'General',
      items: [
        { title: 'Home', to: '/dashboard', icon: LayoutDashboard },
        { title: 'My events', to: '/dashboard/events', icon: CalendarHeart },
      ],
    },
    {
      label: 'Account',
      items: [
        { title: 'Settings', to: '/dashboard/settings', icon: Settings },
      ],
    },
  ],
  admin: [
    {
      label: 'General',
      items: [
        { title: 'Overview', to: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Website builder',
      items: [
        {
          title: 'Section types',
          to: '/admin/section-types',
          icon: Shapes,
          children: [{ title: 'Playground', to: '/admin/section-types/playground', icon: FlaskConical }],
        },
        { title: 'Layouts', to: '/admin/layouts', icon: PanelsTopLeft },
        { title: 'Templates', to: '/admin/templates', icon: LayoutTemplate },
      ],
    },
    {
      label: 'People',
      items: [
        { title: 'Users', to: '/admin/users', icon: Users },
      ],
    },
  ],
}

/** Every item of an area, sub-menu items included. */
export function navItems(area: NavArea): NavItem[] {
  return navigation[area].flatMap(group => group.items.flatMap(item => [item, ...(item.children ?? [])]))
}
