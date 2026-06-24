export interface GIFEncoderInstance {
  writeFrame(index: Uint8Array, width: number, height: number, opts?: Record<string, unknown>): void
  finish(): void
  bytes(): Uint8Array
  bytesView(): Uint8Array
  reset(): void
}

export function GIFEncoder(opt?: Record<string, unknown>): GIFEncoderInstance
export function quantize(
  rgba: Uint8Array | Uint8ClampedArray,
  maxColors: number,
  opts?: Record<string, unknown>,
): number[][]
export function applyPalette(
  rgba: Uint8Array | Uint8ClampedArray,
  palette: number[][],
  format?: string,
): Uint8Array

declare const gifenc: {
  GIFEncoder: typeof GIFEncoder
  quantize: typeof quantize
  applyPalette: typeof applyPalette
}
export default gifenc
