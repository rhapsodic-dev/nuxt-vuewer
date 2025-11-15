<template>
  <div
    v-bind="attrs"
    class="vuewer"
    :class="{ vuewer_hide_ui: idle }"
    @click.self="emit('close')"
  >
    <div class="vuewer__overlay" />
    <div
      class="vuewer__content"
      @click.self="emit('close')"
    >
      <img
        :src="currentImage?.url"
        alt=""
      >
    </div>

    <div class="vuewer__ui">
      <template v-if="images.length > 1">
        <VuewerNavigationButton
          side="left"
          @click="goToPrevImage"
        >
          <IconAngleLeft />
        </VuewerNavigationButton>
        <VuewerNavigationButton
          side="right"
          @click="goToNextImage"
        >
          <IconAngleRight />
        </VuewerNavigationButton>
      </template>

      <VuewerCloseButton @click="emit('close')" />
    </div>

    <div
      v-if="images.length > 1"
      class="vuewer__images"
    >
      <VuewerCarousel
        :active-item-id="currentImage?.id"
      >
        <template
          v-for="[key, image] in imagesMap"
          :key="key"
        >
          <VuewerCarouselItem
            :is-active="image.id === currentImage?.id"
            @click="setActiveImage(image.id)"
          >
            <img
              :src="image.url"
              alt=""
            >
          </VuewerCarouselItem>
        </template>
      </VuewerCarousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIdle } from '@vueuse/core'
import { computed, useAttrs, ref, watch, onMounted, onBeforeUnmount } from 'vue'

import VuewerNavigationButton from './navigation/button/button.vue'
import VuewerCloseButton from './close/button/button.vue'
import VuewerCarousel from './carousel/carousel.vue'
import VuewerCarouselItem from './carousel/item/item.vue'
import IconAngleLeft from './icons/angle-left.vue'
import IconAngleRight from './icons/angle-right.vue'

import type { VuewerProps, VuewerEmits } from '.'

interface ImageItem {
  id: number
  url: string
}

const props = withDefaults(defineProps<VuewerProps>(), {
  defaultIndex: 0,
})
const emit = defineEmits<VuewerEmits>()

const attrs = useAttrs()

const { idle } = useIdle(1500)

const imagesMap = computed<Map<number, ImageItem>>(() => {
  const newMap = new Map<number, ImageItem>()
  props.images.forEach((url, index) => {
    const imageId = index
    newMap.set(imageId, { id: imageId, url: url })
  })
  return newMap
})

const defaultImage = computed(() => {
  if (props.defaultIndex !== undefined) {
    return imagesMap.value.get(props.defaultIndex) ?? imagesMap.value.values().next().value
  }

  return imagesMap.value.values().next().value
})

const currentImage = ref<ImageItem>()
const imageScale = ref(1)

function setActiveImage(imageId: number) {
  const image = imagesMap.value.get(imageId)

  if (image) {
    resetScale()
    currentImage.value = image
    emit('select', imageId)
  }
  else {
    console.warn(`Image with ID ${imageId} not found.`)
  }
}

function goToNextImage(): void {
  if (!currentImage.value) return

  const currentId = currentImage.value.id
  const nextId = (currentId + 1) % imagesMap.value.size

  setActiveImage(nextId)
}

function goToPrevImage(): void {
  if (!currentImage.value) return

  const currentId = currentImage.value.id
  const prevId = (currentId - 1 + imagesMap.value.size) % imagesMap.value.size

  setActiveImage(prevId)
}

type ImageViewerKeyboardActions = 'esc' | 'escape' | 'arrowleft' | 'arrowright'

const imageViewerKeyboardActions: Record<ImageViewerKeyboardActions, () => void> = {
  esc: onEscape,
  escape: onEscape,
  arrowleft: () => onArrow('left'),
  arrowright: () => onArrow('right'),
}

