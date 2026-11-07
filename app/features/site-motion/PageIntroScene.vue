<script setup lang="ts">
import type { IntroContent } from './scenes/scene.kit'
import type { SceneIntroKey, SceneKind } from './site-motion.type'
import { prefersReducedMotion, REDUCED_INTRO_MS } from './presets'
import { loadScene, sceneCovers } from './scenes'
import { createSceneKit } from './scenes/scene.kit'
import { backgroundColours } from '~/features/sections/section.background'

// A scene intro (scenes/): its first frame is in the server-rendered page (`sceneCovers`); once mounted, the scene's
// script loads and plays in the layer above the page, then `done` is emitted. A tap or a key skips it, and a scene that
// stalls is ended after its length plus a margin. With reduced motion, or without the Web Animations API, the cover just
// fades. `scale`: the intensity; `page`: the site's page, which the scene brings in as it leaves.
const props = defineProps<{
  intro: SceneIntroKey
  kind: SceneKind
  // ms at this intensity (for the fallback timers)
  duration: number
  scale: number
  content: IntroContent
  page?: HTMLElement | null
  contained?: boolean
}>()

const emit = defineEmits<{ done: [] }>()

// The hero's background and heading colours, for scenes (and first frames) that match the hero
const heroColours = computed(() => {
  const colours = backgroundColours[props.content.heroBackground ?? 'primary']
  return { '--hero-bg': colours.background, '--hero-heading': colours.heading }
})

const root = useTemplateRef<HTMLElement>('root')
const cover = useTemplateRef<HTMLElement>('cover')
const layer = useTemplateRef<HTMLElement>('layer')

let finished = false
let stopScene: (() => void) | undefined
let safety: ReturnType<typeof setTimeout> | undefined

function finish() {
  if (finished)
    return
  finished = true
  clearTimeout(safety)
  stopScene?.()
  window.removeEventListener('keydown', finish)
  emit('done')
}

async function play() {
  const canAnimate = typeof Element.prototype.animate === 'function'
  if (prefersReducedMotion() || !canAnimate) {
    cover.value?.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: REDUCED_INTRO_MS, fill: 'forwards' })
    safety = setTimeout(finish, canAnimate ? REDUCED_INTRO_MS : 0)
    return
  }
  const scene = await loadScene(props.kind, props.intro).catch(() => undefined)
  if (finished)
    return
  if (!scene || !layer.value)
    return finish()

  const ctx = { layer: layer.value, content: props.content, page: props.page ?? null, scale: props.scale }
  const kit = createSceneKit(ctx)
  stopScene = kit.stop
  const playing = scene(ctx, kit)
  // The scene has drawn its first frame (synchronously, before its first await): the static cover can go
  cover.value?.remove()
  playing.catch(() => {}).finally(finish)
}

onMounted(() => {
  // The script runs the intro from here: the CSS timer that ends it without script would cut a slow scene short
  root.value?.style.setProperty('animation', 'none')
  safety = setTimeout(finish, props.duration + 2000)
  window.addEventListener('keydown', finish)
  play()
})
onBeforeUnmount(() => {
  finished = true
  clearTimeout(safety)
  stopScene?.()
  window.removeEventListener('keydown', finish)
})
</script>

<template>
  <div
    ref="root"
    class="motion-intro intro-scene"
    data-page-intro
    :data-intro="intro"
    :data-contained="contained || undefined"
    :style="heroColours"
    aria-hidden="true"
    @click="finish"
  >
    <div ref="cover" class="intro-scene-cover" :style="{ background: sceneCovers[intro] }" />
    <div ref="layer" class="intro-scene-layer" />
  </div>
</template>
