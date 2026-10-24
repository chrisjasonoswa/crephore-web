import type { PropType } from 'vue'
import type { CustomToastType } from '~/utils/styles/toast-and-alert'
import { XIcon } from '@lucide/vue'
import { toast as sonnerToast } from 'vue-sonner'
import { defineComponent, h, markRaw } from 'vue'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'

export interface CustomToastOptions {
  title: string
  description?: string
  type?: CustomToastType
  button?: {
    label: string
    onClick: () => void
  }
}

type ToastCardProps = Required<Pick<CustomToastOptions, 'title' | 'type'>>
  & Pick<CustomToastOptions, 'description' | 'button'> & {
    onCloseToast?: () => void
  }

const ToastCard = defineComponent({
  props: {
    title: { type: String, required: true },
    description: { type: String, default: undefined },
    type: { type: String as () => CustomToastType, required: true },
    // Passed by vue-sonner to custom toast components
    onCloseToast: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    button: {
      type: Object as PropType<{ label: string, onClick: () => void }>,
      default: undefined,
    },
  },
  setup(props: ToastCardProps) {
    return () => {
      const styles = toastAndAlertStyles[props.type]

      return h(
        'div',
        { class: `w-full rounded-lg border p-4 shadow-lg md:max-w-105 ${styles.container}` },
        [
          h('div', { class: 'flex items-start gap-3' }, [
            h('div', { class: 'mt-0.5 shrink-0' }, [h(styles.icon, { class: 'size-4' })]),
            h('div', { class: 'flex-1' }, [
              h('p', { class: 'text-sm font-medium tracking-tight' }, props.title),
              props.description
                ? h('p', { class: 'mt-1 text-sm opacity-90' }, props.description)
                : null,
              props.button
                ? h(
                    'button',
                    {
                      class:
                        'mt-3 inline-flex rounded-md border border-current/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                      onClick: () => {
                        try {
                          props.button?.onClick()
                        }
                        finally {
                          props.onCloseToast?.()
                        }
                      },
                    },
                    props.button.label,
                  )
                : null,
            ]),
            h(
              'button',
              {
                'aria-label': 'Dismiss toast',
                'class': 'rounded p-1 opacity-70 transition-opacity hover:opacity-100',
                'onClick': () => props.onCloseToast?.(),
              },
              [h(XIcon, { class: 'size-4' })],
            ),
          ]),
        ],
      )
    }
  },
})

const TOAST_DEDUPE_WINDOW_MS = 1200
const toastDedupe = new Map<string, number>()
const rawToastCard = markRaw(ToastCard)

// Several failing requests can report the same error at once; show it only once.
function shouldSuppressDuplicate(type: CustomToastType, title: string, description?: string) {
  const key = `${type}|${title}|${description ?? ''}`
  const now = Date.now()
  const lastShown = toastDedupe.get(key)

  if (lastShown && now - lastShown < TOAST_DEDUPE_WINDOW_MS)
    return true

  toastDedupe.set(key, now)
  return false
}

export function cToast({ title, description, type = 'info', button }: CustomToastOptions) {
  // Keep this safe in SSR/Node contexts.
  if (typeof window === 'undefined')
    return null

  if (shouldSuppressDuplicate(type, title, description))
    return null

  return sonnerToast.custom(rawToastCard, {
    position: 'top-right',
    componentProps: { title, description, type, button },
  })
}