function handleScale(delta: number) {
  const MIN_SCALE = 0.3
  const MAX_SCALE = 10

  let newScale = imageScale.value + delta

  if (newScale < MIN_SCALE) {
    newScale = MIN_SCALE
  }
  else if (newScale > MAX_SCALE) {
    newScale = MAX_SCALE
  }

  imageScale.value = Math.round(newScale * 100) / 100
}

function resetScale(): void {
  imageScale.value = 1
}

function onKeyDown(event: KeyboardEvent): void {
  const keyCode = event.key.toLowerCase() as ImageViewerKeyboardActions

  if (keyCode in imageViewerKeyboardActions) {
    const action = imageViewerKeyboardActions[keyCode]
    action()
  }
}

function onEscape() {
  emit('close')
}

function onArrow(direction: 'left' | 'right') {
  if (props.images.length <= 1) return
  if (direction === 'left') {
    goToPrevImage()
  }
  else {
    goToNextImage()
  }
}

type HandleScaleFn = (value: number) => void
type GoToNextImageFn = () => void
type GoToPrevImageFn = () => void

interface OnWheelConfig {
  onScale: HandleScaleFn
  onNextImage: GoToNextImageFn
  onPrevImage: GoToPrevImageFn
}

function createOnWheelHandler(config: OnWheelConfig) {
  const { onScale, onPrevImage, onNextImage } = config

  return function onWheel(event: WheelEvent): void {
    event.preventDefault()

    const { deltaY, ctrlKey } = event

    const SCROLL_UP = -1
    const SCROLL_DOWN = 1
    const SCALE_FACTOR = 0.35

    const scrollDirection = Math.sign(deltaY)

    if (ctrlKey) {
      const scaleAmount = scrollDirection === SCROLL_UP ? SCALE_FACTOR : -SCALE_FACTOR
      onScale(scaleAmount)
      return
    }

    if (scrollDirection === SCROLL_DOWN) {
      onNextImage()
    }
    else if (scrollDirection === SCROLL_UP) {
      onPrevImage()
    }
  }
}

const onWheelHandler = createOnWheelHandler({
  onScale: delta => handleScale(delta),
  onNextImage: () => goToNextImage(),
  onPrevImage: () => goToPrevImage(),
})

watch(imagesMap, (newMap) => {
  currentImage.value ??= defaultImage.value

  if (currentImage.value && !newMap.has(currentImage.value.id)) {
    currentImage.value = defaultImage.value
  }
}, { immediate: true })

onMounted(() => {
  globalThis.addEventListener('keydown', onKeyDown)
  globalThis.addEventListener('wheel', onWheelHandler, { passive: false })
})

onBeforeUnmount(() => {
  globalThis.removeEventListener('keydown', onKeyDown)
  globalThis.removeEventListener('wheel', onWheelHandler)
})
</script>

<style scoped lang="scss">
.vuewer {
  --vuewer__image-scale: v-bind(imageScale);
  --vuewer__ui_opacity: 1;

  position: fixed;
  inset: 0;
  z-index: 1000;
  user-select: none;

  & img {
    width: auto;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
  }

  &__overlay {
    position: absolute;
    z-index: -1;
    pointer-events: none;
    background: rgba(1, 0, 18, 0.35);
    inset: 0;
    backdrop-filter: blur(15px);
  }

  &__content {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    inset: 0;
    transform: scale(var(--vuewer__image-scale));
  }

  &__ui {
    position: fixed;
    z-index: 3;
    opacity: var(--vuewer__ui_opacity);
    transition: opacity .3s;
  }

  &__images {
    position: absolute;
    left: 50%;
    bottom: 25px;
    z-index: 2;
    opacity: var(--vuewer__ui_opacity);
    transition: opacity .3s;
    transform: translateX(-50%);
  }

  &__nav-button {
    position: absolute;
    top: 50%;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    padding: 15px;
    color: white;
    font-size: 2em;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    transition: background 0.2s ease;
    transform: translateY(-50%);

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    &--prev {
      left: 20px;
    }

    &--next {
      right: 20px;
    }
  }

  &_hide {
    &_ui {
      --vuewer__ui_opacity: 0;
    }
  }
}
</style>
