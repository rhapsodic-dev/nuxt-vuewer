export interface VuewerProps {
  images: string[]
  defaultIndex?: number
}

export interface VuewerEmits {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  close: [void]
  select: [index: number]
}
