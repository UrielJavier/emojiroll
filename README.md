# Emojiroll

Creador de emojis animados para Slack. Genera un GIF de 128×128 con texto en marquesina (scroll horizontal o fijo), tipografías, colores sólidos o degradados, sombra, contorno y comprobación de contraste y peso según el plan de Slack (128 KB gratis / 1 MB de pago).

Hecho con **Vite + React + TypeScript**. La codificación del GIF corre en el navegador (sin servidor) usando [`gifenc`](https://github.com/mattdesl/gifenc).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # type-check (tsc -b) + build de producción en dist/
npm run preview  # sirve el build de producción
npm run lint     # oxlint
```

Requiere Node 20+.

## Funcionalidades

- **Texto en marquesina**: izquierda, derecha o fijo, con velocidad, separación entre repeticiones y nivel de suavidad (frames) configurables.
- **Tipografías** con previsualización al pasar el ratón.
- **Color**: fondo y texto sólidos, degradados (con paradas y dirección) o transparentes; swatches rápidos e intercambio fondo↔texto.
- **Estilos**: sombra (color, distancia, dirección) y contorno (color, grosor).
- **Medidor de contraste** WCAG y **medidor de peso** contra el límite del plan.
- **Vista previa en mensaje** de Slack (tema claro/oscuro).
- **Presets**: guarda estilos con nombre, aplícalos, expórtalos/impórtalos como JSON.
- **Auto-guardado**: el trabajo en curso y los presets se conservan en `localStorage` al recargar.

## Estructura

```
src/
  lib/         # motor puro (sin React)
    gifenc.js      # codificador GIF (+ gifenc.d.ts con los tipos)
    draw.ts        # render de la escena en canvas
    encode.ts      # generación del GIF (paleta, frames, transparencia)
    color.ts       # luminancia, contraste WCAG, sanitizado de nombres
    constants.ts   # fuentes, swatches, presets de degradado, claves de storage
    types.ts       # tipos del estado
  state/
    reducer.ts     # useReducer (patch / swap / applyPreset) + captura de presets
    persist.ts     # carga/guardado del estado en localStorage
  hooks/
    useAnimationLoop.ts  # bucle requestAnimationFrame de la vista previa
    useFonts.ts          # carga de webfonts (FontFace API)
    usePresets.ts        # presets en localStorage
  components/    # UI: paneles + controles reutilizables
  App.tsx        # layout y estado central
```

## Cómo usarlo en Slack

1. Ajusta el texto y el estilo en los controles de la izquierda.
2. Pulsa **Crear GIF** y comprueba que el peso entra en tu plan.
3. **Descargar GIF** y súbelo en Slack desde *Preferencias → Personalizar → Añadir emoji*.
