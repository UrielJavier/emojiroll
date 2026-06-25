export type FontKey =
  | 'archivo'
  | 'bungee'
  | 'anton'
  | 'grotesk'
  | 'press'
  | 'pacifico'
  | 'system'
  | 'mono'

// Enum-like const objects (erasableSyntaxOnly forbids TS `enum`): use `Mode.Static`
// etc. instead of bare string literals.
export const Mode = { Left: 'left', Right: 'right', Static: 'static' } as const
export type Mode = (typeof Mode)[keyof typeof Mode]

/** Fill kind, shared by the background and each layer's text. */
export const Fill = { Solid: 'solid', Gradient: 'gradient', Transparent: 'transparent' } as const
export type Fill = (typeof Fill)[keyof typeof Fill]
export type BgType = Fill
export type FillType = Fill

export const Plan = { Free: 'free', Paid: 'paid' } as const
export type Plan = (typeof Plan)[keyof typeof Plan]

/** Per-layer animated effect (periodic over the master loop, so the GIF stays seamless). */
export const Effect = { None: 'none', Blink: 'blink', Bob: 'bob', Pulse: 'pulse', Rainbow: 'rainbow' } as const
export type Effect = (typeof Effect)[keyof typeof Effect]

export interface GradStop {
  color: string
  pos: number
}

/** One independent line of text. Multiple layers stack to make parallax/diagonal scenes. */
export interface TextLayer {
  id: string
  text: string
  /** if set, the layer renders this image (data URL) instead of its text */
  image?: string
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
  /** animated effect applied on top of the motion */
  effect: Effect
  /** effect cycles per master loop (kept integer so the loop stays seamless) */
  effectSpeed: number
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
