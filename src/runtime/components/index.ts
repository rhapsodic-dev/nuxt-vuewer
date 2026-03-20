export interface VuewerImageObject {
  url: string
  thumbUrl?: string
}

export type VuewerImage = string | VuewerImageObject

export interface VuewerProps {
  images: VuewerImage[]
  defaultIndex?: number
}

export interface VuewerEmits {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  close: [void]
  select: [index: number]
}
