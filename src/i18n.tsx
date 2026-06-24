import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'es' | 'en'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

const LANG_KEY = 'emojirollLang_v1'

type Dict = Record<string, string>

// Spanish is the source language and must be complete. Missing keys in other
// languages fall back to Spanish, so partial translations are always safe.
const es: Dict = {
  // header / app
  'app.eyebrow': 'Emojis animados para Slack',
  'app.reset': '↺ Reiniciar',
  'app.resetConfirm':
    '¿Empezar una composición nueva? Se perderá el diseño actual. Tus presets guardados se conservan.',
  'lang.label': 'Idioma',

  // tabs
  'tabs.text': 'Texto',
  'tabs.motion': 'Movimiento',
  'tabs.color': 'Color',
  'editor.aria': 'Editar capa activa',

  // layers
  'layers.title': 'Capas',
  'layers.add': '+ Capa',
  'layers.empty': '(vacío)',
  'layers.move.up': 'Subir',
  'layers.move.down': 'Bajar',
  'layers.delete': 'Borrar capa',
  'layers.drag': 'Arrastra para reordenar',
  'layers.hint':
    'Arrastra para reordenar (o usa ↑↓). El orden es la profundidad: las de arriba se dibujan detrás. Cada capa tiene su velocidad y ángulo → parallax.',

  // text panel
  'text.layerText': 'Texto de la capa',
  'text.shortHint': 'Palabras cortas se leen mejor a tamaño emoji.',
  'text.font': 'Tipografía',
  'text.fontHint': 'pasa el ratón para previsualizar',
  'text.size': 'Tamaño de letra',
  'text.tracking': 'Espaciado entre letras',
  'text.angle': 'Ángulo (diagonal)',
  'text.offsetY': 'Posición vertical',
  'text.offsetYHint': 'Sube o baja esta capa para apilar varias palabras.',
  'text.bold': 'Negrita',
  'text.guide': 'Ver guía en la vista previa',

  // motion panel
  'motion.title': 'Movimiento de la capa',
  'motion.mode.left': '← Izquierda',
  'motion.mode.right': 'Derecha →',
  'motion.mode.static': 'Fijo',
  'motion.modeAria': 'Movimiento',
  'motion.speed': 'Velocidad relativa',
  'motion.speedHint': 'Capas con velocidades distintas crean el efecto parallax.',
  'motion.gap': 'Separación entre repeticiones',
  'motion.global': 'Bucle y salida (global)',
  'motion.loop': 'Duración del bucle',
  'motion.framesStatic': '1 frame (todo fijo)',
  'motion.smooth': 'Suavidad',
  'motion.margin': 'Margen',
  'motion.marginHint': 'Aire alrededor del texto. Si hace falta, la letra se reduce sola para no tocar el borde.',
  'smooth.label.12': 'Compacto',
  'smooth.label.18': 'Estándar',
  'smooth.label.25': 'Suave',
  'smooth.opt.12': 'Compacto — menos frames, menos peso',
  'smooth.opt.18': 'Estándar',
  'smooth.opt.25': 'Suave — más frames, más peso',

  // colors panel
  'color.bg': 'Fondo',
  'color.swapTitle': 'Intercambiar fondo y color de la capa activa',
  'color.bgTypeAria': 'Tipo de fondo',
  'color.fillTypeAria': 'Tipo de relleno',
  'color.type.solid': 'Sólido',
  'color.type.gradient': 'Degradado',
  'color.type.transparent': 'Transparente',
  'color.color': 'Color',
  'color.quickBg': 'Fondos rápidos',
  'color.bgTransparentHint':
    'Sin fondo. La legibilidad dependerá del tema (claro u oscuro) de quien lo vea — compruébalo con el conmutador del mensaje y el medidor de contraste.',
  'color.layerText': 'Texto de la capa',
  'color.textTransparentHint':
    'Texto calado: se ve a través de las letras (efecto recorte). Necesita un fondo sólido o degradado para notarse.',
  'color.styles': 'Estilos',
  'color.shadow': 'Sombra',
  'color.stroke': 'Contorno',
  'color.shadowColor': 'Color de sombra',
  'color.distance': 'Distancia',
  'color.direction': 'Dirección',
  'color.shadowDirAria': 'Dirección de la sombra',
  'color.strokeColor': 'Color de contorno',
  'color.thickness': 'Grosor',
  'color.bgGradDirAria': 'Dirección del degradado de fondo',
  'color.textGradDirAria': 'Dirección del degradado',

  // gradient editor
  'grad.addStop': '+ Añadir parada',
  'grad.removeStop': 'Quitar parada',
  'grad.rainbow': 'Arcoíris',
  'grad.sunset': 'Atardecer',
  'grad.ocean': 'Océano',
  'grad.gold': 'Oro',

  // direction pad
  'dir.tl': 'arriba-izquierda',
  'dir.t': 'arriba',
  'dir.tr': 'arriba-derecha',
  'dir.l': 'izquierda',
  'dir.r': 'derecha',
  'dir.bl': 'abajo-izquierda',
  'dir.b': 'abajo',
  'dir.br': 'abajo-derecha',

  // fonts
  'font.aria': 'Tipografía',
  'font.archivo': 'Archivo Black — gruesa',
  'font.bungee': 'Bungee — bloque',
  'font.anton': 'Anton — condensada alta',
  'font.grotesk': 'Space Grotesk — limpia',
  'font.press': 'Press Start 2P — píxel',
  'font.pacifico': 'Pacifico — script',
  'font.system': 'Sistema — sans',
  'font.mono': 'Monoespaciada',

  // preview
  'preview.title': 'Vista previa',
  'preview.pause': '❚❚ Pausa',
  'preview.play': '▶ Reproducir',
  'preview.realSize': 'tamaño real · 128×128',
  'preview.inMessage': 'Así se ve en un mensaje',
  'preview.themeAria': 'Tema de Slack',
  'preview.light': 'Claro',
  'preview.dark': 'Oscuro',
  'preview.you': 'tú',
  'preview.demo': '¡buen trabajo equipo {emoji} a por la siguiente!',
  'preview.name': 'Nombre del emoji',
  'preview.namePlaceholder': 'mi-emoji',
  'preview.nameHint': 'Se usa como nombre del archivo. Al subirlo, Slack lo propone como nombre del emoji por defecto.',
  'preview.plan': 'Plan de Slack',
  'preview.max': 'máx.',
  'preview.planAria': 'Plan de Slack',
  'plan.free': 'Gratis · máx 128 KB',
  'plan.paid': 'De pago · máx 1 MB',
  'preview.build': 'Crear GIF',
  'preview.building': 'Creando…',
  'preview.errEmpty': 'Escribe algún texto primero.',
  'preview.errBuild': 'Error al generar el GIF: ',
  'result.title': 'GIF generado',
  'result.loop': 'tamaño real, en bucle',
  'result.dims': 'Dimensiones',
  'result.frames': 'Frames',
  'result.frameOne': 'frame',
  'result.frameMany': 'frames',
  'result.weight': 'Peso',
  'result.over': 'Pasa de',
  'result.ok': '✓ Listo para Slack',
  'result.tip':
    'No cabe en este plan. Prueba: bajar la suavidad a “Compacto”, acortar el texto, una vuelta más rápida (menos frames) o quitar el fondo transparente.',
  'result.download': 'Descargar GIF',

  // presets
  'presets.title': 'Mis presets',
  'presets.namePlaceholder': 'Nombre del estilo',
  'presets.save': 'Guardar estilo',
  'presets.persistYes': 'Se guardan en este navegador y siguen disponibles al recargar.',
  'presets.persistNo':
    'Se guardan solo durante esta sesión (este entorno no permite almacenamiento permanente).',
  'presets.empty': 'Aún no has guardado ningún estilo.',
  'presets.apply': 'Aplicar',
  'presets.delete': 'Borrar',
  'presets.export': '↓ Exportar',
  'presets.import': '↑ Importar',
  'presets.imported': 'Importados',
  'presets.styleOne': 'estilo',
  'presets.styleMany': 'estilos',
  'presets.importError': 'No se pudo leer el archivo: no es un JSON de presets válido.',

  // contrast
  'contrast.title': 'Contraste texto / fondo',
  'contrast.ok': 'Buen contraste, se lee bien a tamaño emoji.',
  'contrast.mid': 'Aceptable para texto grande; a tamaño emoji puede quedar justo.',
  'contrast.low': 'Contraste bajo: costará leerse en pequeño.',
  'contrast.bad': 'Contraste muy bajo: casi ilegible. Cambia un color.',
  'contrast.both': 'Texto y fondo transparentes: el emoji quedaría invisible. Pon un fondo sólido o degradado.',
  'contrast.knockout': 'Texto calado (se ve el chat).',
  'contrast.transparent': 'Transparente: depende del tema.',
  'contrast.light': 'Claro',
  'contrast.dark': 'Oscuro',
  'contrast.bgGradient': 'Fondo degradado.',
  'contrast.textGradient': 'Texto degradado (peor parada).',
  'contrast.tryStroke': 'Prueba activar el contorno.',
}

