import { describe, expect, it } from 'vitest'
import { useWheelZoomTuning } from '../src/runtime/composables/wheel-zoom-tuning'

interface WheelEventInput {
  deltaY?: number
  deltaMode?: number
}

function createWheelEvent({
  deltaY = 0,
  deltaMode = 0,
}: WheelEventInput): WheelEvent {
  return {
    deltaY,
    deltaMode,
  } as WheelEvent
}

describe('useWheelZoomTuning', () => {
  it('returns false and does not call onScale for zero delta', () => {
    let scaleCalls = 0

    const { handleWheelZoom } = useWheelZoomTuning({
      onScale: () => {
        scaleCalls += 1
      },
    })

    expect(handleWheelZoom(createWheelEvent({ deltaY: 0 }))).toBe(false)
    expect(scaleCalls).toBe(0)
  })

  it('normalizes line-mode deltas before applying scale factor', () => {
    const deltas: number[] = []

    const { handleWheelZoom } = useWheelZoomTuning({
      onScale: delta => deltas.push(delta),
      wheelScaleFactor: 0.01,
      wheelMaxStep: 1,
    })

    expect(handleWheelZoom(createWheelEvent({
      deltaY: 3,
      deltaMode: 1,
    }))).toBe(true)

    expect(deltas).toHaveLength(1)
    expect(deltas[0]).toBeCloseTo(-0.48, 8)
  })

  it('uses wheel direction to produce zoom in/out deltas', () => {
    const deltas: number[] = []

    const { handleWheelZoom } = useWheelZoomTuning({
      onScale: delta => deltas.push(delta),
      wheelScaleFactor: 0.01,
      wheelMaxStep: 1,
    })

    expect(handleWheelZoom(createWheelEvent({ deltaY: -10 }))).toBe(true)
    expect(handleWheelZoom(createWheelEvent({ deltaY: 10 }))).toBe(true)

    expect(deltas).toHaveLength(2)
    expect(deltas[0]).toBeCloseTo(0.1, 8)
    expect(deltas[1]).toBeCloseTo(-0.1, 8)
  })

  it('clamps extreme deltas to wheelMaxStep', () => {
    const deltas: number[] = []

    const { handleWheelZoom } = useWheelZoomTuning({
      onScale: delta => deltas.push(delta),
      wheelScaleFactor: 0.01,
      wheelMaxStep: 0.2,
    })

    expect(handleWheelZoom(createWheelEvent({ deltaY: 1_000 }))).toBe(true)
    expect(handleWheelZoom(createWheelEvent({ deltaY: -1_000 }))).toBe(true)

    expect(deltas).toHaveLength(2)
    expect(deltas[0]).toBeCloseTo(-0.2, 8)
    expect(deltas[1]).toBeCloseTo(0.2, 8)
  })
})
