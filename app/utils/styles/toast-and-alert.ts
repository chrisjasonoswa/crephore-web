import type { Component } from 'vue'
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from '@lucide/vue'

export type CustomToastType = 'info' | 'success' | 'warning' | 'error'

// Shared by toasts (lib/cToast.ts) and alerts.
// Dark mode mirrors light mode: a soft tint of the colour on the app's surface, a faint border in the colour, and the
// text in a light shade of it (light mode: pale tint, dark text). The tint is mixed into `--card` rather than a
// translucent colour: toasts float over content, so the page must not show through.
export const toastAndAlertStyles: Record<CustomToastType, { container: string, icon: Component }> = {
  info: {
    container: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/35 dark:bg-[color-mix(in_oklab,var(--color-sky-500)_16%,var(--card))] dark:text-sky-200',
    icon: InfoIcon,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-[color-mix(in_oklab,var(--color-amber-500)_16%,var(--card))] dark:text-amber-200',
    icon: TriangleAlertIcon,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/35 dark:bg-[color-mix(in_oklab,var(--color-red-500)_16%,var(--card))] dark:text-red-200',
    icon: OctagonXIcon,
  },
  success: {
    container: 'border-green-200 bg-green-50 text-green-900 dark:border-green-500/35 dark:bg-[color-mix(in_oklab,var(--color-green-500)_16%,var(--card))] dark:text-green-200',
    icon: CircleCheckIcon,
  },
}
