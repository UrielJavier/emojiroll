# Emojiroll

[![Deploy to GitHub Pages](https://github.com/UrielJavier/emojiroll/actions/workflows/deploy.yml/badge.svg)](https://github.com/UrielJavier/emojiroll/actions/workflows/deploy.yml)

**▶ Live demo: [urieljavier.github.io/emojiroll](https://urieljavier.github.io/emojiroll/)**

Animated emoji maker for Slack. Produces a 128×128 GIF from one or more independent text layers — each with its own font, colour, motion and angle — for marquee, parallax and diagonal effects, plus contrast and file-size checks against Slack's plan limits (128 KB free / 1 MB paid).

Built with **Vite + React + TypeScript**. The GIF is encoded entirely in the browser (no server) using [`gifenc`](https://github.com/mattdesl/gifenc).

## Development

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check (tsc -b) + production build into dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

Requires Node 20+.

## Features

- **Multiple text layers**: stack several words, each with its own text, font, size, tracking, colour and styles. Manage them in the Layers panel (add, delete, reorder by drag-and-drop or ↑↓ buttons, pick the active one). The active layer is edited in a tabbed card (Texto / Movimiento / Color).
- **Marquee + parallax**: per-layer direction (left/right/static) and relative speed (1×–6×). Layers moving at different speeds create parallax, and every layer completes whole cycles within one master loop so the GIF stays seamless.
- **Diagonal**: per-layer rotation angle (−45°…45°).
- **Vertical position**: per-layer offset to stack words.
- **Fonts** with hover-to-preview.
- **Colour**: solid, gradient (with stops and direction), or transparent — for both the (global) background and each layer's text; quick swatches and a background↔layer swap.
- **Styles**: per-layer shadow (color, distance, direction) and outline (color, width).
- **WCAG contrast meter** (active layer vs background) and a **file-size meter** against the selected plan limit.
- **Slack message preview** (light/dark theme).
- **Presets**: save the whole composition, apply it, export/import as JSON.
- **Auto-save & reset**: work-in-progress state and presets persist to `localStorage` across reloads; a **Reiniciar** button starts a fresh composition.

## Project structure

```
src/
  lib/         # pure engine (no React)
    draw.ts        # per-layer canvas rendering (parallax offset + rotation)
    encode.ts      # GIF generation (palette, frames, transparency)
    color.ts       # luminance, WCAG contrast, name sanitizing
    constants.ts   # fonts, swatches, gradient presets, storage keys
    types.ts       # EmojiState + TextLayer types
    gifenc.d.ts    # ambient types for the gifenc npm package
  state/
    reducer.ts     # useReducer (layers, active layer, reorder, swap, preset, reset)
    persist.ts     # load/save state to localStorage
  hooks/
    useAnimationLoop.ts  # requestAnimationFrame preview loop (master-loop phase)
    useFonts.ts          # webfont loading (FontFace API)
    usePresets.ts        # presets in localStorage
  components/    # Layers panel, tabbed LayerEditor, panels + reusable controls
  App.tsx        # layout and central state
```

## Deployment

Deployed to GitHub Pages via the [`deploy.yml`](.github/workflows/deploy.yml) workflow on every push to `main` (least-privilege permissions, build + deploy jobs). Vite's `base` is set to `/emojiroll/` to match the Pages subpath.

## Using it in Slack

1. Tweak the text and style in the controls on the left.
2. Click **Crear GIF** and check the size fits your plan.
3. **Download** the GIF and upload it in Slack via *Preferences → Customize → Add emoji*.
