import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface UseVuewerZoomOptions {
  zoomableElementRef: Ref<HTMLElement | null>
  initialScale?: number
  minScale?: number
  maxScale?: number
  /**
   * Listener options for touch/gesture events used by zoom handling.
   * Keep `passive: false` so handlers can call `event.preventDefault()`
   * and stop native page scroll/zoom during pinch interactions.
   */
  touchListenerOptions?: AddEventListenerOptions
}

function getDefaultInitialScale(): number {
  return 1
}

function getDefaultMinScale(): number {
  return 0.3
}

function getDefaultMaxScale(): number {
  return 10
}

function getDefaultTouchListenerOptions(): AddEventListenerOptions {
  // Required for `preventDefault()` inside touch/gesture handlers.
  return { passive: false }
}

export function useVuewerZoom({
  zoomableElementRef,
  initialScale = getDefaultInitialScale(),
  minScale = getDefaultMinScale(),
  maxScale = getDefaultMaxScale(),
  touchListenerOptions = getDefaultTouchListenerOptions(),
}: UseVuewerZoomOptions) {
  const imageScale = ref(initialScale)
  const pinchStartDistance = ref<number | null>(null)
  const pinchStartScale = ref(initialScale)

  function handleScale(delta: number) {
    // Apply wheel delta as a relative change, so zoom speed feels consistent
    // across small and large scale values.
    setScale(imageScale.value * Math.exp(delta))
  }

  function setScale(scale: number): void {
    const clampedScale = clampScale(scale)
    imageScale.value = Math.round(clampedScale * 100) / 100
  }

  function clampScale(scale: number): number {
    return clamp(scale, minScale, maxScale)
  }

  function clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min
    }

    if (value > max) {
      return max
    }

    return value
  }

  function resetScale(): void {
    imageScale.value = initialScale
  }

  function getTouchDistance(touches: TouchList): number {
    if (touches.length < 2) return 0

    const firstTouch = touches.item(0)
    const secondTouch = touches.item(1)

    if (!firstTouch || !secondTouch) return 0

    const horizontalDistance = secondTouch.clientX - firstTouch.clientX
    const verticalDistance = secondTouch.clientY - firstTouch.clientY

    // Euclidean distance between two touch points (used as the pinch span).
    return Math.hypot(horizontalDistance, verticalDistance)
  }

  function onTouchStart(event: TouchEvent): void {
    if (event.touches.length < 2) return

    event.preventDefault()

    const distance = getTouchDistance(event.touches)
    if (!distance) return

    pinchStartDistance.value = distance
    pinchStartScale.value = imageScale.value
  }

  function onTouchMove(event: TouchEvent): void {
    if (event.touches.length < 2 || pinchStartDistance.value === null) return

    event.preventDefault()

    const distance = getTouchDistance(event.touches)
    if (!distance) return

    const scaleFactor = distance / pinchStartDistance.value
    setScale(pinchStartScale.value * scaleFactor)
  }

  function onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      pinchStartDistance.value = null
      pinchStartScale.value = imageScale.value
    }
  }

  function onTouchCancel(): void {
    pinchStartDistance.value = null
    pinchStartScale.value = imageScale.value
  }

  // `gesture*` events are a non-standard WebKit API (mainly Safari on iOS/iPadOS,
  // and Safari on macOS with trackpad gestures). We prevent the browser's default
  // page zoom so pinch interactions stay controlled by this viewer. Chromium/Firefox
  // browsers usually do not fire these events, so these listeners are effectively ignored there.
  function onGesture(event: Event): void {
    event.preventDefault()
  }

  function mountZoomListeners(): void {
    const zoomableElement = zoomableElementRef.value

    if (zoomableElement) {
      zoomableElement.addEventListener('touchstart', onTouchStart, touchListenerOptions)
      zoomableElement.addEventListener('touchmove', onTouchMove, touchListenerOptions)
      zoomableElement.addEventListener('touchend', onTouchEnd, touchListenerOptions)
      zoomableElement.addEventListener('touchcancel', onTouchCancel, touchListenerOptions)
    }

    document.addEventListener('gesturestart', onGesture, touchListenerOptions)
    document.addEventListener('gesturechange', onGesture, touchListenerOptions)
    document.addEventListener('gestureend', onGesture, touchListenerOptions)
  }

  function unmountZoomListeners(): void {
    const zoomableElement = zoomableElementRef.value

    if (zoomableElement) {
      zoomableElement.removeEventListener('touchstart', onTouchStart, touchListenerOptions)
      zoomableElement.removeEventListener('touchmove', onTouchMove, touchListenerOptions)
      zoomableElement.removeEventListener('touchend', onTouchEnd, touchListenerOptions)
      zoomableElement.removeEventListener('touchcancel', onTouchCancel, touchListenerOptions)
    }

    document.removeEventListener('gesturestart', onGesture, touchListenerOptions)
    document.removeEventListener('gesturechange', onGesture, touchListenerOptions)
    document.removeEventListener('gestureend', onGesture, touchListenerOptions)
  }

  onMounted(() => {
    mountZoomListeners()
  })

  onBeforeUnmount(() => {
    unmountZoomListeners()
  })

  return {
    imageScale,
    handleScale,
    resetScale,
  }
}
