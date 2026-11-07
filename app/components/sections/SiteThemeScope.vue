<script setup lang="ts">
import type { IntroContent } from '~/features/site-motion/scenes/scene.kit'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import PageIntroScene from '~/features/site-motion/PageIntroScene.vue'
import { intensityScale, introDuration, motionVars, prefersReducedMotion, REDUCED_INTRO_MS } from '~/features/site-motion/presets'
import { lockScroll } from '~/features/site-motion/scroll-lock'
import { normalizeSiteMotion, sceneKindOf } from '~/features/site-motion/site-motion.type'
import { useSiteTheme } from '~/site-theme/useSiteTheme'

// Applies an event's site theme to everything inside it. Wrap sections in this,
// never set `--site-*` variables on :root (the Crephore app has its own theme).
// It is also the size container sections respond to (`@2xl:` etc.), so a narrow preview
// shows the mobile layout even on a wide screen.
//
// It also plays the site's intro animation (theme.motion, features/site-motion): on load (`introOnLoad`, the public
// site) or each time `introKey` changes (the editor's "Play intro", inside the preview); never in a `still` scope
// (thumbnails). With reduced motion it's a short fade. Every intro is a scene (PageIntroScene) showing `introContent`,
// what the website says (`introContentFor`).
const props = withDefaults(defineProps<{
  theme: SiteTheme
  still?: boolean
  introOnLoad?: boolean
  introKey?: number
  // What the intros show (introContentFor): the event's name, date and venue, the program's numbers…
  introContent?: IntroContent
  // The screen's height for sections that fill it (the hero, `--site-screen-height`): the visible screen (`svh`, so a
  // phone's browser bars don't push its bottom off) on the site and in previews, a fixed one in thumbnails
  screenHeight?: string
}>(), {
  introKey: 0,
  screenHeight: '100svh',
  introContent: () => ({ title: '', initials: '', firstName: '', programTitles: [], stats: [], kind: 'any' }),
})

const themeVars = useSiteTheme(() => props.theme)
const motion = computed(() => normalizeSiteMotion(props.theme.motion))
const motionStyle = computed(() => motionVars(motion.value))

// Known on the client only
const reducedMotion = import.meta.client && prefersReducedMotion()
const introPlaying = ref(!props.still && props.introOnLoad && motion.value.intro !== 'none')
const introContained = ref(false)
const introLength = computed(() => (reducedMotion ? REDUCED_INTRO_MS : introDuration(motion.value.intro, motion.value.intensity)))
// The intro's kind of event, for loading its script; undefined for no intro
const sceneKind = computed(() => sceneKindOf(motion.value.intro))

const root = useTemplateRef<HTMLElement>('root')
const page = useTemplateRef<HTMLElement>('page')

// On the event's website, the page doesn't scroll while the intro covers it; the scrollbar's space stays, so the page
// doesn't shift sideways when it comes back. Never in the editor or playground ("Play intro", contained): they keep
// scrolling.
let unlockScroll: (() => void) | undefined
watch(introPlaying, (playing) => {
  unlockScroll?.()
  unlockScroll = undefined
  if (!playing || introContained.value || !import.meta.client)
    return
  unlockScroll = lockScroll(document.documentElement)
}, { immediate: true, flush: 'post' })
onBeforeUnmount(() => unlockScroll?.())

// The editor's "Play intro": in the preview, from its top
watch(() => props.introKey, (key) => {
  if (!key || props.still || motion.value.intro === 'none')
    return
  introPlaying.value = false
  nextTick(() => {
    introContained.value = true
    introPlaying.value = true
    root.value?.scrollIntoView?.({ block: 'start' })
  })
})
</script>

<template>
  <div
    ref="root"
    class="crephore-site @container relative bg-(--site-bg) font-(family-name:--site-font-body) text-(--site-text) antialiased"
    :style="[themeVars, motionStyle, { '--site-screen-height': screenHeight }]"
  >
    <PageIntroScene
      v-if="introPlaying && sceneKind"
      :intro="motion.intro as never"
      :kind="sceneKind"
      :duration="introLength"
      :scale="intensityScale[motion.intensity]"
      :content="introContent"
      :page="page"
      :contained="introContained"
      @done="introPlaying = false"
    />
    <div ref="page" data-site-page>
      <slot />
    </div>
  </div>
</template>
