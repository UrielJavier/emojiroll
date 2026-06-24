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

export interface EmojiState {
  text: string
  font: FontKey
  /** preview-only font override while hovering the font picker; encoding ignores it */
  previewFont: FontKey | null
  size: number
  track: number
  mode: Mode
  secPerLoop: number
  fps: number
  padding: number
  gap: number
  bg: string
  fg: string
  transparent: boolean
  bold: boolean
  bgType: BgType
  bgGradAngle: number
  bgGradStops: GradStop[]
  fillType: FillType
  gradAngle: number
  gradStops: GradStop[]
  shadow: boolean
  shadowColor: string
  shadowDist: number
  shadowAngle: number
  stroke: boolean
  strokeColor: string
  strokeWidth: number
  planLimit: number
  emojiName: string
}

/** The subset of state that a saved preset captures (everything style-related). */
export type StylePreset = Omit<
  EmojiState,
  'text' | 'previewFont' | 'transparent' | 'planLimit' | 'emojiName'
>

export interface GifResult {
  bytes: number
  frames: number
  url: string
}
