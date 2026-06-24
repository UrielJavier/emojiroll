export type FontKey =
  | 'archivo'
  | 'bungee'
  | 'anton'
  | 'grotesk'
  | 'press'
  | 'pacifico'
  | 'system'
  | 'mono'

export type Mode = 'left' | 'right' | 'static'
export type BgType = 'solid' | 'gradient' | 'transparent'
export type FillType = 'solid' | 'gradient' | 'transparent'
export type Plan = 'free' | 'paid'

export interface GradStop {
  color: string
  pos: number
}

/** One independent line of text. Multiple layers stack to make parallax/diagonal scenes. */
export interface TextLayer {
  id: string
  text: string
  font: FontKey
  size: number
  track: number
  bold: boolean
  // motion
  mode: Mode
  /** cycles travelled per master loop (1..6) — different values create parallax */
  speed: number
  gap: number
  // placement
  /** diagonal rotation in degrees (0 = horizontal) */
  angle: number
  /** vertical offset from the canvas centre, in px */
  offsetY: number
  // fill
  fillType: FillType
  fg: string
  gradAngle: number
  gradStops: GradStop[]
  // styles
  shadow: boolean
  shadowColor: string
  shadowDist: number
  shadowAngle: number
  stroke: boolean
  strokeColor: string
  strokeWidth: number
}

export interface EmojiState {
  layers: TextLayer[]
  activeLayerId: string
  /** preview-only font override (hover) applied to the active layer; encoding ignores it */
  previewFont: FontKey | null
  // background (global)
  bg: string
  bgType: BgType
  bgGradAngle: number
  bgGradStops: GradStop[]
  transparent: boolean
  // global timing / output
  /** master loop duration in seconds; every layer loops seamlessly within it */
  secPerLoop: number
  fps: number
  padding: number
  planLimit: number
  emojiName: string
}

/** A saved preset captures the whole composition (layers + background + timing). */
export type StylePreset = Pick<
  EmojiState,
  'layers' | 'bg' | 'bgType' | 'bgGradAngle' | 'bgGradStops' | 'secPerLoop' | 'fps' | 'padding'
>

export interface GifResult {
  bytes: number
  frames: number
  url: string
}
