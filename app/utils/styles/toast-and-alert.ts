import type { Component } from 'vue'
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from '@lucide/vue'

export type CustomToastType = 'info' | 'success' | 'warning' | 'error'

// Shared by toasts (lib/cToast.ts) and alerts.
// Dark backgrounds are opaque (-950): toasts float over content, so a translucent tint would let the page show through.
export const toastAndAlertStyles: Record<CustomToastType, { container: string, icon: Component }> = {
  info: {
    container: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-50',
    icon: InfoIcon,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50',
    icon: TriangleAlertIcon,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
    icon: OctagonXIcon,
  },
  success: {
    container: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
    icon: CircleCheckIcon,
  },
}
