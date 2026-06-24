# Emojiroll

[![Deploy to GitHub Pages](https://github.com/UrielJavier/emojiroll/actions/workflows/deploy.yml/badge.svg)](https://github.com/UrielJavier/emojiroll/actions/workflows/deploy.yml)

**▶ Live demo: [urieljavier.github.io/emojiroll](https://urieljavier.github.io/emojiroll/)**

Animated emoji maker for Slack. Produces a 128×128 GIF with marquee text (scrolling left/right or static), custom fonts, solid/gradient/transparent colors, shadow and outline, plus contrast and file-size checks against Slack's plan limits (128 KB free / 1 MB paid).

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

- **Marquee text**: scroll left, right, or static — with configurable speed, gap between repeats, and smoothness (frame count).
- **Fonts** with hover-to-preview.
- **Color**: solid, gradient (with stops and direction), or transparent for both background and text; quick swatches and a background↔text swap.
- **Styles**: shadow (color, distance, direction) and outline (color, width).
- **WCAG contrast meter** and a **file-size meter** against the selected plan limit.
- **Slack message preview** (light/dark theme).
- **Presets**: save named styles, apply them, export/import as JSON.
- **Auto-save**: work-in-progress state and presets persist to `localStorage` across reloads.

## Project structure

```
src/
  lib/         # pure engine (no React)
    gifenc.js      # GIF encoder (+ gifenc.d.ts for types)
    draw.ts        # canvas scene rendering
    encode.ts      # GIF generation (palette, frames, transparency)
    color.ts       # luminance, WCAG contrast, name sanitizing
    constants.ts   # fonts, swatches, gradient presets, storage keys
    types.ts       # state types
  state/
    reducer.ts     # useReducer (patch / swap / applyPreset) + preset capture
    persist.ts     # load/save state to localStorage
  hooks/
    useAnimationLoop.ts  # requestAnimationFrame preview loop
    useFonts.ts          # webfont loading (FontFace API)
    usePresets.ts        # presets in localStorage
  components/    # UI: panels + reusable controls
  App.tsx        # layout and central state
```

## Deployment

Deployed to GitHub Pages via the [`deploy.yml`](.github/workflows/deploy.yml) workflow on every push to `main` (least-privilege permissions, build + deploy jobs). Vite's `base` is set to `/emojiroll/` to match the Pages subpath.

## Using it in Slack

1. Tweak the text and style in the controls on the left.
2. Click **Crear GIF** and check the size fits your plan.
3. **Download** the GIF and upload it in Slack via *Preferences → Customize → Add emoji*.