const en: Dict = {
  'app.eyebrow': 'Animated emoji for Slack',
  'app.reset': '↺ Reset',
  'app.resetConfirm': 'Start a new composition? The current design will be lost. Your saved presets are kept.',
  'lang.label': 'Language',

  'tabs.text': 'Text',
  'tabs.motion': 'Motion',
  'tabs.color': 'Color',
  'editor.aria': 'Edit active layer',

  'layers.title': 'Layers',
  'layers.add': '+ Layer',
  'layers.empty': '(empty)',
  'layers.move.up': 'Move up',
  'layers.move.down': 'Move down',
  'layers.delete': 'Delete layer',
  'layers.drag': 'Drag to reorder',
  'layers.hint':
    'Drag to reorder (or use ↑↓). Order is depth: those on top are drawn behind. Each layer has its own speed and angle → parallax.',

  'text.layerText': 'Layer text',
  'text.shortHint': 'Short words read better at emoji size.',
  'text.font': 'Font',
  'text.fontHint': 'hover to preview',
  'text.size': 'Font size',
  'text.tracking': 'Letter spacing',
  'text.angle': 'Angle (diagonal)',
  'text.offsetY': 'Vertical position',
  'text.offsetYHint': 'Move this layer up or down to stack several words.',
  'text.bold': 'Bold',
  'text.guide': 'Show guide in the preview',

  'motion.title': 'Layer motion',
  'motion.mode.left': '← Left',
  'motion.mode.right': 'Right →',
  'motion.mode.static': 'Static',
  'motion.modeAria': 'Motion',
  'motion.speed': 'Relative speed',
  'motion.speedHint': 'Layers at different speeds create the parallax effect.',
  'motion.gap': 'Gap between repeats',
  'motion.global': 'Loop & output (global)',
  'motion.loop': 'Loop duration',
  'motion.framesStatic': '1 frame (all static)',
  'motion.smooth': 'Smoothness',
  'motion.margin': 'Margin',
  'motion.marginHint': 'Padding around the text. If needed, the type shrinks itself so it never touches the edge.',
  'smooth.label.12': 'Compact',
  'smooth.label.18': 'Standard',
  'smooth.label.25': 'Smooth',
  'smooth.opt.12': 'Compact — fewer frames, smaller',
  'smooth.opt.18': 'Standard',
  'smooth.opt.25': 'Smooth — more frames, larger',

  'color.bg': 'Background',
  'color.swapTitle': 'Swap background and active layer colour',
  'color.bgTypeAria': 'Background type',
  'color.fillTypeAria': 'Fill type',
  'color.type.solid': 'Solid',
  'color.type.gradient': 'Gradient',
  'color.type.transparent': 'Transparent',
  'color.color': 'Colour',
  'color.quickBg': 'Quick backgrounds',
  'color.bgTransparentHint':
    'No background. Readability depends on the viewer’s theme (light or dark) — check it with the message switcher and the contrast meter.',
  'color.layerText': 'Layer text',
  'color.textTransparentHint':
    'Knocked-out text: the background shows through the letters (cut-out effect). Needs a solid or gradient background to show.',
  'color.styles': 'Styles',
  'color.shadow': 'Shadow',
  'color.stroke': 'Outline',
  'color.shadowColor': 'Shadow colour',
  'color.distance': 'Distance',
  'color.direction': 'Direction',
  'color.shadowDirAria': 'Shadow direction',
  'color.strokeColor': 'Outline colour',
  'color.thickness': 'Thickness',
  'color.bgGradDirAria': 'Background gradient direction',
  'color.textGradDirAria': 'Gradient direction',

  'grad.addStop': '+ Add stop',
  'grad.removeStop': 'Remove stop',
  'grad.rainbow': 'Rainbow',
  'grad.sunset': 'Sunset',
  'grad.ocean': 'Ocean',
  'grad.gold': 'Gold',

  'dir.tl': 'top-left',
  'dir.t': 'top',
  'dir.tr': 'top-right',
  'dir.l': 'left',
  'dir.r': 'right',
  'dir.bl': 'bottom-left',
  'dir.b': 'bottom',
  'dir.br': 'bottom-right',

  'font.aria': 'Font',
  'font.archivo': 'Archivo Black — heavy',
  'font.bungee': 'Bungee — block',
  'font.anton': 'Anton — tall condensed',
  'font.grotesk': 'Space Grotesk — clean',
  'font.press': 'Press Start 2P — pixel',
  'font.pacifico': 'Pacifico — script',
  'font.system': 'System — sans',
  'font.mono': 'Monospaced',

  'preview.title': 'Preview',
  'preview.pause': '❚❚ Pause',
  'preview.play': '▶ Play',
  'preview.realSize': 'real size · 128×128',
  'preview.inMessage': 'How it looks in a message',
  'preview.themeAria': 'Slack theme',
  'preview.light': 'Light',
  'preview.dark': 'Dark',
  'preview.you': 'you',
  'preview.demo': 'great work team {emoji} on to the next one!',
  'preview.name': 'Emoji name',
  'preview.namePlaceholder': 'my-emoji',
  'preview.nameHint': 'Used as the file name. On upload, Slack suggests it as the default emoji name.',
  'preview.plan': 'Slack plan',
  'preview.max': 'max.',
  'preview.planAria': 'Slack plan',
  'plan.free': 'Free · max 128 KB',
  'plan.paid': 'Paid · max 1 MB',
  'preview.build': 'Create GIF',
  'preview.building': 'Creating…',
  'preview.errEmpty': 'Type some text first.',
  'preview.errBuild': 'Failed to generate the GIF: ',
  'result.title': 'GIF generated',
  'result.loop': 'real size, looping',
  'result.dims': 'Dimensions',
  'result.frames': 'Frames',
  'result.frameOne': 'frame',
  'result.frameMany': 'frames',
  'result.weight': 'Size',
  'result.over': 'Over',
  'result.ok': '✓ Ready for Slack',
  'result.tip':
    'It doesn’t fit this plan. Try: lower smoothness to “Compact”, shorten the text, a faster loop (fewer frames), or drop the transparent background.',
  'result.download': 'Download GIF',

  'presets.title': 'My presets',
  'presets.namePlaceholder': 'Style name',
  'presets.save': 'Save style',
  'presets.persistYes': 'Saved in this browser and kept after reloading.',
  'presets.persistNo': 'Saved only for this session (this environment has no persistent storage).',
  'presets.empty': 'You haven’t saved any style yet.',
  'presets.apply': 'Apply',
  'presets.delete': 'Delete',
  'presets.export': '↓ Export',
  'presets.import': '↑ Import',
  'presets.imported': 'Imported',
  'presets.styleOne': 'style',
  'presets.styleMany': 'styles',
  'presets.importError': 'Could not read the file: not a valid presets JSON.',

  'contrast.title': 'Text / background contrast',
  'contrast.ok': 'Good contrast, reads well at emoji size.',
  'contrast.mid': 'OK for large text; at emoji size it may be tight.',
  'contrast.low': 'Low contrast: hard to read when small.',
  'contrast.bad': 'Very low contrast: nearly illegible. Change a colour.',
  'contrast.both': 'Text and background both transparent: the emoji would be invisible. Add a solid or gradient background.',
  'contrast.knockout': 'Knocked-out text (chat shows through).',
  'contrast.transparent': 'Transparent: depends on the theme.',
  'contrast.light': 'Light',
  'contrast.dark': 'Dark',
  'contrast.bgGradient': 'Gradient background.',
  'contrast.textGradient': 'Gradient text (worst stop).',
  'contrast.tryStroke': 'Try turning on the outline.',
}

const DICT: Record<Lang, Dict> = { es, en }

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
  }
  return 'es'
}

export type TFn = (key: string) => string

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFn
  langs: typeof LANGS
}

const I18nContext = createContext<I18nValue>({
  lang: 'es',
  setLang: () => {},
  t: (k) => es[k] ?? k,
  langs: LANGS,
})

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? detectLang)

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* ignore */
    }
  }

  const t = useMemo<TFn>(() => (key) => DICT[lang][key] ?? es[key] ?? key, [lang])

  return <I18nContext.Provider value={{ lang, setLang, t, langs: LANGS }}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  return useContext(I18nContext)
}
