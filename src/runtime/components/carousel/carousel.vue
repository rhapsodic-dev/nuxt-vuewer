<template>
  <div
    ref="carouselContainer"
    class="vuewer-carousel"
    :style="carouselStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  activeItemId: number | undefined
}

const props = defineProps<Props>()

const carouselContainer = useTemplateRef<HTMLDivElement>('carouselContainer')
const internalActiveIndex = ref<number | undefined>()

function calculateTranslateX(): number {
  if (!carouselContainer.value || internalActiveIndex.value === undefined) {
    return 0
  }

  const containerWidth = carouselContainer.value.offsetWidth
  const items = [...carouselContainer.value.children]

  if (items.length === 0 || internalActiveIndex.value >= items.length) {
    return 0
  }

  const activeItemElement = items[internalActiveIndex.value] as HTMLElement
  if (!activeItemElement) {
    return 0
  }

  const activeItemRect = activeItemElement.getBoundingClientRect()
  const activeItemHalfWidth = activeItemRect.width / 2

  const activeItemCenterRelativeToContainer = activeItemElement.offsetLeft + activeItemHalfWidth

  return (containerWidth / 2) - activeItemCenterRelativeToContainer
}

const carouselStyle = computed(() => {
  return {
    transform: `translateX(${calculateTranslateX()}px)`,
  }
})

function centerCurrentlyActiveItem(): void {
  if (carouselContainer.value && props.activeItemId !== undefined) {
    const items = [...carouselContainer.value.children]
    const foundIndex = items.findIndex((item) => {
      const htmlElement = item as HTMLElement
      const state = htmlElement.dataset.carouselItemActive
      return state === 'true'
    })

    if (foundIndex !== -1) {
      internalActiveIndex.value = foundIndex
    }
    else if (items.length > 0) {
      internalActiveIndex.value = 0
    }
    else {
      internalActiveIndex.value = undefined
    }
  }
  else {
    internalActiveIndex.value = undefined
  }
}

watch(() => props.activeItemId, () => {
  nextTick(() => {
    centerCurrentlyActiveItem()
  })
}, { immediate: true })

defineExpose({
  centerCurrentlyActiveItem,
})

onMounted(() => {
  nextTick(() => {
    centerCurrentlyActiveItem()
  })
  window.addEventListener('resize', centerCurrentlyActiveItem)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', centerCurrentlyActiveItem)
})
</script>

<style scoped lang="scss">
.vuewer-carousel {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 90px;
  white-space: nowrap;
  transition-duration: .2s;
  transition-timing-function: ease-in-out;
  transition-property: transform;
}
</style>
