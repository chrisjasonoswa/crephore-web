/**
 * The label of the current page's last breadcrumb, for routes whose last segment is an id
 * (e.g. the event's name instead of "12" on /dashboard/events/12). Cleared when the page unmounts.
 */
export function useBreadcrumbTitle(title?: MaybeRefOrGetter<string | null | undefined>) {
  const state = useState<string | null>('breadcrumb-title', () => null)

  if (title !== undefined) {
    watchEffect(() => (state.value = toValue(title) ?? null))
    onBeforeUnmount(() => (state.value = null))
  }

  return state
}
